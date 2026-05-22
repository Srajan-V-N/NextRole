import sys
import requests
from urllib.parse import urlparse
from flask import current_app
from .mock_jobs import search_mock_jobs, MOCK_JOBS


# ── JSearch (RapidAPI) ───────────────────────────────────────────────────────

def _fetch_jsearch(query, location, count):
    api_key = current_app.config.get('RAPIDAPI_KEY', '')
    api_host = current_app.config.get('RAPIDAPI_HOST', 'jsearch.p.rapidapi.com')
    if not api_key:
        return None

    try:
        params = {
            'query': f'{query} {location}'.strip(),
            'page': '1',
            'num_pages': '3',
            'date_posted': 'week',
        }
        headers = {
            'X-RapidAPI-Key': api_key,
            'X-RapidAPI-Host': api_host,
        }
        resp = requests.get(
            'https://jsearch.p.rapidapi.com/search',
            headers=headers, params=params, timeout=10
        )
        resp.raise_for_status()
        jobs = resp.json().get('data', [])
        print(f'[JSearch] Fetched {len(jobs)} jobs for "{query}"', file=sys.stderr)
        return _format_jsearch_jobs(jobs[:count])
    except Exception as e:
        print(f'[JSearch Error] {e}', file=sys.stderr)
        return None


# ── Remotive.io (free, no auth) ──────────────────────────────────────────────

def _fetch_remotive(query, count):
    try:
        params = {'search': query, 'limit': count}
        resp = requests.get('https://remotive.com/api/remote-jobs', params=params, timeout=10)
        resp.raise_for_status()
        jobs = resp.json().get('jobs', [])
        print(f'[Remotive] Fetched {len(jobs)} jobs for "{query}"', file=sys.stderr)
        return _format_remotive_jobs(jobs[:count])
    except Exception as e:
        print(f'[Remotive Error] {e}', file=sys.stderr)
        return []


# ── Adzuna India (free API key required) ─────────────────────────────────────

def _fetch_adzuna_india(query, count):
    app_id = current_app.config.get('ADZUNA_APP_ID', '')
    app_key = current_app.config.get('ADZUNA_APP_KEY', '')
    if not app_id or not app_key:
        return []

    try:
        params = {
            'app_id': app_id,
            'app_key': app_key,
            'what': query,
            'results_per_page': count,
            'content-type': 'application/json',
        }
        resp = requests.get(
            'https://api.adzuna.com/v1/api/jobs/in/search/1',
            params=params, timeout=10
        )
        resp.raise_for_status()
        jobs = resp.json().get('results', [])
        print(f'[Adzuna India] Fetched {len(jobs)} jobs for "{query}"', file=sys.stderr)
        return _format_adzuna_jobs(jobs[:count])
    except Exception as e:
        print(f'[Adzuna Error] {e}', file=sys.stderr)
        return []


# ── Aggregator ───────────────────────────────────────────────────────────────

def fetch_jobs(query='software engineer', location='', count=30):
    results = []

    # 1. JSearch (global + India via location param)
    jsearch_jobs = _fetch_jsearch(query, location, count)
    if jsearch_jobs is not None:
        results.extend(jsearch_jobs)

    # 2. Adzuna India (India-specific job board, free API)
    adzuna_jobs = _fetch_adzuna_india(query, count)
    results.extend(adzuna_jobs)

    # 3. Remotive (remote jobs, no auth needed)
    remotive_jobs = _fetch_remotive(query, count)
    results.extend(remotive_jobs)

    # Fall back to mock if all live sources returned nothing
    if not results:
        print('[Jobs] All live sources failed — using mock data', file=sys.stderr)
        return _format_mock_jobs(search_mock_jobs(query, location))

    # Deduplicate by (company, title) — keep first occurrence
    seen = set()
    unique = []
    for job in results:
        key = (job['company'].lower().strip(), job['title'].lower().strip())
        if key not in seen:
            seen.add(key)
            unique.append(job)

    # Apply the same title-relevance filter used for mock jobs
    if query:
        tokens = [t.strip() for t in query.lower().split() if len(t.strip()) > 1]
        if tokens:
            scored = []
            for job in unique:
                title = job['title'].lower()
                skills_text = ' '.join(job.get('skills', [])).lower()
                full_hits = sum(1 for tok in tokens if tok in ' '.join([
                    title, job.get('company', '').lower(),
                    job.get('description', '').lower(), skills_text,
                ]))
                title_hits = sum(1 for tok in tokens if tok in title)
                # Require at least one token to match in the title
                if title_hits == 0:
                    continue
                score = title_hits * 10 + full_hits * 2
                scored.append((job, score))
            scored.sort(key=lambda x: x[1], reverse=True)
            unique = [j for j, _ in scored]

    # If location filter given, apply a soft location filter
    if location:
        loc = location.lower()
        loc_filtered = [j for j in unique if loc in j['location'].lower()]
        if loc_filtered:
            unique = loc_filtered

    return unique[:count]


# ── Formatters ───────────────────────────────────────────────────────────────

def _derive_work_mode(location_str):
    loc = (location_str or '').lower()
    if 'remote' in loc:
        return 'Remote'
    if 'hybrid' in loc:
        return 'Hybrid'
    return 'On-site'


def _derive_experience_level(title_str):
    title = (title_str or '').lower()
    if any(w in title for w in ['senior', 'sr.', 'lead', 'principal', 'staff']):
        return 'Senior'
    if any(w in title for w in ['junior', 'jr.', 'entry', 'associate', 'intern']):
        return 'Entry'
    return 'Mid'


def _format_jsearch_jobs(jobs):
    formatted = []
    for j in jobs:
        skills_raw = j.get('job_required_skills') or []
        if not skills_raw:
            desc = (j.get('job_description') or '').lower()
            skill_keywords = ['python', 'java', 'javascript', 'react', 'node', 'sql',
                              'aws', 'docker', 'git', 'typescript', 'go', 'kubernetes']
            skills_raw = [s for s in skill_keywords if s in desc]

        company = j.get('employer_name', 'Company')
        location = j.get('job_city', '') or j.get('job_country', 'Remote')
        title = j.get('job_title', 'Software Engineer')

        employer_logo = j.get('employer_logo') or ''
        employer_website = j.get('employer_website') or ''
        if employer_logo:
            logo_url = employer_logo
        elif employer_website:
            try:
                domain = urlparse(employer_website).netloc or ''
                logo_url = f'https://www.google.com/s2/favicons?domain={domain}&sz=64' if domain else ''
            except Exception:
                logo_url = ''
        else:
            logo_url = ''

        formatted.append({
            'id': j.get('job_id', f'jsearch_{len(formatted)}'),
            'title': title,
            'company': company,
            'location': location,
            'type': j.get('job_employment_type', 'Full-time'),
            'work_mode': _derive_work_mode(location),
            'experience_level': _derive_experience_level(title),
            'salary': _format_salary(j),
            'posted': j.get('job_posted_at_datetime_utc', '')[:10] if j.get('job_posted_at_datetime_utc') else 'Recently',
            'description': j.get('job_description', '')[:800],
            'skills': [s.lower() for s in skills_raw[:10]],
            'apply_url': j.get('job_apply_link', '#'),
            'logo': company[0].upper() if company else 'J',
            'logo_color': '#00D5B9',
            'logo_url': logo_url,
            'source': 'jsearch',
        })
    return formatted


def _format_remotive_jobs(jobs):
    formatted = []
    for j in jobs:
        company = j.get('company_name', 'Company')
        title = j.get('title', 'Software Engineer')
        location = j.get('candidate_required_location') or 'Remote'
        tags = [t.lower() for t in (j.get('tags') or [])[:10]]
        desc = j.get('description', '')

        # Derive skills from tags + common keywords in description
        if not tags:
            desc_lower = desc.lower()
            skill_keywords = ['python', 'javascript', 'react', 'node', 'sql', 'aws',
                              'docker', 'typescript', 'java', 'go', 'kubernetes', 'git']
            tags = [s for s in skill_keywords if s in desc_lower]

        logo_url = ''

        formatted.append({
            'id': f'remotive_{j.get("id", len(formatted))}',
            'title': title,
            'company': company,
            'location': location if location else 'Remote',
            'type': j.get('job_type', 'Full-time').replace('_', ' ').title(),
            'work_mode': 'Remote',
            'experience_level': _derive_experience_level(title),
            'salary': j.get('salary') or 'Competitive',
            'posted': (j.get('publication_date') or '')[:10] or 'Recently',
            'description': desc[:800],
            'skills': tags,
            'apply_url': j.get('url', '#'),
            'logo': company[0].upper() if company else 'R',
            'logo_color': '#6B46C1',
            'logo_url': logo_url,
            'source': 'remotive',
        })
    return formatted


def _format_adzuna_jobs(jobs):
    formatted = []
    for j in jobs:
        company = (j.get('company') or {}).get('display_name', 'Company')
        title = j.get('title', 'Software Engineer')
        location = (j.get('location') or {}).get('display_name', 'India')
        desc = j.get('description', '')

        # Extract skills from description keywords
        desc_lower = desc.lower()
        skill_keywords = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws',
                          'docker', 'typescript', 'go', 'kubernetes', 'angular', 'spring',
                          'machine learning', 'data analysis', 'tableau', 'power bi']
        skills = [s for s in skill_keywords if s in desc_lower]

        logo_url = ''

        salary = 'Competitive'
        min_s = j.get('salary_min')
        max_s = j.get('salary_max')
        if min_s and max_s:
            salary = f'₹{int(min_s):,} - ₹{int(max_s):,}'

        formatted.append({
            'id': f'adzuna_{j.get("id", len(formatted))}',
            'title': title,
            'company': company,
            'location': location,
            'type': 'Full-time',
            'work_mode': _derive_work_mode(location),
            'experience_level': _derive_experience_level(title),
            'salary': salary,
            'posted': (j.get('created') or '')[:10] or 'Recently',
            'description': desc[:800],
            'skills': skills[:10],
            'apply_url': j.get('redirect_url', '#'),
            'logo': company[0].upper() if company else 'A',
            'logo_color': '#FF6B35',
            'logo_url': logo_url,
            'source': 'adzuna',
        })
    return formatted


def _format_mock_jobs(jobs):
    return jobs


def _format_salary(job):
    min_s = job.get('job_min_salary')
    max_s = job.get('job_max_salary')
    currency = job.get('job_salary_currency', 'USD')
    if min_s and max_s:
        symbol = '$' if currency == 'USD' else currency
        return f'{symbol}{int(min_s):,} - {symbol}{int(max_s):,}'
    return 'Competitive'


def get_job_by_id(job_id):
    for j in MOCK_JOBS:
        if j['id'] == job_id:
            return j
    return None
