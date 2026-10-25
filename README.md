# arcz.kr — ARCZ(아크즈마케팅) 홈페이지

브랜드 가이드라인 VER 1.0(2026.10) 기준으로 다시 만든 정적 사이트입니다. GitHub Pages(`arczpartner-star.github.io`)에서 그대로 동작합니다.

## 내 PC에서 미리 보기

폴더를 압축 해제한 뒤 `index.html`을 더블클릭하면 됩니다. 모든 경로가 상대 경로라 인터넷 주소 없이도 이미지·디자인·메뉴 이동이 동작합니다.
(글꼴은 인터넷에서 불러오므로 오프라인이면 기본 글꼴로 보입니다. 상담 폼 전송은 `config.js`에 주소를 넣은 뒤 동작합니다. `404.html`은 서버 전용이라 로컬에서는 이미지가 안 보일 수 있습니다.)

## 올리는 법 (기존 저장소 교체)

1. 저장소의 기존 파일을 모두 지우고(특히 옛 `assets/logo-*.png`), 이 폴더의 파일을 **전부** 올립니다.
2. `CNAME`(arcz.kr)과 `naver5e2acf95824e0cf7b34c55d5115399c3.html`(네이버 소유 확인)은 그대로 들어 있습니다. 지우지 마세요.
3. 구글 소유 확인 메타 태그는 모든 페이지 `<head>`에 들어 있습니다.
4. 올린 뒤 1~3분 후 arcz.kr에서 확인 → 네이버 서치어드바이저·구글 서치콘솔에 `https://arcz.kr/sitemap.xml` 제출.

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 처음으로 — 히어로 · 고민 · ARCZ Method · 대표 · 진행 순서 · 사례 · 함께하는 기준 · 약속 · FAQ · 진단 신청 |
| `method.html` | ARCZ Method 4단계 상세 · 단계별 숫자 · 도구 |
| `services.html` | 실행 영역 8가지 · 시작 순서 |
| `pricing.html` | 운영 플랜 3종 · 비용 원칙 · 약속 |
| `portfolio.html` | 성과 사례 (data.js의 CASES) |
| `tips.html` | 칼럼 — 블로그 카테고리 3개 · 대표 글 (data.js의 POSTS) |
| `contact.html` | 진단 신청 폼(3칸 + 선택 1칸) · 직접 연락 · FAQ 4개 |
| `404.html` | 없는 주소 |
| `data.js` | **사례·블로그 글·FAQ — 내용은 이 파일만 고칩니다** |
| `config.js` | **상담 신청 접수 주소(구글 Apps Script 웹 앱 URL) — 한 줄만 고칩니다** |
| `style.css` / `app.js` | 디자인 토큰·컴포넌트 / 메뉴·FAQ·폼·스크롤 |
| `assets/logo/` | 로고 SVG 6종 (브랜드 로고 패키지 원본) |
| `assets/og-image.png` | 카카오톡·SNS 공유 미리보기 1200×630 |
| `assets/blog/` | 네이버 블로그 투명 위젯 이미지 (widget-blank.png, widget-test-1~5.png) |
| `robots.txt` / `sitemap.xml` | 검색엔진용 |

## 꼭 확인할 것

- **사례 수치(data.js `CASES`)** — 브랜드 가이드의 숫자 규칙상 각 사례에 기간·조건·고객 동의를 `note`에 적어야 합니다(예: `"2026.06~08 · 메타 인스턴트 양식 기준 · 고객 동의"`). 실제 데이터가 아니거나 동의가 없는 사례는 삭제하세요.
- **문의 폼 → 구글 스프레드시트** — Formspree 대신 아크즈 구글 계정의 스프레드시트로 접수됩니다. 처음 한 번 `apps_script/SETUP.md` 순서대로 시트·스크립트를 만들고, 나온 웹 앱 주소를 `config.js`에 넣으세요. 받는 항목: `store · phone · business_type · message` + 신청 페이지·유입 경로·UTM(자동).
- **`apps_script/` 폴더는 저장소에 올리지 않아도 됩니다**(구글 Apps Script에 붙여넣는 원본과 설명서).
- **'월 5개사' 문구**(처음으로 페이지 진단 신청 칸) — 실제 운영과 다르면 `index.html`에서 고치세요.
- 서체는 Pretendard(jsDelivr)·Montserrat(Google Fonts)를 불러옵니다. 둘 다 SIL OFL 1.1.

## 사례·글 추가

`data.js`를 열어 배열 맨 앞에 같은 형식으로 한 덩어리를 추가하면 처음으로·성과 사례·칼럼 페이지에 자동으로 나옵니다.
