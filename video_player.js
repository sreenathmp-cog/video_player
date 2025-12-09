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
    CONTROLS_CLASS: 'custom-video-controls',
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
    
    /* YouTube-style Custom Controls */
    .custom-video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
      padding: 40px 12px 8px 12px;
      z-index: 1000;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .custom-video-controls.show {
      opacity: 1;
    }
    
    /* Progress Bar */
    .video-progress-container {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      position: relative;
      margin-bottom: 8px;
      border-radius: 2px;
    }
    .video-progress-container:hover {
      height: 7px;
      margin-bottom: 6px;
    }
    .video-progress-bar {
      height: 100%;
      background: #ff0000;
      width: 0%;
      border-radius: 2px;
      position: relative;
    }
    .video-progress-bar::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      background: #ff0000;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .video-progress-container:hover .video-progress-bar::after {
      opacity: 1;
    }
    
    /* Control Buttons Row */
    .controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .controls-left,
    .controls-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Buttons */
    .custom-video-controls button {
      background: transparent;
      color: white;
      border: none;
      cursor: pointer;
      padding: 8px;
      font-size: 18px;
      font-family: Arial, sans-serif;
      transition: all 0.2s ease;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
    }
    .custom-video-controls button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    /* Skip buttons */
    .skip-btn {
      position: relative;
      font-size: 0;
    }
    .skip-btn::before {
      font-size: 24px;
    }
    .skip-btn[data-skip="-10"]::before {
      content: "⏪";
    }
    .skip-btn[data-skip="10"]::before {
      content: "⏩";
    }
    .skip-btn span {
      position: absolute;
      font-size: 10px;
      font-weight: bold;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    
    /* Time Display */
    .time-display {
      color: white;
      font-size: 13px;
      font-family: 'Roboto', Arial, sans-serif;
      font-weight: 500;
      white-space: nowrap;
      user-select: none;
    }
    
    /* Speed Control */
    .speed-control {
      position: relative;
    }
    .speed-button {
      min-width: 45px !important;
      font-size: 14px !important;
      font-weight: 500;
    }
    .speed-menu {
      position: absolute;
      bottom: 100%;
      right: 0;
      background: rgba(28, 28, 28, 0.95);
      border-radius: 8px;
      padding: 8px 0;
      margin-bottom: 8px;
      min-width: 60px;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .speed-menu.show {
      display: block;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    .speed-option {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: white;
      text-align: center;
      transition: background 0.2s;
    }
    .speed-option:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .speed-option.active {
      color: #3ea6ff;
      font-weight: 600;
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

  const CONTROLS_HTML = `
    <div class="video-progress-container">
      <div class="video-progress-bar"></div>
    </div>
    <div class="controls-row">
      <div class="controls-left">
        <button class="skip-btn" data-skip="-10" title="Rewind 10 seconds">
          <span>10</span>
        </button>
        <button class="skip-btn" data-skip="10" title="Forward 10 seconds">
          <span>10</span>
        </button>
        <span class="time-display">0:00 / 0:00</span>
      </div>
      <div class="controls-right">
        <div class="speed-control">
          <button class="speed-button" title="Playback speed">1x</button>
          <div class="speed-menu">
            <div class="speed-option" data-speed="0.5">0.5x</div>
            <div class="speed-option" data-speed="0.75">0.75x</div>
            <div class="speed-option active" data-speed="1">Normal</div>
            <div class="speed-option" data-speed="1.25">1.25x</div>
            <div class="speed-option" data-speed="1.5">1.5x</div>
            <div class="speed-option" data-speed="1.75">1.75x</div>
            <div class="speed-option" data-speed="2">2x</div>
          </div>
        </div>
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

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createCustomControls = (doc, video) => {
    const controlsContainer = doc.createElement('div');
    controlsContainer.className = CONFIG.CONTROLS_CLASS;
    controlsContainer.innerHTML = CONTROLS_HTML;

    const progressContainer = controlsContainer.querySelector('.video-progress-container');
    const progressBar = controlsContainer.querySelector('.video-progress-bar');
    const timeDisplay = controlsContainer.querySelector('.time-display');
    const speedButton = controlsContainer.querySelector('.speed-button');
    const speedMenu = controlsContainer.querySelector('.speed-menu');

    // Progress bar update
    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      progressBar.style.width = progress + '%';
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    // Progress bar seek
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    });

    // Skip buttons
    const skipButtons = controlsContainer.querySelectorAll('.skip-btn');
    skipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const skipAmount = parseFloat(btn.dataset.skip);
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + skipAmount));
      });
    });

    // Speed control
    const speedOptions = controlsContainer.querySelectorAll('.speed-option');
    
    speedButton.addEventListener('click', (e) => {
      e.stopPropagation();
      speedMenu.classList.toggle('show');
    });

    speedOptions.forEach(option => {
      option.addEventListener('click', () => {
        const speed = parseFloat(option.dataset.speed);
        video.playbackRate = speed;
        
        speedOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        speedButton.textContent = speed === 1 ? '1x' : speed + 'x';
        speedMenu.classList.remove('show');
      });
    });

    // Close speed menu when clicking outside
    doc.addEventListener('click', () => {
      speedMenu.classList.remove('show');
    });

    return controlsContainer;
  };

  const attachEventListeners = (video, overlay, customControls) => {
    const showOverlay = () => overlay.classList.add('show');
    const hideOverlay = () => overlay.classList.remove('show');

    video.addEventListener('pause', showOverlay);
    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', hideOverlay);

    // Show/hide custom controls
    const mediaContainer = video.closest(CONFIG.CONTAINER_SELECTOR);
    if (mediaContainer) {
      let hideTimeout;
      
      const showControls = () => {
        customControls.classList.add('show');
        clearTimeout(hideTimeout);
      };
      
      const hideControls = () => {
        hideTimeout = setTimeout(() => {
          if (!video.paused) {
            customControls.classList.remove('show');
          }
        }, 3000);
      };

      mediaContainer.addEventListener('mouseenter', showControls);
      mediaContainer.addEventListener('mousemove', () => {
        showControls();
        if (!video.paused) {
          hideControls();
        }
      });
      mediaContainer.addEventListener('mouseleave', () => {
        if (!video.paused) {
          customControls.classList.remove('show');
        }
      });

      video.addEventListener('pause', showControls);
      video.addEventListener('play', () => {
        showControls();
        hideControls();
      });
    }
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
    const customControls = createCustomControls(innerDoc, video);
    
    mediaContainer.style.position = 'relative';
    mediaContainer.appendChild(overlay);
    mediaContainer.appendChild(customControls);

    attachEventListeners(video, overlay, customControls);

    console.log('✅ YouTube-style controls added successfully');
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

    iframe.addEventListener('load', handleLoad);
    pollInterval = setInterval(trySetup, CONFIG.POLL_INTERVAL_MS);
    timeoutTimer = setTimeout(() => {
      console.warn("⏱️ Timeout reached");
      cleanup();
    }, CONFIG.TIMEOUT_MS);

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof window.rscpCustomizationCompleted === 'function') {
    window.rscpCustomizationCompleted();
    console.log('🎬 rscpCustomizationCompleted called');
  }
})();
