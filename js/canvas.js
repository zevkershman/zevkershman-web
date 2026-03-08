(function() {
  'use strict';

  const canvas = document.getElementById('node-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const NODE_COUNT = isMobile ? 60 : 120;
  const MAX_DIST = 110;
  const REPEL_RADIUS = 150;
  const REPEL_STRENGTH = 0.006;
  const MAX_VEL = 2.5;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let nodes = [];
  let rafId = null;
  let mouseX = -9999;
  let mouseY = -9999;
  let lastFrame = 0;
  let canvasW = 0;
  let canvasH = 0;

  window.__canvasAnimating = false;
  window.__nodeCount = NODE_COUNT;
  window.__nodeColorDist = { blue: 0, gold: 0 };
  window.__freezeCanvas = function() {
    if (rafId) cancelAnimationFrame(rafId);
    window.__canvasAnimating = false;
  };

  function resize() {
    const oldW = canvasW;
    const oldH = canvasH;
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);

    if (oldW && oldH && nodes.length) {
      var scaleX = canvasW / oldW;
      var scaleY = canvasH / oldH;
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].x *= scaleX;
        nodes[i].y *= scaleY;
      }
    }
  }

  function initNodes() {
    nodes = [];
    var blueCount = 0;
    var goldCount = 0;
    for (var i = 0; i < NODE_COUNT; i++) {
      var isBlue = Math.random() < 0.7;
      if (isBlue) blueCount++; else goldCount++;
      nodes.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1.5,
        color: isBlue ? '#0055FF' : '#C9A84C',
        opacity: isBlue ? (0.7 + Math.random() * 0.3) : (0.5 + Math.random() * 0.3)
      });
    }
    window.__nodeColorDist = { blue: blueCount / NODE_COUNT, gold: goldCount / NODE_COUNT };
  }

  function drawFrame() {
    ctx.clearRect(0, 0, canvasW, canvasH);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];

      // Update position
      n.x += n.vx;
      n.y += n.vy;

      // Edge bounce
      if (n.x < 0 || n.x > canvasW) {
        n.vx *= -1;
        n.vx += (Math.random() - 0.5) * 0.1;
      }
      if (n.y < 0 || n.y > canvasH) {
        n.vy *= -1;
        n.vy += (Math.random() - 0.5) * 0.1;
      }

      // Clamp position
      n.x = Math.max(0, Math.min(canvasW, n.x));
      n.y = Math.max(0, Math.min(canvasH, n.y));

      // Mouse repulsion (desktop only)
      if (!isMobile && mouseX > -999) {
        var dx = n.x - mouseX;
        var dy = n.y - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < REPEL_RADIUS) {
          var force = (REPEL_RADIUS - dist) * REPEL_STRENGTH;
          n.vx -= (dx / dist) * -force;
          n.vy -= (dy / dist) * -force;
        }
      }

      // Damping + clamp velocity
      n.vx *= 0.98;
      n.vy *= 0.98;
      n.vx = Math.max(-MAX_VEL, Math.min(MAX_VEL, n.vx));
      n.vy = Math.max(-MAX_VEL, Math.min(MAX_VEL, n.vy));

      // Draw connections
      for (var j = i + 1; j < nodes.length; j++) {
        var m = nodes[j];
        var cdx = n.x - m.x;
        var cdy = n.y - m.y;
        var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < MAX_DIST) {
          var alpha = (1 - cdist / MAX_DIST) * 0.35;
          if (alpha > 0.05) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            if (n.color === '#0055FF') {
              ctx.strokeStyle = 'rgba(0,85,255,' + alpha + ')';
            } else {
              ctx.strokeStyle = 'rgba(201,168,76,' + alpha + ')';
            }
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      if (n.color === '#0055FF') {
        ctx.fillStyle = 'rgba(0,85,255,' + n.opacity + ')';
      } else {
        ctx.fillStyle = 'rgba(201,168,76,' + n.opacity + ')';
      }
      ctx.fill();
    }
  }

  function animate(timestamp) {
    // Mobile: throttle to ~30fps
    if (isMobile && timestamp - lastFrame < 33) {
      rafId = requestAnimationFrame(animate);
      return;
    }
    lastFrame = timestamp;

    drawFrame();
    rafId = requestAnimationFrame(animate);
  }

  // Touch ripple for mobile
  function handleTouch(e) {
    if (!e.touches || !e.touches[0]) return;
    var rect = canvas.getBoundingClientRect();
    var tx = e.touches[0].clientX - rect.left;
    var ty = e.touches[0].clientY - rect.top;

    // Repel nodes from touch point
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = n.x - tx;
      var dy = n.y - ty;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist < REPEL_RADIUS) {
        var force = (REPEL_RADIUS - dist) * REPEL_STRENGTH * 3;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }
    }

    // Draw expanding ring
    drawTouchRipple(tx, ty);
  }

  function drawTouchRipple(x, y) {
    var start = performance.now();
    var duration = 600;
    function rippleFrame(now) {
      var elapsed = now - start;
      if (elapsed > duration) return;
      var progress = elapsed / duration;
      var radius = progress * 60;
      var alpha = (1 - progress) * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,85,255,' + alpha + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      requestAnimationFrame(rippleFrame);
    }
    requestAnimationFrame(rippleFrame);
  }

  // Exported for reduced motion
  window.drawStaticCanvasFrame = function() {
    resize();
    initNodes();
    drawFrame();
  };

  function init() {
    try {
      resize();
      initNodes();

      if (reduceMotion) {
        drawFrame();
        return;
      }

      // Mouse tracking
      var heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.addEventListener('mousemove', function(e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
        });
        heroSection.addEventListener('mouseleave', function() {
          mouseX = -9999;
          mouseY = -9999;
        });
      }

      // Touch support
      canvas.addEventListener('touchstart', handleTouch, { passive: true });

      // Visibility API
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          if (rafId) cancelAnimationFrame(rafId);
          window.__canvasAnimating = false;
        } else {
          lastFrame = 0;
          rafId = requestAnimationFrame(animate);
          window.__canvasAnimating = true;
        }
      });

      // Resize handler
      var resizeTimer;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          var oldScale = dpr;
          resize();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }, 200);
      });

      // Start animation (delayed per timeline spec)
      window.__canvasAnimating = true;
      rafId = requestAnimationFrame(animate);

    } catch (err) {
      console.error('Canvas init failed:', err);
      canvas.style.display = 'none';
      var fallback = document.querySelector('.canvas-fallback');
      if (fallback) fallback.style.display = 'block';
    }
  }

  // Wait for loader timing
  if (window.__loaderComplete) {
    window.__loaderComplete.then(init);
  } else {
    // Fallback: init after short delay
    setTimeout(init, 1100);
  }
})();
