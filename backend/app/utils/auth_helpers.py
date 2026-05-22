from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from bson import ObjectId


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated


def get_current_user():
    user_id = get_jwt_identity()
    db = current_app.db
    user = db.users.find_one({'_id': ObjectId(user_id)})
    return user


def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                result['id'] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) if isinstance(v, dict) else v for v in value]
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    return doc
