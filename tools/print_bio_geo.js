/* 생명과학 · 기하 1시간 자습 프린트(HTML) 생성: node tools/print_bio_geo.js <outDir> <fontCssDir>
   생명: 손으로 정리한 핵심 + 흐름 빈칸 테스트 + 문제은행(선택형·빈칸) / 기하: 교과서 개념 + 문제(직접 그린 그림) + 풀이 */
const fs = require('fs'), path = require('path');
global.window = global; global.document = {};
const J = f => require(path.join(__dirname, '..', 'js', f));
['bio/qbank.js', 'bio/qbank2.js', 'bio/qbank3.js', 'bio/qbank4.js', 'bio/qimgs.js', 'geo/data.js', 'geo/figs.js'].forEach(J);
const IMG = 'file://' + path.join(__dirname, '..', 'img', 'bio');
const ph = (...ks) => `<div class="ph">${ks.map(([k, c]) => `<figure><img src="${IMG}/c/${k}.jpg"><figcaption>${c}</figcaption></figure>`).join('')}</div>`;
const OUT = process.argv[2], FONT = process.argv[3] || '';
const circ = ['①', '②', '③', '④', '⑤', '⑥'];
const css = `@import url('${FONT}/400.css');@import url('${FONT}/700.css');@import url('${FONT}/900.css');
@page{size:A4;margin:12mm 12mm 13mm}
body{font-family:'Noto Sans KR',sans-serif;font-size:10pt;line-height:1.5;color:#111;margin:0}
h1{font-size:21pt;margin:0 0 3mm;font-weight:900}
h2{font-size:14pt;margin:0 0 2.5mm;padding:1.8mm 3mm;background:#111;color:#fff;border-radius:2mm;break-after:avoid}
h3{font-size:11.5pt;margin:3.5mm 0 1.5mm;border-bottom:2px solid #111;break-after:avoid}
.part{break-before:page}
table{border-collapse:collapse;width:100%;margin:1mm 0 2mm}
td,th{border:1px solid #555;padding:1.1mm 1.8mm;vertical-align:top;font-size:9.3pt}
th{background:#eee}
.box{border:1.5px solid #111;border-radius:2mm;padding:2mm 3mm;margin:2mm 0;break-inside:avoid}
.warn{border:1.5px dashed #b91c1c;border-radius:2mm;padding:2mm 3mm;margin:2mm 0;break-inside:avoid}.warn b.t{color:#b91c1c}
.flow{display:flex;flex-wrap:wrap;align-items:center;gap:1mm;margin:1.5mm 0}.flow span{border:1.5px solid #111;border-radius:1.5mm;padding:.4mm 2mm;font-weight:700;background:#fafafa}.flow i{font-style:normal}
.two{columns:2;column-gap:6mm}.two>*{break-inside:avoid}
.q{margin:0 0 3.2mm;break-inside:avoid}.q .n{font-weight:900}.q .src{color:#666;font-size:8pt}
.o{display:block;margin-left:4mm}
.bl{display:inline-block;min-width:20mm;border-bottom:1px solid #111;text-align:center;font-size:8pt;color:#888}
.ans p{margin:0 0 1.2mm;font-size:8.4pt;line-height:1.4;break-inside:avoid}.ans{columns:2;column-gap:5mm}.ans h2{column-span:all}
.tt th{width:22mm}
.fig svg{max-width:62mm!important;margin:1mm auto!important}
.fig text{fill:#111}
small{font-size:8.5pt}.dim{color:#555}
.work{height:22mm}
.chap{break-inside:auto;margin-bottom:3mm}.chap+.chap{break-before:page}
.rc{margin:.6mm 0 0 2mm}.ex{border:1.5px solid #1f4fb8;border-radius:2mm;padding:2mm 3mm;margin:2mm 0}.st,.copy,.fig{break-inside:avoid}.exh{font-weight:900;color:#1f4fb8;margin-bottom:1mm}
.st{margin:1.2mm 0 0 1mm;padding-left:2mm;border-left:3px solid #1f4fb855;font-size:9.4pt}.ea{margin-top:1.5mm;font-size:10pt}.pr{border-top:1.5px dashed #111;padding-top:2mm;margin-top:3mm}
.memo{background:repeating-linear-gradient(#fff 0 6.6mm,#d4d4d4 6.6mm 6.9mm)}
.copy{margin-top:2mm;height:30mm;border:1px solid #bbb;border-radius:1.5mm;font-size:8pt;color:#888;padding:1mm 2mm;background-image:linear-gradient(#e6e6e6 1px,transparent 1px),linear-gradient(90deg,#e6e6e6 1px,transparent 1px);background-size:5mm 5mm}
.pr .work{height:48mm;border:1px solid #bbb;border-radius:1.5mm;background-image:linear-gradient(#e6e6e6 1px,transparent 1px),linear-gradient(90deg,#e6e6e6 1px,transparent 1px);background-size:5mm 5mm}
.ph{display:flex;gap:3mm;margin:1.5mm 0 2.5mm;break-inside:avoid}.ph figure{flex:1;margin:0;border:1px solid #999;border-radius:1.5mm;padding:1mm;text-align:center}.ph img{max-width:100%;max-height:44mm}.ph figcaption{font-size:8pt;color:#444}
.tb{columns:3;column-gap:4mm}.tb .tq{break-inside:avoid;margin:0 0 2.5mm;border-top:1.5px solid #111;padding-top:1mm}.tb .tq img{width:100%;max-height:105mm;object-fit:contain;display:block}.tb .tq .n{font-weight:900}.tb .lines{height:16mm;background:repeating-linear-gradient(#fff 0 7.5mm,#bbb 7.5mm 7.8mm)}
.vec{position:relative;display:inline-block;padding-top:.5em;line-height:1}.vec::before{content:'→';position:absolute;top:-.15em;left:0;right:0;text-align:center;font-size:.85em}`;
const page = (title, body) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;

/* ───────── 생명과학 ───────── */
const BIO_SUM = `
<h2>① 핵심 정리 <small>· 0~20분</small></h2>
<h3>1. 효소와 에너지</h3>
<table><tr><th style="width:24%">활성화 에너지</th><td>반응이 일어나려면 넘어야 하는 <b>언덕 높이</b>. 효소(생체 촉매)는 언덕만 낮춰서 체온에서도 반응이 빨라지게 해.</td></tr>
<tr><th>반응열</th><td>반응물과 생성물의 <b>높이 차</b>. 생성물이 낮으면 발열(에너지 방출, 이화), 높으면 흡열(에너지 흡수, 동화).</td></tr>
<tr><th>효소 구성</th><td>전효소 = <b>주효소</b>(단백질, 활성 부위 결정, 열에 약함) + <b>보조 인자</b>(조효소: NAD⁺·FAD·바이타민 B / 금속 이온: Fe²⁺·Mg²⁺ 등)</td></tr>
<tr><th>기질 특이성</th><td>활성 부위 모양에 맞는 기질만 결합 (자물쇠–열쇠). 효소는 반응 후에도 그대로 → <b>재사용</b>.</td></tr>
<tr><th>온도·pH</th><td>최적 온도·최적 pH에서 가장 빠름. 너무 뜨거우면 <b>변성</b>(복구 안 됨), 낮은 온도는 느려질 뿐. 펩신 pH 2, 아밀레이스·카탈레이스 pH 7, 트립신 pH 8.</td></tr>
<tr><th>기질 농도</th><td>기질↑ → 속도↑ → 모든 효소가 기질과 결합(<b>포화</b>)하면 더 안 빨라짐 → 이때는 효소 양을 늘려야 함.</td></tr>
<tr><th>억제제</th><td><b>경쟁적</b>: 활성 부위를 두고 기질과 경쟁 → 기질을 많이 넣으면 억제 효과↓. <b>비경쟁적</b>: 다른 곳에 붙어 모양을 바꿈 → 기질을 넣어도 최대 속도↓.</td></tr>
<tr><th>효소 6종류</th><td>산화·환원(탈수소 효소) · 전이 · 가수 분해(소화 효소) · 제거(탈탄산 효소) · 이성질화 · 연결(DNA 연결 효소, ATP 사용)</td></tr></table>
<div class="warn"><b class="t">헷갈리는 것</b> ① 효소는 꼭대기만 낮춤 → <b>반응열은 그대로</b>. ② 활성화 에너지는 기질 양·효소 양·온도·pH로 안 바뀜. 바뀌는 건 효소가 있느냐 없느냐뿐. ③ 시간–물질 그래프의 <b>기울기 = 반응 속도</b>.</div>

${ph(['e_energy', '활성화 에너지와 반응열'], ['e_inh', '경쟁적 · 비경쟁적 억제제'])}
<h3>2. 세포 호흡 한눈에 (포도당 1개 기준)</h3>
<div class="flow"><span>포도당 C₆</span><i>→ 해당 과정(세포질) →</i><span>피루브산 C₃ ×2</span><i>→ 산화(기질) →</i><span>아세틸 CoA C₂ ×2</span><i>→ TCA 회로(기질) →</i><span>CO₂</span><i>+ NADH·FADH₂ → 전자 전달계(내막) → ATP</i></div>
<table><tr><th>단계</th><th>장소</th><th>탄소 변화</th><th>CO₂</th><th>NADH</th><th>FADH₂</th><th>ATP</th><th>O₂ 필요?</th></tr>
<tr><td><b>해당 과정</b></td><td>세포질</td><td>C₆ → 2C₃</td><td>0</td><td>2</td><td>0</td><td>4 − 2 = <b>순 2</b> (기질 수준)</td><td>X</td></tr>
<tr><td><b>피루브산 산화</b></td><td>기질</td><td>C₃ → C₂ (×2)</td><td>2</td><td>2</td><td>0</td><td>0</td><td rowspan="2">간접적 O<br><small>(O₂ 없으면 NAD⁺ 재생 안 돼서 멈춤)</small></td></tr>
<tr><td><b>TCA 회로</b></td><td>기질</td><td>C₂+C₄→C₆→C₅→C₄ (×2)</td><td>4</td><td>6</td><td>2</td><td>2 (기질 수준)</td></tr>
<tr><td><b>산화적 인산화</b></td><td>내막</td><td>-</td><td>-</td><td colspan="2">NADH 10 × 2.5 + FADH₂ 2 × 1.5</td><td><b>28</b></td><td>O (최종 전자 수용체)</td></tr>
<tr><th colspan="3">합계</th><td>6</td><td>10</td><td>2</td><td><b>32 ATP</b></td><td></td></tr></table>
<div class="box"><b>TCA 회로 = 탄소 떼어 내기 게임</b>: 피루브산(C₃) → <b>CO₂</b>·NADH 나오며 C₂ + CoA = 아세틸 CoA → 옥살아세트산(C₄)과 합쳐 <b>시트르산(C₆)</b> → CO₂·NADH 나오며 <b>C₅</b> → CO₂·NADH 나오며 <b>C₄</b> → ATP·FADH₂·NADH 나오며 다시 <b>옥살아세트산(C₄)</b>.<br>
<b>CO₂가 나오는 곳 = 탄소 수가 줄어드는 곳</b> (C₃→C₂, C₆→C₅, C₅→C₄). 피루브산 1개당 CO₂ 3, NADH 4, FADH₂ 1, ATP 1.</div>
${ph(['r_gly', '해당 과정'], ['r_tca', '피루브산 산화와 TCA 회로'])}
<table><tr><th style="width:24%">마이토콘드리아</th><td>외막 / <b>내막</b>(주름 = 크리스타, 전자 전달계·ATP 합성 효소) / <b>막 사이 공간</b>(H⁺ 많음) / <b>기질</b>(TCA 회로 효소, DNA, 리보솜)</td></tr>
<tr><th>산화적 인산화</th><td>NADH·FADH₂의 전자가 전자 전달계를 지나며 에너지를 조금씩 내놓음 → 그 에너지로 H⁺를 <b>기질 → 막 사이 공간</b>으로 능동 수송 → H⁺가 <b>ATP 합성 효소</b>를 지나 기질로 확산하며 ATP 합성 = <b>화학 삼투</b>. 끝에서 O₂ + 전자 + H⁺ → H₂O.</td></tr>
<tr><th>NADH vs FADH₂</th><td>NADH → 2.5 ATP, FADH₂ → 1.5 ATP (FADH₂는 전자를 더 뒤쪽에 넣어서 H⁺를 덜 퍼 올림)</td></tr>
<tr><th>기질 수준 인산화</th><td>효소가 기질의 인산을 ADP에 <b>직접</b> 붙임 (해당 과정, TCA 회로). ↔ 산화적 인산화 (H⁺ 농도 차 이용)</td></tr></table>
${ph(['r_oxp', '산화적 인산화 (전자 전달계 · ATP 합성 효소)'])}
<table><tr><th>약물</th><th>작용</th><th>전자 전달·O₂ 소비</th><th>H⁺ 농도 차</th><th>ATP 합성</th></tr>
<tr><td>사이안화물·CO·로테논</td><td>전자 전달 저해</td><td>멈춤</td><td>안 생김</td><td>멈춤</td></tr>
<tr><td>올리고마이신</td><td>ATP 합성 효소 막음</td><td>곧 멈춤</td><td>커짐(못 흘러감)</td><td>멈춤</td></tr>
<tr><td>DNP (짝풀림제)</td><td>내막에 H⁺ 구멍</td><td><b>계속(오히려↑)</b></td><td>작아짐</td><td>감소 (에너지 → 열)</td></tr></table>
<div class="warn"><b class="t">헷갈리는 것</b> ① 피루브산 산화에서는 <b>ATP가 안 생김</b> (CO₂, NADH만). ② 해당 과정엔 CO₂가 없음. ③ H⁺ 농도: 막 사이 공간 &gt; 기질 (pH는 막 사이 공간이 더 낮음). ④ 에너지 효율 ≈ 34%, 나머지는 열 → 체온. ⑤ 호흡률 = CO₂ ÷ O₂: 탄수화물 1, 단백질 ≈ 0.8, 지방 ≈ 0.7.</div>

<h3>3. 발효 (산소 없을 때, 세포질)</h3>
<table><tr><th></th><th>젖산 발효</th><th>알코올 발효</th></tr>
<tr><th>생물</th><td>젖산균, 근육(격렬한 운동)</td><td>효모</td></tr>
<tr><th>과정</th><td>피루브산(C₃)이 NADH의 H를 받아 <b>젖산(C₃)</b></td><td>피루브산 → <b>CO₂ 방출</b> → 아세트알데하이드(C₂) → H를 받아 <b>에탄올(C₂)</b></td></tr>
<tr><th>최종 전자 수용체</th><td>피루브산</td><td>아세트알데하이드</td></tr>
<tr><th>식</th><td>C₆H₁₂O₆ → 2C₃H₆O₃ + 2ATP</td><td>C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2ATP</td></tr>
<tr><th>이용</th><td>요구르트, 김치</td><td>술, 빵(CO₂로 부풂)</td></tr></table>
${ph(['f_lac', '젖산 발효'], ['f_alc', '알코올 발효'])}
<div class="box"><b>발효의 목적 = NAD⁺ 재생</b>. 해당 과정은 NAD⁺가 있어야 돌아가니까, NADH의 전자를 피루브산(또는 아세트알데하이드)에 버려서 NAD⁺를 되돌려 받음 → 해당 과정의 2 ATP라도 계속 얻음. 산물(젖산·에탄올)에 에너지가 많이 남아 있음(불완전 산화).</div>

<h3>4. 광합성</h3>
<table><tr><th style="width:24%">엽록체</th><td>틸라코이드(쌓이면 그라나) 막 = <b>명반응</b> (색소, 전자 전달계, ATP 합성 효소) / <b>스트로마</b> = <b>캘빈 회로</b>. 짝: 틸라코이드 막 ↔ 내막, 틸라코이드 내부 ↔ 막 사이 공간(H⁺ 쌓임), 스트로마 ↔ 기질</td></tr>
<tr><th>전체 식</th><td>6CO₂ + 12H₂O + 빛 → C₆H₁₂O₆ + 6O₂ + 6H₂O (동화, 흡열, CO₂의 환원)</td></tr>
<tr><th>색소</th><td>엽록소 a = 반응 중심, 엽록소 b·카로티노이드 = 안테나(보조). 청자색·적색 흡수, 녹색 반사. 흡수 스펙트럼 ≈ 작용 스펙트럼 (엥겔만: 호기성 세균이 청자색·적색에 몰림)</td></tr>
<tr><th>크로마토그래피</th><td>Rf = 색소 이동 거리 ÷ 전개액 이동 거리. 위에서부터 <b>카로틴 &gt; 잔토필 &gt; 엽록소 a &gt; 엽록소 b</b></td></tr>
<tr><th>명반응</th><td><b>물의 광분해</b>(광계 Ⅱ 근처): H₂O → 2H⁺ + 2e⁻ + ½O₂ → <b>O₂는 물에서</b> (루벤 ¹⁸O 실험). 힐 실험: CO₂ 없이도 빛 + 전자 수용체면 O₂ 발생</td></tr>
<tr><th>비순환적 전자 흐름</th><td>H₂O → 광계 Ⅱ(P680) → 전자 전달계(ATP) → 광계 Ⅰ(P700) → NADP⁺ → NADPH. 결과: ATP, NADPH, O₂</td></tr>
<tr><th>순환적 전자 흐름</th><td>광계 Ⅰ → 전자 전달계 → 광계 Ⅰ. <b>ATP만</b> (캘빈 회로는 ATP 18 : NADPH 12로 ATP가 더 필요해서)</td></tr>
<tr><th>광인산화</th><td>H⁺를 <b>스트로마 → 틸라코이드 내부</b>로 퍼 올림 → ATP 합성 효소로 스트로마 쪽으로 확산하며 ATP. 야겐도르프: pH 4 → pH 8로 옮기면 빛 없이도 ATP 합성</td></tr>
<tr><th>캘빈 회로</th><td>① 탄소 고정: CO₂ + RuBP(C₅) → 3PG(C₃) ×2 (루비스코) ② 환원: 3PG → PGAL (ATP, NADPH 사용) ③ RuBP 재생 (ATP 사용). 포도당 1개 = 6바퀴 = <b>ATP 18, NADPH 12</b>. 최초 고정 산물 = 3PG (캘빈 ¹⁴C 실험)</td></tr></table>
${ph(['p_z', '명반응 전자 흐름'], ['p_calvin', '캘빈 회로'])}
<div class="warn"><b class="t">헷갈리는 것</b> ① 빛을 끊으면 3PG ↑, RuBP ↓ (ATP·NADPH가 없어 3PG를 못 바꿈). CO₂를 끊으면 RuBP ↑, 3PG ↓. ② H⁺ 방향: 광합성은 스트로마 → 틸라코이드 내부, 호흡은 기질 → 막 사이 공간. ③ 최종 전자 수용체: 광합성 NADP⁺, 호흡 O₂ / 전자 공여체: 광합성 H₂O, 호흡 NADH·FADH₂.</div>`;

const BIO_BLANK = `
<h2 style="margin-top:4mm">② 흐름 빈칸 테스트 <small>· 20~27분 · 앞 장을 덮고</small></h2>
<table><tr><th>단계</th><th>장소</th><th>탄소 변화</th><th>CO₂</th><th>NADH</th><th>FADH₂</th><th>ATP</th></tr>
${['해당 과정', '피루브산 산화', 'TCA 회로', '산화적 인산화', '합계'].map(s => `<tr><td><b>${s}</b></td><td></td><td></td><td></td><td></td><td></td><td style="height:7mm"></td></tr>`).join('')}</table>
<div class="two">
<p>1. TCA 회로의 탄소 수: 아세틸 CoA C<span class="bl"></span> + 옥살아세트산 C<span class="bl"></span> → 시트르산 C<span class="bl"></span> → C<span class="bl"></span> → C<span class="bl"></span></p>
<p>2. CO₂가 나오는 반응 = <span class="bl"></span> 반응 (탄소 수가 <span class="bl"></span>는 곳)</p>
<p>3. NADH 1개 → <span class="bl"></span> ATP, FADH₂ 1개 → <span class="bl"></span> ATP</p>
<p>4. 산화적 인산화: H⁺를 <span class="bl"></span> → <span class="bl"></span>로 퍼 올림 → <span class="bl"></span>를 지나며 ATP 합성 = <span class="bl"></span></p>
<p>5. 산소 호흡의 최종 전자 수용체 <span class="bl"></span>, 젖산 발효 <span class="bl"></span>, 알코올 발효 <span class="bl"></span></p>
<p>6. 발효의 목적 = <span class="bl"></span> 재생</p>
<p>7. 짝풀림제(DNP): O₂ 소비 <span class="bl"></span>, ATP 합성 <span class="bl"></span></p>
<p>8. 효소는 <span class="bl"></span>를 낮추고 <span class="bl"></span>은 바꾸지 않음</p>
<p>9. 경쟁적 억제제는 기질 농도를 높이면 억제 효과가 <span class="bl"></span></p>
<p>10. 명반응 장소 <span class="bl"></span>, 캘빈 회로 장소 <span class="bl"></span></p>
<p>11. 광합성의 O₂는 <span class="bl"></span>에서 옴 (<span class="bl"></span>의 실험)</p>
<p>12. 순환적 전자 흐름에서 생기는 것: <span class="bl"></span>만</p>
<p>13. 캘빈 회로: CO₂ + <span class="bl"></span>(C₅) → <span class="bl"></span>(C₃), 포도당 1개에 ATP <span class="bl"></span>, NADPH <span class="bl"></span></p>
<p>14. 빛을 끊으면 3PG <span class="bl"></span>, RuBP <span class="bl"></span></p>
</div>
<p class="dim"><small>정답: 표는 앞 장 표 그대로. 1) 2, 4, 6, 5, 4 · 2) 탈탄산, 줄어드 · 3) 2.5, 1.5 · 4) 기질, 막 사이 공간, ATP 합성 효소, 화학 삼투 · 5) O₂, 피루브산, 아세트알데하이드 · 6) NAD⁺ · 7) 계속(증가), 감소 · 8) 활성화 에너지, 반응열 · 9) 줄어듦 · 10) 틸라코이드 막(그라나), 스트로마 · 11) 물, 루벤 · 12) ATP · 13) RuBP, 3PG, 18, 12 · 14) 증가, 감소</small></p>`;

function bioQs() {
  const ok = q => (q.type === 'choice' || q.type === 'fill') && !q.img && !q.figf && !q.dg && !(/그림|그래프|표는|표에|표의/.test(q.q) && !q.fig);
  const pool = window.BQ.filter(ok); const pick = (pre, n) => { const a = pool.filter(q => pre.test(q.ch)); const step = a.length / n; return Array.from({ length: Math.min(n, a.length) }, (_, i) => a[Math.floor(i * step)]); };
  const qs = [...pick(/^e1$/, 6), ...pick(/^s(1|2|3|4)$/, 7), ...pick(/^s(5|6|7)$/, 6), ...pick(/^s(8|9|10|11|12)$/, 6), ...pick(/^p/, 9)];
  let n = 0; const ans = [];
  const body = qs.map(q => { n++; let t = q.q;
    if (q.type === 'fill') { let k = 0; const B = i => q.b[i]; t = t.replace(/\{(\d+)\}/g, (m, d) => { const b = B(+d); return b && !Array.isArray(b) && b.o ? `<span class="bl">(${+d + 1}) ${b.o.join(' / ')}</span>` : `<span class="bl">(${+d + 1})</span>`; });
      ans.push(`<p><b>${n}.</b> ${q.b.map((b, i) => `(${i + 1}) ${Array.isArray(b) ? b[0] : b && b.o ? (typeof b.a === "number" ? b.o[b.a] : b.a) : b}`).join(' · ')} <span class="dim">— ${q.exp}</span></p>`); }
    else ans.push(`<p><b>${n}.</b> ${circ[q.a]} <span class="dim">— ${q.exp}</span></p>`);
    return `<div class="q"><span class="n">${n}.</span> ${t} <span class="src">[${q.src}]</span>${q.fig ? `<div class="box" style="font-size:9pt">${q.fig}</div>` : ''}${q.o ? q.o.map((o, i) => `<span class="o">${circ[i]} ${o}</span>`).join('') : ''}</div>`; }).join('');
  return { body, ans: ans.join(''), n };
}
const BQS = bioQs();
const ORD = ['te', 't01', 't02', 't03', 't04', 't05', 'tu', 'tq'];
const TBQ = window.BQ.filter(q => q.img).sort((a, b) => ORD.indexOf(a.ch) - ORD.indexOf(b.ch));
const tAns = q => q.ans || (q.o && typeof q.a === 'number' ? `${circ[q.a]} ${q.o[q.a]}` : q.s ? q.s.map((x, i) => `(${i + 1}) ${x[1] ? '○' : '×'}`).join(' ') : q.b ? q.b.map((b, i) => `(${i + 1}) ${Array.isArray(b) ? b[0] : b.a}`).join(' ') : '');
const TB = TBQ.map((q, i) => `<div class="tq"><span class="n">교${i + 1}.</span> <span class="src">${q.src}</span><img src="${IMG.replace('/bio', '')}/../${q.img}"></div>`).join('');
const TBA = TBQ.map((q, i) => `<p><b>교${i + 1}.</b> ${tAns(q)}${q.exp ? ` <span class="dim">— ${q.exp}</span>` : ''}</p>`).join('');
const bio = page('생명과학 자습 프린트', `<h1>생명과학 1시간 자습 프린트</h1>
<p>범위: 효소 · 세포 호흡(해당 과정 → TCA 회로 → 산화적 인산화) · 발효 · 광합성</p>
<table class="tt"><tr><th>0~20분</th><td><b>① 핵심 정리</b> 읽기. 빨간 점선 박스 = 시험에 잘 나오는 함정. 세포 호흡 표는 손으로 한 번 따라 쓰기.</td></tr>
<tr><th>20~27분</th><td><b>② 흐름 빈칸 테스트</b>: 앞 장을 덮고 표와 빈칸 채우기 → 아래 정답으로 채점.</td></tr>
<tr><th>27~55분</th><td><b>③ 교과서 문제 ${TBQ.length}문항 (원본 사진)</b>: 서술형은 사진 아래 줄에 직접 쓰기. 빈칸은 사진 속 빈칸에. 막히면 ☆.</td></tr>
<tr><th>55~60분</th><td><b>채점</b> (맨 뒤 정답). 틀린 문제는 ① 해당 표를 다시 읽기.</td></tr></table>
${BIO_SUM}${BIO_BLANK}
<h2 class="part">③ 교과서 문제 (원본 사진) <small>· 27~55분</small></h2><div class="tb">${TB}</div>
<div class="part ans"><h2>정답 · 해설 — ③ 교과서 문제</h2>${TBA}</div>`);

/* ───────── 기하 ───────── */
const FR = require('./geo_friendly.js'); J('geo/guide.js');
let gn = 0; const gAns = [];
const figOf = k => { const f = window.GEOFIG && window.GEOFIG[k]; return f ? `<div class="fig">${f()}</div>` : ''; };
const geoCh = window.GEO.map(c => { const F = FR[c.id] || { k: c.learn, r: [] };
  const keys = Object.keys(window.GEOQA).filter(k => k.startsWith(c.id + ':')).sort((x, y) => window.GEOQA[y].length - window.GEOQA[x].length);
  const ex = keys[0], exI = ex ? +ex.split(':')[1] : 0, P = c.probs[exI];
  const steps = ex ? window.GEOQA[ex].map(([q, o, a, why], i) => `<div class="st"><b>${circ[i] || (i + 1) + '.'}</b> ${q} → <b>${o[a]}</b><br><span class="dim">${why}</span></div>`).join('') : '';
  const prI = (c.probs.findIndex((p, i) => i !== exI && i > exI) + 1 || c.probs.findIndex((p, i) => i !== exI) + 1) - 1, PR = c.probs[prI];
  let pr = ''; if (PR) { gn++; gAns.push(`<p><b>${gn}.</b> <b>${PR.a}</b> <span class="dim">— ${PR.h || ''}</span></p>`);
    pr = `<div class="q pr"><span class="n">직접 풀기 ${gn}.</span> <span class="src">[${PR.s}]</span><br>${PR.q}${figOf(c.id + ':' + prI)}<div class="work"></div></div>`; }
  return `<div class="chap"><h2>${c.t} <small>${c.p}</small></h2>
<table class="nt"><tr><th style="width:18%">개념</th><th>쉬운 말 정리</th><th style="width:27%">내 필기</th></tr>${F.k.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td><td class="memo"></td></tr>`).join('')}</table>
${F.r.length ? `<div class="box"><b>이런 문제는 이렇게</b>${F.r.map(([t, v]) => `<div class="rc"><b>${t}</b>: ${v}</div>`).join('')}</div>` : ''}
${P ? `<div class="ex"><div class="exh">예제 따라 풀기 <span class="src">[${P.s}]</span></div>${P.q}${figOf(c.id + ':' + exI)}${steps}<div class="ea">답: <b>${P.a}</b></div><div class="copy">보지 않고 다시 풀어 보기</div></div>` : ''}
${pr}</div>`; }).join('');
const geo = page('기하 자습 프린트', `<h1>기하 1시간 자습 프린트</h1>
<p>범위: 교과서 p80~152, p160~166 — 좌표공간 · 벡터 · 내적 · 직선의 방정식</p>
<table class="tt"><tr><th>단원마다 6분</th><td>① <b>개념</b> 표 읽기 (쉬운 말 정리) → ② <b>이런 문제는 이렇게</b> 순서 외우기 → ③ <b>예제 따라 풀기</b>: 답을 손으로 가리고 단계마다 먼저 생각해 보고 확인 → ④ <b>직접 풀기</b> 1문제</td></tr>
<tr><th>마지막 5분</th><td>채점 (맨 뒤). 틀린 문제는 그 단원 "이런 문제는 이렇게"를 다시 읽기.</td></tr></table>
<div class="box">자주 쓰는 공식: 거리 √(Δx² + Δy² + Δz²) · 내분점 (mB + nA)/(m + n) · 무게중심 = 세 점 평균 · 내적 a·b = a₁b₁ + a₂b₂ + a₃b₃ = |a||b|cos θ · 수직 ⇔ 내적 0 · 평행 ⇔ 실수배</div>
${geoCh}
<div class="part ans"><h2>직접 풀기 정답 · 풀이</h2>${gAns.join('')}</div>`);
const MATH = require('./mathify.js');
const fixV = h => h.replace(/<v>([^<]*)<\/v>/g, '<span class="vec">$1</span>');
fs.writeFileSync(path.join(OUT, 'bio.html'), bio); fs.writeFileSync(path.join(OUT, 'geo.html'), MATH(fixV(geo)).replace('</style>', MATH.css + '</style>'));
console.log('bio', BQS.n, 'geo', gn);
