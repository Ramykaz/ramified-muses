/* GRE Quant lessons: Arithmetic. Maths goes between ⟦ and ⟧ and is typeset with KaTeX (TeX syntax).
   T`...` keeps backslashes, so TeX can be written normally: ⟦\frac{3}{4}⟧.
   A lesson: id, unit, title, mins, idea, learn [{h, html}], rules (TeX), widget, examples [{q, fig, steps, a}], tips, traps, practice.
   Questions: mc (one answer), ma (select all, a = list), qc (comparison, a = 0 A / 1 B / 2 equal / 3 can't tell), ne (numeric entry, a = number or "p/q"). */
var T = String.raw;
window.QL = window.QL || [];
QL.push(
{
  id: "integers", unit: "Arithmetic", title: "Integers, factors and primes", mins: 12,
  idea: T`Most GRE number questions are about how integers break into prime factors.`,
  learn: [
    { h: "Odd and even", html: T`even × anything = even, odd × odd = odd. even ± even and odd ± odd are even; odd ± even is odd. <b>0 is even.</b>` },
    { h: "Factors and multiples", html: T`A <b>factor</b> divides a number exactly: the factors of 12 are 1, 2, 3, 4, 6, 12. A <b>multiple</b> is the number times an integer: 12, 24, 36, …` },
    { h: "Primes", html: T`A prime has exactly two factors, 1 and itself. <b>2 is the only even prime, and 1 is not prime.</b> Primes under 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.` },
    { h: "Prime factorization", html: T`Every integer greater than 1 splits into primes in exactly one way: ⟦360 = 2^3 \cdot 3^2 \cdot 5⟧. The factors, the GCF and the LCM all come from this.` },
    { h: "Number of factors", html: T`If ⟦n = p^a \, q^b \, r^c⟧, then n has ⟦(a+1)(b+1)(c+1)⟧ positive factors. So 360 has ⟦4 \cdot 3 \cdot 2 = 24⟧ factors.` },
    { h: "GCF and LCM", html: T`<b>GCF</b>: shared primes with the <i>smallest</i> powers. <b>LCM</b>: all primes with the <i>largest</i> powers. For positive integers, ⟦\text{GCF} \times \text{LCM} = a \times b⟧.` },
    { h: "Remainders", html: T`⟦n = dq + r⟧ with ⟦0 \le r < d⟧. "n leaves remainder 3 when divided by 5" means ⟦n = 5k + 3⟧: 3, 8, 13, 18, …` },
  ],
  rules: [T`\text{odd} \times \text{odd} = \text{odd}`, T`n = p^a q^b \Rightarrow (a+1)(b+1) \text{ factors}`, T`\text{GCF} \cdot \text{LCM} = ab`, T`n = dq + r,\; 0 \le r < d`],
  widget: "factor",
  examples: [
    { q: T`How many positive factors does 72 have?`, steps: [T`Break 72 into primes: ⟦72 = 8 \times 9 = 2^3 \cdot 3^2⟧.`, T`Add 1 to each exponent: ⟦3 + 1 = 4⟧ and ⟦2 + 1 = 3⟧.`, T`Multiply: ⟦4 \times 3 = 12⟧.`], a: T`12` },
    { q: T`Find the least common multiple of 12 and 18.`, steps: [T`⟦12 = 2^2 \cdot 3⟧ and ⟦18 = 2 \cdot 3^2⟧.`, T`Take the largest power of each prime: ⟦2^2⟧ and ⟦3^2⟧.`, T`⟦2^2 \cdot 3^2 = 36⟧.`], a: T`36` },
    { q: T`When n is divided by 7 the remainder is 4. What is the remainder when 3n is divided by 7?`, steps: [T`Write ⟦n = 7k + 4⟧.`, T`Then ⟦3n = 21k + 12⟧.`, T`⟦21k⟧ is a multiple of 7, so only 12 matters: ⟦12 = 7 + 5⟧.`, T`Shortcut: pick ⟦n = 4⟧. Then ⟦3n = 12⟧, which leaves 5.`], a: T`5` },
  ],
  tips: [T`For remainder questions, pick the smallest number that works.`, T`"Integer" includes negatives and 0 unless the question says "positive".`, T`To test whether a big number divides another, compare their prime factorizations.`],
  traps: [T`1 is not prime.`, T`2 is prime and even, so "all primes are odd" is false.`, T`0 is even, and it is a multiple of every integer.`],
  practice: [
    { t: "mc", q: T`If n is an odd integer, which of the following must be even?`, o: [T`⟦3n⟧`, T`⟦n + 2⟧`, T`⟦n^2 + 1⟧`, T`⟦2n - 1⟧`, T`⟦n^3⟧`], a: 2, why: T`⟦n^2⟧ is odd (odd × odd), and odd + 1 is even. The other choices stay odd.` },
    { t: "ne", q: T`How many positive factors does 180 have?`, a: "18", why: T`⟦180 = 2^2 \cdot 3^2 \cdot 5⟧, so ⟦(2+1)(2+1)(1+1) = 18⟧.` },
    { t: "qc", q: T`p is a prime number greater than 2.`, A: T`The remainder when p is divided by 2`, B: T`⟦1⟧`, a: 2, why: T`Every prime greater than 2 is odd, so it leaves remainder 1.` },
    { t: "ma", q: T`Which of the following are factors of ⟦2^3 \cdot 3 \cdot 5^2⟧? Select all that apply.`, o: ["12", "16", "25", "30", "45"], a: [0, 2, 3], why: T`⟦12 = 2^2 \cdot 3⟧ ✓, ⟦16 = 2^4⟧ ✗, ⟦25 = 5^2⟧ ✓, ⟦30 = 2 \cdot 3 \cdot 5⟧ ✓, ⟦45 = 3^2 \cdot 5⟧ ✗ (only one 3).` },
    { t: "ne", q: T`When the positive integer k is divided by 6, the remainder is 5. What is the remainder when ⟦k + 10⟧ is divided by 6?`, a: "3", why: T`Pick ⟦k = 5⟧: ⟦k + 10 = 15 = 12 + 3⟧.` },
    { t: "qc", q: "", A: T`The greatest common factor of 24 and 60`, B: T`The least common multiple of 4 and 6`, a: 2, why: T`⟦\text{GCF}(24, 60) = 12⟧ and ⟦\text{LCM}(4, 6) = 12⟧.` },
  ]
},
{
  id: "fractions", unit: "Arithmetic", title: "Fractions and decimals", mins: 10,
  idea: T`Compare, add and divide fractions quickly, and know what happens between 0 and 1.`,
  learn: [
    { h: "Add and subtract", html: T`Use a common denominator: ⟦\frac{2}{3} + \frac{1}{4} = \frac{8}{12} + \frac{3}{12} = \frac{11}{12}⟧.` },
    { h: "Multiply and divide", html: T`Multiply straight across: ⟦\frac{2}{3} \times \frac{3}{5} = \frac{2}{5}⟧. To divide, multiply by the reciprocal: ⟦\frac{2}{3} \div \frac{4}{9} = \frac{2}{3} \times \frac{9}{4} = \frac{3}{2}⟧.` },
    { h: "Compare fractions", html: T`Cross-multiply. ⟦\frac{5}{8}⟧ or ⟦\frac{7}{11}⟧? ⟦5 \times 11 = 55⟧ and ⟦7 \times 8 = 56⟧, so ⟦\frac{7}{11}⟧ is bigger.` },
    { h: "Between 0 and 1", html: T`If ⟦0 < x < 1⟧ then ⟦x^2 < x < \sqrt{x}⟧ and ⟦\frac{1}{x} > 1⟧. Squaring makes it smaller; a root makes it bigger.` },
    { h: "Useful decimals", html: T`⟦\frac{1}{8} = 0.125⟧, ⟦\frac{3}{8} = 0.375⟧, ⟦\frac{5}{8} = 0.625⟧, ⟦\frac{1}{6} \approx 0.167⟧, ⟦\frac{2}{3} \approx 0.667⟧.` },
  ],
  rules: [T`\frac{a}{b} \div \frac{c}{d} = \frac{a}{b} \cdot \frac{d}{c}`, T`\frac{a}{b} \;\text{vs}\; \frac{c}{d}: \text{ compare } ad \text{ and } bc`, T`0<x<1 \Rightarrow x^2 < x < \sqrt{x}`],
  widget: "fraction",
  examples: [
    { q: T`Which is greater: ⟦\frac{13}{17}⟧ or ⟦\frac{7}{9}⟧?`, steps: [T`Cross-multiply: ⟦13 \times 9 = 117⟧ and ⟦7 \times 17 = 119⟧.`, T`The larger product belongs to ⟦\frac{7}{9}⟧.`], a: T`⟦\frac{7}{9}⟧` },
    { q: T`Simplify ⟦\dfrac{\frac{1}{2} + \frac{1}{3}}{\frac{1}{2} - \frac{1}{3}}⟧.`, steps: [T`Top: ⟦\frac{3}{6} + \frac{2}{6} = \frac{5}{6}⟧.`, T`Bottom: ⟦\frac{3}{6} - \frac{2}{6} = \frac{1}{6}⟧.`, T`⟦\frac{5}{6} \div \frac{1}{6} = 5⟧.`], a: T`5` },
  ],
  tips: [T`Turn decimals into fractions to multiply: ⟦0.25 \times 48 = \frac{48}{4} = 12⟧.`, T`To compare many fractions, compare each one to ⟦\frac{1}{2}⟧ first.`],
  traps: [T`For negative x, ⟦x^2⟧ is not smaller than x.`, T`Never add denominators: ⟦\frac{1}{2} + \frac{1}{3} \ne \frac{2}{5}⟧.`],
  practice: [
    { t: "qc", q: T`⟦0 < x < 1⟧`, A: T`⟦x^2⟧`, B: T`⟦\sqrt{x}⟧`, a: 1, why: T`Between 0 and 1: ⟦x^2 < x < \sqrt{x}⟧.` },
    { t: "ne", q: T`What is ⟦\frac{3}{4}⟧ of ⟦\frac{2}{3}⟧ of 60?`, a: "30", why: T`⟦\frac{2}{3} \cdot 60 = 40⟧ and ⟦\frac{3}{4} \cdot 40 = 30⟧.` },
    { t: "mc", q: T`Which of the following is greatest?`, o: [T`⟦\frac{5}{9}⟧`, T`⟦\frac{4}{7}⟧`, T`⟦\frac{7}{13}⟧`, T`⟦\frac{6}{11}⟧`, T`⟦\frac{9}{17}⟧`], a: 1, why: T`Each is just above ⟦\frac{1}{2}⟧, by ⟦\frac{1}{18}, \frac{1}{14}, \frac{1}{26}, \frac{1}{22}, \frac{1}{34}⟧. The biggest gap is ⟦\frac{1}{14}⟧, so ⟦\frac{4}{7}⟧.` },
    { t: "ne", q: T`Write 0.625 as a fraction.`, a: "5/8", why: T`⟦0.625 = \frac{625}{1000} = \frac{5}{8}⟧.` },
    { t: "qc", q: "", A: T`⟦\frac{2}{3} \div \frac{4}{9}⟧`, B: T`⟦\frac{2}{3} \times \frac{4}{9}⟧`, a: 0, why: T`⟦A = \frac{2}{3} \cdot \frac{9}{4} = \frac{3}{2}⟧ and ⟦B = \frac{8}{27}⟧.` },
  ]
},
{
  id: "exponents", unit: "Arithmetic", title: "Exponents and roots", mins: 12,
  idea: T`Rewrite everything with the same base, and watch what negatives and fractions do.`,
  learn: [
    { h: "The rules", html: T`⟦a^m a^n = a^{m+n}⟧, ⟦\frac{a^m}{a^n} = a^{m-n}⟧, ⟦(a^m)^n = a^{mn}⟧, ⟦(ab)^n = a^n b^n⟧, ⟦a^0 = 1⟧, ⟦a^{-n} = \frac{1}{a^n}⟧.` },
    { h: "Same base first", html: T`⟦8^4 = (2^3)^4 = 2^{12}⟧ and ⟦4^6 = (2^2)^6 = 2^{12}⟧, so ⟦8^4 = 4^6⟧. Write 4, 8, 16, 32 as powers of 2 and 9, 27, 81 as powers of 3.` },
    { h: "Negative bases", html: T`An <b>even</b> power is positive, an <b>odd</b> power is negative: ⟦(-2)^4 = 16⟧, ⟦(-2)^3 = -8⟧. But ⟦-2^4 = -16⟧: the power is done first.` },
    { h: "Roots", html: T`⟦\sqrt{a}\sqrt{b} = \sqrt{ab}⟧, so ⟦\sqrt{50} = \sqrt{25}\sqrt{2} = 5\sqrt{2}⟧. ⟦\sqrt{9} = 3⟧ only, but ⟦x^2 = 9⟧ has two answers, ⟦x = \pm 3⟧.` },
    { h: "Fractional exponents", html: T`⟦a^{1/2} = \sqrt{a}⟧ and ⟦a^{m/n} = (\sqrt[n]{a})^m⟧: ⟦8^{2/3} = (\sqrt[3]{8})^2 = 4⟧.` },
  ],
  rules: [T`a^m a^n = a^{m+n}`, T`(a^m)^n = a^{mn}`, T`a^{-n} = \frac{1}{a^n}`, T`a^{m/n} = \left(\sqrt[n]{a}\right)^m`, T`\sqrt{ab} = \sqrt{a}\sqrt{b}`],
  widget: "power",
  examples: [
    { q: T`If ⟦2^x \cdot 4^3 = 2^{11}⟧, what is x?`, steps: [T`⟦4^3 = (2^2)^3 = 2^6⟧.`, T`⟦2^x \cdot 2^6 = 2^{x+6}⟧.`, T`⟦x + 6 = 11⟧, so ⟦x = 5⟧.`], a: T`⟦x = 5⟧` },
    { q: T`Simplify ⟦\dfrac{3^8 - 3^6}{3^6}⟧.`, steps: [T`Factor the top: ⟦3^8 - 3^6 = 3^6(3^2 - 1)⟧.`, T`Cancel ⟦3^6⟧.`, T`⟦3^2 - 1 = 8⟧.`], a: T`8` },
  ],
  tips: [T`A sum of powers? Factor out the smallest power.`, T`Compare ⟦2^{30}⟧ and ⟦3^{20}⟧ with the same exponent: ⟦8^{10}⟧ vs ⟦9^{10}⟧.`],
  traps: [T`⟦2^3 + 2^3 = 2^4⟧, not ⟦2^6⟧.`, T`⟦(a+b)^2 \ne a^2 + b^2⟧.`, T`⟦\sqrt{x^2} = |x|⟧, not x.`],
  practice: [
    { t: "ne", q: T`If ⟦9^x = 27^4⟧, what is x?`, a: "6", why: T`⟦3^{2x} = 3^{12}⟧, so ⟦x = 6⟧.` },
    { t: "mc", q: T`⟦2^{20} + 2^{20} =⟧`, o: [T`⟦2^{21}⟧`, T`⟦2^{40}⟧`, T`⟦4^{20}⟧`, T`⟦4^{40}⟧`, T`⟦2^{400}⟧`], a: 0, why: T`⟦2^{20} + 2^{20} = 2 \cdot 2^{20} = 2^{21}⟧.` },
    { t: "qc", q: T`⟦x < 0⟧`, A: T`⟦x^3⟧`, B: T`⟦x^2⟧`, a: 1, why: T`For negative x, ⟦x^3 < 0 < x^2⟧.` },
    { t: "ne", q: T`What is ⟦16^{3/4}⟧?`, a: "8", why: T`⟦\sqrt[4]{16} = 2⟧ and ⟦2^3 = 8⟧.` },
    { t: "qc", q: "", A: T`⟦\sqrt{75} - \sqrt{27}⟧`, B: T`⟦\sqrt{12}⟧`, a: 2, why: T`⟦5\sqrt{3} - 3\sqrt{3} = 2\sqrt{3} = \sqrt{12}⟧.` },
    { t: "ma", q: T`⟦x^2 = 16⟧. Which could be the value of x? Select all that apply.`, o: ["⟦-4⟧", "⟦-2⟧", "⟦2⟧", "⟦4⟧", "⟦8⟧"], a: [0, 3], why: T`⟦x = \pm 4⟧.` },
  ]
},
{
  id: "percent", unit: "Arithmetic", title: "Percents and percent change", mins: 12,
  idea: T`Percent change is measured from the starting value, and changes multiply.`,
  learn: [
    { h: "Percent means ÷ 100", html: T`⟦35\% \text{ of } 80 = 0.35 \times 80 = 28⟧. "What percent of 80 is 28?" ⟦\frac{28}{80} = 35\%⟧.` },
    { h: "Percent change", html: T`⟦\text{change} = \dfrac{\text{new} - \text{old}}{\text{old}} \times 100\%⟧. From 50 to 65 is ⟦+30\%⟧; from 65 to 50 is about ⟦-23\%⟧.` },
    { h: "Multipliers", html: T`Up 20% is ⟦\times 1.2⟧; down 20% is ⟦\times 0.8⟧. Both together: ⟦1.2 \times 0.8 = 0.96⟧, a <b>4% loss</b>.` },
    { h: "Going backwards", html: T`After a 25% rise the price is 150. The original is ⟦\frac{150}{1.25} = 120⟧.` },
    { h: "Percentage points", html: T`From 10% to 15% is up 5 percentage points, but up 50 percent.` },
  ],
  rules: [T`\%\,\text{change} = \frac{\text{new}-\text{old}}{\text{old}}`, T`\text{up } r\% : \times\left(1+\tfrac{r}{100}\right)`, T`\text{down } r\% : \times\left(1-\tfrac{r}{100}\right)`, T`\text{original} = \frac{\text{new}}{\text{multiplier}}`],
  widget: "percent",
  examples: [
    { q: T`A shirt costs $40. It goes up 25%, then down 20%. What is the final price?`, steps: [T`Up 25%: ⟦40 \times 1.25 = 50⟧.`, T`Down 20%: ⟦50 \times 0.8 = 40⟧.`, T`In one step: ⟦1.25 \times 0.8 = 1⟧, no change.`], a: T`$40` },
    { q: T`After a 30% discount a coat costs $84. What was the price before?`, steps: [T`30% off leaves 70%: ⟦\times 0.7⟧.`, T`⟦0.7p = 84⟧.`, T`⟦p = \frac{84}{0.7} = 120⟧.`], a: T`$120` },
  ],
  tips: [T`No number given? Start with 100.`, T`10% is easy (move the decimal point), and 15% = 10% + 5%.`],
  traps: [T`Up x% then down x% is always a loss.`, T`The base of a percent change is the old value.`],
  practice: [
    { t: "ne", q: T`A town grew from 2,400 to 2,700 people. By what percent did it grow?`, a: "12.5", unit: "%", why: T`⟦\frac{300}{2400} = 0.125 = 12.5\%⟧.` },
    { t: "qc", q: T`A price rises by 10% and then falls by 10%.`, A: T`The final price`, B: T`The original price`, a: 1, why: T`⟦1.1 \times 0.9 = 0.99⟧: 1% lower.` },
    { t: "mc", q: T`After a 20% raise, Ana earns $3,000 a month. What did she earn before?`, o: ["$2,400", "$2,500", "$2,600", "$2,700", "$2,750"], a: 1, why: T`⟦\frac{3000}{1.2} = 2500⟧.` },
    { t: "ne", q: T`x is 40% of y, and y is 25% of z. x is what percent of z?`, a: "10", unit: "%", why: T`⟦x = 0.4 \times 0.25\,z = 0.1z⟧.` },
    { t: "qc", q: T`Store P takes 30% off a $200 TV. Store Q takes 20% off, then 10% off the new price.`, A: T`Price at store P`, B: T`Price at store Q`, a: 1, why: T`⟦P = 200(0.7) = 140⟧, ⟦Q = 200(0.8)(0.9) = 144⟧.` },
  ]
},
{
  id: "ratios", unit: "Arithmetic", title: "Ratios and proportions", mins: 10,
  idea: T`A ratio is parts. Add the parts to get the whole, then scale.`,
  learn: [
    { h: "Parts and the whole", html: T`Boys : girls ⟦= 3 : 5⟧ means 8 parts in all. With 40 students, one part ⟦= \frac{40}{8} = 5⟧: 15 boys, 25 girls.` },
    { h: "Proportions", html: T`⟦\frac{a}{b} = \frac{c}{d} \Rightarrow ad = bc⟧. 3 pens cost $4.50, so 7 pens: ⟦\frac{3}{4.5} = \frac{7}{x} \Rightarrow x = 10.5⟧.` },
    { h: "Combining ratios", html: T`⟦a:b = 2:3⟧ and ⟦b:c = 4:5⟧. Make b equal: ⟦8:12⟧ and ⟦12:15⟧, so ⟦a:b:c = 8:12:15⟧.` },
    { h: "Changing ratios", html: T`Write the amounts as 3x and 5x, make the change, and set the new ratio equal.` },
  ],
  rules: [T`\text{part} = \text{total} \cdot \frac{\text{its parts}}{\text{all parts}}`, T`\frac{a}{b} = \frac{c}{d} \iff ad = bc`],
  widget: "ratio",
  examples: [
    { q: T`Cats : dogs ⟦= 4 : 7⟧, and there are 12 more dogs than cats. How many animals are there?`, steps: [T`Cats ⟦= 4x⟧, dogs ⟦= 7x⟧.`, T`⟦7x - 4x = 12 \Rightarrow x = 4⟧.`, T`Total ⟦= 11x = 44⟧.`], a: T`44` },
    { q: T`Red : blue marbles ⟦= 2 : 3⟧. After 6 red are added the ratio is ⟦1 : 1⟧. How many blue?`, steps: [T`Red ⟦= 2x⟧, blue ⟦= 3x⟧.`, T`⟦\frac{2x + 6}{3x} = 1 \Rightarrow x = 6⟧.`, T`Blue ⟦= 3x = 18⟧.`], a: T`18` },
  ],
  tips: [T`A ratio alone never gives the actual numbers.`, T`The total must be a multiple of the sum of the parts.`],
  traps: [T`⟦3 : 5⟧ means ⟦\frac{3}{8}⟧ of the total, not ⟦\frac{3}{5}⟧.`],
  practice: [
    { t: "ne", q: T`Flour and sugar are mixed ⟦5 : 2⟧. How many grams of sugar are in 840 g of the mix?`, a: "240", why: T`One part ⟦= \frac{840}{7} = 120⟧; sugar ⟦= 2 \times 120 = 240⟧.` },
    { t: "qc", q: T`The ratio of x to y is 3 to 4.`, A: T`⟦x⟧`, B: T`⟦y⟧`, a: 3, why: T`Positive (3, 4): y is bigger. Negative (−3, −4): x is bigger.` },
    { t: "mc", q: T`⟦a : b = 3 : 4⟧ and ⟦b : c = 6 : 7⟧. What is ⟦a : c⟧?`, o: ["⟦1 : 2⟧", "⟦9 : 14⟧", "⟦3 : 7⟧", "⟦18 : 21⟧", "⟦2 : 3⟧"], a: 1, why: T`Make ⟦b = 12⟧: ⟦9 : 12⟧ and ⟦12 : 14⟧, so ⟦a : c = 9 : 14⟧.` },
    { t: "ma", q: T`Boys : girls ⟦= 2 : 3⟧. Which could be the class size? Select all that apply.`, o: ["12", "15", "20", "24", "35"], a: [1, 2, 4], why: T`The total must be a multiple of 5.` },
    { t: "ne", q: T`6 workers build a wall in 10 days. How many days do 4 workers need?`, a: "15", why: T`⟦6 \times 10 = 60⟧ worker-days; ⟦\frac{60}{4} = 15⟧.` },
  ]
},
{
  id: "absval", unit: "Arithmetic", title: "Number line and absolute value", mins: 8,
  idea: T`⟦|x - a|⟧ is the distance between x and a on the number line.`,
  learn: [
    { h: "Absolute value is distance", html: T`⟦|-5| = |5| = 5⟧. <b>⟦|x - a|⟧ is the distance from x to a</b>, so ⟦|x - 3| = 4⟧ means ⟦x = 7⟧ or ⟦x = -1⟧.` },
    { h: "Two cases", html: T`⟦|2x - 1| = 7 \Rightarrow 2x - 1 = 7⟧ or ⟦2x - 1 = -7⟧, so ⟦x = 4⟧ or ⟦x = -3⟧.` },
    { h: "Order on the line", html: T`Further right is bigger: ⟦-10 < -2 < 0⟧.` },
  ],
  rules: [T`|x - a| = \text{distance from } x \text{ to } a`, T`|x| = k \Rightarrow x = \pm k`, T`|x| \ge 0`],
  widget: "numline",
  examples: [
    { q: T`What is the sum of all x with ⟦|x + 2| = 5⟧?`, steps: [T`⟦|x - (-2)| = 5⟧: x is 5 away from ⟦-2⟧.`, T`⟦x = 3⟧ or ⟦x = -7⟧.`, T`Sum ⟦= -4⟧.`], a: T`⟦-4⟧` },
  ],
  tips: [T`Draw the number line: distance pictures are faster than algebra.`],
  traps: [T`⟦|x| = -3⟧ has no solution.`, T`⟦|a + b| \le |a| + |b|⟧, and they are not always equal.`],
  practice: [
    { t: "ne", q: T`What is the product of the two solutions of ⟦|x - 4| = 6⟧?`, a: "-20", why: T`⟦x = 10⟧ or ⟦x = -2⟧; product ⟦-20⟧.` },
    { t: "qc", q: "", A: T`⟦|a + b|⟧`, B: T`⟦|a| + |b|⟧`, a: 3, why: T`Equal when a and b have the same sign; A is smaller when the signs differ.` },
    { t: "mc", q: T`On a number line P is at ⟦-3⟧ and Q is at 9. What number is halfway between them?`, o: ["2", "3", "4", "6", "12"], a: 1, why: T`⟦\frac{-3 + 9}{2} = 3⟧.` },
    { t: "ma", q: T`⟦|x - 1| < 3⟧ and x is an integer. Which could be x? Select all that apply.`, o: ["⟦-3⟧", "⟦-1⟧", "⟦0⟧", "⟦3⟧", "⟦4⟧"], a: [1, 2, 3], why: T`⟦-2 < x < 4⟧.` },
  ]
},
{
  id: "interest", unit: "Arithmetic", title: "Simple and compound interest", mins: 8,
  idea: T`Simple interest adds the same amount each year; compound interest multiplies.`,
  learn: [
    { h: "Simple interest", html: T`⟦I = Prt⟧. $1,000 at 5% for 3 years: ⟦1000 \times 0.05 \times 3 = 150⟧.` },
    { h: "Compound interest", html: T`⟦A = P(1 + r)^t⟧. $1,000 at 5% for 3 years: ⟦1000(1.05)^3 \approx 1157.63⟧.` },
    { h: "n times a year", html: T`⟦A = P\left(1 + \frac{r}{n}\right)^{nt}⟧. Quarterly at 8% for a year: ⟦(1.02)^4⟧.` },
  ],
  rules: [T`A = P(1 + rt)`, T`A = P(1 + r)^t`, T`A = P\left(1 + \tfrac{r}{n}\right)^{nt}`],
  widget: "interest",
  examples: [
    { q: T`$2,000 is invested at 10% compounded yearly. How much is there after 2 years?`, steps: [T`Multiplier: 1.1 a year.`, T`⟦2000 \times 1.1 = 2200⟧.`, T`⟦2200 \times 1.1 = 2420⟧.`], a: T`$2,420` },
  ],
  tips: [T`Compound interest is never less than simple interest at the same rate (for ⟦t \ge 1⟧).`],
  traps: [T`Use the rate as a decimal: ⟦6\% = 0.06⟧.`],
  practice: [
    { t: "ne", q: T`What simple interest does $3,000 earn at 4% a year for 5 years?`, a: "600", unit: "$", why: T`⟦3000 \times 0.04 \times 5 = 600⟧.` },
    { t: "qc", q: T`$1,000 is invested for 2 years at 10% a year.`, A: T`Total with interest compounded yearly`, B: T`$1,200`, a: 0, why: T`⟦1000(1.1)^2 = 1210 > 1200⟧.` },
    { t: "mc", q: T`An investment doubles every 6 years. $500 is invested now. How much is there after 18 years?`, o: ["$1,500", "$2,000", "$3,000", "$4,000", "$9,000"], a: 3, why: T`3 doublings: ⟦500 \times 2^3 = 4000⟧.` },
  ]
}
);
