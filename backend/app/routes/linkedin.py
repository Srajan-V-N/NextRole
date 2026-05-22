from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import current_app

linkedin_bp = Blueprint('linkedin', __name__)


@linkedin_bp.route('/optimize', methods=['POST'])
@jwt_required()
def optimize_linkedin():
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId
    from app.services.gemini_service import generate_linkedin_optimizer

    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    target_role = data.get('target_role', '')
    if not target_role:
        active_job = user.get('active_job')
        target_role = active_job.get('title', 'Software Engineer') if active_job else 'Software Engineer'

    result = generate_linkedin_optimizer(user, target_role)
    return jsonify(result), 200
