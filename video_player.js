/**
 * RusticiEngine Custom Video Player with Full Accessibility
 * 
 * ACCESSIBILITY FEATURES:
 * ========================
 * 
 * ARIA Attributes:
 * - All controls have proper aria-label, aria-expanded, aria-checked attributes
 * - Video has role="application" for custom controls
 * - Media container has role="region" and aria-label="Video player"
 * - Progress bar has role="slider" with aria-valuemin/max/now
 * - Volume slider has role="slider" with proper ARIA attributes
 * - Speed menu has role="menu" with menuitemradio items
 * - Overlay content has role="complementary" with heading roles
 * 
 * Keyboard Navigation:
 * - Space/K: Play/Pause video
 * - Arrow Left: Rewind 5 seconds
 * - Arrow Right: Forward 5 seconds
 * - Arrow Up: Increase volume
 * - Arrow Down: Decrease volume
 * - M: Mute/Unmute
 * - F: Toggle fullscreen
 * - Tab: Navigate through all controls
 * - Enter/Space: Activate buttons
 * - Arrow Up/Down: Navigate speed menu
 * - Escape: Close speed menu
 * - Home/End: Jump to first/last speed option
 * 
 * Screen Reader Support:
 * - Live region announcements for all state changes
 * - Descriptive labels for all interactive elements
 * - Time announcements (current time, duration)
 * - Volume level announcements
 * - Playback speed announcements
 * - Skip/seek announcements with direction and time
 * 
 * Focus Management:
 * - All interactive elements are keyboard accessible
 * - Visible focus indicators (outline on focus)
 * - Logical tab order
 * - Controls show on focus for keyboard users
 * - Speed menu returns focus to button on close
 * 
 * Visual Accessibility:
 * - High contrast controls (white on dark background)
 * - Sufficient button sizes (min 2.25rem/36px)
 * - Clear hover states
 * - Responsive sizing for all screen sizes
 * - Semi-transparent overlay background for text readability
 * 
 * Responsive Design:
 * - All elements use rem units for proper scaling
 * - Media queries for mobile (≤480px) and tablet (≤768px)
 * - Center pause icon scales appropriately
 * - Overlay text scales with clamp() for all viewports
 */

(function () {
  'use strict';

  const CONFIG = {
    TIMEOUT_MS: 30000,
    POLL_INTERVAL_MS: 500,
    IFRAME_SELECTOR: '#ScormContent',
    CONTAINER_SELECTOR: '#rscpAu-MediaContainer',
    VIDEO_SELECTOR: '#rscpAu-Media',
    OVERLAY_CLASS: 'video-overlay',
    CONTROLS_CLASS: 'custom-video-controls',
    STYLE_ID: 'video-overlay-styles',
    ICONS_PATH: 'C:/Users/2009983/LMS-PROJECT-WORKSPACE-SETUP/FRONT-END/video-player-icons/'
  };

  // Inline SVG Icons
  const ICONS = {
    play: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
      alt: 'Play'
    },
    pause: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`,
      alt: 'Pause'
    },
    centerPause: {
      svg: `<svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="35" cy="35" r="35" fill="#D9D9D9"/><path d="M45.5 35.5837L30.625 44.1717V26.9956L45.5 35.5837Z" fill="#2F78C4"/></svg>`,
      alt: 'Paused'
    },
    rewind: {
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9619 5.64261V2.85261C11.9619 2.40261 11.4219 2.18261 11.1119 2.50261L7.32194 6.29261C7.12194 6.49261 7.12194 6.80261 7.32194 7.00261L11.1119 10.7926C11.4219 11.1026 11.9619 10.8826 11.9619 10.4426V7.64261C15.6919 7.64261 18.6419 11.0626 17.8219 14.9326C17.3519 17.2026 15.5119 19.0326 13.2519 19.5026C9.68194 20.2526 6.50194 17.8026 6.02194 14.4926C5.96194 14.0126 5.54194 13.6426 5.04194 13.6426C4.44194 13.6426 3.96194 14.1726 4.04194 14.7726C4.66194 19.1626 8.84194 22.4126 13.5719 21.4926C16.6919 20.8826 19.2019 18.3726 19.8119 15.2526C20.8019 10.1226 16.9119 5.64261 11.9619 5.64261ZM10.8619 16.6426H10.0119V13.3826L9.00194 13.6926V13.0026L10.7719 12.3726H10.8619V16.6426ZM15.1419 14.8826C15.1419 15.2026 15.1119 15.4826 15.0419 15.7026C14.9719 15.9226 14.8719 16.1226 14.7519 16.2726C14.6319 16.4226 14.4719 16.5326 14.3019 16.6026C14.1319 16.6726 13.9319 16.7026 13.7119 16.7026C13.4919 16.7026 13.3019 16.6726 13.1219 16.6026C12.9419 16.5326 12.7919 16.4226 12.6619 16.2726C12.5319 16.1226 12.4319 15.9326 12.3619 15.7026C12.2919 15.4726 12.2519 15.2026 12.2519 14.8826V14.1426C12.2519 13.8226 12.2819 13.5426 12.3519 13.3226C12.4219 13.1026 12.5219 12.9026 12.6419 12.7526C12.7619 12.6026 12.9219 12.4926 13.0919 12.4226C13.2619 12.3526 13.4619 12.3226 13.6819 12.3226C13.9019 12.3226 14.0919 12.3526 14.2719 12.4226C14.4519 12.4926 14.6019 12.6026 14.7319 12.7526C14.8619 12.9026 14.9619 13.0926 15.0319 13.3226C15.1019 13.5526 15.1419 13.8226 15.1419 14.1426V14.8826ZM14.2919 14.0226C14.2919 13.8326 14.2819 13.6726 14.2519 13.5426C14.2219 13.4126 14.1819 13.3126 14.1319 13.2326C14.0819 13.1526 14.0219 13.0926 13.9419 13.0626C13.8619 13.0326 13.7819 13.0126 13.6919 13.0126C13.6019 13.0126 13.5119 13.0326 13.4419 13.0626C13.3719 13.0926 13.3019 13.1526 13.2519 13.2326C13.2019 13.3126 13.1619 13.4126 13.1319 13.5426C13.1019 13.6726 13.0919 13.8326 13.0919 14.0226V14.9926C13.0919 15.1826 13.1019 15.3426 13.1319 15.4726C13.1619 15.6026 13.2019 15.7126 13.2519 15.7926C13.3019 15.8726 13.3619 15.9326 13.4419 15.9626C13.5219 15.9926 13.6019 16.0126 13.6919 16.0126C13.7819 16.0126 13.8719 15.9926 13.9419 15.9626C14.0119 15.9326 14.0819 15.8726 14.1319 15.7926C14.1819 15.7126 14.2219 15.6026 14.2419 15.4726C14.2619 15.3426 14.2819 15.1826 14.2819 14.9926V14.0226H14.2919Z" fill="white"/></svg>`,
      alt: 'Rewind 10 seconds'
    },
    forward: {
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.9526 13.6486C18.4526 13.6486 18.0426 14.0186 17.9726 14.5086C17.4926 17.8786 14.2026 20.3486 10.5526 19.4686C8.30259 18.9286 6.64259 17.1986 6.16259 14.9386C5.35259 11.0686 8.30259 7.64862 12.0326 7.64862V10.4386C12.0326 10.8886 12.5726 11.1086 12.8826 10.7886L16.6726 6.99862C16.8726 6.79862 16.8726 6.48862 16.6726 6.28862L12.8826 2.49862C12.5726 2.18862 12.0326 2.40862 12.0326 2.85862V5.64862C7.09259 5.64862 3.19259 10.1286 4.19259 15.2486C4.79259 18.3586 7.09259 20.7486 10.1826 21.4386C15.0126 22.5186 19.3326 19.2386 19.9526 14.7686C20.0426 14.1786 19.5526 13.6486 18.9526 13.6486ZM10.9326 16.6486V12.3786H10.8426L9.07259 13.0086V13.6986L10.0826 13.3886V16.6486H10.9326ZM14.3526 12.4286C14.1726 12.3586 13.9826 12.3286 13.7626 12.3286C13.5426 12.3286 13.3526 12.3586 13.1726 12.4286C12.9926 12.4986 12.8426 12.6086 12.7226 12.7586C12.6026 12.9086 12.4926 13.0986 12.4326 13.3286C12.3726 13.5586 12.3326 13.8286 12.3326 14.1486V14.8886C12.3326 15.2086 12.3726 15.4886 12.4426 15.7086C12.5126 15.9286 12.6126 16.1286 12.7426 16.2786C12.8726 16.4286 13.0226 16.5386 13.2026 16.6086C13.3826 16.6786 13.5726 16.7086 13.7926 16.7086C14.0126 16.7086 14.2026 16.6786 14.3826 16.6086C14.5626 16.5386 14.7126 16.4286 14.8326 16.2786C14.9526 16.1286 15.0526 15.9386 15.1226 15.7086C15.1926 15.4786 15.2226 15.2086 15.2226 14.8886V14.1486C15.2226 13.8286 15.1826 13.5486 15.1126 13.3286C15.0426 13.1086 14.9426 12.9086 14.8126 12.7586C14.6826 12.6086 14.5226 12.4986 14.3526 12.4286ZM14.3626 14.9986C14.3626 15.1886 14.3526 15.3486 14.3226 15.4786C14.2926 15.6086 14.2626 15.7186 14.2126 15.7986C14.1626 15.8786 14.1026 15.9386 14.0226 15.9686C13.9426 15.9986 13.8626 16.0186 13.7726 16.0186C13.6826 16.0186 13.5926 15.9986 13.5226 15.9686C13.4526 15.9386 13.3826 15.8786 13.3326 15.7986C13.2826 15.7186 13.2426 15.6086 13.2126 15.4786C13.1826 15.3486 13.1726 15.1886 13.1726 14.9986V14.0286C13.1726 13.8386 13.1826 13.6786 13.2126 13.5486C13.2426 13.4186 13.2726 13.3186 13.3326 13.2386C13.3926 13.1586 13.4426 13.0986 13.5226 13.0686C13.6026 13.0386 13.6826 13.0186 13.7726 13.0186C13.8626 13.0186 13.9526 13.0386 14.0226 13.0686C14.0926 13.0986 14.1626 13.1586 14.2126 13.2386C14.2626 13.3186 14.3026 13.4186 14.3326 13.5486C14.3626 13.6786 14.3726 13.8386 14.3726 14.0286V14.9986H14.3626Z" fill="white"/></svg>`,
      alt: 'Forward 10 seconds'
    },
    volume: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
      alt: 'Volume'
    },
    volumeMute: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
      alt: 'Mute'
    },
    settings: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>`,
      alt: 'Settings'
    },
    transcript: {
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16ZM6 12H8V14H6V12ZM6 9H8V11H6V9ZM6 6H8V8H6V6ZM10 12H15V14H10V12ZM10 9H18V11H10V9ZM10 6H18V8H10V6Z" fill="white"/></svg>`,
      alt: 'Transcript'
    },
    fullscreen: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
      alt: 'Fullscreen'
    },
    fullscreenExit: {
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
      alt: 'Exit Fullscreen'
    }
  };

  // Helper function to create inline SVG icon element
  const createSvgIcon = (icon, className = '') => {
    return `<span class="svg-icon ${className}" role="img" aria-label="${icon.alt}">${icon.svg}</span>`;
  };

  const STYLES = `
    @font-face {
      font-family: 'GellixSemiBold';
      src: local('GellixSemiBold'), 
           local('Gellix-SemiBold'),
           url('fonts/OpenType-TT/Gellix-SemiBold_R.ttf') format('truetype');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'GellixRegular';
      src: local('GellixRegular'), 
           local('Gellix-Regular'),
           url('fonts/OpenType-TT/Gellix-Regular_R.ttf') format('truetype');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    
    /* Hide default RusticiEngine UI elements - Comprehensive */
    .rscpMedia-filename,
    .rscpMedia-close,
    .rscp-close,
    .rscp-filename,
    [class*="filename"],
    [class*="close"],
    [class*="Close"],
    button[title*="Close"],
    button[title*="close"],
    a[title*="Close"],
    a[title*="close"],
    span:has-text("close"),
    div:has-text(".mp4") {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      left: -9999px !important;
      pointer-events: none !important;
    }
    
    /* Video Container - Full Width */
    ${CONFIG.CONTAINER_SELECTOR} {
      overflow: hidden !important;
      width: 100% !important;
      max-width: 100% !important;
      position: relative !important;
    }
    
    /* Hide any siblings of video container that might be close/filename */
    ${CONFIG.CONTAINER_SELECTOR} ~ * {
      display: none !important;
    }
    
    /* Video Element - Full Width */
    ${CONFIG.VIDEO_SELECTOR} {
      width: 100% !important;
      height: auto !important;
      display: block !important;
    }
    
    .video-overlay {
      position: absolute;
      bottom: 35%;
      left: 6%;
      max-width: clamp(15rem, 35vw, 25rem);
      height: fit-content;
      display: none;
      justify-content: flex-start;
      align-items: flex-start;
      z-index: 1002;
      pointer-events: none;
      transition: all 0.3s ease;
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
      max-width: 100%;
      color: #FFFFFF;
      padding: 0.5rem;
    }
    
    /* Center Pause Icon - Fully Responsive */
    .center-pause-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10vw;
      height: 10vh;
      z-index: 1001;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.2s ease;
      display: none;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      .center-pause-icon {
        width: 8vw;
        height: 8vh;
      }
    }
    @media (max-width: 480px) {
      .center-pause-icon {
        width: 6vw;
        height: 6vh;
      }
    }
    .center-pause-icon.show {
      display: block;
      opacity: 1;
      animation: fadeInScale 0.3s ease;
    }
    .center-pause-icon:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }
    @keyframes fadeInScale {
      from { 
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to { 
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
    .center-pause-icon svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0.125rem 0.5rem rgba(0, 0, 0, 0.3));
    }
    
    /* Overlay Text - Fully Responsive */
    .overlay-title { 
      font-family: 'GellixSemiBold', Arial, sans-serif;
      font-weight: 600;
      font-size: clamp(1rem, 2vw, 1.5rem);
      line-height: 1.4;
      letter-spacing: 0%;
      margin-bottom: clamp(0.5rem, 1vw, 1rem);
      word-wrap: break-word;
    }
    .overlay-description { 
      font-family: 'GellixRegular', Arial, sans-serif;
      font-weight: 400;
      font-size: clamp(0.75rem, 1.5vw, 1rem);
      line-height: 1.5;
      letter-spacing: 0%;
      word-wrap: break-word;
    }
    

    
    /* Responsive adjustments for mobile */
    @media (max-width: 480px) {
      .video-overlay {
        bottom: 25%;
      }
      .overlay-content {
        padding: 0.3rem;
      }
    }
    
    /* Hide default video controls */
    ${CONFIG.VIDEO_SELECTOR}::-webkit-media-controls {
      display: none !important;
    }
    ${CONFIG.VIDEO_SELECTOR}::-webkit-media-controls-enclosure {
      display: none !important;
    }
    
    /* Custom Controls Container - Inside Video */
    .custom-video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.75rem 1rem;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
      pointer-events: auto;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      z-index: 1000;
      box-sizing: border-box;
    }
    
    /* Single Row Layout */
    .controls-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      margin-left: 1%;
      margin-right: 1%;
    }
    @media (max-width: 768px) {
      .custom-video-controls {
        padding: 0.5rem 0.75rem;
      }
      .controls-row {
        gap: 0.35rem;
        margin-bottom: 0.35rem;
      }
    }
    @media (max-width: 480px) {
      .custom-video-controls {
        padding: 0.4rem 0.5rem;
      }
      .controls-row {
        gap: 0.25rem;
        margin-bottom: 0.25rem;
      }
    }
    
    /* Buttons with Accessibility */
    .custom-video-controls button {
      background: transparent;
      color: white;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      font-size: 1.125rem;
      font-family: Arial, sans-serif;
      transition: all 0.2s ease;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 2.25rem;
      height: 2.25rem;
      flex-shrink: 0;
      outline: none;
    }
    .custom-video-controls button:focus-visible {
      outline: 0.125rem solid #3ea6ff;
      outline-offset: 0.125rem;
    }
    .custom-video-controls button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    /* Play/Pause button */
    .play-pause-btn {
      font-size: 1.5rem !important;
    }
    @media (max-width: 768px) {
      .custom-video-controls button {
        min-width: 1.875rem;
        height: 1.875rem;
        padding: 0.375rem;
      }
      .play-pause-btn {
        font-size: 1.25rem !important;
      }
    }
    @media (max-width: 480px) {
      .custom-video-controls button {
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0.25rem;
      }
      .play-pause-btn {
        font-size: 1rem !important;
      }
    }
    
    /* Skip buttons */
    .skip-btn {
      position: relative;
    }
    .skip-btn span {
      position: absolute;
      font-size: 0.625rem;
      font-weight: bold;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      color: white;
    }
    
    /* Speed Control */
    .speed-control {
      position: relative;
    }
    .speed-button {
      min-width: 2.5rem !important;
      height: 1.5rem !important;
      background-color: #736E6E !important;
      border-radius: 0.75rem !important;
      font-family: 'GellixSemiBold', Arial, sans-serif !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      line-height: 100%;
      letter-spacing: 0%;
      color: white !important;
      border: none !important;
      padding: 0 0.75rem !important;
    }
    .speed-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      background: rgba(28, 28, 28, 0.95);
      border-radius: 0.5rem;
      padding: 0.5rem 0;
      margin-bottom: 0.5rem;
      min-width: 4.375rem;
      display: none;
      box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.4);
      font-family: 'GellixRegular', Arial, sans-serif !important;
    }
    @media (max-width: 768px) {
      .speed-button {
        min-width: 2rem !important;
        height: 1.25rem !important;
        font-size: 0.75rem !important;
        padding: 0 0.5rem !important;
      }
      .speed-menu {
        min-width: 3.5rem;
      }
    }
    @media (max-width: 480px) {
      .speed-button {
        min-width: 1.75rem !important;
        height: 1.125rem !important;
        font-size: 0.625rem !important;
        padding: 0 0.4rem !important;
      }
      .speed-menu {
        min-width: 3rem;
      }
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
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: white;
      text-align: center;
      transition: background 0.2s;
      outline: none;
    }
    .speed-option:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .speed-option:focus {
      background: rgba(255, 255, 255, 0.2);
      outline: 0.125rem solid #3ea6ff;
      outline-offset: -0.125rem;
    }
    .speed-option.active {
      color: #3ea6ff;
      font-weight: 600;
    }
    .speed-option[aria-checked="true"]::before {
      content: '✓ ';
      margin-right: 0.25rem;
    }
    @media (max-width: 768px) {
      .speed-option {
        padding: 0.4rem 0.75rem;
        font-size: 0.75rem;
      }
    }
    @media (max-width: 480px) {
      .speed-option {
        padding: 0.3rem 0.5rem;
        font-size: 0.625rem;
      }
    }
    
    /* Progress Bar Container */
    .progress-container {
      flex: 1;
    }
    
    /* Progress Bar with Accessibility */
    .video-progress-container {
      width: 100%;
      height: 0.375rem;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      border-radius: 0.3125rem;
      box-sizing: border-box;
      position: relative;
      outline: none;
    }
    .video-progress-container:hover {
      height: 0.5rem;
    }
    .video-progress-container:focus {
      outline: 0.125rem solid #3ea6ff;
      outline-offset: 0.125rem;
      height: 0.5rem;
    }
    .video-progress-bar {
      height: 100%;
      background: #3ea6ff;
      border-radius: 0.3125rem;
      transition: background 0.2s;
      position: relative;
    }
    .video-progress-container:focus .video-progress-bar::after {
      content: '';
      position: absolute;
      right: -0.375rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.75rem;
      height: 0.75rem;
      background: #3ea6ff;
      border-radius: 50%;
      border: 0.125rem solid white;
      box-shadow: 0 0 0 0.0625rem rgba(0,0,0,0.3);
    }
    .video-progress-container:hover .video-progress-bar::after {
      opacity: 1;
    }
    @media (max-width: 768px) {
      .video-progress-container {
        height: 0.3rem;
      }
      .video-progress-container:hover,
      .video-progress-container:focus {
        height: 0.4rem;
      }
    }
    @media (max-width: 480px) {
      .video-progress-container {
        height: 0.25rem;
      }
      .video-progress-container:hover,
      .video-progress-container:focus {
        height: 0.35rem;
      }
    }
    
    /* Volume Control */
    .volume-control {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .volume-slider {
      width: 0;
      height: 0.3125rem;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 0.125rem;
      cursor: pointer;
      position: relative;
      overflow: visible;
      transition: width 0.3s ease;
      outline: none;
    }
    .volume-control:hover .volume-slider,
    .volume-slider:focus {
      width: 3.75rem;
    }
    .volume-slider:focus {
      outline: 0.125rem solid #3ea6ff;
      outline-offset: 0.125rem;
    }
    .volume-bar {
      height: 100%;
      background: white;
      width: 100%;
      border-radius: 0.125rem;
      position: relative;
    }
    .volume-slider:focus .volume-bar::after {
      content: '';
      position: absolute;
      right: -0.25rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.625rem;
      height: 0.625rem;
      background: white;
      border-radius: 50%;
      border: 0.125rem solid #3ea6ff;
      box-shadow: 0 0 0 0.0625rem rgba(0,0,0,0.3);
    }
    @media (max-width: 768px) {
      .volume-control:hover .volume-slider,
      .volume-slider:focus {
        width: 3rem;
      }
    }
    @media (max-width: 480px) {
      .volume-control:hover .volume-slider,
      .volume-slider:focus {
        width: 2.5rem;
      }
      .volume-slider {
        height: 0.25rem;
      }
    }
    
    /* Icon buttons */
    .icon-btn {
      font-size: 1.25rem !important;
    }
    @media (max-width: 768px) {
      .icon-btn {
        font-size: 1rem !important;
      }
    }
    @media (max-width: 480px) {
      .icon-btn {
        font-size: 0.875rem !important;
      }
    }
    
    /* SVG Icon Styles */
    .svg-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      pointer-events: none;
    }
    .svg-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
      color: white;
    }
    .play-pause-btn .svg-icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    .skip-btn .svg-icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    @media (max-width: 768px) {
      .svg-icon {
        width: 1rem;
        height: 1rem;
      }
      .play-pause-btn .svg-icon,
      .skip-btn .svg-icon {
        width: 1.25rem;
        height: 1.25rem;
      }
    }
    @media (max-width: 480px) {
      .svg-icon {
        width: 0.875rem;
        height: 0.875rem;
      }
      .play-pause-btn .svg-icon,
      .skip-btn .svg-icon {
        width: 1rem;
        height: 1rem;
      }
    }
  `;

  const OVERLAY_HTML = `
    <div class="overlay-content" role="complementary" aria-label="Video information">
      <div class="overlay-title" role="heading" aria-level="2">People on roads</div>
      <div class="overlay-description">
        Learn about this video content. This is where you can add 
        detailed information about what viewers will learn and 
        key takeaways from this lesson.
      </div>
    </div>
  `;

  const CONTROLS_HTML = `
    <div class="controls-row" role="group" aria-label="Video controls">
      <button class="play-pause-btn" title="Play/Pause" data-state="play" aria-label="Play video" tabindex="0">
        ${createSvgIcon(ICONS.play)}
      </button>
      <button class="skip-btn" data-skip="-10" title="Rewind 10 seconds" aria-label="Rewind 10 seconds" tabindex="0">
        ${createSvgIcon(ICONS.rewind)}
      </button>
      <div class="speed-control">
        <button class="speed-button" title="Playback speed" aria-label="Playback speed, current speed 1x" aria-haspopup="true" aria-expanded="false" tabindex="0">1X</button>
        <div class="speed-menu" role="menu" aria-label="Playback speed options">
          <div class="speed-option" data-speed="0.5" role="menuitemradio" tabindex="-1" aria-checked="false">0.5X</div>
          <div class="speed-option" data-speed="0.75" role="menuitemradio" tabindex="-1" aria-checked="false">0.75X</div>
          <div class="speed-option active" data-speed="1" role="menuitemradio" tabindex="-1" aria-checked="true">Normal</div>
          <div class="speed-option" data-speed="1.25" role="menuitemradio" tabindex="-1" aria-checked="false">1.25X</div>
          <div class="speed-option" data-speed="1.5" role="menuitemradio" tabindex="-1" aria-checked="false">1.5X</div>
          <div class="speed-option" data-speed="1.75" role="menuitemradio" tabindex="-1" aria-checked="false">1.75X</div>
          <div class="speed-option" data-speed="2" role="menuitemradio" tabindex="-1" aria-checked="false">2X</div>
        </div>
      </div>
      <button class="skip-btn" data-skip="10" title="Forward 10 seconds" aria-label="Forward 10 seconds" tabindex="0">
        ${createSvgIcon(ICONS.forward)}
      </button>
      <div class="progress-container">
        <div class="video-progress-container" role="slider" aria-label="Video progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
          <div class="video-progress-bar"></div>
        </div>
      </div>
      <div class="volume-control">
        <button class="icon-btn volume-btn" title="Volume" data-state="unmuted" aria-label="Mute/Unmute" tabindex="0">
          ${createSvgIcon(ICONS.volume)}
        </button>
        <div class="volume-slider" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" tabindex="0">
          <div class="volume-bar"></div>
        </div>
      </div>
      <button class="icon-btn settings-btn" title="Settings" aria-label="Settings" tabindex="0">
        ${createSvgIcon(ICONS.settings)}
      </button>
      <button class="icon-btn transcript-btn" title="Transcript" aria-label="Transcript" tabindex="0">
        ${createSvgIcon(ICONS.transcript)}
      </button>
      <button class="icon-btn fullscreen-btn" title="Fullscreen" data-state="normal" aria-label="Fullscreen" tabindex="0">
        ${createSvgIcon(ICONS.fullscreen)}
      </button>
    </div>
  `;

  const getIframeDocument = (iframe) => {
    try {
      return iframe.contentDocument || iframe.contentWindow?.document;
    } catch (e) {
      return null;
    }
  };


const sendMessageToParent = (messageType, payload = {}) => {
    try {
      window.parent.postMessage(
        {
          type: messageType,
          data: payload,
          source: 'mediaPlayerIframe',
          timestamp: Date.now()
        },
        '*' // Use specific origin in production for security
      );
      console.log(`📤 Message sent to parent: ${messageType}`, payload);
    } catch (error) {
      console.error('Failed to send message to parent:', error);
    }
  };


  const initMessageListener = () => {
    window.addEventListener('message', (event) => {
      // Ignore messages from same window
      if (event.source === window) return;
      
      const { type, data, source } = event.data || {};
      
      // Only process messages intended for this iframe
      if (source === 'mediaPlayerIframe') return;
      
      console.log('📥 Message received from parent:', type, data);
      
      // Handle different message types
      switch (type) {
        case 'LESSON_SEQUENCE_DATA':
          handleLessonData(data);
          break;
        default:
          console.log('Unknown message type:', type);
      }
    });
    
    console.log('✅ Parent communication listener initialized');
  };

  const handleLessonData = (data) => {
    if (data && Array.isArray(data.lessons)) {
      // Process lesson data here
      console.log('Lesson sequence received:', data.lessons);
      console.log('Current index:', data.currentIndex);
      // You can update your lesson navigation here
    }
  };

  const injectStyles = (doc) => {
    if (doc.getElementById(CONFIG.STYLE_ID)) return;
    
    const style = doc.createElement('style');
    style.id = CONFIG.STYLE_ID;
    style.textContent = STYLES;
    doc.head.appendChild(style);
  };

  const createOverlay = (doc, video) => {
    const overlay = doc.createElement('div');
    overlay.className = CONFIG.OVERLAY_CLASS;
    overlay.innerHTML = OVERLAY_HTML;
    
    // Function to adjust overlay position based on actual video dimensions
    const adjustOverlayPosition = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const containerWidth = video.clientWidth;
      const containerHeight = video.clientHeight;
      
      if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) {
        return; // Wait for dimensions
      }
      
      // Calculate aspect ratios
      const videoAspectRatio = videoWidth / videoHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let actualVideoWidth, actualVideoHeight, leftOffset, topOffset;
      
      // Determine if video is letterboxed (black bars on top/bottom) or pillarboxed (black bars on sides)
      if (videoAspectRatio > containerAspectRatio) {
        // Video is wider - letterboxed (black bars top/bottom)
        actualVideoWidth = containerWidth;
        actualVideoHeight = containerWidth / videoAspectRatio;
        leftOffset = 0;
        topOffset = (containerHeight - actualVideoHeight) / 2;
      } else {
        // Video is taller - pillarboxed (black bars left/right)
        actualVideoHeight = containerHeight;
        actualVideoWidth = containerHeight * videoAspectRatio;
        leftOffset = (containerWidth - actualVideoWidth) / 2;
        topOffset = 0;
      }
      
      // Position overlay relative to actual video area (not black bars)
      const leftPercent = 8; // 8% from left edge of actual video
      const topPercent = 30; // 30% from top edge of actual video
      
      const calculatedLeft = leftOffset + (actualVideoWidth * leftPercent / 100);
      const calculatedTop = topOffset + (actualVideoHeight * topPercent / 100);
      const maxWidth = actualVideoWidth * 0.45; // Max 45% of actual video width
    };
    
    // Adjust on metadata load (when video dimensions are available)
    video.addEventListener('loadedmetadata', () => {
      adjustOverlayPosition();
    });
    
    // Adjust on window resize
    const resizeObserver = new ResizeObserver(() => {
      adjustOverlayPosition();
    });
    resizeObserver.observe(video);
    
    // Initial adjustment if metadata already loaded
    if (video.readyState >= 1) {
      setTimeout(adjustOverlayPosition, 100);
    }
    
    return overlay;
  };

  const createCenterPauseIcon = (doc) => {
    const centerPause = doc.createElement('div');
    centerPause.className = 'center-pause-icon';
    centerPause.innerHTML = ICONS.centerPause.svg;
    centerPause.setAttribute('aria-hidden', 'true');
    return centerPause;
  };

  // Helper function to format time for display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Create live region for screen reader announcements
  let liveRegion = null;
  const announceToScreenReader = (message) => {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  };

  const createCustomControls = (doc, video) => {
    const controlsContainer = doc.createElement('div');
    controlsContainer.className = CONFIG.CONTROLS_CLASS;
    controlsContainer.innerHTML = CONTROLS_HTML;

    const progressContainer = controlsContainer.querySelector('.video-progress-container');
    const progressBar = controlsContainer.querySelector('.video-progress-bar');
    const playPauseBtn = controlsContainer.querySelector('.play-pause-btn');
    const speedButton = controlsContainer.querySelector('.speed-button');
    const speedMenu = controlsContainer.querySelector('.speed-menu');
    const volumeBtn = controlsContainer.querySelector('.volume-btn');
    const volumeSlider = controlsContainer.querySelector('.volume-slider');
    const volumeBar = controlsContainer.querySelector('.volume-bar');
    const fullscreenBtn = controlsContainer.querySelector('.fullscreen-btn');

    // Function to adjust controls position based on actual video dimensions
    const adjustControlsPosition = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const containerWidth = video.clientWidth;
      const containerHeight = video.clientHeight;
      
      if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) {
        return; // Wait for dimensions
      }
      
      // Calculate aspect ratios
      const videoAspectRatio = videoWidth / videoHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let actualVideoWidth, actualVideoHeight, leftOffset, bottomOffset;
      
      // Determine if video is letterboxed (black bars on top/bottom) or pillarboxed (black bars on sides)
      if (videoAspectRatio > containerAspectRatio) {
        // Video is wider - letterboxed (black bars top/bottom)
        actualVideoWidth = containerWidth;
        actualVideoHeight = containerWidth / videoAspectRatio;
        leftOffset = 0;
        bottomOffset = (containerHeight - actualVideoHeight) / 2;
      } else {
        // Video is taller - pillarboxed (black bars left/right)
        actualVideoHeight = containerHeight;
        actualVideoWidth = containerHeight * videoAspectRatio;
        leftOffset = (containerWidth - actualVideoWidth) / 2;
        bottomOffset = 0;
      }
      
      // Position controls relative to actual video area using percentages
      const leftPercentOfContainer = (leftOffset / containerWidth) * 100;
      const bottomPercentOfContainer = (bottomOffset / containerHeight) * 100;
      const widthPercentOfContainer = (actualVideoWidth / containerWidth) * 100;
      
      controlsContainer.style.left = `${leftPercentOfContainer}%`;
      controlsContainer.style.bottom = `${bottomPercentOfContainer}%`;
      controlsContainer.style.width = `${widthPercentOfContainer}%`;
      controlsContainer.style.right = 'auto'; // Override the default right: 0
    };
    
    // Adjust on metadata load
    video.addEventListener('loadedmetadata', () => {
      adjustControlsPosition();
    });
    
    // Adjust on window resize
    const resizeObserver = new ResizeObserver(() => {
      adjustControlsPosition();
    });
    resizeObserver.observe(video);
    
    // Initial adjustment if metadata already loaded
    if (video.readyState >= 1) {
      setTimeout(adjustControlsPosition, 100);
    }

    // Remove default controls and add accessibility attributes to video
    video.removeAttribute('controls');
    video.setAttribute('tabindex', '-1'); // Prevent direct video focus, use controls instead
    video.setAttribute('aria-label', 'Video content');
    video.setAttribute('role', 'application'); // Indicates custom controls

    // Play/Pause button with accessibility
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = createSvgIcon(ICONS.pause);
        playPauseBtn.dataset.state = 'pause';
        playPauseBtn.setAttribute('aria-label', 'Pause video');
        announceToScreenReader('Playing');
      } else {
        video.pause();
        playPauseBtn.innerHTML = createSvgIcon(ICONS.play);
        playPauseBtn.dataset.state = 'play';
        playPauseBtn.setAttribute('aria-label', 'Play video');
        announceToScreenReader('Paused');
      }
    });

    video.addEventListener('play', () => {
      playPauseBtn.innerHTML = createSvgIcon(ICONS.pause);
      playPauseBtn.dataset.state = 'pause';
      playPauseBtn.setAttribute('aria-label', 'Pause video');
    });
    video.addEventListener('pause', () => {
      playPauseBtn.innerHTML = createSvgIcon(ICONS.play);
      playPauseBtn.dataset.state = 'play';
      playPauseBtn.setAttribute('aria-label', 'Play video');
    });
    video.addEventListener('ended', () => {
      announceToScreenReader('Video ended');
    });

    // Progress bar update with accessibility
    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      progressBar.style.width = progress + '%';
      progressContainer.setAttribute('aria-valuenow', Math.round(progress));
      progressContainer.setAttribute('aria-valuetext', `${Math.floor(video.currentTime / 60)}:${String(Math.floor(video.currentTime % 60)).padStart(2, '0')} of ${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}`);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    // Progress bar seek (click)
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
      announceToScreenReader(`Seeked to ${formatTime(video.currentTime)}`);
    });

    // Progress bar keyboard navigation
    progressContainer.addEventListener('keydown', (e) => {
      let handled = false;
      const step = e.shiftKey ? 1 : 5; // 1 second with Shift, 5 seconds otherwise
      
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + step);
        handled = true;
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - step);
        handled = true;
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        handled = true;
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 10);
        handled = true;
      } else if (e.code === 'Home') {
        e.preventDefault();
        video.currentTime = 0;
        handled = true;
      } else if (e.code === 'End') {
        e.preventDefault();
        video.currentTime = video.duration;
        handled = true;
      } else if (e.code === 'PageUp') {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 30);
        handled = true;
      } else if (e.code === 'PageDown') {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 30);
        handled = true;
      }
      
      if (handled) {
        announceToScreenReader(`${formatTime(video.currentTime)} of ${formatTime(video.duration)}`);
      }
    });

    // Skip buttons with announcements
    const skipButtons = controlsContainer.querySelectorAll('.skip-btn');
    skipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const skipAmount = parseFloat(btn.dataset.skip);
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + skipAmount));
        const direction = skipAmount > 0 ? 'forward' : 'back';
        announceToScreenReader(`Skipped ${Math.abs(skipAmount)} seconds ${direction}. Now at ${formatTime(video.currentTime)}`);
      });
    });

    // Speed control with full accessibility
    const speedOptions = controlsContainer.querySelectorAll('.speed-option');
    
    speedButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = speedMenu.classList.toggle('show');
      speedButton.setAttribute('aria-expanded', isExpanded);
      
      // Focus first menu item when opened
      if (isExpanded) {
        const activeOption = speedMenu.querySelector('.speed-option.active') || speedMenu.querySelector('.speed-option');
        activeOption?.focus();
      }
    });

    // Keyboard navigation for speed menu
    speedButton.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        speedButton.click();
      } else if (e.code === 'Escape') {
        speedMenu.classList.remove('show');
        speedButton.setAttribute('aria-expanded', 'false');
      }
    });

    speedOptions.forEach((option, index) => {
      // Click handler
      option.addEventListener('click', () => {
        const speed = parseFloat(option.dataset.speed);
        video.playbackRate = speed;
        
        speedOptions.forEach(opt => {
          opt.classList.remove('active');
          opt.setAttribute('aria-checked', 'false');
        });
        option.classList.add('active');
        option.setAttribute('aria-checked', 'true');
        
        speedButton.textContent = speed === 1 ? '1x' : speed + 'x';
        speedButton.setAttribute('aria-label', `Playback speed ${speed}x`);
        speedMenu.classList.remove('show');
        speedButton.setAttribute('aria-expanded', 'false');
        speedButton.focus();
        
        // Announce to screen reader
        announceToScreenReader(`Playback speed set to ${speed}x`);
      });

      // Keyboard navigation within menu
      option.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          const nextOption = speedOptions[index + 1] || speedOptions[0];
          nextOption.focus();
        } else if (e.code === 'ArrowUp') {
          e.preventDefault();
          const prevOption = speedOptions[index - 1] || speedOptions[speedOptions.length - 1];
          prevOption.focus();
        } else if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          option.click();
        } else if (e.code === 'Escape') {
          e.preventDefault();
          speedMenu.classList.remove('show');
          speedButton.setAttribute('aria-expanded', 'false');
          speedButton.focus();
        } else if (e.code === 'Home') {
          e.preventDefault();
          speedOptions[0].focus();
        } else if (e.code === 'End') {
          e.preventDefault();
          speedOptions[speedOptions.length - 1].focus();
        }
      });

      // Set initial aria-checked state
      option.setAttribute('aria-checked', option.classList.contains('active') ? 'true' : 'false');
      option.setAttribute('role', 'menuitemradio');
    });

    // Volume control with accessibility
    volumeBtn.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        volumeBtn.innerHTML = createSvgIcon(ICONS.volume);
        volumeBtn.dataset.state = 'unmuted';
        volumeBtn.setAttribute('aria-label', 'Mute');
        announceToScreenReader(`Unmuted. Volume ${Math.round(video.volume * 100)} percent`);
      } else {
        video.muted = true;
        volumeBtn.innerHTML = createSvgIcon(ICONS.volumeMute);
        volumeBtn.dataset.state = 'muted';
        volumeBtn.setAttribute('aria-label', 'Unmute');
        announceToScreenReader('Muted');
      }
    });

    // Volume slider click handler
    volumeSlider.addEventListener('click', (e) => {
      const rect = volumeSlider.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.volume = Math.max(0, Math.min(1, pos));
      volumeBar.style.width = (video.volume * 100) + '%';
      volumeSlider.setAttribute('aria-valuenow', Math.round(video.volume * 100));
      volumeSlider.setAttribute('aria-valuetext', `${Math.round(video.volume * 100)} percent`);
      video.muted = false;
      volumeBtn.innerHTML = video.volume === 0 ? createSvgIcon(ICONS.volumeMute) : createSvgIcon(ICONS.volume);
      volumeBtn.dataset.state = video.volume === 0 ? 'muted' : 'unmuted';
      volumeBtn.setAttribute('aria-label', video.volume === 0 ? 'Unmute' : 'Mute');
      announceToScreenReader(`Volume ${Math.round(video.volume * 100)} percent`);
    });

    // Volume slider keyboard navigation
    volumeSlider.addEventListener('keydown', (e) => {
      let handled = false;
      const step = e.shiftKey ? 0.01 : 0.05; // Smaller steps with Shift
      
      if (e.code === 'ArrowRight' || e.code === 'ArrowUp') {
        e.preventDefault();
        video.volume = Math.min(1, video.volume + step);
        handled = true;
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowDown') {
        e.preventDefault();
        video.volume = Math.max(0, video.volume - step);
        handled = true;
      } else if (e.code === 'Home') {
        e.preventDefault();
        video.volume = 0;
        handled = true;
      } else if (e.code === 'End') {
        e.preventDefault();
        video.volume = 1;
        handled = true;
      } else if (e.code === 'PageUp') {
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        handled = true;
      } else if (e.code === 'PageDown') {
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        handled = true;
      }
      
      if (handled) {
        volumeBar.style.width = (video.volume * 100) + '%';
        volumeSlider.setAttribute('aria-valuenow', Math.round(video.volume * 100));
        volumeSlider.setAttribute('aria-valuetext', `${Math.round(video.volume * 100)} percent`);
        video.muted = false;
        volumeBtn.innerHTML = video.volume === 0 ? createSvgIcon(ICONS.volumeMute) : createSvgIcon(ICONS.volume);
        announceToScreenReader(`Volume ${Math.round(video.volume * 100)} percent`);
      }
    });

    video.addEventListener('volumechange', () => {
      volumeBar.style.width = (video.volume * 100) + '%';
      volumeSlider.setAttribute('aria-valuenow', Math.round(video.volume * 100));
      volumeSlider.setAttribute('aria-valuetext', `${Math.round(video.volume * 100)} percent`);
    });

    // Fullscreen with accessibility
    fullscreenBtn.addEventListener('click', () => {
      const container = video.closest(CONFIG.CONTAINER_SELECTOR);
      if (!doc.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          announceToScreenReader('Fullscreen not available');
        });
        fullscreenBtn.innerHTML = createSvgIcon(ICONS.fullscreenExit);
        fullscreenBtn.dataset.state = 'fullscreen';
        fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
        announceToScreenReader('Entered fullscreen mode');
      } else {
        doc.exitFullscreen();
        fullscreenBtn.innerHTML = createSvgIcon(ICONS.fullscreen);
        fullscreenBtn.dataset.state = 'normal';
        fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
        announceToScreenReader('Exited fullscreen mode');
      }
    });

    // Update fullscreen icon on fullscreen change
    doc.addEventListener('fullscreenchange', () => {
      if (doc.fullscreenElement) {
        fullscreenBtn.innerHTML = createSvgIcon(ICONS.fullscreenExit);
        fullscreenBtn.dataset.state = 'fullscreen';
        fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
      } else {
        fullscreenBtn.innerHTML = createSvgIcon(ICONS.fullscreen);
        fullscreenBtn.dataset.state = 'normal';
        fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
      }
    });

    // Settings button (placeholder)
    const settingsBtn = controlsContainer.querySelector('.settings-btn');
    settingsBtn.addEventListener('click', () => {
      announceToScreenReader('Settings menu - Feature coming soon');
      alert('Settings menu - To be implemented');
    });

    // Transcript button (placeholder)
    const transcriptBtn = controlsContainer.querySelector('.transcript-btn');
    transcriptBtn.addEventListener('click', () => {
      announceToScreenReader('Transcript panel - Feature coming soon');
      alert('Transcript panel - To be implemented');
    });

    // Close speed menu when clicking outside
    doc.addEventListener('click', () => {
      speedMenu.classList.remove('show');
    });

    // Keyboard shortcuts with accessibility improvements
    doc.addEventListener('keydown', (e) => {
      // Check if focus is on a control element
      const activeElement = doc.activeElement;
      const isControlFocused = customControls.contains(activeElement);
      
      if (e.code === 'Space') {
        e.preventDefault();
        playPauseBtn.click();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      } else if (e.code === 'KeyF') {
        fullscreenBtn.click();
      } else if (e.code === 'KeyM') {
        volumeBtn.click();
      } else if (e.code === 'ArrowUp' && isControlFocused) {
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
      } else if (e.code === 'ArrowDown' && isControlFocused) {
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
      }
    });
    
    // Add focus management for video container
    const mediaContainer = video.closest(CONFIG.CONTAINER_SELECTOR);
    if (mediaContainer) {
      mediaContainer.setAttribute('role', 'region');
      mediaContainer.setAttribute('aria-label', 'Video player');
    }

    return controlsContainer;
  };

  const attachEventListeners = (video, overlay, customControls, centerPauseIcon) => {
    const showOverlay = () => overlay.classList.add('show');
    const hideOverlay = () => overlay.classList.remove('show');
    
    const showCenterPause = () => centerPauseIcon.classList.add('show');
    const hideCenterPause = () => centerPauseIcon.classList.remove('show');

    // Click event on center pause icon to play video
    centerPauseIcon.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        announceToScreenReader('Video playing');
      }
    });

    video.addEventListener('pause', () => {
      showOverlay();
      showCenterPause();
    });
    video.addEventListener('play', () => {
      hideOverlay();
      hideCenterPause();
    });
    video.addEventListener('ended', () => {
      hideOverlay();
      hideCenterPause();
    });

    // Show/hide custom controls on mouseover
    const mediaContainer = video.closest(CONFIG.CONTAINER_SELECTOR);
    if (mediaContainer) {
      const showControls = () => {
        customControls.style.opacity = '1';
        customControls.style.visibility = 'visible';
      };
      
      const hideControls = () => {
        customControls.style.opacity = '0';
        customControls.style.visibility = 'hidden';
      };

      // Show controls when mouse enters video player
      mediaContainer.addEventListener('mouseenter', () => {
        showControls();
      });
      
      // Hide controls when mouse leaves video player
      mediaContainer.addEventListener('mouseleave', () => {
        hideControls();
      });
      
      // Show controls when any control receives focus (accessibility)
      customControls.addEventListener('focusin', () => {
        showControls();
      });
      
      // Keyboard navigation for video player
      mediaContainer.addEventListener('keydown', (e) => {
        // Space or K = Play/Pause
        if (e.code === 'Space' || e.code === 'KeyK') {
          e.preventDefault();
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
        // Arrow Left = Rewind 5 seconds
        else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          announceToScreenReader(`Rewound 5 seconds. Now at ${formatTime(video.currentTime)}`);
        }
        // Arrow Right = Forward 5 seconds
        else if (e.code === 'ArrowRight') {
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          announceToScreenReader(`Forwarded 5 seconds. Now at ${formatTime(video.currentTime)}`);
        }
        // Arrow Up = Increase volume
        else if (e.code === 'ArrowUp') {
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          announceToScreenReader(`Volume ${Math.round(video.volume * 100)}%`);
        }
        // Arrow Down = Decrease volume
        else if (e.code === 'ArrowDown') {
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          announceToScreenReader(`Volume ${Math.round(video.volume * 100)}%`);
        }
        // M = Mute/Unmute
        else if (e.code === 'KeyM') {
          e.preventDefault();
          video.muted = !video.muted;
          announceToScreenReader(video.muted ? 'Muted' : 'Unmuted');
        }
        // F = Fullscreen
        else if (e.code === 'KeyF') {
          e.preventDefault();
          const fullscreenBtn = customControls.querySelector('.fullscreen-btn');
          if (fullscreenBtn) fullscreenBtn.click();
        }
      });
      
      // Hide controls initially on load
      hideControls();
    }
  };

  const hideUnwantedElements = (innerDoc) => {
    // Hide filename and close button elements with comprehensive selectors
    const selectors = [
      '.rscpMedia-filename',
      '.rscpMedia-close',
      '.rscp-close',
      '.rscp-filename',
      '[class*="filename"]',
      '[class*="Filename"]',
      '[class*="close"]',
      '[class*="Close"]',
      'button[title*="Close"]',
      'button[title*="close"]',
      'a[title*="Close"]',
      'a[title*="close"]',
      'a',
      'button',
      'span',
      'div'
    ];
    
    // First pass: hide by selector
    selectors.forEach(selector => {
      try {
        const elements = innerDoc.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent?.trim().toLowerCase();
          // Check if element contains unwanted text
          if (text && (
            text.includes('.mp4') || 
            text === 'close' || 
            text.includes('close button') ||
            text.match(/^\d+mb-.*\.mp4$/i)
          )) {
            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; width: 0 !important; height: 0 !important; pointer-events: none !important;';
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
    
    // Second pass: Walk through all text nodes
    const walker = innerDoc.createTreeWalker(
      innerDoc.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodesToHide = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent?.trim().toLowerCase();
      if (text && node.parentElement) {
        // Check for unwanted patterns
        if (
          text.includes('.mp4') || 
          text === 'close' ||
          text.match(/^\d+mb-.*\.mp4$/i)
        ) {
          // Don't hide if it's part of our custom controls
          if (!node.parentElement.closest('.custom-video-controls')) {
            textNodesToHide.push(node.parentElement);
          }
        }
      }
    }
    
    // Hide parent elements of unwanted text
    textNodesToHide.forEach(el => {
      el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important;';
    });
    
    // Third pass: Hide siblings of media container
    const mediaContainer = innerDoc.querySelector(CONFIG.CONTAINER_SELECTOR);
    if (mediaContainer) {
      let sibling = mediaContainer.nextElementSibling;
      while (sibling) {
        const text = sibling.textContent?.trim().toLowerCase();
        if (text && (text.includes('.mp4') || text === 'close')) {
          sibling.style.cssText = 'display: none !important; visibility: hidden !important;';
        }
        sibling = sibling.nextElementSibling;
      }
    }
  };

  const setupOverlay = (innerDoc) => {
    // Prevent duplicate setup
    if (innerDoc.querySelector(`.${CONFIG.OVERLAY_CLASS}`)) {
      return true;
    }

    const mediaContainer = innerDoc.querySelector(CONFIG.CONTAINER_SELECTOR);
    const video = innerDoc.querySelector(CONFIG.VIDEO_SELECTOR);

    if (!mediaContainer || !video) {
      return false;
    }

    injectStyles(innerDoc);
    
    // Hide unwanted UI elements
    hideUnwantedElements(innerDoc);
    
    // Set up mutation observer to hide elements that appear dynamically
    const observer = new MutationObserver(() => {
      hideUnwantedElements(innerDoc);
    });
    
    observer.observe(innerDoc.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    const overlay = createOverlay(innerDoc, video);
    const customControls = createCustomControls(innerDoc, video);
    const centerPauseIcon = createCenterPauseIcon(innerDoc);
    
    // Add accessibility attributes to media container
    mediaContainer.style.position = 'relative';
    mediaContainer.setAttribute('role', 'region');
    mediaContainer.setAttribute('aria-label', 'Video player');
    
    mediaContainer.appendChild(overlay);
    mediaContainer.appendChild(customControls);
    mediaContainer.appendChild(centerPauseIcon);

    attachEventListeners(video, overlay, customControls, centerPauseIcon);
          sendMessageToParent('IFRAME_FULLY_LOADED', {
             status: 'ready',
             videoReady: video.readyState >= 2,
             containerFound: true,
             videoSrc: video.src || video.currentSrc
          });

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
    };

    const trySetup = () => {
      const innerDoc = getIframeDocument(iframe);
      if (!innerDoc?.body) return;

      if (setupOverlay(innerDoc)) {
        cleanup();
      }
    };

    const handleLoad = () => {
      trySetup();
    };

    iframe.addEventListener('load', handleLoad);
    pollInterval = setInterval(trySetup, CONFIG.POLL_INTERVAL_MS);
    timeoutTimer = setTimeout(() => {
      cleanup();
    }, CONFIG.TIMEOUT_MS);

    trySetup();
  };

  const init = () => {
    const iframe = document.querySelector(CONFIG.IFRAME_SELECTOR);
    
    if (iframe) {
      createWatcher(iframe);
      return;
    }

    const observer = new MutationObserver(() => {
      const found = document.querySelector(CONFIG.IFRAME_SELECTOR);
      if (found) {
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
  }
})();
