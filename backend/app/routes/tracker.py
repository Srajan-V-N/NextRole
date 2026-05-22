import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import current_app

tracker_bp = Blueprint('tracker', __name__)


@tracker_bp.route('/', methods=['GET'])
@jwt_required()
def get_pipeline():
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    pipeline = user.get('pipeline', [])
    return jsonify({'pipeline': pipeline}), 200


@tracker_bp.route('/', methods=['POST'])
@jwt_required()
def add_to_pipeline():
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId
    data = request.get_json()
    entry = data.get('entry', {})
    if not entry.get('job_title') or not entry.get('company'):
        return jsonify({'error': 'job_title and company are required'}), 400

    new_entry = {
        'id': str(uuid.uuid4()),
        'job_title': entry.get('job_title', ''),
        'company': entry.get('company', ''),
        'location': entry.get('location', ''),
        'stage': entry.get('stage', 'Saved'),
        'applied_date': entry.get('applied_date', datetime.utcnow().strftime('%Y-%m-%d')),
        'notes': entry.get('notes', ''),
        'logo_url': entry.get('logo_url', ''),
        'logo_color': entry.get('logo_color', '#00D5B9'),
        'interview_date': entry.get('interview_date', ''),
        'assessment_deadline': entry.get('assessment_deadline', ''),
        'offer_deadline': entry.get('offer_deadline', ''),
        'followup_date': entry.get('followup_date', ''),
        'created_at': datetime.utcnow().isoformat(),
    }

    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$push': {'pipeline': new_entry}}
    )
    return jsonify({'entry': new_entry}), 201


@tracker_bp.route('/<entry_id>', methods=['PUT'])
@jwt_required()
def update_pipeline_entry(entry_id):
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId
    data = request.get_json()

    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    pipeline = user.get('pipeline', [])
    updated = False
    for entry in pipeline:
        if entry.get('id') == entry_id:
            if 'stage' in data:
                entry['stage'] = data['stage']
            if 'notes' in data:
                entry['notes'] = data['notes']
            if 'applied_date' in data:
                entry['applied_date'] = data['applied_date']
            if 'interview_date' in data:
                entry['interview_date'] = data['interview_date']
            if 'assessment_deadline' in data:
                entry['assessment_deadline'] = data['assessment_deadline']
            if 'offer_deadline' in data:
                entry['offer_deadline'] = data['offer_deadline']
            if 'followup_date' in data:
                entry['followup_date'] = data['followup_date']
            updated = True
            break

    if not updated:
        return jsonify({'error': 'Entry not found'}), 404

    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'pipeline': pipeline}}
    )
    return jsonify({'success': True}), 200


@tracker_bp.route('/<entry_id>', methods=['DELETE'])
@jwt_required()
def remove_from_pipeline(entry_id):
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId

    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$pull': {'pipeline': {'id': entry_id}}}
    )
    return jsonify({'success': True}), 200
