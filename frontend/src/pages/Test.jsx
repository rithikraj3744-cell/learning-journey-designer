import { useEffect } from 'react'

function Test() {
  useEffect(() => {
    console.log('Test page loaded successfully!')
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        ✅ Frontend is Working!
      </h1>

      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>System Status:</h2>
        <ul>
          <li>✅ React is running</li>
          <li>✅ Vite dev server is active</li>
          <li>✅ Routing is configured</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Next Steps:</h3>
        <p>Try navigating to:</p>
        <ul>
          <li><a href="/path-generator" style={{ color: '#2563eb' }}>Path Generator</a></li>
          <li><a href="/dashboard" style={{ color: '#2563eb' }}>Dashboard</a></li>
          <li><a href="/my-paths" style={{ color: '#2563eb' }}>My Paths</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
        <strong>Backend Status:</strong>
        <p>Backend should be running at: <code>http://localhost:5000</code></p>
        <button
          onClick={() => {
            fetch('http://localhost:5000/health')
              .then(r => r.json())
              .then(data => alert('Backend connected! ' + JSON.stringify(data)))
              .catch(err => alert('Backend error: ' + err.message))
          }}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Test Backend Connection
        </button>
      </div>
    </div>
  )
}

export default Test
