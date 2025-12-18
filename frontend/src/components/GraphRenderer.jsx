import React, { useMemo } from 'react';

function parseGraphSafe(graphText) {
  try {
    const g = JSON.parse(graphText);
    if (!g || typeof g !== 'object' || Array.isArray(g)) return {};
    return g;
  } catch (e) {
    return {};
  }
}

function buildUndirectedEdges(graph) {
  const edges = new Set();
  Object.keys(graph).forEach((u) => {
    (graph[u] || []).forEach((v) => {
      const a = String(u);
      const b = String(v);
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (a !== b) edges.add(key);
    });
  });
  return Array.from(edges).map((k) => {
    const [a, b] = k.split('|');
    return { source: a, target: b };
  });
}

function layoutCircle(nodes, width, height, margin = 50) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.max(10, Math.min(cx, cy) - margin);
  const n = Math.max(1, nodes.length);
  const pos = {};
  nodes.forEach((id, i) => {
    const theta = (2 * Math.PI * i) / n;
    pos[id] = { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
  });
  return pos;
}

function GraphRenderer({ graphText, currentStep, width = 700, height = 400 }) {
  const graph = useMemo(() => parseGraphSafe(graphText), [graphText]);
  const nodes = useMemo(() => Object.keys(graph).sort(), [graph]);
  const edges = useMemo(() => buildUndirectedEdges(graph), [graph]);
  const positions = useMemo(() => layoutCircle(nodes, width, height), [nodes, width, height]);

  const visited = new Set(currentStep?.visited || []);
  const frontier = new Set(currentStep?.frontier || []);
  const current = currentStep?.current || null;

  const colors = currentStep?.colors || null;
  const nodeColor = (id) => {
    if (current === id) return '#EF4444';
    if (colors && colors[id] !== undefined) {
      // Two partitions: 0 -> purple, 1 -> orange
      return colors[id] === 0 ? '#8B5CF6' : '#F59E0B';
    }
    if (visited.has(id)) return '#10B981';
    if (frontier.has(id)) return '#3B82F6';
    return '#9CA3AF';
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <svg width={width} height={height} style={{ background: '#fafafa', borderRadius: 8 }}>
        {/* edges */}
        {edges.map(({ source, target }, idx) => (
          <line
            key={`e-${idx}`}
            x1={positions[source]?.x || 0}
            y1={positions[source]?.y || 0}
            x2={positions[target]?.x || 0}
            y2={positions[target]?.y || 0}
            stroke="#CBD5E1"
            strokeWidth={2}
          />
        ))}
        {/* nodes */}
        {nodes.map((id) => (
          <g key={`n-${id}`}>
            <circle cx={positions[id]?.x || 0} cy={positions[id]?.y || 0} r={18} fill={nodeColor(id)} stroke="#111827" strokeWidth={1} />
            <text x={positions[id]?.x || 0} y={(positions[id]?.y || 0) + 4} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">
              {id}
            </text>
          </g>
        ))}
      </svg>
      <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
        <span style={{ marginRight: 12 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#10B981', borderRadius: 3, marginRight: 6 }} />Visited</span>
        <span style={{ marginRight: 12 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#3B82F6', borderRadius: 3, marginRight: 6 }} />Frontier</span>
        <span style={{ marginRight: 12 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#EF4444', borderRadius: 3, marginRight: 6 }} />Current</span>
        <span style={{ marginRight: 12 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#9CA3AF', borderRadius: 3, marginRight: 6 }} />Unvisited</span>
        {colors && (
          <>
            <span style={{ marginRight: 12 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#8B5CF6', borderRadius: 3, marginRight: 6 }} />Partition A</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#F59E0B', borderRadius: 3, marginRight: 6 }} />Partition B</span>
          </>
        )}
      </div>
    </div>
  );
}

export default GraphRenderer;
