from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from ..utils.auth_helpers import require_auth, get_current_user
from ..services.rapidapi_service import fetch_jobs
from ..services.scoring_service import calculate_match_score, get_skill_gaps

jobs_bp = Blueprint('jobs', __name__)


def _enrich_job(job, user):
    user_skills = user.get('skills', [])
    job['match_score'] = calculate_match_score(user_skills, job.get('skills', []))
    job['skill_gaps'] = get_skill_gaps(user_skills, job.get('skills', []))
    return job


@jobs_bp.route('/search', methods=['GET'])
@require_auth
def search_jobs():
    user = get_current_user()
    query = request.args.get('q', 'software engineer')
    location = request.args.get('location', '')

    jobs = fetch_jobs(query=query, location=location)
    enriched = [_enrich_job(j, user) for j in jobs]
    enriched.sort(key=lambda x: x['match_score'], reverse=True)
    return jsonify({'jobs': enriched})


@jobs_bp.route('/saved', methods=['GET'])
@require_auth
def get_saved_jobs():
    user = get_current_user()
    saved = user.get('saved_jobs', [])
    enriched = [_enrich_job(j, user) for j in saved]
    return jsonify({'jobs': enriched})


@jobs_bp.route('/save', methods=['POST'])
@require_auth
def save_job():
    user = get_current_user()
    db = current_app.db
    data = request.get_json()
    job = data.get('job')

    if not job:
        return jsonify({'error': 'Job data required'}), 400

    saved_jobs = user.get('saved_jobs', [])
    if any(j.get('id') == job.get('id') for j in saved_jobs):
        return jsonify({'message': 'Job already saved', 'saved': True})

    saved_jobs.append(job)
    db.users.update_one({'_id': user['_id']}, {'$set': {'saved_jobs': saved_jobs}})
    return jsonify({'message': 'Job saved', 'saved': True})


@jobs_bp.route('/save/<job_id>', methods=['DELETE'])
@require_auth
def unsave_job(job_id):
    user = get_current_user()
    db = current_app.db

    saved_jobs = [j for j in user.get('saved_jobs', []) if j.get('id') != job_id]
    db.users.update_one({'_id': user['_id']}, {'$set': {'saved_jobs': saved_jobs}})
    return jsonify({'message': 'Job removed', 'saved': False})


@jobs_bp.route('/active', methods=['POST'])
@require_auth
def set_active_job():
    user = get_current_user()
    db = current_app.db
    data = request.get_json()
    job = data.get('job')

    if not job:
        return jsonify({'error': 'Job data required'}), 400

    # Context propagation: store active job + clear stale readiness checklist
    db.users.update_one(
        {'_id': user['_id']},
        {'$set': {
            'active_job': job,
            'readiness': {},  # reset so user regenerates for new job
        }}
    )
    return jsonify({'message': 'Active job set', 'job': job})


@jobs_bp.route('/active', methods=['GET'])
@require_auth
def get_active_job():
    user = get_current_user()
    active_job = user.get('active_job')
    if active_job:
        active_job = _enrich_job(active_job, user)
    return jsonify({'job': active_job})


@jobs_bp.route('/active', methods=['DELETE'])
@require_auth
def clear_active_job():
    user = get_current_user()
    db = current_app.db
    db.users.update_one({'_id': user['_id']}, {'$set': {'active_job': None}})
    return jsonify({'message': 'Active job cleared'})
