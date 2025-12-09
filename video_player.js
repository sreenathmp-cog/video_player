(function () {
  try {
    const outerIframe = document.getElementById('ScormContent');
    if (!outerIframe) {
      console.error('❌ ScormContent iframe not found');
      return;
    }

    const waitForEl = (doc, selector, timeoutMs = 8000) => {
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

        setTimeout(() => {
          obs.disconnect();
          reject(new Error(`Timeout waiting for ${selector}`));
        }, timeoutMs);
      });
    };

    const init = async () => {
      const innerDoc = outerIframe.contentDocument || outerIframe.contentWindow.document;
      if (!innerDoc) {
        console.error('❌ Unable to access iframe document');
        return;
      }

      // Ensure inner DOM is ready
      if (innerDoc.readyState === 'loading') {
        await new Promise(res => innerDoc.addEventListener('DOMContentLoaded', res, { once: true }));
      }

      // Wait specifically for the body with id mediaContent
      const mediaBody = await waitForEl(innerDoc, 'body#mediaContent').catch(e => {
        console.error('mediaContent not found:', e.message);
        return null;
      });
      console.log('body content:', mediaBody);

      // Now wait for the container and video inside
      const mediaContainer = await waitForEl(innerDoc, '#rscpAu-MediaContainer');
      const video = await waitForEl(innerDoc, '#rscpAu-Media');

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
    };

    // If iframe already ready, run now; else wait
    if (outerIframe.contentDocument && outerIframe.contentDocument.readyState !== 'loading') {
      init();
    } else {
      outerIframe.addEventListener('load', init, { once: true });
    }
  } catch (e) {
    console.error('Customization failed:', e);
  } finally {
    if (typeof window.rscpCustomizationCompleted === 'function') {
      window.rscpCustomizationCompleted();
    } else {
      console.warn('rscpCustomizationCompleted not available on window.');
    }
  }
})();
