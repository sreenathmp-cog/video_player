// player-customization.js
(function () {
  try {

    console.log("player ad script added");

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
