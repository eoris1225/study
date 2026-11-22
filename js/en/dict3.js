'use strict';
/* 단어 터치 사전 추가분 — 프린트 The History of Money (2026 21번 포함) */
(() => {
  const raw = `abstract|추상적인
abstraction|추상(화), 추상적 개념
ancestors|조상들
bird|새
borrowed|빌린 (borrow)
borrower|빌리는 사람, 채무자
borrowers|빌리는 사람들, 채무자들
borrowing|빌리기, 차입
bush|덤불
chance|가능성, 확률
chances|가능성들
changes|바꾸다 / 변화
code|법전, 규범 (함무라비 법전)
comfort|편안함, 안심
coming|다가오는
commercial|상업의
commodity|상품, 사고파는 물건
compound|복리의 (compound interest = 복리)
comprehension|이해
concepts|개념들
concerns|걱정, 관심사
connect|연결하다
consider|생각해 보다, 고려하다
cost|비용, 대가
definition|정의 (by definition = 정의상, 당연히)
deployed|배치된, 활용된 (deploy)
disease|질병
economic|경제의
enormous|막대한, 거대한
environment|환경
essential|필수적인
exponentially|기하급수적으로
factors|요인들 (factor in = ~을 감안하다)
fall|떨어지다, 줄다
flowed|흘렀다 (flow)
flowing|흐르는, 계속 들어오는
forth|(and so forth) 기타 등등
forward|앞으로, 미래로
hand|손 (in the hand = 손안에)
harvest|수확
head|머리 (머릿수 = 가축 수)
hero|영웅
higher|더 높은
hoarded|쌓아 둔, 비축한 (hoard)
host|많은 수 (a host of = 수많은)
hostage|인질 (hostage to = ~에 좌우되는)
hunger|굶주림
incentive|동기, 유인책
income|소득, 수입
infrastructure|기반 시설
innovation|혁신, 새로운 발명
interest|이자 (rate of interest = 이자율)
invest|투자하다
investment|투자
journey|여정
kushim|쿠심 (수메르 기록에 남은 이름)
lacked|부족했다 (lack)
leap|도약
lend|빌려주다
lender|빌려주는 사람, 채권자
lenders|빌려주는 사람들
lending|빌려주기, 대출
lent|빌려준 (lend의 과거분사)
level|수준
loan|대출(금), 빌려준 돈
longer|더 긴, 더 오래
mental|정신적인, 머릿속의
merely|단지, 그저
mini-encyclopedia|작은 백과사전
modern|현대의
money|돈
opportunity|기회 (opportunity cost = 기회비용)
our|우리의
over|~ 동안, ~에 걸쳐
owed|빚진 (owe)
paid|지불된 (be paid back = 돌려받다)
per|~당, ~마다
percent|퍼센트
perception|인식
person|사람
person's|사람의
phenomena|현상들 (phenomenon의 복수)
plagued|괴롭혔다 (plague)
probability|확률, 가능성
progress|진보, 발전
put|(to put it another way) 다르게 말하면
realistic|현실적인
reflects|반영하다
region|지역
repaid|상환된, 돌려받은 (repay)
revolutionary|혁명적인
reward|보상
rhythm|리듬, 주기
rises|오르다, 증가하다
risk|위험
scenario|시나리오, 상황
sets|정하다
somebody|누군가
spend|쓰다, 소비하다
spending|쓰기, 소비
stops|멈추다
sumerians|수메르인들
sun|태양
surprisingly|놀랍게도
technological|기술의
tells|말해 주다
tomorrow|내일, 미래
turned|바꿨다 (turn A into B = A를 B로 바꾸다)
unknowable|알 수 없는
vagaries|예측 못 할 변화, 변덕
value|가치
variables|변수들
wait|기다리다
whereby|그것에 의해, ~하는 (방식)
whole|전체의
won't|~하지 않을 것이다 (will not)
worldview|세계관
worth|~의 가치가 있는
worthwhile|가치 있는, 할 만한`;
  /* 이 지문 문맥에 맞게 덮어쓰기 */
  Object.assign(window.DICT, { rate: '비율, 요율 (rate of interest = 이자율)', traded: '거래된 (trade)', present: '현재의', imagined: '상상된 (imagine)', back: '(be paid back / pay back) 돌려받다, 갚다', price: '가격', own: '자기 자신의' });
  raw.split('\n').forEach(l => { const [k, v] = l.split('|'); if (k && v && !window.DICT[k.trim()]) window.DICT[k.trim()] = v.trim(); });
})();
