// DOM Elements
const visualizer = document.getElementById('visualizer');
const generateArrayBtn = document.getElementById('generateArrayBtn');
const startSortBtn = document.getElementById('startSortBtn');
const stopSortBtn = document.getElementById('stopSortBtn');
const algorithmSelect = document.getElementById('algorithmSelect');
const arraySizeSlider = document.getElementById('arraySize');
const speedSlider = document.getElementById('speed');
const arraySizeValue = document.getElementById('arraySizeValue');
const speedValue = document.getElementById('speedValue');

let array = [];
let originalArray = [];
let isSorting = false;
let forceStop = false;

// --- UTILITY FUNCTIONS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- CORE VISUALIZER FUNCTIONS ---

/**
 * Generates a new random array and renders it.
 */
function generateArray() {
    if (isSorting) return;
    forceStop = false;
    array = [];
    visualizer.innerHTML = '';
    const size = arraySizeSlider.value;
    const barWidth = 100 / size;

    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 350) + 10);
    }
    originalArray = [...array]; // Store a copy for reset

    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = `${value}px`;
        bar.style.width = `calc(${barWidth}% - 4px)`;
        visualizer.appendChild(bar);
    });
}

/**
 * Resets the array and bars to their original unsorted state.
 */
function resetArray() {
    array = [...originalArray];
    const bars = document.getElementsByClassName('bar');
    for(let i = 0; i < bars.length; i++) {
        bars[i].style.height = `${array[i]}px`;
        bars[i].className = 'bar';
    }
}

/**
 * Toggles the state of UI controls during sorting.
 * @param {boolean} sorting - The new sorting state.
 */
function toggleControls(sorting) {
    isSorting = sorting;
    generateArrayBtn.disabled = sorting;
    startSortBtn.disabled = sorting;
    stopSortBtn.disabled = !sorting;
    arraySizeSlider.disabled = sorting;
    algorithmSelect.disabled = sorting;
}

// --- SORTING ALGORITHMS ---

/**
 * Bubble Sort
 */
async function bubbleSort() {
    const bars = document.getElementsByClassName('bar');
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (forceStop) return;
            bars[j].classList.add('bar-comparing');
            bars[j + 1].classList.add('bar-comparing');
            await sleep(speedSlider.value);

            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                bars[j].style.height = `${array[j]}px`;
                bars[j + 1].style.height = `${array[j + 1]}px`;
                bars[j].classList.add('bar-swap');
                bars[j + 1].classList.add('bar-swap');
                await sleep(speedSlider.value);
            }
            bars[j].classList.remove('bar-comparing', 'bar-swap');
            bars[j + 1].classList.remove('bar-comparing', 'bar-swap');
        }
        bars[n - 1 - i].classList.add('bar-sorted');
    }
    if (n > 0) bars[0].classList.add('bar-sorted');
}

/**
 * Selection Sort
 */
async function selectionSort() {
    const bars = document.getElementsByClassName('bar');
    const n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        bars[i].classList.add('bar-comparing'); // Current position to fill
        for (let j = i + 1; j < n; j++) {
            if (forceStop) return;
            bars[j].classList.add('bar-comparing');
            await sleep(speedSlider.value);
            if (array[j] < array[minIdx]) {
                if (minIdx !== i) bars[minIdx].classList.remove('bar-pivot');
                minIdx = j;
                bars[minIdx].classList.add('bar-pivot'); // New minimum found
            }
            bars[j].classList.remove('bar-comparing');
        }
        
        await sleep(speedSlider.value);
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        bars[i].style.height = `${array[i]}px`;
        bars[minIdx].style.height = `${array[minIdx]}px`;
        
        bars[minIdx].classList.remove('bar-pivot');
        bars[i].classList.remove('bar-comparing');
        bars[i].classList.add('bar-sorted');
    }
    if (n > 0) bars[n-1].classList.add('bar-sorted');
}

/**
 * Insertion Sort
 */
async function insertionSort() {
    const bars = document.getElementsByClassName('bar');
    const n = array.length;
    bars[0].classList.add('bar-sorted');
    for (let i = 1; i < n; i++) {
        if (forceStop) return;
        let key = array[i];
        let j = i - 1;
        bars[i].classList.add('bar-pivot');
        await sleep(speedSlider.value);

        while (j >= 0 && array[j] > key) {
            if (forceStop) return;
            array[j + 1] = array[j];
            bars[j + 1].style.height = `${array[j]}px`;
            bars[j+1].classList.add('bar-swap');
            bars[j].classList.add('bar-swap');
            await sleep(speedSlider.value);
            bars[j+1].classList.remove('bar-swap');
            bars[j].classList.remove('bar-swap');
            bars[j].classList.add('bar-sorted');
            j = j - 1;
        }
        array[j + 1] = key;
        bars[j + 1].style.height = `${key}px`;
        bars[i].classList.remove('bar-pivot');
        for(let k=0; k<=i; k++) bars[k].classList.add('bar-sorted');
    }
}

/**
 * Merge Sort
 */
async function mergeSort(l, r) {
    if (l >= r) return;
    if (forceStop) return;

    const m = l + Math.floor((r - l) / 2);
    await mergeSort(l, m);
    await mergeSort(m + 1, r);
    await merge(l, m, r);
}

async function merge(l, m, r) {
    const bars = document.getElementsByClassName('bar');
    const n1 = m - l + 1;
    const n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = array[l + i];
    for (let j = 0; j < n2; j++) R[j] = array[m + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (forceStop) return;
        bars[l+i].classList.add('bar-comparing');
        bars[m+1+j].classList.add('bar-comparing');
        await sleep(speedSlider.value);
        
        if (L[i] <= R[j]) {
            array[k] = L[i];
            bars[k].style.height = `${L[i]}px`;
            i++;
        } else {
            array[k] = R[j];
            bars[k].style.height = `${R[j]}px`;
            j++;
        }
        bars[k].classList.add('bar-swap');
        await sleep(speedSlider.value);
        
        // Clear highlights from source bars as they are used
        if(i > 0) bars[l+i-1].classList.remove('bar-comparing');
        if(j > 0) bars[m+j].classList.remove('bar-comparing');
        bars[k].classList.remove('bar-swap');
        k++;
    }

    while (i < n1) {
        if (forceStop) return;
        array[k] = L[i];
        bars[k].style.height = `${L[i]}px`;
        i++; k++;
        await sleep(speedSlider.value);
    }
    while (j < n2) {
        if (forceStop) return;
        array[k] = R[j];
        bars[k].style.height = `${R[j]}px`;
        j++; k++;
        await sleep(speedSlider.value);
    }
}

/**
 * Quick Sort
 */
async function quickSort(low, high) {
    if (low < high) {
        if (forceStop) return;
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}

async function partition(low, high) {
    const bars = document.getElementsByClassName('bar');
    let pivot = array[high];
    bars[high].classList.add('bar-pivot');
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
        if (forceStop) return i;
        bars[j].classList.add('bar-comparing');
        await sleep(speedSlider.value);
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            bars[i].style.height = `${array[i]}px`;
            bars[j].style.height = `${array[j]}px`;
            bars[i].classList.add('bar-swap');
            bars[j].classList.add('bar-swap');
            await sleep(speedSlider.value);
            bars[i].classList.remove('bar-swap');
            bars[j].classList.remove('bar-swap');
        }
        bars[j].classList.remove('bar-comparing');
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    bars[i + 1].style.height = `${array[i+1]}px`;
    bars[high].style.height = `${array[high]}px`;
    bars[high].classList.remove('bar-pivot');
    return i + 1;
}

// --- EVENT LISTENERS ---
generateArrayBtn.addEventListener('click', generateArray);

startSortBtn.addEventListener('click', async () => {
    toggleControls(true);
    const selectedAlgorithm = algorithmSelect.value;
    
    try {
        switch (selectedAlgorithm) {
            case 'bubble':
                await bubbleSort();
                break;
            case 'selection':
                await selectionSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
            case 'merge':
                await mergeSort(0, array.length - 1);
                break;
            case 'quick':
                await quickSort(0, array.length - 1);
                break;
        }
        // Mark all as sorted if not stopped
        if (!forceStop) {
            const bars = document.getElementsByClassName('bar');
            for (let bar of bars) {
                bar.classList.add('bar-sorted');
            }
        }
    } catch (error) {
        if (error.message !== "Sorting stopped") {
            console.error("An error occurred during sorting:", error);
        }
    } finally {
        if (forceStop) {
            resetArray();
        }
        toggleControls(false);
        forceStop = false;
    }
});

stopSortBtn.addEventListener('click', () => {
    forceStop = true;
});

arraySizeSlider.addEventListener('input', (e) => {
    arraySizeValue.textContent = e.target.value;
    if (!isSorting) generateArray();
});

speedSlider.addEventListener('input', (e) => {
    const valueInMs = e.target.value;
    if (valueInMs >= 1000) {
        speedValue.textContent = `${(valueInMs / 1000).toFixed(1)}s`;
    } else {
        speedValue.textContent = `${valueInMs}ms`;
    }
});

// --- INITIALIZATION ---
window.onload = () => {
     arraySizeValue.textContent = arraySizeSlider.value;
     const initialSpeed = speedSlider.value;
     if (initialSpeed >= 1000) {
        speedValue.textContent = `${(initialSpeed / 1000).toFixed(1)}s`;
     } else {
        speedValue.textContent = `${initialSpeed}ms`;
     }
     generateArray();
};
