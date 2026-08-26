// Ensure DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {
   
let isDevAreaVisible = false;
const devArea = document.getElementById('devArea');

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        toggleDevAreaVisibility();
    }
}

function toggleDevAreaVisibility() {
    isDevAreaVisible = !isDevAreaVisible;
    updateDevAreaVisibility();
}

function updateDevAreaVisibility() {
    devArea.style.visibility = isDevAreaVisible ? 'visible' : 'hidden';
    devArea.style.pointerEvents = isDevAreaVisible ? 'all' : 'none';
}
});


