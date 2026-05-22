from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, get_jwt_identity
import bcrypt
from datetime import datetime
from bson import ObjectId
from ..utils.auth_helpers import require_auth, get_current_user, serialize_doc

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    db = current_app.db

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if db.users.find_one({'email': email}):
        return jsonify({'error': 'An account with this email already exists'}), 409

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user_doc = {
        'name': name,
        'email': email,
        'password_hash': password_hash,
        'bio': '',
        'phone': '',
        'location': '',
        'linkedin': '',
        'github': '',
        'portfolio': '',
        'skills': [],
        'experience': [],
        'education': [],
        'active_job': None,
        'saved_jobs': [],
        'resume': {},
        'readiness': {},
        'created_at': datetime.utcnow(),
    }

    result = db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(identity=user_id)

    return jsonify({
        'token': token,
        'user': {
            'id': user_id,
            'name': name,
            'email': email,
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    db = current_app.db

    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = db.users.find_one({'email': email})
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user['_id']))

    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
        }
    })


@auth_bp.route('/me', methods=['GET'])
@require_auth
def me():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': str(user['_id']),
        'name': user['name'],
        'email': user['email'],
    })
