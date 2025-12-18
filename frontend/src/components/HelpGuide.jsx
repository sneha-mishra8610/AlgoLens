import React from 'react';

function HelpGuide() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginTop: '20px'
    }}>
      <h3>📚 How to Use</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>1. Generate an Array</h4>
        <p>Click "Generate Random Array" to create an array to sort.</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>2. Write Your Algorithm</h4>
        <p>Write Python code in the editor. Available:</p>
        <ul>
          <li><code>arr</code> - The array (modify in-place)</li>
          <li><code>viz.capture(arr, comparing=[], swapping=[], sorted_idx=[])</code></li>
          <li>Functions: <code>len(), range(), min(), max(), print()</code></li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>3. Example Template</h4>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto'
        }}>
{`for i in range(len(arr)):
    for j in range(len(arr) - i - 1):
        # Show comparison
        viz.capture(arr, comparing=[j, j+1])
        
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]
            # Show swap
            viz.capture(arr, swapping=[j, j+1])

viz.capture(arr, sorted_idx=list(range(len(arr))))`}
        </pre>
      </div>

      <div>
        <h4>4. Tips</h4>
        <ul>
          <li>Call <code>viz.capture()</code> often for smooth animations</li>
          <li><code>comparing</code> - highlights elements being compared (yellow)</li>
          <li><code>swapping</code> - shows swaps (red)</li>
          <li><code>sorted_idx</code> - marks sorted portions (green)</li>
        </ul>
      </div>
    </div>
  );
}

export default HelpGuide;