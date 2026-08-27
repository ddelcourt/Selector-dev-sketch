// Ensure DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', handleKeyPress);

    function handleKeyPress(event) {
        // Return/Enter key: Toggle fullscreen
        if (event.key === 'Enter') {
            event.preventDefault();
            toggleFullscreen();
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
});


