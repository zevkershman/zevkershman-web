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

  // Mind map data
  var center = { label: 'ZEV', color: '#C9A84C' };
  var categories = [
    {
      label: 'AUTOMATION', color: '#0055FF', angle: -0.4,
      tools: ['n8n', 'Make', 'Zapier']
    },
    {
      label: 'AI', color: '#0055FF', angle: -1.2,
      tools: ['Claude', 'GPT-4', 'Cursor']
    },
    {
      label: 'DATA', color: '#0055FF', angle: -2.0,
      tools: ['Airtable', 'Sheets', 'Notion']
    },
    {
      label: 'COMMS', color: '#0055FF', angle: 2.5,
      tools: ['Slack', 'Loom', 'HubSpot']
    },
    {
      label: 'DEV', color: '#0055FF', angle: 1.8,
      tools: ['Vercel', 'GitHub', 'Figma']
    },
    {
      label: 'OPS', color: '#0055FF', angle: 0.8,
      tools: ['Google WS', 'Jira', 'Linear']
    }
  ];

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function drawNode(x, y, radius, label, color, fontSize, fontWeight, isCenter) {
    // Glow
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

  function drawConnection(x1, y1, x2, y2, color, alpha) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color.replace(')', ',' + alpha + ')').replace('rgb', 'rgba');
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var cx = W / 2;
    var cy = H / 2;
    var catRadius = Math.min(W, H) * 0.3;
    var toolRadius = Math.min(W, H) * 0.42;

    // Draw connections and nodes for each category
    categories.forEach(function(cat, ci) {
      var catX = cx + Math.cos(cat.angle) * catRadius;
      var catY = cy + Math.sin(cat.angle) * catRadius;

      // Subtle pulse on connection
      var pulseAlpha = reduceMotion ? 0.15 : 0.1 + Math.sin(time * 0.02 + ci) * 0.05;

      // Connection: center to category
      drawConnection(cx, cy, catX, catY, 'rgb(0,85,255)', pulseAlpha);

      // Tool nodes
      var toolSpread = 0.4;
      cat.tools.forEach(function(tool, ti) {
        var toolAngle = cat.angle + (ti - 1) * toolSpread;
        var toolX = cx + Math.cos(toolAngle) * toolRadius;
        var toolY = cy + Math.sin(toolAngle) * toolRadius;

        // Connection: category to tool
        drawConnection(catX, catY, toolX, toolY, 'rgb(0,85,255)', 0.08);

        // Tool node
        drawNode(toolX, toolY, 18, tool, '#555555', 9, '400', false);
      });

      // Category node (drawn after tools so it's on top)
      drawNode(catX, catY, 28, cat.label, '#0055FF', 10, '500', false);
    });

    // Center node
    var centerPulse = reduceMotion ? 32 : 30 + Math.sin(time * 0.03) * 2;
    drawNode(cx, cy, centerPulse, center.label, center.color, 14, '800', true);
  }

  function animate() {
    time++;
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
