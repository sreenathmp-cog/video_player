(function () {
  try {
    console.log("player ad script added");

    const outerIframe = document.getElementById('ScormContent');
    if (!outerIframe) {
      console.error('❌ ScormContent iframe not found');
      return;
    }

    // Configurable timeouts
    const IFRAME_LOAD_TIMEOUT_MS = 10000;      // 10s for iframe load
    const INNER_DOM_READY_TIMEOUT_MS = 8000;   // 8s for inner DOMContentLoaded
    const ELEMENT_WAIT_TIMEOUT_MS = 15000;     // 15s for elements inside iframe

    // Wait for an element inside a document with timeout
    const waitForEl = (doc, selector, timeoutMs = ELEMENT_WAIT_TIMEOUT_MS) => {
      return new Promise((resolve, reject) => {
        const foundNow = doc.querySelector(selector);
        if (foundNow) return resolve(foundNow);

        const obs = new MutationObserver(() => {
          const found = doc.querySelector(selector);
          if (found) {
            obs.disconnect();
            resolve(found);
          }
        });
        obs.observe(doc, { childList: true, subtree: true });

        const timer = setTimeout(() => {
          obs.disconnect();
          reject(new Error(`Timeout waiting for ${selector} after ${timeoutMs}ms`));
        }, timeoutMs);
      });
    };

    // Wait for inner DOMContentLoaded with timeout
    const waitForInnerDomReady = (doc, timeoutMs = INNER_DOM_READY_TIMEOUT_MS) => {
      return new Promise((resolve, reject) => {
        if (doc.readyState === 'complete' || doc.readyState === 'interactive') {
          resolve();
          return;
        }
        const onReady = () => resolve();
        doc.addEventListener('DOMContentLoaded', onReady, { once: true });

        const timer = setTimeout(() => {
          doc.removeEventListener('DOMContentLoaded', onReady);
          reject(new Error(`Timeout waiting for inner DOMContentLoaded after ${timeoutMs}ms`));
        }, timeoutMs);
      });
    };

    const init = async () => {
      const innerDoc = outerIframe.contentDocument || outerIframe.contentWindow.document;
      if (!innerDoc) {
        console.error('❌ Unable to access iframe document');
        return;
      }

      try {
        await waitForInnerDomReady(innerDoc, INNER_DOM_READY_TIMEOUT_MS);

        const mediaContainer = await waitForEl(innerDoc, '#rscpAu-MediaContainer', ELEMENT_WAIT_TIMEOUT_MS);
        const video = await waitForEl(innerDoc, '#rscpAu-Media', ELEMENT_WAIT_TIMEOUT_MS);

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

        // Wire events
        video.addEventListener('pause', () => overlay.classList.add('show'));
        video.addEventListener('play', () => overlay.classList.remove('show'));
        video.addEventListener('ended', () => overlay.classList.remove('show'));

        console.log('✅ Overlay added');
      } catch (err) {
        console.error('❌ Customization timed out or failed:', err.message);
      }
    };

    // Iframe load with timeout
    if (outerIframe.contentDocument && outerIframe.contentDocument.readyState !== 'loading') {
      init();
    } else {
      const onLoad = () => {
        clearTimeout(loadTimer);
        init();
      };
      outerIframe.addEventListener('load', onLoad, { once: true });

      const loadTimer = setTimeout(() => {
        outerIframe.removeEventListener('load', onLoad);
        console.warn(`⚠️ Iframe load timed out after ${IFRAME_LOAD_TIMEOUT_MS}ms; proceeding`);
        init(); // attempt to proceed
      }, IFRAME_LOAD_TIMEOUT_MS);
    }

  } catch (e) {
    console.error('Customization failed:', e);
  } finally {
    // Must be called to resume player launch
    if (typeof window.rscpCustomizationCompleted === 'function') {
      window.rscpCustomizationCompleted();
    } else {
      console.warn('rscpCustomizationCompleted not available on window.');
    }
  }
})();
