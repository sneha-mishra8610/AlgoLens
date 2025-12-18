import React, { useEffect, useMemo, useState } from 'react';
import GraphRenderer from './GraphRenderer';

const DEFAULT_GRAPH = `{
  "A": ["B", "C"],
  "B": ["D", "E"],
  "C": ["F"],
  "D": [],
  "E": ["F"],
  "F": []
}`;

const BASE_DELAY_MS = 900;

function snapshot(visited, frontier, current, action) {
  return {
    visited: [...visited],
    frontier: [...frontier],
    current,
    action,
  };
}

function buildBfsSteps(graph, start) {
  if (!start) throw new Error('Start node is required');
  if (!graph[start]) throw new Error(`Start node "${start}" not found in graph`);

  const steps = [];
  const visited = new Set();
  const queue = [start];
  steps.push(snapshot(visited, queue, null, 'init'));

  while (queue.length) {
    const node = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    steps.push(snapshot(visited, queue, node, 'visit'));

    const neighbors = graph[node] || [];
    for (const nb of neighbors) {
      if (!visited.has(nb) && !queue.includes(nb)) {
        queue.push(nb);
      }
    }
    steps.push(snapshot(visited, queue, node, 'frontier'));
  }

  steps.push(snapshot(visited, [], null, 'done'));
  return steps;
}

function buildDfsSteps(graph, start) {
  if (!start) throw new Error('Start node is required');
  if (!graph[start]) throw new Error(`Start node "${start}" not found in graph`);

  const steps = [];
  const visited = new Set();
  const stack = [start];
  steps.push(snapshot(visited, stack, null, 'init'));

  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    steps.push(snapshot(visited, stack, node, 'visit'));

    const neighbors = graph[node] || [];
    // Push in reverse to keep left-to-right order when popping
    for (let i = neighbors.length - 1; i >= 0; i -= 1) {
      const nb = neighbors[i];
      if (!visited.has(nb) && !stack.includes(nb)) {
        stack.push(nb);
      }
    }
    steps.push(snapshot(visited, stack, node, 'frontier'));
  }

  steps.push(snapshot(visited, [], null, 'done'));
  return steps;
}

function buildFloodFillSteps(graph, start) {
  return buildBfsSteps(graph, start);
}

function buildBipartiteSteps(graph, start) {
  const steps = [];
  const color = {};
  const visited = new Set();
  const queue = [start];
  steps.push({ visited: [], frontier: [...queue], current: null, action: 'init', colors: { ...color }, bipartite: true });

  const nodes = Object.keys(graph);
  const enqueue = (n) => { if (!visited.has(n)) queue.push(n); };

  while (queue.length) {
    const u = queue.shift();
    if (!visited.has(u)) {
      if (color[u] === undefined) color[u] = 0;
      visited.add(u);
      steps.push({ visited: [...visited], frontier: [...queue], current: u, action: 'visit', colors: { ...color }, bipartite: true });
      for (const v of graph[u] || []) {
        if (color[v] === undefined) {
          color[v] = 1 - color[u];
          enqueue(v);
        } else if (color[v] === color[u]) {
          steps.push({ visited: [...visited], frontier: [...queue], current: u, action: 'conflict', colors: { ...color }, bipartite: false });
          steps.push({ visited: [...visited], frontier: [], current: null, action: 'done', colors: { ...color }, bipartite: false });
          return steps;
        }
      }
      steps.push({ visited: [...visited], frontier: [...queue], current: u, action: 'frontier', colors: { ...color }, bipartite: true });
    }
    if (queue.length === 0) {
      // Try to find any unvisited node to ensure full graph check
      const rem = nodes.find((n) => !visited.has(n));
      if (rem) enqueue(rem);
    }
  }
  steps.push({ visited: [...visited], frontier: [], current: null, action: 'done', colors: { ...color }, bipartite: true });
  return steps;
}

function parseGraph(text) {
  const graph = JSON.parse(text);
  if (typeof graph !== 'object' || Array.isArray(graph) || graph === null) {
    throw new Error('Graph must be a JSON object mapping nodes to neighbor arrays');
  }
  Object.entries(graph).forEach(([node, neighbors]) => {
    if (!Array.isArray(neighbors)) {
      throw new Error(`Neighbors for ${node} must be an array`);
    }
    neighbors.forEach((n) => {
      if (typeof n !== 'string') {
        throw new Error('All node names must be strings');
      }
    });
  });
  return graph;
}

function PillList({ title, items, color }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{title}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {items.length === 0 && <span style={{ color: '#888' }}>Empty</span>}
        {items.map((item) => (
          <span
            key={`${title}-${item}`}
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: color,
              color: '#fff',
              fontSize: '12px',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function GraphTraversal({
  compact = false,
  externalConfig, // { graphText, startNode, mode: 'BFS'|'DFS', runToken }
  externalSpeedMultiplier,
  onError,
  onGraphTextChange,
  onStartNodeChange,
}) {
  const [graphText, setGraphText] = useState(DEFAULT_GRAPH);
  const [startNode, setStartNode] = useState('A');
  const [mode, setMode] = useState('BFS');
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(0.8);
  const [error, setError] = useState('');

  const effectiveMultiplier = externalSpeedMultiplier ?? speedMultiplier;
  const delayMs = useMemo(
    () => Math.max(150, Math.round(BASE_DELAY_MS / effectiveMultiplier)),
    [effectiveMultiplier]
  );

  useEffect(() => {
    if (!playing) return undefined;
    if (steps.length === 0) return undefined;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setStepIndex((idx) => Math.min(steps.length - 1, idx + 1));
    }, delayMs);
    return () => clearTimeout(timer);
  }, [playing, stepIndex, steps, delayMs]);

  const currentStep = steps[stepIndex] || { visited: [], frontier: [], current: null, action: 'init' };

  const runTraversal = () => {
    try {
      setError('');
      const cfgGraphText = externalConfig?.graphText ?? graphText;
      const cfgStart = externalConfig?.startNode ?? startNode;
      const cfgMode = externalConfig?.mode ?? mode;
      const graph = parseGraph(cfgGraphText);
      let builder = buildBfsSteps;
      if (cfgMode === 'DFS') builder = buildDfsSteps;
      else if (cfgMode === 'FLOOD_FILL') builder = buildFloodFillSteps;
      else if (cfgMode === 'BIPARTITE') builder = buildBipartiteSteps;
      const newSteps = builder(graph, cfgStart.trim());
      setSteps(newSteps);
      setStepIndex(0);
      setPlaying(true);
      onError && onError('');
    } catch (e) {
      setPlaying(false);
      setSteps([]);
      setStepIndex(0);
      setError(e.message);
      onError && onError(e.message);
    }
  };

  // Respond to external run token
  useEffect(() => {
    if (!externalConfig) return;
    if (externalConfig.runToken === undefined) return;
    runTraversal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalConfig?.runToken]);

  const statusLabel = () => {
    if (currentStep.action === 'init') return 'Ready';
    if (currentStep.action === 'visit') return `Visiting ${currentStep.current}`;
    if (currentStep.action === 'frontier') return 'Frontier updated';
    if (currentStep.action === 'done') return 'Done';
    return '';
  };

  return (
    <div style={{
      marginTop: '30px',
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0 }}>Graph Traversal Visualizer</h2>
      {/* Top adjacency + start node section (always visible) */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Adjacency List (JSON)</label>
          <textarea
            value={externalConfig?.graphText ?? graphText}
            onChange={(e) => {
              if (externalConfig && onGraphTextChange) onGraphTextChange(e.target.value);
              else setGraphText(e.target.value);
            }}
            rows={compact ? 6 : 8}
            style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Start Node</label>
          <input
            value={externalConfig?.startNode ?? startNode}
            onChange={(e) => {
              if (externalConfig && onStartNodeChange) onStartNodeChange(e.target.value);
              else setStartNode(e.target.value);
            }}
            style={{ padding: '8px', width: '160px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>
      </div>
      {!compact && (
        <>
          <p style={{ color: '#555' }}>
            Paste an adjacency list (JSON), pick a start node, and run BFS or DFS. Watch visited nodes and queue/stack evolution.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Adjacency List (JSON)</label>
              <textarea
                value={graphText}
                onChange={(e) => setGraphText(e.target.value)}
                rows={10}
                style={{ width: '100%', fontFamily: 'monospace', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Start Node</label>
                <input
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  style={{ padding: '8px', width: '120px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Algorithm</label>
                <button
                  onClick={() => setMode('BFS')}
                  style={{
                    padding: '8px 12px',
                    marginRight: '8px',
                    backgroundColor: mode === 'BFS' ? '#2196F3' : '#e0e0e0',
                    color: mode === 'BFS' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  BFS
                </button>
                <button
                  onClick={() => setMode('DFS')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: mode === 'DFS' ? '#2196F3' : '#e0e0e0',
                    color: mode === 'DFS' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  DFS
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <button
                  onClick={runTraversal}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Run {mode}
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>Playback: {speedMultiplier.toFixed(2)}x</label>
                <input
                  type="range"
                  min="0.25"
                  max="1.25"
                  step="0.05"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </>
      )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={steps.length === 0}
              style={{
                padding: '8px 12px',
                backgroundColor: playing ? '#f44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
                opacity: steps.length === 0 ? 0.6 : 1
              }}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => setStepIndex((idx) => Math.max(0, idx - 1))}
              disabled={stepIndex === 0}
              style={{
                padding: '8px 12px',
                backgroundColor: '#9E9E9E',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: stepIndex === 0 ? 0.6 : 1
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setStepIndex((idx) => Math.min(steps.length - 1, idx + 1))}
              disabled={stepIndex >= steps.length - 1}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: stepIndex >= steps.length - 1 ? 'not-allowed' : 'pointer',
                opacity: stepIndex >= steps.length - 1 ? 0.6 : 1
              }}
            >
              Next
            </button>
            <button
              onClick={() => setStepIndex(0)}
              disabled={steps.length === 0}
              style={{
                padding: '8px 12px',
                backgroundColor: '#795548',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
                opacity: steps.length === 0 ? 0.6 : 1
              }}
            >
              Reset
            </button>
          </div>

          <div style={{ color: '#444', marginBottom: '8px' }}>
            Step {steps.length === 0 ? 0 : stepIndex + 1} / {steps.length || 0} — {statusLabel()}
          </div>
          {error && (
            <div style={{ color: '#c62828', marginBottom: '8px' }}>
              {error}
            </div>
          )}

      <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
        <GraphRenderer graphText={externalConfig?.graphText ?? graphText} currentStep={currentStep} />
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <PillList title="Visited" items={currentStep.visited || []} color="#10B981" />
          <PillList
            title={(externalConfig?.mode ?? mode) === 'BFS' ? 'Queue (front → back)' : 'Stack (top → bottom)'}
            items={currentStep.frontier || []}
            color={(externalConfig?.mode ?? mode) === 'BFS' ? '#2196F3' : '#F59E0B'}
          />
          <div style={{ marginTop: '4px', color: '#555' }}>
            Current: {currentStep.current || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphTraversal;
