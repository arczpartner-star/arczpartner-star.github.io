/* ARCZ — arcz.kr  ·  공통 스크립트
   사례·글·FAQ 내용은 data.js에서만 고칩니다. */

window.ARCZ_READY = true;   // 이 파일이 실행되지 않으면 2.5초 뒤 숨김 효과를 풀어 내용이 보이게 함(head 스크립트)

const ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- 사례 카드 ---------- */
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
        ${c.stats.map(s => `<div><div class="n">${esc(s.n)}</div><div class="l">${esc(s.l)}</div></div>`).join('')}
      </div>
      ${(() => { const inner = (opts && opts.short ? '' : `<p style="margin:0">${esc(c.body)}</p>`)
          + (c.note ? `<p class="note">※ ${esc(c.note)}</p>` : '')
          + (c.linkUrl ? `<a class="link" href="${esc(c.linkUrl)}"${/^https?:/.test(c.linkUrl) ? ' target="_blank" rel="noopener"' : ''}>${esc(c.linkText || '관련 글 보기')} ${ICON_ARROW}</a>` : '');
        return inner ? `<div class="case__body">${inner}</div>` : ''; })()}
    </article>`).join('');
  observeReveal(el);
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
      const fail = text => {
        btn.disabled = false; btn.innerHTML = label;
        msg.innerHTML = (text || '전송하지 못했습니다. 잠시 후 다시 시도해 주세요.') +
          ' 급하시면 <a href="tel:010-5727-0010" style="text-decoration:underline">010-5727-0010</a> 또는 카카오톡 채널로 연락 주세요.';
        msg.classList.add('show');
      };
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.innerHTML;
      if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) { fail('상담 접수 주소가 아직 연결되지 않았습니다.'); return; }
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
        const data = await r.json();
        if (!data.ok) { fail(data.message); return; }
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
        fail();
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
      <span class="tr"><i style="width:${Math.round(ratio(k) * 100)}%"></i></span><span class="v">${score[k]}/${max[k]}</span></div>`).join('');
    out.querySelector('.ck-advice-wrap').innerHTML = weak.map(k => document.getElementById('adv-' + k).innerHTML).join('');
    out.hidden = false;
    // 진단 신청 폼에 결과를 함께 보냄
    const form = document.querySelector('#ck-apply form.js-lead');
    if (form) form.dataset.prefix = `[셀프 점검] 총점 ${total}/${all} · A ${score.A}/${max.A} · R ${score.R}/${max.R} · C ${score.C}/${max.C} · Z ${score.Z}/${max.Z} · 먼저 볼 단계: ${weak.join('·')}`;
    const note = document.getElementById('ck-attached'); if (note) note.hidden = false;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
