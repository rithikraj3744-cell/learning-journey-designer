"""
Add Missing Competencies to Firestore
Adds the competencies referenced in graph relationships
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
except:
    pass

db = firestore.client()

# Competencies to add
MISSING_COMPETENCIES = [
    {
        'id': 'vue',
        'name': 'Vue.js',
        'description': 'Progressive JavaScript framework for building user interfaces',
        'category': 'frontend',
        'level': 2,
        'importance': 0.7
    },
    {
        'id': 'flask',
        'name': 'Flask',
        'description': 'Lightweight Python web framework',
        'category': 'backend',
        'level': 2,
        'importance': 0.7
    },
    {
        'id': 'python',
        'name': 'Python',
        'description': 'High-level programming language',
        'category': 'backend',
        'level': 1,
        'importance': 0.9
    },
    {
        'id': 'react',
        'name': 'React',
        'description': 'JavaScript library for building user interfaces',
        'category': 'frontend',
        'level': 2,
        'importance': 0.9
    },
    {
        'id': 'docker',
        'name': 'Docker',
        'description': 'Platform for containerizing applications',
        'category': 'devops',
        'level': 2,
        'importance': 0.9
    },
    {
        'id': 'kubernetes',
        'name': 'Kubernetes',
        'description': 'Container orchestration platform',
        'category': 'devops',
        'level': 3,
        'importance': 0.8
    },
    {
        'id': 'django',
        'name': 'Django',
        'description': 'High-level Python web framework',
        'category': 'backend',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'mysql',
        'name': 'MySQL',
        'description': 'Popular open-source relational database',
        'category': 'database',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'ci-cd',
        'name': 'CI/CD',
        'description': 'Continuous Integration and Continuous Deployment practices',
        'category': 'devops',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'javascript',
        'name': 'JavaScript',
        'description': 'Programming language for web development',
        'category': 'frontend',
        'level': 1,
        'importance': 1.0
    },
    {
        'id': 'rest-api',
        'name': 'REST API',
        'description': 'RESTful API design and implementation',
        'category': 'backend',
        'level': 2,
        'importance': 0.9
    },
    {
        'id': 'mongodb',
        'name': 'MongoDB',
        'description': 'NoSQL document database',
        'category': 'database',
        'level': 2,
        'importance': 0.7
    },
    {
        'id': 'sql-basics',
        'name': 'SQL Basics',
        'description': 'Fundamental SQL query language',
        'category': 'database',
        'level': 1,
        'importance': 0.9
    },
    {
        'id': 'aws',
        'name': 'AWS',
        'description': 'Amazon Web Services cloud platform',
        'category': 'devops',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'postgresql',
        'name': 'PostgreSQL',
        'description': 'Advanced open-source relational database',
        'category': 'database',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'html-css',
        'name': 'HTML & CSS',
        'description': 'Web page structure and styling',
        'category': 'frontend',
        'level': 1,
        'importance': 1.0
    },
    {
        'id': 'nodejs',
        'name': 'Node.js',
        'description': 'JavaScript runtime for server-side development',
        'category': 'backend',
        'level': 2,
        'importance': 0.9
    },
    {
        'id': 'express',
        'name': 'Express.js',
        'description': 'Web framework for Node.js',
        'category': 'backend',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'linux-basics',
        'name': 'Linux Basics',
        'description': 'Fundamental Linux system administration',
        'category': 'devops',
        'level': 1,
        'importance': 0.8
    },
    {
        'id': 'git',
        'name': 'Git',
        'description': 'Version control system',
        'category': 'general',
        'level': 1,
        'importance': 1.0
    },
    {
        'id': 'responsive-design',
        'name': 'Responsive Design',
        'description': 'Creating layouts that adapt to different screen sizes',
        'category': 'frontend',
        'level': 2,
        'importance': 0.8
    },
    {
        'id': 'redux',
        'name': 'Redux',
        'description': 'State management library for JavaScript apps',
        'category': 'frontend',
        'level': 3,
        'importance': 0.6
    }
]

def add_competencies():
    """Add missing competencies to Firestore"""
    print("=" * 60)
    print("ADDING MISSING COMPETENCIES")
    print("=" * 60)

    competencies_ref = db.collection('competencies')
    added = 0
    skipped = 0

    for comp in MISSING_COMPETENCIES:
        comp_id = comp.pop('id')

        # Check if already exists
        doc = competencies_ref.document(comp_id).get()
        if doc.exists:
            print(f"  ⊘ Skipped: {comp['name']} (already exists)")
            skipped += 1
            continue

        # Add timestamps
        comp['created_at'] = datetime.now().isoformat()
        comp['updated_at'] = datetime.now().isoformat()

        # Add to Firestore
        competencies_ref.document(comp_id).set(comp)
        print(f"  ✓ Added: {comp['name']}")
        added += 1

    print("\n" + "=" * 60)
    print(f"✓ COMPLETE: Added {added} competencies, skipped {skipped}")
    print("=" * 60)
    print("\nNow refresh your browser to see the complete knowledge graph!")

if __name__ == '__main__':
    try:
        add_competencies()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
