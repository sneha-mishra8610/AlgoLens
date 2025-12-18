from rest_framework.decorators import api_view
from rest_framework.response import Response
from .code_executor import execute_user_code, EXAMPLE_TEMPLATE

@api_view(['POST'])
def execute_code(request):
    """Execute user's sorting code and return visualization steps"""
    code = request.data.get('code', '')
    array = request.data.get('array', [])
    
    if not code:
        return Response({'error': 'No code provided'}, status=400)
    
    if not array:
        return Response({'error': 'No array provided'}, status=400)
    
    # Execute the code
    result = execute_user_code(code, array)
    
    return Response(result)


@api_view(['GET'])
def get_example_code(request):
    """Return example sorting code"""
    return Response({
        'bubble_sort': EXAMPLE_TEMPLATE,
        'selection_sort': '''# Selection Sort Example
n = len(arr)
for i in range(n):
    min_idx = i
    for j in range(i + 1, n):
        viz.capture(arr, comparing=[min_idx, j], sorted_idx=list(range(i)))
        if arr[j] < arr[min_idx]:
            min_idx = j
    
    if min_idx != i:
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
        viz.capture(arr, swapping=[i, min_idx], sorted_idx=list(range(i+1)))

viz.capture(arr, sorted_idx=list(range(n)))
''',
        'insertion_sort': '''# Insertion Sort Example
for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    
    while j >= 0 and arr[j] > key:
        viz.capture(arr, comparing=[j, j+1], sorted_idx=list(range(i)))
        arr[j + 1] = arr[j]
        j -= 1
    
    arr[j + 1] = key
    viz.capture(arr, swapping=[j+1], sorted_idx=list(range(i+1)))

viz.capture(arr, sorted_idx=list(range(len(arr))))
''',
        'merge_sort': '''# Merge Sort (in-place) Example
def merge(arr, l, m, r):
    left = arr[l:m+1]
    right = arr[m+1:r+1]
    i = j = 0
    k = l
    while i < len(left) and j < len(right):
        viz.capture(arr, comparing=[l + i, m + 1 + j], sorted_idx=list(range(l)))
        if left[i] <= right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        viz.capture(arr, swapping=[k], sorted_idx=list(range(l)))
        k += 1
    while i < len(left):
        arr[k] = left[i]
        viz.capture(arr, swapping=[k], sorted_idx=list(range(l)))
        i += 1
        k += 1
    while j < len(right):
        arr[k] = right[j]
        viz.capture(arr, swapping=[k], sorted_idx=list(range(l)))
        j += 1
        k += 1

def merge_sort(arr, l, r):
    if l >= r:
        return
    m = (l + r) // 2
    merge_sort(arr, l, m)
    merge_sort(arr, m + 1, r)
    merge(arr, l, m, r)

merge_sort(arr, 0, len(arr) - 1)
viz.capture(arr, sorted_idx=list(range(len(arr))))
''',
        'quick_sort': '''# Quick Sort (Lomuto) Example
def partition(arr, low, high):
    pivot = arr[high]
    i = low
    for j in range(low, high):
        viz.capture(arr, comparing=[j, high])
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            viz.capture(arr, swapping=[i, j])
            i += 1
    arr[i], arr[high] = arr[high], arr[i]
    viz.capture(arr, swapping=[i, high])
    return i

def quick_sort(arr, low, high):
    if low < high:
        p = partition(arr, low, high)
        quick_sort(arr, low, p - 1)
        quick_sort(arr, p + 1, high)

quick_sort(arr, 0, len(arr) - 1)
viz.capture(arr, sorted_idx=list(range(len(arr))))
''',
        'radix_sort': '''# Radix Sort (LSD) Example for non-negative integers
def counting_sort_exp(arr, exp):
    n = len(arr)
    output = [0]*n
    count = [0]*10
    for i in range(n):
        index = (arr[i] // exp) % 10
        count[index] += 1
        viz.capture(arr, comparing=[i])
    for i in range(1,10):
        count[i] += count[i-1]
    for i in range(n-1, -1, -1):
        index = (arr[i] // exp) % 10
        output[count[index]-1] = arr[i]
        count[index] -= 1
    for i in range(n):
        arr[i] = output[i]
        viz.capture(arr, swapping=[i])

if len(arr) > 0:
    mx = max(arr)
    exp = 1
    while mx // exp > 0:
        counting_sort_exp(arr, exp)
        exp *= 10
viz.capture(arr, sorted_idx=list(range(len(arr))))
'''
    })