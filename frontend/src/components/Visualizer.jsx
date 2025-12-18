import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

function Visualizer({ steps, isLoading, result, delayMs: externalDelay, speedMultiplier: externalMultiplier, onSpeedMultiplierChange }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalDelay, setInternalDelay] = useState(250);
  const [internalMultiplier, setInternalMultiplier] = useState(0.8);

  const delayMs = externalDelay ?? internalDelay;
  const multiplier = externalMultiplier ?? internalMultiplier;
  const setMultiplier = onSpeedMultiplierChange ?? setInternalMultiplier;

  useEffect(() => {
    if (steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  }, [steps]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, delayMs);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, delayMs]);

  const getBarColor = (index, step) => {
    if (!step) return '#3B82F6';
    if (step.comparing?.includes(index)) return '#FCD34D';
    if (step.swapping?.includes(index)) return '#EF4444';
    if (step.sorted?.includes(index)) return '#10B981';
    return '#3B82F6';
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h3>Executing your code...</h3>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h3>Write code and execute to see visualization</h3>
        <p style={{ color: '#666' }}>
          Generate an array, write your sorting algorithm, and click Execute
        </p>
      </div>
    );
  }

  const currentState = steps[currentStep] || {};
  const currentArray = currentState.array || [];

  const chartData = currentArray.map((value, index) => ({
    index,
    value,
    fill: getBarColor(index, currentState)
  }));

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <h3>Visualization</h3>

      <div style={{ marginBottom: '20px' }}>
        <p>Step: {currentStep + 1} / {steps.length}</p>
        {result && result.output && (
          <details>
            <summary style={{ cursor: 'pointer' }}>Console Output</summary>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              {result.output}
            </pre>
          </details>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <BarChart width={600} height={300} data={chartData}>
          <XAxis dataKey="index" hide />
          <YAxis hide />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: isPlaying ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={() => setCurrentStep(0)}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>

        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1
          }}
        >
          ← Step Back
        </button>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep >= steps.length - 1}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            opacity: currentStep >= steps.length - 1 ? 0.5 : 1
          }}
        >
          Step Forward →
        </button>
      </div>

      <div>
        <label>Speed: {multiplier.toFixed(1)}x </label>
        <input
          type="range"
          min="0.25"
          max="1.25"
          step="0.05"
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <span style={{ marginRight: '15px' }}>
          <span style={{
            display: 'inline-block',
            width: '15px',
            height: '15px',
            backgroundColor: '#3B82F6',
            marginRight: '5px'
          }}></span>
          Default
        </span>
        <span style={{ marginRight: '15px' }}>
          <span style={{
            display: 'inline-block',
            width: '15px',
            height: '15px',
            backgroundColor: '#FCD34D',
            marginRight: '5px'
          }}></span>
          Comparing
        </span>
        <span style={{ marginRight: '15px' }}>
          <span style={{
            display: 'inline-block',
            width: '15px',
            height: '15px',
            backgroundColor: '#EF4444',
            marginRight: '5px'
          }}></span>
          Swapping
        </span>
        <span>
          <span style={{
            display: 'inline-block',
            width: '15px',
            height: '15px',
            backgroundColor: '#10B981',
            marginRight: '5px'
          }}></span>
          Sorted
        </span>
      </div>
    </div>
  );
}

export default Visualizer;