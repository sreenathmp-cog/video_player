(function() {
    const outerIframe = document.getElementById('ScormContent');
    const innerDoc = outerIframe.contentDocument || outerIframe.contentWindow.document;
    
    // Add styles
    const style = innerDoc.createElement('style');
    style.textContent = `
        .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: calc(100% - 60px); /* Exclude controls height */
            background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 70%, transparent 100%);
            display: none;
            justify-content: flex-start;
            align-items: center;
            z-index: 999;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        
        .video-overlay.show {
            display: flex;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .overlay-content {
            text-align: left;
            color: white;
            padding: 40px;
            max-width: 500px;
        }
        
        .overlay-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 16px;
            font-family: Arial, sans-serif;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        
        .overlay-description {
            font-size: 16px;
            line-height: 1.5;
            font-family: Arial, sans-serif;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            opacity: 0.9;
        }
    `;
    innerDoc.head.appendChild(style);
    
    // Create overlay
    const overlay = innerDoc.createElement('div');
    overlay.className = 'video-overlay';
    overlay.innerHTML = `
        <div class="overlay-content">
            <div class="overlay-title">10MB-MP4.mp4</div>
            <div class="overlay-description">
                Learn about this video content. This is where you can add 
                detailed information about what viewers will learn and 
                key takeaways from this lesson.
            </div>
        </div>
    `;
    
    // Insert overlay
    const mediaContainer = innerDoc.getElementById('rscpAu-MediaContainer');
    if (mediaContainer) {
        mediaContainer.style.position = 'relative';
        mediaContainer.appendChild(overlay);
    }
    
    // Add event listeners
    const video = innerDoc.getElementById('rscpAu-Media');
    if (video) {
        video.addEventListener('pause', () => overlay.classList.add('show'));
        video.addEventListener('play', () => overlay.classList.remove('show'));
        video.addEventListener('ended', () => overlay.classList.remove('show'));
        
        console.log('✅ Netflix-style left overlay added successfully!');
    }
})();
