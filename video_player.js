(function () {
  try {
    console.log("player ad script added");
    const outerIframe = document.getElementById('ScormContent');
    console.log("outer iframe", outerIframe);
    if (!outerIframe) {
      console.error('❌ ScormContent iframe not found');
      return;
    }

    const onIframeReady = () => {
      const innerDoc = outerIframe.contentDocument || outerIframe.contentWindow.document;
      if (!innerDoc) {
        console.error('❌ Unable to access iframe document (cross-origin or not ready)');
        return;
      }
      console.log("inner doc", innerDoc);

      const onInnerDomReady = () => {
        // Helper: wait for an element to appear
        const waitForEl = (selector, root = innerDoc, timeoutMs = 5000) => {
          return new Promise((resolve, reject) => {
            const el = root.querySelector(selector);
            if (el) return resolve(el);

            const obs = new MutationObserver(() => {
              const found = root.querySelector(selector);
              if (found) {
                obs.disconnect();
                resolve(found);
              }
            });

            obs.observe(root, { childList: true, subtree: true });

            const t = setTimeout(() => {
              obs.disconnect();
              reject(new Error(`Timeout waiting for ${selector}`));
            }, timeoutMs);
          });
        };

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

        // Wait for container and video, then wire up
        Promise.all([
          waitForEl('#rscpAu-MediaContainer'),
          waitForEl('#rscpAu-Media')
        ]).then(([mediaContainer, video]) => {
          mediaContainer.style.position = 'relative';
          mediaContainer.appendChild(overlay);

          video.addEventListener('pause', () => overlay.classList.add('show'));
          video.addEventListener('play', () => overlay.classList.remove('show'));
          video.addEventListener('ended', () => overlay.classList.remove('show'));

          console.log('✅ Netflix-style left overlay added successfully!');
        }).catch(err => {
          console.error('❌ Required elements not found:', err.message);
        });
      };

      // If inner DOM is already ready, run immediately; else wait
      if (innerDoc.readyState === 'complete' || innerDoc.readyState === 'interactive') {
        onInnerDomReady();
      } else {
        innerDoc.addEventListener('DOMContentLoaded', onInnerDomReady, { once: true });
      }
    };

    // If iframe already loaded, run immediately; else wait
    if (outerIframe.contentDocument && outerIframe.contentDocument.readyState !== 'loading') {
      onIframeReady();
    } else {
      outerIframe.addEventListener('load', onIframeReady, { once: true });
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
