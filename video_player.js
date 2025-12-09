(function () {
  try {
    console.log("player ad script added");
    const outerIframe = document.getElementById('ScormContent');
    if (!outerIframe) { console.error('❌ ScormContent iframe not found'); return; }

    const onIframeReady = () => {
      const innerWin = outerIframe.contentWindow;
      const innerDoc = outerIframe.contentDocument || innerWin.document;
      if (!innerDoc) { console.error('❌ Unable to access iframe document'); return; }

      // Debug: list iframes inside inner doc
      const innerIframes = innerDoc.querySelectorAll('iframe');
      console.log(`Found ${innerIframes.length} inner iframes:`, innerIframes);

      // Helper: deep query including shadow DOM
      const queryDeep = (root, selector) => {
        // Try normal query
        const direct = root.querySelector(selector);
        if (direct) return direct;
        // Traverse shadow roots
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
        while (walker.nextNode()) {
          const el = walker.currentNode;
          if (el.shadowRoot) {
            const found = el.shadowRoot.querySelector(selector);
            if (found) return found;
          }
        }
        return null;
      };

      // Wait for element with extended timeout and optional deep search
      const waitForElDeep = (root, selector, timeoutMs = 20000) => {
        return new Promise((resolve, reject) => {
          const tryFind = () => queryDeep(root, selector);
          const first = tryFind();
          if (first) return resolve(first);

          const obs = new MutationObserver(() => {
            const found = tryFind();
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

      const onInnerDomReady = async () => {
        try {
          // Try multiple possible selectors
          const containerSelectors = [
            '#rscpAu-MediaContainer',
            '.rscpAu-MediaContainer',
            '#player-container',
            '.video-container'
          ];
          const videoSelectors = [
            '#rscpAu-Media',
            'video#rscpAu-Media',
            'video',
            'video.rscpAu-Media'
          ];

          // If content is inside a nested iframe, pick the correct one
          let searchRoot = innerDoc;
          if (innerIframes.length) {
            // Heuristic: pick the iframe that contains a <video> or known container later
            for (const f of innerIframes) {
              try {
                const doc = f.contentDocument || f.contentWindow?.document;
                if (doc) {
                  const maybeVideo = doc.querySelector('video');
                  const maybeContainer = doc.querySelector('#rscpAu-MediaContainer, .rscpAu-MediaContainer, #player-container, .video-container');
                  if (maybeVideo || maybeContainer) {
                    searchRoot = doc;
                    console.log('Using nested iframe as search root:', f);
                    break;
                  }
                }
              } catch {}
            }
          }

          // Find container
          let mediaContainer = null;
          for (const sel of containerSelectors) {
            try {
              mediaContainer = await waitForElDeep(searchRoot, sel, 20000);
              if (mediaContainer) { console.log('Found container via', sel); break; }
            } catch {}
          }
          if (!mediaContainer) throw new Error('Media container not found with known selectors');

          // Find video
          let video = null;
          for (const sel of videoSelectors) {
            try {
              video = await waitForElDeep(searchRoot, sel, 20000);
              if (video && video.tagName.toLowerCase() === 'video') { console.log('Found video via', sel); break; }
            } catch {}
          }
          if (!video) throw new Error('Video element not found with known selectors');

          // Add styles
          const styleTargetDoc = searchRoot; // target the doc where elements live
          const style = styleTargetDoc.createElement('style');
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
          styleTargetDoc.head.appendChild(style);

          // Create overlay
          const overlay = styleTargetDoc.createElement('div');
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

          // Insert overlay and wire events
          mediaContainer.style.position = 'relative';
          mediaContainer.appendChild(overlay);

          video.addEventListener('pause', () => overlay.classList.add('show'));
          video.addEventListener('play', () => overlay.classList.remove('show'));
          video.addEventListener('ended', () => overlay.classList.remove('show'));

          console.log('✅ Overlay wired to video successfully!');
        } catch (err) {
          // Dump some DOM to help identify selectors
          try {
            const root = innerDoc;
            console.log('Top-level inner DOM tags:', Array.from(root.querySelectorAll('*')).slice(0, 50).map(n => n.tagName));
            const vids = root.querySelectorAll('video');
            console.log(`Found ${vids.length} <video> in top inner doc`, vids);
            const ifr = root.querySelectorAll('iframe');
            console.log(`Found ${ifr.length} nested iframes in top inner doc`, ifr);
          } catch {}
          console.error('❌ Required elements not found:', err.message);
        }
      };

      if (innerDoc.readyState === 'complete' || innerDoc.readyState === 'interactive') {
        onInnerDomReady();
      } else {
        innerDoc.addEventListener('DOMContentLoaded', onInnerDomReady, { once: true });
      }
    };

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
