from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import current_app

interview_bp = Blueprint('interview', __name__)


@interview_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_interview():
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId
    from app.services.gemini_service import generate_mock_interview

    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    active_job = user.get('active_job')
    job_title = active_job.get('title', 'Software Engineer') if active_job else 'Software Engineer'
    job_description = active_job.get('description', '') if active_job else ''

    questions = generate_mock_interview(job_title, job_description)
    return jsonify({'questions': questions}), 200
