(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const body = document.body;
  const video = $('#background-video');
  const canvas = $('#atmosphere');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection?.saveData);
  let paused = reduced.matches || saveData;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  let width = innerWidth;
  let height = innerHeight;
  let pointer = { x: width / 2, y: height / 2, active: false };
  let particles = [];
  const homes = [[.13,.2],[.34,.15],[.58,.24],[.81,.18],[.88,.42],[.73,.63],[.52,.54],[.31,.69],[.12,.48],[.5,.78]];
  const butterflies = homes.map(([homeX, homeY], i) => ({
    x: width * homeX, y: height * homeY, homeX, homeY, angle: 0,
    phase: i * Math.PI * .2, speed: .72 + (i % 4) * .11,
    scale: .65 + (i % 4) * .11, orbitX: .065 + (i % 3) * .015,
    orbitY: .055 + (i % 4) * .012, flap: 7.1 + (i % 5) * .85,
    alpha: .58 + (i % 4) * .1
  }));
  const running = () => !paused && !document.hidden && !document.querySelector('dialog[open]');

  function seed() {
    particles = Array.from({ length: innerWidth < 700 ? 35 : 75 }, (_, i) => ({
      x: Math.random() * width, y: Math.random() * height, type: i % 4,
      size: i % 4 < 2 ? 2 + Math.random() * 5 : .6 + Math.random() * 1.6,
      speed: 7 + Math.random() * 18, phase: Math.random() * Math.PI * 2,
      alpha: .18 + Math.random() * .45
    }));
  }

  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function drawButterfly(b, dt) {
    let targetX = width * (b.homeX + b.orbitX * Math.sin(elapsed * .4 * b.speed + b.phase));
    let targetY = height * (b.homeY + b.orbitY * Math.sin(elapsed * .53 * b.speed + 1.4 + b.phase));
    if (pointer.active) {
      const px = targetX - pointer.x, py = targetY - pointer.y;
      const distance = Math.hypot(px, py);
      if (distance < 135) { targetX += px / Math.max(1, distance) * (135 - distance); targetY += py / Math.max(1, distance) * (135 - distance); }
    }
    targetX = Math.min(width - 32, Math.max(32, targetX));
    targetY = Math.min(height - 36, Math.max(36, targetY));
    const dx = targetX - b.x, dy = targetY - b.y;
    b.x += dx * Math.min(1, dt * (1.05 + b.speed * .3));
    b.y += dy * Math.min(1, dt * (1.05 + b.speed * .3));
    b.angle += (Math.atan2(dy, dx) * .16 - b.angle) * Math.min(1, dt * 3);
    const wing = .25 + Math.abs(Math.sin(elapsed * b.flap + b.phase)) * .75;
    const scale = b.scale * (innerWidth < 700 ? .72 : 1);
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.angle); ctx.scale(scale, scale);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = b.alpha;
    ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 12 + b.scale * 7;
    ctx.fillStyle = 'rgba(125,211,252,.86)';
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(side * 2, -1);
      ctx.bezierCurveTo(side * 10 * wing, -20, side * 28 * wing, -20, side * 22 * wing, 2);
      ctx.bezierCurveTo(side * 18 * wing, 13, side * 7, 9, side * 2, 3); ctx.fill();
    }
    ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.ellipse(0, 2, 2.2, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(186,230,253,.85)'; ctx.lineWidth = .8; ctx.beginPath();
    ctx.moveTo(-1, -6); ctx.quadraticCurveTo(-7, -11, -8, -15); ctx.moveTo(1, -6); ctx.quadraticCurveTo(7, -11, 8, -15); ctx.stroke(); ctx.restore();
  }

  function animate(now) {
    if (!running()) { frame = 0; return; }
    const dt = Math.min((now - last) / 1000 || .016, .05); last = now; elapsed += dt;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const star = p.type === 3;
      if (!star) { p.y += p.speed * dt * (p.type === 2 ? -.35 : 1); p.x += (Math.sin(elapsed + p.phase) * 7 + 3) * dt; }
      if (p.y > height + 15) p.y = -15; if (p.y < -20) p.y = height + 15;
      ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = p.alpha * (star ? .3 + .7 * Math.abs(Math.sin(elapsed * .8 + p.phase)) : 1);
      if (p.type === 0) { ctx.rotate(elapsed * .2 + p.phase); ctx.fillStyle = '#0ea5e9'; ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2); }
      else if (p.type === 1) { ctx.rotate(elapsed + p.phase); ctx.fillStyle = '#dff6ff'; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * .45, .6, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.fillStyle = star ? '#e0f2fe' : '#67e8f9'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    for (const butterfly of butterflies) drawButterfly(butterfly, dt);
    ctx.globalAlpha = 1; frame = requestAnimationFrame(animate);
  }

  async function syncMotion() {
    cancelAnimationFrame(frame); frame = 0;
    body.dataset.butterflyCount = String(butterflies.length);
    body.dataset.motion = running() ? 'running' : 'paused';
    $('#motion-toggle').textContent = reduced.matches ? 'Reduced motion' : paused ? 'Motion off' : 'Motion on';
    $('#motion-toggle').setAttribute('aria-pressed', String(paused));
    if (running()) {
      if (!video.src) { video.src = video.dataset.src; video.load(); }
      try { await video.play(); } catch { body.dataset.media = 'fallback'; }
      last = 0; frame = requestAnimationFrame(animate);
    } else { video.pause(); ctx.clearRect(0, 0, width, height); }
  }

  video.addEventListener('playing', () => body.classList.add('video-ready'));
  video.addEventListener('error', () => { body.classList.remove('video-ready'); body.dataset.media = 'fallback'; });
  $('#motion-toggle').addEventListener('click', () => { if (!reduced.matches) { paused = !paused; syncMotion(); } });
  reduced.addEventListener('change', () => { paused = reduced.matches || saveData; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', event => { pointer = { x: event.clientX, y: event.clientY, active: event.pointerType === 'mouse' }; }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.active = false; });

  const menu = $('.menu'), nav = $('#nav');
  menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  nav.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); });

  const dialog = $('#film-dialog'), player = $('#film-player');
  $$('[data-watch]').forEach(button => button.addEventListener('click', () => { player.src = 'assets/Aimate.mp4'; dialog.showModal(); syncMotion(); }));
  $('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); player.load(); syncMotion(); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
    $$('.reveal').forEach(element => observer.observe(element));
  } else $$('.reveal').forEach(element => element.classList.add('visible'));

  resize(); syncMotion();
})();
