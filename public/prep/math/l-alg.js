/* GRE Quant lessons: Algebra. Maths between ⟦ and ⟧ (KaTeX). */
var T = String.raw;
window.QL = window.QL || [];
QL.push(
{
  id: "linear", unit: "Algebra", title: "Linear equations and systems", mins: 10,
  idea: T`Do the same thing to both sides. With two equations, add or subtract them to remove a variable.`,
  learn: [
    { h: "One variable", html: T`⟦3(x - 2) = x + 8 \;\Rightarrow\; 3x - 6 = x + 8 \;\Rightarrow\; 2x = 14 \;\Rightarrow\; x = 7⟧.` },
    { h: "Elimination", html: T`⟦x + y = 10⟧ and ⟦x - y = 4⟧. Add them: ⟦2x = 14⟧, so ⟦x = 7⟧ and ⟦y = 3⟧. The GRE often asks for ⟦x + y⟧ itself: adding the equations may give it at once.` },
    { h: "Substitution", html: T`⟦y = 2x - 1⟧ and ⟦3x + y = 14⟧: ⟦3x + 2x - 1 = 14 \Rightarrow x = 3,\; y = 5⟧.` },
    { h: "How many solutions?", html: T`Two lines cross once (one solution), are parallel (same slope: no solution) or are the same line (infinitely many).` },
  ],
  rules: [T`\text{add/subtract equations to eliminate}`, T`\text{same slope, different intercept} \Rightarrow \text{no solution}`],
  widget: "lines",
  examples: [
    { q: T`If ⟦3a + 2b = 17⟧ and ⟦a + 2b = 11⟧, what is ⟦a + b⟧?`, steps: [T`Subtract: ⟦2a = 6⟧, so ⟦a = 3⟧.`, T`⟦3 + 2b = 11 \Rightarrow b = 4⟧.`, T`⟦a + b = 7⟧.`], a: T`7` },
    { q: T`If ⟦4x + 4y = 20⟧ and ⟦x - y = 1⟧, what is ⟦x^2 - y^2⟧?`, steps: [T`⟦x + y = 5⟧.`, T`⟦x^2 - y^2 = (x + y)(x - y)⟧.`, T`⟦5 \times 1 = 5⟧. No need to find x and y.`], a: T`5` },
  ],
  tips: [T`Read what is asked: often a combination like ⟦x + y⟧.`, T`Check by putting your answer back in.`],
  traps: [T`When you multiply an equation by a number, multiply every term.`],
  practice: [
    { t: "ne", q: T`If ⟦5(x + 3) = 2x + 24⟧, what is x?`, a: "3", why: T`⟦5x + 15 = 2x + 24 \Rightarrow 3x = 9 \Rightarrow x = 3⟧.` },
    { t: "mc", q: T`If ⟦2x + y = 11⟧ and ⟦x + 2y = 13⟧, what is ⟦x + y⟧?`, o: ["6", "7", "8", "12", "24"], a: 2, why: T`Add: ⟦3x + 3y = 24⟧, so ⟦x + y = 8⟧.` },
    { t: "qc", q: T`⟦2p - q = 5⟧ and ⟦p + q = 7⟧`, A: T`⟦p⟧`, B: T`⟦q⟧`, a: 0, why: T`Add: ⟦3p = 12⟧, so ⟦p = 4⟧ and ⟦q = 3⟧.` },
    { t: "ne", q: T`Adult tickets cost $8 and child tickets $5. 30 tickets were sold for $195. How many were adult tickets?`, a: "15", why: T`⟦a + c = 30⟧, ⟦8a + 5c = 195⟧: ⟦8a + 5(30 - a) = 195 \Rightarrow a = 15⟧.` },
  ]
},
{
  id: "inequalities", unit: "Algebra", title: "Inequalities", mins: 10,
  idea: T`Solve like an equation, but flip the sign when you multiply or divide by a negative.`,
  learn: [
    { h: "Flip for negatives", html: T`⟦-3x > 12 \;\Rightarrow\; x < -4⟧.` },
    { h: "Compound inequalities", html: T`⟦-2 < 2x + 4 \le 10⟧: subtract 4 from all parts, divide by 2: ⟦-3 < x \le 3⟧.` },
    { h: "Absolute value", html: T`⟦|x - 2| < 5 \iff -3 < x < 7⟧ (within 5 of 2). ⟦|x - 2| > 5 \iff x < -3⟧ or ⟦x > 7⟧.` },
    { h: "Combining ranges", html: T`If ⟦1 < a < 4⟧ and ⟦2 < b < 5⟧, then ⟦3 < a + b < 9⟧ and ⟦-4 < a - b < 2⟧.` },
  ],
  rules: [T`\times\text{ or }\div \text{ by a negative: flip}`, T`|x - a| < d \iff a - d < x < a + d`, T`|x - a| > d \iff x < a - d \text{ or } x > a + d`],
  widget: "ineq",
  examples: [
    { q: T`Solve ⟦5 - 2x \ge 11⟧.`, steps: [T`⟦-2x \ge 6⟧.`, T`Divide by ⟦-2⟧ and flip: ⟦x \le -3⟧.`], a: T`⟦x \le -3⟧` },
    { q: T`If ⟦-1 < x < 3⟧ and ⟦-2 < y < 4⟧, what range can ⟦xy⟧ take?`, steps: [T`Try the four corners: ⟦3 \cdot 4 = 12⟧, ⟦(-1)(4) = -4⟧, ⟦3(-2) = -6⟧, ⟦(-1)(-2) = 2⟧.`, T`So ⟦-6 < xy < 12⟧.`], a: T`⟦-6 < xy < 12⟧` },
  ],
  tips: [T`For products, test all four corner combinations.`, T`Never multiply both sides by a variable whose sign you don't know.`],
  traps: [T`Dividing by x when x might be negative.`],
  practice: [
    { t: "mc", q: T`Which values of x satisfy ⟦7 - 3x < 1⟧?`, o: ["⟦x < 2⟧", "⟦x > 2⟧", "⟦x < -2⟧", "⟦x > -2⟧", T`⟦x > \frac{8}{3}⟧`], a: 1, why: T`⟦-3x < -6 \Rightarrow x > 2⟧.` },
    { t: "ma", q: T`⟦|x + 1| \le 3⟧. Which could be x? Select all that apply.`, o: ["⟦-5⟧", "⟦-4⟧", "⟦0⟧", "⟦2⟧", "⟦3⟧"], a: [1, 2, 3], why: T`⟦-4 \le x \le 2⟧.` },
    { t: "qc", q: T`⟦x^2 < x⟧`, A: T`⟦x⟧`, B: T`⟦1⟧`, a: 1, why: T`⟦x^2 < x⟧ only when ⟦0 < x < 1⟧.` },
    { t: "ne", q: T`How many integers n satisfy ⟦3 < 2n + 1 < 15⟧?`, a: "5", why: T`⟦1 < n < 7⟧: ⟦n = 2, 3, 4, 5, 6⟧.` },
  ]
},
{
  id: "quadratics", unit: "Algebra", title: "Quadratics and factoring", mins: 12,
  idea: T`Factor to find the roots, and know the three special products by heart.`,
  learn: [
    { h: "Factoring", html: T`Find two numbers that multiply to c and add to b: ⟦x^2 - 5x + 6 = (x - 2)(x - 3)⟧, so ⟦x = 2⟧ or ⟦x = 3⟧.` },
    { h: "Zero product rule", html: T`⟦(x - 2)(x + 7) = 0 \Rightarrow x = 2⟧ or ⟦x = -7⟧. Move everything to one side first.` },
    { h: "Special products", html: T`⟦(a + b)^2 = a^2 + 2ab + b^2⟧, ⟦(a - b)^2 = a^2 - 2ab + b^2⟧, ⟦a^2 - b^2 = (a + b)(a - b)⟧.` },
    { h: "Quadratic formula", html: T`⟦x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}⟧. The discriminant ⟦b^2 - 4ac⟧: positive → 2 roots, zero → 1, negative → none.` },
    { h: "Sum and product of roots", html: T`For ⟦x^2 + bx + c = 0⟧ the roots add to ⟦-b⟧ and multiply to ⟦c⟧.` },
  ],
  rules: [T`(a+b)^2 = a^2 + 2ab + b^2`, T`(a-b)^2 = a^2 - 2ab + b^2`, T`a^2 - b^2 = (a+b)(a-b)`, T`x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`],
  widget: "parabola",
  examples: [
    { q: T`Solve ⟦x^2 = 3x + 10⟧.`, steps: [T`⟦x^2 - 3x - 10 = 0⟧.`, T`Multiply to ⟦-10⟧, add to ⟦-3⟧: ⟦-5⟧ and ⟦2⟧.`, T`⟦(x - 5)(x + 2) = 0 \Rightarrow x = 5⟧ or ⟦x = -2⟧.`], a: T`⟦x = 5⟧ or ⟦x = -2⟧` },
    { q: T`If ⟦x + \frac{1}{x} = 5⟧, what is ⟦x^2 + \frac{1}{x^2}⟧?`, steps: [T`Square both sides: ⟦\left(x + \frac{1}{x}\right)^2 = 25⟧.`, T`⟦x^2 + 2 + \frac{1}{x^2} = 25⟧.`, T`⟦x^2 + \frac{1}{x^2} = 23⟧.`], a: T`23` },
  ],
  tips: [T`See ⟦a^2 - b^2⟧? Factor it: ⟦99^2 - 1 = 98 \times 100⟧.`],
  traps: [T`Dividing by x loses ⟦x = 0⟧: ⟦x^2 = 5x⟧ has ⟦x = 0⟧ and ⟦x = 5⟧.`],
  practice: [
    { t: "ma", q: T`⟦x^2 - x - 12 = 0⟧. Which are solutions? Select all that apply.`, o: ["⟦-4⟧", "⟦-3⟧", "⟦3⟧", "⟦4⟧", "⟦12⟧"], a: [1, 3], why: T`⟦(x - 4)(x + 3) = 0⟧.` },
    { t: "ne", q: T`What is ⟦51^2 - 49^2⟧?`, a: "200", why: T`⟦(51 + 49)(51 - 49) = 100 \times 2⟧.` },
    { t: "qc", q: T`⟦x^2 = 6x⟧`, A: T`⟦x⟧`, B: T`⟦3⟧`, a: 3, why: T`⟦x = 0⟧ or ⟦x = 6⟧.` },
    { t: "mc", q: T`If ⟦(a + b)^2 = 64⟧ and ⟦ab = 12⟧, what is ⟦a^2 + b^2⟧?`, o: ["28", "40", "52", "64", "88"], a: 1, why: T`⟦a^2 + b^2 = 64 - 2(12) = 40⟧.` },
    { t: "ne", q: T`The roots of ⟦x^2 + kx + 18 = 0⟧ are 3 and 6. What is k?`, a: "-9", why: T`Roots add to ⟦-k⟧: ⟦9 = -k⟧.` },
  ]
},
{
  id: "functions", unit: "Algebra", title: "Functions, sequences and symbols", mins: 10,
  idea: T`A function is a rule: put the input in and follow the rule exactly.`,
  learn: [
    { h: "Function notation", html: T`⟦f(x) = 2x^2 - 3⟧: ⟦f(4) = 29⟧, and ⟦f(a + 1) = 2(a + 1)^2 - 3⟧.` },
    { h: "Made-up symbols", html: T`If ⟦a \oplus b = a^2 - ab⟧, then ⟦3 \oplus 2 = 9 - 6 = 3⟧.` },
    { h: "Arithmetic sequences", html: T`⟦a_n = a_1 + (n - 1)d⟧. Sum of n terms ⟦= n \cdot \dfrac{a_1 + a_n}{2}⟧.` },
    { h: "Geometric sequences", html: T`⟦a_n = a_1 \cdot r^{\,n-1}⟧.` },
  ],
  rules: [T`a_n = a_1 + (n-1)d`, T`S_n = n \cdot \frac{a_1 + a_n}{2}`, T`a_n = a_1 r^{n-1}`],
  widget: "sequence",
  examples: [
    { q: T`Find ⟦1 + 2 + 3 + \dots + 100⟧.`, steps: [T`100 terms.`, T`⟦S = 100 \cdot \frac{1 + 100}{2}⟧.`, T`⟦= 5050⟧.`], a: T`5050` },
    { q: T`Each term is 3 times the one before, and ⟦a_2 = 6⟧. Find ⟦a_5⟧.`, steps: [T`⟦a_5 = a_2 \cdot 3^3⟧.`, T`⟦= 6 \times 27 = 162⟧.`], a: T`162` },
  ],
  tips: [T`Count terms: ⟦\frac{\text{last} - \text{first}}{\text{step}} + 1⟧.`],
  traps: [T`⟦f(x + 1) \ne f(x) + 1⟧.`],
  practice: [
    { t: "ne", q: T`⟦f(x) = x^2 - 2x⟧. What is ⟦f(-3)⟧?`, a: "15", why: T`⟦9 + 6 = 15⟧.` },
    { t: "mc", q: T`For all numbers, ⟦a \,\triangle\, b = 2a - b^2⟧. What is ⟦3 \,\triangle\, (-2)⟧?`, o: ["⟦-2⟧", "⟦2⟧", "⟦8⟧", "⟦10⟧", "⟦-10⟧"], a: 1, why: T`⟦6 - 4 = 2⟧.` },
    { t: "ne", q: T`What is ⟦2 + 4 + 6 + \dots + 50⟧?`, a: "650", why: T`25 terms: ⟦25 \cdot \frac{2 + 50}{2} = 650⟧.` },
    { t: "qc", q: T`Arithmetic sequence with ⟦a_1 = 7⟧ and ⟦a_{10} = 43⟧.`, A: T`The common difference`, B: T`⟦4⟧`, a: 2, why: T`⟦43 = 7 + 9d \Rightarrow d = 4⟧.` },
  ]
},
{
  id: "coordinate", unit: "Algebra", title: "Coordinate geometry", mins: 12,
  idea: T`Slope, distance and midpoint come from two points; a line is ⟦y = mx + b⟧.`,
  learn: [
    { h: "Slope", html: T`⟦m = \dfrac{y_2 - y_1}{x_2 - x_1}⟧. Positive slope rises to the right; horizontal lines have slope 0; vertical lines have no slope.` },
    { h: "Line equation", html: T`⟦y = mx + b⟧: m is the slope and b the y-intercept. The x-intercept is where ⟦y = 0⟧.` },
    { h: "Parallel and perpendicular", html: T`Parallel lines: equal slopes. Perpendicular: ⟦m_1 m_2 = -1⟧, like 2 and ⟦-\frac{1}{2}⟧.` },
    { h: "Distance and midpoint", html: T`⟦d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}⟧ and ⟦M = \left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)⟧.` },
  ],
  rules: [T`m = \frac{\Delta y}{\Delta x}`, T`y = mx + b`, T`m_1 m_2 = -1`, T`d = \sqrt{\Delta x^2 + \Delta y^2}`],
  widget: "points",
  examples: [
    { q: T`A line passes through ⟦(1, 2)⟧ and ⟦(4, 11)⟧. Where does it cross the y-axis?`, steps: [T`⟦m = \frac{11 - 2}{4 - 1} = 3⟧.`, T`⟦2 = 3(1) + b \Rightarrow b = -1⟧.`, T`It crosses at ⟦(0, -1)⟧.`], a: T`⟦(0, -1)⟧` },
    { q: T`How far apart are ⟦(-2, 3)⟧ and ⟦(4, -5)⟧?`, steps: [T`⟦\Delta x = 6⟧, ⟦\Delta y = -8⟧.`, T`⟦\sqrt{36 + 64} = 10⟧.`], a: T`10` },
  ],
  tips: [T`3-4-5 and 5-12-13 triangles hide in distance questions.`],
  traps: [T`Slope is rise over run, not run over rise.`],
  practice: [
    { t: "ne", q: T`What is the slope of the line through ⟦(2, -1)⟧ and ⟦(6, 7)⟧?`, a: "2", why: T`⟦\frac{8}{4} = 2⟧.` },
    { t: "mc", q: T`Which line is perpendicular to ⟦y = 3x - 4⟧?`, o: ["⟦y = 3x + 4⟧", "⟦y = -3x + 1⟧", T`⟦y = \frac{1}{3}x⟧`, T`⟦y = -\frac{1}{3}x + 2⟧`, "⟦y = -4x + 3⟧"], a: 3, why: T`The slope must be ⟦-\frac{1}{3}⟧.` },
    { t: "qc", q: T`Line k: ⟦y = -2x + 6⟧`, A: T`The x-intercept of k`, B: T`The y-intercept of k`, a: 1, why: T`x-intercept 3, y-intercept 6.` },
    { t: "ne", q: T`The midpoint of AB is ⟦(3, 5)⟧ and A is ⟦(1, 9)⟧. What is the y-coordinate of B?`, a: "1", why: T`⟦\frac{9 + y}{2} = 5 \Rightarrow y = 1⟧.` },
  ]
},
{
  id: "wordprob", unit: "Algebra", title: "Rate, work and mixture problems", mins: 14,
  idea: T`⟦\text{distance} = \text{rate} \times \text{time}⟧, and work rates add up.`,
  learn: [
    { h: "Rate × time", html: T`⟦d = rt⟧. Average speed ⟦= \dfrac{\text{total distance}}{\text{total time}}⟧, <b>not</b> the average of the speeds.` },
    { h: "Two movers", html: T`Toward each other the gap closes at the sum of the speeds; in the same direction, at the difference.` },
    { h: "Work", html: T`A does a job in a hours: rate ⟦\frac{1}{a}⟧ per hour. Together: ⟦\frac{1}{a} + \frac{1}{b} = \frac{1}{t}⟧. With 3 h and 6 h: ⟦\frac{1}{3} + \frac{1}{6} = \frac{1}{2}⟧, so 2 hours.` },
    { h: "Mixtures", html: T`Track the pure part: 10 L of 30% salt water has 3 L of salt. Add 5 L at 60% (3 L salt): ⟦\frac{6}{15} = 40\%⟧.` },
  ],
  rules: [T`d = rt`, T`\bar v = \frac{\text{total } d}{\text{total } t}`, T`\frac{1}{a} + \frac{1}{b} = \frac{1}{t}`],
  widget: "rate",
  examples: [
    { q: T`You drive 60 km at 30 km/h and come back at 60 km/h. What is the average speed?`, steps: [T`Times: ⟦\frac{60}{30} = 2⟧ h and ⟦\frac{60}{60} = 1⟧ h.`, T`⟦\frac{120 \text{ km}}{3 \text{ h}}⟧.`, T`⟦= 40⟧ km/h (not 45).`], a: T`40 km/h` },
    { q: T`Pipe A fills a tank in 4 hours and pipe B in 12 hours. How long together?`, steps: [T`⟦\frac{1}{4} + \frac{1}{12} = \frac{4}{12} = \frac{1}{3}⟧ tank per hour.`, T`So 3 hours.`], a: T`3 hours` },
  ],
  tips: [T`Make a table: rate | time | distance.`, T`Change minutes to hours first.`],
  traps: [T`Average speed is not the average of the speeds.`],
  practice: [
    { t: "ne", q: T`Two trains 300 km apart travel toward each other at 70 km/h and 80 km/h. After how many hours do they meet?`, a: "2", why: T`⟦\frac{300}{150} = 2⟧.` },
    { t: "mc", q: T`Ali paints a room in 6 hours and Bora in 3 hours. How long do they take together?`, o: ["1.5 h", "2 h", "2.5 h", "4.5 h", "9 h"], a: 1, why: T`⟦\frac{1}{6} + \frac{1}{3} = \frac{1}{2}⟧ room per hour.` },
    { t: "qc", q: T`A car goes 100 km at 50 km/h and 100 km at 100 km/h.`, A: T`Average speed for the trip`, B: T`75 km/h`, a: 1, why: T`⟦\frac{200}{2 + 1} \approx 66.7⟧ km/h.` },
    { t: "ne", q: T`How many liters of water must be added to 12 L of 25% acid to make it 20% acid?`, a: "3", why: T`⟦\frac{3}{12 + w} = 0.2 \Rightarrow w = 3⟧.` },
    { t: "ne", q: T`In 5 years Ece will be twice as old as she was 10 years ago. How old is she now?`, a: "25", why: T`⟦x + 5 = 2(x - 10) \Rightarrow x = 25⟧.` },
  ]
}
);
