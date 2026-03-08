(function() {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({ toggleActions: 'play none none none' });

  // Lenis init
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    window.__lenis = lenis;
  }

  if (reduceMotion) {
    // Kill scroll-triggered animations only
    ScrollTrigger.getAll().forEach(function(t) { t.kill(); });
    if (lenis) {
      gsap.ticker.remove(function(time) { lenis.raf(time * 1000); });
      lenis.destroy();
    }
    document.documentElement.style.scrollBehavior = 'smooth';
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.hero-word-inner').forEach(function(el) {
      el.style.transform = 'none';
    });
    if (typeof window.drawStaticCanvasFrame === 'function') {
      window.drawStaticCanvasFrame();
    }
    if (typeof window.renderStaticMindMap === 'function') {
      window.renderStaticMindMap();
    }
    return;
  }

  // Wait for loader to complete before setting up ScrollTrigger
  var loaderReady = window.__loaderComplete || Promise.resolve();
  loaderReady.then(function() {
    ScrollTrigger.refresh();
    initScrollAnimations();
  });

  function initScrollAnimations() {
    // Hero parallax
    gsap.to('.hero-content', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      },
      y: function() { return window.innerHeight * 0.3; },
      ease: 'none'
    });

    // Hero canvas fade
    gsap.to('#node-canvas', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      },
      opacity: 0.7,
      ease: 'none'
    });

    // Scroll indicator hide
    gsap.to('.scroll-indicator', {
      scrollTrigger: {
        trigger: '#hero',
        start: '100px top',
        end: '200px top',
        scrub: true
      },
      opacity: 0,
      ease: 'none'
    });

    // Section labels
    gsap.utils.toArray('.section-label').forEach(function(el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        },
        x: -20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out'
      });
    });

    // Section headings
    gsap.utils.toArray('.text-display[data-animate]').forEach(function(el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: 0.08,
        ease: 'power3.out'
      });
    });

    // About photos
    var photoPro = document.querySelector('.photo-pro');
    if (photoPro) {
      gsap.from(photoPro, {
        scrollTrigger: {
          trigger: '.photo-stack',
          start: 'top 80%'
        },
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }

    var photoPersonal = document.querySelector('.photo-personal');
    if (photoPersonal) {
      gsap.from(photoPersonal, {
        scrollTrigger: {
          trigger: '.photo-stack',
          start: 'top 80%'
        },
        x: 40,
        opacity: 0,
        duration: 0.6,
        delay: 0.15,
        ease: 'power3.out'
      });
    }

    // About text paragraphs
    gsap.utils.toArray('.about-text [data-animate]').forEach(function(el, i) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        },
        y: 40,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.12,
        ease: 'power3.out'
      });
    });

    // Philosophy cards batch
    ScrollTrigger.batch('.philosophy-card', {
      start: 'top 85%',
      onEnter: function(batch) {
        gsap.from(batch, {
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out'
        });
      },
      once: true
    });

    // Stack mindmap
    var mindmapContainer = document.querySelector('.mindmap-container');
    if (mindmapContainer) {
      gsap.from(mindmapContainer, {
        scrollTrigger: {
          trigger: mindmapContainer,
          start: 'top 80%'
        },
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }

    // Contact
    gsap.utils.toArray('#contact [data-animate]').forEach(function(el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
      });
    });
  }
})();
