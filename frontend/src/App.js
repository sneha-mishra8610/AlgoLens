import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import Visualizer from './components/Visualizer';
import { executeCode } from './services/api';
import GraphTraversal from './components/GraphTraversal';

function App() {
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [arraySize, setArraySize] = useState(10);
  const [baseSpeedMs, setBaseSpeedMs] = useState(200);
  const [speedMultiplier, setSpeedMultiplier] = useState(0.8);
  const [mode, setMode] = useState('sorting');
  const [graphAlgo, setGraphAlgo] = useState('BFS');
  const [sortingAlgo, setSortingAlgo] = useState('bubble_sort');
  const [graphText, setGraphText] = useState(`{
  "A": ["B", "C"],
  "B": ["D", "E"],
  "C": ["F"],
  "D": [],
  "E": ["F"],
  "F": []
}`);
  const [startNode, setStartNode] = useState('A');
  const [runToken, setRunToken] = useState(0);
  const [graphNodeCount, setGraphNodeCount] = useState(6);
  const [graphDensity, setGraphDensity] = useState(0.35);

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () =>
    Math.floor(Math.random() * 100) + 10
  );
  setArray(newArray);
    setSteps([]);
    setExecutionResult(null);
  };

  const handleExecute = async (code) => {
    if (mode === 'sorting') {
      if (array.length === 0) {
        alert('Please generate an array first!');
        return;
      }

      setIsLoading(true);
      try {
        const result = await executeCode(code, array);
        
        if (result.success) {
          if (result.default_speed_ms) {
            setBaseSpeedMs(result.default_speed_ms);
          }
          setSteps(result.steps);
          setExecutionResult(result);
        } else {
          alert(`Error: ${result.error}`);
          setExecutionResult(result);
        }
      } catch (error) {
        alert(`Network error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      setRunToken((t) => t + 1);
    }
  };

  return (
    
    <div style={{ 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1400px',
      margin: '0 auto',
      backgroundColor: '#fafafa',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        AlgoLens
      </h1>

      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: 8 }}>Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="sorting">Sorting</option>
            <option value="graphs">Graphs</option>
          </select>
        </div>
      </div>

{mode === 'sorting' && (
  <div style={{ marginBottom: '10px' }}>
    <label>Array Size: {arraySize} </label>
    <input
      type="range"
      min="5"
      max="50"
      value={arraySize}
      onChange={(e) => setArraySize(Number(e.target.value))}
      style={{ width: '200px' }}
    />
  </div>
)}

<div style={{ marginBottom: '20px' }}>
  <label>Playback Speed: {speedMultiplier.toFixed(1)}x </label>
  <input
    type="range"
    min="0.25"
    max="1.25"
    step="0.05"
    value={speedMultiplier}
    onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
    style={{ width: '300px' }}
  />
</div>

{mode === 'sorting' ? (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ marginBottom: 10 }}>
      <label style={{ marginRight: 8 }}>Algorithm</label>
      <select value={sortingAlgo} onChange={(e)=>setSortingAlgo(e.target.value)} style={{ padding: '8px' }}>
        <option value="bubble_sort">Bubble Sort</option>
        <option value="selection_sort">Selection Sort</option>
        <option value="insertion_sort">Insertion Sort</option>
        <option value="merge_sort">Merge Sort</option>
        <option value="quick_sort">Quick Sort</option>
        <option value="radix_sort">Radix Sort</option>
      </select>
    </div>
    <button
      onClick={generateArray}
      style={{
        padding: '10px 20px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Generate Random Array
    </button>
    {array.length > 0 && (
      <p style={{ marginTop: '10px', color: '#444' }}>
        Current Array: [{array.join(', ')}]
      </p>
    )}
  </div>
) : (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
      <div>
        <label style={{ marginRight: 8 }}>Algorithm</label>
        <select value={graphAlgo} onChange={(e) => setGraphAlgo(e.target.value)} style={{ padding: '8px' }}>
          <option value="BFS">BFS</option>
          <option value="DFS">DFS</option>
          <option value="FLOOD_FILL">Flood Fill</option>
          <option value="BIPARTITE">Bipartite Check</option>
        </select>
      </div>
      <div>
        <label style={{ marginRight: 8 }}>Nodes: {graphNodeCount}</label>
        <input type="range" min="3" max="12" value={graphNodeCount} onChange={(e)=>setGraphNodeCount(Number(e.target.value))} />
      </div>
      <div>
        <label style={{ marginRight: 8 }}>Density: {graphDensity.toFixed(2)}</label>
        <input type="range" min="0" max="1" step="0.05" value={graphDensity} onChange={(e)=>setGraphDensity(Number(e.target.value))} />
      </div>
    </div>
    <button
      onClick={() => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const n = Math.max(3, Math.min(26, graphNodeCount));
        const nodes = letters.slice(0, n);
        const adj = Object.fromEntries(nodes.map(nm => [nm, []]));
        
        for (let i = 0; i < n - 1; i++) {
          adj[nodes[i]].push(nodes[i+1]);
          adj[nodes[i+1]].push(nodes[i]);
        }
        
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            if (Math.random() < graphDensity) {
              if (!adj[nodes[i]].includes(nodes[j])) adj[nodes[i]].push(nodes[j]);
              if (!adj[nodes[j]].includes(nodes[i])) adj[nodes[j]].push(nodes[i]);
            }
          }
        }
        
        Object.keys(adj).forEach(k => adj[k].sort());
        const txt = JSON.stringify(adj, null, 2);
        setGraphText(txt);
        setStartNode(nodes[0]);
      }}
      style={{
        padding: '10px 20px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Generate Random Graph
    </button>
    <p style={{ marginTop: '10px', color: '#444' }}>Start node: {startNode}</p>
  </div>
)}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>

        <div>
          <CodeEditor onExecute={handleExecute} mode={mode === 'sorting' ? 'sorting' : 'graph'} selectedExample={mode==='sorting' ? sortingAlgo : undefined} />
          
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            {mode === 'sorting' && (
              <p style={{ marginTop: '0px' }}>
                Use the slider above to slow down or speed up playback. You can regenerate the array with the top button anytime.
              </p>
            )}
          </div>
        </div>

        <div>
          {mode === 'sorting' ? (
            <Visualizer 
              steps={steps}
              isLoading={isLoading}
              result={executionResult}
              delayMs={Math.max(50, Math.round(baseSpeedMs / speedMultiplier))}
              speedMultiplier={speedMultiplier}
              onSpeedMultiplierChange={setSpeedMultiplier}
            />
          ) : (
            <GraphTraversal
              compact
              externalConfig={{ graphText, startNode, mode: graphAlgo, runToken }}
              externalSpeedMultiplier={speedMultiplier}
              onGraphTextChange={setGraphText}
              onStartNodeChange={setStartNode}
            />
          )}
        </div>
      </div>
    </div>
    
  );
}

export default App;