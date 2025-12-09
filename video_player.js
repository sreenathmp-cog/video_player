(function () {
  const IFRAME_LOAD_TIMEOUT_MS = 10000;
  const ELEMENT_WAIT_TIMEOUT_MS = 15000;

  const waitForEl = (doc, selector, timeoutMs = ELEMENT_WAIT_TIMEOUT_MS) => {
    return new Promise((resolve, reject) => {
      const foundNow = doc.querySelector(selector);
      if (foundNow) return resolve(foundNow);

      const obs = new MutationObserver(() => {
        const found = doc.querySelector(selector);
        if (found) {
          obs.disconnect();
          clearTimeout(timer);
          resolve(found);
        }
      });
      obs.observe(doc, { childList: true, subtree: true });

      const timer = setTimeout(() => {
        obs.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeoutMs);
    });
  };

  const init = async () => {
    try {
      console.log("Waiting for ScormContent iframe...");
      
      // Wait for the iframe element itself to exist in parent DOM
      const outerIframe = await waitForEl(document, '#ScormContent', 10000);
      console.log("✓ Iframe element found:", outerIframe);

      // Wait for iframe to load
      if (!outerIframe.contentDocument || outerIframe.contentDocument.readyState === 'loading') {
        await new Promise((resolve, reject) => {
          const onLoad = () => {
            clearTimeout(timer);
            resolve();
          };
          outerIframe.addEventListener('load', onLoad, { once: true });
          
          const timer = setTimeout(() => {
            outerIframe.removeEventListener('load', onLoad);
            console.warn('Iframe load timeout, proceeding anyway');
            resolve();
          }, IFRAME_LOAD_TIMEOUT_MS);
        });
      }

      const innerDoc = outerIframe.contentDocument || outerIframe.contentWindow.document;
      console.log("✓ Inner document accessible:", innerDoc.readyState);

      // Wait for inner DOM to be ready
      if (innerDoc.readyState === 'loading') {
        await new Promise(res => innerDoc.addEventListener('DOMContentLoaded', res, { once: true }));
      }

      console.log("Waiting for media elements...");
      const mediaContainer = await waitForEl(innerDoc, '#rscpAu-MediaContainer');
      const video = await waitForEl(innerDoc, '#rscpAu-Media');
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
        .video-overlay.show { display: flex; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .overlay-content { text-align: left; color: white; padding: 40px; max-width: 500px; }
        .overlay-title { font-size: 28px; font-weight: bold; margin-bottom: 16px; font-family: Arial, sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        .overlay-description { font-size: 16px; line-height: 1.5; font-family: Arial, sans-serif; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); opacity: 0.9; }
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
      
      mediaContainer.style.position = 'relative';
      mediaContainer.appendChild(overlay);

      video.addEventListener('pause', () => overlay.classList.add('show'));
      video.addEventListener('play', () => overlay.classList.remove('show'));
      video.addEventListener('ended', () => overlay.classList.remove('show'));

      console.log('✅ Overlay added successfully');

    } catch (err) {
      console.error('❌ Customization failed:', err.message);
    }
  };

  // Start customization work asynchronously (don't block)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Call the completion callback IMMEDIATELY (synchronously)
  // This allows the player to proceed while customization runs in background
  if (typeof window.rscpCustomizationCompleted === 'function') {
    window.rscpCustomizationCompleted();
    console.log('🎬 rscpCustomizationCompleted called synchronously');
  } else {
    console.warn('rscpCustomizationCompleted not available on window');
  }
})();
