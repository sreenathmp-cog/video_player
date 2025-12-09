(function () {
  console.log("Player customization script started");

  const TIMEOUT_MS = 30000; // 30 seconds

  // Helper: Wait for element using MutationObserver
  const waitForElement = (root, selector, timeout = TIMEOUT_MS) => {
    return new Promise((resolve, reject) => {
      const element = root.querySelector(selector);
      if (element) {
        console.log(`✓ ${selector} found immediately`);
        resolve(element);
        return;
      }

      console.log(`Waiting for ${selector}...`);

      const observer = new MutationObserver(() => {
        const found = root.querySelector(selector);
        if (found) {
          console.log(`✓ ${selector} found via mutation`);
          observer.disconnect();
          clearTimeout(timer);
          resolve(found);
        }
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true
      });

      const timer = setTimeout(() => {
        observer.disconnect();
        console.error(`✗ Timeout waiting for ${selector}`);
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  };

  // Watch for iframe URL/content changes
  const watchIframeNavigation = (iframe, callback) => {
    let lastUrl = '';
    
    const checkNavigation = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        const currentUrl = iframe.contentWindow?.location?.href || '';
        
        if (currentUrl && currentUrl !== lastUrl && currentUrl !== 'about:blank') {
          console.log('Iframe navigated to:', currentUrl);
          lastUrl = currentUrl;
          
          // Check if this is the actual content page (not placeholder)
          if (doc && doc.body && !doc.body.innerHTML.includes('Intermediate Content Placeholder')) {
            console.log('✓ Real content loaded');
            callback(doc);
          }
        }
      } catch (e) {
        // Cross-origin or not ready
      }
    };

    // Listen for load events
    iframe.addEventListener('load', checkNavigation);
    
    // Also poll for changes (backup)
    const pollInterval = setInterval(checkNavigation, 500);
    
    // Initial check
    checkNavigation();
    
    // Cleanup function
    return () => {
      iframe.removeEventListener('load', checkNavigation);
      clearInterval(pollInterval);
    };
  };

  // Main customization logic
  const addOverlay = async (innerDoc) => {
    try {
      console.log("Adding overlay to loaded content...");
      
      // Wait for media elements
      const [mediaContainer, video] = await Promise.all([
        waitForElement(innerDoc, '#rscpAu-MediaContainer'),
        waitForElement(innerDoc, '#rscpAu-Media')
      ]);
      
      console.log("✓ Media elements found");

      // Add styles
      const style = innerDoc.createElement('style');
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

    } catch (error) {
      console.error('❌ Customization failed:', error.message);
    }
  };

  // Initialize
  const init = async () => {
    try {
      console.log("Waiting for ScormContent iframe...");
      
      // Wait for iframe element
      const iframe = await waitForElement(document, '#ScormContent', 10000);
      console.log("✓ Iframe element found");

      // Watch for the actual content to load (not placeholder)
      let cleanupWatcher;
      const contentLoadedPromise = new Promise((resolve) => {
        cleanupWatcher = watchIframeNavigation(iframe, (doc) => {
          resolve(doc);
        });
      });

      // Wait for actual content with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout waiting for actual content')), TIMEOUT_MS);
      });

      const innerDoc = await Promise.race([contentLoadedPromise, timeoutPromise]);
      
      if (cleanupWatcher) cleanupWatcher();
      
      console.log("✓ Actual content loaded in iframe");
      
      // Add overlay
      await addOverlay(innerDoc);

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
    }
  };

  // Start customization
  init();

  // Call completion callback immediately (synchronously)
  if (typeof window.rscpCustomizationCompleted === 'function') {
    window.rscpCustomizationCompleted();
    console.log('🎬 rscpCustomizationCompleted called');
  } else {
    console.warn('⚠️ rscpCustomizationCompleted not available');
  }
})();
