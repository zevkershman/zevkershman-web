(function() {
  'use strict';

  var svg = document.querySelector('.timeline-svg');
  var tooltip = document.querySelector('.timeline-tooltip');
  if (!svg) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nodes = [
    { id: '01', title: 'BROKERAGE', year: '2008–2014', x: 80, y: 200,
      desc: 'Sold condos in Toronto. Learned that every deal is a system — and every system is only as good as the person running it.' },
    { id: '02', title: 'CONDODORK', year: '2014–2016', x: 220, y: 140,
      desc: 'Built CondoDork — a real estate content platform. First taste of building something from zero.' },
    { id: '03', title: 'MULTIFAMILY', year: '2016–2018', x: 360, y: 240,
      desc: 'Moved into multifamily acquisitions. Bigger deals, bigger systems, bigger stakes.' },
    { id: '04', title: 'PROPTECH', year: '2018–2020', x: 500, y: 160,
      desc: 'Joined the PropTech wave. Started bridging real estate operations with technology at scale.' },
    { id: '05', title: 'DASHQ', year: '2020–2023', x: 640, y: 220,
      desc: 'SVP at DashQ. Built the operational backbone — workflows, automations, integrations. Systems that run themselves.' },
    { id: '06', title: 'AI ARCHITECT', year: '2023–2024', x: 780, y: 150,
      desc: 'Went deep on AI. Claude, n8n, automated pipelines. Building the next layer of operational intelligence.' },
    { id: '07', title: 'FULL-STACK OPERATOR', year: '2024–', x: 920, y: 200,
      desc: 'Full-stack operator. Building what great companies run on. The best system is the one you never have to think about.' }
  ];

  // Draw paths between nodes
  var ns = 'http://www.w3.org/2000/svg';

  function createPath(x1, y1, x2, y2) {
    var midX = (x1 + x2) / 2;
    var d = 'M ' + x1 + ' ' + y1 + ' C ' + midX + ' ' + y1 + ', ' + midX + ' ' + y2 + ', ' + x2 + ' ' + y2;

    // Main dashed path
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255,255,255,0.12)');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-dasharray', '6 4');

    // Glow fuse path
    var fuse = document.createElementNS(ns, 'path');
    fuse.setAttribute('d', d);
    fuse.setAttribute('fill', 'none');
    fuse.setAttribute('stroke', '#0055FF');
    fuse.setAttribute('stroke-width', '3');
    fuse.setAttribute('stroke-linecap', 'round');
    fuse.setAttribute('opacity', '0.7');
    fuse.style.filter = 'blur(2px)';

    return { main: path, fuse: fuse };
  }

  // Draw all paths
  var paths = [];
  for (var i = 0; i < nodes.length - 1; i++) {
    var p = createPath(nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y);
    svg.appendChild(p.main);
    svg.appendChild(p.fuse);
    paths.push(p);
  }

  // Draw nodes
  nodes.forEach(function(node, idx) {
    var g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'node-group');
    g.setAttribute('data-node', node.id);
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', node.title + ' ' + node.year);

    // Invisible hit area
    var hit = document.createElementNS(ns, 'circle');
    hit.setAttribute('class', 'node-hit');
    hit.setAttribute('cx', node.x);
    hit.setAttribute('cy', node.y);
    hit.setAttribute('r', '28');
    hit.setAttribute('fill', 'transparent');
    hit.setAttribute('cursor', 'pointer');

    // Visual circle
    var circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('class', 'node-circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', '#111111');
    circle.setAttribute('stroke', idx === nodes.length - 1 ? '#C9A84C' : '#333333');
    circle.setAttribute('stroke-width', idx === nodes.length - 1 ? '2' : '1.5');

    // Sonar ping for NOW node
    if (idx === nodes.length - 1) {
      var sonar = document.createElementNS(ns, 'circle');
      sonar.setAttribute('cx', node.x);
      sonar.setAttribute('cy', node.y);
      sonar.setAttribute('r', '20');
      sonar.setAttribute('fill', 'none');
      sonar.setAttribute('stroke', '#C9A84C');
      sonar.setAttribute('stroke-width', '1');
      sonar.style.animation = 'sonarPing 3s ease-out infinite';
      svg.appendChild(sonar);
    }

    // Number text
    var num = document.createElementNS(ns, 'text');
    num.setAttribute('class', 'node-num');
    num.setAttribute('x', node.x);
    num.setAttribute('y', node.y + 4);
    num.setAttribute('font-family', 'DM Mono, monospace');
    num.setAttribute('font-size', '10');
    num.setAttribute('fill', '#555555');
    num.setAttribute('text-anchor', 'middle');
    num.textContent = node.id;

    // Year text
    var year = document.createElementNS(ns, 'text');
    year.setAttribute('class', 'node-year');
    year.setAttribute('x', node.x);
    year.setAttribute('y', node.y + 36);
    year.setAttribute('font-family', 'DM Mono, monospace');
    year.setAttribute('font-size', '9');
    year.setAttribute('fill', '#444444');
    year.setAttribute('text-anchor', 'middle');
    year.textContent = node.year;

    // Title text
    var title = document.createElementNS(ns, 'text');
    title.setAttribute('class', 'node-title');
    title.setAttribute('x', node.x);
    title.setAttribute('y', node.y + 52);
    title.setAttribute('font-family', 'DM Mono, monospace');
    title.setAttribute('font-size', '11');
    title.setAttribute('fill', '#F0F0F0');
    title.setAttribute('font-weight', '500');
    title.setAttribute('text-anchor', 'middle');
    title.textContent = node.title;

    g.appendChild(hit);
    g.appendChild(circle);
    g.appendChild(num);
    g.appendChild(year);
    g.appendChild(title);
    svg.appendChild(g);

    // Hover/focus interactions
    function showTooltip(e) {
      if (!tooltip) return;
      tooltip.hidden = false;
      tooltip.innerHTML = '<strong style="color:var(--gold);font-size:10px;letter-spacing:0.15em;">' +
        node.id + ' — ' + node.title + '</strong><br>' +
        '<span style="font-size:10px;color:var(--muted);">' + node.year + '</span><br><br>' +
        '<span style="color:var(--text);font-size:12px;line-height:1.6;">' + node.desc + '</span>';

      // Position tooltip
      var svgRect = svg.getBoundingClientRect();
      var scaleX = svgRect.width / 1000;
      var scaleY = svgRect.height / 400;
      var tooltipX = svgRect.left + node.x * scaleX;
      var tooltipY = svgRect.top + node.y * scaleY - 20;

      tooltip.style.left = tooltipX + 'px';
      tooltip.style.top = (tooltipY - tooltip.offsetHeight) + 'px';
      tooltip.classList.add('visible');

      // Highlight circle
      circle.setAttribute('fill', '#161616');
      circle.setAttribute('stroke', '#0055FF');
      circle.setAttribute('stroke-width', '2');
      g.style.transform = 'scale(1.2)';
      g.style.transformOrigin = node.x + 'px ' + node.y + 'px';
    }

    function hideTooltip() {
      if (!tooltip) return;
      tooltip.classList.remove('visible');
      setTimeout(function() {
        if (!tooltip.classList.contains('visible')) tooltip.hidden = true;
      }, 200);

      circle.setAttribute('fill', '#111111');
      circle.setAttribute('stroke', idx === nodes.length - 1 ? '#C9A84C' : '#333333');
      circle.setAttribute('stroke-width', idx === nodes.length - 1 ? '2' : '1.5');
      g.style.transform = '';
    }

    g.addEventListener('mouseenter', showTooltip);
    g.addEventListener('mouseleave', hideTooltip);
    g.addEventListener('focus', showTooltip);
    g.addEventListener('blur', hideTooltip);
  });

  // Animate paths with ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
    var loaderReady = window.__loaderComplete || Promise.resolve();
    loaderReady.then(function() {
      paths.forEach(function(p, i) {
        var mainLen = p.main.getTotalLength();
        p.main.style.strokeDasharray = mainLen;
        p.main.style.strokeDashoffset = mainLen;

        var fuseLen = p.fuse.getTotalLength();
        p.fuse.style.strokeDasharray = '40 ' + fuseLen;
        p.fuse.style.strokeDashoffset = fuseLen;

        gsap.to(p.main, {
          scrollTrigger: {
            trigger: '#journey',
            start: 'top 70%'
          },
          strokeDashoffset: 0,
          duration: 0.8,
          delay: i * 0.2,
          ease: 'power2.out'
        });

        gsap.to(p.fuse, {
          scrollTrigger: {
            trigger: '#journey',
            start: 'top 70%'
          },
          strokeDashoffset: -fuseLen,
          duration: 0.8,
          delay: i * 0.2,
          ease: 'power2.out',
          onComplete: function() {
            p.fuse.style.opacity = '0';
          }
        });
      });

      // Stagger node appearance
      var nodeGroups = svg.querySelectorAll('.node-group');
      gsap.from(nodeGroups, {
        scrollTrigger: {
          trigger: '#journey',
          start: 'top 70%'
        },
        opacity: 0,
        scale: 0.5,
        stagger: 0.1,
        duration: 0.4,
        ease: 'back.out(1.7)',
        transformOrigin: 'center center'
      });
    });
  }
})();
