/* Every clip on the site plays at 1.5x.
 *
 * Set on load, and again whenever a clip starts or swaps source: a browser
 * resets the rate when it reloads media, so a one-off assignment on page load
 * would only hold until the first clip reloaded.
 */
(function () {
  var RATE = 1.5;

  function set(video) {
    if (video.playbackRate !== RATE) video.playbackRate = RATE;
  }

  function setAll(root) {
    var videos = root.querySelectorAll ? root.querySelectorAll('video') : [];
    Array.prototype.forEach.call(videos, set);
  }

  document.addEventListener('loadedmetadata', function (event) {
    if (event.target.tagName === 'VIDEO') set(event.target);
  }, true);

  document.addEventListener('play', function (event) {
    if (event.target.tagName === 'VIDEO') set(event.target);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setAll(document); });
  } else {
    setAll(document);
  }
})();
