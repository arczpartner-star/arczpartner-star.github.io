/* ARCZ — arcz.kr  ·  공통 스크립트
   사례·글·FAQ 내용은 data.js에서만 고칩니다. */

window.ARCZ_READY = true;   // 이 파일이 실행되지 않으면 2.5초 뒤 숨김 효과를 풀어 내용이 보이게 함(head 스크립트)

const ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- 사례 카드 ---------- */
// 기간·조건(note)이 적힌 확인된 사례만 숫자가 올라가는 효과를 줍니다(예: '314건' → 0에서 314까지)
const countHTML = v => { const m = String(v).match(/^([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/); return m ? `<span class="cu" data-to="${m[1].replace(/,/g, '')}">${esc(m[1])}</span>${esc(m[2])}` : esc(v); };
function renderCases(id, list, opts) {
  const el = document.getElementById(id);
  if (!el) return;
  const items = (opts && opts.limit) ? list.slice(0, opts.limit) : list;
  if (!items.length) {
    el.innerHTML = '<p class="muted">공개할 수 있는 사례를 정리하고 있습니다.</p>';
    return;
  }
  el.innerHTML = items.map(c => `
    <article class="case reveal">
      <div class="case__top"><span class="tag">${esc(c.tag)}</span><h3>${esc(c.title)}</h3></div>
      <div class="case__stats">
        ${c.stats.map(s => `<div><div class="n">${c.note ? countHTML(s.n) : esc(s.n)}</div><div class="l">${esc(s.l)}</div></div>`).join('')}
      </div>
      ${(() => { const inner = (opts && opts.short ? '' : `<p style="margin:0">${esc(c.body)}</p>`)
          + (c.note ? `<p class="note">※ ${esc(c.note)}</p>` : '')
          + (c.linkUrl ? `<a class="link" href="${esc(c.linkUrl)}"${/^https?:/.test(c.linkUrl) ? ' target="_blank" rel="noopener"' : ''}>${esc(c.linkText || '관련 글 보기')} ${ICON_ARROW}</a>` : '');
        return inner ? `<div class="case__body">${inner}</div>` : ''; })()}
    </article>`).join('');
  observeReveal(el);
  if (window.ARCZ_MOTION) ARCZ_MOTION.counters(el);
}

/* ---------- 블로그 글 카드 ---------- */
function renderPosts(id, list, opts) {
  const el = document.getElementById(id);
  if (!el) return;
  const items = (opts && opts.limit) ? list.slice(0, opts.limit) : list;
  el.innerHTML = items.map(p => `
    <a class="card post reveal" href="${esc(p.url)}" target="_blank" rel="noopener">
      <div class="meta">${p.category ? `<span class="cat">${esc(p.category)}</span>` : ''}<span>${esc(p.date)}</span></div>
      <h4>${esc(p.title)}</h4>
      <span class="link">블로그에서 읽기 ${ICON_ARROW}</span>
    </a>`).join('') + (opts && opts.more ? `
    <a class="card post more reveal" href="https://blog.naver.com/arcz_partner" target="_blank" rel="noopener">
      <div class="meta"><span class="en" style="color:#A99BE6;letter-spacing:.16em;font-weight:700">MORE</span></div>
      <h4>블로그에서 더 많은 글 보기</h4>
      <span class="link">네이버 블로그 아크즈 ${ICON_ARROW}</span>
    </a>` : '');
  observeReveal(el);
}

/* ---------- FAQ ---------- */
function renderFaqs(id, list) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = list.map((f, i) => `
    <div class="faq-item">
      <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-${id}-${i}">
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="txt">${esc(f.q)}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq-a" id="faq-${id}-${i}" role="region"><div><p>${esc(f.a)}</p></div></div>
    </div>`).join('');
  el.querySelectorAll('.faq-q').forEach(b => b.addEventListener('click', () => {
    const item = b.parentElement, open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    b.setAttribute('aria-expanded', String(open));
  }));
}

/* ---------- 모바일 메뉴 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.menu-btn');
  const drawer = document.querySelector('.drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  if (!btn || !drawer) return;
  const close = () => {
    drawer.classList.remove('open'); backdrop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false'); drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const open = () => {
    drawer.classList.add('open'); backdrop.classList.add('open');
    btn.setAttribute('aria-expanded', 'true'); drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = drawer.querySelector('a, button'); if (first) first.focus();
  };
  btn.addEventListener('click', open);
  backdrop.addEventListener('click', close);
  drawer.querySelector('.drawer__close').addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
});

/* ---------- 스크롤 진행 막대 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', update, { passive: true }); update();
});

/* ---------- 나타나기 ---------- */
let revealIO = null;
function observeReveal(root) {
  const els = (root || document).querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  if (!revealIO) revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => revealIO.observe(e));
}
document.addEventListener('DOMContentLoaded', () => observeReveal());

/* ---------- 상담 폼 → 구글 스프레드시트(Apps Script) ---------- */
// 보낼 주소는 config.js의 ARCZ_CONFIG.leadEndpoint 하나만 고치면 됩니다.
function leadContext() {
  const q = new URLSearchParams(location.search);
  const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map(k => q.get(k) ? `${k.slice(4)}=${q.get(k)}` : '').filter(Boolean).join(' · ');
  let ref = '';
  try { ref = sessionStorage.getItem('arcz_ref') || ''; } catch (e) {}
  return { page: location.pathname.replace(/^.*\//, '/') || '/', referrer: ref || document.referrer || '직접 방문', utm };
}
// 처음 들어온 경로·UTM을 탭이 닫힐 때까지 기억 (다른 페이지로 옮겨 신청해도 유지)
try {
  if (!sessionStorage.getItem('arcz_ref')) sessionStorage.setItem('arcz_ref', document.referrer || '직접 방문');
  const q = new URLSearchParams(location.search);
  if (q.get('utm_source') && !sessionStorage.getItem('arcz_utm')) sessionStorage.setItem('arcz_utm', location.search);
} catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form.js-lead').forEach(form => {
    const more = form.querySelector('.more-toggle');
    if (more) more.addEventListener('click', () => {
      const box = form.querySelector('#' + more.getAttribute('aria-controls'));
      const show = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(show)); box.hidden = !show;
      if (show) { const t = box.querySelector('textarea'); if (t) t.focus(); }
    });
    const phone = form.querySelector('input[name="phone"]');
    if (phone) phone.addEventListener('input', () => {
      const d = phone.value.replace(/\D/g, '').slice(0, 11);
      phone.value = d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
    });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg');
      msg.classList.remove('show');
      let ok = true;
      form.querySelectorAll('[data-required]').forEach(inp => {
        const f = inp.closest('.field');
        const bad = inp.name === 'phone' ? inp.value.replace(/\D/g, '').length < 9 : !inp.value.trim();
        if (f) f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      const agree = form.querySelector('input[name="privacy_agree"]');
      if (agree && !agree.checked) { ok = false; msg.textContent = '개인정보 수집·이용에 동의해 주셔야 접수할 수 있습니다.'; msg.classList.add('show'); }
      const picked = [...form.querySelectorAll('input[data-res]:checked')].map(i => i.value);
      if (form.dataset.kind === 'resource' && !picked.length) { ok = false; msg.textContent = '받으실 자료를 하나 이상 골라 주세요.'; msg.classList.add('show'); }
      if (!ok) { const first = form.querySelector('.invalid input, .invalid select'); if (first) first.focus(); return; }

      const endpoint = (window.ARCZ_CONFIG && window.ARCZ_CONFIG.leadEndpoint) || '';
      const debug = /[?&]debug\b/.test(location.search);   // 주소 끝에 ?debug 를 붙이면 원인을 화면에 보여 줌
      const fail = (text, detail) => {
        if (detail) console.error('[ARCZ 상담 폼]', detail);
        btn.disabled = false; btn.innerHTML = label;
        msg.innerHTML = (text || '전송하지 못했습니다. 잠시 후 다시 시도해 주세요.') + (debug && detail ? ` <code style="display:block;margin:6px 0;color:#5D5873">원인: ${esc(detail)}</code>` : '') +
          ' 급하시면 <a href="tel:010-5727-0010" style="text-decoration:underline">010-5727-0010</a> 또는 카카오톡 채널로 연락 주세요.';
        msg.classList.add('show');
      };
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.innerHTML;
      if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) { fail('상담 접수 주소가 아직 연결되지 않았습니다.', 'config.js leadEndpoint = "' + endpoint + '"'); return; }
      btn.disabled = true; btn.textContent = '보내는 중…';

      const body = new URLSearchParams(new FormData(form));
      // 자료실·셀프 점검: 고른 자료 / 점검 결과를 '남긴 내용' 앞에 붙여 시트 한 칸에서 보이게 함
      body.delete('res');
      const prefix = (form.dataset.kind === 'resource' ? `[자료 요청] ${picked.join(', ')}` : '') + (form.dataset.prefix || '');
      if (prefix) body.set('message', (prefix + '\n' + (body.get('message') || '')).trim());
      const ctx = leadContext();
      let utm = ctx.utm;
      try { if (!utm && sessionStorage.getItem('arcz_utm')) utm = new URLSearchParams(sessionStorage.getItem('arcz_utm')).toString(); } catch (e2) {}
      body.set('page', ctx.page); body.set('referrer', ctx.referrer); body.set('utm', utm || '');

      try {
        // text/plain·urlencoded 단순 요청 → 브라우저 사전 요청(CORS preflight) 없이 Apps Script로 전송
        const r = await fetch(endpoint, { method: 'POST', body, redirect: 'follow' });
        const raw = await r.text();
        let data;
        try { data = JSON.parse(raw); }
        catch (e3) { fail('', `HTTP ${r.status} · JSON이 아닌 응답(로그인 화면·오류 페이지일 가능성): ${raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)}`); return; }
        if (!data.ok) { fail(data.message, data.detail || data.code); return; }
        const tpl = form.dataset.done && document.getElementById(form.dataset.done);
        if (tpl) {
          form.innerHTML = tpl.innerHTML;
          form.querySelectorAll('[data-dl]').forEach(li => { if (!picked.includes(li.dataset.dl)) li.remove(); });
        } else {
          form.innerHTML = `<div class="form-done" role="status"><div class="dot"></div><h4>진단 신청이 접수되었습니다</h4>
          <p>남겨 주신 연락처로 대표가 직접 연락드립니다.<br>급하시면 카카오톡 채널로 남겨 주세요.</p></div>`;
        }
        if (window.gtag) window.gtag('event', 'generate_lead', { form: ctx.page });
        if (window.fbq) window.fbq('track', 'Lead');
      } catch (err) {
        fail('', `요청 실패(${err && err.message}) — 배포의 액세스 권한이 '모든 사용자'인지, 주소가 /exec로 끝나는지 확인`);
      }
    });
  });
});

/* ---------- 3분 셀프 점검 (checkup.html) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('checkup');
  if (!root) return;
  const qs = [...root.querySelectorAll('.ck-q')];
  const cnt = root.querySelector('.ck-bar .cnt b');
  const out = document.getElementById('ck-result');
  const STAGE = { A: '분석 (A)', R: '메시지 (R)', C: '전환 퍼널 (C)', Z: '정점 (Z)' };
  const answered = () => qs.filter(q => q.querySelector('input:checked')).length;
  root.addEventListener('change', e => {
    const q = e.target.closest('.ck-q'); if (q) q.classList.remove('miss');
    cnt.textContent = answered();
  });
  root.querySelector('.ck-go').addEventListener('click', () => {
    const miss = qs.filter(q => !q.querySelector('input:checked'));
    if (miss.length) {
      miss.forEach(q => q.classList.add('miss'));
      miss[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      const f = miss[0].querySelector('input'); if (f) f.focus({ preventScroll: true });
      return;
    }
    const score = { A: 0, R: 0, C: 0, Z: 0 }, max = { A: 0, R: 0, C: 0, Z: 0 };
    qs.forEach(q => { const s = q.dataset.stage; score[s] += +q.querySelector('input:checked').value; max[s] += 2; });
    const total = Object.values(score).reduce((a, b) => a + b, 0), all = Object.values(max).reduce((a, b) => a + b, 0);
    const ratio = k => score[k] / max[k];
    const low = Math.min(...Object.keys(score).map(ratio));
    const weak = Object.keys(score).filter(k => ratio(k) === low);
    const lvl = total >= all * .75 ? '기본기가 잘 갖춰져 있습니다. 이제 숫자를 키울 차례입니다.'
              : total >= all * .45 ? '흐름은 있지만, 새는 구간이 보입니다.'
              : '광고보다 먼저 정리할 것이 있습니다.';
    out.querySelector('.total').innerHTML = `${total}<small>/ ${all}점</small>`;
    out.querySelector('.lvl').textContent = lvl;
    out.querySelector('.ck-bars').innerHTML = Object.keys(score).map(k => `
      <div class="${weak.includes(k) ? 'weak' : ''}"><span>${STAGE[k]}${weak.includes(k) ? ' · 먼저' : ''}</span>
      <span class="tr"><i style="width:0" data-w="${Math.round(ratio(k) * 100)}%"></i></span><span class="v">${score[k]}/${max[k]}</span></div>`).join('');
    // 막대가 0에서 점수까지 차오르고, '먼저' 단계는 한 번 반짝임
    requestAnimationFrame(() => requestAnimationFrame(() => out.querySelectorAll('.ck-bars i').forEach((b, n) => { b.style.transitionDelay = (.15 + n * .12) + 's'; b.style.width = b.dataset.w; })));
    out.querySelector('.ck-advice-wrap').innerHTML = weak.map(k => document.getElementById('adv-' + k).innerHTML).join('');
    out.hidden = false;
    // 진단 신청 폼에 결과를 함께 보냄
    const form = document.querySelector('#ck-apply form.js-lead');
    if (form) form.dataset.prefix = `[셀프 점검] 총점 ${total}/${all} · A ${score.A}/${max.A} · R ${score.R}/${max.R} · C ${score.C}/${max.C} · Z ${score.Z}/${max.Z} · 먼저 볼 단계: ${weak.join('·')}`;
    const note = document.getElementById('ck-attached'); if (note) note.hidden = false;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});



/* ==========================================================================
   모션 (2026.10.26) — 모두 '동작 줄이기' 설정에서는 꺼지고 바로 최종 상태로 보입니다.
   ① 제목 단어 순서대로 등장 ② 선 그리기(진행 순서·타임라인·하위 페이지 곡선) ③ 숫자 카운트업
   ④ 카드 스포트라이트(PC) ⑤ 진단 신청 버튼 펄스 ⑥ ARCZ Method 스크롤 스토리텔링
   ========================================================================== */
window.ARCZ_MOTION = (() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (els, fn, opt) => {
    if (!els.length) return;
    if (calm || !('IntersectionObserver' in window)) { els.forEach(fn); return; }
    const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } }), opt || { threshold: .3 });
    els.forEach(e => o.observe(e));
  };

  // ① 제목: 단어가 아래에서 위로 마스킹되며 차례로 등장, 강조 단어 끝의 점은 마지막에 찍힘
  function split(h) {
    if (h.dataset.split) return; h.dataset.split = '1';
    let n = 0; const wrap = w => `<span class="sw"><span class="si" style="--d:${(n++ * .07).toFixed(2)}s">${w}</span></span>`;
    [...h.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const parts = node.textContent.split(/(\s+)/).map(p => /^\s+$/.test(p) || !p ? p : wrap(p)).join('');
        const span = document.createElement('span'); span.innerHTML = parts; node.replaceWith(...span.childNodes);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        const s = document.createElement('span'); s.className = 'sw sw-hl'; node.replaceWith(s);
        const i = document.createElement('span'); i.className = 'si'; i.style.setProperty('--d', (n++ * .07).toFixed(2) + 's'); i.appendChild(node); s.appendChild(i);
        node.style.setProperty('--dd', (n * .07 + .55).toFixed(2) + 's');
      }
    });
    h.classList.add('tsplit');
    requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add('tsplit-in')));
  }

  // ③ 숫자: 0에서 목표까지 easeOutExpo 1.8초 (소수 자릿수 유지)
  function counters(root) {
    const els = [...(root || document).querySelectorAll('.cu:not([data-done])')];
    els.forEach(e => e.dataset.done = '1');
    io(els, e => {
      const to = parseFloat(e.dataset.to), dec = (e.dataset.to.split('.')[1] || '').length;
      if (calm) { e.textContent = to.toFixed(dec); return; }
      const t0 = performance.now(), dur = 1800, fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('ko-KR');
      const step = now => { const k = Math.min(1, (now - t0) / dur), ease = k === 1 ? 1 : 1 - Math.pow(2, -10 * k); e.textContent = fmt(to * ease); if (k < 1) requestAnimationFrame(step); };
      e.textContent = fmt(0); requestAnimationFrame(step);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero h1.h-display, .page-hero h1.h-display').forEach(h => calm ? null : split(h));

    // ② 진행 순서 연결선: 화면에 들어오면 왼쪽부터 그려지고 번호가 차례로 켜짐
    io([...document.querySelectorAll('.js-draw')], e => e.classList.add('drawn'));
    // ② 타임라인: 스크롤 위치에 1:1로 세로선이 그려지고, 지나간 단계의 점이 채워짐
    const tls = [...document.querySelectorAll('.tl')];
    if (tls.length) {
      const upd = () => tls.forEach(tl => {
        const r = tl.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height));
        tl.style.setProperty('--p', calm ? 1 : p.toFixed(4));
        tl.querySelectorAll(':scope > div').forEach(d => d.classList.toggle('on', calm || d.getBoundingClientRect().top < innerHeight * .6));
      });
      addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    }

    counters();

    // ④ 카드 스포트라이트 — 마우스가 있는 기기에서만
    if (!calm && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const sel = '.card, .case, .pain, .explore a, .related a, .fit';
      document.querySelectorAll(sel).forEach(c => c.classList.add('spot'));
      document.addEventListener('pointermove', e => {
        const c = e.target.closest && e.target.closest('.spot'); if (!c) return;
        const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }

    // ⑥ ARCZ Method 스크롤 스토리텔링
    const sc = document.querySelector('.scrolly');
    if (sc) {
      const panel = sc.querySelector('.scrolly__panel'), steps = [...sc.querySelectorAll('.sc-step')], prog = sc.querySelector('.sc-arc .prog');
      const nodes = [...sc.querySelectorAll('.sc-arc .nd')], vis = [...sc.querySelectorAll('.sc-vis')];
      const setActive = i => {
        panel.dataset.active = i;
        nodes.forEach((n, k) => { n.classList.toggle('on', k === i); n.classList.toggle('past', k < i); });
        vis.forEach((v, k) => v.classList.toggle('on', k === i));
        steps.forEach((s, k) => s.classList.toggle('on', k === i));
      };
      setActive(0);
      const upd = () => {
        const r = sc.getBoundingClientRect(), mid = innerHeight * .5;
        let a = 0; steps.forEach((s, k) => { if (s.getBoundingClientRect().top < mid) a = k; });
        if (+panel.dataset.active !== a) setActive(a);
        const first = steps[0].getBoundingClientRect(), last = steps[steps.length - 1].getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (mid - first.top) / Math.max(1, last.top - first.top)));   // 선이 스크롤에 1:1로 그려짐
        if (prog) prog.style.strokeDashoffset = calm ? 0 : (1 - p * .985).toFixed(4);
      };
      addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    }
  });
  return { counters };
})();
