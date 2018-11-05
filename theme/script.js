/**
 * Returns the current page number of the presentation.
 */
function currentPosition() {
  return parseInt(document.querySelector('.slide:not(.hidden)').id.slice(6));
}

/**
 * Navigates forward n pages
 * If n is negative, we will navigate in reverse
 */
function navigate(n) {
  var position = currentPosition();
  var numSlides = document.getElementsByClassName('slide').length;

  var $fragments = document.querySelectorAll('#slide-' + position + ' .fragment');
  var fragmentsFinished = false;
  if ($fragments.length) {
    if (n > 0) {
      var $f = document.querySelectorAll('#slide-' + position + ' .fragment.hidden');
      if (!$f.length) fragmentsFinished = true;
      else $f[0].classList.remove('hidden');
    } else {
      var $f = document.querySelectorAll('#slide-' + position + ' .fragment:not(.hidden)');
      if (!$f.length) fragmentsFinished = true;
      else $f[$f.length - 1].classList.add('hidden');
    }
  } else {
    fragmentsFinished = true;
  }

  if (fragmentsFinished) {
    /* Positions are 1-indexed, so we need to add and subtract 1 */
    var nextPosition = (position - 1 + n) % numSlides + 1;

    /* Normalize nextPosition in-case of a negative modulo result */
    nextPosition = (nextPosition - 1 + numSlides) % numSlides + 1;

    document.getElementById('slide-' + position).classList.add('hidden');
    document.getElementById('slide-' + nextPosition).classList.remove('hidden');
    position = nextPosition
    updateProgress();
    updateURL();
    updateTabIndex();
  }
  document.getElementById('slide-' + position).dispatchEvent(new Event('navigate', { bubbles: true }))
}

/**
 * Updates the current URL to include a hashtag of the current page number.
 */
function updateURL() {
  try {
    window.history.replaceState({}, null, '#' + currentPosition());
  } catch (e) {
    window.location.hash = currentPosition();
  }
}

/**
 * Sets the progress indicator.
 */
function updateProgress() {
  var progressBar = document.querySelector('.progress-bar');

  if (progressBar !== null) {
    var numSlides = document.getElementsByClassName('slide').length;
    var position = currentPosition() - 1;
    var percent = (numSlides === 1) ? 100 : 100 * position / (numSlides - 1);
    progressBar.style.width = percent.toString() + '%';
  }
}

/**
 * Removes tabindex property from all links on the current slide, sets
 * tabindex = -1 for all links on other slides. Prevents slides from appearing
 * out of control.
 */
function updateTabIndex() {
  var allLinks = document.querySelectorAll('.slide a');
  var position = currentPosition();
  var currentPageLinks = document.getElementById('slide-' + position).querySelectorAll('a');
  var i;

  for (i = 0; i < allLinks.length; i++) {
    allLinks[i].setAttribute('tabindex', -1);
  }

  for (i = 0; i < currentPageLinks.length; i++) {
    currentPageLinks[i].removeAttribute('tabindex');
  }
}

/**
 * Determines whether or not we are currently in full screen mode
 */
function isFullScreen() {
  return document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;
}

/**
 * Toggle fullScreen mode on document element.
 * Works on chrome (>= 15), firefox (>= 9), ie (>= 11), opera(>= 12.1), safari (>= 5).
 */
function toggleFullScreen() {
  /* Convenient renames */
  var docElem = document.documentElement;
  var doc = document;

  docElem.requestFullscreen =
    docElem.requestFullscreen ||
    docElem.msRequestFullscreen ||
    docElem.mozRequestFullScreen ||
    docElem.webkitRequestFullscreen.bind(docElem, Element.ALLOW_KEYBOARD_INPUT);

  doc.exitFullscreen =
    doc.exitFullscreen ||
    doc.msExitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen;

  isFullScreen() ? doc.exitFullscreen() : docElem.requestFullscreen();
}

const initPresenterText = (selector) => {
  document.addEventListener('navigate', event => {
    const lastPosition = document.getElementsByClassName('slide').length
    if (currentPosition() === lastPosition)  return;
    console.clear()
    event.target.querySelectorAll('h1,h2,h3,p,li').forEach(node => console.log(`%c${node.innerText.trim()}`, 'font-size:large;font-weight:bold; color:darkgrey'))
    event.target.querySelectorAll(selector).forEach(node => console.info(`%c${node.textContent.trim()}`, 'font-size:large'))
    console.log(`%c${currentPosition()}/${document.getElementsByClassName('slide').length} ${new Intl.DateTimeFormat('en', {hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Paris'}).format(new Date())}`, 'font-style:italic')
  })
}

document.addEventListener('DOMContentLoaded', () => {
  // Update the tabindex to prevent weird slide transitioning
  updateTabIndex()

  // initPresenterText('script[type="presenter/text"]')

  // If the location hash specifies a page number, go to it.
  var page = window.location.hash.slice(1)
  if (page) {
    navigate(parseInt(page) - 1);
  }

  document.onkeydown = (e) => {
    if(e.target.tagName.toLowerCase() === 'textarea') return
    var kc = e.keyCode

    // left, down, H, J, backspace, PgUp - BACK
    // up, right, K, L, space, PgDn - FORWARD
    // enter - FULLSCREEN
    if (kc === 37 || kc === 40 || kc === 8 || kc === 72 || kc === 74 || kc === 33) {
      navigate(-1)
    } else if (kc === 38 || kc === 39 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {
      navigate(1)
    } else if (kc === 13) {
      toggleFullScreen()
    } else if (kc === 27) {
      toggleOverview()
    }
  }

  if (document.querySelector('.next') && document.querySelector('.prev')) {
    document.querySelector('.next').onclick = (e) => {
      e.preventDefault()
      navigate(1)
    }

    document.querySelector('.prev').onclick = (e) => {
      e.preventDefault()
      navigate(-1)
    }
  }
  if (document.querySelector('.overview')) {
    document.querySelector('.overview').onclick = toggleOverview
  }

  document.querySelectorAll('.slide-overlay').forEach($overlay => {
    $overlay.onclick = event => {
      navigate(parseInt(event.target.dataset.id) - currentPosition())
      toggleOverview()
    }
  })

  document.querySelectorAll('.fragment').forEach($fragment => {
    $fragment.classList.add('hidden')
  })

})

function toggleOverview() {
  if (window.$style !== undefined) {
    window.$style.remove()
    delete window.$style
    document.querySelector('.slides').classList.remove('active')
  } else {
    const $slides = document.querySelector('.slides')
    $slides.classList.add('active')
    const slidesList = document.querySelectorAll('.slide-wrapper')

    const w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight || e.clientHeight || g.clientHeight

    w.$style = d.createElement('style')
    w.$style.innerHTML = '.slide-wrapper {width: ' + (x * 0.25) + 'px; height: ' + (y * 0.25) + 'px; } body .slide {width: ' + x + 'px; height: ' + y + 'px; position: relative; transform: scale(0.25,0.25); transform-origin: 0 0; } .slide.hidden{visibility: visible }'
    d.getElementsByTagName('head')[0].appendChild(w.$style)
  }
}
