(function () {
  console.log("Player customization script started");

  const TIMEOUT_MS = 30000;

  const setupOverlay = (innerDoc) => {
    console.log("Setting up overlay...");

    // Check if already added
    if (innerDoc.querySelector('.video-overlay')) {
      console.log("Overlay already exists, skipping");
      return;
    }

    const mediaContainer = innerDoc.querySelector('#rscpAu-MediaContainer');
    const video = innerDoc.querySelector('#rscpAu-Media');

    if (!mediaContainer || !video) {
      console.log("Media elements not found yet");
      return false;
    }

    console.log("✓ Media elements found, adding overlay");

    // Add styles
    if (!innerDoc.querySelector('#video-overlay-styles')) {
      const style = innerDoc.createElement('style');
      style.id = 'video-overlay-styles';
      style.textContent = `
        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: calc(100% - 60px);
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
    }

    // Create and insert overlay
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
    
    mediaContainer.style.position = 'relative';
    mediaContainer.appendChild(overlay);

    // Wire event listeners
    video.addEventListener('pause', () => overlay.classList.add('show'));
    video.addEventListener('play', () => overlay.classList.remove('show'));
    video.addEventListener('ended', () => overlay.classList.remove('show'));

    console.log('✅ Overlay added successfully');
    return true;
  };

  const watchIframe = (iframe) => {
    let observer = null;
    let loadHandler = null;
    let pollInterval = null;
    let timeoutTimer = null;

    const trySetup = () => {
      try {
        const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!innerDoc || !innerDoc.body) return;

        console.log("Iframe document accessible, body HTML:", innerDoc.body.innerHTML.substring(0, 200));

        if (setupOverlay(innerDoc)) {
          cleanup();
        }
      } catch (e) {
        console.log("Cannot access iframe yet:", e.message);
      }
    };

    const cleanup = () => {
      if (observer) observer.disconnect();
      if (loadHandler) iframe.removeEventListener('load', loadHandler);
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      console.log("✓ Watchers cleaned up");
    };

    // Watch for load events
    loadHandler = () => {
      console.log("Iframe load event fired");
      trySetup();
    };
    iframe.addEventListener('load', loadHandler);

    // Poll periodically
    pollInterval = setInterval(trySetup, 500);

    // Try immediately
    trySetup();

    // Timeout
    timeoutTimer = setTimeout(() => {
      console.error("⏱️ Timeout reached, giving up");
      cleanup();
    }, TIMEOUT_MS);
  };

  // Wait for iframe element in parent DOM
  const waitForIframe = () => {
    const iframe = document.querySelector('#ScormContent');
    if (iframe) {
      console.log("✓ Iframe found immediately");
      watchIframe(iframe);
      return;
    }

    console.log("Waiting for iframe element...");
    const observer = new MutationObserver(() => {
      const found = document.querySelector('#ScormContent');
      if (found) {
        console.log("✓ Iframe found via mutation");
        observer.disconnect();
        watchIframe(found);
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  };

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForIframe);
  } else {
    waitForIframe();
  }

  // Call completion callback immediately
  if (typeof window.rscpCustomizationCompleted === 'function') {
    window.rscpCustomizationCompleted();
    console.log('🎬 rscpCustomizationCompleted called');
  }
})();
