from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from .config import Config

jwt = JWTManager()
db = None


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=[app.config['CORS_ORIGIN']], supports_credentials=True)
    jwt.init_app(app)

    global db
    client = MongoClient(app.config['MONGO_URI'])
    db_name = app.config['MONGO_URI'].rsplit('/', 1)[-1].split('?')[0] or 'nextrole'
    db = client[db_name]

    app.db = db

    from .routes.auth import auth_bp
    from .routes.profile import profile_bp
    from .routes.jobs import jobs_bp
    from .routes.resume import resume_bp
    from .routes.readiness import readiness_bp
    from .routes.dashboard import dashboard_bp
    from .routes.tracker import tracker_bp
    from .routes.courses import courses_bp
    from .routes.interview import interview_bp
    from .routes.linkedin import linkedin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(readiness_bp, url_prefix='/api/readiness')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(tracker_bp, url_prefix='/api/tracker')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(interview_bp, url_prefix='/api/interview')
    app.register_blueprint(linkedin_bp, url_prefix='/api/linkedin')

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'service': 'nextrole-api'}

    return app
