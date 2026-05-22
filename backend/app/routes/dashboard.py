from flask import Blueprint, jsonify, current_app
from ..utils.auth_helpers import require_auth, get_current_user
from ..services.scoring_service import (
    calculate_ats_score, calculate_readiness_score,
    calculate_placement_score, get_skill_gaps
)
from ..routes.profile import _compute_completeness

dashboard_bp = Blueprint('dashboard', __name__)

ROUND_ORDER = ['aptitude', 'coding', 'technical', 'hr']


def _resume_to_text(resume):
    parts = []
    if resume.get('summary'):
        parts.append(resume['summary'])
    for exp in resume.get('experience', []):
        parts.append(f"{exp.get('role', '')} {exp.get('company', '')}")
        if exp.get('description'):
            parts.append(exp['description'])
        parts.extend(exp.get('bullets', []))
    parts.extend(resume.get('skills_ordered', resume.get('skills', [])))
    return ' '.join(str(p) for p in parts)


@dashboard_bp.route('/', methods=['GET'])
@require_auth
def get_dashboard():
    user = get_current_user()
    active_job = user.get('active_job')
    resume = user.get('resume', {})
    readiness = user.get('readiness', {})

    profile_completeness = _compute_completeness(user)

    # ATS score
    ats_score = 0
    skill_gaps = []
    if resume and active_job:
        resume_text = _resume_to_text(resume)
        ats_result = calculate_ats_score(resume_text, active_job.get('description', ''))
        ats_score = ats_result['score']
    if active_job:
        skill_gaps = get_skill_gaps(user.get('skills', []), active_job.get('skills', []))

    # Readiness score
    checklist = readiness.get('checklist', {})
    all_tasks = []
    for rk in ROUND_ORDER:
        all_tasks.extend(checklist.get(rk, []))
    readiness_score = calculate_readiness_score(all_tasks)

    placement_score = calculate_placement_score(ats_score, readiness_score, profile_completeness)

    # Recent activity (mock based on state)
    activity = []
    if active_job:
        activity.append({'type': 'job', 'text': f'Set active job: {active_job.get("title")} at {active_job.get("company")}', 'time': 'Recently'})
    if resume.get('summary'):
        activity.append({'type': 'resume', 'text': 'Resume content updated', 'time': 'Recently'})
    completed_count = sum(1 for t in all_tasks if t.get('completed'))
    if completed_count:
        activity.append({'type': 'readiness', 'text': f'{completed_count} preparation tasks completed', 'time': 'Recently'})

    return jsonify({
        'placement_score': placement_score,
        'ats_score': ats_score,
        'readiness_score': readiness_score,
        'profile_completeness': profile_completeness,
        'active_job': active_job,
        'skill_gaps': skill_gaps[:8],
        'saved_jobs_count': len(user.get('saved_jobs', [])),
        'total_tasks': len(all_tasks),
        'completed_tasks': completed_count,
        'activity': activity[:5],
    })
