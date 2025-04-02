document.addEventListener('DOMContentLoaded', () => {
    // Select all images
    const images = document.querySelectorAll('.wave-image');
    
    // Create an array to store the positions of each image
    const positions = Array(images.length).fill().map(() => ({ x: 0, y: 0 }));
    
    // Current mouse position
    let mouseX = 0;
    let mouseY = 0;
    
    // Flag to check if mouse is moving
    let isMouseMoving = false;
    let mouseTimer;
    
    // Flag for sliding down animation
    let isSliding = false;
    let slideStartTime = 0;
    const slideDuration = 1500; // 1.5 seconds for the slide animation
    
    // Variables for color changing of first image
    let colorChangeInterval;
    const firstImage = images[0];
    
    // Function to generate random color with transparency
    const getRandomColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    };
    
    // Function to start color changing
    const startColorChanging = () => {
        // Clear any existing interval
        if (colorChangeInterval) {
            clearInterval(colorChangeInterval);
        }
        
        // Set interval to change color every 500ms
        colorChangeInterval = setInterval(() => {
            firstImage.style.backgroundColor = getRandomColor();
        }, 500);
    };
    
    // Start color changing immediately
    startColorChanging();
    
    // Set initial positions (center of screen)
    const initPositions = () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        positions.forEach((pos) => {
            pos.x = centerX;
            pos.y = centerY;
        });
        
        updateImagePositions();
    };
    
    // Update the positions of all images
    const updateImagePositions = () => {
        images.forEach((img, index) => {
            img.style.left = `${positions[index].x}px`;
            img.style.top = `${positions[index].y}px`;
        });
    };
    
    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Set the flag to indicate mouse is moving
        isMouseMoving = true;
        isSliding = false;
        
        // Make all images visible again
        images.forEach(img => {
            img.style.opacity = '1';
        });
        
        // Clear any existing timer
        clearTimeout(mouseTimer);
        
        // Set a timer to detect when mouse stops
        mouseTimer = setTimeout(() => {
            isMouseMoving = false;
            // After mouse stops, wait a bit and then start sliding
            setTimeout(() => {
                isSliding = true;
                slideStartTime = Date.now();
            }, 500); // Wait 500ms after mouse stops before sliding
        }, 100);
    });
    
    // Animation loop
    const animate = () => {
        if (isSliding) {
            // Calculate progress of slide animation (0 to 1)
            const elapsed = Date.now() - slideStartTime;
            const progress = Math.min(elapsed / slideDuration, 1);
            
            // First gather all images to mouse position
            if (progress < 0.3) { // First 30% of animation - gather to mouse
                const gatherProgress = progress / 0.3;
                for (let i = 0; i < positions.length; i++) {
                    const easing = 0.1 + gatherProgress * 0.2;
                    positions[i].x += (mouseX - positions[i].x) * easing;
                    positions[i].y += (mouseY - positions[i].y) * easing;
                }
            } else { // Remaining 70% - slide down
                const slideProgress = (progress - 0.3) / 0.7;
                
                for (let i = 0; i < positions.length; i++) {
                    // Staggered sliding for wave effect
                    const delay = i * 0.1; // Delay each subsequent image
                    const adjustedProgress = Math.max(0, Math.min(1, (slideProgress - delay) * 1.5));
                    
                    if (adjustedProgress > 0) {
                        // Slide down with acceleration
                        const slideDistance = window.innerHeight + 200; // Slide past bottom of screen
                        positions[i].y = mouseY + adjustedProgress * adjustedProgress * slideDistance;
                        
                        // Fade out
                        images[i].style.opacity = Math.max(0, 1 - adjustedProgress);
                    }
                }
            }
        } else if (isMouseMoving) {
            // First image follows the mouse directly
            positions[0].x = mouseX;
            positions[0].y = mouseY;
            
            // Other images follow with delay (creating wave effect)
            for (let i = 1; i < positions.length; i++) {
                // Each subsequent image follows the previous one with easing
                const easing = 0.2 - (i * 0.03); // Decreasing easing for wave effect
                positions[i].x += (positions[i-1].x - positions[i].x) * easing;
                positions[i].y += (positions[i-1].y - positions[i].y) * easing;
            }
        } else {
            // When mouse stops but before sliding starts, all images return to the mouse position
            for (let i = 0; i < positions.length; i++) {
                const easing = 0.1;
                positions[i].x += (mouseX - positions[i].x) * easing;
                positions[i].y += (mouseY - positions[i].y) * easing;
            }
        }
        
        // Update the DOM
        updateImagePositions();
        
        // Continue animation
        requestAnimationFrame(animate);
    };
    
    // Initialize positions and start animation
    initPositions();
    animate();
    
    // Handle window resize
    window.addEventListener('resize', initPositions);
});
