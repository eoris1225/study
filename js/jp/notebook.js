'use strict';
/* 유나의 생존 수첩: 진짜 공책 정리처럼 (형광펜·빨간 펜·표·★·포스트잇) + 유나가 그린 설명 그림 + 스즈의 엉성한 크레용 낙서.
   NOTEBOOK.pages(keys) → 페이지마다 그리기 함수 (g, w, h) 배열.  줄 표기:
   t:제목  h:소제목  - 항목  "  - " 하위 항목  ! 중요(빨강+별)  tb!:머리|칸  tb:칸|칸  pic:그림  sz:스즈낙서  memo:포스트잇  ---
   글자 속: ==노랑 형광== ++분홍 형광++ %%초록 형광%% **빨간 펜** __빨간 밑줄__ */
(() => {
const FONT = "Gaegu, 'Klee One', 'Gowun Dodum', sans-serif";
const INK = '#23202c', BLUE = '#2a4aa8', RED = '#d0303a';
const HL = { '==': 'rgba(255,214,60,.62)', '++': 'rgba(255,140,185,.5)', '%%': 'rgba(120,220,140,.5)' };
const rnd = s => () => (s = (s * 16807 + 11) % 2147483647) / 2147483647;

/* ── 노트 내용 (교과서 4·5·6과) ── */
const N = {
가족호칭_내남구분_친외가: `t:가족 호칭 (家族の呼び方)|4과 가정생활·사회생활
tag:정의|가족 호칭 = 혈연·결혼으로 맺어진 가족끼리 부르는 말
h:내 가족 ↔ 남의 가족
tag:특징|남에게 말할 때 **내 가족은 낮추고** 남의 가족은 높여 부름
tb!:구분|내 가족 (낮춤)|남의 가족 (높임)
tb:아버지|ちち|おとうさん
tb:어머니|はは|おかあさん
tb:형·오빠|あに|おにいさん
tb:누나·언니|あね|おねえさん
tb:여동생|いもうと|いもうとさん
tb:남동생|おとうと|おとうとさん
h:친가·외가 구분 없음
tb!:한국|일본
tb:삼촌·외삼촌·고모부·이모부|おじさん
tb:숙모·외숙모·고모·이모|おばさん
tag:비교|한국은 친가·외가에 따라 호칭이 세분화 ↔ 일본은 성별로만 구분
h:막내 기준 호칭
pic:family|막내를 기준으로 통일한 호칭
- 가족 중 막내가 부르는 호칭으로 통일
  - 엄마가 장녀를 「おねえちゃん」, 장남을 「おにいちゃん」으로 부름
- 가족 안에서 호칭의 혼동을 줄이는 장점
- 부부: 이름·애칭 → 아이가 생기면 「おとうさん·おかあさん」
tag:비교|한국의 "○○ 엄마·아빠"처럼 아이를 기준으로 부르는 방식과 비슷
tag:시험|남의 외숙부 = おじさん (おじ X) / 호칭 기준 = 막내
sz:cat`,
성씨_통계_지역유래: `t:성씨·이름·명함|4과 가정생활·사회생활
h:성씨 (名字)
tag:특징|종류 약 10만~30만 개 (조사 방법에 따라 다름)
tag:비교|한국: 김·이·박 등 일부 성씨에 집중 ↔ 일본: 종류가 매우 다양
tag:유래|원래 귀족·무사만 사용 → **메이지 유신 이후** 서민도 성씨를 가짐
- 한 글자·두 글자·세 글자 등 다양 (대부분 두 글자)
- 많은 성: 사토·스즈키·다카하시·다나카·이토
- 같은 읽기에 한자만 바꾸거나, 같은 한자에 읽기만 바꾸며 늘어남
pic:surname|지형·방향을 나타내는 글자의 조합
- 지형 (山·川·田·森·林) + 위치·방향 (上·下·中·前·小)
- 지명 유래: 三浦 (미우라반도), 細川 (아이치현), 有村 (가고시마현)
h:이름 (名前)
- 인명용 한자·상용한자·히라가나·가타카나 모두 사용 가능
- 한자 읽는 법이 자유 → 大翔 약 18가지, 結愛 약 14가지
  - 서류에는 「ふりがな」, 처음 만나면 읽는 법을 확인
- 부모의 바람을 담아 짓고, 지나치게 특이한 이름은 출생 신고 거부 가능
h:부부의 성씨
tag:특징|법률상 부부는 같은 성 → 대부분 남편의 성을 따름
tag:비교|한국: 결혼해도 본래 성 유지 ↔ 일본: 부부 동성
- 최근 결혼 전 성을 그대로 쓰는 사람 증가, **부부 별성** 요구 증가
h:명함 교환
pic:meishi|명함은 상대가 읽기 쉬운 방향으로
- 성씨·읽는 법이 다양 → 이름을 정확히 알리기 위해 명함 문화 발달
box:명함 교환 순서
- ① 미리 꺼내기 쉽게 준비, 상대가 읽기 쉬운 방향으로 돌려 건넴
- ② 반드시 서서 주고받음 (동시에: 오른손으로 주고 왼손으로 받음)
- ③ 상대보다 낮은 위치에서 건네면 정중함
- ④ 받은 명함은 대화가 끝날 때까지 지갑·주머니에 넣지 않음
/box
tag:시험|명함은 받자마자 넣지 않음 / 성씨 = 지형·방향의 조합`,
방문예절_체류시간_외투: `t:방문 예절 (訪問マナー)|4과 일본인의 예절
tag:정의|남의 집 방문 규칙 → 방문지의 가족을 존중하는 의미
box:방문 전
- 미리 약속을 하고, 가져갈 선물 (てみやげ)을 준비
/box
box:방문 시
- ① 약속 시간을 지키고, 외투는 밖에서 벗어 손에 걸고 초인종을 누름
- ② 현관에서 신발을 벗고, 신발 코가 바깥쪽을 향하도록 돌려 놓음
- ③ 선물은 쇼핑백에서 꺼내 양손으로 전달
- ④ 방을 이동할 때 문지방·다다미 가장자리·방석을 밟지 않음
- ⑤ 화장실은 「トイレ、かりてもいいですか」로 양해를 구함
- ⑥ 너무 오래 머물지 않고, 외투는 현관을 나온 뒤에 입음
/box
pic:genkan|현관: 신발 코는 문 쪽으로
box:방문 후
- 감사 전화나 문자 (「今日はありがとうございました」)
/box
tag:비교|한국도 신발을 벗지만 신발 방향·외투를 입는 시점까지 정해져 있지는 않음
h:생활 속 일본어: 방문 대화
tb!:방문자|집주인
tb:ごめんください (실례합니다)|はーい / いらっしゃい
tb:こんにちは|どうぞ、あがって
tb:おじゃまします|こちらへ どうぞ
tb:よかったら みなさんで どうぞ|まあ、ありがとう
tag:시험|외투는 밖에서 벗기 ○ / 쇼핑백째 전달 X / 신발 코 안쪽 X`,
인사말_만날때_헤어질때: `t:인사 (あいさつ)|4과 일본인의 예절 · 언어문화
h:오지기 (お辞儀)
tag:정의|허리를 굽혀 인사·감사·경의·사죄를 나타내는 동작
pic:bow|상황에 따른 인사 각도
tb!:각도|상황|예
tb:15°|가족·동료에게 가볍게|おはようございます
tb:30°|첫 대면·손윗사람·감사·환영|はじめまして
tb:45° 이상|비즈니스, 깊은 경의·사죄|もうしわけありません
h:악수
- 서양의 대표 인사 (오른손에 무기가 없다는 표시에서 유래)
- 일본: 오지기가 정식 인사, 악수는 주로 연예인·정치인
tag:특징|직접적인 신체 접촉보다 일정한 거리를 두는 인사를 편하게 느낌
h:만날 때 인사
pic:greet|시간대별 인사말
- 아침 おはよう(ございます) / 낮 こんにちは / 저녁 こんばんは
- 매일 만나는 친구·가족끼리는 こんにちは·こんばんは를 거의 쓰지 않음
- 출근 시간이 일정하지 않은 직장 (아르바이트 등)은 시간 상관없이 おはようございます
h:헤어질 때 인사
tb!:상대|인사말
tb:오래 헤어지는 사람|さようなら
tb:학교에서 선생님 ↔ 학생|さようなら
tb:매일 보는 친구·동료|じゃあね · またね · また、あした · バイバイ
tb:손윗사람|失礼します
tag:비교|한국어 '안녕'은 만날 때·헤어질 때 모두 사용 ↔ 일본어는 상황별로 다름
tag:시험|오래 헤어질 때 = さようなら / 일상 인사 = 15°
sz:heart`,
선물_금기품목_4종: `t:선물 문화 (贈り物)|4과 일본인의 예절
tag:정의|선물 = 서로에 대한 관심의 표현, 인간관계를 원활하게 함
- 여름·겨울 계절 선물, 결혼·입학·졸업·출산 축하 선물
- 비싸지 않으면서 실용적인 것, 포장에 정성
- 「ほんの気持ちですが」 등 겸손한 표현과 함께 전달
- 답례: 보통 받은 선물의 1/3~절반 정도의 금액
h:선물의 명칭
tb!:명칭|용도|선물 내용
tb:プレゼント|생일·크리스마스|화장품·장신구·지갑
tb:おみやげ|출장·여행지에서|지역 특산품·과자·차
tb:てみやげ|남의 집 방문|과자·차
tb:おかえし|받은 선물의 답례|과자·음료·상품권
- 최근 카탈로그를 보내 받는 사람이 직접 고르게 하기도
h:피해야 할 선물
pic:taboo|이런 선물은 피한다
tb!:상황|피할 물건|이유
tb:결혼 축하|칼·가위 / 도자기·유리|인연을 끊음 / 깨짐
tb:집들이|라이터·초·재떨이·붉은 꽃|화재 연상
tb:병문안|화분 / 흰 국화 / 붉은 꽃|根付く=寝付く / 죽음 / 피
tb:상사·손윗사람|신발·양말·슬리퍼|밟는다는 의미
tag:비교|한국 집들이: 휴지·세제 ↔ 일본 집들이: 불과 관련된 물건 금지
tag:시험|답례 = おかえし / 방문 선물 = てみやげ
sz:flower`,
계절선물_오추겐_오세이보: `t:계절 선물 (お中元・お歳暮)|4과 일본인의 예절
tag:정의|평소 신세 진 사람·상사에게 감사를 담아 보내는 계절 선물
pic:chugen|여름 오추겐 / 연말 오세이보
tb!:구분|시기|인기 상품
tb:お中元|7월 중순 무렵|소면·젤리·장어·아이스크림
tb:お歳暮|연말 (12월)|고기·게·햄·과자·차
- 둘 다 보내는 경우가 많고, 한 번만 보낸다면 お歳暮
- 예전: 직접 방문해서 전달 → 최근: 백화점·택배로 보냄
tag:비교|한국의 설·추석 명절 선물 세트와 비슷한 역할
tag:시험|7월 중순 계절 선물 = お中元`,
교복_변화_다양성: `t:교복 (制服)|5과 학교생활
pic:uniform|교복의 변화
- 대부분의 고등학생이 교복을 입음
- 과거: 남학생 학생복 (가쿠란), 여학생 세일러복이 일반적
- 1980년대 무렵부터 남녀 모두 재킷형 교복 증가
- 최근 교복 관련 교칙 완화, 학생이 직접 결정하게 하는 학교도 있음
  - 여학생 치마·바지 선택, 남녀 공용 교복 → 학생의 다양성 존중
tag:비교|한국도 교복을 입고, 생활복·체육복 등교를 허용하는 흐름이 비슷함
tag:시험|"교복을 입지 않는 학교가 더 많다" → X
sz:yuna`,
고교생의하루_시간표: `t:일본 고등학생의 하루|5과 학교생활
pic:day|시간대별 일과
tb!:시간|일과|특징
tb:8:00~8:30|등교|자전거 통학이 많음 → 넓은 자전거 주차장
tb:12:10|점심|교실 도시락·학교 식당·급식 / 매점에서 간식·학용품
tb:3:40|청소|청소도 학습의 일환, 당번을 정해 학생이 직접
tb:4:00|동아리|방과 후 대다수 학생이 동아리 활동
tb:7:00|학원|과목별이 아니라 한 곳에서 여러 과목
- 학교에 따라 일과 시간은 차이가 있음
tag:비교|한국: 야간 자율 학습·과목별 학원 ↔ 일본: 동아리 중심의 방과 후
tag:시험|수업 전이나 주말에도 동아리 활동 ○`,
부카츠_교사지도_운동부특징: `t:동아리 활동 (部活)|5과 학교생활
tag:정의|학년과 관계없이 관심 분야를 골라 활동하는 학교 동아리
pic:club|운동부와 문화부
h:운동부 (運動部)
- 운동의 교육적 가치를 높게 평가 → 체력 + 재능 발견·진로 탐색
- 이 학생들이 프로 선수가 되기도 함
- 보통 주 3~5회, 자발적 참여, 담당 교사 지도
- 수업 시작 전 아침이나 주말에도 활동
tag:비교|한국: 어릴 때부터 스포츠 특기생을 따로 육성 ↔ 일본: 학교 동아리에서 선수 배출
h:문화부 (文化部)
- 관악·서예·다도·경기 가루타·고토(箏)·도예·오케스트라 등 세분화
- 원하는 동아리가 없으면 부원을 모아 담당 교사를 섭외해 새로 개설
- 활동하지 않고 바로 귀가하는 학생 = 귀가부 (帰宅部)
pic:karuta|경기 가루타
- 시가 카드를 읽으면 해당 카드를 빨리 쳐냄, 자기 카드를 먼저 다 없애면 승리
h:전국 대회
tb!:구분|대회|시기
tb:운동부|인터하이 (전국 고교 종합 체육 대회)|7~8월
tb:문화부|전국 고교 종합 문화제|7월 말~8월 초
- 3학년은 전국 대회가 끝나면 동아리를 그만두고 입시 공부에 집중
tag:특징|교사 업무 부담·학업 소홀 우려 ↔ 선후배 관계·평생 이어지는 취미
tag:시험|동아리 = ぶかつ / 귀가부 = きたくぶ / 운동부 → 인터하이`,
고시엔_야구대회: `t:고시엔 (甲子園)|5과 학교생활
tag:정의|전국 고등학교 야구 선수권 대회
pic:koshien|고시엔 구장과 토너먼트
- 100년 이상의 역사, 거의 모든 경기가 TV로 생중계될 만큼 인기
- 매년 8월 개최 (봄과 여름 두 번 열림)
- 지역 예선에 약 3,000개가 넘는 팀 → 우승한 팀만 출전
- 토너먼트 방식 → 한 번 지면 탈락
- 진 팀 선수들은 다시 돌아오겠다는 다짐으로 구장의 흙을 담아 감
tag:비교|한국 고교 야구 대회보다 국민적인 관심이 매우 큼
tag:시험|전국 고교 야구 선수권 대회 = 고시엔
sz:sun`,
연하장_인사말_앞면세로쓰기: `t:연하장 (年賀状)|6과 연중행사
tag:정의|새해 인사를 담아 보내는 엽서, 100년이 넘는 관습
pic:nenga|연하장 앞면 (세로쓰기)
- 우체국 연하 엽서: 1949년 시작, 추첨 번호 (복권) → 1월 중순 추첨
- 12/15~25에 넣으면 1월 1일에 배달
- 최근 메일·문자로 대신하는 사람도 증가
box:앞면 쓰는 법
- ① 받는 사람 우편번호 ② 받는 사람 주소 ③ 받는 사람 이름
- ④ 보내는 사람 주소·이름·우편번호 → 주소는 세로쓰기
/box
h:연하장 인사말
tb:あけまして おめでとうございます|새해 복 많이 받으세요
tb:昨年は たいへん お世話に なりました|작년에는 신세 많이 졌습니다
tb:よい一年に なりますように|좋은 한 해가 되기를
tb:今年も どうぞ よろしく おねがいします|올해도 잘 부탁드립니다
tag:주의|よいおとしを (좋은 해 맞이하세요)는 연말 인사 → 연하장에 쓰지 않음`,
설음식_오세치재료뜻_오조니_나나쿠사가유: `t:설날 음식 (お正月料理)|6과 연말연시와 공휴일
tag:정의|오세치 요리 = 설날에 먹는 찬합 요리 (복이 겹친다는 의미)
pic:osechi|오세치 요리와 재료의 의미
tb!:재료|의미
tb:새우|장수
tb:밤조림|풍작
tb:긴톤|금전운
tb:검은콩|건강·근면
tb:홍백 어묵|축하
tb:청어알|자손 번영
tb:다시마|좋은 운 (よろこぶ)
- 새해 3일 동안 요리를 하지 않으려고 연말에 미리 준비
- 최근 백화점·호텔·레스토랑에서 사 먹는 사람도 많음
h:오조니 (お雑煮) = 일본식 떡국
tb!:지역|떡|국물
tb:간토|네모 모양 (구워서)|맑은 장국
tb:간사이|둥근 모양|미소 된장
h:나나쿠사가유 (七草がゆ)
- 1월 7일 아침, 가족의 건강을 기원하며 7가지 봄나물로 만든 죽
tag:비교|한국: 설날 떡국 ↔ 일본: 오세치 + 오조니 + 1월 7일 나나쿠사가유
tag:시험|"오세치 = 1월 7일 건강 기원 음식" → X`,
설장식_가도마쓰_시메카자리_가가미모치: `t:연말연시 (年末年始)|6과 연말연시와 공휴일
h:연말
- 관공서·기업은 보통 12월 28일까지 업무 → 연말연시 연휴
- 대청소·설 장식·설 음식 준비 → 새해의 신 도시가미사마 (年神様) 맞이
- 크리스마스가 지나면 트리 대신 설 장식
tag:정의|도시가미사마 = 한 해의 풍작을 관장하고 행복과 건강을 가져다주는 신
h:오미소카 (大みそか, 12월 31일)
- 가족이 함께 '홍백가합전' 시청
- 도시코시소바 (年越しそば): 가늘고 긴 면 = 장수, 잘 끊어짐 = 나쁜 일을 끊어 냄
- 제야의 종 108번 (인간의 108가지 번뇌)
tag:비교|제야의 종: 한국 33번 ↔ 일본 108번
h:설날 (お正月)
- 하쓰모데 (初詣): 신사·절에서 건강·행운 기원, 오미쿠지로 한 해 운세
- 오토시다마 (お年玉): 아이들이 세뱃돈을 받음
tag:비교|한국: 세배를 하고 세뱃돈 ↔ 일본: 세배 없이 받음
h:설 장식
pic:shogatsu|가도마쓰 · 시메카자리 · 가가미모치
tb!:장식|위치|의미
tb:門松 (가도마쓰)|대문 옆·현관 입구|신이 찾아오는 표시
tb:しめかざり|현관|무병장수, 신이 깃듦
tb:鏡餅 (가가미모치)|집 안|둥근 거울 모양의 찹쌀떡
tag:시험|대문 옆 설 장식 = 가도마쓰 / 섣달그믐 밤 = 도시코시소바`,
하쓰모데_대화단어_배열문장: `t:생활 속 일본어: 하쓰모데|6과 언어문화
pic:hatsumode|렌의 가족이 하쓰모데 가는 길에 선생님을 만남
- 先生、あけまして おめでとうございます。
- れんが いつも お世話に なって おります。
- いいえ、こちらこそ。れん君は いつも いっしょうけんめい 練習して いますよ。
- 次の 大会も がんばろうね。 → はい、がんばります。
- 今年も よろしく おねがいします。
h:단어 정리
tb!:단어|뜻
tb:ご〜|존경의 접두어
tb:〜部|〜부
tb:お世話に なる|신세를 지다
tb:いっしょうけんめい|열심히
tb:練習|연습
tb:次 / 大会|다음 / 대회
tb:がんばる|힘내다, 열심히 하다
tb:今年|올해
tag:시험|배열: れんが → いつも → お世話に → なって → おります`,
해피먼데이_4대공휴일: `t:성인의 날 (成人の日)|6과 주요 연중행사
pic:seijin|성인의 날: 후리소데
- 원래 1월 15일 → 해피먼데이법 (2000년~)으로 1월 둘째 월요일
tag:정의|해피먼데이 제도 = 일부 공휴일을 월요일로 옮겨 3일 연휴를 만드는 것
tb!:공휴일|날짜
tb:성인의 날|1월 둘째 월요일
tb:바다의 날|7월 셋째 월요일
tb:경로의 날|9월 셋째 월요일
tb:스포츠의 날|10월 둘째 월요일
- 2022년 4월부터 성인 기준 20세 → 18세 (지방 자치 단체 행사는 지금도 20세가 많음)
- 남자: 주로 정장 / 여자: 소매가 긴 기모노 후리소데 (비싸서 대여)
tag:비교|한국 성년의 날: 5월 셋째 월요일, 만 19세
tag:시험|성인 기준 20세 → 18세 ○`,
월별공휴일_어머니아버지의날_총정리: `t:어린이를 위한 행사|6과 주요 연중행사
h:히나마쓰리 (3월 3일)
tag:정의|여자아이의 성장과 행복을 기원하는 날 = 모모노셋쿠 (桃の節句)
pic:hina|히나단 (1단 왕·왕비 / 2단 궁녀 / 3단 악사)
- 히나단: 보통 3단·5단·7단, 공간 때문에 1단만 장식하기도
- 음식: 히나아라레 (쌀과자)·히시모치 (떡)·지라시즈시 (초밥)
h:단고노셋쿠 (5월 5일)
tag:정의|남자아이가 튼튼하게 자라고 성공하길 기원 → 지금은 어린이날 (남녀 구별 없음)
pic:koi|고이노보리
- 무사 인형 장식, 집 밖에 고이노보리 (잉어 깃발)
  - 잉어가 폭포를 거슬러 올라 용이 됨 = 입신출세
- 음식: 가시와모치 (떡갈나무 잎 → 자손 번영)·지마키
h:시치고산 (11월 15일)
- 남자아이 3·5세, 여자아이 3·7세에 신사에서 감사·기원
- 지토세아메 (千歳飴): 장수를 기원하는 홍백색의 긴 엿
h:어머니의 날·아버지의 날
- 어머니의 날 5월 둘째 일요일 / 아버지의 날 6월 셋째 일요일
tag:비교|한국: 5월 8일 어버이날 하루 ↔ 일본: 어머니·아버지의 날이 따로
tag:시험|히나마쓰리 = 모모노셋쿠 / 5월 5일 집 밖 장식 = 고이노보리`,
연간행사_공휴일: `t:연간 행사와 공휴일|6과 연말연시와 공휴일
pic:calendar|월별 주요 행사
tb!:월|전통·현대 행사|공휴일
tb:1|설날|설날, 성인의 날 (둘째 월)
tb:2|세쓰분 (3일경), 밸런타인데이|건국 기념일 (11), 일왕 생일 (23)
tb:3|히나마쓰리, 화이트데이|춘분의 날 (21일경)
tb:4|하나미 (꽃구경)|쇼와의 날 (29)
tb:5|단고노셋쿠, 어머니의 날|헌법 기념일·녹색의 날·어린이날
tb:6|아버지의 날|없음
tb:7|다나바타 (7)|바다의 날 (셋째 월)
tb:8|오봉 (15일경)|산의 날 (11)
tb:9|쓰키미 (음력 8/15)|경로의 날 (셋째 월), 추분의 날
tb:10|핼러윈|스포츠의 날 (둘째 월)
tb:11|시치고산 (15)|문화의 날 (3), 근로 감사의 날 (23)
tb:12|크리스마스, 오미소카|없음
tag:특징|공휴일이 일요일이면 다음 날 쉼 / 4월 29일~5월 5일 = 골든위크
h:세쓰분 (2월 3일경)
pic:setsubun|마메마키
- 계절이 바뀌는 전날 → 잡귀를 쫓아 한 해의 액운을 떨침
- 「鬼は外、福は内」 콩 뿌리기, 나이만큼 콩 먹기, 에호마키
h:다나바타 (7월 7일)
- 견우·직녀 전설 → 오색 종이 단자쿠에 소원을 적어 대나무에 매닮
- 센다이 다나바타 마쓰리 (8월 6~8일)가 유명
h:오봉 (8월 13~16일 무렵)
pic:obon|오이 말과 가지 소
- 조상의 영혼이 집으로 돌아오는 날, 공식 공휴일은 아니지만 휴가를 내고 귀성·성묘
- 본오도리 춤, 오이 = 말 (빨리 오시길) / 가지 = 소 (천천히 가시길)
tag:비교|한국의 추석과 비슷하지만 공휴일이 아님
tag:시험|오봉: 공휴일 X, 휴가 내고 성묘 ○`
};
const TITLE = k => (N[k] || '').split('\n')[0].replace(/^t:/, '').split('|')[0];

/* ── 펜 도구: 유나 = 깔끔(살짝 떨림), 스즈 = 크레용(많이 떨리고 선이 안 만남) ── */
function pen(g, seed, j, crayon) { const r = rnd(seed); const J = () => (r() - .5) * j;
  const path = (pts, close) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); };
  const P = {
    ln(pts, col = INK, w = 3) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; path(pts); g.stroke(); if (crayon) { g.globalAlpha = .45; path(pts.map(([x, y]) => [x + 2, y + 1.5])); g.stroke(); g.globalAlpha = 1; } },
    shape(pts, fill, col = INK, w = 3) { if (fill) { g.fillStyle = fill; path(pts, true); g.fill(); } if (col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; path(crayon ? pts.slice(0, -1) : pts, !crayon); g.stroke(); } },
    ell(x, y, rx, ry, fill, col = INK, w = 3, open = 0) { const n = 18, pts = []; for (let i = 0; i <= n - (crayon ? 2 : 0) - open; i++) { const a = i / n * 6.2832; pts.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); } P.shape(pts, fill, col, w); },
    box(x, y, w, h, fill, col = INK, lw = 3) { P.shape([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, col, lw); },
    tx(s, x, y, size = 22, col = INK, bold = true, align = 'left', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${bold ? 700 : 400} ${size}px ${FONT}`; g.fillStyle = col; g.textAlign = align; g.fillText(s, 0, 0); g.restore(); },
    shaky(s, x, y, size = 30, col = '#ff6a9a') { [...s].forEach((c, i) => P.tx(c, x + i * size * .9 + J() * 2, y + J() * 3, size + J() * 4, col, true, 'left', J() * .08)); },
    arrow(x1, y1, x2, y2, col = INK, w = 3) { P.ln([[x1, y1], [x2, y2]], col, w); const a = Math.atan2(y2 - y1, x2 - x1), L = 11; P.ln([[x2 - Math.cos(a - .5) * L, y2 - Math.sin(a - .5) * L], [x2, y2], [x2 - Math.cos(a + .5) * L, y2 - Math.sin(a + .5) * L]], col, w); },
    person(x, y, s = 1, col = '#5a7ab8', hair = '#3a2a22', lean = 0) { const hx = x + Math.sin(lean) * 34 * s, hy = y - Math.cos(lean) * 34 * s;
      P.ln([[x, y], [hx, hy]], col, 7 * s); P.ln([[x, y], [x - 9 * s, y + 34 * s]], INK, 4 * s); P.ln([[x, y], [x + 9 * s, y + 34 * s]], INK, 4 * s);
      P.ln([[x + Math.sin(lean) * 22 * s, y - Math.cos(lean) * 22 * s], [x + Math.sin(lean) * 22 * s + 6 * s, y - Math.cos(lean) * 22 * s + 18 * s]], col, 4 * s);
      const fx = hx + Math.sin(lean) * 13 * s, fy = hy - Math.cos(lean) * 13 * s; P.ell(fx, fy, 12 * s, 12 * s, '#ffe2cc', INK, 2.5 * s); P.ell(fx, fy - 6 * s, 12 * s, 6 * s, hair, null); }
  }; return P; }

/* ── 유나 그림 (개념 설명) ── */
const PIC = {
  family(D, x, y) { D.tx('막내 기준 →', x, y + 16, 19, BLUE); D.person(x + 150, y + 90, 1.25, '#e0708a', '#5a3a2a'); D.person(x + 230, y + 98, 1, '#f0a030', '#2a2a2a'); D.person(x + 290, y + 108, .7, '#70b0e0', '#2a2a2a');
    D.box(x + 110, y + 4, 140, 34, '#fff', INK, 2); D.tx('おねえちゃん!', x + 118, y + 28, 19, RED); D.ln([[x + 160, y + 38], [x + 160, y + 52]], INK, 2);
    D.tx('엄마', x + 132, y + 156, 17, INK, false); D.tx('스즈', x + 218, y + 156, 17, INK, false); D.tx('하나 (막내)', x + 268, y + 156, 17, RED, false); D.arrow(x + 285, y + 40, x + 240, y + 52, RED, 2); D.tx('막내가 부르는 호칭', x + 255, y + 30, 15, RED, false); },
  surname(D, x, y) { const cell = (cx, lab, mean, draw) => { draw(cx); D.tx(lab, cx + 10, y + 150, 30, INK); D.tx(mean, cx + 2, y + 172, 16, BLUE, false); };
    cell(x, '山下', '산 아래', cx => { D.shape([[cx + 6, y + 110], [cx + 55, y + 14], [cx + 104, y + 110]], '#9ccf8a', INK, 3); D.box(cx + 38, y + 98, 30, 22, '#ffd9a0', INK, 2.5); D.shape([[cx + 34, y + 98], [cx + 53, y + 84], [cx + 72, y + 98]], '#d0603a', INK, 2.5); });
    cell(x + 140, '小川', '작은 강', cx => { for (let i = 0; i < 3; i++) D.ln([[cx, y + 60 + i * 14], [cx + 30, y + 50 + i * 14], [cx + 60, y + 66 + i * 14], [cx + 100, y + 54 + i * 14]], '#5aa0e0', 4); });
    cell(x + 280, '田中', '논 가운데', cx => { D.box(cx + 4, y + 30, 100, 80, '#e8e0a0', INK, 2.5); D.ln([[cx + 54, y + 30], [cx + 54, y + 110]], INK, 2); D.ln([[cx + 4, y + 70], [cx + 104, y + 70]], INK, 2); D.ell(cx + 54, y + 70, 9, 9, RED, INK, 2); }); },
  meishi(D, x, y) { D.person(x + 70, y + 118, 1.4, '#3a4a6a', '#2a2a2a', .25); D.person(x + 330, y + 118, 1.4, '#6a4a3a', '#5a3a2a', -.25);
    D.box(x + 160, y + 52, 90, 52, '#fff', INK, 3); D.tx('山下 武', x + 172, y + 84, 22, INK); D.ln([[x + 140, y + 78], [x + 160, y + 70]], '#ffe2cc', 9); D.ln([[x + 140, y + 92], [x + 160, y + 96]], '#ffe2cc', 9);
    D.tx('양손으로', x + 160, y + 30, 20, RED); D.tx('상대 쪽으로 글자 방향', x + 140, y + 140, 17, BLUE, false); D.arrow(x + 250, y + 78, x + 290, y + 78, BLUE, 2); },
  genkan(D, x, y) { D.box(x, y + 120, 200, 30, '#c8c0b0', INK, 2.5); D.box(x + 200, y + 92, 210, 58, '#d8b088', INK, 2.5); D.tx('마루', x + 300, y + 128, 18, INK, false); D.tx('현관 (돌바닥)', x + 30, y + 145, 16, INK, false);
    D.box(x + 2, y + 10, 40, 110, '#e8eef4', INK, 2.5); D.tx('문', x + 10, y + 70, 18, INK, false);
    for (const dx of [0, 34]) D.shape([[x + 120 + dx, y + 104], [x + 150 + dx, y + 98], [x + 152 + dx, y + 112], [x + 120 + dx, y + 116]], '#5a4a8a', INK, 2.5);
    D.arrow(x + 150, y + 80, x + 70, y + 80, RED, 3); D.tx('신발 코 → 문 쪽', x + 70, y + 66, 20, RED); D.person(x + 290, y + 56, 1.1, '#e0708a', '#2a2a2a'); D.tx('외투는 밖에서 벗어 손에', x + 220, y + 20, 16, BLUE, false); },
  bow(D, x, y) { [[15, x + 40], [30, x + 175], [45, x + 310]].forEach(([deg, cx]) => { const a = deg * Math.PI / 180; D.ln([[cx, y + 140], [cx, y + 100]], INK, 4); D.person(cx, y + 100, 1.1, '#5a7ab8', '#2a2a2a', a);
    D.ln([[cx, y + 100], [cx, y + 40]], '#bbb', 1.5); D.ln([[cx, y + 70], [cx + Math.sin(a) * 30, y + 100 - Math.cos(a) * 30]], RED, 2); D.tx(deg + '°', cx + 20, y + 52, 24, RED);
    D.tx(['가볍게', '첫 대면', '사죄'][[15, 30, 45].indexOf(deg)], cx - 22, y + 165, 18, BLUE, false); }); },
  greet(D, x, y) { D.ln([[x, y + 80], [x + 410, y + 80]], INK, 3); [['おはよう', '아침', '#ffb040', 0], ['こんにちは', '낮', '#ffd23f', 1], ['こんばんは', '저녁', '#5a6ab8', 2]].forEach(([w, t, c, i]) => { const cx = x + 60 + i * 140;
    if (i < 2) { D.ell(cx, y + 40, 18, 18, c, INK, 2.5); for (let k = 0; k < 8; k++) { const a = k * .785; D.ln([[cx + Math.cos(a) * 24, y + 40 + Math.sin(a) * 24], [cx + Math.cos(a) * 32, y + 40 + Math.sin(a) * 32]], c, 3); } } else D.shape([[cx - 4, y + 22], [cx + 14, y + 30], [cx + 16, y + 48], [cx - 4, y + 58], [cx + 6, y + 40]], '#ffe680', INK, 2.5);
    D.ln([[cx, y + 72], [cx, y + 88]], INK, 3); D.tx(w, cx - 46, y + 116, 21, INK); D.tx(t, cx - 12, y + 140, 17, BLUE, false); }); },
  taboo(D, x, y) { const X = (cx, cy) => { D.ln([[cx - 26, cy - 26], [cx + 26, cy + 26]], RED, 5); D.ln([[cx + 26, cy - 26], [cx - 26, cy + 26]], RED, 5); };
    D.box(x + 10, y + 70, 50, 40, '#c8784a', INK, 2.5); for (let i = 0; i < 4; i++) D.ln([[x + 35, y + 70], [x + 18 + i * 12, y + 30]], '#4a9a3a', 4); X(x + 35, y + 70); D.tx('화분', x + 16, y + 140, 18, INK); D.tx('=앓아누움', x + 4, y + 160, 15, RED, false);
    D.ell(x + 140, y + 60, 24, 24, '#fff', INK, 2.5); D.ln([[x + 140, y + 84], [x + 140, y + 120]], '#4a9a3a', 4); X(x + 140, y + 70); D.tx('흰 국화', x + 110, y + 140, 18, INK);
    D.ln([[x + 220, y + 40], [x + 270, y + 110]], '#888', 5); D.ln([[x + 270, y + 40], [x + 220, y + 110]], '#888', 5); D.ell(x + 222, y + 115, 10, 10, null, INK, 3); D.ell(x + 268, y + 115, 10, 10, null, INK, 3); D.tx('가위', x + 228, y + 150, 18, INK); D.tx('결혼', x + 228, y + 170, 15, RED, false);
    D.shape([[x + 320, y + 100], [x + 360, y + 70], [x + 400, y + 80], [x + 405, y + 105], [x + 320, y + 110]], '#d8a8b8', INK, 2.5); X(x + 360, y + 90); D.tx('슬리퍼', x + 330, y + 140, 18, INK); D.tx('상사', x + 340, y + 160, 15, RED, false); },
  chugen(D, x, y) { const cal = (cx, m, c) => { D.box(cx, y + 10, 120, 110, '#fff', INK, 2.5); D.box(cx, y + 10, 120, 30, c, INK, 2.5); D.tx(m, cx + 30, y + 34, 22, '#fff'); for (let i = 0; i < 12; i++) D.box(cx + 8 + (i % 4) * 27, y + 50 + Math.floor(i / 4) * 22, 20, 15, null, '#bbb', 1); };
    cal(x, '7월', '#4ab0d8'); cal(x + 220, '12월', '#d0303a'); D.tx('お中元', x + 20, y + 150, 26, INK); D.tx('お歳暮', x + 240, y + 150, 26, INK);
    for (let i = 0; i < 4; i++) D.ln([[x + 130 + i * 6, y + 70], [x + 130 + i * 6, y + 110]], '#f2ece0', 4); D.tx('소면', x + 128, y + 128, 15, BLUE, false); D.ell(x + 370, y + 80, 22, 14, '#ff7a5a', INK, 2.5); D.tx('게', x + 362, y + 120, 15, BLUE, false); },
  uniform(D, x, y) { const body = (cx, col, kind) => { D.ell(cx, y + 26, 18, 18, '#ffe2cc', INK, 2.5); D.shape([[cx - 32, y + 50], [cx + 32, y + 50], [cx + 38, y + 140], [cx - 38, y + 140]], col, INK, 2.5);
      if (kind === 'gaku') { D.box(cx - 10, y + 44, 20, 12, col, INK, 2); for (let i = 0; i < 4; i++) D.ell(cx, y + 66 + i * 18, 3, 3, '#e0c040', null); }
      if (kind === 'sailor') { D.shape([[cx - 32, y + 50], [cx, y + 84], [cx + 32, y + 50], [cx + 40, y + 70], [cx - 40, y + 70]], '#2a3a6a', INK, 2); D.shape([[cx - 8, y + 80], [cx + 8, y + 80], [cx, y + 104]], RED, INK, 2); }
      if (kind === 'blazer') { D.ln([[cx - 14, y + 50], [cx, y + 92], [cx + 14, y + 50]], INK, 2.5); D.shape([[cx - 5, y + 56], [cx + 5, y + 56], [cx, y + 86]], '#3a6ac8', null); } };
    body(x + 60, '#1a1a22', 'gaku'); body(x + 205, '#f4f4f4', 'sailor'); body(x + 350, '#5a4a7a', 'blazer');
    D.tx('가쿠란', x + 30, y + 168, 19, INK); D.tx('세일러복', x + 168, y + 168, 19, INK); D.tx('재킷형 ↑', x + 312, y + 168, 19, RED); D.arrow(x + 260, y + 100, x + 300, y + 100, BLUE, 2); D.tx('1980~', x + 262, y + 92, 15, BLUE, false); },
  day(D, x, y) { D.ln([[x + 10, y + 70], [x + 410, y + 70]], INK, 3); [['8:00', '등교'], ['12:10', '점심'], ['3:40', '청소'], ['4:00', '동아리'], ['7:00', '학원']].forEach(([t, w], i) => { const cx = x + 30 + i * 90; D.ell(cx, y + 70, 7, 7, ['#ffb040', '#ff8fb0', '#5aa0e0', '#4a9a3a', '#7a5ab8'][i], INK, 2); D.tx(t, cx - 20, y + 50, 18, INK); D.tx(w, cx - 18, y + 100, 18, BLUE, false); });
    D.ell(x + 30, y + 138, 12, 12, null, INK, 2.5); D.ell(x + 62, y + 138, 12, 12, null, INK, 2.5); D.ln([[x + 30, y + 138], [x + 46, y + 122], [x + 62, y + 138]], INK, 2.5); D.box(x + 108, y + 124, 44, 28, '#e8a040', INK, 2.5); D.ln([[x + 210, y + 116], [x + 196, y + 150]], '#a87850', 4); D.shape([[x + 186, y + 146], [x + 206, y + 146], [x + 200, y + 160], [x + 190, y + 160]], '#e8d090', INK, 2); D.ell(x + 300, y + 138, 14, 14, '#fff', INK, 2.5); D.box(x + 378, y + 124, 34, 28, '#5aa0e0', INK, 2.5); },
  club(D, x, y) { D.box(x, y + 6, 190, 130, null, BLUE, 2); D.box(x + 220, y + 6, 190, 130, null, BLUE, 2); D.tx('운동부', x + 60, y + 34, 24, BLUE); D.tx('문화부', x + 280, y + 34, 24, BLUE);
    D.ell(x + 50, y + 88, 22, 22, '#fff', INK, 2.5); D.ln([[x + 30, y + 80], [x + 70, y + 96]], INK, 2); D.ln([[x + 110, y + 110], [x + 150, y + 60]], '#a87850', 6); D.ell(x + 152, y + 58, 6, 6, '#a87850', null);
    D.ln([[x + 250, y + 110], [x + 280, y + 60]], '#5a3a2a', 5); D.shape([[x + 280, y + 60], [x + 288, y + 48], [x + 290, y + 64]], INK, null); D.box(x + 320, y + 70, 30, 42, '#f8f0d8', INK, 2); D.tx('ち', x + 326, y + 98, 20, INK); D.ell(x + 380, y + 92, 18, 12, '#6ab06a', INK, 2);
    D.tx('귀가부 = 활동 없이 바로 귀가', x + 40, y + 166, 18, RED, false); D.shape([[x + 300, y + 170], [x + 320, y + 150], [x + 340, y + 170]], '#d0603a', INK, 2); D.box(x + 305, y + 170, 30, 18, '#ffd9a0', INK, 2); },
  karuta(D, x, y) { for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) D.box(x + 40 + i * 52, y + 10 + r * 56, 40, 48, '#f8f0d8', INK, 2); [['ち', 1, 0], ['せ', 3, 1], ['む', 4, 0]].forEach(([c, i, r]) => D.tx(c, x + 50 + i * 52, y + 42 + r * 56, 24, INK));
    D.shape([[x + 210, y + 140], [x + 250, y + 120], [x + 300, y + 130], [x + 280, y + 150]], '#ffe2cc', INK, 2.5); D.arrow(x + 320, y + 140, x + 380, y + 100, RED, 3); D.tx('먼저 쳐 냄', x + 300, y + 170, 18, RED); D.tx('자기 카드를 먼저 다 없애면 승리', x + 10, y + 170, 15, BLUE, false); },
  koshien(D, x, y) { D.shape([[x + 100, y + 20], [x + 170, y + 90], [x + 100, y + 160], [x + 30, y + 90]], '#c8945a', INK, 2.5); [[100, 20], [170, 90], [100, 160], [30, 90]].forEach(([a, b]) => D.box(x + a - 5, y + b - 5, 10, 10, '#fff', INK, 1.5)); D.tx('甲子園', x + 66, y + 96, 20, '#fff');
    D.shape([[x + 230, y + 90], [x + 290, y + 90], [x + 284, y + 150], [x + 236, y + 150]], '#e8d8b0', INK, 2.5); D.ln([[x + 236, y + 90], [x + 260, y + 80], [x + 284, y + 90]], INK, 2.5); D.ell(x + 260, y + 120, 12, 8, '#8a5a3a', null); D.tx('구장의 흙', x + 232, y + 172, 16, RED, false);
    D.ln([[x + 320, y + 30], [x + 350, y + 30], [x + 350, y + 60], [x + 380, y + 60]], INK, 2); D.ln([[x + 320, y + 90], [x + 350, y + 90], [x + 350, y + 60]], INK, 2); D.tx('토너먼트', x + 318, y + 120, 18, BLUE); D.tx('지면 탈락', x + 326, y + 140, 15, RED, false); },
  nenga(D, x, y) { D.box(x + 20, y, 120, 170, '#fff', INK, 2.5); for (let i = 0; i < 7; i++) D.box(x + 62 + i * 11, y + 8, 9, 14, null, RED, 1.5); D.ln([[x + 120, y + 34], [x + 120, y + 140]], INK, 2); D.ln([[x + 100, y + 34], [x + 100, y + 110]], INK, 2); D.tx('様', x + 92, y + 132, 18, INK); D.box(x + 28, y + 70, 24, 24, null, RED, 2); D.tx('年賀', x + 28, y + 88, 11, RED);
    D.tx('① 받는 사람 우편번호', x + 160, y + 30, 16, INK, false); D.tx('② 받는 사람 주소', x + 160, y + 56, 16, INK, false); D.tx('③ 받는 사람 이름', x + 160, y + 82, 16, INK, false); D.tx('④ 보내는 사람', x + 160, y + 108, 16, INK, false); D.tx('→ 주소는 세로쓰기', x + 160, y + 144, 20, RED); },
  osechi(D, x, y) { D.box(x + 20, y + 4, 168, 168, '#2a1a1a', INK, 3); D.box(x + 26, y + 10, 156, 156, '#c83a2a', null); for (let i = 1; i < 3; i++) { D.ln([[x + 26 + i * 52, y + 10], [x + 26 + i * 52, y + 166]], '#2a1a1a', 3); D.ln([[x + 26, y + 10 + i * 52], [x + 182, y + 10 + i * 52]], '#2a1a1a', 3); }
    D.shape([[x + 36, y + 50], [x + 60, y + 24], [x + 70, y + 40], [x + 50, y + 54]], '#ff7a5a', INK, 2); for (let i = 0; i < 6; i++) D.ell(x + 98 + (i % 3) * 10, y + 30 + Math.floor(i / 3) * 12, 5, 5, '#1a1a1a', null); D.ell(x + 154, y + 36, 14, 12, '#f0c040', INK, 2); D.ell(x + 52, y + 88, 16, 10, '#f8d040', INK, 2); D.box(x + 88, y + 80, 32, 14, '#fff', INK, 1.5); D.box(x + 88, y + 80, 32, 7, '#ff8fb0', null); D.ell(x + 154, y + 88, 14, 9, '#e8c060', INK, 2); D.ln([[x + 38, y + 140], [x + 70, y + 132]], '#3a5a3a', 6); D.ell(x + 104, y + 140, 13, 13, '#a87850', INK, 2);
    D.tx('찬합 = 복이 겹침', x + 210, y + 40, 18, BLUE); D.tx('새해 3일 동안 먹음', x + 210, y + 70, 16, INK, false); D.tx('연말에 미리 준비', x + 210, y + 96, 16, INK, false); },
  shogatsu(D, x, y) { for (let i = 0; i < 3; i++) { const h = [90, 120, 104][i], cx = x + 30 + i * 18; D.box(cx, y + 150 - h, 16, h, '#7ab06a', INK, 2); D.shape([[cx, y + 150 - h], [cx + 16, y + 150 - h + 10], [cx + 16, y + 150 - h]], '#e8f0d0', INK, 1.5); }
    D.box(x + 18, y + 120, 74, 40, '#c8a870', INK, 2.5); for (let i = 0; i < 3; i++) D.ell(x + 30 + i * 26, y + 112, 14, 9, '#2e6a3a', null); D.tx('門松', x + 26, y + 182, 20, INK);
    D.ell(x + 200, y + 70, 40, 40, null, '#c8a860', 7); D.shape([[x + 186, y + 100], [x + 200, y + 150], [x + 214, y + 100]], '#fff', INK, 2); D.ell(x + 200, y + 70, 8, 8, '#ff8a2a', null); D.tx('しめかざり', x + 152, y + 182, 20, INK);
    D.box(x + 290, y + 130, 100, 20, '#c8a870', INK, 2.5); D.ell(x + 340, y + 118, 44, 18, '#fbf8f0', INK, 2.5); D.ell(x + 340, y + 92, 34, 15, '#fbf8f0', INK, 2.5); D.ell(x + 340, y + 70, 12, 11, '#ff9a2a', INK, 2); D.tx('鏡餅', x + 318, y + 182, 20, INK); },
  hatsumode(D, x, y) { D.ln([[x + 20, y + 160], [x + 20, y + 40]], RED, 8); D.ln([[x + 120, y + 160], [x + 120, y + 40]], RED, 8); D.ln([[x, y + 36], [x + 140, y + 36]], INK, 9); D.ln([[x + 10, y + 56], [x + 130, y + 56]], RED, 6);
    D.person(x + 200, y + 140, 1.1, '#3a4a6a', '#2a2a2a', .3); D.person(x + 270, y + 140, 1.1, '#5a5a5a', '#4a4a4a', -.05); D.person(x + 320, y + 140, 1, '#a83a5a', '#2a2a2a'); D.person(x + 362, y + 146, .9, '#3a6a4a', '#2a2a2a', .3);
    D.tx('선생님', x + 178, y + 182, 15, INK, false); D.tx('렌 아빠·엄마', x + 258, y + 182, 15, INK, false); D.tx('렌', x + 356, y + 182, 15, INK, false); },
  seijin(D, x, y) { D.ell(x + 80, y + 30, 18, 18, '#ffe2cc', INK, 2.5); D.shape([[x + 52, y + 50], [x + 108, y + 50], [x + 122, y + 160], [x + 38, y + 160]], '#d0305a', INK, 2.5); D.shape([[x + 52, y + 56], [x + 20, y + 140], [x + 46, y + 140]], '#d0305a', INK, 2); D.shape([[x + 108, y + 56], [x + 140, y + 140], [x + 114, y + 140]], '#d0305a', INK, 2); D.box(x + 50, y + 92, 60, 14, '#f0c040', INK, 2);
    D.tx('후리소데', x + 40, y + 186, 19, INK); D.tx('20세', x + 200, y + 80, 40, '#999'); D.ln([[x + 196, y + 64], [x + 280, y + 70]], RED, 4); D.arrow(x + 286, y + 70, x + 316, y + 70, RED, 3); D.tx('18세', x + 324, y + 82, 40, RED); D.tx('2022.4~', x + 260, y + 120, 18, BLUE); },
  hina(D, x, y) { for (let i = 0; i < 3; i++) D.box(x + 40 + i * 30, y + 40 + i * 44, 300 - i * 60, 44, '#d0303a', INK, 2.5); const doll = (cx, cy, c) => { D.ell(cx, cy - 14, 8, 8, '#fff6ea', INK, 1.5); D.shape([[cx - 12, cy - 4], [cx + 12, cy - 4], [cx + 14, cy + 18], [cx - 14, cy + 18]], c, INK, 1.5); };
    [[0, 2, ['#2a2a5a', '#d0508a']], [1, 3, ['#fff', '#fff', '#fff']], [2, 5, ['#e8a040', '#e8a040', '#e8a040', '#e8a040', '#e8a040']]].forEach(([row, n, cols]) => { const w = 300 - (2 - row) * 60, x0 = x + 40 + (2 - row) * 30, cy = y + 50 + row * 44; for (let i = 0; i < n; i++) doll(x0 + (i + .5) * w / n, cy, cols[i]); });
    D.tx('1단 왕·왕비', x + 350, y + 64, 15, BLUE, false); D.tx('2단 궁녀 3', x + 350, y + 108, 15, BLUE, false); D.tx('3단 악사 5', x + 350, y + 152, 15, BLUE, false); },
  koi(D, x, y) { D.ln([[x + 40, y + 180], [x + 40, y + 4]], '#a87850', 5); D.ell(x + 40, y + 6, 6, 6, '#f0c040', INK, 2); [['#2a2a3a', 0], ['#d0303a', 1], ['#3a6ac8', 2]].forEach(([c, i]) => { const cy = y + 30 + i * 46, w = 150 - i * 26; D.shape([[x + 44, cy], [x + 44 + w, cy + 6], [x + 44 + w - 16, cy + 18], [x + 44 + w, cy + 30], [x + 44, cy + 34]], c, INK, 2.5); D.ell(x + 60, cy + 14, 6, 6, '#fff', INK, 1.5); });
    D.tx('잉어 → 폭포 → 용', x + 210, y + 60, 20, BLUE); D.tx('= 입신출세', x + 230, y + 90, 22, RED); D.tx('사이타마현 가조시: 길이 100m', x + 200, y + 140, 15, INK, false); },
  calendar(D, x, y) { for (let i = 0; i < 12; i++) { const cx = x + 10 + (i % 6) * 68, cy = y + 4 + Math.floor(i / 6) * 84; D.box(cx, cy, 60, 74, '#fff', INK, 2); D.box(cx, cy, 60, 18, ['#ff8fb0', '#ffd23f', '#9ccf8a', '#5aa0e0'][Math.floor(i / 3)], INK, 2); D.tx(String(i + 1), cx + 22, cy + 15, 15, INK); }
    [[0, '설'], [1, '豆'], [2, 'ひな'], [3, '桜'], [4, '鯉'], [6, '☆'], [7, '盆'], [8, '月'], [10, '753'], [11, '108']].forEach(([i, s]) => D.tx(s, x + 22 + (i % 6) * 68, y + 58 + Math.floor(i / 6) * 84, 18, RED)); },
  setsubun(D, x, y) { D.ell(x + 80, y + 90, 56, 60, '#e04040', INK, 3); D.shape([[x + 44, y + 44], [x + 50, y + 8], [x + 66, y + 40]], '#f0e0a0', INK, 2); D.shape([[x + 116, y + 44], [x + 110, y + 8], [x + 94, y + 40]], '#f0e0a0', INK, 2); D.ell(x + 62, y + 82, 8, 6, '#fff', INK, 2); D.ell(x + 98, y + 82, 8, 6, '#fff', INK, 2); D.ln([[x + 58, y + 116], [x + 70, y + 110], [x + 90, y + 110], [x + 102, y + 116]], INK, 3);
    for (let i = 0; i < 9; i++) D.ell(x + 180 + (i % 5) * 26 + (i > 4 ? 13 : 0), y + 120 + (i > 4 ? -20 : 0), 8, 7, '#d8b070', INK, 1.5); D.arrow(x + 170, y + 80, x + 145, y + 85, RED, 3); D.tx('鬼は外!', x + 190, y + 50, 24, RED); D.tx('福は内!', x + 290, y + 80, 24, BLUE); },
  obon(D, x, y) { D.ell(x + 90, y + 70, 70, 18, '#5aa848', INK, 2.5); for (const dx of [40, 70, 110, 140]) D.ln([[x + dx, y + 82], [x + dx, y + 122]], '#d8c090', 4); D.tx('오이 = 말', x + 50, y + 150, 20, INK); D.tx('빨리 오시길', x + 50, y + 172, 16, RED, false);
    D.ell(x + 300, y + 74, 60, 26, '#6a3a8a', INK, 2.5); D.shape([[x + 240, y + 70], [x + 226, y + 60], [x + 234, y + 80]], '#4a8a3a', INK, 2); for (const dx of [260, 285, 315, 340]) D.ln([[x + dx, y + 96], [x + dx, y + 130]], '#d8c090', 4); D.tx('가지 = 소', x + 260, y + 158, 20, INK); D.tx('천천히 가시길', x + 254, y + 178, 16, BLUE, false); }
};
PIC.karuta2 = PIC.karuta;

/* ── 스즈 낙서 (앞이 안 보여서 선이 안 이어지고 눈이 밖으로 나감. 크레용) ── */
const SZ = {
  cat(D, x, y) { D.ell(x + 70, y + 60, 46, 38, null, '#ff7a9a', 5, 2); D.ln([[x + 34, y + 36], [x + 30, y + 2], [x + 58, y + 24]], '#ff7a9a', 5); D.ln([[x + 92, y + 30], [x + 112, y + 6], [x + 116, y + 40]], '#ff7a9a', 5); D.ell(x + 46, y + 50, 4, 6, '#ff7a9a', null); D.ell(x + 128, y + 44, 4, 6, '#ff7a9a', null); D.ln([[x + 60, y + 78], [x + 72, y + 86], [x + 84, y + 76]], '#ff7a9a', 4); D.ln([[x + 10, y + 66], [x + 40, y + 70]], '#ff7a9a', 3); D.shaky('ねこ', x + 140, y + 92, 26); },
  bell(D, x, y) { D.shape([[x + 40, y + 80], [x + 50, y + 30], [x + 80, y + 18], [x + 108, y + 32], [x + 116, y + 82]], '#ffd23f', '#e89a2a', 5); D.ell(x + 78, y + 92, 9, 9, '#e89a2a', null); D.ln([[x + 78, y + 18], [x + 82, y + 4]], '#e89a2a', 4); D.shaky('すず', x + 130, y + 70, 30, '#e89a2a'); D.ln([[x + 120, y + 30], [x + 134, y + 20]], '#e89a2a', 3); D.ln([[x + 124, y + 44], [x + 142, y + 42]], '#e89a2a', 3); },
  shoes(D, x, y) { D.shape([[x + 20, y + 70], [x + 70, y + 60], [x + 74, y + 84], [x + 18, y + 88]], null, '#7a8aff', 5); D.shape([[x + 86, y + 56], [x + 136, y + 50], [x + 142, y + 74], [x + 84, y + 80]], null, '#7a8aff', 5); D.arrow(x + 150, y + 64, x + 186, y + 30, '#7a8aff', 4); D.shaky('こっち?', x + 160, y + 96, 24, '#7a8aff'); },
  heart(D, x, y) { D.ln([[x + 80, y + 100], [x + 34, y + 54], [x + 40, y + 20], [x + 74, y + 28], [x + 82, y + 46], [x + 96, y + 22], [x + 130, y + 26], [x + 128, y + 58], [x + 92, y + 96]], '#ff5a8a', 6); D.shaky('ユナ', x + 150, y + 72, 30, '#ff5a8a'); },
  flower(D, x, y) { for (let i = 0; i < 5; i++) { const a = i * 1.3; D.ell(x + 70 + Math.cos(a) * 26, y + 46 + Math.sin(a) * 24, 16, 13, null, '#ff9a3a', 5, 3); } D.ell(x + 74, y + 48, 8, 8, '#ffd23f', null); D.ln([[x + 72, y + 74], [x + 64, y + 116]], '#4ac06a', 5); D.ln([[x + 66, y + 100], [x + 44, y + 88]], '#4ac06a', 4); D.shaky('はな', x + 120, y + 100, 26, '#ff9a3a'); },
  yuna(D, x, y) { D.ell(x + 70, y + 54, 34, 36, null, '#ffb02a', 5, 2); for (let i = 0; i < 6; i++) D.ln([[x + 38 + i * 12, y + 22], [x + 34 + i * 13, y - 2]], '#ffd23f', 5); D.ln([[x + 40, y + 40], [x + 20, y + 110]], '#ffd23f', 5); D.ln([[x + 100, y + 40], [x + 120, y + 110]], '#ffd23f', 5);
    D.ell(x + 56, y + 50, 4, 4, '#ffb02a', null); D.ell(x + 96, y + 44, 4, 4, '#ffb02a', null); D.ln([[x + 58, y + 74], [x + 74, y + 80], [x + 90, y + 70]], '#ff5a8a', 4); D.shaky('ユナ', x + 140, y + 60, 30, '#ffb02a'); D.shaky('きれい?', x + 140, y + 100, 22, '#ff8fb0'); },
  mikan(D, x, y) { D.ell(x + 60, y + 62, 40, 36, null, '#ff8a1a', 6, 1); D.ln([[x + 58, y + 26], [x + 66, y + 10], [x + 84, y + 14]], '#4ac06a', 5); D.ell(x + 136, y + 70, 26, 24, null, '#ff8a1a', 5, 2); D.shaky('みかん', x + 170, y + 90, 26, '#ff8a1a'); D.shaky('2こ!', x + 20, y + 128, 22, '#ff8a1a'); },
  karuta(D, x, y) { D.box(x + 30, y + 20, 56, 76, null, '#7a8aff', 5); D.shaky('ち', x + 44, y + 72, 34, '#7a8aff'); D.box(x + 104, y + 30, 56, 76, null, '#7a8aff', 5); D.shaky('せ', x + 116, y + 82, 34, '#7a8aff'); D.shaky('いちばん!', x + 170, y + 70, 24, '#ff5a8a'); },
  sun(D, x, y) { D.ell(x + 70, y + 60, 30, 28, null, '#ff9a1a', 6, 2); for (let i = 0; i < 7; i++) { const a = i * .95; D.ln([[x + 70 + Math.cos(a) * 42, y + 60 + Math.sin(a) * 40], [x + 70 + Math.cos(a) * 60, y + 60 + Math.sin(a) * 58]], '#ff9a1a', 5); } D.shaky('あつい', x + 150, y + 80, 26, '#ff9a1a'); }
};

/* ── 글자 그리기 (형광펜·빨간 펜·밑줄 지원) + 줄바꿈 ── */
function toks(s) { const out = []; const re = /(==|\+\+|%%|\*\*|__)(.+?)\1/g; let i = 0, m; while ((m = re.exec(s))) { if (m.index > i) out.push([s.slice(i, m.index), '']); out.push([m[2], m[1]]); i = m.index + m[0].length; } if (i < s.length) out.push([s.slice(i), '']); return out; }
function layout(g, s, maxW, size) { g.font = `700 ${size}px ${FONT}`; const words = []; toks(s).forEach(([t, st]) => t.split(/(\s+)/).forEach(w => w && words.push([w, st])));
  const lines = [[]]; let x = 0; for (let [w, st] of words) { let wd = g.measureText(w).width; if (x + wd > maxW && x > 0) { if (!w.trim()) continue; lines.push([]); x = 0; }
    while (wd > maxW) { let k = w.length; while (k > 1 && g.measureText(w.slice(0, k)).width > maxW) k--; lines[lines.length - 1].push([w.slice(0, k), st, x]); lines.push([]); x = 0; w = w.slice(k); wd = g.measureText(w).width; }
    lines[lines.length - 1].push([w, st, x]); x += wd; } return lines; }
function drawLines(g, lines, x0, y, size, col, lh) { lines.forEach((L, li) => { const by = y + li * lh; L.forEach(([w, st, x]) => { g.font = `700 ${size}px ${FONT}`; const wd = g.measureText(w).width;
  if (HL[st] && w.trim()) { g.fillStyle = HL[st]; g.beginPath(); g.moveTo(x0 + x - 2, by - size * .55); g.lineTo(x0 + x + wd + 2, by - size * .6); g.lineTo(x0 + x + wd + 3, by + 4); g.lineTo(x0 + x - 3, by + 5); g.fill(); }
  g.fillStyle = st === '**' || st === '__' ? RED : col; g.fillText(w, x0 + x, by);
  if (st === '__' && w.trim()) { g.strokeStyle = RED; g.lineWidth = 2; g.beginPath(); for (let k = 0; k <= wd; k += 4) g.lineTo(x0 + x + k, by + 5 + Math.sin(k / 3) * 2); g.stroke(); } }); }); }

const TAGC = { 정의: '#ffb27a', 특징: '#c9a8ff', 비교: '#9fd0ff', 시험: '#ff9aa8', 주의: '#ffd36a', 유래: '#f2c9a0', 예시: '#b6e8a8' };
const NAVY = '#24305e';
/* 모눈종이 + 위쪽 No./Date 칸 */
function paper(g, w, h, seed) { g.fillStyle = '#fdfcf8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(110,140,185,.2)'; g.lineWidth = 1;
  for (let x = 8; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 8; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.font = `15px ${FONT}`; g.fillStyle = '#8a94a8'; g.fillText('No.', w - 170, 22); g.fillText('Date      .      .', w - 112, 22); g.strokeStyle = '#a8b0c0'; g.beginPath(); g.moveTo(w - 145, 25); g.lineTo(w - 122, 25); g.moveTo(w - 75, 25); g.lineTo(w - 14, 25); g.stroke(); }
function pill(g, x, y, label, col, size = 16) { g.font = `700 ${size}px ${FONT}`; const w = g.measureText(label).width + 12; g.fillStyle = col; g.beginPath(); g.roundRect(x, y - size + 1, w, size + 6, 4); g.fill(); g.fillStyle = INK; g.fillText(label, x + 6, y + 2); return w; }
function circNum(g, x, y, n) { g.strokeStyle = NAVY; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 11, 0, 7); g.stroke(); g.font = `700 16px ${FONT}`; g.fillStyle = NAVY; g.textAlign = 'center'; g.fillText(String(n), x, y + 5); g.textAlign = 'left'; }

/* 한 항목 → 페이지 여러 장 (넘치면 다음 장으로) */
function entryPages(key, num, mg) { const W = 512, H = 720, X0 = 40, MAXW = W - X0 - 26, BOT = H - 34, FS = 19, LH = 26; const src = (N[key] || `t:${key.replace(/_/g, ' ')}`).split('\n');
  const [title, subject] = src[0].replace(/^t:/, '').split('|'); const items = []; let tbl = null, hn = 0, inBox = false;
  for (const raw of src.slice(1)) { if (/^tb!?:/.test(raw)) { const head = raw.startsWith('tb!:'); const cells = raw.replace(/^tb!?:/, '').split('|').map(s => s.trim()); if (!tbl) { tbl = { k: 'tb', rows: [], box: inBox }; items.push(tbl); } tbl.rows.push({ cells, head }); continue; } tbl = null;
    if (raw.startsWith('box:')) { inBox = true; items.push({ k: 'box', s: raw.slice(4) }); continue; } if (raw === '/box') { inBox = false; items.push({ k: 'endbox' }); continue; }
    items.push({ k: raw.startsWith('h:') ? 'h' : 'x', s: raw, n: raw.startsWith('h:') ? ++hn : 0, box: inBox }); }
  const ind0 = it => it.box ? 14 : 0;
  const meas = it => { if (it.k === 'tb') return it.rows.length * 28 + 10; if (it.k === 'box') return 32; if (it.k === 'endbox') return 12; if (it.k === 'h') return 40; const s = it.s;
    if (s.startsWith('pic:')) return 206; if (s.startsWith('sz:')) return 118; if (s.startsWith('tag:')) { const [lb, tx] = s.slice(4).split('|'); mg.font = `700 15px ${FONT}`; const tw = mg.measureText(lb).width + 20; return layout(mg, tx || '', MAXW - tw - ind0(it), FS).length * LH + 8; }
    const ind = (s.startsWith('  - ') ? 40 : 20) + ind0(it); return layout(mg, s.replace(/^\s*-\s/, ''), MAXW - ind, FS).length * LH + 2; };
  const pages = [[]]; let y = 112; for (const it of items) { const h = meas(it); if (y + h > BOT && pages[pages.length - 1].length) { if (it.s && it.s.startsWith('sz:')) continue; pages.push([]); y = 52; } pages[pages.length - 1].push([it, y, h]); y += h; }
  return pages.map((P, pi) => (g, w, h) => { paper(g, w, h, num * 7 + pi); const D = pen(g, num * 13 + pi, .9, false);
    if (pi === 0) { if (subject) pill(g, X0, 40, subject, '#e4e8f4', 14); g.font = `700 30px ${FONT}`; const tw = Math.min(g.measureText(title).width, MAXW); g.fillStyle = 'rgba(255,214,60,.55)'; g.fillRect(X0 - 2, 70, tw + 6, 12); g.fillStyle = INK; g.fillText(title, X0, 78, MAXW); g.strokeStyle = NAVY; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X0, 90); g.lineTo(W - 26, 90); g.moveTo(X0, 94); g.lineTo(W - 26, 94); g.stroke(); }
    else { g.font = `700 16px ${FONT}`; g.fillStyle = '#8a94a8'; g.fillText(`${title} (이어서)`, X0, 40); }
    let boxTop = null; const closeBox = yb => { if (boxTop === null) return; g.strokeStyle = NAVY; g.lineWidth = 1.6; g.strokeRect(X0 + 4, boxTop, MAXW - 4, yb - boxTop); boxTop = null; };
    if (P.length && P[0][0].box) boxTop = P[0][1] - 4;
    P.forEach(([it, y, hh]) => { const bx = ind0(it);
      if (it.k === 'box') { pill(g, X0 + 4, y + 16, it.s, '#e8f0c8', 15); boxTop = y + 26; return; }
      if (it.k === 'endbox') { closeBox(y + 4); return; }
      if (it.k === 'tb') { const cols = Math.max(...it.rows.map(r => r.cells.length)); g.font = `700 17px ${FONT}`; const cw = []; for (let c = 0; c < cols; c++) cw[c] = Math.max(40, ...it.rows.map(r => g.measureText(r.cells[c] || '').width + 14)); const avail = MAXW - bx - 6, sc = Math.min(1, avail / cw.reduce((a, b) => a + b, 0)); const ws = cw.map(v => v * sc), x0 = X0 + bx + 4, fs = 17 * Math.max(.78, Math.min(1, sc + .2));
        it.rows.forEach((r, ri) => { let cx = x0; const ry = y + 4 + ri * 28; if (r.head) { g.fillStyle = 'rgba(160,190,240,.35)'; g.fillRect(x0, ry, ws.reduce((a, b) => a + b, 0), 28); } r.cells.forEach((c, ci) => { drawLines(g, layout(g, c, ws[ci] - 8, fs).slice(0, 1), cx + 5, ry + 20, fs, r.head ? NAVY : INK, 24); cx += ws[ci]; }); });
        const tw = ws.reduce((a, b) => a + b, 0), th = it.rows.length * 28; g.strokeStyle = INK; g.lineWidth = 1.4; g.strokeRect(x0, y + 4, tw, th); let cx = x0; ws.slice(0, -1).forEach(v => { cx += v; g.beginPath(); g.moveTo(cx, y + 4); g.lineTo(cx, y + 4 + th); g.stroke(); }); g.lineWidth = .8; g.strokeStyle = '#8a8a8a'; for (let i = 1; i < it.rows.length; i++) { g.beginPath(); g.moveTo(x0, y + 4 + i * 28); g.lineTo(x0 + tw, y + 4 + i * 28); g.stroke(); } return; }
      if (it.k === 'h') { circNum(g, X0 + 11, y + 20, it.n); g.font = `700 22px ${FONT}`; const tx = it.s.slice(2).replace(/\*\*|==|\+\+|%%|__/g, ''); const tw = Math.min(g.measureText(tx).width, MAXW - 34); g.fillStyle = 'rgba(200,170,255,.45)'; g.fillRect(X0 + 28, y + 20, tw + 4, 9); g.fillStyle = NAVY; g.fillText(tx, X0 + 30, y + 27, MAXW - 34); return; }
      const s = it.s;
      if (s.startsWith('pic:')) { const [nm, cap] = s.slice(4).split('|'); const f = PIC[nm]; g.strokeStyle = '#b8c0d0'; g.lineWidth = 1; g.setLineDash([4, 3]); g.strokeRect(X0 + 2, y + 2, MAXW - 2, 180); g.setLineDash([]); if (f) { g.save(); g.translate(X0 + 6, y + 6); g.scale(.98, .9); f(pen(g, num * 31 + y, 1.1, false), 0, 0); g.restore(); }
        if (cap) { g.font = `700 15px ${FONT}`; g.fillStyle = '#5a6478'; g.textAlign = 'center'; g.fillText(`〈그림〉 ${cap}`, X0 + MAXW / 2, y + 198); g.textAlign = 'left'; } return; }
      if (s.startsWith('sz:')) { const f = SZ[s.slice(3)]; g.save(); g.translate(W - 250, y + 6); g.scale(.75, .75); g.rotate(-.04); if (f) f(pen(g, num * 17 + y, 7, true), 0, 0); g.restore(); return; }
      if (s.startsWith('tag:')) { const [lb, tx] = s.slice(4).split('|'); const pw = pill(g, X0 + bx, y + 18, lb, TAGC[lb] || '#dde', 15); drawLines(g, layout(g, tx || '', MAXW - pw - 8 - bx, FS), X0 + bx + pw + 8, y + 19, FS, lb === '시험' || lb === '주의' ? RED : INK, LH); return; }
      const sub = s.startsWith('  - '), ind = (sub ? 40 : /^-\s[①-⑳]/.test(s) ? 8 : 20) + bx, txt = s.replace(/^\s*-\s/, '');
      if (/^\s*-\s/.test(s) && !/^\s*-\s[①-⑳]/.test(s)) { if (sub) { g.font = `700 16px ${FONT}`; g.fillStyle = '#6a7488'; g.fillText('→', X0 + ind - 20, y + 19); } else { g.fillStyle = INK; g.beginPath(); g.arc(X0 + ind - 10, y + 13, 2.6, 0, 7); g.fill(); } }
      drawLines(g, layout(g, txt, MAXW - ind, FS), X0 + ind, y + 19, FS, INK, LH); });
    if (boxTop !== null) closeBox(BOT);
    g.font = `16px ${FONT}`; g.fillStyle = '#9aa2b2'; g.textAlign = 'center'; g.fillText(`${num}${pages.length > 1 ? '-' + (pi + 1) : ''}`, W / 2, H - 12); g.textAlign = 'left'; }); }

/* 표지 안쪽 (범례) · 목차 · 스즈의 페이지 */
function intro(n, total) { return (g, w, h) => { paper(g, w, h, 5); const D = pen(g, 9, .8, false);
  pill(g, 40, 96, '일본 문화 4·5·6과', '#e4e8f4', 18); D.tx('정리 노트', 40, 160, 52, INK); g.fillStyle = 'rgba(255,214,60,.55)'; g.fillRect(38, 150, 230, 14);
  D.tx('2학년 B반  한유나', 40, 210, 24, NAVY); g.strokeStyle = NAVY; g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, 220); g.lineTo(472, 220); g.stroke();
  D.tx(`정리한 단원  ${n} / ${total}`, 40, 262, 22, INK);
  D.tx('표시 약속', 40, 320, 22, NAVY); let y = 354; for (const [k, v] of [['정의', '용어의 뜻'], ['특징', '꼭 알아야 할 특징'], ['비교', '한국과 비교'], ['유래', '어디서 왔는지'], ['주의', '헷갈리는 것'], ['시험', '스스로 점검·확인하기 출제']]) { const pw = pill(g, 52, y, k, TAGC[k], 16); D.tx(v, 60 + pw, y + 1, 19, INK, false); y += 34; }
  g.fillStyle = 'rgba(255,214,60,.55)'; g.fillRect(52, y - 10, 60, 12); D.tx('= 꼭 외울 것', 120, y + 1, 19, INK, false); D.tx('빨간 글씨', 52, y + 35, 19, RED); D.tx('= 시험 함정', 136, y + 35, 19, INK, false);
  const S = pen(g, 21, 6, true); g.save(); g.translate(300, 620); g.scale(.8, .8); S.shaky('ユナの', 0, 0, 30, '#ff6a9a'); S.shaky('ノート', 18, 40, 30, '#ff6a9a'); g.restore(); }; }
function index(keys, start) { return (g, w, h) => { paper(g, w, h, 8); const D = pen(g, 4, .8, false); D.tx('목차', 40, 76, 34, INK); g.fillStyle = 'rgba(255,140,185,.4)'; g.fillRect(38, 64, 72, 14);
  let lastSub = ''; let y = 120; keys.forEach((k, i) => { if (y > h - 40) return; const sub = (N[k] || '').split('\n')[0].split('|')[1] || ''; const unit = sub.slice(0, 2); if (unit !== lastSub) { pill(g, 40, y, unit, '#e4e8f4', 15); y += 28; lastSub = unit; }
    D.tx(TITLE(k), 60, y, 19, INK, true); g.strokeStyle = '#c0c6d2'; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(70 + Math.min(330, g.measureText(TITLE(k)).width), y - 4); g.lineTo(w - 70, y - 4); g.stroke(); g.setLineDash([]); D.tx(`${i + 1}`, w - 60, y, 18, '#7a8292', false); y += 28; }); }; }
function suzuPage() { return (g, w, h) => { paper(g, w, h, 77); const S = pen(g, 5, 8, true); S.shaky('すずの', 90, 110, 44, '#ff6a9a'); S.shaky('ページ', 120, 170, 44, '#ff6a9a');
  S.ell(256, 380, 120, 130, null, '#ffb02a', 7, 2); for (let i = 0; i < 9; i++) S.ln([[160 + i * 24, 270], [150 + i * 26, 220]], '#ffd23f', 6); S.ln([[150, 320], [110, 520]], '#ffd23f', 6); S.ln([[360, 320], [400, 520]], '#ffd23f', 6);
  S.ell(210, 360, 9, 9, '#4a6ad8', null); S.ell(318, 352, 9, 9, '#4a6ad8', null); S.ln([[220, 450], [256, 470], [296, 446]], '#ff5a8a', 6); S.ell(190, 410, 18, 10, 'rgba(255,120,150,.5)', null); S.ell(326, 404, 18, 10, 'rgba(255,120,150,.5)', null);
  S.shaky('ユナの かお', 120, 580, 32, '#ffb02a'); S.shaky('(さわって かいた)', 110, 625, 24, '#ff8fb0'); }; }
function pages(keys) { const order = Object.keys(N); keys = keys.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b)); const out = [intro(keys.length, order.length)]; const body = [], start = [];
  keys.forEach((k, i) => { start.push(2 + body.length + 1); entryPages(k, i + 1, MG()).forEach(p => body.push(p)); });
  out.push(index(keys, start)); return out.concat(body, keys.length >= 3 ? [suzuPage()] : []); }
let mgc = null; const MG = () => { if (!mgc) mgc = document.createElement('canvas').getContext('2d'); return mgc; };
window.NOTEBOOK = { pages, TITLE, has: k => !!N[k] };
})();
