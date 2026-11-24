/* GRE Quant lessons: Algebra. */
window.QL = window.QL || [];
QL.push(
{
  id: "linear", unit: "Algebra", title: "Linear equations and systems", mins: 10,
  idea: "Do the same thing to both sides; for two equations, add or subtract them to remove a variable.",
  learn: [
    { h: "One variable", html: "3(x − 2) = x + 8 → 3x − 6 = x + 8 → 2x = 14 → x = 7." },
    { h: "Two equations: elimination", html: "x + y = 10 and x − y = 4. Add them: 2x = 14, x = 7, then y = 3. Often the GRE asks for x + y or 2x + 2y: add or subtract the equations and you may not need x and y at all." },
    { h: "Substitution", html: "y = 2x − 1 and 3x + y = 14 → 3x + 2x − 1 = 14 → x = 3, y = 5." },
    { h: "How many solutions?", html: "Two lines meet once (one solution), are parallel (no solution: same slope, different intercept) or are the same line (infinitely many)." },
  ],
  rules: ["Same operation on both sides", "Add/subtract equations to eliminate", "Parallel lines → no solution"],
  widget: "lines",
  examples: [
    { q: "If 3a + 2b = 17 and a + 2b = 11, what is a + b?", steps: ["Subtract the second from the first: 2a = 6, so a = 3.", "Then 3 + 2b = 11, so b = 4.", "a + b = 7."], a: "7" },
    { q: "If 4x + 4y = 20 and x − y = 1, what is x² − y²?", steps: ["x + y = 20/4 = 5.", "x² − y² = (x + y)(x − y).", "5 × 1 = 5. No need to find x and y!"], a: "5" },
  ],
  tips: ["Look at what the question asks for. Often it is a combination like x + y.", "Check your answer by putting it back in."],
  traps: ["When you multiply an equation by a number, multiply every term."],
  practice: [
    { t: "ne", q: "If 5(x + 3) = 2x + 24, what is x?", a: "3", why: "5x + 15 = 2x + 24 → 3x = 9 → x = 3." },
    { t: "mc", q: "If 2x + y = 11 and x + 2y = 13, what is x + y?", o: ["6", "7", "8", "12", "24"], a: 2, why: "Add the equations: 3x + 3y = 24, so x + y = 8." },
    { t: "qc", q: "2p − q = 5 and p + q = 7", A: "p", B: "q", a: 0, why: "Add: 3p = 12, p = 4, q = 3. A is greater." },
    { t: "ne", q: "Tickets cost $8 for adults and $5 for children. 30 tickets were sold for $195. How many were adult tickets?", a: "15", why: "a + c = 30 and 8a + 5c = 195. 8a + 5(30 − a) = 195 → 3a = 45 → a = 15." },
  ]
},
{
  id: "inequalities", unit: "Algebra", title: "Inequalities", mins: 10,
  idea: "Solve like an equation, but flip the sign when you multiply or divide by a negative.",
  learn: [
    { h: "Flip for negatives", html: "−3x &gt; 12 → x &lt; −4. Multiplying or dividing by a negative flips the sign." },
    { h: "Compound inequalities", html: "−2 &lt; 2x + 4 ≤ 10: subtract 4 from all three parts, then divide by 2: −3 &lt; x ≤ 3." },
    { h: "Absolute value inequalities", html: "|x − 2| &lt; 5 means within 5 of 2: −3 &lt; x &lt; 7. |x − 2| &gt; 5 means more than 5 away: x &lt; −3 or x &gt; 7." },
    { h: "Combining ranges", html: "If 1 &lt; a &lt; 4 and 2 &lt; b &lt; 5, then a + b is between 3 and 9. For a − b, take the extremes: 1 − 5 = −4 up to 4 − 2 = 2." },
  ],
  rules: ["× or ÷ by a negative → flip the sign", "|x − a| < d → a − d < x < a + d", "|x − a| > d → x < a − d or x > a + d"],
  widget: "ineq",
  examples: [
    { q: "Solve 5 − 2x ≥ 11.", steps: ["Subtract 5: −2x ≥ 6.", "Divide by −2 and flip: x ≤ −3."], a: "x ≤ −3" },
    { q: "If −1 < x < 3 and −2 < y < 4, what is the range of xy? (Is 10 possible?)", steps: ["Try the corner values: 3 × 4 = 12 (not reached), −1 × 4 = −4, 3 × (−2) = −6, (−1)(−2) = 2.", "So xy is between −6 and 12, not including the ends.", "10 is possible, for example x = 2.5, y = 4 − tiny."], a: "−6 < xy < 12" },
  ],
  tips: ["For products, test all four corner combinations.", "Never multiply both sides by a variable unless you know its sign."],
  traps: ["Dividing by x when x might be negative."],
  practice: [
    { t: "mc", q: "Which values of x satisfy 7 − 3x < 1?", o: ["x < 2", "x > 2", "x < −2", "x > −2", "x > 8/3"], a: 1, why: "−3x < −6 → x > 2 (flip)." },
    { t: "ma", q: "|x + 1| ≤ 3. Which of the following could be x? Select all that apply.", o: ["−5", "−4", "0", "2", "3"], a: [1, 2, 3], why: "−3 ≤ x + 1 ≤ 3 → −4 ≤ x ≤ 2." },
    { t: "qc", q: "x² < x", A: "x", B: "1", a: 1, why: "x² < x only when 0 < x < 1, so x < 1." },
    { t: "ne", q: "How many integers n satisfy 3 < 2n + 1 < 15?", a: "5", why: "2 < 2n < 14 → 1 < n < 7: n = 2, 3, 4, 5, 6." },
  ]
},
{
  id: "quadratics", unit: "Algebra", title: "Quadratics and factoring", mins: 12,
  idea: "Factor to find the roots, and know the three special products by heart.",
  learn: [
    { h: "Factoring x² + bx + c", html: "Find two numbers that multiply to c and add to b. x² − 5x + 6 = (x − 2)(x − 3), so x = 2 or 3." },
    { h: "Zero product rule", html: "If (x − 2)(x + 7) = 0 then x = 2 or x = −7. Always move everything to one side first." },
    { h: "Special products", html: "(a + b)² = a² + 2ab + b² · (a − b)² = a² − 2ab + b² · (a + b)(a − b) = a² − b²." },
    { h: "Quadratic formula", html: "x = (−b ± √(b² − 4ac)) / 2a. The discriminant b² − 4ac tells how many real roots: positive → 2, zero → 1, negative → 0." },
    { h: "Sum and product of roots", html: "For x² + bx + c = 0, the roots add to −b and multiply to c." },
  ],
  rules: ["(a+b)² = a² + 2ab + b²", "(a−b)² = a² − 2ab + b²", "a² − b² = (a+b)(a−b)", "x = (−b ± √(b²−4ac))/2a"],
  widget: "parabola",
  examples: [
    { q: "Solve x² = 3x + 10.", steps: ["Move everything to one side: x² − 3x − 10 = 0.", "Two numbers that multiply to −10 and add to −3: −5 and 2.", "(x − 5)(x + 2) = 0 → x = 5 or x = −2."], a: "x = 5 or −2" },
    { q: "If x + 1/x = 5, what is x² + 1/x²?", steps: ["Square both sides: (x + 1/x)² = 25.", "Expand: x² + 2 + 1/x² = 25.", "x² + 1/x² = 23."], a: "23" },
  ],
  tips: ["See a² − b²? Factor it: 99² − 1 = 98 × 100 = 9800.", "If (x − 3)(x + 5) > 0, test the regions on a number line."],
  traps: ["Dividing both sides by x loses the solution x = 0: x² = 5x has x = 0 and x = 5."],
  practice: [
    { t: "ma", q: "x² − x − 12 = 0. Which are solutions? Select all that apply.", o: ["−4", "−3", "3", "4", "12"], a: [1, 3], why: "(x − 4)(x + 3) = 0 → x = 4 or −3." },
    { t: "ne", q: "What is 51² − 49²?", a: "200", why: "(51 + 49)(51 − 49) = 100 × 2 = 200." },
    { t: "qc", q: "x² = 6x", A: "x", B: "3", a: 3, why: "x = 0 or x = 6, so x could be smaller or bigger than 3." },
    { t: "mc", q: "If (a + b)² = 64 and ab = 12, what is a² + b²?", o: ["28", "40", "52", "64", "88"], a: 1, why: "a² + 2ab + b² = 64 → a² + b² = 64 − 24 = 40." },
    { t: "ne", q: "The roots of x² + kx + 18 = 0 are 3 and 6. What is k?", a: "-9", why: "The roots add to −k: 3 + 6 = 9 = −k, so k = −9." },
  ]
},
{
  id: "functions", unit: "Algebra", title: "Functions, sequences and symbols", mins: 10,
  idea: "A function is a rule: put the input in and follow the rule exactly.",
  learn: [
    { h: "Function notation", html: "f(x) = 2x² − 3. f(4) = 2·16 − 3 = 29. f(a + 1) = 2(a + 1)² − 3: replace every x with (a + 1)." },
    { h: "Made-up symbols", html: "\"a ⊕ b = a² − ab\". Then 3 ⊕ 2 = 9 − 6 = 3. Just follow the definition." },
    { h: "Arithmetic sequences", html: "Add the same number d each time: a<sub>n</sub> = a<sub>1</sub> + (n − 1)d. Sum of n terms = n × (first + last)/2." },
    { h: "Geometric sequences", html: "Multiply by the same r each time: a<sub>n</sub> = a<sub>1</sub> · r<sup>n−1</sup>." },
  ],
  rules: ["a_n = a_1 + (n−1)d", "Sum = n(first + last)/2", "a_n = a_1·r^(n−1)"],
  widget: "sequence",
  examples: [
    { q: "What is the sum of the integers from 1 to 100?", steps: ["It's an arithmetic sequence with 100 terms.", "Sum = 100 × (1 + 100)/2.", "= 50 × 101 = 5050."], a: "5050" },
    { q: "In a sequence each term is 3 times the one before. The 2nd term is 6. What is the 5th term?", steps: ["Term 3 = 18, term 4 = 54, term 5 = 162.", "Or: a₅ = a₂ × 3³ = 6 × 27 = 162."], a: "162" },
  ],
  tips: ["Count terms with (last − first)/step + 1: from 10 to 50 by 4 is 11 terms."],
  traps: ["f(x + 1) is not f(x) + 1."],
  practice: [
    { t: "ne", q: "f(x) = x² − 2x. What is f(−3)?", a: "15", why: "9 − (−6) = 15." },
    { t: "mc", q: "For all numbers, a ▲ b = 2a − b². What is 3 ▲ (−2)?", o: ["−2", "2", "8", "10", "−10"], a: 1, why: "2·3 − (−2)² = 6 − 4 = 2." },
    { t: "ne", q: "What is the sum of the even numbers from 2 to 50?", a: "650", why: "25 terms, sum = 25 × (2 + 50)/2 = 650." },
    { t: "qc", q: "In an arithmetic sequence, a₁ = 7 and a₁₀ = 43.", A: "The common difference", B: "4", a: 2, why: "43 = 7 + 9d → d = 4." },
  ]
},
{
  id: "coordinate", unit: "Algebra", title: "Coordinate geometry", mins: 12,
  idea: "Slope, distance and midpoint come from the two points; a line is y = mx + b.",
  learn: [
    { h: "Slope", html: "m = (y₂ − y₁)/(x₂ − x₁). Positive slope goes up to the right. Horizontal lines have slope 0; vertical lines have no slope." },
    { h: "Line equation", html: "y = mx + b: m is the slope, b is where the line crosses the y-axis. The x-intercept is where y = 0." },
    { h: "Parallel and perpendicular", html: "Parallel lines have the same slope. Perpendicular slopes multiply to −1: 2 and −1/2." },
    { h: "Distance and midpoint", html: "Distance = √((x₂−x₁)² + (y₂−y₁)²) (it's the Pythagorean theorem). Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)." },
  ],
  rules: ["m = Δy/Δx", "y = mx + b", "Perpendicular: m₁·m₂ = −1", "d = √(Δx² + Δy²)", "Midpoint = averages"],
  widget: "points",
  examples: [
    { q: "A line goes through (1, 2) and (4, 11). Where does it cross the y-axis?", steps: ["Slope = (11 − 2)/(4 − 1) = 3.", "y = 3x + b. Put in (1, 2): 2 = 3 + b, so b = −1.", "It crosses the y-axis at (0, −1)."], a: "(0, −1)" },
    { q: "How far apart are (−2, 3) and (4, −5)?", steps: ["Δx = 6, Δy = −8.", "√(36 + 64) = √100 = 10."], a: "10" },
  ],
  tips: ["3-4-5 and 5-12-13 triangles hide in distance questions.", "Sketch the points: it catches sign mistakes."],
  traps: ["Slope is rise over run, not run over rise."],
  practice: [
    { t: "ne", q: "What is the slope of the line through (2, −1) and (6, 7)?", a: "2", why: "(7 − (−1))/(6 − 2) = 8/4 = 2." },
    { t: "mc", q: "Which line is perpendicular to y = 3x − 4?", o: ["y = 3x + 4", "y = −3x + 1", "y = (1/3)x", "y = −(1/3)x + 2", "y = −4x + 3"], a: 3, why: "Perpendicular slope = −1/3." },
    { t: "qc", q: "Line k is y = −2x + 6.", A: "The x-intercept of k", B: "The y-intercept of k", a: 1, why: "x-intercept: 0 = −2x + 6 → x = 3. y-intercept: 6. B is greater." },
    { t: "ne", q: "The midpoint of AB is (3, 5), and A is (1, 9). What is the y-coordinate of B?", a: "1", why: "(9 + y)/2 = 5 → y = 1." },
  ]
},
{
  id: "wordprob", unit: "Algebra", title: "Word problems: rate, work, mixture", mins: 14,
  idea: "Distance = rate × time, and work rates add up.",
  learn: [
    { h: "Rate × time", html: "Distance = rate × time. Average speed = total distance / total time, <b>not</b> the average of the speeds." },
    { h: "Two movers", html: "Moving toward each other, the gap closes at the sum of the speeds. Same direction: at the difference." },
    { h: "Work", html: "If A does a job in a hours, A's rate is 1/a job per hour. Together: 1/a + 1/b = 1/t. A in 3 h and B in 6 h: 1/3 + 1/6 = 1/2, so 2 hours together." },
    { h: "Mixtures", html: "Track the pure part: 10 L of 30% salt solution has 3 L of salt. Mix with 5 L of 60% (3 L of salt): 6 L salt in 15 L = 40%." },
    { h: "Age and money problems", html: "Name the unknown, write each sentence as an equation, solve." },
  ],
  rules: ["d = rt", "Avg speed = total d / total t", "Work: 1/a + 1/b = 1/t", "Mixture: track the pure amount"],
  widget: "rate",
  examples: [
    { q: "You drive 60 km at 30 km/h and come back at 60 km/h. What is the average speed?", steps: ["Time there: 60/30 = 2 h. Time back: 60/60 = 1 h.", "Total distance 120 km, total time 3 h.", "120/3 = 40 km/h (not 45!)."], a: "40 km/h" },
    { q: "Pipe A fills a tank in 4 hours and pipe B in 12 hours. How long together?", steps: ["Rates: 1/4 and 1/12 of a tank per hour.", "Together: 3/12 + 1/12 = 4/12 = 1/3 per hour.", "So 3 hours."], a: "3 hours" },
  ],
  tips: ["Make a table: rate | time | distance (or work).", "Convert minutes to hours before you multiply."],
  traps: ["Average speed is not the average of the two speeds."],
  practice: [
    { t: "ne", q: "Two trains 300 km apart travel toward each other at 70 km/h and 80 km/h. In how many hours do they meet?", a: "2", why: "They close the gap at 150 km/h: 300/150 = 2." },
    { t: "mc", q: "Ali paints a room in 6 hours and Bora in 3 hours. How long do they take together?", o: ["1.5 h", "2 h", "2.5 h", "4.5 h", "9 h"], a: 1, why: "1/6 + 1/3 = 1/2 room per hour → 2 hours." },
    { t: "qc", q: "A car goes 100 km at 50 km/h and 100 km at 100 km/h.", A: "The average speed for the trip", B: "75 km/h", a: 1, why: "Time = 2 + 1 = 3 h for 200 km: 66.7 km/h < 75." },
    { t: "ne", q: "How many liters of water must be added to 12 liters of a 25% acid solution to make it 20% acid?", a: "3", why: "Acid = 3 L. 3/(12 + w) = 0.2 → 12 + w = 15 → w = 3." },
    { t: "ne", q: "In 5 years Ece will be twice as old as she was 10 years ago. How old is she now?", a: "25", why: "x + 5 = 2(x − 10) → x + 5 = 2x − 20 → x = 25." },
  ]
}
);
