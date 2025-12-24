(function () {
    'use strict';

    // Set media type: 'video' or 'audio'
    // Media type will be determined from API response
    let MEDIA_TYPE = null;
    let IS_AUDIO = false;
    let lessonSequenceData = null;
    let isPlayerInitialized = false;
    let pendingIframeDoc = null; // Store iframe document while waiting for API response
    let lessonTitle = '';
    let lessonDescription = '';

    //   let lessonSequenceData = null
    //   let MEDIA_TYPE = 'video'; // change to 'audio' to switch
    //   let IS_AUDIO = MEDIA_TYPE === 'audio';

    // Base URL for icons - Update this with your actual server URL
    const ICONS_BASE_URL = 'https://sbx.skillspring.cognizant.com/rustici/player_icons/';

    const CONFIG = {
        TIMEOUT_MS: 30000,
        POLL_INTERVAL_MS: 500,
        IFRAME_SELECTOR: '#ScormContent',
        CONTAINER_SELECTOR: '#rscpAu-MediaContainer',
        VIDEO_SELECTOR: '#rscpAu-Media', // kept for backward compatibility
        OVERLAY_CLASS: 'video-overlay',
        CONTROLS_CLASS: 'custom-video-controls',
        STYLE_ID: 'video-overlay-styles',
        AUDIO_ICON_CONTAINER_CLASS: 'audio-icon-container',
        NEXT_LESSON_BUTTON_CLASS: 'next-lesson-overlay',
        NEXT_LESSON_THRESHOLD: 5 // seconds
    };

    // Icon definitions with server paths
    const VIDEO_ICON_ASSETS = {
        play: { filename: 'video/play-icon.svg', alt: 'Play' },
        pause: { filename: 'video/pause-icon.svg', alt: 'Pause' },
        centerPause: { filename: 'video/center-pause-icon.svg', alt: 'Paused' },
        rewind: { filename: 'video/rewind-icon.svg', alt: 'Rewind 10 seconds' },
        forward: { filename: 'video/forward-icon.svg', alt: 'Forward 10 seconds' },
        volume: { filename: 'video/volume-icon.svg', alt: 'Volume' },
        volumeMute: { filename: 'video/volume-mute-icon.svg', alt: 'Mute' },
        settings: { filename: 'video/settings-icon.svg', alt: 'Settings' },
        transcript: { filename: 'video/transcript-icon.svg', alt: 'Transcript' },
        fullscreen: { filename: 'video/fullscreen-icon.svg', alt: 'Fullscreen' },
        fullscreenExit: { filename: 'video/fullscreen-exit-icon.svg', alt: 'Exit Fullscreen' }
    };


    const AUDIO_ICON_ASSETS = {
        play: { filename: 'audio/audio-play-icon.svg', alt: 'Play' },
        pause: { filename: 'audio/audio-pause-icon.svg', alt: 'Pause' },
        centerPause: { filename: 'audio/audio-pause-icon.svg', alt: 'Paused' },
        rewind: { filename: 'audio/audio-rewind-icon.svg', alt: 'Rewind 10 seconds' },
        forward: { filename: 'audio/audio-forward-icon.svg', alt: 'Forward 10 seconds' },
        volume: { filename: 'audio/audio-volume-icon.svg', alt: 'Volume' },
        volumeMute: { filename: 'audio/audio-volume-mute-icon.svg', alt: 'Mute' },
        settings: { filename: 'audio/audio-setting-icon.svg', alt: 'Settings' },
        transcript: { filename: 'audio/audio-transcript-icon.svg', alt: 'Transcript' },
        fullscreen: { filename: 'audio/audio-fullscreen-icon.svg', alt: 'Fullscreen' },
        fullscreenExit: { filename: 'audio/audio-fullscreen-exit-icon.svg', alt: 'Exit Fullscreen' },
        audioTrackIcon: { filename: 'audio/audio-track-icon.svg', alt: 'Audio Track Icon' },
    };

    // Helper function to get full icon URL
    const getIconUrl = (iconKey) => ICONS_BASE_URL + (MEDIA_TYPE === 'video' ? VIDEO_ICON_ASSETS[iconKey].filename : AUDIO_ICON_ASSETS[iconKey].filename);

    // Helper function to create icon image element
    const createIconElement = (iconKey, className = '') => {
        const iconData = MEDIA_TYPE === 'video' ? VIDEO_ICON_ASSETS[iconKey] : AUDIO_ICON_ASSETS[iconKey];
        return `<img src="${getIconUrl(iconKey)}" style="filter: ${MEDIA_TYPE === 'audio' ? 'none' : 'brightness(0) invert(1)'}" class="icon-image ${className}" alt="${iconData.alt}" role="img" aria-label="${iconData.alt}" />`;
    };

    // Controls HTML builder (different icons/buttons for video vs audio)
    const getControlsHtml = () => {
        const fullscreenButton = IS_AUDIO
            ? ''
            : `
      <button class="icon-btn fullscreen-btn" title="Fullscreen" data-state="normal" aria-label="Fullscreen" tabindex="0">
        ${createIconElement('fullscreen')}
      </button>`;
        return `
      <div class="controls-row" role="group" aria-label="${IS_AUDIO ? 'Audio controls' : 'Video controls'}">
        <button class="play-pause-btn" title="Play/Pause" data-state="play" aria-label="Play ${IS_AUDIO ? 'audio' : 'video'}" tabindex="0">
          ${createIconElement('play')}
        </button>
        <button class="skip-btn" data-skip="-10" title="Rewind 10 seconds" aria-label="Rewind 10 seconds" tabindex="0">
          ${createIconElement('rewind')}
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
          ${createIconElement('forward')}
        </button>
        <div class="progress-container">
          <div class="video-progress-container" role="slider" aria-label="${IS_AUDIO ? 'Audio progress' : 'Video progress'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
            <div class="video-progress-bar"></div>
          </div>
        </div>
        <div class="volume-control">
          <button class="icon-btn volume-btn" title="Volume" data-state="unmuted" aria-label="Mute/Unmute" tabindex="0">
            ${createIconElement('volume')}
          </button>
          <div class="volume-slider" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" tabindex="0">
            <div class="volume-bar"></div>
          </div>
        </div>
        <button class="icon-btn settings-btn" title="Settings" aria-label="Settings" tabindex="0">
          ${createIconElement('settings')}
        </button>
        <button class="icon-btn transcript-btn" title="Transcript" aria-label="Transcript" tabindex="0">
          ${createIconElement('transcript')}
        </button>
        ${fullscreenButton}
      </div>
    `;
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
    
    /* Container - Full Width */
    ${CONFIG.CONTAINER_SELECTOR} {
      overflow: hidden !important;
      width: 100% !important;
      max-width: 100% !important;
      position: relative !important;
    }
    
    /* Hide any siblings of container that might be close/filename */
    ${CONFIG.CONTAINER_SELECTOR} ~ * {
      display: none !important;
    }
    
    /* Media Elements */
    video, audio, ${CONFIG.VIDEO_SELECTOR} {
      width: 100% !important;
      height: auto !important;
      display: block !important;
    }
    
    /* Overlay (video only) */
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
    
    /* Center Pause Icon - Fully Responsive (video only) */
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
      .center-pause-icon { width: 8vw; height: 8vh; }
    }
    @media (max-width: 480px) {
      .center-pause-icon { width: 6vw; height: 6vh; }
    }
    .center-pause-icon.show { display: block; opacity: 1; animation: fadeInScale 0.3s ease; }
    .center-pause-icon:hover { transform: translate(-50%, -50%) scale(1.1); }
    @keyframes fadeInScale {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .center-pause-icon img { width: 100%; height: 100%; filter: drop-shadow(0 0.125rem 0.5rem rgba(0, 0, 0, 0.3)); }
    
    /* Overlay Text */
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
      .video-overlay { bottom: 25%; }
      .overlay-content { padding: 0.3rem; }
    }
    
    /* Hide default browser media controls */
    video::-webkit-media-controls,
    audio::-webkit-media-controls,
    ${CONFIG.VIDEO_SELECTOR}::-webkit-media-controls {
      display: none !important;
    }
    video::-webkit-media-controls-enclosure,
    audio::-webkit-media-controls-enclosure,
    ${CONFIG.VIDEO_SELECTOR}::-webkit-media-controls-enclosure {
      display: none !important;
    }
    
    /* Custom Controls Container - Inside Media */
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
      .custom-video-controls { padding: 0.5rem 0.75rem; }
      .controls-row { gap: 0.35rem; margin-bottom: 0.35rem; }
    }
    @media (max-width: 480px) {
      .custom-video-controls { padding: 0.4rem 0.5rem; }
      .controls-row { gap: 0.25rem; margin-bottom: 0.25rem; }
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
    .play-pause-btn { font-size: 1.5rem !important; }
    @media (max-width: 768px) {
      .custom-video-controls button { min-width: 1.875rem; height: 1.875rem; padding: 0.375rem; }
      .play-pause-btn { font-size: 1.25rem !important; }
    }
    @media (max-width: 480px) {
      .custom-video-controls button { min-width: 1.5rem; height: 1.5rem; padding: 0.25rem; }
      .play-pause-btn { font-size: 1rem !important; }
    }
    
    /* Skip buttons */
    .skip-btn { position: relative; }
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
    .speed-control { position: relative; }
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
      .speed-button { min-width: 2rem !important; height: 1.25rem !important; font-size: 0.75rem !important; padding: 0 0.5rem !important; }
      .speed-menu { min-width: 3.5rem; }
    }
    @media (max-width: 480px) {
      .speed-button { min-width: 1.75rem !important; height: 1.125rem !important; font-size: 0.625rem !important; padding: 0 0.4rem !important; }
      .speed-menu { min-width: 3rem; }
    }
    .speed-menu.show { display: block; animation: slideUp 0.2s ease; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
    .speed-option:hover { background: rgba(255, 255, 255, 0.1); }
    .speed-option:focus { background: rgba(255, 255, 255, 0.2); outline: 0.125rem solid #3ea6ff; outline-offset: -0.125rem; }
    .speed-option.active { color: #3ea6ff; font-weight: 600; }
    .speed-option[aria-checked="true"]::before { content: '✓ '; margin-right: 0.25rem; }
    @media (max-width: 768px) { .speed-option { padding: 0.4rem 0.75rem; font-size: 0.75rem; } }
    @media (max-width: 480px) { .speed-option { padding: 0.3rem 0.5rem; font-size: 0.625rem; } }
    
    /* Progress Bar Container */
    .progress-container { flex: 1; }
    
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
    .video-progress-container:hover { height: 0.5rem; }
    .video-progress-container:focus { outline: 0.125rem solid #3ea6ff; outline-offset: 0.125rem; height: 0.5rem; }
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
    .video-progress-container:hover .video-progress-bar::after { opacity: 1; }
    @media (max-width: 768px) {
      .video-progress-container { height: 0.3rem; }
      .video-progress-container:hover, .video-progress-container:focus { height: 0.4rem; }
    }
    @media (max-width: 480px) {
      .video-progress-container { height: 0.25rem; }
      .video-progress-container:hover, .video-progress-container:focus { height: 0.35rem; }
    }
    
    /* Volume Control */
    .volume-control { position: relative; display: flex; align-items: center; gap: 0.5rem; }
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
    .volume-control:hover .volume-slider, .volume-slider:focus { width: 3.75rem; }
    .volume-slider:focus { outline: 0.125rem solid #3ea6ff; outline-offset: 0.125rem; }
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
    @media (max-width: 768px) { .volume-control:hover .volume-slider, .volume-slider:focus { width: 3rem; } }
    @media (max-width: 480px) { .volume-control:hover .volume-slider, .volume-slider:focus { width: 2.5rem; } .volume-slider { height: 0.25rem; } }
    
    /* Icon buttons */
    .icon-btn { font-size: 1.25rem !important; }
    @media (max-width: 768px) { .icon-btn { font-size: 1rem !important; } }
    @media (max-width: 480px) { .icon-btn { font-size: 0.875rem !important; } }
    
    /* Icon Image Styles */
    .icon-image {
      display: block;
      width: 1.25rem;
      height: 1.25rem;
      pointer-events: none;
    }
    .play-pause-btn .icon-image { width: 1.5rem; height: 1.5rem; }
    .skip-btn .icon-image { width: 1.5rem; height: 1.5rem; }
    @media (max-width: 768px) {
      .icon-image { width: 1rem; height: 1rem; }
      .play-pause-btn .icon-image, .skip-btn .icon-image { width: 1.25rem; height: 1.25rem; }
    }
    @media (max-width: 480px) {
      .icon-image { width: 0.875rem; height: 0.875rem; }
      .play-pause-btn .icon-image, .skip-btn .icon-image { width: 1rem; height: 1rem; }
    }
    
    /*Audio styles*/
    .mpeg{
        background-color: #ffffff;
    }
    
    .mpeg ${CONFIG.CONTAINER_SELECTOR} {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .${CONFIG.AUDIO_ICON_CONTAINER_CLASS} {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 80vh;
    }   
    img[aria-label="Audio Track Icon"] {
        width: 3.25rem;
        height: 3.25rem;
    }
    @media (max-width: 768px) {
      img[aria-label="Audio Track Icon"] {
        width: 3rem;
        height: 3rem;
    }
    }
    @media (max-width: 480px) {
      img[aria-label="Audio Track Icon"] {
        width: 2.5rem;
        height: 2.5rem;
    }
    }
    
    /* Next Lesson Overlay Button */
    .next-lesson-overlay {
      position: absolute;
      bottom: 15%;
      right: 5%;
      z-index: 1003;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: auto;
    }
    .next-lesson-overlay.show {
      display: block;
      opacity: 1;
      animation: slideInRight 0.5s ease;
    }
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .next-lesson-button {
      background: rgba(62, 166, 255, 0.95);
      color: #FFFFFF;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-family: 'GellixSemiBold', Arial, sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
    .next-lesson-button:hover {
      background: rgba(62, 166, 255, 1);
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    .next-lesson-button:active {
      transform: scale(0.98);
    }
    .next-lesson-button:focus-visible {
      outline: 2px solid #FFFFFF;
      outline-offset: 2px;
    }
    .next-lesson-button::after {
      content: '→';
      font-size: 1.2rem;
      margin-left: 0.25rem;
    }
    @media (max-width: 768px) {
      .next-lesson-overlay {
        bottom: 12%;
        right: 3%;
      }
      .next-lesson-button {
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
      }
    }
    @media (max-width: 480px) {
      .next-lesson-overlay {
        bottom: 10%;
        right: 2%;
      }
      .next-lesson-button {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
      }
    }
  `;

    const sanitizeHTML = (html) => {
        // Simple sanitization - in production, use DOMPurify library
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const getOverlayHtml = () => `
    <div class="overlay-content" role="complementary" aria-label="Video information">
      <div class="overlay-title" role="heading" aria-level="2">${lessonTitle}</div>
      <div class="overlay-description">
       ${sanitizeHTML(lessonDescription)}
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
            console.log(event.source, "source");
            if (event.source === window) return;
            const { type, data, source } = event.data || {};
            // Only process messages intended for this iframe
            console.log('📥 Message received from parent:', type, data);
            // Handle different message types
            switch (type) {
                case 'LESSON_SEQUENCE_DATA':
                    console.log("data", data)
                    lessonSequenceData = data;

                    // Determine media type from API response
                    if (data && data.currentLesson) {
                        const contentType = data.currentLesson.contentType || 'video';
                        lessonTitle = data.currentLesson?.lessonTitle;
                        lessonDescription = data.currentLesson?.lessonDesc;
                        MEDIA_TYPE = contentType.toLowerCase().includes('audio') ? 'audio' : 'video';
                        IS_AUDIO = MEDIA_TYPE === 'audio';
                        console.log(`✅ Media type set from API: ${MEDIA_TYPE}`);
                        console.log('Lesson Title:', lessonTitle);
                        console.log('Lesson Description:', lessonDescription);
                        // Now initialize the player if iframe is ready
                        if (pendingIframeDoc) {
                            console.log('🎬 Iframe was waiting, now initializing player...');
                            initializePlayer(pendingIframeDoc);
                            pendingIframeDoc = null;
                        }
                    }

                    break;
                default:
                    console.log('Unknown message type:', type);
            }
        });
        console.log('✅ Parent communication listener initialized');
    };

    const injectStyles = (doc) => {
        if (doc.getElementById(CONFIG.STYLE_ID)) return;
        const style = doc.createElement('style');
        style.id = CONFIG.STYLE_ID;
        style.textContent = STYLES;
        doc.head.appendChild(style);
    };

    const findMediaElement = (doc) => {
        // Prefer explicit tag based on MEDIA_TYPE, fall back to legacy selector
        const primary = doc.querySelector(IS_AUDIO ? 'audio' : 'video');
        const fallback = doc.querySelector(CONFIG.VIDEO_SELECTOR);
        return primary || fallback || doc.querySelector('video, audio');
    };

    const createOverlay = (doc, media) => {
        if (IS_AUDIO) return null; // overlay is video-specific
        const overlay = doc.createElement('div');
        overlay.className = CONFIG.OVERLAY_CLASS;
        overlay.innerHTML = getOverlayHtml();

        const adjustOverlayPosition = () => {
            const video = media;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const containerWidth = video.clientWidth;
            const containerHeight = video.clientHeight;
            if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) return;

            const videoAspectRatio = videoWidth / videoHeight;
            const containerAspectRatio = containerWidth / containerHeight;

            let actualVideoWidth, actualVideoHeight, leftOffset, topOffset;
            if (videoAspectRatio > containerAspectRatio) {
                actualVideoWidth = containerWidth;
                actualVideoHeight = containerWidth / videoAspectRatio;
                leftOffset = 0;
                topOffset = (containerHeight - actualVideoHeight) / 2;
            } else {
                actualVideoHeight = containerHeight;
                actualVideoWidth = containerHeight * videoAspectRatio;
                leftOffset = (containerWidth - actualVideoWidth) / 2;
                topOffset = 0;
            }
            // Calculated positions if needed in future
            const leftPercent = 8;
            const topPercent = 30;
            const calculatedLeft = leftOffset + (actualVideoWidth * leftPercent / 100);
            const calculatedTop = topOffset + (actualVideoHeight * topPercent / 100);
            const maxWidth = actualVideoWidth * 0.45;
            // These values can be applied if dynamic positioning is desired
            // overlay.style.left = `${calculatedLeft}px`;
            // overlay.style.top = `${calculatedTop}px`;
            // overlay.style.maxWidth = `${maxWidth}px`;
        };

        media.addEventListener('loadedmetadata', adjustOverlayPosition);
        const resizeObserver = new ResizeObserver(adjustOverlayPosition);
        resizeObserver.observe(media);
        if (media.readyState >= 1) setTimeout(adjustOverlayPosition, 100);
        return overlay;
    };

    const createCenterPauseIcon = (doc) => {
        if (IS_AUDIO) return null; // center icon is video-specific
        const centerPause = doc.createElement('div');
        centerPause.className = 'center-pause-icon';
        centerPause.innerHTML = `<img src="${getIconUrl('centerPause')}" alt="${VIDEO_ICON_ASSETS.centerPause.alt}" />`;
        centerPause.setAttribute('aria-hidden', 'true');
        return centerPause;
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

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
        liveRegion.textContent = '';
        setTimeout(() => { liveRegion.textContent = message; }, 100);
    };

    const createAudioIconContainer = (doc, media) => {
        const audioIconContainer = doc.createElement('div');
        audioIconContainer.className = CONFIG.AUDIO_ICON_CONTAINER_CLASS;
        audioIconContainer.innerHTML = `
      <div class="audio-icon-content" role="img" aria-label="Audio content">
        ${createIconElement('audioTrackIcon')}
      </div>
    `;
        return audioIconContainer;

    }

    const createNextLessonOverlay = (doc, media) => {
        const overlay = doc.createElement('div');
        overlay.className = CONFIG.NEXT_LESSON_BUTTON_CLASS;
        overlay.setAttribute('role', 'complementary');
        overlay.setAttribute('aria-label', 'Next lesson navigation');
        
        const button = doc.createElement('button');
        button.className = 'next-lesson-button';
        button.textContent = lessonSequenceData?.nextLesson || "Next Lesson";
        button.setAttribute('aria-label', `Go to next lesson: ${lessonSequenceData?.nextLesson}`);
        button.setAttribute('tabindex', '0');
        
        button.addEventListener('click', () => {
            console.log('🚀 Next lesson button clicked');
            sendMessageToParent('NAVIGATE_TO_NEXT_LESSON', {
                currentTime: media.currentTime,
                duration: media.duration,
                timestamp: Date.now()
            });
            announceToScreenReader('Navigating to next lesson');
        });
        
        button.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                button.click();
            }
        });
        
        overlay.appendChild(button);
        return overlay;
    }

    const attachNextLessonListener = (media, nextLessonOverlay) => {
        if (!nextLessonOverlay) return;
        
        let nextLessonShown = false;
        let autoNavigated = false;
        
        const checkForNextLesson = () => {
            if (!media.duration || isNaN(media.duration)) return;
            
            const timeRemaining = media.duration - media.currentTime;
            
            // Show overlay when 5 seconds or less remaining
            if (timeRemaining <= CONFIG.NEXT_LESSON_THRESHOLD && timeRemaining > 0 && !nextLessonShown) {
                // Check if there's a next lesson available from lessonSequenceData
                if (lessonSequenceData?.nextLesson) {
                    nextLessonOverlay.classList.add('show');
                    nextLessonShown = true;
                    console.log('⏭️ Next lesson button shown');
                }
            }
        };
        
        media.addEventListener('timeupdate', checkForNextLesson);
        
        // Auto-navigate when media ends
        media.addEventListener('ended', () => {
            nextLessonOverlay.classList.remove('show');
            nextLessonShown = false;
            
            // Automatically navigate to next lesson if available and not already navigated
            if (lessonSequenceData?.nextLesson && !autoNavigated) {
                autoNavigated = true;
                console.log('🎬 Media ended, auto-navigating to next lesson');
                sendMessageToParent('NAVIGATE_TO_NEXT_LESSON', {
                    currentTime: media.currentTime,
                    duration: media.duration,
                    autoNavigate: true,
                    timestamp: Date.now()
                });
            }
        });
        
        media.addEventListener('seeked', () => {
            // Reset if user seeks backward
            const timeRemaining = media.duration - media.currentTime;
            if (timeRemaining > CONFIG.NEXT_LESSON_THRESHOLD) {
                nextLessonOverlay.classList.remove('show');
                nextLessonShown = false;
            }
        });
        
        media.addEventListener('play', () => {
            // Reset flags when video/audio starts playing again
            const timeRemaining = media.duration - media.currentTime;
            if (timeRemaining > CONFIG.NEXT_LESSON_THRESHOLD) {
                nextLessonShown = false;
                autoNavigated = false;
            }
        });
    }

    const createCustomControls = (doc, media) => {
        const controlsContainer = doc.createElement('div');
        controlsContainer.className = CONFIG.CONTROLS_CLASS;
        controlsContainer.innerHTML = getControlsHtml();

        const progressContainer = controlsContainer.querySelector('.video-progress-container');
        const progressBar = controlsContainer.querySelector('.video-progress-bar');
        const playPauseBtn = controlsContainer.querySelector('.play-pause-btn');
        const speedButton = controlsContainer.querySelector('.speed-button');
        const speedMenu = controlsContainer.querySelector('.speed-menu');
        const volumeBtn = controlsContainer.querySelector('.volume-btn');
        const volumeSlider = controlsContainer.querySelector('.volume-slider');
        const volumeBar = controlsContainer.querySelector('.volume-bar');
        const fullscreenBtn = controlsContainer.querySelector('.fullscreen-btn'); // may be null for audio
        // Positioning: for video, align to actual video bounds; for audio, full width
        const adjustControlsPosition = () => {
            if (IS_AUDIO) {
                controlsContainer.style.left = '0';
                controlsContainer.style.right = '0';
                controlsContainer.style.width = '100%';
                controlsContainer.style.bottom = '0';
                controlsContainer.style.position = "unset";
                controlsContainer.style.background = "none";
                volumeBar.style.background = "#000000";
                volumeSlider.style.background = "#D9D9D9";
                progressContainer.style.background = "#D9D9D9";
                return;
            }
            const video = media;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const containerWidth = video.clientWidth;
            const containerHeight = video.clientHeight;
            if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) return;

            const videoAspectRatio = videoWidth / videoHeight;
            const containerAspectRatio = containerWidth / containerHeight;

            let actualVideoWidth, actualVideoHeight, leftOffset, bottomOffset;
            if (videoAspectRatio > containerAspectRatio) {
                actualVideoWidth = containerWidth;
                actualVideoHeight = containerWidth / videoAspectRatio;
                leftOffset = 0;
                bottomOffset = (containerHeight - actualVideoHeight) / 2;
            } else {
                actualVideoHeight = containerHeight;
                actualVideoWidth = containerHeight * videoAspectRatio;
                leftOffset = (containerWidth - actualVideoWidth) / 2;
                bottomOffset = 0;
            }
            const leftPercentOfContainer = (leftOffset / containerWidth) * 100;
            const bottomPercentOfContainer = (bottomOffset / containerHeight) * 100;
            const widthPercentOfContainer = (actualVideoWidth / containerWidth) * 100;
            controlsContainer.style.left = `${leftPercentOfContainer}%`;
            controlsContainer.style.bottom = `${bottomPercentOfContainer}%`;
            controlsContainer.style.width = `${widthPercentOfContainer}%`;
            controlsContainer.style.right = 'auto';
        };

        media.addEventListener('loadedmetadata', adjustControlsPosition);
        const resizeObserver = new ResizeObserver(adjustControlsPosition);
        resizeObserver.observe(media);
        if (media.readyState >= 1) setTimeout(adjustControlsPosition, 100);

        // Replace native controls with custom
        media.removeAttribute('controls');
        media.setAttribute('tabindex', '-1');
        media.setAttribute('aria-label', IS_AUDIO ? 'Audio content' : 'Video content');
        media.setAttribute('role', 'application');

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (media.paused) {
                media.play();
                playPauseBtn.innerHTML = createIconElement('pause');
                playPauseBtn.dataset.state = 'pause';
                playPauseBtn.setAttribute('aria-label', IS_AUDIO ? 'Pause audio' : 'Pause video');
                announceToScreenReader('Playing');
            } else {
                media.pause();
                playPauseBtn.innerHTML = createIconElement('play');
                playPauseBtn.dataset.state = 'play';
                playPauseBtn.setAttribute('aria-label', IS_AUDIO ? 'Play audio' : 'Play video');
                announceToScreenReader('Paused');
            }
        });

        media.addEventListener('play', () => {
            playPauseBtn.innerHTML = createIconElement('pause');
            playPauseBtn.dataset.state = 'pause';
            playPauseBtn.setAttribute('aria-label', IS_AUDIO ? 'Pause audio' : 'Pause video');
        });
        media.addEventListener('pause', () => {
            playPauseBtn.innerHTML = createIconElement('play');
            playPauseBtn.dataset.state = 'play';
            playPauseBtn.setAttribute('aria-label', IS_AUDIO ? 'Play audio' : 'Play video');
        });
        media.addEventListener('ended', () => {
            announceToScreenReader(IS_AUDIO ? 'Audio ended' : 'Video ended');
        });

        // Progress
        const updateProgress = () => {
            const progress = (media.currentTime / media.duration) * 100;
            progressBar.style.width = progress + '%';
            progressContainer.setAttribute('aria-valuenow', Math.round(progress));
            progressContainer.setAttribute('aria-valuetext', `${formatTime(media.currentTime)} of ${formatTime(media.duration)}`);
        };
        media.addEventListener('timeupdate', updateProgress);
        media.addEventListener('loadedmetadata', updateProgress);

        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            media.currentTime = pos * media.duration;
            announceToScreenReader(`Seeked to ${formatTime(media.currentTime)}`);
        });

        progressContainer.addEventListener('keydown', (e) => {
            let handled = false;
            const step = e.shiftKey ? 1 : 5;
            if (e.code === 'ArrowRight') { e.preventDefault(); media.currentTime = Math.min(media.duration, media.currentTime + step); handled = true; }
            else if (e.code === 'ArrowLeft') { e.preventDefault(); media.currentTime = Math.max(0, media.currentTime - step); handled = true; }
            else if (e.code === 'ArrowUp') { e.preventDefault(); media.currentTime = Math.min(media.duration, media.currentTime + 10); handled = true; }
            else if (e.code === 'ArrowDown') { e.preventDefault(); media.currentTime = Math.max(0, media.currentTime - 10); handled = true; }
            else if (e.code === 'Home') { e.preventDefault(); media.currentTime = 0; handled = true; }
            else if (e.code === 'End') { e.preventDefault(); media.currentTime = media.duration; handled = true; }
            else if (e.code === 'PageUp') { e.preventDefault(); media.currentTime = Math.min(media.duration, media.currentTime + 30); handled = true; }
            else if (e.code === 'PageDown') { e.preventDefault(); media.currentTime = Math.max(0, media.currentTime - 30); handled = true; }
            if (handled) announceToScreenReader(`${formatTime(media.currentTime)} of ${formatTime(media.duration)}`);
        });

        // Skip
        const skipButtons = controlsContainer.querySelectorAll('.skip-btn');
        skipButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const skipAmount = parseFloat(btn.dataset.skip);
                media.currentTime = Math.max(0, Math.min(media.duration, media.currentTime + skipAmount));
                const direction = skipAmount > 0 ? 'forward' : 'back';
                announceToScreenReader(`Skipped ${Math.abs(skipAmount)} seconds ${direction}. Now at ${formatTime(media.currentTime)}`);
            });
        });

        // Speed
        const speedOptions = controlsContainer.querySelectorAll('.speed-option');
        speedButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = speedMenu.classList.toggle('show');
            speedButton.setAttribute('aria-expanded', isExpanded);
            if (isExpanded) {
                const activeOption = speedMenu.querySelector('.speed-option.active') || speedMenu.querySelector('.speed-option');
                activeOption?.focus();
            }
        });
        speedButton.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); speedButton.click(); }
            else if (e.code === 'Escape') { speedMenu.classList.remove('show'); speedButton.setAttribute('aria-expanded', 'false'); }
        });
        speedOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                const speed = parseFloat(option.dataset.speed);
                media.playbackRate = speed;
                speedOptions.forEach(opt => { opt.classList.remove('active'); opt.setAttribute('aria-checked', 'false'); });
                option.classList.add('active'); option.setAttribute('aria-checked', 'true');
                speedButton.textContent = speed === 1 ? '1x' : speed + 'x';
                speedButton.setAttribute('aria-label', `Playback speed ${speed}x`);
                speedMenu.classList.remove('show');
                speedButton.setAttribute('aria-expanded', 'false');
                speedButton.focus();
                announceToScreenReader(`Playback speed set to ${speed}x`);
            });
            option.addEventListener('keydown', (e) => {
                if (e.code === 'ArrowDown') { e.preventDefault(); (speedOptions[index + 1] || speedOptions[0]).focus(); }
                else if (e.code === 'ArrowUp') { e.preventDefault(); (speedOptions[index - 1] || speedOptions[speedOptions.length - 1]).focus(); }
                else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); option.click(); }
                else if (e.code === 'Escape') { e.preventDefault(); speedMenu.classList.remove('show'); speedButton.setAttribute('aria-expanded', 'false'); speedButton.focus(); }
                else if (e.code === 'Home') { e.preventDefault(); speedOptions[0].focus(); }
                else if (e.code === 'End') { e.preventDefault(); speedOptions[speedOptions.length - 1].focus(); }
            });
            option.setAttribute('aria-checked', option.classList.contains('active') ? 'true' : 'false');
            option.setAttribute('role', 'menuitemradio');
        });

        // Volume
        volumeBtn.addEventListener('click', () => {
            if (media.muted) {
                media.muted = false;
                volumeBtn.innerHTML = createIconElement('volume');
                volumeBtn.dataset.state = 'unmuted';
                volumeBtn.setAttribute('aria-label', 'Mute');
                announceToScreenReader(`Unmuted. Volume ${Math.round(media.volume * 100)} percent`);
            } else {
                media.muted = true;
                volumeBtn.innerHTML = createIconElement('volumeMute');
                volumeBtn.dataset.state = 'muted';
                volumeBtn.setAttribute('aria-label', 'Unmute');
                announceToScreenReader('Muted');
            }
        });

        volumeSlider.addEventListener('click', (e) => {
            const rect = volumeSlider.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            media.volume = Math.max(0, Math.min(1, pos));
            volumeBar.style.width = (media.volume * 100) + '%';
            volumeSlider.setAttribute('aria-valuenow', Math.round(media.volume * 100));
            volumeSlider.setAttribute('aria-valuetext', `${Math.round(media.volume * 100)} percent`);
            media.muted = false;
            volumeBtn.innerHTML = media.volume === 0 ? createIconElement('volumeMute') : createIconElement('volume');
            volumeBtn.dataset.state = media.volume === 0 ? 'muted' : 'unmuted';
            volumeBtn.setAttribute('aria-label', media.volume === 0 ? 'Unmute' : 'Mute');
            announceToScreenReader(`Volume ${Math.round(media.volume * 100)} percent`);
        });

        volumeSlider.addEventListener('keydown', (e) => {
            let handled = false;
            const step = e.shiftKey ? 0.01 : 0.05;
            if (e.code === 'ArrowRight' || e.code === 'ArrowUp') { e.preventDefault(); media.volume = Math.min(1, media.volume + step); handled = true; }
            else if (e.code === 'ArrowLeft' || e.code === 'ArrowDown') { e.preventDefault(); media.volume = Math.max(0, media.volume - step); handled = true; }
            else if (e.code === 'Home') { e.preventDefault(); media.volume = 0; handled = true; }
            else if (e.code === 'End') { e.preventDefault(); media.volume = 1; handled = true; }
            else if (e.code === 'PageUp') { e.preventDefault(); media.volume = Math.min(1, media.volume + 0.1); handled = true; }
            else if (e.code === 'PageDown') { e.preventDefault(); media.volume = Math.max(0, media.volume - 0.1); handled = true; }
            if (handled) {
                volumeBar.style.width = (media.volume * 100) + '%';
                volumeSlider.setAttribute('aria-valuenow', Math.round(media.volume * 100));
                volumeSlider.setAttribute('aria-valuetext', `${Math.round(media.volume * 100)} percent`);
                media.muted = false;
                volumeBtn.innerHTML = media.volume === 0 ? createIconElement('volumeMute') : createIconElement('volume');
                announceToScreenReader(`Volume ${Math.round(media.volume * 100)} percent`);
            }
        });

        media.addEventListener('volumechange', () => {
            volumeBar.style.width = (media.volume * 100) + '%';
            volumeSlider.setAttribute('aria-valuenow', Math.round(media.volume * 100));
            volumeSlider.setAttribute('aria-valuetext', `${Math.round(media.volume * 100)} percent`);
        });

        // Fullscreen (video only)
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                const container = media.closest(CONFIG.CONTAINER_SELECTOR);
                if (!doc.fullscreenElement) {
                    container.requestFullscreen().catch(() => {
                        announceToScreenReader('Fullscreen not available');
                    });
                    fullscreenBtn.innerHTML = createIconElement('fullscreenExit');
                    fullscreenBtn.dataset.state = 'fullscreen';
                    fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
                    announceToScreenReader('Entered fullscreen mode');
                } else {
                    doc.exitFullscreen();
                    fullscreenBtn.innerHTML = createIconElement('fullscreen');
                    fullscreenBtn.dataset.state = 'normal';
                    fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
                    announceToScreenReader('Exited fullscreen mode');
                }
            });

            doc.addEventListener('fullscreenchange', () => {
                if (!fullscreenBtn) return;
                if (doc.fullscreenElement) {
                    fullscreenBtn.innerHTML = createIconElement('fullscreenExit');
                    fullscreenBtn.dataset.state = 'fullscreen';
                    fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
                } else {
                    fullscreenBtn.innerHTML = createIconElement('fullscreen');
                    fullscreenBtn.dataset.state = 'normal';
                    fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
                }
            });
        }

        const settingsBtn = controlsContainer.querySelector('.settings-btn');
        settingsBtn.addEventListener('click', () => {
            announceToScreenReader('Settings menu - Feature coming soon');
        });

        const transcriptBtn = controlsContainer.querySelector('.transcript-btn');
        transcriptBtn.addEventListener('click', () => {
            announceToScreenReader('Transcript panel - Feature coming soon');
             sendMessageToParent('ENABLE_TRANSCRIPTIONS',{});
        });

        doc.addEventListener('click', () => {
            speedMenu.classList.remove('show');
        });

        // Keyboard shortcuts
        doc.addEventListener('keydown', (e) => {
            const activeElement = doc.activeElement;
            const isControlFocused = controlsContainer.contains(activeElement);
            if (e.code === 'Space') {
                e.preventDefault();
                playPauseBtn.click();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                media.currentTime = Math.max(0, media.currentTime - 10);
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                media.currentTime = Math.min(media.duration, media.currentTime + 10);
            } else if (e.code === 'KeyF' && fullscreenBtn) {
                fullscreenBtn.click();
            } else if (e.code === 'KeyM') {
                volumeBtn.click();
            } else if (e.code === 'ArrowUp' && isControlFocused) {
                e.preventDefault();
                media.volume = Math.min(1, media.volume + 0.1);
            } else if (e.code === 'ArrowDown' && isControlFocused) {
                e.preventDefault();
                media.volume = Math.max(0, media.volume - 0.1);
            }
        });

        const mediaContainer = media.closest(CONFIG.CONTAINER_SELECTOR);
        if (mediaContainer) {
            mediaContainer.setAttribute('role', 'region');
            mediaContainer.setAttribute('aria-label', IS_AUDIO ? 'Audio player' : 'Video player');
        }

        return controlsContainer;
    };

    const attachEventListeners = (media, overlay, customControls, centerPauseIcon) => {
        if (!IS_AUDIO) {
            const showOverlay = () => overlay && overlay.classList.add('show');
            const hideOverlay = () => overlay && overlay.classList.remove('show');
            const showCenterPause = () => centerPauseIcon && centerPauseIcon.classList.add('show');
            const hideCenterPause = () => centerPauseIcon && centerPauseIcon.classList.remove('show');

            if (centerPauseIcon) {
                centerPauseIcon.addEventListener('click', () => {
                    if (media.paused) {
                        media.play();
                        announceToScreenReader(IS_AUDIO ? 'Audio playing' : 'Video playing');
                    }
                });
            }

            media.addEventListener('pause', () => { showOverlay(); showCenterPause(); });
            media.addEventListener('play', () => { hideOverlay(); hideCenterPause(); });
            media.addEventListener('ended', () => { hideOverlay(); hideCenterPause(); });

        }

        const mediaContainer = media.closest(CONFIG.CONTAINER_SELECTOR);
        if (mediaContainer) {
            const showControls = () => {
                customControls.style.opacity = '1';
                customControls.style.visibility = 'visible';
            };
            const hideControls = () => {
                customControls.style.opacity = '0';
                customControls.style.visibility = 'hidden';
            };
            if (!IS_AUDIO) {
                hideControls();
                mediaContainer.addEventListener('mouseenter', showControls);
                mediaContainer.addEventListener('mouseleave', hideControls);
                customControls.addEventListener('focusin', showControls);
            }
            if (IS_AUDIO) {
                showControls();
            }

            mediaContainer.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.code === 'KeyK') {
                    e.preventDefault();
                    if (media.paused) media.play(); else media.pause();
                } else if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    media.currentTime = Math.max(0, media.currentTime - 5);
                    announceToScreenReader(`Rewound 5 seconds. Now at ${formatTime(media.currentTime)}`);
                } else if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    media.currentTime = Math.min(media.duration, media.currentTime + 5);
                    announceToScreenReader(`Forwarded 5 seconds. Now at ${formatTime(media.currentTime)}`);
                } else if (e.code === 'ArrowUp') {
                    e.preventDefault();
                    media.volume = Math.min(1, media.volume + 0.1);
                    announceToScreenReader(`Volume ${Math.round(media.volume * 100)}%`);
                } else if (e.code === 'ArrowDown') {
                    e.preventDefault();
                    media.volume = Math.max(0, media.volume - 0.1);
                    announceToScreenReader(`Volume ${Math.round(media.volume * 100)}%`);
                } else if (e.code === 'KeyM') {
                    e.preventDefault();
                    media.muted = !media.muted;
                    announceToScreenReader(media.muted ? 'Muted' : 'Unmuted');
                } else if (e.code === 'KeyF') {
                    e.preventDefault();
                    const fullscreenBtn = customControls.querySelector('.fullscreen-btn');
                    if (fullscreenBtn) fullscreenBtn.click();
                }
            });


        }
    };

    const hideUnwantedElements = (innerDoc) => {
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

        selectors.forEach(selector => {
            try {
                const elements = innerDoc.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent?.trim().toLowerCase();
                    if (text && (
                        text.includes('.mp4') ||
                        text.includes('.mp3') ||
                        text === 'close' ||
                        text.includes('close button') ||
                        text.match(/^\d+mb-.*\.mp4$/i)
                    )) {
                        el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; width: 0 !important; height: 0 !important; pointer-events: none !important;';
                    }
                });
            } catch (e) { }
        });

        const walker = innerDoc.createTreeWalker(innerDoc.body, NodeFilter.SHOW_TEXT, null, false);
        const textNodesToHide = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent?.trim().toLowerCase();
            if (text && node.parentElement) {
                if (text.includes('.mp4') || text === 'close' || text.match(/^\d+mb-.*\.mp4$/i)) {
                    if (!node.parentElement.closest('.custom-video-controls')) {
                        textNodesToHide.push(node.parentElement);
                    }
                }
            }
        }
        textNodesToHide.forEach(el => {
            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important;';
        });

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


    const initializePlayer = (innerDoc) => {
        console.log('🎬 Initializing player with media type:', MEDIA_TYPE);

        // Check if already initialized
        if (innerDoc.querySelector(`.${CONFIG.CONTROLS_CLASS}`)) {
            console.log('⚠️ Player already initialized, skipping');
            return true;
        }

        const mediaContainer = innerDoc.querySelector(CONFIG.CONTAINER_SELECTOR);
        const media = findMediaElement(innerDoc);

        if (!mediaContainer || !media) {
            console.log('❌ Media container or element not found');
            return false;
        }

        isPlayerInitialized = true;

        if (!IS_AUDIO) {
            // Remove any existing styles/controls first
            const existingStyle = innerDoc.getElementById(CONFIG.STYLE_ID);
            const existingOverlay = innerDoc.querySelector(`.${CONFIG.OVERLAY_CLASS}`);
            const existingControls = innerDoc.querySelector(`.${CONFIG.CONTROLS_CLASS}`);
            const existingCenterPause = innerDoc.querySelector('.center-pause-icon');

            if (existingStyle) existingStyle.remove();
            if (existingOverlay) existingOverlay.remove();
            if (existingControls) existingControls.remove();
            if (existingCenterPause) existingCenterPause.remove();
        }

        injectStyles(innerDoc);
        hideUnwantedElements(innerDoc);

        const observer = new MutationObserver(() => { hideUnwantedElements(innerDoc); });
        observer.observe(innerDoc.body, { childList: true, subtree: true, characterData: true });

        if (!IS_AUDIO) {
            const overlay = createOverlay(innerDoc, media);
            const customControls = createCustomControls(innerDoc, media);
            const centerPauseIcon = createCenterPauseIcon(innerDoc);
            const nextLessonOverlay = createNextLessonOverlay(innerDoc, media);

            mediaContainer.style.position = 'relative';
            mediaContainer.setAttribute('role', 'region');
            mediaContainer.setAttribute('aria-label', 'Video player');

            if (overlay) mediaContainer.appendChild(overlay);
            mediaContainer.appendChild(customControls);
            if (centerPauseIcon) mediaContainer.appendChild(centerPauseIcon);
            if (nextLessonOverlay) mediaContainer.appendChild(nextLessonOverlay);

            attachEventListeners(media, overlay, customControls, centerPauseIcon);
            attachNextLessonListener(media, nextLessonOverlay);

        }
        if (IS_AUDIO) {
            const audioIconContainer = createAudioIconContainer(innerDoc, media);
            const customControls = createCustomControls(innerDoc, media);
            const nextLessonOverlay = createNextLessonOverlay(innerDoc, media);

            mediaContainer.style.position = 'relative';
            mediaContainer.setAttribute('role', 'region');
            mediaContainer.setAttribute('aria-label', 'Audio player');

            mediaContainer.appendChild(audioIconContainer);
            mediaContainer.appendChild(customControls);
            if (nextLessonOverlay) mediaContainer.appendChild(nextLessonOverlay);
            
            attachEventListeners(media, null, customControls, null);
            attachNextLessonListener(media, nextLessonOverlay);
        }


        console.log('✅ Player initialized successfully');
        return true;
    };


    const checkIframeReady = (innerDoc) => {
        console.log('🔍 Checking if iframe is ready...');

        const mediaContainer = innerDoc.querySelector(CONFIG.CONTAINER_SELECTOR);
        const media = findMediaElement(innerDoc);

        if (!mediaContainer || !media) {
            console.log('⏳ Waiting for media elements...');
            return false;
        }

        console.log('✅ Iframe is ready');

        // Check if we already have API response
        if (MEDIA_TYPE !== null) {
            console.log('📦 API response already received, initializing player now');
            return initializePlayer(innerDoc);
        } else {
            console.log('⏳ Waiting for API response to determine media type...');
            pendingIframeDoc = innerDoc; // Store for later initialization

            // Send ready message to parent
            sendMessageToParent('IFRAME_FULLY_LOADED', {
                status: 'ready',
                containerFound: true,
                waitingForMediaType: true
            });

            return true; // Don't continue polling
        }
    }

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
            if (checkIframeReady(innerDoc)) cleanup();
        };

        const handleLoad = () => {
            console.log('📄 Iframe loaded');
            trySetup();
        };

        iframe.addEventListener('load', handleLoad);
        pollInterval = setInterval(trySetup, CONFIG.POLL_INTERVAL_MS);
        timeoutTimer = setTimeout(() => { cleanup(); }, CONFIG.TIMEOUT_MS);
        trySetup();
    };

    const init = () => {

        initMessageListener();
        console.log('🚀 Initializing player script');

        const iframe = document.querySelector(CONFIG.IFRAME_SELECTOR);
        if (iframe) {
            console.log('✅ Iframe found immediately');
            createWatcher(iframe);
            return;
        }

        const observer = new MutationObserver(() => {
            const found = document.querySelector(CONFIG.IFRAME_SELECTOR);
            if (found) { observer.disconnect(); createWatcher(found); }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    if (typeof window.rscpCustomizationCompleted === 'function') {
        window.rscpCustomizationCompleted();
    }
    console.log('📜script loaded');
})();
