/* Every clip on the site plays at 1.5x.
 *
 * Set on load, and again whenever a clip starts or swaps source: a browser
 * resets the rate when it reloads media, so a one-off assignment on page load
 * would only hold until the first clip reloaded.
 *
 * A clip may carry data-speed="0.75" to run at its own rate instead: the race
 * plan is dense (plan, catalogue, fuel bars) and reads better at half the pace
 * of the rest of the page.
 */
(function () {
  var RATE = 1.5;

  function rateFor(video) {
    var own = parseFloat(video.dataset ? video.dataset.speed : '');
    return isFinite(own) && own > 0 ? own : RATE;
  }

  function set(video) {
    var rate = rateFor(video);
    if (video.playbackRate !== rate) video.playbackRate = rate;
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
