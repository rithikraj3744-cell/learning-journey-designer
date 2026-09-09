#!/usr/bin/env python3
"""
Knowledge Graph Integration Test
Tests API endpoints and graph functionality
"""

import requests
import json
import sys

API_BASE = 'http://localhost:5000'

def test_health():
    """Test server health"""
    print("Testing server health...")
    try:
        response = requests.get(f'{API_BASE}/health')
        data = response.json()
        assert response.status_code == 200
        assert data['status'] == 'healthy'
        print("  ✓ Server is healthy")
        return True
    except Exception as e:
        print(f"  ✗ Health check failed: {e}")
        return False

def test_full_graph():
    """Test full graph endpoint"""
    print("\nTesting full graph endpoint...")
    try:
        response = requests.get(f'{API_BASE}/api/graph/full')
        data = response.json()
        assert response.status_code == 200
        assert data['success'] == True
        assert 'graph' in data
        assert 'nodes' in data['graph']
        assert 'edges' in data['graph']

        node_count = len(data['graph']['nodes'])
        edge_count = len(data['graph']['edges'])
        print(f"  ✓ Graph loaded: {node_count} nodes, {edge_count} edges")
        return True
    except Exception as e:
        print(f"  ✗ Full graph test failed: {e}")
        return False

def test_roles():
    """Test roles endpoint"""
    print("\nTesting roles endpoint...")
    try:
        response = requests.get(f'{API_BASE}/api/graph/roles')
        data = response.json()
        assert response.status_code == 200
        assert data['success'] == True
        assert 'roles' in data

        role_count = len(data['roles'])
        print(f"  ✓ Found {role_count} roles")

        if role_count > 0:
            print(f"  Roles: {', '.join([r['name'] for r in data['roles']])}")
        return True
    except Exception as e:
        print(f"  ✗ Roles test failed: {e}")
        return False

def test_role_graph():
    """Test role graph endpoint"""
    print("\nTesting role graph endpoint...")
    try:
        # First get a role
        roles_response = requests.get(f'{API_BASE}/api/graph/roles')
        roles = roles_response.json()['roles']

        if not roles:
            print("  ⚠ No roles to test")
            return True

        role_id = roles[0]['id']
        print(f"  Testing with role: {roles[0]['name']}")

        response = requests.get(f'{API_BASE}/api/graph/roles/{role_id}/graph')
        data = response.json()
        assert response.status_code == 200
        assert data['success'] == True
        assert 'graph' in data

        node_count = len(data['graph']['nodes'])
        print(f"  ✓ Role graph loaded: {node_count} nodes")
        return True
    except Exception as e:
        print(f"  ✗ Role graph test failed: {e}")
        return False

def test_path_to_role():
    """Test path finding endpoint"""
    print("\nTesting path-to-role endpoint...")
    try:
        # Get a role first
        roles_response = requests.get(f'{API_BASE}/api/graph/roles')
        roles = roles_response.json()['roles']

        if not roles:
            print("  ⚠ No roles to test")
            return True

        role_id = roles[0]['id']
        print(f"  Testing path to: {roles[0]['name']}")

        # Simulate user with some competencies
        user_competencies = {
            "html-css": 2.0,
            "javascript": 1.5
        }

        response = requests.post(
            f'{API_BASE}/api/graph/path-to-role',
            json={
                'role_id': role_id,
                'user_competencies': user_competencies
            }
        )
        data = response.json()
        assert response.status_code == 200
        assert data['success'] == True
        assert 'path' in data

        gap_count = len(data['path']['gaps'])
        print(f"  ✓ Path found: {gap_count} competency gaps identified")

        if gap_count > 0:
            print("  Gaps:")
            for gap in data['path']['gaps'][:3]:  # Show first 3
                print(f"    - {gap['competency_name']}: {gap['gap']} levels to improve")
        return True
    except Exception as e:
        print(f"  ✗ Path finding test failed: {e}")
        return False

def test_statistics():
    """Test statistics endpoint"""
    print("\nTesting statistics endpoint...")
    try:
        response = requests.get(f'{API_BASE}/api/graph/statistics')
        data = response.json()
        assert response.status_code == 200
        assert data['success'] == True
        assert 'statistics' in data

        stats = data['statistics']
        print(f"  ✓ Statistics:")
        print(f"    - Competencies: {stats.get('competencies', 0)}")
        print(f"    - Relationships: {stats.get('relationships', 0)}")
        print(f"    - Roles: {stats.get('roles', 0)}")
        return True
    except Exception as e:
        print(f"  ✗ Statistics test failed: {e}")
        return False

def test_category_filter():
    """Test category filtering"""
    print("\nTesting category filter...")
    try:
        # Try common category
        category = 'frontend'
        response = requests.get(f'{API_BASE}/api/graph/category/{category}')
        data = response.json()

        if response.status_code == 200 and data['success']:
            node_count = len(data['graph']['nodes'])
            print(f"  ✓ Category '{category}' graph: {node_count} nodes")
            return True
        elif response.status_code == 404:
            print(f"  ⚠ Category '{category}' not found (no competencies)")
            return True
        else:
            print(f"  ✗ Unexpected response: {data}")
            return False
    except Exception as e:
        print(f"  ✗ Category filter test failed: {e}")
        return False

def main():
    print("=" * 60)
    print("KNOWLEDGE GRAPH API TEST SUITE")
    print("=" * 60)
    print(f"Testing API at: {API_BASE}")
    print()

    tests = [
        ("Health Check", test_health),
        ("Full Graph", test_full_graph),
        ("Roles", test_roles),
        ("Role Graph", test_role_graph),
        ("Path Finding", test_path_to_role),
        ("Statistics", test_statistics),
        ("Category Filter", test_category_filter)
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {test_name}")

    print(f"\n{passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Knowledge Graph is working correctly.")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Check the output above.")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
