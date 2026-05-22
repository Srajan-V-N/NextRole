from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import current_app

courses_bp = Blueprint('courses', __name__)

COURSE_DATABASE = {
    'python': {
        'free': [
            {'title': 'Python for Everybody', 'platform': 'Coursera (Audit Free)', 'rating': 4.8, 'duration': '8 weeks', 'level': 'Beginner', 'url': 'https://www.coursera.org/specializations/python'},
            {'title': 'Python Tutorial for Beginners', 'platform': 'freeCodeCamp', 'rating': 4.7, 'duration': '4.5 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=rfscVS0vtbw'},
            {'title': 'Python Full Course', 'platform': 'Great Learning', 'rating': 4.6, 'duration': '6 hours', 'level': 'Beginner', 'url': 'https://www.mygreatlearning.com/academy/learn-for-free/courses/python-fundamentals-for-beginners'},
        ],
        'paid': [
            {'title': 'Python Bootcamp 2024', 'platform': 'Udemy', 'rating': 4.7, 'duration': '22 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/complete-python-bootcamp/'},
            {'title': 'Python 3 Programming Specialization', 'platform': 'Coursera', 'rating': 4.8, 'duration': '5 months', 'level': 'Intermediate', 'url': 'https://www.coursera.org/specializations/python-3-programming'},
        ],
    },
    'javascript': {
        'free': [
            {'title': 'JavaScript Algorithms and Data Structures', 'platform': 'freeCodeCamp', 'rating': 4.8, 'duration': '300 hours', 'level': 'Beginner', 'url': 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/'},
            {'title': 'JavaScript Full Course', 'platform': 'YouTube', 'rating': 4.7, 'duration': '8 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=jS4aFq5-91M'},
        ],
        'paid': [
            {'title': 'The Complete JavaScript Course', 'platform': 'Udemy', 'rating': 4.7, 'duration': '69 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/the-complete-javascript-course/'},
            {'title': 'JavaScript: The Advanced Concepts', 'platform': 'Udemy', 'rating': 4.7, 'duration': '25 hours', 'level': 'Advanced', 'url': 'https://www.udemy.com/course/advanced-javascript-concepts/'},
        ],
    },
    'react': {
        'free': [
            {'title': 'React JS Full Course', 'platform': 'freeCodeCamp', 'rating': 4.8, 'duration': '10 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=bMknfKXIFA8'},
            {'title': 'React Tutorial', 'platform': 'Great Learning', 'rating': 4.6, 'duration': '4 hours', 'level': 'Beginner', 'url': 'https://www.mygreatlearning.com/academy/learn-for-free/courses/react-js'},
        ],
        'paid': [
            {'title': 'React - The Complete Guide', 'platform': 'Udemy', 'rating': 4.7, 'duration': '68 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/'},
            {'title': 'Meta Front-End Developer Certificate', 'platform': 'Coursera', 'rating': 4.8, 'duration': '7 months', 'level': 'Beginner', 'url': 'https://www.coursera.org/professional-certificates/meta-front-end-developer'},
        ],
    },
    'machine learning': {
        'free': [
            {'title': 'Machine Learning Crash Course', 'platform': 'Google', 'rating': 4.9, 'duration': '15 hours', 'level': 'Beginner', 'url': 'https://developers.google.com/machine-learning/crash-course'},
            {'title': 'Machine Learning Course', 'platform': 'freeCodeCamp', 'rating': 4.7, 'duration': '9 hours', 'level': 'Intermediate', 'url': 'https://www.youtube.com/watch?v=NWONeJKn6kc'},
        ],
        'paid': [
            {'title': 'Machine Learning Specialization', 'platform': 'Coursera', 'rating': 4.9, 'duration': '3 months', 'level': 'Beginner', 'url': 'https://www.coursera.org/specializations/machine-learning-introduction'},
            {'title': 'Machine Learning A-Z', 'platform': 'Udemy', 'rating': 4.5, 'duration': '44 hours', 'level': 'Intermediate', 'url': 'https://www.udemy.com/course/machinelearning/'},
        ],
    },
    'sql': {
        'free': [
            {'title': 'SQL Tutorial - Full Database Course', 'platform': 'freeCodeCamp', 'rating': 4.8, 'duration': '4 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=HXV3zeQKqGY'},
            {'title': 'SQL for Beginners', 'platform': 'Great Learning', 'rating': 4.6, 'duration': '3 hours', 'level': 'Beginner', 'url': 'https://www.mygreatlearning.com/academy/learn-for-free/courses/sql-for-data-science'},
        ],
        'paid': [
            {'title': 'The Complete SQL Bootcamp', 'platform': 'Udemy', 'rating': 4.7, 'duration': '9 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/the-complete-sql-bootcamp/'},
            {'title': 'SQL for Data Science', 'platform': 'Coursera', 'rating': 4.6, 'duration': '4 weeks', 'level': 'Beginner', 'url': 'https://www.coursera.org/learn/sql-for-data-science'},
        ],
    },
    'docker': {
        'free': [
            {'title': 'Docker Tutorial for Beginners', 'platform': 'TechWorld with Nana', 'rating': 4.9, 'duration': '3 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=3c-iBn73dDE'},
            {'title': 'Docker Mastery', 'platform': 'freeCodeCamp', 'rating': 4.7, 'duration': '5 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=fqMOX6JJhGo'},
        ],
        'paid': [
            {'title': 'Docker and Kubernetes: The Complete Guide', 'platform': 'Udemy', 'rating': 4.6, 'duration': '21 hours', 'level': 'Intermediate', 'url': 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/'},
        ],
    },
    'kubernetes': {
        'free': [
            {'title': 'Kubernetes Tutorial for Beginners', 'platform': 'TechWorld with Nana', 'rating': 4.9, 'duration': '4 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=X48VuDVv0do'},
        ],
        'paid': [
            {'title': 'Certified Kubernetes Administrator (CKA)', 'platform': 'Udemy', 'rating': 4.7, 'duration': '17 hours', 'level': 'Advanced', 'url': 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/'},
        ],
    },
    'aws': {
        'free': [
            {'title': 'AWS Tutorial for Beginners', 'platform': 'freeCodeCamp', 'rating': 4.7, 'duration': '5 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=ulprqHHWlng'},
            {'title': 'AWS Cloud Practitioner Essentials', 'platform': 'AWS Training (Free)', 'rating': 4.8, 'duration': '6 hours', 'level': 'Beginner', 'url': 'https://explore.skillbuilder.aws/learn/course/134'},
        ],
        'paid': [
            {'title': 'AWS Certified Solutions Architect', 'platform': 'Udemy', 'rating': 4.7, 'duration': '27 hours', 'level': 'Intermediate', 'url': 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/'},
            {'title': 'AWS Fundamentals Specialization', 'platform': 'Coursera', 'rating': 4.7, 'duration': '3 months', 'level': 'Beginner', 'url': 'https://www.coursera.org/specializations/aws-fundamentals'},
        ],
    },
    'typescript': {
        'free': [
            {'title': 'TypeScript Tutorial for Beginners', 'platform': 'freeCodeCamp', 'rating': 4.7, 'duration': '3 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=30LWjhZzg50'},
        ],
        'paid': [
            {'title': 'Understanding TypeScript', 'platform': 'Udemy', 'rating': 4.6, 'duration': '22 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/understanding-typescript/'},
        ],
    },
    'java': {
        'free': [
            {'title': 'Java Tutorial for Beginners', 'platform': 'freeCodeCamp', 'rating': 4.8, 'duration': '9 hours', 'level': 'Beginner', 'url': 'https://www.youtube.com/watch?v=eIrMbAQSU34'},
            {'title': 'Java Programming', 'platform': 'Great Learning', 'rating': 4.6, 'duration': '8 hours', 'level': 'Beginner', 'url': 'https://www.mygreatlearning.com/academy/learn-for-free/courses/java-programming'},
        ],
        'paid': [
            {'title': 'Java Masterclass 2024', 'platform': 'Udemy', 'rating': 4.7, 'duration': '85 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/java-the-complete-java-developer-course/'},
        ],
    },
    'default': {
        'free': [
            {'title': 'CS50x: Introduction to Computer Science', 'platform': 'edX (Free Audit)', 'rating': 4.9, 'duration': '11 weeks', 'level': 'Beginner', 'url': 'https://cs50.harvard.edu/x/'},
            {'title': 'The Odin Project', 'platform': 'The Odin Project', 'rating': 4.9, 'duration': 'Self-paced', 'level': 'Beginner', 'url': 'https://www.theodinproject.com'},
        ],
        'paid': [
            {'title': 'Web Developer Bootcamp', 'platform': 'Udemy', 'rating': 4.7, 'duration': '65 hours', 'level': 'Beginner', 'url': 'https://www.udemy.com/course/the-web-developer-bootcamp/'},
        ],
    },
}

LEETCODE_ROADMAPS = {
    'software engineer': [
        {'topic': 'Arrays & Strings', 'easy': 15, 'medium': 10, 'link': 'https://leetcode.com/tag/array/'},
        {'topic': 'Two Pointers', 'easy': 8, 'medium': 8, 'link': 'https://leetcode.com/tag/two-pointers/'},
        {'topic': 'Hash Maps', 'easy': 10, 'medium': 10, 'link': 'https://leetcode.com/tag/hash-table/'},
        {'topic': 'Binary Search', 'easy': 5, 'medium': 8, 'link': 'https://leetcode.com/tag/binary-search/'},
        {'topic': 'Trees & BST', 'easy': 8, 'medium': 12, 'link': 'https://leetcode.com/tag/binary-tree/'},
        {'topic': 'Dynamic Programming', 'easy': 5, 'medium': 15, 'link': 'https://leetcode.com/tag/dynamic-programming/'},
        {'topic': 'Graphs & BFS/DFS', 'easy': 5, 'medium': 10, 'link': 'https://leetcode.com/tag/graph/'},
    ],
    'data engineer': [
        {'topic': 'SQL Queries', 'easy': 15, 'medium': 10, 'link': 'https://leetcode.com/tag/database/'},
        {'topic': 'Arrays & Sorting', 'easy': 10, 'medium': 8, 'link': 'https://leetcode.com/tag/sorting/'},
        {'topic': 'Hash Maps', 'easy': 8, 'medium': 8, 'link': 'https://leetcode.com/tag/hash-table/'},
        {'topic': 'String Manipulation', 'easy': 8, 'medium': 5, 'link': 'https://leetcode.com/tag/string/'},
        {'topic': 'Dynamic Programming', 'easy': 3, 'medium': 8, 'link': 'https://leetcode.com/tag/dynamic-programming/'},
    ],
    'machine learning engineer': [
        {'topic': 'Arrays & Matrix', 'easy': 10, 'medium': 10, 'link': 'https://leetcode.com/tag/array/'},
        {'topic': 'Math & Statistics', 'easy': 8, 'medium': 5, 'link': 'https://leetcode.com/tag/math/'},
        {'topic': 'Hash Maps', 'easy': 8, 'medium': 8, 'link': 'https://leetcode.com/tag/hash-table/'},
        {'topic': 'Dynamic Programming', 'easy': 5, 'medium': 12, 'link': 'https://leetcode.com/tag/dynamic-programming/'},
        {'topic': 'Graphs & Trees', 'easy': 5, 'medium': 8, 'link': 'https://leetcode.com/tag/graph/'},
    ],
    'frontend engineer': [
        {'topic': 'Arrays & Strings', 'easy': 12, 'medium': 8, 'link': 'https://leetcode.com/tag/array/'},
        {'topic': 'DOM & Event-Driven', 'easy': 5, 'medium': 5, 'link': 'https://leetcode.com/tag/design/'},
        {'topic': 'Hash Maps', 'easy': 8, 'medium': 8, 'link': 'https://leetcode.com/tag/hash-table/'},
        {'topic': 'Recursion & Trees', 'easy': 6, 'medium': 8, 'link': 'https://leetcode.com/tag/tree/'},
        {'topic': 'Two Pointers', 'easy': 5, 'medium': 6, 'link': 'https://leetcode.com/tag/two-pointers/'},
    ],
    'backend engineer': [
        {'topic': 'Arrays & Strings', 'easy': 10, 'medium': 8, 'link': 'https://leetcode.com/tag/array/'},
        {'topic': 'SQL', 'easy': 12, 'medium': 8, 'link': 'https://leetcode.com/tag/database/'},
        {'topic': 'Trees & Graphs', 'easy': 8, 'medium': 12, 'link': 'https://leetcode.com/tag/tree/'},
        {'topic': 'System Design Concepts', 'easy': 3, 'medium': 8, 'link': 'https://leetcode.com/tag/design/'},
        {'topic': 'Dynamic Programming', 'easy': 4, 'medium': 10, 'link': 'https://leetcode.com/tag/dynamic-programming/'},
    ],
    'devops engineer': [
        {'topic': 'Strings & Parsing', 'easy': 10, 'medium': 5, 'link': 'https://leetcode.com/tag/string/'},
        {'topic': 'Arrays & Sorting', 'easy': 8, 'medium': 6, 'link': 'https://leetcode.com/tag/sorting/'},
        {'topic': 'Hash Maps', 'easy': 6, 'medium': 6, 'link': 'https://leetcode.com/tag/hash-table/'},
        {'topic': 'Greedy & Scheduling', 'easy': 4, 'medium': 8, 'link': 'https://leetcode.com/tag/greedy/'},
    ],
    'default': [
        {'topic': 'Arrays & Strings', 'easy': 15, 'medium': 10, 'link': 'https://leetcode.com/tag/array/'},
        {'topic': 'Hash Maps', 'easy': 10, 'medium': 8, 'link': 'https://leetcode.com/tag/hash-table/'},
        {'topic': 'Two Pointers', 'easy': 8, 'medium': 6, 'link': 'https://leetcode.com/tag/two-pointers/'},
        {'topic': 'Binary Search', 'easy': 5, 'medium': 6, 'link': 'https://leetcode.com/tag/binary-search/'},
        {'topic': 'Trees', 'easy': 8, 'medium': 10, 'link': 'https://leetcode.com/tag/binary-tree/'},
        {'topic': 'Dynamic Programming', 'easy': 5, 'medium': 12, 'link': 'https://leetcode.com/tag/dynamic-programming/'},
    ],
}


@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    user_id = get_jwt_identity()
    db = current_app.db
    from bson import ObjectId

    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    role = request.args.get('role', '').lower().strip()
    active_job = user.get('active_job')
    if not role and active_job:
        role = active_job.get('title', '').lower()

    # Determine skill gaps
    user_skills = set(s.lower() for s in user.get('skills', []))
    active_job_skills = set(s.lower() for s in (active_job.get('skills', []) if active_job else []))
    skill_gaps = list(active_job_skills - user_skills) if active_job_skills else []

    # Build course recommendations
    recommended_courses = []
    seen_skills = set()

    for gap in skill_gaps[:6]:
        for skill_key, courses in COURSE_DATABASE.items():
            if skill_key in gap or gap in skill_key:
                if skill_key not in seen_skills:
                    seen_skills.add(skill_key)
                    recommended_courses.append({
                        'skill': gap,
                        'free': courses.get('free', []),
                        'paid': courses.get('paid', []),
                    })
                break

    # If no gaps or no matches, show defaults
    if not recommended_courses:
        recommended_courses = [
            {'skill': 'General Programming', 'free': COURSE_DATABASE['default']['free'], 'paid': COURSE_DATABASE['default']['paid']},
        ]
        for skill_key in ['python', 'javascript', 'react']:
            if skill_key in COURSE_DATABASE:
                recommended_courses.append({
                    'skill': skill_key.title(),
                    'free': COURSE_DATABASE[skill_key]['free'],
                    'paid': COURSE_DATABASE[skill_key]['paid'],
                })

    # LeetCode roadmap based on role
    role_key = 'default'
    for key in LEETCODE_ROADMAPS:
        if key in role:
            role_key = key
            break

    roadmap = LEETCODE_ROADMAPS.get(role_key, LEETCODE_ROADMAPS['default'])

    return jsonify({
        'courses': recommended_courses,
        'leetcode_roadmap': roadmap,
        'role': role or 'General',
        'skill_gaps': skill_gaps,
    }), 200
