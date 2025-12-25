import React, { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { getExamples } from '../services/api';

SyntaxHighlighter.registerLanguage('python', python);

function CodeEditor({ onExecute, mode = 'sorting', selectedExample: selectedExampleProp }) {
  const [code, setCode] = useState('');
  const [examples, setExamples] = useState({});
  const [selectedKey, setSelectedKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExamples = async () => {
      try {
        const data = await getExamples();
        setExamples(data);

        const fallback = Object.keys(data)[0] || '';
        const initialExample = selectedExampleProp || (data.bubble_sort ? 'bubble_sort' : fallback);
        if (initialExample && data[initialExample]) {
          setSelectedKey(initialExample);
          setCode(data[initialExample]);
        }
      } catch (err) {
        setError('Failed to load examples');
      }
    };

    loadExamples();
  }, []);

  useEffect(() => {
    if (!selectedExampleProp) return;
    if (!examples || !examples[selectedExampleProp]) return;
    setSelectedKey(selectedExampleProp);
    setCode(examples[selectedExampleProp] || '');
  }, [selectedExampleProp, examples]);

  const handleExecute = () => {
    setError('');
    onExecute(code);
  };

  const loadExample = (exampleName) => {
    setSelectedKey(exampleName);
    setCode(examples[exampleName] || '');
    setError('');
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      marginBottom: '20px'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <h3>{mode === 'sorting' ? 'Sorting Algorithm Editor' : mode === 'searching' ? 'Searching Algorithm Editor' : 'Algorithm Editor'}</h3>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          width: '100%',
          height: '300px',
          fontFamily: 'monospace',
          fontSize: '14px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          resize: 'vertical'
        }}
        placeholder={mode === 'searching' ? 'Write or tweak the searching algorithm...' : 'Write your sorting algorithm here...'}
      />

      <div style={{ marginTop: '15px' }}>
        <button
          onClick={handleExecute}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {mode === 'sorting' ? 'Execute & Visualize' : mode === 'searching' ? 'Execute Search' : 'Run Traversal'}
        </button>
      </div>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '5px',
          color: '#c62828'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <details style={{ marginTop: '15px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          Preview (Syntax Highlighted)
        </summary>
        <SyntaxHighlighter language="python" style={docco}>
          {code}
        </SyntaxHighlighter>
      </details>
    </div>
  );
}

export default CodeEditor;