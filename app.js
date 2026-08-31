const ARC_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function renderCases(containerId, list, opts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const items = opts && opts.limit ? list.slice(0, opts.limit) : list;
  if (!items.length) {
    el.innerHTML = '<div class="empty-note">아직 공개할 수 있는 사례가 없습니다. 곧 채워질 예정입니다.</div>';
    return;
  }
  el.innerHTML = items.map(c => `
    <div class="proof-card">
      <span class="proof-tag">${c.tag}</span>
      <h3>${c.title}</h3>
      <p>${c.body}</p>
      <div class="proof-stats">
        ${c.stats.map(s => `<div class="proof-stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join('')}
      </div>
      ${c.linkUrl ? `<a href="${c.linkUrl}" target="_blank" rel="noopener" class="link">${c.linkText} ${ARC_ICON}</a>` : ''}
    </div>
  `).join('');
}

function renderPosts(containerId, list, opts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const items = opts && opts.limit ? list.slice(0, opts.limit) : list;
  el.innerHTML = items.map(p => `
    <div class="content-card">
      <div class="content-card__meta">
        ${p.category ? `<span class="content-cat">${p.category}</span>` : ''}
        <span class="content-date">${p.date}</span>
      </div>
      <h4>${p.title}</h4>
      <a href="${p.url}" target="_blank" rel="noopener">블로그에서 읽기 ${ARC_ICON}</a>
    </div>
  `).join('');
}

function renderFaqs(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = list.map((f, i) => `
    <div class="faq-item">
      <div class="faq-q" onclick="this.parentElement.classList.toggle('open')">
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="txt">${f.q}</span>
        <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>
  `).join('');
}

// 모바일 햄버거 메뉴 드로어: 열기/닫기, 배경 클릭·ESC·링크 클릭 시 자동 닫힘
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const closeBtn = document.querySelector('.mobile-drawer__close');
  if (!btn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeDrawer(); });
});

// 현재 페이지에 맞는 상단 내비 항목을 강조 표시
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[data-nav]').forEach(a => {
    if (a.getAttribute('data-nav') === path) a.classList.add('active');
  });
});

// 히어로 배경 파티클 (은은한 빛 입자 효과) — 서브페이지(.page-hero)에서 가볍게 사용
function initParticles(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  const colors = ['45,212,232', '59,130,246'];
  let w, h, dpr, particles, frame = 0, visible = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticles() {
    // 서브페이지 히어로는 장식 요소라 개수를 가볍게 유지 (12~20개)
    const count = Math.max(12, Math.min(20, Math.round((w * h) / 48000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      c: colors[Math.random() < 0.5 ? 0 : 1],
      a: Math.random() * 0.5 + 0.25
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      grad.addColorStop(0, `rgba(${p.c},${p.a})`);
      grad.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${p.c},${Math.min(1, p.a + 0.25)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    frame = (visible && !document.hidden && !reduceMotion) ? requestAnimationFrame(step) : 0;
  }

  resize();
  makeParticles();
  frame = requestAnimationFrame(step);
  window.addEventListener('resize', () => { resize(); makeParticles(); });

  // 캔버스가 뷰포트 밖으로 완전히 벗어나면 렌더 루프를 멈추고, 돌아오면 재개 (GPU/배터리 절약)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      visible = entry ? entry.isIntersecting : true;
      if (visible && !frame && !reduceMotion) frame = requestAnimationFrame(step);
    });
    io.observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible && !frame && !reduceMotion) frame = requestAnimationFrame(step);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas.particle-canvas').forEach(initParticles);
});

// 스크롤 시 헤더에 배경/그림자 강조 (shopify.design 스타일의 스티키 헤더 반응)
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

// 스크롤 진행 바: 문서 전체 대비 현재 스크롤 위치를 상단 얇은 바로 표시
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
});

// 스크롤 리빌: 섹션 타이틀/카드가 뷰포트에 들어올 때 부드럽게 등장
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selector = [
    '.sec-tag', '.sec-title', '.sec-desc',
    '.timeline-item__text', '.timeline-item__visual', '.step-item', '.area-card', '.content-card', '.proof-card',
    '.guarantee-card', '.strong-item', '.faq-item', '.expert-card', '.expert-row', '.fit-card', '.hub-card',
    '.arch-card', '.tech-item', '.pricing-card',
    '.trust-block', '.marquee-band',
    '.hero-badge', '.hero-container--center .eng', '.hero-container--center h1', '.hero-container--center p',
    '.page-hero-inner > *'
  ].join(', ');
  const targets = Array.from(document.querySelectorAll(selector));
  if (!targets.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('reveal', 'in-view'));
    return;
  }

  // 같은 부모 안의 요소들은 순서대로 살짝 늦게 등장 (스태거 효과)
  const counters = new Map();
  targets.forEach(el => {
    el.classList.add('reveal');
    const parent = el.parentElement;
    const idx = counters.get(parent) || 0;
    counters.set(parent, idx + 1);
    el.style.transitionDelay = `${Math.min(idx * 70, 350)}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => io.observe(el));
});

// 숫자 카운트업: 포트폴리오 실적 수치(.proof-stat .n)가 뷰포트에 들어오면 0에서 목표값까지 증가
// 천단위 콤마(예: "1,234명"), 소수점(예: "3.2배"), 부호(+/-), 단위 접미사를 모두 안전하게 파싱한다.
function animateCountUp(el, duration) {
  duration = duration || 1200;
  const raw = el.textContent.trim();
  const match = raw.match(/^([+-]?)([\d,]+(\.\d+)?)(.*)$/);
  if (!match) return; // 숫자로 시작하지 않는 값(예: 텍스트뿐인 경우)은 그대로 둠
  const sign = match[1] || '';
  const numStr = match[2];
  const hasComma = numStr.indexOf(',') !== -1;
  const target = parseFloat(numStr.replace(/,/g, ''));
  if (!isFinite(target) || target === 0) return; // 파싱 실패나 0은 애니메이션할 필요가 없으므로 원문 유지
  const decimals = match[3] ? match[3].length - 1 : 0;
  const suffix = match[4] || '';
  const format = (value) => hasComma
    ? value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value.toFixed(decimals);
  const startedAt = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = sign + format(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = raw;
  }
  requestAnimationFrame(tick);
}

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(document.querySelectorAll('.proof-stat .n'));
  if (!targets.length || reduceMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  targets.forEach(el => io.observe(el));
});

// 진행 프로세스(STEP 1~5) 연결선: 섹션이 뷰포트에 들어오면 왼쪽에서 오른쪽으로 채워짐
document.addEventListener('DOMContentLoaded', () => {
  const tracks = Array.from(document.querySelectorAll('.step-track'));
  if (!tracks.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    tracks.forEach(t => t.style.setProperty('--track-progress', '1'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.setProperty('--track-progress', '1');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  tracks.forEach(t => io.observe(t));
});

// ARCZ 메소드 세로 타임라인: 스크롤 위치에 맞춰 중앙선이 실시간으로 채워지고, 각 단계는 화면 중앙 근처에 오면 노드/그래픽이 활성화됨
document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.timeline');
  const fill = document.querySelector('.timeline-track__fill');
  if (!timeline || !fill) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(timeline.querySelectorAll('.timeline-item'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    fill.style.height = '100%';
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  // 스크롤에 맞춰 중앙선을 실시간으로 채움 (rAF로 스로틀링)
  let ticking = false;
  function updateFill() {
    ticking = false;
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const startLine = vh * 0.82; // 타임라인 상단이 이 지점을 지나기 시작하면 채우기 시작
    const endLine = vh * 0.3;    // 타임라인 하단이 이 지점을 지나면 채우기 완료
    const total = rect.height + (startLine - endLine);
    const progressed = startLine - rect.top;
    const ratio = total > 0 ? Math.min(1, Math.max(0, progressed / total)) : 0;
    fill.style.height = (ratio * 100) + '%';
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateFill); }
  }
  updateFill();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // 각 단계가 화면 중앙 근처에 들어오면 노드 발광 + 그래픽 활성화
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.4, rootMargin: '0px 0px -20% 0px' });
  items.forEach(el => io.observe(el));
});

// 카드 스포트라이트: 커서 위치를 CSS 변수로 전달해 은은한 글로우가 커서를 따라가게 함
document.addEventListener('DOMContentLoaded', () => {
  const selector = '.proof-card, .guarantee-card, .strong-item, .area-card, .content-card:not(.content-card--more), .hub-card, .tech-item, .pricing-card';
  const cards = Array.from(document.querySelectorAll(selector));
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });
});

// ---------- 히어로 배경: Predictive Arc / Ribbon Field (WebGL 셰이더) ----------
const RIBBON_FIELD_VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
const RIBBON_FIELD_FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec2 pointer;
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float ribbon(vec2 uv, float offset, float width, float phase) {
    float y = 0.55 + 0.20 * sin((uv.x * 2.15) + phase) + 0.045 * sin((uv.x * 7.0) - phase * 0.7);
    float d = abs(uv.y - y - offset);
    return exp(-(d * d) / width);
  }
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = uv;
    p.x *= resolution.x / resolution.y;
    float t = time * 0.22;
    float drift = (pointer.x - 0.5) * 0.06;
    float rightFade = smoothstep(0.28, 0.72, uv.x);
    float centerDark = 1.0 - smoothstep(0.0, 0.88, distance(uv, vec2(0.18, 0.48)));
    float r1 = ribbon(vec2(uv.x + drift, uv.y), 0.03, 0.0065, t + 0.9);
    float r2 = ribbon(vec2(uv.x - drift * 0.7, uv.y), -0.23, 0.0085, t + 3.25);
    float r3 = ribbon(vec2(uv.x + drift * 0.4, uv.y), 0.25, 0.014, t + 1.85);
    float glow = r1 * 1.14 + r2 * 1.05 + r3 * 0.48;
    vec3 teal = vec3(0.17, 0.83, 0.75);
    vec3 cyan = vec3(0.22, 0.82, 0.96);
    vec3 indigo = vec3(0.39, 0.38, 0.92);
    vec3 purple = vec3(0.66, 0.33, 0.98);
    vec3 blue = vec3(0.23, 0.51, 0.96);
    vec3 col = vec3(0.0);
    col += cyan * r1 * 0.92;
    col += teal * r1 * 0.62;
    col += indigo * r3 * 0.42;
    col += blue * r2 * 0.66;
    col += purple * (r2 + r3) * 0.30;
    float bloom = exp(-pow(distance(uv, vec2(0.76, 0.40 + 0.035 * sin(t))), 2.0) / 0.050);
    bloom += exp(-pow(distance(uv, vec2(0.71, 0.75 + 0.025 * cos(t))), 2.0) / 0.030);
    col += vec3(0.42, 0.85, 1.0) * bloom * 0.34;
    vec2 grid = fract(gl_FragCoord.xy / 7.0) - 0.5;
    float dotShape = smoothstep(0.29, 0.11, length(grid));
    float noise = hash(floor(gl_FragCoord.xy / 7.0));
    float scan = 0.72 + 0.28 * sin((uv.x + uv.y) * 38.0 + time * 1.3);
    float dots = dotShape * (0.48 + 0.52 * noise) * scan;
    float micro = hash(gl_FragCoord.xy + time) * 0.035;
    float alpha = clamp((glow * 1.55 + bloom * 0.50) * dots * rightFade, 0.0, 1.0);
    alpha *= 1.0 - centerDark * 0.56;
    vec3 base = vec3(0.005, 0.005, 0.005);
    vec3 finalColor = mix(base, col, clamp(alpha * 1.55, 0.0, 1.0));
    finalColor += micro * rightFade;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function compileRibbonShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Ribbon field shader compile failed:', gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

// 원본은 @designcodeio/threeui의 React 컴포넌트(RibbonFieldBackground)이며,
// 이 사이트는 순수 HTML/JS라 동일한 WebGL 로직을 바닐라 JS로 이식했습니다.
function initRibbonField(canvas) {
  const host = canvas.parentElement;
  if (!host) return;
  // 모션 최소화 설정 시 셰이더를 아예 실행하지 않고, 히어로의 CSS 그라디언트 배경으로 대체됩니다.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return; // WebGL 미지원 환경: CSS 배경으로 자연스럽게 폴백

  const vertex = compileRibbonShader(gl, gl.VERTEX_SHADER, RIBBON_FIELD_VERTEX_SHADER);
  const fragment = compileRibbonShader(gl, gl.FRAGMENT_SHADER, RIBBON_FIELD_FRAGMENT_SHADER);
  if (!vertex || !fragment) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Ribbon field program link failed:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const resolutionLoc = gl.getUniformLocation(program, 'resolution');
  const timeLoc = gl.getUniformLocation(program, 'time');
  const pointerLoc = gl.getUniformLocation(program, 'pointer');

  // 기본 옵션값(speed, pointerAmount, smoothing)은 원본 컴포넌트의 기본 설정과 동일합니다.
  const speed = 1, pointerAmount = 1, smoothing = 0.035;
  let mouseX = 0.72, mouseY = 0.42, targetX = 0.72, targetY = 0.42;
  let frame = 0, visible = true;
  const startedAt = performance.now();

  function onPointerMove(e) {
    const bounds = host.getBoundingClientRect();
    targetX = 0.72 + (((e.clientX - bounds.left) / Math.max(bounds.width, 1)) - 0.72) * pointerAmount;
    targetY = 0.42 + ((1 - (e.clientY - bounds.top) / Math.max(bounds.height, 1)) - 0.42) * pointerAmount;
  }

  function resize() {
    const bounds = host.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
  }

  function render(now) {
    mouseX += (targetX - mouseX) * smoothing;
    mouseY += (targetY - mouseY) * smoothing;
    gl.uniform1f(timeLoc, (now - startedAt) * 0.001 * speed);
    gl.uniform2f(pointerLoc, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    frame = visible && !document.hidden ? requestAnimationFrame(render) : 0;
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry ? entry.isIntersecting : true;
    if (visible && !frame) frame = requestAnimationFrame(render);
  });
  resizeObserver.observe(host);
  intersection.observe(host);
  host.addEventListener('pointermove', onPointerMove, { passive: true });

  resize();
  frame = requestAnimationFrame(render);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas.ribbon-field-canvas').forEach(initRibbonField);
});

// STRONG POINT 마진 카드: 마우스 호버 시 게이지 바가 채워지며(CSS) 수치도 함께 카운트업(JS)
document.addEventListener('DOMContentLoaded', () => {
  const gauge = document.querySelector('.mini-gauge__row b');
  if (!gauge) return;
  const card = gauge.closest('.strong-item');
  if (!card) return;
  let done = false;
  card.addEventListener('pointerenter', () => {
    if (done) return;
    done = true;
    animateCountUp(gauge, 1100);
  });
});

// ---------- Formspree 문의 폼 비동기 제출 처리 ----------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action*="formspree.io"]');
  if (!form) return;

  function showFormSuccess() {
    form.innerHTML = `
      <div class="form-success" style="text-align:center; padding: 40px 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" style="margin-bottom:16px;"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>
        <h4 style="font-size:1.25rem; font-weight:700; margin-bottom:8px; color:#fff;">상담 신청이 접수되었습니다</h4>
        <p style="color:#94a3b8; font-size:0.95rem;">확인 후 남겨주신 연락처로 빠르게 안내드리겠습니다. 감사합니다.</p>
      </div>
    `;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '전송 중...';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showFormSuccess();
      } else {
        alert('전송 중 오류가 발생했습니다. 전화나 카카오톡으로 문의 부탁드립니다.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '상담 신청하기';
        }
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '상담 신청하기';
      }
    }
  });
});
