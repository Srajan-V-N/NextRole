import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from ..utils.auth_helpers import require_auth, get_current_user
from ..services.gemini_service import generate_resume
from ..services.scoring_service import calculate_ats_score

resume_bp = Blueprint('resume', __name__)


def _resume_to_text(resume):
    parts = []
    if resume.get('summary'):
        parts.append(resume['summary'])
    for exp in resume.get('experience', []):
        parts.append(f"{exp.get('role', '')} at {exp.get('company', '')}")
        if exp.get('description'):
            parts.append(exp['description'])
        parts.extend(exp.get('bullets', []))
    parts.extend(resume.get('skills_ordered', []))
    parts.extend(resume.get('skills', []))
    if resume.get('education'):
        for edu in resume['education']:
            parts.append(f"{edu.get('degree', '')} {edu.get('institution', '')}")
    return ' '.join(str(p) for p in parts)


@resume_bp.route('/', methods=['GET'])
@require_auth
def get_resume():
    user = get_current_user()
    resume = user.get('resume', {})
    active_job = user.get('active_job')
    tailored = user.get('resume_tailored', False)

    ats = {'score': 0, 'matched': [], 'missing': [], 'suggestions': []}
    if resume and active_job:
        resume_text = _resume_to_text(resume)
        job_desc = active_job.get('description', '')
        ats = calculate_ats_score(resume_text, job_desc)

    return jsonify({'resume': resume, 'ats': ats, 'tailored': tailored})


@resume_bp.route('/', methods=['PUT'])
@require_auth
def save_resume():
    user = get_current_user()
    db = current_app.db
    data = request.get_json()
    resume_data = data.get('resume', data)
    # Preserve tailored flag when caller passes preserve_tailored=true (auto-save after generate)
    preserve_tailored = data.get('preserve_tailored', False)

    update = {'resume': resume_data}
    if not preserve_tailored:
        update['resume_tailored'] = False
    synced_skills = resume_data.get('skills_ordered') or resume_data.get('skills') or []
    if synced_skills:
        update['skills'] = synced_skills
    db.users.update_one({'_id': user['_id']}, {'$set': update})

    active_job = user.get('active_job')
    ats = {'score': 0, 'matched': [], 'missing': [], 'suggestions': []}
    if active_job:
        resume_text = _resume_to_text(resume_data)
        ats = calculate_ats_score(resume_text, active_job.get('description', ''))

    return jsonify({'resume': resume_data, 'ats': ats})


@resume_bp.route('/generate', methods=['POST'])
@require_auth
def generate():
    user = get_current_user()
    db = current_app.db
    active_job = user.get('active_job')

    # Get missing keywords from current resume so Gemini can explicitly cover them
    missing_keywords = []
    current_resume = user.get('resume') or {}
    if active_job and current_resume:
        pre_text = _resume_to_text(current_resume)
        pre_ats = calculate_ats_score(pre_text, active_job.get('description', ''))
        missing_keywords = pre_ats.get('missing', [])

    profile = {
        'name': user.get('name', ''),
        'skills': user.get('skills', []),
        'experience': user.get('experience', []),
        'education': user.get('education', []),
        'projects': current_resume.get('projects', []),
        'bio': user.get('bio', ''),
    }

    result = generate_resume(profile, active_job, missing_keywords)

    # Merge generated content into resume
    current_resume['summary'] = result.get('summary', '')
    current_resume['experience'] = result.get('experience', current_resume.get('experience', []))
    current_resume['skills_ordered'] = result.get('skills_ordered', user.get('skills', []))
    current_resume['skills_categorized'] = result.get('skills_categorized', {})
    if result.get('projects_ordered'):
        current_resume['projects'] = result['projects_ordered']
    current_resume['improvements'] = result.get('improvements', [])

    gen_update = {'resume': current_resume, 'resume_tailored': True}
    generated_skills = current_resume.get('skills_ordered') or current_resume.get('skills') or []
    if generated_skills:
        gen_update['skills'] = generated_skills
    db.users.update_one({'_id': user['_id']}, {'$set': gen_update})

    ats = {'score': 0, 'matched': [], 'missing': [], 'suggestions': []}
    if active_job:
        resume_text = _resume_to_text(current_resume)
        ats = calculate_ats_score(resume_text, active_job.get('description', ''))

    return jsonify({'resume': current_resume, 'ats': ats, 'tailored': True})


@resume_bp.route('/ats-score', methods=['GET'])
@require_auth
def ats_score():
    user = get_current_user()
    resume = user.get('resume', {})
    active_job = user.get('active_job')

    if not resume or not active_job:
        return jsonify({'score': 0, 'matched': [], 'missing': [], 'suggestions': []})

    resume_text = _resume_to_text(resume)
    result = calculate_ats_score(resume_text, active_job.get('description', ''))
    return jsonify(result)


ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}


def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _extract_text_from_file(filepath, filename):
    """Extract plain text from a PDF or DOCX resume file."""
    ext = filename.rsplit('.', 1)[1].lower()
    text = ''
    try:
        if ext == 'pdf':
            import pdfplumber
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + '\n'
        elif ext in ('doc', 'docx'):
            from docx import Document
            doc = Document(filepath)
            text = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception:
        pass
    return text.strip()


@resume_bp.route('/upload', methods=['POST'])
@require_auth
def upload_resume():
    user = get_current_user()
    db = current_app.db

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not _allowed_file(file.filename):
        return jsonify({'error': 'Only PDF, DOC, DOCX files are allowed'}), 400

    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    filename = secure_filename(file.filename)
    stored_name = f"{str(user['_id'])}_{filename}"
    filepath = os.path.join(upload_folder, stored_name)
    file.save(filepath)

    db.users.update_one({'_id': user['_id']}, {'$set': {'resume_file': stored_name}})

    # Extract text and parse into structured fields via Gemini
    extracted = {}
    try:
        from ..services.gemini_service import parse_resume_from_text
        text = _extract_text_from_file(filepath, filename)
        if text:
            extracted = parse_resume_from_text(text)
    except Exception:
        pass

    return jsonify({'filename': filename, 'stored': stored_name, 'extracted': extracted}), 200
