import json
import logging
import re
from flask import current_app

logger = logging.getLogger(__name__)


def _get_model():
    import google.generativeai as genai
    api_key = current_app.config.get('GEMINI_API_KEY', '')
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash')


def _extract_json(text):
    text = text.strip()
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        return json.loads(match.group())
    raise ValueError('No JSON object found in response')


def parse_resume_from_text(text):
    """Extract structured resume fields from raw resume text using Gemini."""
    model = _get_model()
    if not model or not text:
        return {}

    prompt = f"""Extract structured resume information from the text below.
Return a single JSON object. Omit any field you cannot find.

Resume text:
{text[:3500]}

Required JSON structure:
{{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/...",
  "github": "github.com/...",
  "summary": "Professional summary paragraph",
  "skills": ["skill1", "skill2"],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2022 - Present",
      "description": "Key responsibilities and achievements summary"
    }}
  ],
  "education": [
    {{
      "degree": "B.S. Computer Science",
      "institution": "University Name",
      "year": "2020"
    }}
  ]
}}

Return ONLY valid JSON, no markdown fences, no explanation."""

    try:
        response = model.generate_content(prompt)
        return _extract_json(response.text)
    except Exception:
        logger.exception('Gemini parse_resume_from_text failed')
        return {}


def generate_resume(user_profile, active_job, missing_keywords=None):
    model = _get_model()
    if not model:
        return _mock_resume(user_profile, active_job)

    name = user_profile.get('name', 'Candidate')
    skills = ', '.join(user_profile.get('skills', []))
    experience = user_profile.get('experience', [])
    exp_text = '\n'.join([
        f"- {e.get('role', '')} at {e.get('company', '')} ({e.get('duration', '')}): {e.get('description', '')}"
        for e in experience
    ])
    projects = user_profile.get('projects', [])
    proj_text = '\n'.join([
        f"- {p.get('title', '')}: {p.get('description', '')} | Tech: {', '.join(p.get('tech', []))}"
        for p in projects
    ]) if projects else ''
    job_title = active_job.get('title', 'the role') if active_job else 'a software engineering role'
    job_company = active_job.get('company', '') if active_job else ''
    job_desc = active_job.get('description', '') if active_job else ''

    keywords_section = ''
    if missing_keywords:
        kw_list = ', '.join(missing_keywords[:25])
        keywords_section = f"""
CRITICAL — You MUST naturally weave ALL of these missing keywords into the resume content \
(summary, skills list, or experience bullets). Do not keyword-stuff; use them in proper context:
{kw_list}
"""

    prompt = f"""You are an expert ATS-optimized resume writer. Your goal is to produce a resume \
that passes ATS screening at 95%+ and reads as a polished, professional document.

Job: {job_title} at {job_company}
Job Requirements: {job_desc[:1200]}
{keywords_section}
Candidate: {name}
Skills: {skills}
Experience:
{exp_text or 'No experience provided yet.'}
Projects:
{proj_text or 'No projects provided.'}

Generate a professional resume in JSON with this exact structure:
{{
  "summary": "2-sentence professional summary tailored to the job",
  "experience": [
    {{
      "company": "company name",
      "role": "job title",
      "duration": "dates",
      "bullets": ["ATS-optimized bullet 1", "bullet 2", "bullet 3"]
    }}
  ],
  "skills_ordered": ["skill1", "skill2", ...],
  "skills_categorized": {{
    "Programming Languages": ["Python", "Java"],
    "Web Development": ["React", "HTML", "CSS"],
    "Data & Analytics": ["Pandas", "Scikit-learn"],
    "Databases": ["MySQL", "MongoDB"],
    "Cloud & DevOps": ["Docker", "AWS"],
    "Tools & Concepts": ["Git", "Agile"]
  }},
  "projects_ordered": [
    {{
      "title": "project title",
      "description": "brief description",
      "tech": ["tech1", "tech2"],
      "link": "github link if provided",
      "bullets": ["key achievement 1", "key achievement 2"]
    }}
  ],
  "improvements": ["improvement tip 1", "improvement tip 2", "improvement tip 3"]
}}

Rules:
- Use strong action verbs (Built, Designed, Led, Implemented, Optimized)
- Include measurable outcomes where possible (e.g., "Reduced load time by 40%")
- Order skills by relevance to the job
- Keep bullets concise and ATS-friendly
- Every keyword from the CRITICAL list above must appear at least once in the output
- Group skills into meaningful categories in skills_categorized; omit categories with no relevant skills
- Reorder and enhance projects by relevance to the job; keep only the most relevant 3 projects
- Return ONLY valid JSON, no markdown code blocks"""

    try:
        response = model.generate_content(prompt)
        return _extract_json(response.text)
    except Exception:
        logger.exception('Gemini generate_resume failed')
        return _mock_resume(user_profile, active_job)


def generate_readiness_checklist(job_title, job_description):
    model = _get_model()
    if not model:
        return _mock_checklist(job_title)

    prompt = f"""You are a placement coach creating interview preparation checklists.

Job Title: {job_title}
Job Description: {job_description[:600]}

Generate a preparation checklist with exactly 4 categories. Return ONLY valid JSON:
{{
  "aptitude": [
    {{"id": "apt_1", "task": "task description", "completed": false}},
    {{"id": "apt_2", "task": "task description", "completed": false}},
    {{"id": "apt_3", "task": "task description", "completed": false}},
    {{"id": "apt_4", "task": "task description", "completed": false}},
    {{"id": "apt_5", "task": "task description", "completed": false}}
  ],
  "coding": [
    {{"id": "cod_1", "task": "task description", "completed": false}},
    {{"id": "cod_2", "task": "task description", "completed": false}},
    {{"id": "cod_3", "task": "task description", "completed": false}},
    {{"id": "cod_4", "task": "task description", "completed": false}},
    {{"id": "cod_5", "task": "task description", "completed": false}}
  ],
  "technical": [
    {{"id": "tec_1", "task": "task description", "completed": false}},
    {{"id": "tec_2", "task": "task description", "completed": false}},
    {{"id": "tec_3", "task": "task description", "completed": false}},
    {{"id": "tec_4", "task": "task description", "completed": false}},
    {{"id": "tec_5", "task": "task description", "completed": false}},
    {{"id": "tec_6", "task": "task description", "completed": false}}
  ],
  "hr": [
    {{"id": "hr_1", "task": "task description", "completed": false}},
    {{"id": "hr_2", "task": "task description", "completed": false}},
    {{"id": "hr_3", "task": "task description", "completed": false}},
    {{"id": "hr_4", "task": "task description", "completed": false}}
  ]
}}

Make tasks specific to the job role. No generic filler. Return ONLY valid JSON."""

    try:
        response = model.generate_content(prompt)
        return _extract_json(response.text)
    except Exception:
        logger.exception('Gemini generate_readiness_checklist failed')
        return _mock_checklist(job_title)


def generate_mock_interview(job_title, job_description):
    model = _get_model()
    if not model:
        return _mock_interview(job_title)

    prompt = f"""You are an expert technical interviewer.

Role: {job_title}
Job Context: {job_description[:400]}

Generate a mock interview question set in JSON. Return ONLY valid JSON:
{{
  "hr": [
    {{"id": "hr_1", "question": "question text", "tip": "answer tip"}},
    {{"id": "hr_2", "question": "question text", "tip": "answer tip"}},
    {{"id": "hr_3", "question": "question text", "tip": "answer tip"}},
    {{"id": "hr_4", "question": "question text", "tip": "answer tip"}},
    {{"id": "hr_5", "question": "question text", "tip": "answer tip"}}
  ],
  "technical": [
    {{"id": "tec_1", "question": "question text", "tip": "answer tip"}},
    {{"id": "tec_2", "question": "question text", "tip": "answer tip"}},
    {{"id": "tec_3", "question": "question text", "tip": "answer tip"}},
    {{"id": "tec_4", "question": "question text", "tip": "answer tip"}},
    {{"id": "tec_5", "question": "question text", "tip": "answer tip"}}
  ],
  "behavioral": [
    {{"id": "beh_1", "question": "question text", "tip": "answer tip"}},
    {{"id": "beh_2", "question": "question text", "tip": "answer tip"}},
    {{"id": "beh_3", "question": "question text", "tip": "answer tip"}},
    {{"id": "beh_4", "question": "question text", "tip": "answer tip"}},
    {{"id": "beh_5", "question": "question text", "tip": "answer tip"}}
  ]
}}

Make questions specific and realistic for {job_title}. Include answer tips.
Return ONLY valid JSON, no markdown."""

    try:
        response = model.generate_content(prompt)
        return _extract_json(response.text)
    except Exception:
        logger.exception('Gemini generate_mock_interview failed')
        return _mock_interview(job_title)


def generate_linkedin_optimizer(user_profile, target_role):
    model = _get_model()
    if not model:
        return _mock_linkedin(user_profile, target_role)

    name = user_profile.get('name', 'Professional')
    skills = ', '.join(user_profile.get('skills', [])[:10])
    bio = user_profile.get('bio', '')
    experience = user_profile.get('experience', [])
    exp_summary = ', '.join([f"{e.get('role')} at {e.get('company')}" for e in experience[:3]])

    prompt = f"""You are a LinkedIn profile optimization expert.

Target Role: {target_role}
Name: {name}
Skills: {skills}
Bio: {bio[:200]}
Experience: {exp_summary}

Generate optimized LinkedIn profile content in JSON:
{{
  "headline": "compelling 120-char headline with keywords for {target_role}",
  "summary": "300-word About section optimized for {target_role} with keywords",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"]
}}

Rules:
- Headline: hook + role + value proposition, keyword-rich
- Summary: first-person, 3 paragraphs, include target role keywords
- Keywords: top 8 skills/tools recruiters search for this role
Return ONLY valid JSON."""

    try:
        response = model.generate_content(prompt)
        return _extract_json(response.text)
    except Exception:
        logger.exception('Gemini generate_linkedin_optimizer failed')
        return _mock_linkedin(user_profile, target_role)


def _mock_resume(user_profile, active_job):
    job_title = active_job.get('title', 'Software Engineer') if active_job else 'Software Engineer'
    skills = user_profile.get('skills', ['Python', 'JavaScript', 'React'])
    experience = user_profile.get('experience', [])

    mock_exp = []
    for e in experience:
        mock_exp.append({
            'company': e.get('company', 'Company'),
            'role': e.get('role', 'Developer'),
            'duration': e.get('duration', '2023 - Present'),
            'bullets': [
                f"Designed and implemented scalable solutions using {', '.join(skills[:2]) if skills else 'modern technologies'}",
                'Collaborated with cross-functional teams to deliver high-quality software on schedule',
                'Improved system performance by 30% through code optimization and best practices',
            ]
        })

    if not mock_exp:
        mock_exp = [{
            'company': 'Previous Company',
            'role': job_title,
            'duration': '2022 - Present',
            'bullets': [
                f"Built and maintained production-grade applications using {', '.join(skills[:2]) if skills else 'modern stack'}",
                'Delivered features end-to-end, from requirements to deployment',
                'Participated in code reviews and improved team code quality standards',
            ]
        }]

    _cats = {
        'Programming Languages': ['python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift', 'ruby', 'php', 'scala', 'r', 'matlab'],
        'Web Development': ['react', 'angular', 'vue', 'html', 'css', 'sass', 'node', 'express', 'django', 'flask', 'fastapi', 'spring'],
        'Data & Analytics': ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'power bi', 'tableau', 'excel', 'machine learning', 'nlp'],
        'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'firebase'],
        'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux', 'terraform'],
        'Tools & Concepts': ['agile', 'scrum', 'jira', 'rest', 'graphql', 'oop', 'problem solving', 'data structures'],
    }
    skills_categorized = {
        cat: [s for s in skills if any(p in s.lower() for p in patterns)]
        for cat, patterns in _cats.items()
    }
    skills_categorized = {k: v for k, v in skills_categorized.items() if v}

    return {
        'summary': f"Results-driven software professional with experience in {', '.join(skills[:3]) if skills else 'software development'}. Passionate about building scalable, maintainable systems and delivering impactful {job_title.lower()} solutions.",
        'experience': mock_exp,
        'skills_ordered': skills,
        'skills_categorized': skills_categorized,
        'projects_ordered': user_profile.get('projects', []),
        'improvements': [
            'Add specific metrics and outcomes to your bullet points (e.g., "Reduced latency by 40%")',
            f'Include keywords from the {job_title} job description throughout your resume',
            'Ensure your contact information is at the top and easy to find',
        ]
    }


def _mock_checklist(job_title):
    return {
        'aptitude': [
            {'id': 'apt_1', 'task': 'Practice quantitative aptitude: percentages, ratios, and number series', 'completed': False},
            {'id': 'apt_2', 'task': 'Solve 20 logical reasoning problems (syllogisms, blood relations)', 'completed': False},
            {'id': 'apt_3', 'task': 'Practice data interpretation with charts and tables', 'completed': False},
            {'id': 'apt_4', 'task': 'Complete verbal ability exercises: reading comprehension and sentence correction', 'completed': False},
            {'id': 'apt_5', 'task': 'Time yourself on 3 full-length aptitude mock tests', 'completed': False},
        ],
        'coding': [
            {'id': 'cod_1', 'task': 'Solve 15 LeetCode Easy problems covering arrays and strings', 'completed': False},
            {'id': 'cod_2', 'task': 'Practice 10 Medium problems on trees and dynamic programming', 'completed': False},
            {'id': 'cod_3', 'task': 'Review time and space complexity analysis for common algorithms', 'completed': False},
            {'id': 'cod_4', 'task': 'Complete 2 mock coding interviews on Pramp or Interviewing.io', 'completed': False},
            {'id': 'cod_5', 'task': 'Practice writing clean, readable code with proper variable naming', 'completed': False},
        ],
        'technical': [
            {'id': 'tec_1', 'task': f'Review core technical concepts relevant to {job_title}', 'completed': False},
            {'id': 'tec_2', 'task': 'Prepare answers for system design questions (e.g., design a URL shortener)', 'completed': False},
            {'id': 'tec_3', 'task': 'Study database concepts: indexing, normalization, and query optimization', 'completed': False},
            {'id': 'tec_4', 'task': 'Review REST API design principles and HTTP status codes', 'completed': False},
            {'id': 'tec_5', 'task': 'Practice explaining your past projects and technical decisions clearly', 'completed': False},
            {'id': 'tec_6', 'task': 'Research the company tech stack and prepare relevant questions', 'completed': False},
        ],
        'hr': [
            {'id': 'hr_1', 'task': 'Prepare a concise and compelling "Tell me about yourself" answer', 'completed': False},
            {'id': 'hr_2', 'task': 'Write out 5 STAR-format stories from your experience', 'completed': False},
            {'id': 'hr_3', 'task': 'Research the company culture, mission, and recent news', 'completed': False},
            {'id': 'hr_4', 'task': 'Prepare 3 thoughtful questions to ask the interviewer', 'completed': False},
        ],
    }


def _mock_interview(job_title):
    return {
        'hr': [
            {'id': 'hr_1', 'question': 'Tell me about yourself and your background.', 'tip': 'Keep it to 2 minutes. Cover your journey, key skills, and why you want this role.'},
            {'id': 'hr_2', 'question': f'Why do you want to work as a {job_title}?', 'tip': 'Connect your passion to the role. Mention specific aspects of the job that excite you.'},
            {'id': 'hr_3', 'question': 'What are your greatest strengths?', 'tip': 'Choose 2-3 strengths relevant to the role and back each with a brief example.'},
            {'id': 'hr_4', 'question': 'Where do you see yourself in 5 years?', 'tip': 'Show ambition aligned with the company growth. Avoid being too specific or too vague.'},
            {'id': 'hr_5', 'question': 'What is your expected salary?', 'tip': 'Research market rates first. Give a range based on your experience and the role level.'},
        ],
        'technical': [
            {'id': 'tec_1', 'question': f'Walk me through a complex technical problem you solved in a {job_title} context.', 'tip': 'Use STAR format. Focus on your technical decision-making and the measurable outcome.'},
            {'id': 'tec_2', 'question': 'How would you design a scalable system to handle 1 million requests per minute?', 'tip': 'Cover load balancing, caching, database scaling, and microservices. Ask clarifying questions first.'},
            {'id': 'tec_3', 'question': 'What is the difference between SQL and NoSQL databases? When would you use each?', 'tip': 'Discuss consistency, scalability, schema flexibility. Give real use-case examples.'},
            {'id': 'tec_4', 'question': 'Explain the concept of RESTful APIs and best practices for design.', 'tip': 'Cover HTTP methods, status codes, versioning, authentication, and documentation.'},
            {'id': 'tec_5', 'question': 'How do you ensure code quality in a team environment?', 'tip': 'Mention code reviews, testing, CI/CD, linting, and documentation practices.'},
        ],
        'behavioral': [
            {'id': 'beh_1', 'question': 'Tell me about a time you had to meet a tight deadline.', 'tip': 'Use STAR. Emphasize how you prioritized, communicated, and delivered quality work.'},
            {'id': 'beh_2', 'question': 'Describe a situation where you disagreed with a teammate. How did you resolve it?', 'tip': 'Show emotional intelligence, communication skills, and focus on positive outcomes.'},
            {'id': 'beh_3', 'question': 'Give an example of a project you led end-to-end.', 'tip': 'Cover planning, execution, team coordination, challenges, and results with metrics.'},
            {'id': 'beh_4', 'question': 'Tell me about a time you failed. What did you learn?', 'tip': 'Be honest but end on a growth note. Show self-awareness and what you changed.'},
            {'id': 'beh_5', 'question': 'How do you handle ambiguous requirements or unclear tasks?', 'tip': 'Show proactive clarification, documentation, and iterative approach skills.'},
        ],
    }


def _mock_linkedin(user_profile, target_role):
    name = user_profile.get('name', 'Professional')
    skills = user_profile.get('skills', ['Python', 'JavaScript'])[:5]
    skills_str = ', '.join(skills)

    return {
        'headline': f"{target_role} | {skills_str} | Building impactful products",
        'summary': f"I'm a passionate {target_role} with expertise in {skills_str}. I thrive at the intersection of technology and problem-solving, building products that make a real difference.\n\nWith hands-on experience across the full development lifecycle, I've contributed to projects ranging from early-stage startups to enterprise-scale systems. My focus is on writing clean, efficient code and collaborating closely with cross-functional teams.\n\nCurrently looking for opportunities where I can contribute meaningfully, grow technically, and work alongside talented people on challenging problems. Let's connect!",
        'keywords': skills + ['Software Engineering', 'Problem Solving', 'Agile', 'Cloud'],
    }
