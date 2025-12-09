(function () {
  console.log("Player customization script started");

  const TIMEOUT_MS = 20000; // 20 seconds

  // Helper: Wait for element using MutationObserver
  const waitForElement = (root, selector, timeout = TIMEOUT_MS) => {
    return new Promise((resolve, reject) => {
      // Check if element already exists
      const element = root.querySelector(selector);
      if (element) {
        console.log(`✓ ${selector} found immediately`);
        resolve(element);
        return;
      }

      console.log(`Waiting for ${selector}...`);

      const observer = new MutationObserver((mutations, obs) => {
        const found = root.querySelector(selector);
        if (found) {
          console.log(`✓ ${selector} found via mutation`);
          obs.disconnect();
          clearTimeout(timer);
          resolve(found);
        }
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });

      const timer = setTimeout(() => {
        observer.disconnect();
        console.error(`✗ Timeout waiting for ${selector} in:`, root);
        console.log('Current HTML:', root.documentElement?.outerHTML || root.innerHTML);
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  };

  // Main customization logic
  const addOverlay = async () => {
    try {
      console.log("Step 1: Waiting for ScormContent iframe...");
      
      // Wait for iframe in parent document
      const iframe = await waitForElement(document, '#ScormContent', 10000);
      console.log("✓ Iframe element found");

      // Wait a bit for iframe to start loading
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("Step 2: Accessing iframe content...");
      
      // Function to get iframe document with retries
      const getIframeDoc = async (retries = 10) => {
        for (let i = 0; i < retries; i++) {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc && doc.readyState) {
              console.log(`✓ Iframe doc accessible (readyState: ${doc.readyState})`);
              
              // Wait for body to exist
              if (!doc.body) {
                console.log("Waiting for iframe body...");
                await new Promise(resolve => setTimeout(resolve, 200));
                continue;
              }
              
              return doc;
            }
          } catch (e) {
            console.warn(`Attempt ${i + 1}: Cannot access iframe doc`, e.message);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        throw new Error('Cannot access iframe document after retries');
      };

      const innerDoc = await getIframeDoc();
      console.log("✓ Iframe document ready, body exists");
      
      // Log what's in the iframe
      console.log("Iframe body classes:", innerDoc.body.className);
      console.log("Iframe body id:", innerDoc.body.id);
      console.log("Iframe HTML preview:", innerDoc.body.innerHTML.substring(0, 500));

      // Wait for iframe's own scripts to load
      if (innerDoc.readyState !== 'complete') {
        console.log("Waiting for iframe DOMContentLoaded...");
        await new Promise(resolve => {
          if (innerDoc.readyState === 'complete') {
            resolve();
          } else {
            innerDoc.addEventListener('DOMContentLoaded', resolve, { once: true });
            // Fallback
            setTimeout(resolve, 3000);
          }
        });
      }

      console.log("Step 3: Waiting for media elements...");
      
      // Try to find elements with more detailed logging
      const checkElements = () => {
        const container = innerDoc.querySelector('#rscpAu-MediaContainer');
        const video = innerDoc.querySelector('#rscpAu-Media');
        console.log('Container found:', !!container);
        console.log('Video found:', !!video);
        
        // Check for any similar elements
        const allDivs = innerDoc.querySelectorAll('div[id*="Media"], div[id*="Container"]');
        const allVideos = innerDoc.querySelectorAll('video');
        console.log('Divs with Media/Container in id:', allDivs.length, Array.from(allDivs).map(d => d.id));
        console.log('All video elements:', allVideos.length);
      };
      
      checkElements();

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
      console.error('❌ Customization failed:', error.message, error);
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
