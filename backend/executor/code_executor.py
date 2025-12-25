import sys
from io import StringIO
import json

DEFAULT_SPEED_MS = 200

class VisualizationCapture:
    """Captures array states during sorting"""
    def __init__(self):
        self.steps = []
        self.current_comparing = []
        self.current_swapping = []
        self.sorted_indices = []
    
    def capture(self, array, comparing=None, swapping=None, sorted_idx=None):
        """Capture current state of array"""
        step = {
            'array': array.copy(),
            'comparing': comparing or [],
            'swapping': swapping or [],
            'sorted': sorted_idx or []
        }
        self.steps.append(step)
    
    def get_steps(self):
        return self.steps


def execute_user_code(code, input_array):
    """
    Executes user sorting code safely and captures visualization steps
    
    Args:
        code: User's Python sorting code
        input_array: Initial array to sort
    
    Returns:
        dict with steps, error (if any), and output
    """
    # Create visualization capture object
    viz = VisualizationCapture()
    
    # Create safe execution environment
    safe_globals = {
        '__builtins__': {
            'len': len,
            'range': range,
            'min': min,
            'max': max,
            'abs': abs,
            'sum': sum,
            'sorted': sorted,
            'list': list,
            'print': print,
        },
        'viz': viz,  # Give user access to visualization
        'arr': input_array.copy(),  # The array to sort
    }
    
    # Capture stdout
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    try:
        # Execute user code
        exec(code, safe_globals)
        
        # Get the sorted array
        result_array = safe_globals.get('arr', input_array)
        output = sys.stdout.getvalue()
        
        return {
            'success': True,
            'steps': viz.get_steps(),
            'final_array': result_array,
            'output': output,
            'error': None,
            'default_speed_ms': DEFAULT_SPEED_MS,
        }
    
    except Exception as e:
        return {
            'success': False,
            'steps': [],
            'final_array': input_array,
            'output': sys.stdout.getvalue(),
            'error': str(e),
            'default_speed_ms': DEFAULT_SPEED_MS,
        }
    
    finally:
        sys.stdout = old_stdout


# Example usage template for users
EXAMPLE_TEMPLATE = '''# Bubble Sort Example

n = len(arr)
for i in range(n):
    for j in range(n - i - 1):
        viz.capture(arr, comparing=[j, j+1], sorted_idx=list(range(n-i, n)))
        
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]
            viz.capture(arr, swapping=[j, j+1], sorted_idx=list(range(n-i, n)))

viz.capture(arr, sorted_idx=list(range(n)))
'''