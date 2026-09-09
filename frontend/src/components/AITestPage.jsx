import { useState } from 'react';
import aiService from '../services/aiService';

function AITestPage() {
  const [concept, setConcept] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await aiService.explainConcept(concept, 'beginner');
      setResult(response.explanation);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🤖 AI Backend Test</h1>

      <div style={{ marginTop: '2rem' }}>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Enter a concept (e.g., Machine Learning)"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #ddd',
            borderRadius: '8px'
          }}
        />

        <button
          onClick={testAI}
          disabled={loading || !concept}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Getting Explanation...' : 'Explain Concept'}
        </button>
      </div>

      {result && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          borderLeft: '4px solid #4299e1'
        }}>
          <h3>AI Response:</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}

export default AITestPage;
