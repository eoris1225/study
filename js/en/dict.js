'use strict';
/* 단어 터치 사전 — 지문에 나온 형태 그대로 (원형은 괄호) */
window.DICT = (() => {
  const raw = `
a|하나의 (관사)
about|~에 대해
abysmal|형편없는, 최악의 (abyss 심연)
accept|받아들이다
action|조치, 행동 (legal action 법적 조치)
adequately|적절히, 그럭저럭
adults|성인들
afford|~할 여유가 있다 (cannot afford to ~해서는 안 된다)
again|다시
against|~에 맞서, ~을 상대로
all|모든
allowed|허용된 (allow)
along|따라서 (pass along 전달하다)
also|또한
am|이다 (be)
amounts|양 (amount)
an|하나의 (관사)
and|그리고
angle|각도 → 관점, 측면
anguish|극심한 고통, 괴로움
another|또 하나의, 다른
answer|답
any|어떤 ~라도
adults|성인들
applied|적용된, 매겨진 (apply)
are|이다, 있다 (be)
area|지역, 영역 (gray area 회색 지대)
arendt's|(한나) 아렌트의 — 독일 출신 정치철학자
argue|주장하다 (argue for ~을 지지하다)
argument|주장, 논거
arises|생기다, 나타나다 (arise)
around|주위에
as|~처럼 / ~할 때 / ~로서
at|~에
attributed|(~의) 탓으로 돌렸다 (attribute A to B)
bad|나쁜
balance|균형, 수지 (trade balance 무역 수지)
banality|평범함, 진부함 (the banality of evil 악의 평범성)
be|이다, 있다
because|~ 때문에
been|be의 과거분사
before|전에
behavior|행동, 행태
beings|존재 (human beings 인간)
benefits|이익, 혜택
benzene|벤젠 (유독성 화학 물질)
between|~ 사이에
bhopal|보팔 (인도의 도시, 1984년 독가스 참사)
biology|생물학
birth|출생, 탄생
bit|조금 (a little bit)
black|검은
blame|비난(하다), 탓(하다)
blew|불었다 (blow – blew – blown)
born|태어난 (be born)
brazil|브라질
bring|가져오다 (bring to the market 출시하다)
but|그러나 / ~ 외에 (who but ~ 말고 누가)
by|~에 의해
calculus|계산법, 셈법
can|~할 수 있다
cannot|~할 수 없다
carbon|탄소
cars|차량 (tank cars 탱크 화차)
case|경우 / 사건, 소송
catastrophe|대참사
chemical|화학의 / 화학 물질
chemist|화학자
chemistry|화학
chemists|화학자들
child|아이
children|아이들
chiral|키랄의 (거울상과 겹쳐지지 않는)
chlorine|염소 (유독 기체)
chlorofluorocarbons|염화불화탄소, 프레온 가스 (CFC)
choose|고르다 (choose – chose – chosen)
chose|골랐다, ~하기로 했다 (choose)
clearly|분명히
come|오다, 나오다
company|회사
company's|회사의
compensation|보상
competition|경쟁
complicated|복잡해진, 복잡한
conditions|조건, 상태
connection|연관성, 관계
contended|논쟁 중인, 다툼이 있는
contributions|기여, 이바지
converts|바뀌다, 전환되다 (convert into)
costs|(비용이) 들다 (cost)
could|~할 수 있었다 / ~할 수도 있다
creativity|창의성
credit|공로, 인정 (take credit for ~의 공을 차지하다)
cured|고쳤다, 치료했다 (cure)
curious|기이한, 흥미로운
currently|현재
dark|어두운
data|자료, 데이터
ddt|DDT (살충제)
deceit|속임, 기만
defendants|피고인들
depletion|고갈, 감소 (ozone depletion 오존층 파괴)
derailed|탈선시켰다 (derail)
designer|설계자, 개발자
did|했다 (do) / 대동사
didn't|~하지 않았다
differ|다르다 (differ in ~에서 다르다)
different|다른
disaster|재앙, 참사
disasters|재앙들
discussed|논의했다 (discuss)
distinction|구분, 차이
distorted|왜곡된, 비튼 (distort)
distorters|왜곡하는 사람들
do|하다
doctors|의사들
dominant|지배적인
done|된, 이루어진 (do의 과거분사)
doubting|의심하는 것 (doubt)
doubts|의심, 의문
dr|박사 (Doctor)
drug|약, 약물
drug-induced|약물로 인한
drugs|약들
during|~ 동안 / 와중에
each|각각의
easily|쉽게
economics|경제, 경제학
editors|편집자들
effectiveness|효과, 효능
effects|영향, 효과 (side effects 부작용)
efficacy|효능
eight|여덟
either|(either A or B) A든 B든
enantiomer|거울상 이성질체
enantiomers|거울상 이성질체들 (서로 거울에 비친 모양의 분자)
equal|같은, 동일한
even|심지어
evil|악 / 악한
exculpation|무죄로 함, 면책
exists|존재하다 (exist)
experimentation|실험 (활동)
f|F. (이름 머리글자)
face|직면하다, 마주하다
fact|사실
failed|실패했다 (fail)
failure|실패
famous|유명한
field|현장 (in the field 현장의)
file|서류철, 파일
firm's|회사의 (firm 회사)
firms|회사들
first|첫째로 / 처음으로
five|다섯
flawed|결점 있는, 흠 있는
flooded|쏟아져 들어왔다 (flood in)
following|따르는 것 (follow)
for|~을 위해 / ~에 대해 / ~을 이유로
forms|형태들
found|발견했다 (find – found)
four|넷
fraud|사기, 부정
free|자유로운
from|~로부터
fully|완전히
futile|헛된, 소용없는
gaining|얻는 것 (gain)
gave|주었다, 내놓았다 (give)
germany|독일
goes|가다 (so the argument goes 그 주장에 따르면)
gone|간 (go overboard 도를 넘다)
good|선한, 좋은
gray|회색의 (gray area 회색 지대, 애매한 영역)
great|큰
greed|탐욕
grünenthal|그뤼넨탈 (탈리도마이드를 판 독일 제약 회사)
guilt|죄, 죄책
had|가졌다 / had to ~해야 했다
handed|손잡이의, 왼손·오른손이 있는 (handed forms)
hannah|한나 (아렌트)
happen|일어나다
happened|일어났다
harm|해, 손해 (do harm 해를 끼치다)
harmful|해로운
harmless|무해한
has|가지다 (have)
have|가지다 / 현재완료
haven't|~하지 않았다 (have not)
he|그는
hear|듣다
heard|들었다 (hear)
here|여기
hide|숨기다
how|얼마나 / 어떻게
human|인간의, 인간다운
hundreds|수백 (hundreds of 수백의)
hurt|해치다, 아프게 하다
hype|과장 광고, 과대 선전
hysteria|히스테리, 병적 흥분
i|나
i'm|나는 ~이다
if|만약 ~라면
ignorance|무지
ignored|무시했다 (ignore)
in|~ 안에, ~에서
indeed|실제로, 정말로
india|인도
indication|징후, 증거
indirectly|간접적으로
individual|개인
initially|처음에
insidious|서서히 퍼지는, 은밀하게 해로운
instances|사례들 (instance)
instituted|(소송을) 제기한 (institute)
intersects|교차하다, 맞닿다 (intersect with)
into|~ 안으로 / ~로 (변화)
introduced|도입된 (introduce)
involved|관련된
is|이다
isn't|~이 아니다
issues|문제들, 쟁점들
it|그것
its|그것의
j|J. (이름 머리글자)
japan|일본
journal|학술지, 저널
just|그저, 단지 / 막
justify|정당화하다
kept|막았다, 유지했다 (keep A from B)
kind|종류
knowledge|지식
kunz|쿤츠 (탈리도마이드를 처음 합성한 화학자)
lambaste|호되게 꾸짖다, 맹비난하다
land|땅, 영역
lawyers|변호사들
least|가장 적은 (at least 적어도)
left|왼쪽의 (left-handed 왼손형)
legal|법적인
legislation|법률, 입법
less|더 적은 (less than ~에 못 미치는)
life|삶, 생명
like|좋아하다 / ~처럼
little|작은 / 조금
lives|생명들 (life의 복수)
lost|잃었다, 잃은 (lose)
mainly|주로
makers|제조자들
managed|주도했다, 처리했다 (manage)
management|경영진
mandated|의무화된
manipulators|조작하는 사람들
many|많은
mario|마리오 (몰리나)
market|시장
massaged|(유리하게) 주물렀다, 손봤다 (massage)
matter|물질 / 문제 (a matter of ~의 문제)
may|~일지도 모른다, ~할 수 있다
me|나
means|뜻하다 (mean)
medical|의학의
medicine|의학, 약
memo|메모, 회람
men|남자들, 사람들
mercury|수은
message|메시지
might|~였을지도 모른다
million|백만 ($100 million 1억 달러)
mirror-image|거울상의
molecule|분자
molina|몰리나 (멕시코 출신 화학자, 노벨 화학상)
moral|도덕적인
more|더
mückter|뮈크터 (그뤼넨탈의 연구 책임자, 자료 조작에 관여)
must|~해야 한다 (must not ~해서는 안 된다)
natural|천연의, 자연의
nature|본성, 성질
neither|(neither A nor B) A도 B도 아닌
net|최종의, 순(純)
neuritis|신경염
never|결코 ~않다
new|새로운
news|소식
no|어떤 ~도 없는
none|아무도 ~않다
nonidentical|같지 않은
nor|(neither A nor B) ~도 아니다
not|~ 아니다
nothing|아무것도 ~않다
now|이제, 지금
objected|반대했다 (object)
obvious|명백한, 분명한
of|~의
on|~에 대해 / ~ 위에
once|일단 ~하면
one|하나 / 사람 / (앞 명사를 받는) 것
only|오직
or|또는
other|다른
outcome|결과
outweighs|~보다 더 무겁다(중요하다) (outweigh)
overboard|배 밖으로 (go overboard 도를 넘다)
own|자기 자신의
owners|소유주들
ozone|오존
parents|부모들
part|일부 (in part 부분적으로)
passed|넘겼다 (pass along)
people|사람들
phocomelia|해표지증 (팔다리가 짧거나 없이 태어나는 기형)
phrase|표현, 구절
physicians|의사들 (physicist 물리학자와 다름)
physiological|생리적인 (몸속 조건의)
picture|사진, 그림
plain|그냥, 아주 (부사) / 순전한
poisoning|중독
policy|방침, 정책
poor-quality|질 낮은
positive|긍정적인
possibly|어쩌면
press|언론
prevented|막았다 (prevent)
preventing|막는 (prevent)
principals|주요 관계자들, 당사자들
problem|문제
process|절차, 과정 (legal process 법적 절차, 소송)
produced|만들어 냈다 (produce)
public|대중 / 공개적인
publication|출판, 게재
raised|제기된 (raise)
reaction|반응 / (화학) 반응
read|읽다
reasons|이유들
refused|거부했다 (refuse)
regulations|규제, 규정
reliable|신뢰할 만한
remedy|해결책, 치료법
reported|보고했다 (report)
reports|보고들
resemblance|닮음, 유사성
results|결과(들)
right|옳은 / 오른쪽의
right-handed|오른손형의
risks|위험들
role|역할
rowland|롤런드 (미국 화학자, 노벨 화학상)
rules|규칙들
s|S. (이름 머리글자)
safety|안전(성)
salesmen|영업 사원들
same|같은 (the same 같은 것)
saved|구한, 구해진 (save)
saw|보았다 (see)
science|과학
screamed|소리쳤다 → 항의했다 (scream)
second|두 번째의
sedative|진정제(의)
sedatives|진정제들
see|보다
seems|~인 것 같다 (seem)
selected|선별된, 골라 뽑은
sellers|판매자들
sensationalist|선정적인
settlement|합의, 해결
seven|일곱
share|나누다 (share in ~을 함께 지다)
sherwood|셔우드 (롤런드)
should|~해야 한다 (should have p.p. ~했어야 했다)
show|보여 주다
side|면, 측면 (side effects 부작용)
significantly|의미심장하게도
similar|비슷한
simple|단순한
single|단 하나의 (not a single 단 하나도 ~않다)
slightly|약간
sloppiness|엉성함, 부주의
slowly|천천히
so|그래서 / 그렇게 / 너무 (so ~ that)
some|약간의, 몇몇의
something|무언가
sometimes|때때로
somewhat|다소
spite|(in spite of) ~에도 불구하고
stalled|지연시켰다, 미뤘다 (stall on)
stifled|억눌린 (stifle)
story|이야기
stringent|엄격한
substituents|치환기들 (탄소에 붙은 원자단)
such|(such as) ~와 같은
suffered|고통받았다 (suffer from)
supplied|제공했다 (supply)
sure|확신하는
surely|분명히
survive|살아남다, 견뎌 내다
synthetic|합성의 / 합성물
system|체계, 시스템
tagamet|타가메트 (궤양 치료제, 화학의 성공 사례)
take|취하다 (take credit for ~의 공을 차지하다)
tank|탱크
taught|가르쳤다 (teach)
tempted|유혹을 느끼는 (be tempted to ~하고 싶어지다)
teratogenicity|기형 유발성
terrible|끔찍한
testing|시험, 검사
tests|시험들
thalidomide|탈리도마이드 (진정제·수면제)
thalidomide-like|탈리도마이드 같은
than|~보다
that|그 / ~라는 것 / (관계대명사)
the|그 (정관사)
their|그들의
theme|주제
then|그때 / 그 후 / 그렇다면
there|거기 / (there is) ~이 있다
thereby|그로 인해
these|이것들
they|그들
think|생각하다
this|이것
those|그것들, 그
thousand|천
thousands|수천 (thousands of 수천의)
threatened|위협했다 (threaten)
to|~로 / ~하는 것
touches|관련되다, 닿다 (touch on)
toxicity|독성
trade|무역
tranquilizers|신경 안정제들
trial|재판
try|애쓰다, 시도하다
two|둘
twofold|두 부분으로 된, 두 겹의
ulcer|궤양
ultimately|결국
under|~ 아래에서 / ~ 조건에서
unethical|비윤리적인
unimaginable|상상할 수 없는
unnatural|비천연의, 부자연스러운
used|사용된 (use)
variety|다양성 (a variety of 다양한)
vastly|엄청나게, 크게
vitiated|무효가 된, 손상된 (vitiate)
voiced|(의견을) 말했다, 표명했다 (voice)
want|원하다
wanted|원했다
was|이었다 (be)
way|방식
we|우리
weakness|약함, 나약함
weighting|가중치, 무게를 매김
well|잘
were|이었다 (be) / 가정법 도치의 Were
what|~하는 것 (관계대명사) / 무엇
when|~할 때
whereas|~인 반면에
while|~하는 동안
whistle|호루라기 (blow a whistle 내부 고발하다)
white|흰 (유인물 오타 — 원래 there로 보임)
who|누구 / (관계대명사) ~하는 사람
why|왜
wilhelm|빌헬름 (쿤츠)
will|~할 것이다
willing|기꺼이 ~하는 (be willing to)
with|~와 함께 / ~을 가진
works|작동하다, 돌아가다 (work)
world|세계
worldwide|전 세계의
would|~할 것이다 (would not have p.p. ~하지 않았을 것이다)
yes|그렇다
yet|그런데도, 그러나
you|너, (일반적인) 사람
`;
  const D = {}; raw.trim().split('\n').forEach(l => { const i = l.indexOf('|'); if (i > 0) D[l.slice(0, i)] = l.slice(i + 1); });
  return D;
})();
