/* GRE Quant lessons added later: estimation and place value, graphs of functions and inequalities, congruent and similar
   figures, conditional probability, random variables, data interpretation. The app sorts lessons by unit, so they appear
   in the right part of the course. Maths between ⟦ and ⟧ (KaTeX). chart: a data graph drawn by QCHART (widgets.js). */
var T = String.raw;
window.QL = window.QL || [];
QL.push(
{
  id: "estimation", unit: "Arithmetic", title: "Estimation, place value, scientific notation", mins: 10,
  idea: T`Round to friendly numbers, know your place values, and move the decimal point with powers of 10.`,
  learn: [
    { h: "Place value", html: T`In 4,721.536: 4 is thousands, 7 hundreds, 2 tens, 1 units, 5 tenths, 3 hundredths, 6 thousandths. Rounding 4,721.536 to the nearest tenth gives 4,721.5; to the nearest hundred, 4,700.` },
    { h: "Scientific notation", html: T`⟦a \times 10^n⟧ with ⟦1 \le a < 10⟧: ⟦52\,000 = 5.2 \times 10^4⟧ and ⟦0.0031 = 3.1 \times 10^{-3}⟧. Multiply: multiply the numbers, add the exponents: ⟦(3 \times 10^5)(4 \times 10^{-2}) = 12 \times 10^3 = 1.2 \times 10^4⟧.` },
    { h: "Estimation", html: T`Round to numbers that are easy to work with: ⟦\frac{398 \times 51}{19.7} \approx \frac{400 \times 50}{20} = 1000⟧. If the answer choices are far apart, estimating is enough.` },
    { h: "Units digits", html: T`The last digit of a power repeats in a cycle: powers of 2 end in 2, 4, 8, 6, 2, 4, … (cycle of 4). ⟦2^{23}⟧: ⟦23 = 4 \cdot 5 + 3⟧, so it ends in 8.` },
  ],
  rules: [T`a \times 10^n,\; 1 \le a < 10`, T`10^a \cdot 10^b = 10^{a+b}`, T`\text{units digit of } 2^n: 2,4,8,6`],
  widget: "units",
  examples: [
    { q: T`What is ⟦\dfrac{(6 \times 10^{8})(2 \times 10^{-3})}{4 \times 10^{2}}⟧ in scientific notation?`, steps: [T`Numbers: ⟦\frac{6 \times 2}{4} = 3⟧.`, T`Powers: ⟦10^{8 - 3 - 2} = 10^{3}⟧.`, T`⟦3 \times 10^3⟧.`], a: T`⟦3 \times 10^3⟧` },
    { q: T`What is the units digit of ⟦7^{42}⟧?`, steps: [T`Powers of 7 end in 7, 9, 3, 1, then repeat (cycle of 4).`, T`⟦42 = 4 \cdot 10 + 2⟧: the 2nd number in the cycle.`, T`So the units digit is 9.`], a: T`9` },
  ],
  tips: [T`When the choices are far apart, estimate first and only calculate if you must.`, T`Count decimal places carefully in scientific notation; write the exponent change.`],
  traps: [T`⟦0.5 \times 10^4⟧ is not in scientific notation: it is ⟦5 \times 10^3⟧.`],
  practice: [
    { t: "ne", q: T`What is 63,849 rounded to the nearest thousand?`, a: "64000", why: T`The hundreds digit is 8 (≥ 5), so round up: 64,000.` },
    { t: "mc", q: T`⟦(4 \times 10^{6})(5 \times 10^{-2}) =⟧`, o: [T`⟦2 \times 10^{3}⟧`, T`⟦2 \times 10^{4}⟧`, T`⟦2 \times 10^{5}⟧`, T`⟦20 \times 10^{-12}⟧`, T`⟦9 \times 10^{4}⟧`], a: 2, why: T`⟦20 \times 10^{4} = 2 \times 10^{5}⟧.` },
    { t: "ne", q: T`What is the units digit of ⟦3^{50}⟧?`, a: "9", why: T`Cycle 3, 9, 7, 1. ⟦50 = 4 \cdot 12 + 2⟧ → 9.` },
    { t: "qc", q: "", A: T`⟦\dfrac{799 \times 41}{20}⟧`, B: T`⟦1500⟧`, a: 0, why: T`About ⟦\frac{800 \times 40}{20} = 1600⟧; exactly ⟦\frac{32\,759}{20} \approx 1638 > 1500⟧.` },
    { t: "mc", q: T`In 0.0258, what is the digit in the thousandths place?`, o: ["0", "2", "5", "8", "There is none"], a: 2, why: T`Tenths 0, hundredths 2, thousandths 5.` },
  ]
},
{
  id: "graphs", unit: "Algebra", title: "Graphs of functions and inequalities", mins: 12,
  idea: T`Read a graph as pairs ⟦(x, f(x))⟧; shifts move the graph, and inequalities shade a region.`,
  learn: [
    { h: "Reading a graph", html: T`A point ⟦(a, b)⟧ on the graph of f means ⟦f(a) = b⟧. The x-intercepts are the solutions of ⟦f(x) = 0⟧; the y-intercept is ⟦f(0)⟧.` },
    { h: "Shifts and reflections", html: T`⟦f(x) + c⟧ moves the graph up c. ⟦f(x - c)⟧ moves it right c (the sign is the opposite of what you'd expect). ⟦-f(x)⟧ flips it over the x-axis.` },
    { h: "Parabolas and circles", html: T`⟦y = a(x - h)^2 + k⟧ has its vertex at ⟦(h, k)⟧. ⟦(x - h)^2 + (y - k)^2 = r^2⟧ is a circle with centre ⟦(h, k)⟧ and radius r.` },
    { h: "Inequalities in the plane", html: T`⟦y > mx + b⟧ is the region <b>above</b> the line (dashed line, because points on it don't count). ⟦y \le mx + b⟧ is below, with a solid line. Test a point like ⟦(0, 0)⟧ to check.` },
    { h: "Where graphs meet", html: T`The intersection points of ⟦y = f(x)⟧ and ⟦y = g(x)⟧ solve ⟦f(x) = g(x)⟧.` },
  ],
  rules: [T`f(x)+c: \text{ up } c`, T`f(x-c): \text{ right } c`, T`y = a(x-h)^2+k`, T`(x-h)^2+(y-k)^2 = r^2`],
  widget: "region",
  examples: [
    { q: T`The graph of ⟦y = x^2⟧ is moved 3 units right and 2 units down. What is the new equation?`, steps: [T`Right 3: replace x with ⟦x - 3⟧.`, T`Down 2: subtract 2.`, T`⟦y = (x - 3)^2 - 2⟧, vertex ⟦(3, -2)⟧.`], a: T`⟦y = (x - 3)^2 - 2⟧` },
    { q: T`Is the point ⟦(2, 5)⟧ in the region ⟦y > 2x + 1⟧?`, steps: [T`Put in ⟦x = 2⟧: ⟦2(2) + 1 = 5⟧.`, T`Is ⟦5 > 5⟧? No: the point is on the line, and the line is not included.`], a: T`No` },
  ],
  tips: [T`Plug a point in to check a region or a graph: it's faster than thinking about shapes.`],
  traps: [T`⟦f(x + 2)⟧ moves the graph LEFT 2, not right.`],
  practice: [
    { t: "mc", q: T`The graph of ⟦y = f(x)⟧ passes through ⟦(4, -1)⟧. Which point must be on the graph of ⟦y = f(x) + 3⟧?`, o: ["⟦(4, 2)⟧", "⟦(7, -1)⟧", "⟦(4, -4)⟧", "⟦(1, -1)⟧", "⟦(4, 3)⟧"], a: 0, why: T`Up 3: ⟦(4, -1 + 3)⟧.` },
    { t: "ne", q: T`What is the radius of the circle ⟦(x - 2)^2 + (y + 1)^2 = 49⟧?`, a: "7", why: T`⟦r^2 = 49⟧.` },
    { t: "ma", q: T`Which points are in the region ⟦y \le -x + 4⟧? Select all that apply.`, o: ["⟦(0, 0)⟧", "⟦(2, 2)⟧", "⟦(3, 2)⟧", "⟦(-1, 6)⟧", "⟦(1, 1)⟧"], a: [0, 1, 4], why: T`Check ⟦y \le 4 - x⟧: ⟦0 \le 4⟧ ✓, ⟦2 \le 2⟧ ✓, ⟦2 \le 1⟧ ✗, ⟦6 \le 5⟧ ✗, ⟦1 \le 3⟧ ✓.` },
    { t: "qc", q: T`The parabola ⟦y = (x + 1)^2 - 4⟧`, A: T`The x-coordinate of its vertex`, B: T`⟦0⟧`, a: 1, why: T`Vertex ⟦(-1, -4)⟧.` },
    { t: "ne", q: T`At what x do the lines ⟦y = 3x - 2⟧ and ⟦y = x + 6⟧ meet?`, a: "4", why: T`⟦3x - 2 = x + 6 \Rightarrow x = 4⟧.` },
  ]
},
{
  id: "congruence", unit: "Geometry", title: "Congruent and similar figures", mins: 10,
  idea: T`Congruent = same shape and size; similar = same shape. Lengths scale by k, areas by ⟦k^2⟧, volumes by ⟦k^3⟧.`,
  learn: [
    { h: "Congruent triangles", html: T`Two triangles are congruent if they match by <b>SSS</b>, <b>SAS</b>, <b>ASA</b> or <b>AAS</b> (and <b>HL</b> for right triangles). Then all matching sides and angles are equal. SSA is not enough.` },
    { h: "Similar triangles", html: T`<b>AA</b>: two equal angles make triangles similar. Matching sides have the same ratio k.` },
    { h: "Scale factors", html: T`If lengths are multiplied by k: perimeters × k, areas × ⟦k^2⟧, volumes × ⟦k^3⟧.` },
    { h: "Similar triangles inside triangles", html: T`A line parallel to one side of a triangle cuts off a smaller, similar triangle.` },
  ],
  rules: [T`\text{SSS, SAS, ASA, AAS, HL}`, T`\text{AA} \Rightarrow \text{similar}`, T`\text{length} \times k,\ \text{area} \times k^2,\ \text{volume} \times k^3`],
  widget: "similar",
  examples: [
    { q: T`Two similar triangles have perimeters 12 and 18. The smaller has area 16. Find the area of the larger.`, steps: [T`⟦k = \frac{18}{12} = \frac{3}{2}⟧.`, T`Areas scale by ⟦k^2 = \frac{9}{4}⟧.`, T`⟦16 \cdot \frac{9}{4} = 36⟧.`], a: T`36` },
    { q: T`A 6 ft person casts a 4 ft shadow while a tree casts a 30 ft shadow. How tall is the tree?`, steps: [T`Sun angles are equal → similar triangles.`, T`⟦\frac{h}{30} = \frac{6}{4}⟧.`, T`⟦h = 45⟧ ft.`], a: T`45 ft` },
  ],
  tips: [T`Mark matching angles first; then pair up the sides opposite them.`],
  traps: [T`Doubling every side makes the area 4 times bigger, not 2.`],
  practice: [
    { t: "ne", q: T`Two similar cubes have sides 2 and 6. The volume of the larger is how many times the volume of the smaller?`, a: "27", why: T`⟦k = 3⟧, so ⟦k^3 = 27⟧.` },
    { t: "mc", q: T`Triangles ABC and DEF are similar with ⟦AB = 4⟧, ⟦DE = 10⟧ and ⟦BC = 6⟧. What is EF?`, o: ["⟦8⟧", "⟦12⟧", "⟦15⟧", "⟦16⟧", "⟦24⟧"], a: 2, why: T`⟦k = \frac{10}{4} = 2.5⟧, ⟦6 \times 2.5 = 15⟧.` },
    { t: "ma", q: T`Which conditions always prove two triangles congruent? Select all that apply.`, o: ["SSS", "SAS", "AAA", "SSA", "ASA"], a: [0, 1, 4], why: T`AAA gives only similar triangles; SSA can give two different triangles.` },
    { t: "qc", q: T`A map uses scale ⟦1 : 1000⟧. A park on the map is ⟦2 \times 3⟧ cm.`, A: T`The real area of the park, in m²`, B: T`⟦600⟧`, a: 2, why: T`Real size ⟦20 \times 30⟧ m: 600 m².` },
    { t: "ne", q: T`In triangle ABC, a line parallel to BC cuts AB at its midpoint D and AC at E. If ⟦BC = 14⟧, what is DE?`, a: "7", why: T`Triangle ADE is similar with ⟦k = \frac{1}{2}⟧.` },
  ]
},
{
  id: "conditional", unit: "Data analysis", title: "Conditional probability and two-way tables", mins: 12,
  idea: T`"Given that B" shrinks the world to B: ⟦P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}⟧.`,
  learn: [
    { h: "The formula", html: T`⟦P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}⟧: of the cases where B happens, what fraction also has A?` },
    { h: "Two-way tables", html: T`Rows and columns split a group two ways. For "given a girl", look only in the girls row: ⟦P(\text{sport} \mid \text{girl}) = \dfrac{\text{girls who play}}{\text{all girls}}⟧.` },
    { h: "Independence", html: T`A and B are independent when ⟦P(A \mid B) = P(A)⟧, which is the same as ⟦P(A \cap B) = P(A)P(B)⟧.` },
    { h: "Multiplication rule", html: T`⟦P(A \cap B) = P(B)\,P(A \mid B)⟧. Drawing without replacement is a chain of conditional probabilities.` },
  ],
  rules: [T`P(A \mid B) = \frac{P(A \cap B)}{P(B)}`, T`P(A \cap B) = P(B)\,P(A \mid B)`, T`\text{independent} \iff P(A \mid B) = P(A)`],
  widget: "twoway",
  examples: [
    { q: T`Of 200 students, 80 play a sport. Of the 120 girls, 40 play a sport. A student who plays a sport is picked. What is the probability it's a girl?`, chart: { type: "table", title: "Students", head: ["", "Sport", "No sport", "Total"], rows: [["Girls", 40, 80, 120], ["Boys", 40, 40, 80], ["Total", 80, 120, 200]] }, steps: [T`"Given sport": only the Sport column, 80 students.`, T`Girls in that column: 40.`, T`⟦\frac{40}{80} = \frac{1}{2}⟧.`], a: T`⟦\frac{1}{2}⟧` },
    { q: T`⟦P(A) = 0.6⟧ and ⟦P(B \mid A) = 0.5⟧. Find ⟦P(A \cap B)⟧.`, steps: [T`⟦P(A \cap B) = P(A)\,P(B \mid A)⟧.`, T`⟦0.6 \times 0.5 = 0.3⟧.`], a: T`0.3` },
  ],
  tips: [T`Underline the "given" part: that is your new total.`],
  traps: [T`⟦P(A \mid B)⟧ is usually not ⟦P(B \mid A)⟧.`],
  practice: [
    { t: "ne", q: T`Using the table, a boy is chosen at random. What is the probability he plays a sport? Give a fraction.`, chart: { type: "table", title: "Students", head: ["", "Sport", "No sport", "Total"], rows: [["Girls", 40, 80, 120], ["Boys", 40, 40, 80], ["Total", 80, 120, 200]] }, a: "1/2", why: T`⟦\frac{40}{80}⟧.` },
    { t: "mc", q: T`⟦P(A \cap B) = 0.12⟧ and ⟦P(B) = 0.4⟧. What is ⟦P(A \mid B)⟧?`, o: ["0.048", "0.12", "0.28", "0.3", "0.52"], a: 3, why: T`⟦\frac{0.12}{0.4} = 0.3⟧.` },
    { t: "qc", q: T`Two cards are drawn without replacement from 3 red and 2 black cards.`, A: T`P(second is red ∣ first is red)`, B: T`P(second is red ∣ first is black)`, a: 1, why: T`⟦\frac{2}{4} < \frac{3}{4}⟧.` },
    { t: "ma", q: T`⟦P(A) = 0.5⟧, ⟦P(B) = 0.4⟧, ⟦P(A \cap B) = 0.2⟧. Which are true? Select all that apply.`, o: [T`⟦P(A \mid B) = 0.5⟧`, T`⟦P(B \mid A) = 0.4⟧`, "A and B are independent", T`⟦P(A \cup B) = 0.9⟧`, T`⟦P(A \mid B) = 0.2⟧`], a: [0, 1, 2], why: T`⟦\frac{0.2}{0.4} = 0.5⟧, ⟦\frac{0.2}{0.5} = 0.4⟧, and ⟦0.5 \times 0.4 = 0.2⟧. ⟦P(A \cup B) = 0.7⟧.` },
    { t: "ne", q: T`In a town, 30% of days are rainy. On a rainy day the bus is late with probability 0.6; on a dry day, 0.1. What is the probability the bus is late on a random day?`, a: "0.25", why: T`⟦0.3(0.6) + 0.7(0.1) = 0.18 + 0.07⟧.` },
  ]
},
{
  id: "expected", unit: "Data analysis", title: "Random variables and expected value", mins: 10,
  idea: T`A probability distribution lists the values and their chances; the expected value is the weighted average ⟦\sum x\,p⟧.`,
  learn: [
    { h: "Random variable", html: T`A number decided by chance, like the result of a die roll. Its <b>distribution</b> lists each value with its probability; the probabilities add to 1.` },
    { h: "Expected value", html: T`⟦E(X) = \sum x \cdot P(x)⟧: the long-run average. A fair die: ⟦\frac{1 + 2 + \dots + 6}{6} = 3.5⟧, even though you can never roll 3.5.` },
    { h: "Games and decisions", html: T`A ticket costs $2 and wins $10 with probability 0.1. Expected gain ⟦= 0.1(10) - 2 = -1⟧: you lose $1 per ticket on average.` },
    { h: "Spread", html: T`The standard deviation of a distribution measures how far values usually fall from the mean, like for data.` },
  ],
  rules: [T`\sum P(x) = 1`, T`E(X) = \sum x\,P(x)`, T`E(\text{fair die}) = 3.5`],
  widget: "expect",
  examples: [
    { q: T`X takes the values 0, 1 and 2 with probabilities 0.5, 0.3 and 0.2. Find ⟦E(X)⟧.`, chart: { type: "bar", title: "Distribution of X", labels: ["0", "1", "2"], series: [{ name: "P", values: [0.5, 0.3, 0.2] }] }, steps: [T`⟦0(0.5) + 1(0.3) + 2(0.2)⟧.`, T`⟦= 0 + 0.3 + 0.4 = 0.7⟧.`], a: T`0.7` },
  ],
  tips: [T`Check that the probabilities add to 1 before using them.`],
  traps: [T`The expected value need not be a possible value.`],
  practice: [
    { t: "ne", q: T`A spinner gives 1, 2 or 5 points with probabilities 0.5, 0.3 and 0.2. What is the expected number of points?`, a: "2.1", why: T`⟦0.5 + 0.6 + 1.0 = 2.1⟧.` },
    { t: "mc", q: T`A random variable takes values 1, 2, 3, 4 with probabilities 0.1, 0.2, 0.3 and p. What is p?`, o: ["0.1", "0.2", "0.3", "0.4", "0.5"], a: 3, why: T`They add to 1: ⟦p = 0.4⟧.` },
    { t: "qc", q: T`Game: pay $5, roll a fair die, win $(2 × the number rolled).`, A: T`Expected winnings per game`, B: T`$5`, a: 0, why: T`⟦E = 2 \times 3.5 = 7 > 5⟧.` },
    { t: "ne", q: T`A coin is flipped twice. X is the number of heads. What is ⟦E(X)⟧?`, a: "1", why: T`⟦0 \cdot \frac{1}{4} + 1 \cdot \frac{1}{2} + 2 \cdot \frac{1}{4} = 1⟧.` },
  ]
},
{
  id: "datasets", unit: "Data analysis", title: "Data interpretation sets", mins: 14,
  idea: T`One graph, several questions: read the title, the scale and the units, then estimate.`,
  learn: [
    { h: "How the GRE does it", html: T`Each section has a data set: a table or one or two graphs, followed by about 3 questions. The graph stays the same; the questions get harder.` },
    { h: "Bar and line graphs", html: T`Read the scale on the axis first. Percent change = change ÷ start. The steepest line segment is the biggest change, not always the biggest percent change.` },
    { h: "Pie charts and tables", html: T`A pie shows parts of 100%. To get an amount, multiply the percent by the total, which is usually written in the title.` },
    { h: "Scatterplots", html: T`Each dot is one item. An upward cloud means a positive relationship; a trend line lets you estimate. Count dots above or below a line for "how many" questions.` },
    { h: "Histograms and percentiles", html: T`A histogram counts values in ranges. The p-th percentile has p% of the data below it: the median is the 50th percentile, ⟦Q_1⟧ the 25th, ⟦Q_3⟧ the 75th.` },
  ],
  rules: [T`\%\,\text{change} = \frac{\text{new} - \text{old}}{\text{old}}`, T`\text{part} = \% \times \text{total}`, T`\text{median} = 50\text{th percentile}`],
  widget: "chart",
  examples: [
    { q: T`The pie chart shows a family's $4,000 monthly spending. How much more is spent on housing than on food?`, chart: { type: "pie", title: "Monthly spending: $4,000", parts: [["Housing", 35], ["Food", 20], ["Transport", 15], ["Savings", 18], ["Other", 12]] }, steps: [T`Difference: ⟦35\% - 20\% = 15\%⟧.`, T`⟦0.15 \times 4000 = 600⟧.`], a: T`$600` },
    { q: T`From the scatterplot, about how many students studied more than 6 hours and scored above 80?`, chart: { type: "scatter", title: "Study time and test score", x: "Hours studied", y: "Score", xmax: 10, ymin: 40, ymax: 100, points: [[1, 52], [2, 58], [2, 66], [3, 61], [4, 70], [4, 64], [5, 72], [5, 78], [6, 75], [6, 83], [7, 81], [7, 86], [8, 79], [8, 88], [9, 92], [9, 85], [10, 95]] }, steps: [T`More than 6 hours: x = 7, 8, 9, 10.`, T`Above 80 among them: 81, 86, 88, 92, 85, 95.`, T`6 students (79 is not above 80).`], a: T`6` },
  ],
  tips: [T`Spend 20 seconds on the graph before the first question: title, units, scale, key.`, T`Estimate when the answer choices are far apart.`],
  traps: [T`Mixing up "percent of" and "percent change".`, T`Reading the wrong series in a two-colour graph.`],
  practice: [
    { t: "mc", q: T`In which year did sales increase by the greatest percent over the year before?`, chart: { type: "bar", title: "Sales (thousands of units)", labels: ["2019", "2020", "2021", "2022", "2023"], series: [{ name: "Sales", values: [40, 50, 55, 77, 80] }] }, o: ["2020", "2021", "2022", "2023", "2019"], a: 2, why: T`2020: 25%, 2021: 10%, 2022: ⟦\frac{22}{55} = 40\%⟧, 2023: about 4%.` },
    { t: "ne", q: T`Using the line graph, by what percent did the price rise from January to June?`, chart: { type: "line", title: "Price per kg ($)", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], series: [{ name: "Price", values: [8, 9, 9, 10, 11, 12] }] }, a: "50", unit: "%", why: T`⟦\frac{12 - 8}{8} = 0.5⟧.` },
    { t: "qc", q: T`Use the pie chart of $4,000 monthly spending.`, chart: { type: "pie", title: "Monthly spending: $4,000", parts: [["Housing", 35], ["Food", 20], ["Transport", 15], ["Savings", 18], ["Other", 12]] }, A: T`Transport + Other`, B: T`Food + 7% of the total`, a: 2, why: T`⟦15 + 12 = 27\%⟧ and ⟦20 + 7 = 27\%⟧.` },
    { t: "ne", q: T`The histogram shows the ages of 50 runners. How many runners are under 30?`, chart: { type: "bar", title: "Ages of 50 runners", labels: ["10–19", "20–29", "30–39", "40–49", "50–59"], series: [{ name: "Runners", values: [6, 14, 15, 10, 5] }] }, a: "20", why: T`⟦6 + 14 = 20⟧.` },
    { t: "mc", q: T`In the table, which city had the largest percent of its population using the metro?`, chart: { type: "table", title: "City populations and metro riders (thousands)", head: ["City", "Population", "Metro riders"], rows: [["A", 800, 200], ["B", 1200, 240], ["C", 500, 150], ["D", 2000, 360]] }, o: ["A", "B", "C", "D", "A and C equally"], a: 2, why: T`A 25%, B 20%, C 30%, D 18%.` },
  ]
}
);
