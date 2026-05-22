from flask import Blueprint, request, jsonify, current_app
from ..utils.auth_helpers import require_auth, get_current_user
from ..services.gemini_service import generate_readiness_checklist
from ..services.scoring_service import calculate_readiness_score

readiness_bp = Blueprint('readiness', __name__)

ROUND_ORDER = ['aptitude', 'coding', 'technical', 'hr']


def _flatten_tasks(checklist):
    tasks = []
    for round_key in ROUND_ORDER:
        for task in checklist.get(round_key, []):
            tasks.append(task)
    return tasks


@readiness_bp.route('/', methods=['GET'])
@require_auth
def get_readiness():
    user = get_current_user()
    readiness = user.get('readiness', {})

    all_tasks = _flatten_tasks(readiness.get('checklist', {}))
    score = calculate_readiness_score(all_tasks)

    return jsonify({
        'checklist': readiness.get('checklist', {}),
        'score': score,
        'total_tasks': len(all_tasks),
        'completed_tasks': sum(1 for t in all_tasks if t.get('completed')),
    })


@readiness_bp.route('/generate', methods=['POST'])
@require_auth
def generate():
    user = get_current_user()
    db = current_app.db
    active_job = user.get('active_job')

    job_title = active_job.get('title', 'Software Engineer') if active_job else 'Software Engineer'
    job_desc = active_job.get('description', '') if active_job else ''

    checklist = generate_readiness_checklist(job_title, job_desc)

    readiness_data = {'checklist': checklist}
    db.users.update_one({'_id': user['_id']}, {'$set': {'readiness': readiness_data}})

    all_tasks = _flatten_tasks(checklist)
    score = calculate_readiness_score(all_tasks)

    return jsonify({
        'checklist': checklist,
        'score': score,
        'total_tasks': len(all_tasks),
        'completed_tasks': 0,
    })


@readiness_bp.route('/task/<task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    user = get_current_user()
    db = current_app.db
    data = request.get_json()
    completed = data.get('completed', False)

    readiness = user.get('readiness', {})
    checklist = readiness.get('checklist', {})

    updated = False
    for round_key in ROUND_ORDER:
        for task in checklist.get(round_key, []):
            if task.get('id') == task_id:
                task['completed'] = completed
                updated = True
                break
        if updated:
            break

    if not updated:
        return jsonify({'error': 'Task not found'}), 404

    readiness['checklist'] = checklist
    db.users.update_one({'_id': user['_id']}, {'$set': {'readiness': readiness}})

    all_tasks = _flatten_tasks(checklist)
    score = calculate_readiness_score(all_tasks)

    return jsonify({
        'score': score,
        'completed_tasks': sum(1 for t in all_tasks if t.get('completed')),
        'total_tasks': len(all_tasks),
    })


@readiness_bp.route('/score', methods=['GET'])
@require_auth
def get_score():
    user = get_current_user()
    readiness = user.get('readiness', {})
    all_tasks = _flatten_tasks(readiness.get('checklist', {}))
    return jsonify({'score': calculate_readiness_score(all_tasks)})
