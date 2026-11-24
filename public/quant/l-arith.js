/* GRE Quant lessons: Arithmetic.
   A lesson: id, unit, title, idea, learn (sections: h + html), rules, widget, examples (q, steps, a), tips, traps, practice.
   Questions: mc (one answer), ma (select all that apply, a = list), qc (quantitative comparison, a = 0 A / 1 B / 2 equal / 3 can't tell), ne (numeric entry). */
window.QL = window.QL || [];
QL.push(
{
  id: "integers", unit: "Arithmetic", title: "Integers, factors and primes", mins: 12,
  idea: "Most GRE number questions are about how integers break into prime factors.",
  learn: [
    { h: "Odd and even", html: "Even × anything = even. Odd × odd = odd. Even ± even = even, odd ± odd = even, odd ± even = odd. <b>0 is even.</b>" },
    { h: "Factors and multiples", html: "A <b>factor</b> divides a number exactly (factors of 12: 1, 2, 3, 4, 6, 12). A <b>multiple</b> is the number times an integer (multiples of 12: 12, 24, 36…). Every integer is a factor and a multiple of itself." },
    { h: "Primes", html: "A prime has exactly two factors: 1 and itself. <b>2 is the only even prime; 1 is not prime.</b> Primes under 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29." },
    { h: "Prime factorization", html: "Every integer > 1 is a product of primes in one way: 360 = 2³ × 3² × 5. From it you get everything: the factors, the number of factors, the GCF and the LCM." },
    { h: "Number of factors", html: "If n = p<sup>a</sup> × q<sup>b</sup> × r<sup>c</sup>, then n has <b>(a+1)(b+1)(c+1)</b> positive factors. 360 = 2³·3²·5 has 4·3·2 = 24 factors." },
    { h: "GCF and LCM", html: "<b>GCF</b>: take shared primes with the <i>smallest</i> powers. <b>LCM</b>: take all primes with the <i>largest</i> powers. For any two positive integers, GCF × LCM = a × b." },
    { h: "Remainders", html: "n = (divisor × quotient) + remainder, and 0 ≤ remainder < divisor. \"n leaves remainder 3 when divided by 5\" means n = 5k + 3: 3, 8, 13, 18…" },
  ],
  rules: ["Even × integer = even", "Odd × odd = odd", "# factors of p^a·q^b = (a+1)(b+1)", "GCF × LCM = a × b", "n = dq + r, 0 ≤ r < d"],
  widget: "factor",
  examples: [
    { q: "How many positive factors does 72 have?", steps: ["Break 72 into primes: 72 = 8 × 9 = 2³ × 3².", "Add 1 to each power: (3 + 1) and (2 + 1).", "Multiply: 4 × 3 = 12."], a: "12 factors" },
    { q: "What is the least common multiple of 12 and 18?", steps: ["12 = 2² × 3 and 18 = 2 × 3².", "LCM takes the largest power of each prime: 2² and 3².", "2² × 3² = 4 × 9 = 36."], a: "36" },
    { q: "When n is divided by 7, the remainder is 4. What is the remainder when 3n is divided by 7?", steps: ["Write n = 7k + 4.", "3n = 21k + 12.", "21k is a multiple of 7, so only 12 matters: 12 = 7 + 5.", "Shortcut: just pick n = 4. Then 3n = 12, and 12 ÷ 7 leaves 5."], a: "5" },
  ],
  tips: ["Pick numbers for remainder questions: use the smallest n that works.", "\"Integer\" includes negatives and 0 unless it says \"positive\".", "To test a big number for a factor, check its prime factorization, not long division."],
  traps: ["1 is not prime.", "2 is prime and even, so \"all primes are odd\" is false.", "0 is a multiple of every integer, and it is even."],
  practice: [
    { t: "mc", q: "If n is an odd integer, which of the following must be even?", o: ["3n", "n + 2", "n² + 1", "2n − 1", "n³"], a: 2, why: "n² is odd (odd × odd), and odd + 1 is even. The others stay odd." },
    { t: "ne", q: "How many positive factors does 180 have?", a: "18", why: "180 = 2² × 3² × 5, so (2+1)(2+1)(1+1) = 18." },
    { t: "qc", q: "p is a prime number greater than 2.", A: "The remainder when p is divided by 2", B: "1", a: 2, why: "Every prime greater than 2 is odd, so dividing by 2 always leaves 1." },
    { t: "ma", q: "Which of the following are factors of 2³ × 3 × 5²? Select all that apply.", o: ["12", "16", "25", "30", "45"], a: [0, 2, 3], why: "12 = 2²·3 ✓, 16 = 2⁴ ✗ (only 2³), 25 = 5² ✓, 30 = 2·3·5 ✓, 45 = 3²·5 ✗ (only one 3)." },
    { t: "ne", q: "When the positive integer k is divided by 6, the remainder is 5. What is the remainder when k + 10 is divided by 6?", a: "3", why: "Pick k = 5: k + 10 = 15, and 15 = 12 + 3." },
    { t: "qc", q: "", A: "The greatest common factor of 24 and 60", B: "The least common multiple of 4 and 6", a: 2, why: "GCF(24, 60) = 12 and LCM(4, 6) = 12. They are equal." },
  ]
},
{
  id: "fractions", unit: "Arithmetic", title: "Fractions and decimals", mins: 10,
  idea: "Compare, add and divide fractions quickly, and know what happens to numbers between 0 and 1.",
  learn: [
    { h: "Add and subtract", html: "Use a common denominator: 2/3 + 1/4 = 8/12 + 3/12 = 11/12." },
    { h: "Multiply and divide", html: "Multiply straight across: 2/3 × 3/5 = 6/15 = 2/5. To divide, multiply by the reciprocal: 2/3 ÷ 4/9 = 2/3 × 9/4 = 3/2." },
    { h: "Compare fractions", html: "Cross-multiply: is 5/8 or 7/11 bigger? 5 × 11 = 55 and 7 × 8 = 56, so 7/11 is bigger." },
    { h: "Numbers between 0 and 1", html: "For 0 &lt; x &lt; 1: x² &lt; x &lt; √x, and 1/x &gt; 1. Squaring makes it smaller; taking a root makes it bigger." },
    { h: "Decimals and place value", html: "0.375 = 375/1000 = 3/8. Learn these: 1/8 = 0.125, 1/6 ≈ 0.167, 1/3 ≈ 0.333, 3/8 = 0.375, 5/8 = 0.625, 2/3 ≈ 0.667." },
  ],
  rules: ["a/b ÷ c/d = a/b × d/c", "Compare a/b and c/d: compare ad and bc", "0 < x < 1 → x² < x < √x"],
  widget: "fraction",
  examples: [
    { q: "Which is greater: 13/17 or 7/9?", steps: ["Cross-multiply: 13 × 9 = 117 and 7 × 17 = 119.", "The bigger product goes with the fraction on top of it: 119 belongs to 7/9."], a: "7/9" },
    { q: "Simplify (1/2 + 1/3) ÷ (1/2 − 1/3).", steps: ["Top: 1/2 + 1/3 = 3/6 + 2/6 = 5/6.", "Bottom: 1/2 − 1/3 = 3/6 − 2/6 = 1/6.", "5/6 ÷ 1/6 = 5/6 × 6 = 5."], a: "5" },
  ],
  tips: ["Turn decimals into fractions when you multiply: 0.25 × 48 = 48/4 = 12.", "To compare many fractions, compare each to 1/2 first."],
  traps: ["For negative x, x² is not smaller than x.", "Adding fractions: never add the denominators."],
  practice: [
    { t: "qc", q: "0 < x < 1", A: "x²", B: "√x", a: 1, why: "Between 0 and 1, squaring makes a number smaller and a root makes it bigger: x² < x < √x." },
    { t: "ne", q: "What is 3/4 of 2/3 of 60?", a: "30", why: "2/3 of 60 = 40, and 3/4 of 40 = 30." },
    { t: "mc", q: "Which of the following is greatest?", o: ["5/9", "4/7", "7/13", "6/11", "9/17"], a: 1, why: "Compare each to 1/2: 5/9 is 1/18 above, 4/7 is 1/14 above, 7/13 is 1/26 above, 6/11 is 1/22 above, 9/17 is 1/34 above. 1/14 is the biggest gap." },
    { t: "ne", q: "Write 0.625 as a fraction in lowest terms.", a: "5/8", why: "0.625 = 625/1000 = 5/8." },
    { t: "qc", q: "", A: "(2/3) ÷ (4/9)", B: "(2/3) × (4/9)", a: 0, why: "A = 2/3 × 9/4 = 3/2. B = 8/27. A is greater." },
  ]
},
{
  id: "exponents", unit: "Arithmetic", title: "Exponents and roots", mins: 12,
  idea: "Rewrite everything with the same base, and watch what negatives and fractions do.",
  learn: [
    { h: "The rules", html: "a<sup>m</sup>·a<sup>n</sup> = a<sup>m+n</sup> · a<sup>m</sup>/a<sup>n</sup> = a<sup>m−n</sup> · (a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup> · (ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup> · a<sup>0</sup> = 1 · a<sup>−n</sup> = 1/a<sup>n</sup>" },
    { h: "Same base first", html: "8<sup>4</sup> = (2³)<sup>4</sup> = 2<sup>12</sup>, and 4<sup>6</sup> = 2<sup>12</sup>. So 8<sup>4</sup> = 4<sup>6</sup>. Turn 4, 8, 16, 32 into powers of 2 and 9, 27, 81 into powers of 3." },
    { h: "Negative bases", html: "A negative number to an <b>even</b> power is positive; to an <b>odd</b> power it is negative: (−2)⁴ = 16, (−2)³ = −8. But −2⁴ = −16 (the power comes first)." },
    { h: "Roots", html: "√a × √b = √(ab), so √50 = √25·√2 = 5√2. √x means the positive root only: √9 = 3. But x² = 9 has two answers: x = 3 or −3." },
    { h: "Fractional exponents", html: "a<sup>1/2</sup> = √a and a<sup>m/n</sup> = (ⁿ√a)<sup>m</sup>: 8<sup>2/3</sup> = (∛8)² = 4." },
  ],
  rules: ["a^m·a^n = a^(m+n)", "(a^m)^n = a^(mn)", "a^−n = 1/a^n", "a^0 = 1", "√(ab) = √a·√b", "a^(m/n) = (ⁿ√a)^m"],
  widget: "power",
  examples: [
    { q: "If 2<sup>x</sup> · 4<sup>3</sup> = 2<sup>11</sup>, what is x?", steps: ["Rewrite 4³ as (2²)³ = 2⁶.", "2<sup>x</sup> · 2⁶ = 2<sup>x+6</sup>.", "x + 6 = 11, so x = 5."], a: "5" },
    { q: "Simplify (3<sup>8</sup> − 3<sup>6</sup>) / 3<sup>6</sup>.", steps: ["Factor out 3⁶ on top: 3⁶(3² − 1).", "Cancel 3⁶ with the bottom.", "3² − 1 = 8."], a: "8" },
  ],
  tips: ["When you see a sum of powers, factor out the smallest power.", "Compare 2³⁰ and 3²⁰: write both as a power of 10: (2³)¹⁰ = 8¹⁰ and (3²)¹⁰ = 9¹⁰, so 3²⁰ is bigger."],
  traps: ["2³ + 2³ = 2·2³ = 2⁴, not 2⁶.", "(a + b)² is not a² + b².", "√(x²) = |x|, not x."],
  practice: [
    { t: "ne", q: "If 9<sup>x</sup> = 27<sup>4</sup>, what is x?", a: "6", why: "9<sup>x</sup> = 3<sup>2x</sup> and 27⁴ = 3<sup>12</sup>, so 2x = 12 and x = 6." },
    { t: "mc", q: "2<sup>20</sup> + 2<sup>20</sup> = ?", o: ["2<sup>21</sup>", "2<sup>40</sup>", "4<sup>20</sup>", "4<sup>40</sup>", "2<sup>400</sup>"], a: 0, why: "2²⁰ + 2²⁰ = 2 × 2²⁰ = 2²¹." },
    { t: "qc", q: "x < 0", A: "x³", B: "x²", a: 1, why: "For negative x, x³ is negative and x² is positive." },
    { t: "ne", q: "What is 16<sup>3/4</sup>?", a: "8", why: "⁴√16 = 2, and 2³ = 8." },
    { t: "qc", q: "", A: "√75 − √27", B: "√12", a: 2, why: "√75 = 5√3 and √27 = 3√3, so A = 2√3. √12 = 2√3. Equal." },
    { t: "ma", q: "x² = 16. Which of the following could be the value of x? Select all that apply.", o: ["−4", "−2", "2", "4", "8"], a: [0, 3], why: "x² = 16 gives x = 4 or x = −4." },
  ]
},
{
  id: "percent", unit: "Arithmetic", title: "Percents and percent change", mins: 12,
  idea: "Percent change is always about the starting value, and changes multiply.",
  learn: [
    { h: "Percent means ÷ 100", html: "35% of 80 = 0.35 × 80 = 28. \"What percent of 80 is 28?\" → 28/80 = 0.35 = 35%." },
    { h: "Percent change", html: "Percent change = (new − old) / old × 100%. From 50 to 65 is +15/50 = +30%. From 65 to 50 is −15/65 ≈ −23%. Same difference, different base." },
    { h: "Multipliers", html: "Up 20% → × 1.2. Down 20% → × 0.8. Up 20% then down 20% → × 1.2 × 0.8 = × 0.96, a <b>4% loss</b>, not 0%." },
    { h: "Going backwards", html: "After a 25% increase the price is $150. The original is 150 / 1.25 = $120 (not 150 − 25%)." },
    { h: "Percentage points", html: "From 10% to 15% is up 5 percentage points, but up 50% percent." },
  ],
  rules: ["% change = (new − old)/old × 100", "Up r% → × (1 + r/100)", "Down r% → × (1 − r/100)", "Original = new ÷ multiplier"],
  widget: "percent",
  examples: [
    { q: "A shirt costs $40. It goes up 25%, then down 20%. What is the final price?", steps: ["Up 25%: × 1.25 → $50.", "Down 20%: × 0.8 → $40.", "Or in one step: 1.25 × 0.8 = 1, no change."], a: "$40" },
    { q: "After a 30% discount a coat costs $84. What was the price before?", steps: ["A 30% discount leaves 70%: × 0.7.", "original × 0.7 = 84.", "original = 84 / 0.7 = 120."], a: "$120" },
  ],
  tips: ["Use 100 as the starting number when no number is given.", "10% is easy: move the decimal point. 15% = 10% + 5%."],
  traps: ["Up x% then down x% is always a loss.", "The base of a percent change is the OLD value."],
  practice: [
    { t: "ne", q: "A town's population grew from 2,400 to 2,700. By what percent did it grow?", a: "12.5", unit: "%", why: "300 / 2400 = 0.125 = 12.5%." },
    { t: "qc", q: "A price is increased by 10% and then decreased by 10%.", A: "The final price", B: "The original price", a: 1, why: "1.1 × 0.9 = 0.99, so the final price is 1% lower." },
    { t: "mc", q: "After a 20% raise, Ana earns $3,000 a month. What did she earn before the raise?", o: ["$2,400", "$2,500", "$2,600", "$2,700", "$2,750"], a: 1, why: "3000 / 1.2 = 2500." },
    { t: "ne", q: "x is 40% of y, and y is 25% of z. x is what percent of z?", a: "10", unit: "%", why: "x = 0.4 × 0.25 z = 0.1 z." },
    { t: "qc", q: "Store P discounts a $200 TV by 30%. Store Q discounts the same TV by 20% and then 10% off the new price.", A: "Price at Store P", B: "Price at Store Q", a: 1, why: "P: 200 × 0.7 = 140. Q: 200 × 0.8 × 0.9 = 144. Q is more expensive." },
  ]
},
{
  id: "ratios", unit: "Arithmetic", title: "Ratios and proportions", mins: 10,
  idea: "A ratio is parts. Add the parts to get the whole, then scale.",
  learn: [
    { h: "Parts and the whole", html: "Boys : girls = 3 : 5 means 3 parts boys, 5 parts girls, 8 parts in total. With 40 students: one part = 40/8 = 5, so 15 boys and 25 girls." },
    { h: "Proportions", html: "If a/b = c/d then ad = bc. 3 pens cost $4.50, so 7 pens cost x: 3/4.5 = 7/x → x = 10.50." },
    { h: "Combining ratios", html: "a : b = 2 : 3 and b : c = 4 : 5. Make b the same: 8 : 12 and 12 : 15 → a : b : c = 8 : 12 : 15." },
    { h: "Changing ratios", html: "Write the amounts as 3x and 5x, make the change, and set up the new ratio as an equation." },
  ],
  rules: ["Part = whole × part/total parts", "a/b = c/d ⇔ ad = bc", "Match the shared term to combine ratios"],
  widget: "ratio",
  examples: [
    { q: "The ratio of cats to dogs is 4 : 7. There are 12 more dogs than cats. How many animals are there?", steps: ["Cats = 4x, dogs = 7x.", "7x − 4x = 12, so x = 4.", "Total = 11x = 44."], a: "44" },
    { q: "A bag has red and blue marbles in the ratio 2 : 3. After 6 red marbles are added, the ratio is 1 : 1. How many blue marbles are there?", steps: ["Red = 2x, blue = 3x.", "(2x + 6) / 3x = 1, so 2x + 6 = 3x and x = 6.", "Blue = 3x = 18."], a: "18" },
  ],
  tips: ["A ratio alone never tells you the actual numbers.", "Total must be a multiple of the sum of the ratio parts."],
  traps: ["3 : 5 does not mean 3/5 of the total. It means 3/8 of the total."],
  practice: [
    { t: "ne", q: "Flour and sugar are mixed in the ratio 5 : 2. How many grams of sugar are in 840 g of the mix?", a: "240", why: "One part = 840/7 = 120, and sugar is 2 parts = 240 g." },
    { t: "qc", q: "The ratio of x to y is 3 to 4.", A: "x", B: "y", a: 3, why: "If x and y are positive, y is bigger; if they are negative (x = −3, y = −4), x is bigger. Can't tell." },
    { t: "mc", q: "a : b = 3 : 4 and b : c = 6 : 7. What is a : c?", o: ["1 : 2", "9 : 14", "3 : 7", "18 : 21", "2 : 3"], a: 1, why: "Make b = 12: a : b = 9 : 12 and b : c = 12 : 14. So a : c = 9 : 14." },
    { t: "ma", q: "A class has boys and girls in the ratio 2 : 3. Which could be the number of students in the class? Select all that apply.", o: ["12", "15", "20", "24", "35"], a: [1, 2, 4], why: "The total must be a multiple of 5: 15, 20 and 35." },
    { t: "ne", q: "If 6 workers build a wall in 10 days, how many days do 4 workers need, working at the same rate?", a: "15", why: "Total work = 6 × 10 = 60 worker-days. 60 / 4 = 15 days." },
  ]
},
{
  id: "absval", unit: "Arithmetic", title: "Number line and absolute value", mins: 8,
  idea: "|x − a| is the distance between x and a on the number line.",
  learn: [
    { h: "Absolute value is distance", html: "|−5| = 5 and |5| = 5. <b>|x − a| is the distance from x to a.</b> So |x − 3| = 4 means x is 4 away from 3: x = 7 or x = −1." },
    { h: "Two cases", html: "Solve |2x − 1| = 7 as 2x − 1 = 7 or 2x − 1 = −7: x = 4 or x = −3." },
    { h: "Number line order", html: "Further right is bigger: −10 &lt; −2 &lt; 0. For negatives, bigger size means smaller value." },
  ],
  rules: ["|x − a| = distance from x to a", "|x| = k → x = k or x = −k", "|x| ≥ 0 always"],
  widget: "numline",
  examples: [
    { q: "What is the sum of all values of x that satisfy |x + 2| = 5?", steps: ["|x − (−2)| = 5: x is 5 away from −2.", "x = 3 or x = −7.", "Sum = 3 + (−7) = −4."], a: "−4" },
  ],
  tips: ["Draw the number line. Distance pictures are faster than algebra."],
  traps: ["|x| = −3 has no solution.", "|a + b| is not always |a| + |b| (try a = 3, b = −3)."],
  practice: [
    { t: "ne", q: "What is the product of the two solutions of |x − 4| = 6?", a: "-20", why: "x = 10 or x = −2. Product = −20." },
    { t: "qc", q: "", A: "|a + b|", B: "|a| + |b|", a: 3, why: "Equal if a and b have the same sign (or one is 0); A is smaller if the signs differ. B is never smaller, but it can be equal, so it can't be determined." },
    { t: "mc", q: "On the number line, point P is at −3 and point Q is at 9. What number is halfway between them?", o: ["2", "3", "4", "6", "12"], a: 1, why: "(−3 + 9) / 2 = 3." },
    { t: "ma", q: "|x − 1| < 3 and x is an integer. Which could be x? Select all that apply.", o: ["−3", "−1", "0", "3", "4"], a: [1, 2, 3], why: "|x − 1| < 3 means −2 < x < 4: −1, 0 and 3 work." },
  ]
},
{
  id: "interest", unit: "Arithmetic", title: "Simple and compound interest", mins: 8,
  idea: "Simple interest adds the same amount each year; compound interest multiplies.",
  learn: [
    { h: "Simple interest", html: "Interest = P × r × t. $1,000 at 5% for 3 years: 1000 × 0.05 × 3 = $150, total $1,150." },
    { h: "Compound interest", html: "Total = P(1 + r)<sup>t</sup> when compounded once a year. $1,000 at 5% for 3 years: 1000 × 1.05³ = $1,157.63." },
    { h: "Compounded n times a year", html: "Total = P(1 + r/n)<sup>nt</sup>. Quarterly at 8% for 1 year: (1.02)⁴." },
  ],
  rules: ["Simple: A = P(1 + rt)", "Compound: A = P(1 + r)^t", "n times a year: A = P(1 + r/n)^(nt)"],
  widget: "interest",
  examples: [
    { q: "$2,000 is invested at 10% interest compounded every year. How much is there after 2 years?", steps: ["Multiplier per year: 1.10.", "2000 × 1.1 = 2200 after year 1.", "2200 × 1.1 = 2420 after year 2."], a: "$2,420" },
  ],
  tips: ["Compound interest is always at least as much as simple interest at the same rate (for t ≥ 1)."],
  traps: ["Use the rate as a decimal: 6% = 0.06."],
  practice: [
    { t: "ne", q: "How much simple interest does $3,000 earn at 4% a year for 5 years?", a: "600", unit: "$", why: "3000 × 0.04 × 5 = 600." },
    { t: "qc", q: "$1,000 is invested for 2 years at 10% a year.", A: "Total with interest compounded yearly", B: "$1,200", a: 0, why: "Compound: 1000 × 1.1² = 1210 > 1200 (simple)." },
    { t: "mc", q: "An amount doubles every 6 years. If $500 is invested now, how much is there after 18 years?", o: ["$1,500", "$2,000", "$3,000", "$4,000", "$9,000"], a: 3, why: "18 years = 3 doublings: 500 × 2³ = 4000." },
  ]
}
);
