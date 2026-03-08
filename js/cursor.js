(function() {
  'use strict';

  // Mobile: don't init custom cursor
  if ('ontouchstart' in window) {
    window.__cursorActive = false;
    return;
  }

  var dot = document.querySelector('.cursor-dot');
  var ring = document.querySelector('.cursor-ring');
  var cross = document.querySelector('.cursor-cross');
  if (!dot || !ring) return;

  window.__cursorActive = true;

  var mouseX = 0, mouseY = 0;
  var ringX = 0, ringY = 0;
  var lerp = 0.12;
  var isInHero = false;

  // Trail history for hero
  var trail = [];
  var MAX_TRAIL = 4;
  var trailSizes = [32, 28, 22, 16];
  var trailOpacities = [0.15, 0.10, 0.06, 0.02];
  var ghostEls = [];

  // Create ghost ring elements
  for (var i = 0; i < MAX_TRAIL; i++) {
    var ghost = document.createElement('div');
    ghost.className = 'cursor-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = trailSizes[i] + 'px';
    ghost.style.height = trailSizes[i] + 'px';
    ghost.style.borderColor = 'rgba(240,240,240,' + trailOpacities[i] + ')';
    ghost.style.display = 'none';
    document.body.appendChild(ghost);
    ghostEls.push(ghost);
  }

  // Hide default cursor
  document.body.style.cursor = 'none';

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    if (cross) {
      cross.style.left = mouseX + 'px';
      cross.style.top = mouseY + 'px';
    }
  });

  // Hover states
  var hoverTargets = 'a, button, .philosophy-card, .tool-node';
  document.addEventListener('mouseover', function(e) {
    var target = e.target.closest(hoverTargets);
    if (target) {
      ring.classList.add('hover');
    }
    var tlNode = e.target.closest('.node-group');
    if (tlNode) {
      ring.classList.remove('hover');
      ring.classList.add('hover-timeline');
    }
  });
  document.addEventListener('mouseout', function(e) {
    var target = e.target.closest(hoverTargets);
    if (target) {
      ring.classList.remove('hover');
    }
    var tlNode = e.target.closest('.node-group');
    if (tlNode) {
      ring.classList.remove('hover-timeline');
    }
  });

  // Hero crosshair + trail
  var hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mouseenter', function() {
      isInHero = true;
      ring.style.opacity = '0';
      if (cross) cross.classList.add('active');
    });
    hero.addEventListener('mouseleave', function() {
      isInHero = false;
      ring.style.opacity = '1';
      if (cross) cross.classList.remove('active');
      // Hide ghosts
      for (var i = 0; i < ghostEls.length; i++) {
        ghostEls[i].style.display = 'none';
      }
      trail = [];
    });
  }

  function update() {
    // Lerp ring position
    ringX += (mouseX - ringX) * lerp;
    ringY += (mouseY - ringY) * lerp;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    // Trail in hero
    if (isInHero) {
      trail.unshift({ x: mouseX, y: mouseY });
      if (trail.length > MAX_TRAIL) trail.pop();
      for (var i = 0; i < ghostEls.length; i++) {
        if (i < trail.length) {
          ghostEls[i].style.display = 'block';
          ghostEls[i].style.left = trail[i].x + 'px';
          ghostEls[i].style.top = trail[i].y + 'px';
        } else {
          ghostEls[i].style.display = 'none';
        }
      }
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
