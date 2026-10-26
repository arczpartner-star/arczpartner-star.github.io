/* ARCZ — 처음으로 히어로 배경 그래픽 (곡선 · A·R·C·Z 노드 · 빛줄기 · 정점의 점)
   영상 대신 브라우저가 화면 해상도에 맞춰 직접 그립니다 → 레티나·4K에서도 선명, 용량은 이 파일 하나.
   · 움직이지 않는 층(배경 빛·점 격자·궤도선·곡선 면·가장자리)은 크기가 바뀔 때 한 번만 그리고,
     매 프레임에는 등고선·입자·빛줄기·노드·라벨·정점의 점만 그립니다.
   · 화면 밖이거나 탭이 숨겨지면 멈추고, '동작 줄이기' 설정이면 정지 화면 한 장만 그립니다.
   · 그림 좌표는 PC 1920×820 / 모바일 1080×710 기준이며, 상자 오른쪽 아래에 맞춰 채웁니다(넘치면 왼쪽부터 잘림). */
(function () {
  const box = document.querySelector('.hero--motion .hero-art');
  if (!box) return;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  box.appendChild(cv);
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const HALF = Math.PI / 2, TAU = Math.PI * 2, D = 10;
  const CFG = {
    W: { W: 1920, H: 820, arc: { cx: 1700, cy: 921, a: 600, b: 621 }, th0: .10, nodeTh: [.50, .88, 1.24, HALF], nodeR: 30, zR: 12, zDx: 58, zGap: 66,
         lab: { dx: 52, dy: [-4, -4, -4, -4], size: 25, kick: 12 }, orbits: [48, 104, 176], contours: 5, cgap: 62, dotR: 6.5, grid: 26, gridR: 1.1, parts: 46,
         blur: 6, tail: 4.6, ring: 1.6, zring: 3 },
    M: { W: 1080, H: 710, arc: { cx: 980, cy: 816, a: 690, b: 636 }, th0: .14, nodeTh: [.60, .95, 1.25, HALF], nodeR: 46, zR: 16, zDx: 50, zGap: 62,
         lab: { dx: 66, dy: [8, 8, 44, 8], size: 40, kick: 0 }, orbits: [60, 130], contours: 4, cgap: 70, dotR: 10, grid: 30, gridR: 1.5, parts: 30,
         blur: 9, tail: 6.5, ring: 2.4, zring: 4.5 }
  };
  const NODES = [['A', '01 · ANALYZE', '현장 분석'], ['R', '02 · RELEVANCE', '적합성 설계'], ['C', '03 · CONVERSION', '전환 퍼널'], ['Z', '04 · ZENITH', '정점']];
  const KO = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const EN = 'Montserrat, "Pretendard Variable", Pretendard, sans-serif';

  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), pr = (t, a, b) => cl((t - a) / (b - a));
  const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, eo = x => 1 - Math.pow(1 - x, 3);
  const pt = (P, th) => [P.cx - P.a * Math.cos(th), P.cy - P.b * Math.sin(th)];

  let C, fmt, S = 1, OX = 0, OY = 0, DPR = 1, back = null, edge = null, parts = [], running = false, inView = true, t0 = performance.now();

  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function arcPath(c, P, t0_, t1, n = 90) { for (let i = 0; i <= n; i++) { const [x, y] = pt(P, t0_ + (t1 - t0_) * i / n); i ? c.lineTo(x, y) : c.moveTo(x, y); } }
  function surface(c, P) { const top = pt(P, HALF); c.beginPath(); arcPath(c, P, 0, HALF); c.lineTo(C.W + 80, top[1]); c.lineTo(C.W + 80, C.H + 80); c.lineTo(P.cx - P.a, C.H + 80); c.closePath(); }
  function layer() { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d'); x.setTransform(DPR * S, 0, 0, DPR * S, DPR * OX, DPR * OY); return [c, x]; }

  // ---------------------------------------------------------------- 움직이지 않는 층
  function buildStatic() {
    const P = C.arc, top = pt(P, HALF);
    let x;
    [back, x] = layer();
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#1E1245'; x.fillRect(0, 0, cv.width, cv.height); x.restore();
    // 정점 주변 보랏빛
    let g = x.createRadialGradient(P.cx, P.cy - P.b, 0, P.cx, P.cy - P.b, C.W * .42);
    g.addColorStop(0, 'rgba(139,108,255,.55)'); g.addColorStop(.45, 'rgba(108,71,255,.16)'); g.addColorStop(1, 'rgba(108,71,255,0)');
    x.fillStyle = g; x.fillRect(-OX / S, -OY / S, cv.width / DPR / S + 10, cv.height / DPR / S + 10);
    // 점 격자(곡선 주변만 보이게)
    const mx = P.cx - P.a * .35, my = P.cy - P.b * .8, rx = C.W * .38, ry = C.H * .75;
    x.fillStyle = '#8B6CFF';
    for (let gx = 2; gx < C.W; gx += C.grid) for (let gy = 2; gy < C.H; gy += C.grid) {
      const d = Math.hypot((gx - mx) / rx, (gy - my) / ry); if (d >= 1) continue;
      x.globalAlpha = .275 * (1 - d); x.beginPath(); x.arc(gx, gy, C.gridR, 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
    // 바깥 궤도선(1번째는 매 프레임 점선으로)
    C.orbits.forEach((gp, i) => { if (i === 1) return; const Q = { cx: P.cx, cy: P.cy, a: P.a + gp, b: P.b + gp };
      x.beginPath(); arcPath(x, Q, 0, HALF); x.lineTo(C.W + 80, Q.cy - Q.b); x.strokeStyle = 'rgba(139,108,255,' + [.42, .26, .14][i] + ')'; x.lineWidth = i ? 1 : 1.4; x.stroke(); });
    // 곡선 면 — 그라데이션 + 안쪽 빛
    surface(x, P);
    g = x.createLinearGradient(P.cx - P.a, top[1], C.W + 80, C.H + 80);
    g.addColorStop(0, '#8B6CFF'); g.addColorStop(.38, '#6C47FF'); g.addColorStop(1, '#4B2BD9');
    x.fillStyle = g; x.fill();
    x.save(); surface(x, P); x.clip();
    x.translate(P.cx - P.a * .25, P.cy - P.b * .75); x.scale(P.a * .9, P.b * .7);
    g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(243,240,255,.22)'); g.addColorStop(1, 'rgba(243,240,255,0)');
    x.fillStyle = g; x.fillRect(-2, -2, 4, 4); x.restore();

    // 빛나는 가장자리
    [edge, x] = layer();
    const ep = () => { x.beginPath(); arcPath(x, P, .02, HALF); x.lineTo(C.W + 80, top[1]); };
    if ('filter' in CanvasRenderingContext2D.prototype) {
      x.save(); x.filter = 'blur(' + (C.blur * S * DPR) + 'px)'; ep(); x.strokeStyle = 'rgba(201,189,255,.35)'; x.lineWidth = C.blur; x.stroke(); x.restore();
    } else { ep(); x.strokeStyle = 'rgba(201,189,255,.12)'; x.lineWidth = C.blur * 2.4; x.stroke(); }   // 사파리 구버전: 흐림 대신 넓은 옅은 선
    ep(); x.strokeStyle = 'rgba(243,240,255,.85)'; x.lineWidth = C.ring; x.stroke();

    const r = rng(7);
    parts = [...Array(C.parts)].map(() => ({ u: r(), v: r(), r: .8 + r() * 1.8, ph: r() * TAU, n: 1 + Math.floor(r() * 2), amp: 4 + r() * 10 }));
  }

  function halo(x, cx, cy, rad, a) {
    if (a <= 0) return;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, 'rgba(243,240,255,' + (.9 * a) + ')'); g.addColorStop(.35, 'rgba(201,189,255,' + (.35 * a) + ')'); g.addColorStop(1, 'rgba(139,108,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.fill();
  }

  // ---------------------------------------------------------------- 매 프레임
  function draw(t) {
    const x = ctx, P = C.arc, top = pt(P, HALF), Z = [top[0] + C.zDx, top[1] - C.zGap], ph = TAU * t / D;
    x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(back, 0, 0);
    x.setTransform(DPR * S, 0, 0, DPR * S, DPR * OX, DPR * OY);
    // 흐르는 점선 궤도
    const o1 = C.orbits[1], Q1 = { cx: P.cx, cy: P.cy, a: P.a + o1, b: P.b + o1 };
    x.save(); x.setLineDash([2, 10]); x.lineDashOffset = -t * 12 * (fmt === 'W' ? 1 : 1.4);
    x.beginPath(); arcPath(x, Q1, 0, HALF); x.lineTo(C.W + 80, Q1.cy - Q1.b); x.strokeStyle = 'rgba(139,108,255,.26)'; x.lineWidth = 1; x.stroke(); x.restore();
    // 숨 쉬는 등고선
    x.save(); surface(x, P); x.clip();
    for (let k = 1; k <= C.contours; k++) {
      const g = k * C.cgap + 10 * Math.sin(ph + k * .7), Q = { cx: P.cx, cy: P.cy, a: P.a - g, b: P.b - g }; if (Q.a < 40) continue;
      x.beginPath(); arcPath(x, Q, 0, HALF, 60); x.lineTo(C.W + 80, Q.cy - Q.b); x.strokeStyle = 'rgba(243,240,255,' + (.16 - .022 * k).toFixed(3) + ')'; x.lineWidth = 1; x.stroke();
    }
    x.restore();
    x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(edge, 0, 0);
    x.setTransform(DPR * S, 0, 0, DPR * S, DPR * OX, DPR * OY);
    // 반짝이는 입자
    x.fillStyle = '#F3F0FF';
    parts.forEach(q => {
      const a = q.n * ph + q.ph, px = C.W * (.48 + .52 * q.u) + q.amp * Math.sin(a), py = C.H * q.v + q.amp * .6 * Math.cos(a);
      x.globalAlpha = .15 + .55 * Math.pow((Math.sin(q.n * ph + q.ph * 2) + 1) / 2, 2); x.beginPath(); x.arc(px, py, q.r, 0, TAU); x.fill();
    });
    x.globalAlpha = 1;
    // 빛줄기 — 2.5초 간격으로 4.2초 동안 곡선을 타고 올라 정점의 점으로 합쳐짐
    const RISE = 4.2, HOP = .55, GAP = 2.5, TE = HALF, dts = [], ripple = []; let pulse = 0;
    for (let k = 0; k < 4; k++) {
      const tau = ((t - k * GAP) % D + D) % D;
      const q = pr(tau, RISE + HOP - .05, RISE + HOP + .7); if (q > 0 && q < 1) { pulse = Math.max(pulse, Math.sin(Math.PI * q)); ripple.push(q); }
      if (tau >= RISE + HOP) continue;
      const u = eio(pr(tau, 0, RISE)), th = C.th0 + (TE - C.th0) * u; if (tau < RISE) dts.push(th);
      const tl = .34 * eo(pr(tau, 0, 1.2)), thT = tau < RISE ? Math.max(C.th0, th - tl) : TE - tl * (1 - eo(pr(tau, RISE, RISE + .45))), thH = tau < RISE ? th : TE;
      const fade = tau < RISE ? eo(pr(tau, 0, .4)) : 1 - pr(tau, RISE, RISE + HOP);
      if (thH - thT > .003) {
        x.lineCap = 'round'; x.strokeStyle = '#fff';
        for (let i = 0, n = 22; i < n; i++) {
          const a0 = thT + (thH - thT) * i / n, a1 = thT + (thH - thT) * (i + 1) / n, w = (i + 1) / n, [x0, y0] = pt(P, a0), [x1, y1] = pt(P, a1);
          x.globalAlpha = fade * .9 * w * w; x.lineWidth = C.tail * w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
        }
        x.globalAlpha = 1;
      }
      let px, py, r = C.dotR * eo(pr(tau, 0, .45));
      if (tau < RISE) [px, py] = pt(P, th); else { const h = eo(pr(tau, RISE, RISE + HOP)); px = top[0] + (Z[0] - top[0]) * h; py = top[1] + (Z[1] - top[1]) * h; r = C.dotR * (1 - .4 * h); }
      halo(x, px, py, r * 7, .95 * fade); x.globalAlpha = fade; x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); x.globalAlpha = 1;
    }
    // A·R·C·Z 노드 + 라벨
    C.nodeTh.forEach((th, i) => {
      const [nx, ny] = pt(P, th); let k = 0; dts.forEach(d => { k = Math.max(k, 1 - Math.abs(d - th) / .09); }); k = eo(cl(k));
      const z = i === 3, R = C.nodeR, [L, kick, ko] = NODES[i];
      halo(x, nx, ny, R * 2.3, .18 + .5 * k);
      if (k > .02) { x.beginPath(); x.arc(nx, ny, R * (1.05 + .75 * (1 - k)), 0, TAU); x.strokeStyle = 'rgba(243,240,255,' + (.6 * k) + ')'; x.lineWidth = 1.5; x.stroke(); }
      x.save(); x.shadowColor = 'rgba(20,9,47,.55)'; x.shadowBlur = (fmt === 'W' ? 20 : 28) * S * DPR; x.shadowOffsetY = (fmt === 'W' ? 8 : 12) * S * DPR;
      x.beginPath(); x.arc(nx, ny, R, 0, TAU); x.fillStyle = z ? '#1E1245' : '#24165A'; x.fill(); x.restore();
      x.beginPath(); x.arc(nx, ny, R, 0, TAU); x.strokeStyle = z ? '#8B6CFF' : '#E4DEFF'; x.lineWidth = z ? C.zring : C.ring; x.stroke();
      if (!z) { x.beginPath(); x.arc(nx, ny, R * .78, 0, TAU); x.strokeStyle = 'rgba(139,108,255,.55)'; x.lineWidth = 1; x.stroke(); }
      if (k > .02 && !z) { x.globalAlpha = .75 * k; x.fillStyle = '#6C47FF'; x.beginPath(); x.arc(nx, ny, R, 0, TAU); x.fill(); x.globalAlpha = 1; }
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 ' + (R * .8) + 'px ' + EN; x.fillText(L, nx, ny + 1);
      const left = fmt === 'M' && z, lx = left ? nx - R - 18 : (z ? Z[0] - C.zDx + R + C.lab.dx * .55 : nx + R + C.lab.dx * .45), ly = left ? ny - R * .9 : ny + R * .35 + C.lab.dy[i];
      x.textAlign = left ? 'right' : 'left'; x.textBaseline = 'alphabetic';
      x.font = '700 ' + C.lab.size + 'px ' + KO; x.fillText(ko, lx, ly);
      if (C.lab.kick) {
        x.globalAlpha = .55 + .45 * k; x.font = '600 ' + C.lab.kick + 'px ' + EN; x.fillStyle = '#F3F0FF';
        if ('letterSpacing' in x) x.letterSpacing = (C.lab.kick * .24) + 'px';
        x.fillText(kick, lx + 1, ly + C.lab.kick * 2.1);
        if ('letterSpacing' in x) x.letterSpacing = '0px';
        x.globalAlpha = 1;
      }
    });
    // 정점의 점 — 빛이 닿으면 숨 쉬고 물결이 퍼짐
    ripple.forEach(q => { x.beginPath(); x.arc(Z[0], Z[1], C.zR * (1.2 + 4.5 * eo(q)), 0, TAU); x.strokeStyle = 'rgba(243,240,255,' + (.7 * (1 - q)) + ')'; x.lineWidth = 1.5; x.stroke(); });
    halo(x, Z[0], Z[1], C.zR * 6, .45 + .35 * pulse);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(Z[0], Z[1], C.zR * (1 + .2 * pulse), 0, TAU); x.fill();
  }

  // ---------------------------------------------------------------- 크기·재생
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  function resize() {
    const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return false;
    fmt = matchMedia('(max-width: 899px)').matches ? 'M' : 'W'; C = CFG[fmt];
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    S = h / C.H; OX = w - C.W * S; OY = 0;   // 높이에 맞춤 — 좁으면 왼쪽 빈 곳부터 잘리고, 아주 넓은 화면(울트라와이드)에서도 위가 잘리거나 너무 커지지 않음
    buildStatic(); return true;
  }
  let last = 0;
  function frame(now) {
    if (!running) return;
    if (now - last >= 32) { last = now; draw(((now - t0) / 1000 + 1.2) % D); }   // 초당 약 30장 — 느린 움직임이라 충분하고 전력을 아낌
    requestAnimationFrame(frame);
  }
  function update() {
    const should = inView && !document.hidden && !calm.matches;
    if (should && !running) { running = true; requestAnimationFrame(frame); }
    if (!should) { running = false; draw(1.2); }
  }
  function start() {
    if (!resize()) return;
    draw(1.2); box.classList.add('live'); update();
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (resize()) draw(running ? ((performance.now() - t0) / 1000 + 1.2) % D : 1.2); }, 120); });
  document.addEventListener('visibilitychange', update);
  if (calm.addEventListener) calm.addEventListener('change', update);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; update(); }).observe(box);
  start();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!running) draw(1.2); });
})();
