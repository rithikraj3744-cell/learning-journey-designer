"""
Flask API - Resource Management Extension for app_dev.py
Add these endpoints to your app_dev.py file
"""

# Add to your existing app_dev.py after the seed_sample_data() function

# Global storage for resources (add to top with other stores)
resources_library_store = {}
user_library_store = {}  # userId -> {resourceId: {status, dateAdded, dateCompleted, timeSpent}}
resource_reviews_store = {}  # resourceId -> [reviews]

def seed_resources_library():
    """Seed comprehensive resource library"""
    global resources_library_store

    resources_library_store = {
        'res-html-1': {
            'id': 'res-html-1',
            'title': 'HTML & CSS Crash Course',
            'type': 'video',
            'description': 'Complete beginner-friendly tutorial covering HTML5 and CSS3 fundamentals, layouts, responsive design, and modern best practices.',
            'url': 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
            'duration': '4 hours',
            'difficulty': 'beginner',
            'competencies': ['html-css'],
            'provider': 'YouTube',
            'rating': 4.7,
            'reviewCount': 2341,
            'thumbnail': 'https://via.placeholder.com/300x200?text=HTML+CSS'
        },
        'res-html-2': {
            'id': 'res-html-2',
            'title': 'Modern HTML & CSS for Beginners',
            'type': 'course',
            'description': 'Step-by-step course with hands-on projects. Learn Flexbox, Grid, responsive design, and modern CSS techniques.',
            'url': 'https://www.udemy.com/course/modern-html-css-from-the-beginning/',
            'duration': '21 hours',
            'difficulty': 'beginner',
            'competencies': ['html-css'],
            'provider': 'Udemy',
            'rating': 4.8,
            'reviewCount': 15620,
            'thumbnail': 'https://via.placeholder.com/300x200?text=HTML+Course'
        },
        'res-js-1': {
            'id': 'res-js-1',
            'title': 'JavaScript Algorithms and Data Structures',
            'type': 'course',
            'description': 'Free comprehensive course covering JavaScript basics, ES6, algorithms, data structures, OOP, and functional programming.',
            'url': 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
            'duration': '300 hours',
            'difficulty': 'beginner',
            'competencies': ['javascript'],
            'provider': 'freeCodeCamp',
            'rating': 4.9,
            'reviewCount': 8934,
            'thumbnail': 'https://via.placeholder.com/300x200?text=JavaScript+Course'
        },
        'res-js-2': {
            'id': 'res-js-2',
            'title': 'JavaScript: Understanding the Weird Parts',
            'type': 'video',
            'description': 'Deep dive into JavaScript internals, closures, prototypes, execution context, and advanced concepts.',
            'url': 'https://www.youtube.com/watch?v=Bv_5Zv5c-Ts',
            'duration': '11 hours',
            'difficulty': 'intermediate',
            'competencies': ['javascript'],
            'provider': 'Udemy',
            'rating': 4.8,
            'reviewCount': 5234,
            'thumbnail': 'https://via.placeholder.com/300x200?text=JS+Advanced'
        },
        'res-js-3': {
            'id': 'res-js-3',
            'title': 'JavaScript30 - 30 Day Challenge',
            'type': 'tutorial',
            'description': 'Build 30 things in 30 days with vanilla JavaScript. No frameworks, no libraries, no compilers.',
            'url': 'https://javascript30.com/',
            'duration': '30 hours',
            'difficulty': 'intermediate',
            'competencies': ['javascript'],
            'provider': 'Wes Bos',
            'rating': 4.9,
            'reviewCount': 3421,
            'thumbnail': 'https://via.placeholder.com/300x200?text=JS30'
        },
        'res-react-1': {
            'id': 'res-react-1',
            'title': 'Official React Documentation',
            'type': 'article',
            'description': 'Official React docs with interactive tutorials, comprehensive guides, and API reference.',
            'url': 'https://react.dev/learn',
            'duration': '20 hours',
            'difficulty': 'intermediate',
            'competencies': ['react', 'javascript'],
            'provider': 'React Team',
            'rating': 4.8,
            'reviewCount': 6721,
            'thumbnail': 'https://via.placeholder.com/300x200?text=React+Docs'
        },
        'res-react-2': {
            'id': 'res-react-2',
            'title': 'React - The Complete Guide',
            'type': 'course',
            'description': 'Comprehensive React course covering hooks, context, Redux, Next.js, TypeScript, and advanced patterns.',
            'url': 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
            'duration': '49 hours',
            'difficulty': 'intermediate',
            'competencies': ['react', 'javascript'],
            'provider': 'Udemy',
            'rating': 4.7,
            'reviewCount': 12453,
            'thumbnail': 'https://via.placeholder.com/300x200?text=React+Complete'
        },
        'res-node-1': {
            'id': 'res-node-1',
            'title': 'Node.js Tutorial for Beginners',
            'type': 'video',
            'description': 'Full Node.js course covering basics, Express, MongoDB, REST APIs, authentication, and deployment.',
            'url': 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
            'duration': '3 hours',
            'difficulty': 'beginner',
            'competencies': ['nodejs', 'javascript'],
            'provider': 'Programming with Mosh',
            'rating': 4.8,
            'reviewCount': 4532,
            'thumbnail': 'https://via.placeholder.com/300x200?text=Node+Tutorial'
        },
        'res-node-2': {
            'id': 'res-node-2',
            'title': 'Node.js Official Learning Path',
            'type': 'article',
            'description': 'Official Node.js documentation and learning resources from getting started to advanced topics.',
            'url': 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
            'duration': '15 hours',
            'difficulty': 'intermediate',
            'competencies': ['nodejs', 'javascript'],
            'provider': 'Node.js Foundation',
            'rating': 4.6,
            'reviewCount': 2134,
            'thumbnail': 'https://via.placeholder.com/300x200?text=Node+Docs'
        },
        'res-ts-1': {
            'id': 'res-ts-1',
            'title': 'TypeScript Handbook',
            'type': 'article',
            'description': 'Official TypeScript documentation covering types, interfaces, generics, decorators, and best practices.',
            'url': 'https://www.typescriptlang.org/docs/handbook/intro.html',
            'duration': '12 hours',
            'difficulty': 'intermediate',
            'competencies': ['typescript', 'javascript'],
            'provider': 'Microsoft',
            'rating': 4.7,
            'reviewCount': 3214,
            'thumbnail': 'https://via.placeholder.com/300x200?text=TypeScript+Docs'
        },
        'res-ts-2': {
            'id': 'res-ts-2',
            'title': 'TypeScript Fundamentals',
            'type': 'course',
            'description': 'Learn TypeScript from scratch with practical examples and projects.',
            'url': 'https://frontendmasters.com/courses/typescript-v3/',
            'duration': '5 hours',
            'difficulty': 'intermediate',
            'competencies': ['typescript', 'javascript'],
            'provider': 'Frontend Masters',
            'rating': 4.9,
            'reviewCount': 1876,
            'thumbnail': 'https://via.placeholder.com/300x200?text=TS+Course'
        },
        'res-python-1': {
            'id': 'res-python-1',
            'title': 'Python for Everybody',
            'type': 'course',
            'description': 'Free comprehensive Python course covering basics, data structures, web scraping, databases, and data visualization.',
            'url': 'https://www.py4e.com/',
            'duration': '60 hours',
            'difficulty': 'beginner',
            'competencies': ['python'],
            'provider': 'University of Michigan',
            'rating': 4.8,
            'reviewCount': 9234,
            'thumbnail': 'https://via.placeholder.com/300x200?text=Python+Course'
        },
        'res-python-2': {
            'id': 'res-python-2',
            'title': 'Python Getting Started',
            'type': 'article',
            'description': 'Official Python tutorial and documentation for beginners.',
            'url': 'https://www.python.org/about/gettingstarted/',
            'duration': '8 hours',
            'difficulty': 'beginner',
            'competencies': ['python'],
            'provider': 'Python.org',
            'rating': 4.6,
            'reviewCount': 3421,
            'thumbnail': 'https://via.placeholder.com/300x200?text=Python+Docs'
        },
        'res-python-3': {
            'id': 'res-python-3',
            'title': '100 Days of Code: Python',
            'type': 'course',
            'description': 'Master Python by building 100 projects in 100 days. From beginner to professional.',
            'url': 'https://www.udemy.com/course/100-days-of-code/',
            'duration': '60 hours',
            'difficulty': 'beginner',
            'competencies': ['python'],
            'provider': 'Udemy',
            'rating': 4.7,
            'reviewCount': 15234,
            'thumbnail': 'https://via.placeholder.com/300x200?text=100+Days+Python'
        }
    }

# Call this in the __main__ section after seed_sample_data()
# seed_resources_library()

# API Endpoints to add to app_dev.py

@app.route('/api/resources', methods=['GET'])
def get_all_resources():
    """Get all resources with optional filtering, search, and sorting"""
    try:
        # Get query parameters
        competency = request.args.get('competency')
        resource_type = request.args.get('type')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search', '').lower()
        sort_by = request.args.get('sortBy', 'rating')  # rating, duration, title

        # Start with all resources
        filtered_resources = list(resources_library_store.values())

        # Apply filters
        if competency:
            filtered_resources = [r for r in filtered_resources if competency in r.get('competencies', [])]

        if resource_type:
            filtered_resources = [r for r in filtered_resources if r.get('type') == resource_type]

        if difficulty:
            filtered_resources = [r for r in filtered_resources if r.get('difficulty') == difficulty]

        # Apply search
        if search:
            filtered_resources = [
                r for r in filtered_resources
                if search in r.get('title', '').lower() or search in r.get('description', '').lower()
            ]

        # Apply sorting
        if sort_by == 'rating':
            filtered_resources.sort(key=lambda x: x.get('rating', 0), reverse=True)
        elif sort_by == 'duration':
            # Extract numeric value from duration string for sorting
            def duration_key(resource):
                duration_str = resource.get('duration', '0 hours')
                try:
                    return int(duration_str.split()[0])
                except:
                    return 0
            filtered_resources.sort(key=duration_key)
        elif sort_by == 'title':
            filtered_resources.sort(key=lambda x: x.get('title', ''))

        return jsonify({
            'success': True,
            'resources': filtered_resources,
            'count': len(filtered_resources)
        }), 200

    except Exception as e:
        print(f"Error fetching resources: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/resources/<resource_id>', methods=['GET'])
def get_resource_detail(resource_id):
    """Get detailed information about a specific resource"""
    try:
        resource = resources_library_store.get(resource_id)

        if not resource:
            return jsonify({'success': False, 'error': 'Resource not found'}), 404

        # Get reviews for this resource
        reviews = resource_reviews_store.get(resource_id, [])

        # Calculate average rating from reviews
        if reviews:
            avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
        else:
            avg_rating = resource.get('rating', 0)

        resource_detail = {
            **resource,
            'averageRating': round(avg_rating, 1),
            'reviewCount': len(reviews),
            'reviews': reviews[-10:]  # Last 10 reviews
        }

        return jsonify({
            'success': True,
            'resource': resource_detail
        }), 200

    except Exception as e:
        print(f"Error fetching resource detail: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/resources/<resource_id>/reviews', methods=['POST'])
def add_resource_review(resource_id):
    """Add a review for a resource"""
    try:
        data = request.get_json()

        user_id = data.get('userId', 'demo-user')
        rating = data.get('rating')
        review_text = data.get('review', '')

        if not rating or rating < 1 or rating > 5:
            return jsonify({'success': False, 'error': 'Rating must be between 1 and 5'}), 400

        # Create review object
        review = {
            'id': str(uuid.uuid4()),
            'userId': user_id,
            'resourceId': resource_id,
            'rating': rating,
            'review': review_text,
            'createdAt': datetime.now().isoformat(),
            'userName': 'Demo User'  # In production, fetch from user profile
        }

        # Add to reviews store
        if resource_id not in resource_reviews_store:
            resource_reviews_store[resource_id] = []

        resource_reviews_store[resource_id].append(review)

        # Calculate new average rating
        reviews = resource_reviews_store[resource_id]
        avg_rating = sum(r['rating'] for r in reviews) / len(reviews)

        return jsonify({
            'success': True,
            'review': review,
            'averageRating': round(avg_rating, 1),
            'reviewCount': len(reviews)
        }), 201

    except Exception as e:
        print(f"Error adding review: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/user-library/<user_id>', methods=['GET'])
def get_user_library(user_id):
    """Get user's resource library (bookmarked, in-progress, completed)"""
    try:
        user_library = user_library_store.get(user_id, {})

        # Organize by status
        library = {
            'bookmarked': [],
            'inProgress': [],
            'completed': []
        }

        for resource_id, tracking in user_library.items():
            resource = resources_library_store.get(resource_id)
            if resource:
                resource_with_tracking = {
                    **resource,
                    'trackingStatus': tracking['status'],
                    'dateAdded': tracking.get('dateAdded'),
                    'dateCompleted': tracking.get('dateCompleted'),
                    'timeSpent': tracking.get('timeSpent', 0)
                }

                if tracking['status'] == 'bookmarked':
                    library['bookmarked'].append(resource_with_tracking)
                elif tracking['status'] == 'in-progress':
                    library['inProgress'].append(resource_with_tracking)
                elif tracking['status'] == 'completed':
                    library['completed'].append(resource_with_tracking)

        return jsonify({
            'success': True,
            'library': library
        }), 200

    except Exception as e:
        print(f"Error fetching user library: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/user-library', methods=['POST'])
def update_user_library():
    """Add or update a resource in user's library"""
    try:
        data = request.get_json()

        user_id = data.get('userId', 'demo-user')
        resource_id = data.get('resourceId')
        status = data.get('status')  # bookmarked, in-progress, completed
        time_spent = data.get('timeSpent', 0)

        if not resource_id or not status:
            return jsonify({'success': False, 'error': 'resourceId and status required'}), 400

        # Initialize user library if doesn't exist
        if user_id not in user_library_store:
            user_library_store[user_id] = {}

        # Create or update tracking entry
        tracking = {
            'status': status,
            'dateAdded': datetime.now().isoformat(),
            'timeSpent': time_spent
        }

        if status == 'completed':
            tracking['dateCompleted'] = datetime.now().isoformat()

        user_library_store[user_id][resource_id] = tracking

        return jsonify({
            'success': True,
            'message': f'Resource {status}',
            'tracking': tracking
        }), 200

    except Exception as e:
        print(f"Error updating user library: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
