from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from ..utils.auth_helpers import require_auth, get_current_user, serialize_doc

profile_bp = Blueprint('profile', __name__)


def _compute_completeness(user):
    score = 0
    if user.get('name'): score += 10
    if user.get('email'): score += 10
    if user.get('bio'): score += 10
    if user.get('location'): score += 5
    if user.get('phone'): score += 5
    skills = user.get('skills', [])
    if len(skills) >= 5:
        score += 20
    elif len(skills) >= 3:
        score += 15
    elif len(skills) >= 1:
        score += 8
    experience = user.get('experience', [])
    if len(experience) >= 2:
        score += 20
    elif len(experience) >= 1:
        score += 12
    education = user.get('education', [])
    if len(education) >= 1:
        score += 10
    links = [user.get('linkedin'), user.get('github'), user.get('portfolio')]
    filled_links = sum(1 for l in links if l)
    if filled_links >= 2:
        score += 10
    elif filled_links >= 1:
        score += 5
    return min(score, 100)


@profile_bp.route('/', methods=['GET'])
@require_auth
def get_profile():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = {
        'id': str(user['_id']),
        'name': user.get('name', ''),
        'email': user.get('email', ''),
        'bio': user.get('bio', ''),
        'phone': user.get('phone', ''),
        'location': user.get('location', ''),
        'linkedin': user.get('linkedin', ''),
        'github': user.get('github', ''),
        'portfolio': user.get('portfolio', ''),
        'skills': user.get('skills', []),
        'experience': user.get('experience', []),
        'education': user.get('education', []),
        'completeness': _compute_completeness(user),
    }
    return jsonify(profile)


@profile_bp.route('/', methods=['PUT'])
@require_auth
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    db = current_app.db

    allowed_fields = ['name', 'bio', 'phone', 'location', 'linkedin', 'github',
                      'portfolio', 'skills', 'experience', 'education']

    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    db.users.update_one({'_id': user['_id']}, {'$set': update_data})

    updated_user = db.users.find_one({'_id': user['_id']})
    profile = {
        'id': str(updated_user['_id']),
        'name': updated_user.get('name', ''),
        'email': updated_user.get('email', ''),
        'bio': updated_user.get('bio', ''),
        'phone': updated_user.get('phone', ''),
        'location': updated_user.get('location', ''),
        'linkedin': updated_user.get('linkedin', ''),
        'github': updated_user.get('github', ''),
        'portfolio': updated_user.get('portfolio', ''),
        'skills': updated_user.get('skills', []),
        'experience': updated_user.get('experience', []),
        'education': updated_user.get('education', []),
        'completeness': _compute_completeness(updated_user),
    }
    return jsonify(profile)


@profile_bp.route('/completeness', methods=['GET'])
@require_auth
def get_completeness():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'completeness': _compute_completeness(user)})
