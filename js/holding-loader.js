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
    var loader = document.querySelector('.page-loader');
    if (loader) loader.style.display = 'none';
    document.documentElement.classList.remove('fonts-loading');
    document.documentElement.classList.add('fonts-loaded');
    document.querySelectorAll('.name-inner').forEach(function(el) {
      el.style.transform = 'none';
    });
    document.querySelectorAll('.name-line').forEach(function(el) {
      el.style.overflow = 'visible';
    });
    var mark = document.querySelector('.holding-mark');
    if (mark) mark.style.opacity = '1';
    var title = document.querySelector('.holding-title');
    if (title) title.style.opacity = '1';
    var contact = document.querySelector('.holding-contact');
    if (contact) contact.style.opacity = '1';
    resolve();
    return;
  }

  var loader = document.querySelector('.page-loader');
  var loaderZ = document.querySelector('.loader-z');
  var loaderK = document.querySelector('.loader-k');

  if (!loader || !loaderZ || !loaderK || typeof gsap === 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      startSequence();
    });
    return;
  }

  startSequence();

  function startSequence() {
    loader = loader || document.querySelector('.page-loader');
    loaderZ = loaderZ || document.querySelector('.loader-z');
    loaderK = loaderK || document.querySelector('.loader-k');

    if (!loader || typeof gsap === 'undefined') {
      if (loader) loader.style.display = 'none';
      resolve();
      return;
    }

    var tl = gsap.timeline();

    // ZK slide in
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

    // Loader fades out
    tl.to(loader, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: function() {
        loader.style.display = 'none';
        loader.remove();
        revealContent();
      }
    }, 1.1);
  }

  function revealContent() {
    var nameInners = document.querySelectorAll('.name-inner');
    var mark = document.querySelector('.holding-mark');
    var title = document.querySelector('.holding-title');
    var contact = document.querySelector('.holding-contact');

    // Name reveal — staggered, then remove clip
    if (nameInners.length >= 2) {
      gsap.to(nameInners[0], {
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.15
      });
      gsap.to(nameInners[1], {
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.35,
        onComplete: function() {
          // Remove overflow clip so italic letterforms aren't cut off
          document.querySelectorAll('.name-line').forEach(function(el) {
            el.style.overflow = 'visible';
          });
        }
      });
    }

    // ZK mark fade in
    if (mark) {
      gsap.to(mark, {
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        delay: 0.8
      });
    }

    // Title fade in
    if (title) {
      gsap.to(title, {
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        delay: 1.0
      });
    }

    // Contact icons fade in
    if (contact) {
      gsap.to(contact, {
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        delay: 1.3
      });
    }

    resolve();
  }
})();
