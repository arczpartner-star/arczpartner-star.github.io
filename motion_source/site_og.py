"""페이지별 공유 미리보기 이미지(Open Graph 1200×630) — 카카오톡·페이스북·인스타 DM 등에서 링크를 보낼 때 뜨는 이미지"""
import os, re, math
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT = '/home/claude/arcz/site/gen/assets/og'; os.makedirs(OUT, exist_ok=True)
F = 'file:///home/claude/arcz/fonts/'
LOGO = Path('/home/claude/arcz/final/ARCZ_Logo_Package/01_SVG/arcz_wordmark_reverse.svg').read_text()
# slug: (KICK, 제목 2줄 — [강조]는 바이올렛+정점의 점, 아랫줄 설명)
PAGES = {
 'home': ('LOCAL BUSINESS GROWTH PARTNER', '노출이 아니라|문의와 마진을 [남깁니다]', '음식점·카페·홈서비스 광고를 대표가 직접 설계하고 운영합니다'),
 'about': ('ABOUT ARCZ', '성장 곡선을 그리는|아크즈[입니다]', 'A to Z · Arc · Zenith — 이름에 담은 일하는 방식'),
 'method': ('ARCZ METHOD', 'A부터 정점까지,|성장을 그리는 [4단계]', '현장 분석 · 적합성 설계 · 전환 퍼널 · 정점'),
 'services': ('SERVICES', '문의로 이어지는 일만|[합니다]', 'SNS·메타 광고 · 검색광고 · 플레이스 · 콘텐츠 · 문의 퍼널'),
 'solutions': ('SOLUTIONS', '업종이 다르면|손님이 멈추는 [이유]도 다릅니다', '홈서비스 · 음식점·카페 · 동네 전문 매장'),
 'solution-home': ('HOME SERVICE', '플랫폼 견적 경쟁 대신,|우리 업체만 받는 [문의]', '청소·줄눈·시공 홈서비스 광고 솔루션'),
 'solution-food': ('FOOD & CAFE', '점심 장사 너머,|다시 오게 만드는 [이유]', '음식점·카페·외식 광고 솔루션'),
 'solution-local': ('NEIGHBORHOOD', '가격으로 못 이기면,|믿음으로 [고르게]', '약국·스터디카페 등 동네 전문 매장 솔루션'),
 'portfolio': ('CASES', '만든 결과를,|[있는 그대로]', '기간·조건과 함께 공유하는 성과 사례'),
 'case-cleaning': ('CASE STORY', '청소업체 메타 광고,|월 300건대 [직접 문의]', '2026.07~09 · 첫 달 100명에서 두 달 연속 300건대'),
 'resources': ('RESOURCES', '광고 올리기 전에|꺼내 보는 [실전 자료]', '린 캔버스 광고 기획법 · 업종별 심리 후킹 100선'),
 'checkup': ('SELF CHECK · 3분', '우리 매장 광고,|어디서 새고 [있을까]', '12문항으로 먼저 고칠 단계를 찾아보세요'),
 'tips': ('COLUMN', '현장에서 확인한 것을|[기록합니다]', '업종별 솔루션 · 실전 사례 · 광고 운영 전략'),
 'contact': ('CONTACT', '광고 계정,|대표가 직접 [봐 드립니다]', '매장명·연락처·업종 세 칸이면 됩니다'),
 'privacy': ('PRIVACY POLICY', '개인정보|[처리방침]', '아크즈마케팅(ARCZ)'),
}
def arc():
    P = dict(cx=1085, cy=700, a=430, b=505)
    pts = [(P['cx'] - P['a'] * math.cos(t), P['cy'] - P['b'] * math.sin(t)) for t in [i / 90 * math.pi / 2 for i in range(91)]]
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    top = pts[-1]
    orb = lambda g: 'M' + ' L'.join(f'{P["cx"] - (P["a"] + g) * math.cos(t):.1f},{P["cy"] - (P["b"] + g) * math.sin(t):.1f}' for t in [i / 90 * math.pi / 2 for i in range(91)])
    nodes = ''
    for k, t in zip('ARCZ', (.55, .9, 1.22, math.pi / 2)):
        x, y = P['cx'] - P['a'] * math.cos(t), P['cy'] - P['b'] * math.sin(t); z = k == 'Z'
        nodes += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="40" fill="url(#halo)" opacity=".45"/><circle cx="{x:.1f}" cy="{y:.1f}" r="19" fill="{"#1E1245" if z else "#24165A"}" stroke="{"#8B6CFF" if z else "#E4DEFF"}" stroke-width="{2.5 if z else 1.4}"/><text x="{x:.1f}" y="{y + 1:.1f}" class="nl">{k}</text>'
    return f'''<svg width="1200" height="630" viewBox="0 0 1200 630" style="position:absolute;inset:0"><defs>
 <radialGradient id="glow" cx="{top[0]}" cy="{top[1]}" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8B6CFF" stop-opacity=".55"/><stop offset=".5" stop-color="#6C47FF" stop-opacity=".14"/><stop offset="1" stop-color="#6C47FF" stop-opacity="0"/></radialGradient>
 <linearGradient id="surf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8B6CFF"/><stop offset=".4" stop-color="#6C47FF"/><stop offset="1" stop-color="#4B2BD9"/></linearGradient>
 <radialGradient id="halo"><stop offset="0" stop-color="#F3F0FF" stop-opacity=".9"/><stop offset=".35" stop-color="#C9BDFF" stop-opacity=".35"/><stop offset="1" stop-color="#8B6CFF" stop-opacity="0"/></radialGradient>
 <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter></defs>
 <rect width="1200" height="630" fill="#1E1245"/><rect width="1200" height="630" fill="url(#glow)"/>
 <path d="{orb(44)} L1260,{P['cy'] - P['b'] - 44}" fill="none" stroke="#8B6CFF" stroke-opacity=".4" stroke-width="1.3"/>
 <path d="{orb(100)} L1260,{P['cy'] - P['b'] - 100}" fill="none" stroke="#8B6CFF" stroke-opacity=".22" stroke-dasharray="2 9"/>
 <path d="{d} L1260,{top[1]} L1260,700 L{P['cx'] - P['a']},700 Z" fill="url(#surf)"/>
 <path d="{d} L1260,{top[1]}" fill="none" stroke="#C9BDFF" stroke-width="6" opacity=".35" filter="url(#b)"/><path d="{d} L1260,{top[1]}" fill="none" stroke="#F3F0FF" stroke-width="1.6" opacity=".85"/>
 {nodes}<circle cx="{top[0] + 46}" cy="{top[1] - 54}" r="40" fill="url(#halo)" opacity=".6"/><circle cx="{top[0] + 46}" cy="{top[1] - 54}" r="10" fill="#fff"/></svg>'''
def title_html(t):
    lines = t.split('|')
    def hl(s): return re.sub(r'\[(.+?)\]', r'<span class="hl">\1</span>', s)
    return ''.join(f'<div>{hl(l)}</div>' for l in lines)
CSS = f'''@font-face{{font-family:PXB;src:url({F}Pretendard-ExtraBold.otf)}}@font-face{{font-family:PMD;src:url({F}Pretendard-Medium.otf)}}
@font-face{{font-family:MSB;src:url({F}Montserrat-SemiBold.ttf)}}@font-face{{font-family:MBD;src:url({F}Montserrat-Bold.ttf)}}
html,body{{margin:0}}.og{{position:relative;width:1200px;height:630px;overflow:hidden;background:#1E1245;color:#fff}}
.nl{{font-family:MBD;font-size:15px;fill:#fff;text-anchor:middle;dominant-baseline:central}}
.c{{position:absolute;left:72px;top:64px;right:470px}}.logo svg{{height:30px;width:auto;display:block}}
.k{{font-family:MSB;font-size:17px;letter-spacing:.24em;color:#8B6CFF;margin-top:96px;display:flex;align-items:center;gap:12px}}.k:before{{content:'';width:8px;height:8px;border-radius:50%;background:#8B6CFF}}
.t{{font-family:PXB;font-size:62px;line-height:1.2;letter-spacing:-.035em;margin-top:22px;white-space:nowrap}}
.hl{{color:#8B6CFF;position:relative;margin-right:.14em}}.hl:after{{content:'';position:absolute;right:-.22em;top:.06em;width:.16em;height:.16em;border-radius:50%;background:#8B6CFF}}
.s{{font-family:PMD;font-size:21px;color:#C9BDFF;margin-top:26px;letter-spacing:-.01em;white-space:nowrap}}
.u{{position:absolute;left:72px;bottom:54px;font-family:MSB;font-size:17px;letter-spacing:.06em;color:#E4DEFF;opacity:.85}}'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630})
    for slug, (k, t, sub) in PAGES.items():
        url = 'arcz.kr' + ('' if slug == 'home' else '/' + slug)
        html = f'<html><head><style>{CSS}</style></head><body><div class="og">{arc()}<div class="c"><div class="logo">{LOGO}</div><div class="k">{k}</div><div class="t">{title_html(t)}</div><div class="s">{sub}</div></div><div class="u">{url}</div></div></body></html>'
        Path('/tmp/claude-0/og_tmp.html').write_text(html); pg.goto('file:///tmp/claude-0/og_tmp.html'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
        w = pg.evaluate("document.querySelector('.t').scrollWidth")
        if w > 640: pg.evaluate(f"document.querySelector('.t').style.fontSize='{int(62*640/w)}px'")   # 긴 제목은 곡선과 겹치지 않게 줄임
        png = f'{OUT}/{slug}.png'; pg.screenshot(path=png)
        os.system(f'ffmpeg -v error -y -i {png} -q:v 2 {OUT}/{slug}.jpg && rm {png}')
    b.close()
print(sorted(os.listdir(OUT)))
