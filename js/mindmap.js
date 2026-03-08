(function() {
  'use strict';

  var canvas = document.getElementById('mindmap-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H;
  var rafId = null;
  var time = 0;

  // Spec: central ZEV node (gold)
  // Inner ring r=140px, 5 nodes at 0/72/144/216/288 degrees
  // Outer ring r=240px, 5 nodes at 36/108/180/252/324 degrees
  // Total 10 tool nodes, no category hubs

  var INNER_R = 140;
  var OUTER_R = 240;

  var innerNodes = [
    { label: 'n8n',      angleDeg: 0 },
    { label: 'Claude',   angleDeg: 72 },
    { label: 'Airtable', angleDeg: 144 },
    { label: 'Slack',    angleDeg: 216 },
    { label: 'Vercel',   angleDeg: 288 }
  ];

  var outerNodes = [
    { label: 'Make',     angleDeg: 36 },
    { label: 'HubSpot',  angleDeg: 108 },
    { label: 'Notion',   angleDeg: 180 },
    { label: 'GitHub',   angleDeg: 252 },
    { label: 'Figma',    angleDeg: 324 }
  ];

  function degToRad(d) { return d * Math.PI / 180; }

  // Neuron spark system
  var sparks = [];
  var MAX_SPARKS = 4;
  var SPARK_INTERVAL = 800;
  var lastSparkTime = 0;

  // All node positions (computed in draw)
  var allNodePositions = [];

  function spawnSpark(now) {
    if (sparks.length >= MAX_SPARKS) return;
    if (allNodePositions.length < 2) return;

    // Pick two random different nodes
    var a = Math.floor(Math.random() * allNodePositions.length);
    var b = a;
    while (b === a) b = Math.floor(Math.random() * allNodePositions.length);

    var isGold = Math.random() < 0.3;
    sparks.push({
      from: allNodePositions[a],
      to: allNodePositions[b],
      progress: 0,
      speed: 0.015 + Math.random() * 0.01,
      color: isGold ? '#C9A84C' : '#0055FF',
      startTime: now
    });
  }

  function resize() {
    var container = canvas.parentElement;
    W = container.offsetWidth || container.clientWidth || 800;
    // Scale height to fit the outer ring comfortably
    H = Math.max(520, Math.min(W * 0.65, 600));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function drawNode(x, y, radius, label, color, fontSize, fontWeight, isCenter) {
    // Glow for center
    if (isCenter) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,0.06)';
      ctx.fill();
    }

    // Circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isCenter ? '#161616' : '#111111';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = isCenter ? 2 : 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = color;
    ctx.font = (fontWeight || '500') + ' ' + (fontSize || 11) + 'px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }

  function drawConnection(x1, y1, x2, y2, alpha) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(0,85,255,' + alpha + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawSparks() {
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.progress += s.speed;
      if (s.progress >= 1) {
        sparks.splice(i, 1);
        continue;
      }

      var x = s.from.x + (s.to.x - s.from.x) * s.progress;
      var y = s.from.y + (s.to.y - s.from.y) * s.progress;

      // Spark glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      var grad = ctx.createRadialGradient(x, y, 0, x, y, 6);
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();

      // Spark core
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var cx = W / 2;
    var cy = H / 2;

    // Scale radii based on available space
    var scale = Math.min(W, H) / 540;
    var innerR = INNER_R * scale;
    var outerR = OUTER_R * scale;

    // Compute all positions
    allNodePositions = [{ x: cx, y: cy }]; // center

    var innerPositions = [];
    innerNodes.forEach(function(node) {
      var rad = degToRad(node.angleDeg);
      var x = cx + Math.cos(rad) * innerR;
      var y = cy + Math.sin(rad) * innerR;
      innerPositions.push({ x: x, y: y, label: node.label });
      allNodePositions.push({ x: x, y: y });
    });

    var outerPositions = [];
    outerNodes.forEach(function(node) {
      var rad = degToRad(node.angleDeg);
      var x = cx + Math.cos(rad) * outerR;
      var y = cy + Math.sin(rad) * outerR;
      outerPositions.push({ x: x, y: y, label: node.label });
      allNodePositions.push({ x: x, y: y });
    });

    // Draw connections: center to inner
    var pulseAlpha = reduceMotion ? 0.15 : 0.1 + Math.sin(time * 0.02) * 0.05;
    innerPositions.forEach(function(pos) {
      drawConnection(cx, cy, pos.x, pos.y, pulseAlpha);
    });

    // Draw connections: center to outer
    outerPositions.forEach(function(pos) {
      drawConnection(cx, cy, pos.x, pos.y, pulseAlpha * 0.6);
    });

    // Draw connections: inner to adjacent outer (nearest neighbor web)
    innerPositions.forEach(function(ip, i) {
      // Connect to the two outer nodes adjacent in angle
      var o1 = outerPositions[i];
      var o2 = outerPositions[(i + outerPositions.length - 1) % outerPositions.length];
      drawConnection(ip.x, ip.y, o1.x, o1.y, 0.06);
      drawConnection(ip.x, ip.y, o2.x, o2.y, 0.06);
    });

    // Draw outer nodes
    outerPositions.forEach(function(pos) {
      drawNode(pos.x, pos.y, 20 * scale, pos.label, '#555555', Math.round(9 * scale), '400', false);
    });

    // Draw inner nodes
    innerPositions.forEach(function(pos) {
      drawNode(pos.x, pos.y, 24 * scale, pos.label, '#0055FF', Math.round(10 * scale), '500', false);
    });

    // Draw sparks
    if (!reduceMotion) {
      drawSparks();
    }

    // Center node
    var centerPulse = reduceMotion ? 32 * scale : (30 + Math.sin(time * 0.03) * 2) * scale;
    drawNode(cx, cy, centerPulse, 'ZEV', '#C9A84C', Math.round(14 * scale), '800', true);
  }

  function animate() {
    time++;

    // Spawn sparks at interval
    var now = performance.now();
    if (now - lastSparkTime > SPARK_INTERVAL) {
      spawnSpark(now);
      lastSparkTime = now;
    }

    draw();
    rafId = requestAnimationFrame(animate);
  }

  window.renderStaticMindMap = function() {
    resize();
    draw();
  };

  function init() {
    resize();

    if (reduceMotion) {
      draw();
      return;
    }

    lastSparkTime = performance.now();
    animate();
  }

  // Resize handler
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      resize();
      if (reduceMotion) draw();
    }, 200);
  });

  // Init when section becomes visible
  if (typeof IntersectionObserver !== 'undefined') {
    var stackSection = document.getElementById('stack');
    if (stackSection) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            init();
            obs.disconnect();
          }
        });
      }, { threshold: 0.1 });
      obs.observe(stackSection);
    }
  } else {
    init();
  }
})();
