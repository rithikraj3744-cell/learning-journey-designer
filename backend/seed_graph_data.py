"""
Seed Knowledge Graph Data
Populate Firestore with sample competency relationships and roles
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase (if not already initialized)
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
except:
    pass  # Already initialized

db = firestore.client()

# Sample roles
SAMPLE_ROLES = [
    {
        'id': 'full-stack-developer',
        'name': 'Full Stack Developer',
        'description': 'Develops both frontend and backend applications',
        'metadata': {
            'salary_range': '$80,000 - $150,000',
            'experience_level': 'Mid to Senior',
            'demand': 'High'
        }
    },
    {
        'id': 'frontend-developer',
        'name': 'Frontend Developer',
        'description': 'Specializes in user interface and client-side development',
        'metadata': {
            'salary_range': '$70,000 - $130,000',
            'experience_level': 'Junior to Senior',
            'demand': 'High'
        }
    },
    {
        'id': 'backend-developer',
        'name': 'Backend Developer',
        'description': 'Focuses on server-side logic and database management',
        'metadata': {
            'salary_range': '$75,000 - $140,000',
            'experience_level': 'Junior to Senior',
            'demand': 'High'
        }
    },
    {
        'id': 'devops-engineer',
        'name': 'DevOps Engineer',
        'description': 'Manages infrastructure, deployment, and automation',
        'metadata': {
            'salary_range': '$90,000 - $160,000',
            'experience_level': 'Mid to Senior',
            'demand': 'Very High'
        }
    }
]

# Sample relationships (source_id, target_id, type, strength, description)
SAMPLE_RELATIONSHIPS = [
    # Frontend relationships
    ('html-css', 'javascript', 'PREREQUISITE_OF', 1.0, 'HTML/CSS is fundamental before JavaScript'),
    ('javascript', 'react', 'PREREQUISITE_OF', 0.9, 'JavaScript knowledge required for React'),
    ('javascript', 'vue', 'PREREQUISITE_OF', 0.9, 'JavaScript knowledge required for Vue'),
    ('react', 'redux', 'PREREQUISITE_OF', 0.8, 'React basics needed before Redux'),
    ('html-css', 'responsive-design', 'PREREQUISITE_OF', 0.7, 'CSS fundamentals needed for responsive design'),

    # Backend relationships
    ('javascript', 'nodejs', 'PREREQUISITE_OF', 0.8, 'JavaScript knowledge helps with Node.js'),
    ('python', 'django', 'PREREQUISITE_OF', 0.9, 'Python required for Django'),
    ('python', 'flask', 'PREREQUISITE_OF', 0.9, 'Python required for Flask'),
    ('nodejs', 'express', 'PREREQUISITE_OF', 0.7, 'Node.js knowledge helps with Express'),

    # Database relationships
    ('sql-basics', 'postgresql', 'PREREQUISITE_OF', 0.8, 'SQL basics needed for PostgreSQL'),
    ('sql-basics', 'mysql', 'PREREQUISITE_OF', 0.8, 'SQL basics needed for MySQL'),
    ('javascript', 'mongodb', 'PREREQUISITE_OF', 0.5, 'JavaScript helps with MongoDB queries'),

    # DevOps relationships
    ('linux-basics', 'docker', 'PREREQUISITE_OF', 0.8, 'Linux knowledge helpful for Docker'),
    ('docker', 'kubernetes', 'PREREQUISITE_OF', 0.9, 'Docker required for Kubernetes'),
    ('git', 'ci-cd', 'PREREQUISITE_OF', 0.7, 'Git knowledge needed for CI/CD'),

    # Related competencies (bidirectional)
    ('react', 'vue', 'RELATED_TO', 0.8, 'Similar frontend frameworks'),
    ('postgresql', 'mysql', 'RELATED_TO', 0.9, 'Similar SQL databases'),
    ('docker', 'kubernetes', 'RELATED_TO', 0.8, 'Container technologies'),
    ('django', 'flask', 'RELATED_TO', 0.7, 'Python web frameworks'),

    # Full Stack Developer requirements
    ('html-css', 'full-stack-developer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('javascript', 'full-stack-developer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('react', 'full-stack-developer', 'LEADS_TO_ROLE', 0.9, 'Highly recommended'),
    ('nodejs', 'full-stack-developer', 'LEADS_TO_ROLE', 0.9, 'Highly recommended'),
    ('sql-basics', 'full-stack-developer', 'LEADS_TO_ROLE', 0.8, 'Important'),
    ('git', 'full-stack-developer', 'LEADS_TO_ROLE', 0.9, 'Important'),
    ('rest-api', 'full-stack-developer', 'LEADS_TO_ROLE', 0.9, 'Important'),

    # Frontend Developer requirements
    ('html-css', 'frontend-developer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('javascript', 'frontend-developer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('react', 'frontend-developer', 'LEADS_TO_ROLE', 0.9, 'Highly recommended'),
    ('responsive-design', 'frontend-developer', 'LEADS_TO_ROLE', 0.8, 'Important'),
    ('git', 'frontend-developer', 'LEADS_TO_ROLE', 0.8, 'Important'),

    # Backend Developer requirements
    ('python', 'backend-developer', 'LEADS_TO_ROLE', 0.9, 'Highly recommended'),
    ('nodejs', 'backend-developer', 'LEADS_TO_ROLE', 0.9, 'Highly recommended'),
    ('sql-basics', 'backend-developer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('rest-api', 'backend-developer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('git', 'backend-developer', 'LEADS_TO_ROLE', 0.8, 'Important'),

    # DevOps Engineer requirements
    ('linux-basics', 'devops-engineer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('docker', 'devops-engineer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('kubernetes', 'devops-engineer', 'LEADS_TO_ROLE', 0.9, 'Highly recommended'),
    ('ci-cd', 'devops-engineer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('git', 'devops-engineer', 'LEADS_TO_ROLE', 1.0, 'Required'),
    ('aws', 'devops-engineer', 'LEADS_TO_ROLE', 0.8, 'Important'),
]

def seed_roles():
    """Seed roles collection"""
    print("Seeding roles...")
    roles_ref = db.collection('roles')

    for role in SAMPLE_ROLES:
        role_id = role.pop('id')
        role['created_at'] = datetime.now().isoformat()
        roles_ref.document(role_id).set(role)
        print(f"  ✓ Added role: {role['name']}")

    print(f"✓ Seeded {len(SAMPLE_ROLES)} roles")

def seed_relationships():
    """Seed competency relationships"""
    print("\nSeeding relationships...")
    relationships_ref = db.collection('competency_relationships')

    count = 0
    for source_id, target_id, rel_type, strength, description in SAMPLE_RELATIONSHIPS:
        relationship_id = f"{source_id}_{target_id}_{rel_type}"

        relationship_data = {
            'source_id': source_id,
            'target_id': target_id,
            'type': rel_type,
            'strength': strength,
            'metadata': {
                'description': description
            },
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        relationships_ref.document(relationship_id).set(relationship_data)
        print(f"  ✓ Added: {source_id} -> {target_id} ({rel_type})")

        # Add reverse relationship for RELATED_TO
        if rel_type == 'RELATED_TO':
            reverse_id = f"{target_id}_{source_id}_{rel_type}"
            reverse_data = relationship_data.copy()
            reverse_data['source_id'] = target_id
            reverse_data['target_id'] = source_id
            relationships_ref.document(reverse_id).set(reverse_data)
            print(f"  ✓ Added reverse: {target_id} -> {source_id} ({rel_type})")
            count += 1

        count += 1

    print(f"✓ Seeded {count} relationships")

def verify_competencies():
    """Verify that referenced competencies exist"""
    print("\nVerifying competencies...")
    competencies_ref = db.collection('competencies')

    # Get all unique competency IDs from relationships
    competency_ids = set()
    for source, target, rel_type, _, _ in SAMPLE_RELATIONSHIPS:
        if rel_type != 'LEADS_TO_ROLE':
            competency_ids.add(source)
            competency_ids.add(target)
        else:
            competency_ids.add(source)

    missing = []
    for comp_id in competency_ids:
        doc = competencies_ref.document(comp_id).get()
        if not doc.exists:
            missing.append(comp_id)

    if missing:
        print(f"  ⚠ Warning: {len(missing)} competencies referenced but not in database:")
        for comp_id in missing:
            print(f"    - {comp_id}")
    else:
        print(f"  ✓ All {len(competency_ids)} competencies exist")

    return len(missing) == 0

def main():
    print("=" * 60)
    print("KNOWLEDGE GRAPH DATA SEEDING")
    print("=" * 60)

    try:
        # Verify competencies first
        all_exist = verify_competencies()
        if not all_exist:
            print("\n⚠ Some competencies are missing. Please add them to Firestore first.")
            print("The graph will still be created, but those nodes won't appear.")
            response = input("\nContinue anyway? (y/n): ")
            if response.lower() != 'y':
                print("Seeding cancelled.")
                return

        # Seed data
        seed_roles()
        seed_relationships()

        print("\n" + "=" * 60)
        print("✓ SEEDING COMPLETE!")
        print("=" * 60)
        print("\nYou can now:")
        print("1. View the knowledge graph at: /knowledge-graph")
        print("2. Explore competency relationships")
        print("3. Find learning paths to career roles")
        print("\nAPI Endpoints available:")
        print("  GET  /api/graph/full")
        print("  GET  /api/graph/roles")
        print("  GET  /api/graph/roles/<role_id>/graph")
        print("  POST /api/graph/path-to-role")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
