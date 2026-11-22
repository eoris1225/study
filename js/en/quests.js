'use strict';
/* 문단별 도전 거리: 핵심 단어 / 문법 문제 / 서진의 오답 해석(틀린 조각 찾기) */
window.QUEST = {
  p1: {
    voc: [['face', '직면하다'], ['defendants', '피고인들'], ['futile', '헛된, 소용없는'], ['instituted', '(소송을) 제기한'], ['vitiated', '무효가 된'], ['principals', '주요 관계자들'], ['physicians', '의사들'], ['deceit', '속임, 기만'], ['blame A on B', 'A를 B 탓으로 돌리다'], ['share in', '~을 함께 지다']],
    gram: [
      ['“the obvious issues <u>raised</u> by this terrible story”에서 raised의 역할은?', ['issues를 뒤에서 꾸미는 과거분사 (= which are raised)', '문장의 본동사 (과거 시제)', '수동태의 be동사가 생략된 본동사'], 0, '이 문장의 본동사는 must face. raised by ~는 앞 명사 issues를 꾸며서 “이 이야기가 제기한 문제들”.'],
      ['“there are two reasons <u>for chemistry to share</u> in the guilt”에서 for chemistry의 역할은?', ['to share의 의미상 주어 (“화학이” 나눠 질)', '목적 “화학을 위해”', '원인 “화학 때문에”'], 0, 'for + 명사 + to부정사 → 명사가 to부정사의 주어. reasons for chemistry to share = 화학이 나눠 져야 할 이유.'],
      ['“So why blame this on chemistry?”와 뜻이 같은 것은?', ['So why blame chemistry for this?', 'So why blame this for chemistry?', 'So why blame chemistry on this?'], 0, 'blame A on B = blame B for A. 탓을 돌리는 대상(B)이 on 뒤, 잘못(A)이 for 뒤.']
    ],
    wrong: [[3, 4, '보상 합의 때문에 다시 시작된 재판', '야 이거 vitiated가 “다시 활기를 띤” 아니었어? vi-가 생명이니까…', 'vitiated = 무효가 된. 보상 합의로 재판이 흐지부지된 것.'], [4, 1, '다섯 명이 물리학자였다', 'physicians면 물리학자지. phys-로 시작하잖아.', 'physician = 의사. 물리학자는 physicist.']]
  },
  p2: {
    voc: [['lambaste', '호되게 꾸짖다'], ['ignorance', '무지'], ['distinction', '구분'], ['natural', '천연의'], ['synthetic', '합성의 / 합성물'], ['matter', '물질'], ['once', '일단 ~하면'], ['do harm', '해를 끼치다']],
    gram: [
      ['“once you have taught people <u>the chemical nature of all matter, and that the natural may sometimes hurt you</u>”에서 밑줄 부분의 구조는?', ['taught의 직접목적어 두 개(명사구 + that절)가 and로 병렬', 'people을 꾸미는 관계절', '부사절 두 개'], 0, 'teach + 사람(people) + 가르친 내용. 내용이 ① 명사구 ② that절 두 개.'],
      ['“they are right to <u>do so</u>”에서 do so가 가리키는 것은?', ['대중이 천연·비천연 구분을 모른다고 꾸짖는 것', '천연물이 해롭다는 것을 숨기는 것', '화학 물질을 만드는 것'], 0, 'do so는 바로 앞 동사구 lambaste the public for its ignorance ~를 대신.']
    ],
    wrong: [[1, 0, '화학자들은 대중을 칭찬하기를 좋아한다', 'lambaste… 람바다? 춤추면서 칭찬하는 느낌 아님?', 'lambaste = 호되게 비난하다. 뒤의 for its ignorance(무지를 이유로)가 힌트.']]
  },
  p3: {
    voc: [['a variety of', '다양한'], ['catastrophe', '대참사'], ['derailed', '탈선시켰다'], ['mercury', '수은'], ['poisoning', '중독'], ['exculpation', '면책, 죄를 벗겨 줌'], ['argue for', '~을 지지하다'], ['depletion', '고갈, 파괴']],
    gram: [
      ['“a variety of chemical disasters <u>to choose from</u>”과 같은 뜻은?', ['from which to choose', 'which to choose', 'to be chosen'], 0, '전치사 from까지 챙겨야 함. choose from disasters → disasters from which to choose.'],
      ['“<u>who but</u> chemists Rowland and Molina found the connection ~?”의 뜻은?', ['롤런드와 몰리나 말고 누가 발견했겠는가 → 그 둘만이 발견했다', '롤런드와 몰리나는 누구였지만 발견했다', '누가 롤런드와 몰리나를 발견했는가'], 0, 'who but A = A 말고 누가 (수사의문문). 결국 “오직 A”라는 강조.'],
      ['“I <u>could have discussed</u> any of these.”의 뜻은?', ['다룰 수도 있었다 (그런데 안 했다)', '다룰 수 있다', '반드시 다뤘어야 했다'], 0, 'could have p.p. = 과거에 가능했지만 하지 않은 일.']
    ],
    wrong: [[6, 1, '누군가는 처벌을 주장할 수 있다', 'exculpation… ex-가 “전(前)” 아님? 전과자… 처벌?', 'exculpation = 죄에서(culpa) 빼냄(ex) → 면책. 대시 뒤 “이건 화학이 아니다”가 바로 면책 논리.']]
  },
  p4: {
    voc: [['dominant', '지배적인'], ['greed', '탐욕'], ['take credit for', '~의 공을 차지하다'], ['be willing to', '기꺼이 ~하다'], ['voiced', '(의견을) 표명했다'], ['flood in', '쏟아져 들어오다'], ['blow a whistle', '내부 고발하다'], ['sensationalist', '선정적인']],
    gram: [
      ['“Only other physicians, and a free press, <u>did</u>.”에서 did가 대신하는 것은?', ['blew a whistle (내부 고발을 했다)', 'voiced any public doubts about chemists', 'accepted the blame'], 0, '바로 앞 문장 No one blew a whistle. → 다른 의사들과 언론만이 (호루라기를) 불었다.'],
      ['“as reports of harmful effects just flooded in”에서 as의 뜻은?', ['~할 때, ~하는 동안', '~처럼', '~로서'], 0, '절(S + V)을 이끄는 접속사 as. 보고가 쏟아져 들어오던 그때.']
    ],
    wrong: [[1, 0, '그러나 화학자들이 신용 대출을 받는다면', 'credit은 신용카드 할 때 그 credit이지~', 'take credit for = ~의 공로를 인정받다. 뒤 문장의 blame(비난)과 짝.']]
  },
  p5: {
    voc: [['angle', '측면, 관점'], ['substituents', '치환기'], ['chiral', '키랄의 (거울상과 겹치지 않는)'], ['enantiomers', '거울상 이성질체'], ['teratogenicity', '기형 유발성'], ['contended', '논쟁 중인'], ['converts into', '~로 바뀌다'], ['physiological', '생리적인']],
    gram: [
      ['“There is some indication (contended) <u>that</u> the two enantiomers differ vastly”에서 that의 종류는?', ['동격의 that (“~라는 증거”)', '관계대명사 that', '지시대명사 that (“저것”)'], 0, 'that 뒤가 빠진 것 없는 완전한 문장이고 indication의 내용을 설명 → 동격.'],
      ['“The reaction that produced it initially gave equal amounts”의 본동사는?', ['gave', 'produced', 'initially'], 0, 'that produced it은 The reaction을 꾸미는 관계절. 문장의 진짜 동사는 gave.']
    ],
    wrong: [[6, 2, '“해로운” 이성질체가 “무해한” 것으로 바뀐다', '해로운 게 무해하게 바뀌니까 다행이란 거잖아?', '거꾸로. the “harmless” enantiomer converts into the “harmful” one = 무해한 쪽이 몸속에서 해로운 쪽으로 바뀐다. 그래서 더 복잡(complicated).']]
  },
  p6: {
    voc: [['abysmal', '형편없는'], ['twofold', '두 갈래의'], ['whereas', '~인 반면에'], ['sloppiness', '엉성함'], ['hype', '과장 광고'], ['fraud', '사기'], ['cannot afford to', '~해서는 안 된다'], ['remedy', '해결책'], ['legislation', '법률'], ['neuritis', '신경염']],
    gram: [
      ['“<u>Were the science</u> (biology, medicine, chemistry) <u>done well</u> …, this would not have happened.”과 같은 뜻은?', ['If the science had been done well, ~', 'Although the science was done well, ~', 'Because the science was done well, ~'], 0, 'if를 빼고 Were를 앞으로 보낸 가정법 도치. 주절이 would not have happened(과거 사실의 반대)라서 뜻은 “잘 됐더라면”.'],
      ['“The thalidomide disaster <u>should not have been allowed</u> to happen.”의 뜻은?', ['일어나게 두지 말았어야 했다 (그런데 일어났다)', '일어나게 두지 않을 것이다', '일어났을 리가 없다'], 0, 'should not have p.p. = 과거에 한 일을 비난/후회.'],
      ['“legislation on drug testing <u>that</u> slowly was introduced”에서 that이 꾸미는 말은?', ['legislation', 'drug testing', 'the remedy'], 0, '도입(introduced)된 것은 법률. 약물 시험이 도입된 게 아니라 “약물 시험에 관한 법”이 도입된 것.']
    ],
    wrong: [[4, 4, '나빠질 여유가 있다', 'afford면 “~할 여유가 있다”잖아. 그럼 나빠도 괜찮다는 거네.', 'cannot afford to be bad = 나쁠 여유가 없다. not이 붙어 있음! 생명이 걸린 과학은 나빠서는 안 된다.']]
  },
  p7: {
    voc: [['insidious', '서서히 퍼지는, 은밀한'], ['intersect with', '~와 맞닿다'], ['banality', '평범함'], ['unethical', '비윤리적인'], ['distorters', '왜곡하는 사람들'], ['stalled on', '~을 지연시켰다'], ['flawed', '결점 있는'], ['massaged', '(자료를) 주물렀다'], ['attribute A to B', 'A를 B 탓으로 돌리다'], ['hysteria', '히스테리']],
    gram: [
      ['“None of these people — [긴 목록] — none of these were just plain evil.”에서 두 번째 none of these를 다시 쓴 이유는?', ['주어가 목록 때문에 너무 길어져서 다시 받아 준 것', '두 개의 서로 다른 집단을 말하려고', '강조를 위한 반복 오타'], 0, '대시 사이 목록이 길어서 주어를 잊지 않게 다시 써 줌. 주어 = none of these (people), 동사 = were.'],
      ['“human beings of similar moral weakness, <u>who</u> massaged …, ignored …, refused …, attributed …”에서 who의 동사는 몇 개?', ['4개', '1개', '2개'], 0, 'massaged / ignored / refused / attributed 네 동사가 쉼표로 병렬.'],
      ['“doubting (<u>as they should have</u>)”의 뜻은?', ['마땅히 의심했어야 했듯이', '의심했을 것이므로', '의심할 수 있었기 때문에'], 0, 'should have (doubted): 했어야 했는데 하지 않은 일.']
    ],
    wrong: [[2, 1, '그것이 악의 화려함과 맞닿아 있기 때문에', 'banality… 바나나? 아무튼 뭔가 대단하고 화려한 악?', 'banality = 평범함, 진부함. 아렌트의 “악의 평범성”: 괴물이 아니라 평범한 사람들이 저지르는 악.'], [5, 6, '그 반응이 히스테리를 일으켰다', 'attributed A to B면 A가 B를 만들었다는 거 아님?', 'attribute A to B = A를 B 탓으로 돌리다. 부작용 반응을 “환자들의 히스테리” 탓으로 돌린 것.']]
  },
  p8: {
    voc: [['outcome', '결과'], ['go overboard', '도를 넘다'], ['stifled', '억눌린'], ['mandated', '의무화된'], ['efficacy', '효능'], ['net', '최종의'], ['thereby', '그로 인해'], ['keep A from B', 'A가 B에 못 가게 막다']],
    gram: [
      ['“The net results, <u>so this argument goes</u>, is that ~”에서 밑줄 부분은?', ['삽입: “이 주장에 따르면”', '결과의 원인을 나타내는 부사절', '목적어'], 0, 'so the argument/story goes = (그) 주장/이야기에 따르면. 빼도 문장이 성립.'],
      ['“it costs $100 million <u>to bring a drug to the market</u>”에서 it이 가리키는 것은?', ['to bring a drug to the market (가주어 it)', 'the drug designer', 'the creativity'], 0, 'It costs + 돈 + to V: 가주어 it, 진주어 to부정사. “약을 시장에 내놓는 데 1억 달러가 든다”.']
    ],
    wrong: [[1, 1, '이제 우리는 배를 타고 넘어간 것인가?', 'overboard… 배(board) 위로(over)! 배 타고 건너간 거지.', 'go overboard = 도를 넘다, 지나치다. 규제가 너무 지나친 것 아니냐는 반대 측 주장.']]
  },
  p9: {
    voc: [['be tempted to', '~하고 싶어지다'], ['stringent', '엄격한'], ['regulations', '규제'], ['prevented', '막았다'], ['a matter of', '~의 문제']],
    gram: [
      ['“It is not a matter of A, but of B.”의 뜻은?', ['A의 문제가 아니라 B의 문제다', 'A도 B도 문제가 아니다', 'A와 B 둘 다 문제다'], 0, 'not A but B. of가 양쪽에 붙어 a matter of A / (a matter) of B.'],
      ['“the more stringent rules <u>preventing</u> new drugs”에서 preventing은?', ['rules를 뒤에서 꾸미는 현재분사 (= which prevent)', '동명사 주어', '진행형 동사'], 0, '명사 뒤 -ing구는 그 명사를 꾸밈: “신약을 막는 규칙”.']
    ],
    wrong: [[1, 3, '얼마나 많은 생명을 잃었는지의 문제다', '앞이랑 똑같이 잃은 생명 얘기잖아.', '뒤쪽은 saved. lost(잃은 생명)가 아니라 saved(구한 생명)를 보라는 것이 이 문단의 핵심 대조.']]
  },
  p10: {
    voc: [['calculus', '계산법'], ['weighting', '가중치'], ['drug-induced', '약물로 인한'], ['phocomelia', '해표지증'], ['outweighs', '~보다 무겁다'], ['anguish', '극심한 고통'], ['unimaginable', '상상할 수 없는'], ['justify', '정당화하다']],
    gram: [
      ['“the weighting that is applied to a single ~ birth <u>is</u> (to me) so great that it outweighs ~”에서 is의 주어는?', ['the weighting', 'a single birth', 'that'], 0, 'that is applied to ~ birth는 weighting을 꾸미는 관계절. 진짜 주어 the weighting + 동사 is.'],
      ['“so great <u>that</u> it outweighs any life”의 구조는?', ['so ~ that: 너무 ~해서 …하다', '관계대명사 that', '동격 that'], 0, '너무 커서(so great) 어떤 생명보다도 무겁다(that it outweighs).']
    ],
    wrong: [[0, 4, '구한 생명이 그보다 더 무겁다', 'outweigh니까 바깥(out)에 있는 생명들이 더 무겁다는 거?', 'it(한 아이에게 매기는 무게) outweighs any life saved = 한 아이의 무게가 구한 어떤 생명보다 더 무겁다. 주어가 it!']]
  },
  p11: {
    voc: [['theme', '주제'], ['arises', '나타나다'], ['resemblance', '닮음'], ['sedatives', '진정제'], ['tranquilizers', '신경 안정제'], ['toxicity', '독성'], ['mirror-image', '거울상의']],
    gram: [
      ['“They chose <u>not to see</u> ~”의 뜻은?', ['보지 않기로 했다', '보기로 하지 않았다', '볼 수 없었다'], 0, 'choose not to V = ~하지 않기로 선택하다. (didn\'t choose to see와 뉘앙스가 다름: 일부러 외면)'],
      ['마지막 두 문장(chose to see / chose not to see)이 “The same and not the same”과 연결되는 방식은?', ['같은 점(다른 진정제와 닮음)만 보고 다른 점(거울상의 독성)은 외면했다', '같은 점과 다른 점을 모두 꼼꼼히 확인했다', '다른 점만 보고 같은 점은 무시했다'], 0, '겉으로 “같아” 보이는 것 속의 “다름”을 보지 않은 것이 참사의 뿌리라는 결론.']
    ],
    wrong: [[1, 1, '그것이 다른 진정제와 다르다는 점을 보기로 했다', '맺음이니까 다르다는 걸 봤다는 거겠지 ㅇㅇ', 'resemblance = 닮음. 그들은 “닮은 점”만 봤다. 다른 점은 다음 문장에서 chose not to see.']]
  }
};
