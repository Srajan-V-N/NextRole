import re

STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'for', 'to', 'in', 'of', 'with', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'this', 'that', 'these', 'those', 'it', 'its', 'you', 'your', 'we',
    'our', 'they', 'their', 'he', 'she', 'his', 'her', 'at', 'by', 'from', 'on', 'up',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'each', 'all', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than',
    'too', 'very', 'just', 'not', 'also', 'about', 'per', 'etc', 'inc', 'ltd',
    # Job-description boilerplate that inflates the denominator
    'must', 'strong', 'ability', 'looking', 'join', 'environment', 'highly', 'seeking',
    'motivated', 'opportunity', 'responsibilities', 'ideal', 'candidate', 'qualifications',
    'degree', 'field', 'related', 'equivalent', 'minimum', 'understanding', 'familiarity',
    'proficiency', 'demonstrated', 'solid', 'collaborate', 'written', 'verbal',
    'interpersonal', 'organizational', 'problem', 'analytical', 'ability', 'provide',
    'company', 'project', 'product', 'business', 'client', 'customer', 'service',
    'process', 'processes', 'results', 'impact', 'value', 'success', 'excellent',
    'good', 'years', 'year', 'required', 'preferred', 'role', 'position', 'working',
    'plus', 'role', 'help', 'make', 'work', 'team', 'hands', 'tools', 'best',
    'practices', 'ensure', 'create', 'maintain', 'support', 'include', 'including',
    'well', 'able', 'new', 'use', 'using', 'high', 'large', 'scale', 'level',
    'across', 'within', 'multiple', 'various', 'different', 'full', 'fast',
}

# Short technical terms to always keep (override the len >= 4 filter below)
TECHNICAL_SHORT = {
    'sql', 'api', 'css', 'git', 'aws', 'gcp', 'ios', 'c++', 'c#', 'php', 'vim',
    'xml', 'json', 'sdk', 'ide', 'uml', 'ocr', 'nlp', 'llm', 'oop', 'mvp',
    'iac', 'k8s', 'etl', 'bi', 'ml', 'ai', 'ui', 'ux', 'qa', 'ci', 'cd',
}

SUGGESTION_MAP = {
    'python': 'Add Python projects or mention Python experience in your descriptions.',
    'java': 'Include Java-related work or coursework in your experience section.',
    'javascript': 'Mention JavaScript frameworks or projects in your experience.',
    'react': 'Add React projects or components you have built.',
    'node': 'Include Node.js backend projects or APIs you have built.',
    'sql': 'Mention SQL databases you have worked with (MySQL, PostgreSQL, etc.).',
    'aws': 'Add cloud experience with AWS services like EC2, S3, or Lambda.',
    'docker': 'Mention containerization experience with Docker or Kubernetes.',
    'git': 'Ensure your resume mentions version control with Git.',
    'agile': 'Include Agile/Scrum methodology experience.',
    'machine learning': 'Add machine learning projects or relevant coursework.',
    'api': 'Mention REST API design or integration experience.',
    'testing': 'Include unit testing or QA experience.',
    'communication': 'Highlight collaboration and communication in your experience descriptions.',
    'leadership': 'Mention any team lead, mentoring, or project ownership experience.',
}


def extract_keywords(text):
    tokens = re.findall(r'\b[a-zA-Z][a-zA-Z+#./]{1,}\b', text)
    keywords = set()
    for t in tokens:
        lower = t.lower()
        if lower not in STOPWORDS and (len(lower) >= 4 or lower in TECHNICAL_SHORT):
            keywords.add(lower)
    return list(keywords)


def calculate_ats_score(resume_text, job_description):
    if not resume_text or not job_description:
        return {'score': 0, 'matched': [], 'missing': [], 'suggestions': []}

    job_keywords = extract_keywords(job_description)
    resume_lower = resume_text.lower()

    matched = [kw for kw in job_keywords if kw in resume_lower]
    missing = [kw for kw in job_keywords if kw not in resume_lower]

    score = min(100, round(len(matched) / max(len(job_keywords), 1) * 100))

    suggestions = []
    for kw in missing[:8]:
        hint = SUGGESTION_MAP.get(kw)
        if hint:
            suggestions.append(hint)
        else:
            suggestions.append(f'Consider adding "{kw}" to your resume if applicable.')

    return {
        'score': score,
        'matched': matched[:20],
        'missing': missing[:20],
        'suggestions': suggestions[:6],
    }


def calculate_match_score(user_skills, job_skills):
    if not job_skills:
        return 0
    user_set = {s.lower().strip() for s in user_skills}
    job_set = {s.lower().strip() for s in job_skills}
    overlap = user_set & job_set
    return min(100, round(len(overlap) / len(job_set) * 100))


def get_skill_gaps(user_skills, job_skills):
    user_set = {s.lower().strip() for s in user_skills}
    job_set = {s.lower().strip() for s in job_skills}
    gaps = job_set - user_set
    return sorted(list(gaps))


def calculate_placement_score(ats_score, readiness_score, profile_completeness):
    return round(0.4 * ats_score + 0.4 * readiness_score + 0.2 * profile_completeness)


def calculate_readiness_score(tasks):
    if not tasks:
        return 0
    completed = sum(1 for t in tasks if t.get('completed'))
    return min(100, round(completed / len(tasks) * 100))
