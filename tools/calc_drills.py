#!/usr/bin/env python3
"""미적분1 자습 프린트 연습 문제 생성 + sympy 검산 → js/calc/drills.js
   실행: python3 tools/calc_drills.py  (필요: pip install sympy)"""
import json, os
from sympy import (symbols, diff, integrate, solve, Abs, Rational, latex, simplify, expand, factor, S, Interval,
                   solveset, Poly, sqrt, oo, Symbol)

x, t, a, k = symbols('x t a k', real=True)
L = lambda e: latex(e).replace('\\left(', '(').replace('\\right)', ')')
OUT = []

def sec(key, title):
    OUT.append({'key': key, 'title': title, 'items': []})
def add(q, ans, sol=''):
    OUT[-1]['items'].append({'q': q, 'a': ans, 's': sol})
def check(cond, msg):
    assert cond, msg

def absint(f, v, lo, hi):
    pts = sorted(set([S(lo), S(hi)] + [r for r in solve(f, v) if r.is_real and lo < r < hi]), key=float)
    return sum(Abs(integrate(f, (v, p, q))) for p, q in zip(pts, pts[1:]))

def crit(f):
    return sorted(solve(diff(f, x), x), key=lambda v: float(v))

# ── 0. 미분 기계 ──
sec('d0', '0. 미분 기계 (도함수 구하기) — 모든 문제의 시작')
for f in [3*x**2, x**3 - 2*x, 2*x**3 + 3*x**2 - 12*x + 1, Rational(1, 3)*x**3 - x**2 + 5, x**4 - 4*x, (x - 1)*(x + 2), -x**3 + 6*x**2 - 9*x, S(5)]:
    d = expand(diff(f, x))
    add(f"f(x)={L(f)} \\text{{ 일 때 }} f'(x)", f"f'(x)={L(d)}", ('\\text{곱은 먼저 전개: }' + L(expand(f)) + '\\Rightarrow ' if f.is_Mul and not f.is_number and len(f.args) == 2 and all(p.is_Add for p in f.args) else '') + "\\text{각 항 } x^n \\to nx^{n-1},\\ \\text{상수} \\to 0")

# ── 1. 증가·감소 ──
sec('inc', '1. 증가와 감소')
for f in [x**3 - 3*x, x**3 - 6*x**2 + 9*x + 1, 2*x**3 - 3*x**2 - 12*x]:
    c = crit(f); d = factor(diff(f, x))
    add(f"f(x)={L(f)} \\text{{ 가 감소하는 구간}}", f"[{L(c[0])},\\,{L(c[1])}]", f"f'(x)={L(d)}\\le 0 \\Rightarrow {L(c[0])}\\le x\\le {L(c[1])}")
f = -x**3 + 3*x**2; c = crit(f)
add(f"f(x)={L(f)} \\text{{ 가 증가하는 구간}}", f"[{L(c[0])},\\,{L(c[1])}]", f"f'(x)={L(factor(diff(f, x)))}\\ge 0")
f = x**4 - 2*x**2; c = crit(f)
check(c == [-1, 0, 1], 'x4')
add(f"f(x)={L(f)} \\text{{ 가 감소하는 구간}}", "(-\\infty,-1],\\ [0,1]", f"f'(x)={L(factor(diff(f, x)))}, \\text{{ 부호표: }} - \\,|\\, + \\,|\\, - \\,|\\, +")
TX2 = {str(x**3 + a*x**2 + 3*x): '3x^2+2ax+3', str(x**3 - 3*a*x**2 + 12*x): '3x^2-6ax+12', str(-x**3 + a*x**2 - 3*x): '-3x^2+2ax-3'}
TX = {str(x**3 + a*x**2 + 3*x): 'x^3+ax^2+3x', str(x**3 - 3*a*x**2 + 12*x): 'x^3-3ax^2+12x', str(-x**3 + a*x**2 - 3*x): '-x^3+ax^2-3x'}
for f, rng, cond in [(x**3 + a*x**2 + 3*x, (-3, 3), '증가'), (x**3 - 3*a*x**2 + 12*x, (-2, 2), '증가'), (-x**3 + a*x**2 - 3*x, (-3, 3), '감소')]:
    fp = Poly(diff(f, x), x); A, B, C = fp.all_coeffs(); D4 = expand(B**2 - 4*A*C)
    sol = solveset(D4 <= 0, a, S.Reals); check(sol == Interval(*rng), f'range {f}')
    add(f"f(x)={TX[str(f)]} \\text{{ 가 실수 전체에서 {cond}할 때 }} a \\text{{ 의 범위}}", f"{rng[0]}\\le a\\le {rng[1]}",
        f"f'(x)={TX2[str(f)]} \\text{{ 이 항상 }} {'\\ge' if cond == '증가' else '\\le'} 0 \\Rightarrow \\text{{판별식}}\\le 0: {L(D4)}\\le 0")

# ── 2. 극대·극소 ──
sec('ext', '2. 극대와 극소')
for f in [x**3 - 3*x + 1, 2*x**3 - 9*x**2 + 12*x, x**3 - 12*x + 5, -x**3 + 3*x**2 + 9*x]:
    c = crit(f); d2 = [diff(f, x, 2).subs(x, v) for v in c]
    mx = [v for v, s in zip(c, d2) if s < 0][0]; mn = [v for v, s in zip(c, d2) if s > 0][0]
    add(f"f(x)={L(f)} \\text{{ 의 극댓값과 극솟값}}", f"\\text{{극댓값 }} f({L(mx)})={L(f.subs(x, mx))},\\ \\text{{극솟값 }} f({L(mn)})={L(f.subs(x, mn))}",
        f"f'(x)={L(factor(diff(f, x)))}=0 \\Rightarrow x={L(c[0])},{L(c[1])}, \\text{{ 증감표에서 }} + \\to - \\text{{ 극대}}, - \\to + \\text{{ 극소}}")
f = x**4 - 2*x**2
add(f"f(x)={L(f)} \\text{{ 의 극댓값과 극솟값}}", "\\text{극댓값 } f(0)=0,\\ \\text{극솟값 } f(\\pm1)=-1", f"f'(x)={L(factor(diff(f, x)))}")
b = symbols('b'); f = x**3 + a*x**2 + b*x
s = solve([diff(f, x).subs(x, 1), f.subs(x, 1) + 2], [a, b], dict=True)[0]; check(s == {a: 0, b: -3}, 'ab')
add("f(x)=x^3+ax^2+bx \\text{ 가 } x=1 \\text{ 에서 극솟값 } -2 \\text{ 를 가질 때 } a,b", "a=0,\\ b=-3", "f'(1)=3+2a+b=0,\\ f(1)=1+a+b=-2 \\text{ 연립}")
f = x**3 + a*x**2 + 3*x + 1; D4 = expand(diff(f, x).coeff(x, 1)**2 - 4*3*3)
check(solveset(D4 > 0, a, S.Reals) == Interval.open(-oo, -3).union(Interval.open(3, oo)), 'D>0')
add("f(x)=x^3+ax^2+3x+1 \\text{ 이 극값을 가질 } a \\text{ 의 범위}", "a<-3 \\text{ 또는 } a>3", "f'(x)=3x^2+2ax+3=0 \\text{ 이 서로 다른 두 실근} \\Rightarrow \\frac{D}{4}=a^2-9>0")

# ── 3. 그래프 · 최대 · 최소 ──
sec('mm', '3. 닫힌구간에서 최대·최소')
for f, lo, hi in [(x**3 - 3*x, -2, 3), (x**3 - 6*x**2 + 9*x, 0, 4), (-x**3 + 3*x, 0, 2), (2*x**3 - 3*x**2 - 12*x + 1, -2, 3)]:
    pts = sorted(set([S(lo), S(hi)] + [v for v in crit(f) if lo <= v <= hi]), key=float)
    vals = {v: f.subs(x, v) for v in pts}
    add(f"f(x)={L(f)},\\ {lo}\\le x\\le {hi} \\text{{ 에서 최댓값·최솟값}}", f"\\text{{최대 }} {L(max(vals.values()))},\\ \\text{{최소 }} {L(min(vals.values()))}",
        "\\text{후보: }" + ',\\ '.join(f"f({L(v)})={L(vals[v])}" for v in pts))
S_ = 2*x*(12 - x**2); xm = [v for v in solve(diff(S_, x), x) if v > 0][0]; check(xm == 2 and S_.subs(x, 2) == 32, 'rect')
add("\\text{두 꼭짓점이 } y=12-x^2 \\text{ 위, 밑변이 } x\\text{축 위인 직사각형의 넓이 최댓값}", "32", "S(x)=2x(12-x^2),\\ S'(x)=24-6x^2=0 \\Rightarrow x=2,\\ S(2)=32")

# ── 4. 방정식·부등식 ──
sec('eq', '4. 방정식과 부등식에의 활용')
for f in [x**3 - 3*x, 2*x**3 - 3*x**2 - 12*x]:
    c = crit(f); hi, lo = f.subs(x, c[0]), f.subs(x, c[1])
    add(f"{L(f)}=k \\text{{ 가 서로 다른 세 실근을 가질 }} k \\text{{ 의 범위}}", f"{L(lo)}<k<{L(hi)}", f"y={L(f)} \\text{{ 와 }} y=k \\text{{ 가 세 점에서 만남: 극솟값 }}{L(lo)}<k<\\text{{극댓값 }}{L(hi)}")
f = x**3 - 3*x**2 + 1; c = crit(f)
add(f"{L(f)}=0 \\text{{ 의 서로 다른 실근의 개수}}", "3", f"\\text{{극댓값 }} f(0)=1>0,\\ \\text{{극솟값 }} f(2)=-3<0 \\Rightarrow 3\\text{{개}}")
f = x**3 - 3*x**2 + 5; c = crit(f)
add(f"{L(f)}=0 \\text{{ 의 서로 다른 실근의 개수}}", "1", f"\\text{{극댓값 }} f(0)=5,\\ \\text{{극솟값 }} f(2)={L(f.subs(x, 2))}>0 \\Rightarrow 1\\text{{개}}")
check((x**3 - 3*x + a).subs(x, 1) == a - 2, 'ineq')
add("x\\ge 0 \\text{ 인 모든 } x \\text{ 에 대해 } x^3-3x+a\\ge 0 \\text{ 일 } a \\text{ 의 최솟값}", "2", "x\\ge0 \\text{ 에서 최솟값 } f(1)=a-2\\ge 0")
add("\\text{모든 실수 } x \\text{ 에 대해 } x^4-4x+a\\ge 0 \\text{ 일 } a \\text{ 의 최솟값}", "3", "f'(x)=4x^3-4=0 \\Rightarrow x=1,\\ \\text{최솟값 } f(1)=a-3\\ge0")
check(solve(diff(x**3 + 3*x**2 - 9*x, x), x) == [-3, 1], 'gx')
add("x^3+3x^2 > 9x + k \\text{ 가 } x\\ge 0 \\text{ 에서 항상 성립할 } k \\text{ 의 범위}", "k<-5", "h(x)=x^3+3x^2-9x,\\ h'(x)=3(x+3)(x-1),\\ x\\ge0 \\text{ 최솟값 } h(1)=-5>k")

# ── 5. 속도와 가속도 ──
sec('va', '5. 속도와 가속도 (미분)')
X = t**3 - 6*t**2 + 9*t; v = diff(X, t); ac = diff(v, t)
check(solve(v, t) == [1, 3], 'v')
add("x(t)=t^3-6t^2+9t \\text{ 일 때 운동 방향이 바뀌는 시각}", "t=1,\\ t=3", f"v=x'={L(factor(v))}=0 \\text{{ 이고 부호가 바뀜}}")
add("x(t)=t^3-6t^2+9t \\text{ 일 때 } t=3 \\text{ 에서의 가속도}", f"{L(ac.subs(t, 3))}", f"a=v'={L(ac)}")
X = t**3 - 3*t**2
add("x(t)=t^3-3t^2 \\text{ 일 때 } t=3 \\text{ 에서 속도와 가속도}", f"v={L(diff(X, t).subs(t, 3))},\\ a={L(diff(X, t, 2).subs(t, 3))}", "v=3t^2-6t,\\ a=6t-6")
h = 30*t - 5*t**2; tt = solve(diff(h, t), t)[0]
add("\\text{위로 던진 공 } h(t)=30t-5t^2 \\text{ 의 최고 높이}", f"{L(h.subs(t, tt))}", f"v=30-10t=0 \\Rightarrow t={tt}")
X = t**3 - 9*t**2 + 24*t
add("x(t)=t^3-9t^2+24t \\text{ 에서 가속도가 0일 때의 속도}", f"{L(diff(X, t).subs(t, 3))}", "a=6t-18=0 \\Rightarrow t=3,\\ v(3)=27-54+24")

# ── 6. 부정적분 ──
sec('ind', '6. 부정적분 (미분의 반대)')
for f in [3*x**2 + 2*x, 4*x**3 - 6*x + 1, (x - 1)*(x + 1), 6*x**2 - 4*x + 3]:
    F = integrate(expand(f), x)
    add(f"\\int ({L(f)})\\,dx", f"{L(F)}+C", "x^n \\to \\frac{x^{n+1}}{n+1}, \\text{ 끝에 }+C")
F = integrate(6*x**2 - 2*x, x) + 3; check(F.subs(x, 1) == 4, 'F1')
add("f'(x)=6x^2-2x,\\ f(0)=3 \\text{ 일 때 } f(1)", "4", f"f(x)={L(F)} \\ (C=f(0)=3)")
F = integrate(2*x - 4, x) + 1
add("\\text{곡선 } y=f(x) \\text{ 위의 점 } (x,y) \\text{ 에서 접선의 기울기가 } 2x-4, \\text{ 점 } (0,1) \\text{ 을 지날 때 } f(x)", f"f(x)={L(F)}", "f(x)=\\int(2x-4)dx=x^2-4x+C,\\ f(0)=C=1")
add("\\frac{d}{dx}\\int (x^2+1)\\,dx", "x^2+1", "\\text{적분하고 미분하면 원래대로 (C 없음)}")
add("\\int \\left(\\frac{d}{dx}x^3\\right) dx", "x^3+C", "\\text{미분하고 적분하면 } +C \\text{ 가 붙음}")
F = integrate(4*x**3 + 2*x - 1, x) - 2
add("f(x)=\\int (4x^3+2x-1)\\,dx,\\ f(0)=-2 \\text{ 일 때 } f(1)", f"{L(F.subs(x, 1))}", f"f(x)={L(F)}")

# ── 7. 정적분 ──
sec('def', '7. 정적분 계산')
for f, lo, hi in [(3*x**2, 0, 2), (2*x - 1, 1, 3), (x**3 + 3*x**2 + x, -1, 1), (x**2 - 2*x, 0, 3), (6*x**2 - 4*x + 1, -1, 2)]:
    add(f"\\int_{{{lo}}}^{{{hi}}} ({L(f)})\\,dx", f"{L(integrate(f, (x, lo, hi)))}", "F(b)-F(a)" + ("\\text{ — 홀수 차수 항은 }\\int_{-a}^{a}=0" if lo == -hi else ""))
add("\\int_0^2 |x-1|\\,dx", f"{L(absint(x - 1, x, 0, 2))}", "x=1 \\text{ 에서 쪼개기: } \\int_0^1 (1-x)dx+\\int_1^2 (x-1)dx")
add("\\int_0^3 |x^2-2x|\\,dx", f"{L(absint(x**2 - 2*x, x, 0, 3))}", "\\int_0^2 (2x-x^2)dx+\\int_2^3 (x^2-2x)dx")
add("\\int_0^1 (x^2+x)dx+\\int_1^3 (x^2+x)dx", f"{L(integrate(x**2 + x, (x, 0, 3)))}", "\\text{구간 합치기: } \\int_0^3")
g = x**2 - 3*x + 2; fx = diff(g, x)
add("\\int_1^x f(t)\\,dt = x^2-3x+2 \\text{ 일 때 } f(4)", f"{L(fx.subs(x, 4))}", "\\text{양변 미분: } f(x)=2x-3")
add("\\frac{d}{dx}\\int_1^x (t^2+1)\\,dt \\text{ 의 } x=2 \\text{ 에서의 값}", "5", "\\frac{d}{dx}\\int_a^x f(t)dt=f(x)")
kk = symbols('kk'); sol = solve(kk - integrate(3*t**2 - 2*t + kk, (t, 0, 2)), kk)[0]; check(sol == -4, 'kk')
add("f(x)=3x^2-2x+\\int_0^2 f(t)\\,dt \\text{ 일 때 } f(2)", f"{L((3*x**2 - 2*x + sol).subs(x, 2))}", "\\int_0^2 f(t)dt=k \\text{ (상수)로 두면 } k=\\int_0^2(3t^2-2t+k)dt=4+2k \\Rightarrow k=-4")
add("\\int_a^a f(x)\\,dx \\text{ 와 } \\int_b^a f(x)dx \\text{ 의 관계}", "0,\\ \\ -\\int_a^b f(x)dx", "\\text{위끝=아래끝이면 0, 뒤집으면 부호 반대}")

# ── 8. 넓이 ──
sec('area', '8. 정적분으로 넓이 구하기')
for desc, expr, lo, hi in [("y=x^2-1 \\text{ 과 } x\\text{축으로 둘러싸인 넓이}", x**2 - 1, -1, 1),
                           ("y=x^2-2x \\text{ 와 } x\\text{축으로 둘러싸인 넓이}", x**2 - 2*x, 0, 2),
                           ("y=-x^2+4 \\text{ 와 } x\\text{축으로 둘러싸인 넓이}", -x**2 + 4, -2, 2),
                           ("y=x^3-x \\text{ 와 } x\\text{축으로 둘러싸인 넓이}", x**3 - x, -1, 1),
                           ("y=x^2-4x+3,\\ x\\text{축},\\ x=0,\\ x=3 \\text{ 으로 둘러싸인 넓이}", x**2 - 4*x + 3, 0, 3)]:
    add(desc, f"{L(absint(expr, x, lo, hi))}", f"\\int_{{{lo}}}^{{{hi}}} |\\cdots|\\,dx \\text{{ (x축 아래는 - 붙여서)}}")
for desc, top, bot in [("y=x^2 \\text{ 과 } y=x", x, x**2), ("y=x^2 \\text{ 과 } y=2x+3", 2*x + 3, x**2), ("y=x^2 \\text{ 과 } y=-x^2+2", -x**2 + 2, x**2), ("y=x^3 \\text{ 과 } y=x \\ (x\\ge 0)", x, x**3)]:
    r = sorted([v for v in solve(top - bot, x) if (v >= 0 if 'x\\ge' in desc else True)], key=float); lo, hi = r[0], r[-1]
    add(desc + " \\text{ 로 둘러싸인 넓이}", f"{L(integrate(top - bot, (x, lo, hi)))}", f"\\text{{교점 }} x={L(lo)},{L(hi)},\\ \\int (\\text{{위}}-\\text{{아래}})dx")
add("\\text{이차함수와 직선(또는 두 이차함수)이 } x=\\alpha,\\beta \\text{ 에서 만날 때 넓이 공식}", "\\frac{|a|}{6}(\\beta-\\alpha)^3", "a = \\text{(위-아래)의 } x^2 \\text{ 계수. 예: } y=x^2, y=2x+3 \\Rightarrow \\frac{1}{6}\\cdot 4^3=\\frac{32}{3}")

# ── 9. 속도와 거리 ──
sec('dist', '9. 속도와 거리 (적분)')
V = 3*t**2 - 6*t
add("v(t)=3t^2-6t,\\ \\text{원점 출발. } t=3 \\text{ 에서의 위치}", f"{L(integrate(V, (t, 0, 3)))}", "\\text{위치}=0+\\int_0^3 v\\,dt")
add("v(t)=3t^2-6t \\text{ 일 때 } t=0 \\sim 3 \\text{ 동안 움직인 거리}", f"{L(absint(V, t, 0, 3))}", "\\int_0^3 |v|dt=\\int_0^2(6t-3t^2)dt+\\int_2^3(3t^2-6t)dt")
V = 10 - 2*t
add("v(t)=10-2t,\\ \\text{원점 출발. } t=7 \\text{ 에서의 위치와 } 0\\sim7 \\text{ 동안 움직인 거리}", f"\\text{{위치 }}{L(integrate(V, (t, 0, 7)))},\\ \\text{{거리 }}{L(absint(V, t, 0, 7))}", "t=5 \\text{ 에서 방향 바뀜: } 25+4")
V = t**2 - 4*t + 3
add("v(t)=t^2-4t+3,\\ \\text{원점 출발. 처음으로 운동 방향이 바뀔 때의 위치}", f"{L(integrate(V, (t, 0, 1)))}", "v=(t-1)(t-3)=0 \\Rightarrow t=1,\\ \\int_0^1 v\\,dt")
V = 3*t**2 - 4
tt = [s_ for s_ in solve(integrate(V, (t, 0, t)), t) if s_ > 0][0]
add("v(t)=3t^2-4,\\ \\text{원점 출발. 다시 원점을 지나는 시각}", f"t={L(tt)}", "\\int_0^t v\\,dt=t^3-4t=0")
V = 30 - 10*t
add("\\text{위로 쏘아 올린 물체 } v(t)=30-10t\\ (\\text{m/s}). \\text{ 처음 5초 동안 움직인 거리}", f"{L(absint(V, t, 0, 5))}", "t=3 \\text{ 에서 최고점: } 45+20")

os.makedirs('js/calc', exist_ok=True)
with open('js/calc/drills.js', 'w', encoding='utf8') as fo:
    fo.write("'use strict';\n/* 자동 생성: tools/calc_drills.py (sympy 검산). 미적분1 자습 프린트 연습 문제 */\nwindow.CALCDRILL = ")
    json.dump(OUT, fo, ensure_ascii=False, indent=0); fo.write(';\n')
print('sections', len(OUT), 'items', sum(len(s['items']) for s in OUT))
