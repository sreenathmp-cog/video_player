(function () {
  console.log("Player customization script started");

  const TIMEOUT_MS = 15000; // 15 seconds global timeout

  // Helper: Wait for element using MutationObserver
  const waitForElement = (root, selector, timeout = TIMEOUT_MS) => {
    return new Promise((resolve, reject) => {
      const element = root.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const found = root.querySelector(selector);
        if (found) {
          obs.disconnect();
          clearTimeout(timer);
          resolve(found);
        }
      });

      observer.observe(root, {
        childList: true,
        subtree: true
      });

      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  };

  // Main customization logic
  const addOverlay = async () => {
    try {
      console.log("Waiting for ScormContent iframe...");
      
      // Step 1: Wait for iframe in parent document
      const iframe = await waitForElement(document, '#ScormContent');
      console.log("✓ Iframe found");

      // Step 2: Wait for iframe content to be accessible
      const waitForIframeContent = () => {
        return new Promise((resolve, reject) => {
          const checkContent = () => {
            try {
              const doc = iframe.contentDocument || iframe.contentWindow?.document;
              if (doc && doc.body) {
                resolve(doc);
              }
            } catch (e) {
              // Cross-origin or not ready
            }
          };

          // Check immediately
          checkContent();

          // Observe iframe load
          const observer = new MutationObserver(checkContent);
          observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });

          iframe.addEventListener('load', () => {
            observer.disconnect();
            clearTimeout(timer);
            checkContent();
          });

          const timer = setTimeout(() => {
            observer.disconnect();
            reject(new Error('Timeout accessing iframe content'));
          }, TIMEOUT_MS);
        });
      };

      const innerDoc = await waitForIframeContent();
      console.log("✓ Iframe content accessible");

      // Step 3: Wait for media container and video
      console.log("Waiting for media elements...");
      const [mediaContainer, video] = await Promise.all([
        waitForElement(innerDoc, '#rscpAu-MediaContainer'),
        waitForElement(innerDoc, '#rscpAu-Media')
      ]);
      console.log("✓ Media elements found");

      // Step 4: Add styles
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

      // Step 5: Create and insert overlay
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

      // Step 6: Wire event listeners
      video.addEventListener('pause', () => overlay.classList.add('show'));
      video.addEventListener('play', () => overlay.classList.remove('show'));
      video.addEventListener('ended', () => overlay.classList.remove('show'));

      console.log('✅ Overlay added successfully');

    } catch (error) {
      console.error('❌ Customization failed:', error.message);
    }
  };

  // Start customization (runs asynchronously)
  addOverlay();

  // Call completion callback immediately (synchronously)
  if (typeof window.rscpCustomizationCompleted === 'function') {
    window.rscpCustomizationCompleted();
    console.log('🎬 rscpCustomizationCompleted called');
  } else {
    console.warn('⚠️ rscpCustomizationCompleted not available');
  }
})();
