(function () {
  'use strict';
  
  console.log("Player customization script started");

  const CONFIG = {
    TIMEOUT_MS: 30000,
    POLL_INTERVAL_MS: 500,
    IFRAME_SELECTOR: '#ScormContent',
    CONTAINER_SELECTOR: '#rscpAu-MediaContainer',
    VIDEO_SELECTOR: '#rscpAu-Media',
    OVERLAY_CLASS: 'video-overlay',
    STYLE_ID: 'video-overlay-styles'
  };

  const STYLES = `
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

  const OVERLAY_HTML = `
    <div class="overlay-content">
      <div class="overlay-title">10MB-MP4.mp4</div>
      <div class="overlay-description">
        Learn about this video content. This is where you can add 
        detailed information about what viewers will learn and 
        key takeaways from this lesson.
      </div>
    </div>
  `;

  const getIframeDocument = (iframe) => {
    try {
      return iframe.contentDocument || iframe.contentWindow?.document;
    } catch (e) {
      return null;
    }
  };

  const injectStyles = (doc) => {
    if (doc.getElementById(CONFIG.STYLE_ID)) return;
    
    const style = doc.createElement('style');
    style.id = CONFIG.STYLE_ID;
    style.textContent = STYLES;
    doc.head.appendChild(style);
  };

  const createOverlay = (doc) => {
    const overlay = doc.createElement('div');
    overlay.className = CONFIG.OVERLAY_CLASS;
    overlay.innerHTML = OVERLAY_HTML;
    return overlay;
  };

  const attachEventListeners = (video, overlay) => {
    const showOverlay = () => overlay.classList.add('show');
    const hideOverlay = () => overlay.classList.remove('show');

    video.addEventListener('pause', showOverlay);
    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', hideOverlay);
  };

  const setupOverlay = (innerDoc) => {
    // Prevent duplicate setup
    if (innerDoc.querySelector(`.${CONFIG.OVERLAY_CLASS}`)) {
      console.log("Overlay already exists");
      return true;
    }

    const mediaContainer = innerDoc.querySelector(CONFIG.CONTAINER_SELECTOR);
    const video = innerDoc.querySelector(CONFIG.VIDEO_SELECTOR);

    if (!mediaContainer || !video) {
      return false;
    }

    console.log("✓ Media elements found");

    injectStyles(innerDoc);
    
    const overlay = createOverlay(innerDoc);
    mediaContainer.style.position = 'relative';
    mediaContainer.appendChild(overlay);

    attachEventListeners(video, overlay);

    console.log('✅ Overlay added successfully');
    return true;
  };

  const createWatcher = (iframe) => {
    let pollInterval = null;
    let timeoutTimer = null;
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      iframe.removeEventListener('load', handleLoad);
      
      console.log("✓ Watchers cleaned up");
    };

    const trySetup = () => {
      const innerDoc = getIframeDocument(iframe);
      if (!innerDoc?.body) return;

      if (setupOverlay(innerDoc)) {
        cleanup();
      }
    };

    const handleLoad = () => {
      console.log("Iframe load event");
      trySetup();
    };

    // Attach load listener
    iframe.addEventListener('load', handleLoad);

    // Start polling
    pollInterval = setInterval(trySetup, CONFIG.POLL_INTERVAL_MS);

    // Set timeout
    timeoutTimer = setTimeout(() => {
      console.warn("⏱️ Timeout reached");
      cleanup();
    }, CONFIG.TIMEOUT_MS);

    // Initial attempt
    trySetup();
  };

  const init = () => {
    const iframe = document.querySelector(CONFIG.IFRAME_SELECTOR);
    
    if (iframe) {
      console.log("✓ Iframe found");
      createWatcher(iframe);
      return;
    }

    console.log("Waiting for iframe...");
    const observer = new MutationObserver(() => {
      const found = document.querySelector(CONFIG.IFRAME_SELECTOR);
      if (found) {
        console.log("✓ Iframe found via mutation");
        observer.disconnect();
        createWatcher(found);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Notify player immediately
  if (typeof window.rscpCustomizationCompleted === 'function') {
    window.rscpCustomizationCompleted();
    console.log('🎬 rscpCustomizationCompleted called');
  }
})();
