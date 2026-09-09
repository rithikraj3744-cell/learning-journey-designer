#!/usr/bin/env python3
"""
End-to-End Test Suite for Learning Path Generator
Tests the complete flow from generation to progress tracking
"""

import requests
import json
import time
from datetime import datetime

API_BASE_URL = "http://localhost:5000/api"
TEST_USER_ID = "test-user-e2e"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name):
    print(f"\n{Colors.BLUE}▶ Testing: {name}{Colors.END}")

def log_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def log_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def log_info(message):
    print(f"{Colors.YELLOW}ℹ {message}{Colors.END}")

def test_health_check():
    """Test server health endpoint"""
    log_test("Server Health Check")
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api', '')}/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        log_success(f"Server healthy, Firebase: {data.get('firebase', 'unknown')}")
        return True
    except Exception as e:
        log_error(f"Health check failed: {e}")
        return False

def test_get_competencies():
    """Test fetching competencies"""
    log_test("Get Competencies")
    try:
        response = requests.get(f"{API_BASE_URL}/competencies")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert 'competencies' in data

        comp_count = len(data['competencies'])
        log_success(f"Fetched {comp_count} competencies")

        if comp_count > 0:
            # Show sample competency
            sample = list(data['competencies'].items())[0]
            log_info(f"Sample: {sample[0]} -> {sample[1].get('name', 'N/A')}")

        return data['competencies']
    except Exception as e:
        log_error(f"Failed to fetch competencies: {e}")
        return None

def test_generate_path(competencies):
    """Test learning path generation"""
    log_test("Generate Learning Path")

    if not competencies or len(competencies) == 0:
        log_error("No competencies available for testing")
        return None

    # Select first 2-3 competencies as targets
    target_comps = list(competencies.keys())[:3]

    payload = {
        "userId": TEST_USER_ID,
        "targetCompetencies": target_comps,
        "timeAvailable": 15,
        "preferences": {
            "learningStyle": "visual",
            "preferredResourceTypes": ["video", "course", "tutorial"]
        }
    }

    log_info(f"Generating path for: {', '.join(target_comps)}")

    try:
        response = requests.post(
            f"{API_BASE_URL}/generate-path",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code in [200, 201]
        data = response.json()
        assert data['success'] == True
        assert 'pathId' in data
        assert 'path' in data

        path = data['path']
        log_success(f"Path generated: {path['name']}")
        log_info(f"Path ID: {data['pathId']}")
        log_info(f"Steps: {len(path.get('steps', []))}")
        log_info(f"Duration: {path.get('totalDuration', 0)} hours")
        log_info(f"Estimated weeks: {path.get('estimatedWeeks', 0):.1f}")

        return data['pathId'], path
    except Exception as e:
        log_error(f"Path generation failed: {e}")
        if hasattr(e, 'response'):
            log_error(f"Response: {e.response.text}")
        return None, None

def test_get_user_paths():
    """Test fetching user's paths"""
    log_test("Get User Paths")
    try:
        response = requests.get(f"{API_BASE_URL}/paths/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert 'paths' in data

        path_count = len(data['paths'])
        log_success(f"User has {path_count} learning path(s)")

        for i, path in enumerate(data['paths'][:3], 1):
            log_info(f"  {i}. {path['name']} - {path['status']} ({path.get('progress', 0):.0f}%)")

        return data['paths']
    except Exception as e:
        log_error(f"Failed to fetch user paths: {e}")
        return None

def test_get_single_path(path_id):
    """Test fetching a specific path"""
    log_test("Get Single Path")
    try:
        response = requests.get(f"{API_BASE_URL}/path/{path_id}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert 'path' in data

        path = data['path']
        log_success(f"Retrieved path: {path['name']}")
        log_info(f"Status: {path['status']}")
        log_info(f"Progress: {path.get('progress', 0):.0f}%")
        log_info(f"Steps: {len(path.get('steps', []))}")

        return path
    except Exception as e:
        log_error(f"Failed to fetch path: {e}")
        return None

def test_update_progress(path_id, path):
    """Test updating step progress"""
    log_test("Update Step Progress")

    if not path or not path.get('steps'):
        log_error("No steps available to update")
        return False

    # Mark first step as completed
    first_step = path['steps'][0]
    step_number = first_step['stepNumber']

    payload = {
        "stepNumber": step_number,
        "status": "completed",
        "progress": 100
    }

    log_info(f"Marking step {step_number} as completed: {first_step['competencyName']}")

    try:
        response = requests.put(
            f"{API_BASE_URL}/paths/{path_id}/progress",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True

        log_success(f"Step completed! Overall progress: {data.get('progress', 0):.1f}%")
        log_info(f"Path status: {data.get('status', 'unknown')}")

        return True
    except Exception as e:
        log_error(f"Failed to update progress: {e}")
        return False

def test_complete_multiple_steps(path_id, path):
    """Test completing multiple steps"""
    log_test("Complete Multiple Steps")

    if not path or not path.get('steps'):
        log_error("No steps available")
        return False

    steps_to_complete = min(3, len(path['steps']))
    log_info(f"Completing {steps_to_complete} steps...")

    for i in range(steps_to_complete):
        step = path['steps'][i]
        payload = {
            "stepNumber": step['stepNumber'],
            "status": "completed",
            "progress": 100
        }

        try:
            response = requests.put(
                f"{API_BASE_URL}/paths/{path_id}/progress",
                json=payload
            )

            if response.status_code == 200:
                data = response.json()
                log_success(f"  Step {step['stepNumber']}: {step['competencyName']} ✓ (Progress: {data.get('progress', 0):.1f}%)")
            else:
                log_error(f"  Failed to complete step {step['stepNumber']}")

            time.sleep(0.2)  # Small delay between updates
        except Exception as e:
            log_error(f"Error updating step {step['stepNumber']}: {e}")

    return True

def test_delete_path(path_id):
    """Test deleting a learning path"""
    log_test("Delete Learning Path")
    try:
        response = requests.delete(f"{API_BASE_URL}/paths/{path_id}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True

        log_success(f"Path deleted successfully")
        return True
    except Exception as e:
        log_error(f"Failed to delete path: {e}")
        return False

def run_full_test_suite():
    """Run complete end-to-end test suite"""
    print("=" * 60)
    print(f"{Colors.BLUE}Learning Path Generator - E2E Test Suite{Colors.END}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    results = {
        'passed': 0,
        'failed': 0,
        'total': 0
    }

    def record_result(success):
        results['total'] += 1
        if success:
            results['passed'] += 1
        else:
            results['failed'] += 1

    # Test 1: Health Check
    record_result(test_health_check())
    time.sleep(0.5)

    # Test 2: Get Competencies
    competencies = test_get_competencies()
    record_result(competencies is not None)
    time.sleep(0.5)

    if not competencies:
        log_error("Cannot continue without competencies. Ensure Firestore has data.")
        print_results(results)
        return

    # Test 3: Generate Path
    path_id, path = test_generate_path(competencies)
    record_result(path_id is not None)
    time.sleep(1)

    if not path_id:
        log_error("Cannot continue without generated path")
        print_results(results)
        return

    # Test 4: Get User Paths
    user_paths = test_get_user_paths()
    record_result(user_paths is not None)
    time.sleep(0.5)

    # Test 5: Get Single Path
    retrieved_path = test_get_single_path(path_id)
    record_result(retrieved_path is not None)
    time.sleep(0.5)

    # Test 6: Update Progress (single step)
    if retrieved_path:
        record_result(test_update_progress(path_id, retrieved_path))
        time.sleep(0.5)

        # Test 7: Complete Multiple Steps
        record_result(test_complete_multiple_steps(path_id, retrieved_path))
        time.sleep(0.5)

    # Test 8: Verify Progress Persistence
    final_path = test_get_single_path(path_id)
    record_result(final_path is not None and final_path.get('progress', 0) > 0)
    time.sleep(0.5)

    # Test 9: Delete Path (cleanup)
    record_result(test_delete_path(path_id))

    print_results(results)

def print_results(results):
    """Print test results summary"""
    print("\n" + "=" * 60)
    print(f"{Colors.BLUE}Test Results{Colors.END}")
    print("=" * 60)
    print(f"Total Tests: {results['total']}")
    print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.END}")
    print(f"{Colors.RED}Failed: {results['failed']}{Colors.END}")

    success_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")

    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}🎉 All tests passed!{Colors.END}")
    else:
        print(f"\n{Colors.RED}⚠️  Some tests failed. Check logs above.{Colors.END}")

    print("=" * 60)

if __name__ == "__main__":
    try:
        run_full_test_suite()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.END}")
    except Exception as e:
        log_error(f"Test suite failed: {e}")
