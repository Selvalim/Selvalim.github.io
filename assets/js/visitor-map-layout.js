(function () {
  var visitorMap = document.querySelector('.visitor-map');
  var profile = document.querySelector('.profile_box');
  var footer = document.getElementById('visitor-map-footer');
  if (!visitorMap || !profile || !footer) return;

  var wideScreen = window.matchMedia('(min-width: 925px)');
  function placeVisitorMap() {
    var destination = wideScreen.matches ? profile : footer;
    // Move the existing widget without reloading its script or counting twice.
    if (visitorMap.parentNode !== destination) {
      destination.appendChild(visitorMap);
    }
  }

  placeVisitorMap();
  wideScreen.addEventListener('change', placeVisitorMap);
})();
