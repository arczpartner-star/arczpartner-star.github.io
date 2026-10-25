/**
 * ARCZ 상담 신청 → 구글 스프레드시트 연동 (Google Apps Script)
 * arcz.kr 진단 신청 폼이 이 웹 앱으로 내용을 보내고, 시트에 한 줄씩 쌓입니다.
 *
 * 설치 순서 (자세한 내용은 SETUP.md)
 *  1. 아크즈 구글 계정으로 새 스프레드시트 만들기 → 확장 프로그램 → Apps Script
 *  2. 이 파일 내용을 Code.gs에 붙여넣고 저장
 *  3. 위쪽 함수 선택에서 setup 실행 → 권한 허용  (시트·서식·알림 설정이 자동으로 만들어짐)
 *  4. 배포 → 새 배포 → 유형: 웹 앱 → 실행: 나 / 액세스: 모든 사용자 → 배포
 *  5. 나온 웹 앱 URL(…/exec)을 홈페이지 config.js의 leadEndpoint에 붙여넣기
 */

// ────────────────────────────────────────────── 설정 (여기만 고치면 됩니다)
const CONFIG = {
  SHEET_NAME: '상담신청',
  NOTIFY_EMAILS: ['arcz_partner@naver.com'],   // 새 신청 알림 받을 메일. 비우면 알림 안 보냄: []
  RETENTION_MONTHS: 6,                          // 상담 완료 후 보관 기간(개인정보 동의 문구와 같게)
  DUP_WINDOW_SEC: 120,                          // 같은 번호로 이 시간 안에 다시 오면 중복으로 보고 저장 안 함
  ALLOWED_ORIGINS: ['https://arcz.kr', 'https://www.arcz.kr', 'https://arczpartner-star.github.io'], // 기록용(참고)
};

const HEADERS = ['접수일시', '매장·브랜드명', '연락처', '업종', '남긴 내용', '개인정보 동의',
                 '신청 페이지', '유입 경로', 'UTM', '상태', '담당 메모', '상담 완료일', '파기 예정일'];
const STATUS = ['신규', '연락함', '상담 완료', '계약', '보류', '파기'];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

// ────────────────────────────────────────────── 웹 앱 진입점
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p._gotcha) return json_({ ok: true });                      // 스팸 봇(숨은 칸 채움) — 조용히 무시

    const store = clean_(p.store, 60);
    const phone = normPhone_(p.phone);
    const type = clean_(p.business_type, 30);
    const message = clean_(p.message, 1000);
    const agree = String(p.privacy_agree || '') === '동의';

    if (!store) return json_({ ok: false, code: 'store', message: '매장·브랜드명을 적어 주세요.' });
    if (!phone) return json_({ ok: false, code: 'phone', message: '연락 가능한 번호를 확인해 주세요.' });
    if (!agree) return json_({ ok: false, code: 'agree', message: '개인정보 수집·이용에 동의해 주셔야 접수할 수 있습니다.' });

    const cache = CacheService.getScriptCache();
    const dupKey = 'lead_' + phone.replace(/\D/g, '');
    if (cache.get(dupKey)) return json_({ ok: true, duplicate: true });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sh = sheet_();
      const now = new Date();
      sh.appendRow([
        now, safe_(store), safe_(phone), safe_(type), safe_(message), agree ? '동의' : '',
        safe_(clean_(p.page, 200)), safe_(clean_(p.referrer, 300)), safe_(clean_(p.utm, 300)),
        '신규', '', '', '',
      ]);
    } finally {
      lock.releaseLock();
    }
    cache.put(dupKey, '1', CONFIG.DUP_WINDOW_SEC);

    notify_({ store, phone, type, message, page: p.page });
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, code: 'server', message: '일시적인 오류입니다. 전화나 카카오톡으로 연락 주세요.' });
  }
}

function doGet() {
  return json_({ ok: true, service: 'arcz-lead', time: new Date().toISOString() });
}

// ────────────────────────────────────────────── 최초 1회 실행
function setup() {
  const sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#1E1245').setFontColor('#FFFFFF').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 34);
  const widths = [150, 180, 130, 140, 320, 90, 150, 220, 180, 90, 240, 110, 110];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sh.getRange('L:M').setNumberFormat('yyyy-mm-dd');
  sh.getRange('C:C').setNumberFormat('@');
  sh.getRange('E:E').setWrap(true);

  const rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(false).build();
  sh.getRange(2, COL['상태'], 1000, 1).setDataValidation(rule);

  const statusRange = sh.getRange(2, COL['상태'], 1000, 1);
  const colors = { '신규': ['#6C47FF', '#FFFFFF'], '연락함': ['#E4DEFF', '#1E1245'], '상담 완료': ['#F3F0FF', '#5D5873'],
                   '계약': ['#1E1245', '#FFFFFF'], '보류': ['#EEEEEE', '#9A95AE'], '파기': ['#FDE7EC', '#B03A5B'] };
  const rules = Object.entries(colors).map(([v, [bg, fg]]) =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(v).setBackground(bg).setFontColor(fg).setRanges([statusRange]).build());
  sh.setConditionalFormatRules(rules);

  installTriggers_();
  SpreadsheetApp.getActive().toast('설정 완료 — 이제 배포 → 새 배포 → 웹 앱으로 배포하세요.', 'ARCZ', 8);
}

// ────────────────────────────────────────────── 상태가 바뀌면 날짜 자동 기록
function onEdit(e) {
  const r = e.range;
  if (r.getSheet().getName() !== CONFIG.SHEET_NAME || r.getRow() < 2 || r.getColumn() !== COL['상태']) return;
  const sh = r.getSheet();
  const v = String(e.value || '');
  if (v === '상담 완료' || v === '보류') {
    const done = new Date();
    const purge = new Date(done); purge.setMonth(purge.getMonth() + CONFIG.RETENTION_MONTHS);
    sh.getRange(r.getRow(), COL['상담 완료일']).setValue(done);
    sh.getRange(r.getRow(), COL['파기 예정일']).setValue(purge);
  }
  if (v === '계약') {           // 계약 고객은 계약 관리로 넘어가므로 파기 예정일을 비움
    sh.getRange(r.getRow(), COL['파기 예정일']).clearContent();
  }
}

// ────────────────────────────────────────────── 보관 기간이 지난 신청 파기 (매일 새벽 자동)
function purgeExpired() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return;
  const vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const today = new Date();
  let n = 0;
  for (let i = vals.length - 1; i >= 0; i--) {
    const due = vals[i][COL['파기 예정일'] - 1];
    if (due instanceof Date && due <= today) { sh.deleteRow(i + 2); n++; }
  }
  if (n) console.log('purged rows: ' + n);
}

function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['purgeExpired', 'onEdit'].includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('purgeExpired').timeBased().everyDays(1).atHour(4).create();
}

// ────────────────────────────────────────────── 알림
function notify_(d) {
  if (!CONFIG.NOTIFY_EMAILS.length) return;
  try {
    const url = SpreadsheetApp.getActive().getUrl();
    const body = [
      '새 진단 신청이 들어왔습니다.', '',
      '매장·브랜드명: ' + d.store, '연락처: ' + d.phone, '업종: ' + (d.type || '-'),
      '남긴 내용: ' + (d.message || '-'), '신청 페이지: ' + (d.page || '-'), '',
      '시트 열기: ' + url,
    ].join('\n');
    MailApp.sendEmail({ to: CONFIG.NOTIFY_EMAILS.join(','), subject: '[arcz.kr] 진단 신청 — ' + d.store, body, name: 'ARCZ 상담 알림' });
  } catch (err) { console.error('notify failed', err); }   // 메일 실패해도 접수는 유지
}

// ────────────────────────────────────────────── 도우미
function sheet_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME, 0);
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}
function safe_(v) {                       // 시트 수식 주입 방지: = + - @ 로 시작하면 앞에 ' 를 붙임
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function normPhone_(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length < 9 || d.length > 11) return '';
  if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  if (d.length === 10) return d.startsWith('02') ? d.slice(0, 2) + '-' + d.slice(2, 6) + '-' + d.slice(6)
                                                 : d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  return d.slice(0, 2) + '-' + d.slice(2, 5) + '-' + d.slice(5);
}
