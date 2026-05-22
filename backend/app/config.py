import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/nextrole')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'dev-secret-please-change')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    RAPIDAPI_HOST = os.getenv('RAPIDAPI_HOST', 'jsearch.p.rapidapi.com')
    ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
    ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')
    CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:5173')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
