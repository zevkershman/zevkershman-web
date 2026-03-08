(function() {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var resolve;

  window.__loaderComplete = new Promise(function(r) { resolve = r; });

  // Font loading with timeout fallback
  var fontTimeout = setTimeout(function() {
    document.documentElement.classList.remove('fonts-loading');
    document.documentElement.classList.add('fonts-loaded');
  }, 3000);

  document.fonts.ready.then(function() {
    clearTimeout(fontTimeout);
    document.documentElement.classList.remove('fonts-loading');
    document.documentElement.classList.add('fonts-loaded');
  });

  if (reduceMotion) {
    // Skip loader entirely
    var loader = document.querySelector('.page-loader');
    if (loader) loader.style.display = 'none';
    document.documentElement.classList.remove('fonts-loading');
    document.documentElement.classList.add('fonts-loaded');
    // Make hero content visible immediately
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.style.opacity = '1';
    document.querySelectorAll('.hero-word-inner').forEach(function(el) {
      el.style.transform = 'none';
    });
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    // Show typewriter text immediately
    var twOutput = document.querySelector('.typewriter-output');
    if (twOutput) {
      twOutput.textContent = "Built by hand. Powered by systems.";
    }
    var twCursor = document.querySelector('.typewriter-cursor');
    if (twCursor) twCursor.style.display = 'none';
    resolve();
    return;
  }

  // Animated loader sequence
  var loader = document.querySelector('.page-loader');
  var loaderZ = document.querySelector('.loader-z');
  var loaderK = document.querySelector('.loader-k');

  if (!loader || !loaderZ || !loaderK || typeof gsap === 'undefined') {
    // GSAP not loaded yet, wait for it
    document.addEventListener('DOMContentLoaded', function() {
      startLoaderSequence();
    });
    return;
  }

  startLoaderSequence();

  function startLoaderSequence() {
    // Re-query in case DOM wasn't ready
    loader = loader || document.querySelector('.page-loader');
    loaderZ = loaderZ || document.querySelector('.loader-z');
    loaderK = loaderK || document.querySelector('.loader-k');

    if (!loader || typeof gsap === 'undefined') {
      // Fallback: just resolve
      if (loader) loader.style.display = 'none';
      resolve();
      return;
    }

    var tl = gsap.timeline();

    // t=0.2s: Z and K slide in
    tl.to(loaderZ, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out'
    }, 0.2);

    tl.to(loaderK, {
      x: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out'
    }, 0.2);

    // t=1.1s: loader fades out
    tl.to(loader, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: function() {
        loader.style.display = 'none';
        loader.remove();
        heroReveal();
      }
    }, 1.1);
  }

  function heroReveal() {
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.style.opacity = '1';

    var wordInners = document.querySelectorAll('.hero-word-inner');
    if (wordInners.length >= 2 && typeof gsap !== 'undefined') {
      // ZEV
      gsap.to(wordInners[0], {
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.2
      });
      // KERSHMAN
      gsap.to(wordInners[1], {
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.4
      });
    }

    // Typewriter at t=2.0s relative to page load (~0.9s after hero reveal)
    setTimeout(function() {
      typewriter();
    }, 900);

    // Hero rule
    var heroRule = document.querySelector('.hero-rule');
    if (heroRule && typeof gsap !== 'undefined') {
      gsap.to(heroRule, {
        scaleX: 1,
        duration: 0.4,
        ease: 'power3.out',
        delay: 1.4
      });
    }

    // Scroll indicator
    var scrollInd = document.querySelector('.scroll-indicator');
    if (scrollInd && typeof gsap !== 'undefined') {
      gsap.to(scrollInd, {
        opacity: 1,
        duration: 0.3,
        ease: 'power3.out',
        delay: 1.6
      });
    }

    // Resolve loader promise
    setTimeout(function() {
      resolve();
    }, 500);
  }

  function typewriter() {
    var output = document.querySelector('.typewriter-output');
    var cursor = document.querySelector('.typewriter-cursor');
    if (!output) return;

    var text = "Built by hand. Powered by systems.";
    var i = 0;

    function type() {
      if (i < text.length) {
        var span = document.createElement('span');
        span.textContent = text[i];
        span.style.opacity = '0';
        span.style.transition = 'opacity 80ms';
        output.appendChild(span);
        // Trigger reflow then fade in
        requestAnimationFrame(function() {
          span.style.opacity = '1';
        });
        i++;
        setTimeout(type, 30);
      } else {
        // Typing complete — fade cursor
        if (cursor) {
          cursor.classList.add('done');
          setTimeout(function() {
            cursor.style.display = 'none';
          }, 1000);
        }
      }
    }

    type();
  }
})();
