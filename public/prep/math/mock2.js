/* More GRE Quant mock questions, plus data-interpretation sets (3 questions that share one chart, like the GRE).
   set: questions with the same set id are asked together in a mock test. Maths between ⟦ and ⟧. */
var T = String.raw;
(() => {
  const C1 = { type: "bar", title: "Students enrolled by faculty (hundreds)", labels: ["Science", "Arts", "Business", "Law", "Medicine"], series: [{ name: "2022", values: [24, 18, 30, 9, 12] }, { name: "2023", values: [27, 15, 33, 12, 13] }] };
  const C2 = { type: "line", title: "Visitors to a museum (thousands)", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"], series: [{ name: "Visitors", values: [20, 18, 24, 30, 36, 45, 54, 50] }] };
  const C3 = { type: "pie", title: "How 600 employees get to work", parts: [["Car", 40], ["Bus", 25], ["Metro", 20], ["Bike", 10], ["Walk", 5]] };
  const C4 = { type: "table", title: "Exam results of three classes", head: ["Class", "Students", "Mean score", "Passed"], rows: [["P", 30, 72, 24], ["Q", 25, 78, 22], ["R", 45, 65, 27]] };
  const C5 = { type: "scatter", title: "Car age and price", x: "Age (years)", y: "Price ($1,000)", xmax: 12, ymin: 0, ymax: 30, points: [[1, 27], [1, 25], [2, 24], [3, 21], [3, 23], [4, 19], [5, 18], [5, 15], [6, 14], [7, 13], [7, 11], [8, 10], [9, 9], [10, 7], [11, 6], [12, 4]] };
  window.QM2 = [
    // ---------- data-interpretation sets
    { topic: "datasets", set: "s1", chart: C1, t: "mc", q: T`How many students were enrolled in Business in 2023?`, o: ["33", "330", "3,000", "3,300", "33,000"], a: 3, why: T`The scale is hundreds: ⟦33 \times 100 = 3300⟧.` },
    { topic: "datasets", set: "s1", chart: C1, t: "ne", q: T`By what percent did enrolment in Law increase from 2022 to 2023? Round to the nearest whole percent.`, a: "33", tol: 0.5, unit: "%", why: T`⟦\frac{12 - 9}{9} \approx 33.3\%⟧, so 33%.` },
    { topic: "datasets", set: "s1", chart: C1, t: "ma", q: T`In which faculties did enrolment fall from 2022 to 2023? Select all that apply.`, o: ["Science", "Arts", "Business", "Law", "Medicine"], a: [1], why: T`Only Arts fell, from 18 to 15.` },
    { topic: "datasets", set: "s2", chart: C2, t: "mc", q: T`Between which two consecutive months did the number of visitors increase the most?`, o: ["Feb–Mar", "Mar–Apr", "Apr–May", "May–Jun", "Jul–Aug"], a: 3, why: T`Increases: +6, +6, +6, +9 and −4 thousand. May–Jun (36 → 45) is the greatest.` },
    { topic: "datasets", set: "s2", chart: C2, t: "ne", q: T`What was the mean number of visitors per month from January to April, in thousands?`, a: "23", why: T`⟦\frac{20 + 18 + 24 + 30}{4} = 23⟧.` },
    { topic: "datasets", set: "s2", chart: C2, t: "qc", q: "", A: T`Percent increase from February to April`, B: T`Percent increase from June to July`, a: 0, why: T`⟦\frac{12}{18} \approx 67\%⟧ vs ⟦\frac{9}{45} = 20\%⟧.` },
    { topic: "datasets", set: "s3", chart: C3, t: "ne", q: T`How many employees take the bus or the metro?`, a: "270", why: T`⟦45\% \times 600 = 270⟧.` },
    { topic: "datasets", set: "s3", chart: C3, t: "mc", q: T`What is the central angle of the "Bike" sector?`, o: ["10°", "18°", "36°", "60°", "72°"], a: 2, why: T`⟦0.10 \times 360^\circ = 36^\circ⟧.` },
    { topic: "datasets", set: "s3", chart: C3, t: "qc", q: T`Half of the car drivers switch to the metro.`, A: T`New number of metro users`, B: T`New number of car users + 60`, a: 0, why: T`Car: 240 → 120; metro: 120 + 120 = 240. A = 240, B = 180.` },
    { topic: "datasets", set: "s4", chart: C4, t: "mc", q: T`Which class had the highest pass rate?`, o: ["P", "Q", "R", "P and Q equally", "Q and R equally"], a: 1, why: T`P 80%, Q 88%, R 60%.` },
    { topic: "datasets", set: "s4", chart: C4, t: "ne", q: T`What is the mean score of all 100 students together?`, a: "70.35", why: T`⟦\frac{30(72) + 25(78) + 45(65)}{100} = \frac{2160 + 1950 + 2925}{100} = 70.35⟧.` },
    { topic: "datasets", set: "s4", chart: C4, t: "qc", q: "", A: T`Students who failed in class R`, B: T`Students who failed in P and Q together`, a: 0, why: T`R: 18. P + Q: 6 + 3 = 9.` },
    { topic: "datasets", set: "s5", chart: C5, t: "mc", q: T`Which best describes the relationship in the scatterplot?`, o: ["Strong positive", "Strong negative", "No relationship", "Positive, then negative", "Weak positive"], a: 1, why: T`Older cars cost less, and the points lie close to a line.` },
    { topic: "datasets", set: "s5", chart: C5, t: "ne", q: T`How many cars are at least 5 years old and cost less than $15,000?`, a: "8", why: T`(6, 14), (7, 13), (7, 11), (8, 10), (9, 9), (10, 7), (11, 6), (12, 4). The two 5-year-old cars cost 15 and 18, not less than 15.` },
    { topic: "datasets", set: "s5", chart: C5, t: "qc", q: "", A: T`Median price of the cars`, B: T`$15,000`, a: 1, why: T`Sorted prices (thousands): 4, 6, 7, 9, 10, 11, 13, 14, 15, 18, 19, 21, 23, 24, 25, 27. Median ⟦= \frac{14 + 15}{2} = 14.5 < 15⟧.` },
    // ---------- arithmetic
    { topic: "integers", t: "qc", q: T`k is the least common multiple of 6, 8 and 10.`, A: T`⟦k⟧`, B: T`⟦100⟧`, a: 0, why: T`⟦2^3 \cdot 3 \cdot 5 = 120⟧.` },
    { topic: "integers", t: "ne", q: T`What is the sum of all the prime numbers between 20 and 40?`, a: "120", why: T`⟦23 + 29 + 31 + 37 = 120⟧.` },
    { topic: "integers", t: "mc", q: T`If n is divisible by 4 and 6, which must n be divisible by?`, o: ["8", "12", "18", "24", "36"], a: 1, why: T`LCM(4, 6) = 12. 12 itself is not divisible by 8, 18, 24 or 36.` },
    { topic: "integers", t: "ma", q: T`p and q are different primes. Which could be even? Select all that apply.`, o: ["⟦pq⟧", "⟦p + q⟧", "⟦p - q⟧", "⟦p^2 + q^2⟧", "⟦pq + 1⟧"], a: [0, 1, 2, 3, 4], why: T`p = 2, q = 3: pq = 6 even. p = 3, q = 5: p + q, p − q, p² + q² even. p = 3, q = 5: pq + 1 = 16 even.` },
    { topic: "fractions", t: "ne", q: T`What is ⟦\dfrac{\frac{3}{4} - \frac{2}{3}}{\frac{1}{6}}⟧? Give a fraction.`, a: "1/2", why: T`⟦\frac{1}{12} \div \frac{1}{6} = \frac{1}{2}⟧.` },
    { topic: "fractions", t: "qc", q: T`⟦x = 0.\overline{3}⟧ (0.333…)`, A: T`⟦3x⟧`, B: T`⟦1⟧`, a: 2, why: T`⟦0.\overline{3} = \frac{1}{3}⟧.` },
    { topic: "exponents", t: "mc", q: T`⟦\dfrac{5^{12} - 5^{10}}{5^{10}} =⟧`, o: ["⟦5^2⟧", "⟦24⟧", "⟦25⟧", "⟦5^{12}⟧", "⟦4⟧"], a: 1, why: T`⟦5^2 - 1 = 24⟧.` },
    { topic: "exponents", t: "qc", q: T`⟦0 < x < 1⟧`, A: T`⟦x^{-2}⟧`, B: T`⟦x^{-1}⟧`, a: 0, why: T`⟦\frac{1}{x^2} > \frac{1}{x}⟧ when ⟦0 < x < 1⟧.` },
    { topic: "exponents", t: "ne", q: T`If ⟦4^{x} = 8^{x-1}⟧, what is x?`, a: "3", why: T`⟦2^{2x} = 2^{3x - 3}⟧ → ⟦x = 3⟧.` },
    { topic: "percent", t: "mc", q: T`A price is reduced by 25%. By what percent must the new price rise to get back to the original?`, o: ["20%", "25%", "30%", "33⅓%", "50%"], a: 3, why: T`⟦\frac{1}{0.75} = \frac{4}{3}⟧: up ⟦33\tfrac{1}{3}\%⟧.` },
    { topic: "percent", t: "ne", q: T`In a class, 60% are girls and 25% of the girls wear glasses. What percent of the class are girls who wear glasses?`, a: "15", unit: "%", why: T`⟦0.6 \times 0.25 = 0.15⟧.` },
    { topic: "ratios", t: "qc", q: T`A bag has red and green balls in the ratio ⟦3 : 7⟧, and 20 more green than red.`, A: T`Number of red balls`, B: T`⟦15⟧`, a: 2, why: T`⟦4k = 20 \Rightarrow k = 5⟧; red ⟦= 15⟧.` },
    { topic: "ratios", t: "ne", q: T`A map's scale is 1 cm : 25 km. Two towns are 7.2 cm apart on the map. How many km apart are they?`, a: "180", why: T`⟦7.2 \times 25⟧.` },
    { topic: "absval", t: "ne", q: T`How many integers x satisfy ⟦|x - 3| \le 4⟧?`, a: "9", why: T`⟦-1 \le x \le 7⟧: 9 integers.` },
    { topic: "interest", t: "qc", q: T`$1,000 at 6% per year for 2 years.`, A: T`Compound interest earned`, B: T`$123`, a: 0, why: T`⟦1000(1.06)^2 - 1000 = 123.60 > 123⟧.` },
    { topic: "estimation", t: "mc", q: T`Which is closest to ⟦\dfrac{0.0049 \times 8100}{0.21}⟧?`, o: ["0.2", "2", "20", "200", "2,000"], a: 3, why: T`⟦\frac{0.005 \times 8000}{0.2} = \frac{40}{0.2} = 200⟧.` },
    { topic: "estimation", t: "ne", q: T`What is the units digit of ⟦9^{99}⟧?`, a: "9", why: T`Powers of 9 end in 9, 1, 9, 1, …; odd exponent → 9.` },
    // ---------- algebra
    { topic: "linear", t: "ne", q: T`If ⟦\frac{x}{3} + \frac{x}{4} = 14⟧, what is x?`, a: "24", why: T`⟦\frac{7x}{12} = 14⟧.` },
    { topic: "linear", t: "qc", q: T`⟦a + b = 10⟧ and ⟦a - b = 4⟧`, A: T`⟦ab⟧`, B: T`⟦21⟧`, a: 2, why: T`⟦a = 7⟧, ⟦b = 3⟧.` },
    { topic: "inequalities", t: "mc", q: T`If ⟦-2 < x < 5⟧, which could be ⟦x^2⟧?`, o: ["⟦-1⟧", "⟦25⟧", "⟦30⟧", "⟦0⟧", "⟦26⟧"], a: 3, why: T`⟦0 \le x^2 < 25⟧; 0 works (x = 0).` },
    { topic: "inequalities", t: "qc", q: T`⟦3 - 2x > 7⟧`, A: T`⟦x⟧`, B: T`⟦-2⟧`, a: 1, why: T`⟦x < -2⟧.` },
    { topic: "quadratics", t: "ma", q: T`Which are factors of ⟦x^2 - 9x + 20⟧? Select all that apply.`, o: ["⟦x - 4⟧", "⟦x + 4⟧", "⟦x - 5⟧", "⟦x + 5⟧", "⟦x - 2⟧"], a: [0, 2], why: T`⟦(x - 4)(x - 5)⟧.` },
    { topic: "quadratics", t: "ne", q: T`What is the sum of the roots of ⟦2x^2 - 10x + 7 = 0⟧?`, a: "5", why: T`Sum ⟦= -\frac{b}{a} = \frac{10}{2}⟧.` },
    { topic: "functions", t: "qc", q: T`⟦f(x) = x^2 + 1⟧`, A: T`⟦f(-3)⟧`, B: T`⟦f(3)⟧`, a: 2, why: T`Both are 10.` },
    { topic: "functions", t: "ne", q: T`A geometric sequence has ⟦a_1 = 3⟧ and ⟦a_4 = 24⟧. What is ⟦a_6⟧?`, a: "96", why: T`⟦r^3 = 8 \Rightarrow r = 2⟧; ⟦a_6 = 3 \cdot 2^5⟧.` },
    { topic: "coordinate", t: "mc", q: T`What is the distance between ⟦(1, -2)⟧ and ⟦(7, 6)⟧?`, o: ["⟦8⟧", "⟦10⟧", "⟦12⟧", "⟦14⟧", T`⟦2\sqrt{7}⟧`], a: 1, why: T`⟦\sqrt{36 + 64} = 10⟧.` },
    { topic: "coordinate", t: "qc", q: T`Line ℓ is perpendicular to ⟦y = \frac{1}{2}x + 3⟧.`, A: T`Slope of ℓ`, B: T`⟦-1⟧`, a: 1, why: T`Slope ⟦-2 < -1⟧.` },
    { topic: "graphs", t: "mc", q: T`Which is the graph of ⟦y = x^2⟧ moved 2 left and 1 up?`, o: [T`⟦y = (x - 2)^2 + 1⟧`, T`⟦y = (x + 2)^2 + 1⟧`, T`⟦y = (x + 2)^2 - 1⟧`, T`⟦y = x^2 + 3⟧`, T`⟦y = (x - 1)^2 + 2⟧`], a: 1, why: T`Left 2: ⟦x + 2⟧; up 1: ⟦+1⟧.` },
    { topic: "graphs", t: "qc", q: T`The circle ⟦x^2 + y^2 = 25⟧`, A: T`Number of points on it with integer coordinates in the first quadrant (x, y > 0)`, B: T`⟦2⟧`, a: 2, why: T`⟦(3, 4)⟧ and ⟦(4, 3)⟧.` },
    { topic: "wordprob", t: "ne", q: T`A tap fills a tank in 6 hours and a drain empties it in 9 hours. With both open, how many hours to fill the empty tank?`, a: "18", why: T`⟦\frac{1}{6} - \frac{1}{9} = \frac{1}{18}⟧.` },
    { topic: "wordprob", t: "mc", q: T`Two cars leave the same place in opposite directions at 50 and 70 km/h. After how many hours are they 300 km apart?`, o: ["2", "2.5", "3", "4", "6"], a: 1, why: T`⟦\frac{300}{120} = 2.5⟧.` },
    // ---------- geometry
    { topic: "angles", t: "qc", q: T`In a triangle, the angles are ⟦x^\circ⟧, ⟦2x^\circ⟧ and ⟦90^\circ⟧.`, A: T`⟦x⟧`, B: T`⟦30⟧`, a: 2, why: T`⟦3x = 90⟧.` },
    { topic: "triangles", t: "ne", q: T`A ladder 10 m long leans on a wall with its foot 6 m from the wall. How high up the wall does it reach, in m?`, a: "8", why: T`6-8-10 triangle.` },
    { topic: "triangles", t: "qc", q: T`A triangle has sides 6, 8 and 11.`, A: T`The largest angle`, B: T`⟦90^\circ⟧`, a: 0, why: T`⟦6^2 + 8^2 = 100 < 121 = 11^2⟧: the triangle is obtuse.` },
    { topic: "congruence", t: "mc", q: T`A photo 4 × 6 is enlarged so the short side is 10. What is the area of the enlargement?`, o: ["60", "100", "150", "240", "360"], a: 2, why: T`⟦k = 2.5⟧: ⟦10 \times 15 = 150⟧.` },
    { topic: "polygons", t: "ne", q: T`A rectangle has a perimeter of 34 and a diagonal of 13. What is its area?`, a: "60", why: T`⟦l + w = 17⟧, ⟦l^2 + w^2 = 169⟧: ⟦2lw = 289 - 169 = 120⟧.` },
    { topic: "circles", t: "qc", q: T`An arc of a circle with radius 6 has a central angle of ⟦120^\circ⟧.`, A: T`Length of the arc`, B: T`⟦4\pi⟧`, a: 2, why: T`⟦\frac{1}{3} \cdot 12\pi = 4\pi⟧.` },
    { topic: "circles", t: "ne", q: T`A circle is inscribed in a square of area 64. The circle's area is ⟦k\pi⟧. What is k?`, a: "16", why: T`Side 8, radius 4.` },
    { topic: "solids", t: "mc", q: T`How many cubes of side 2 fit inside a box ⟦6 \times 8 \times 10⟧?`, o: ["24", "48", "60", "120", "480"], a: 2, why: T`⟦3 \cdot 4 \cdot 5 = 60⟧.` },
    { topic: "solids", t: "qc", q: T`Cylinder A: radius 2, height 9. Cylinder B: radius 3, height 4.`, A: T`Volume of A`, B: T`Volume of B`, a: 2, why: T`⟦36\pi⟧ each.` },
    // ---------- data analysis
    { topic: "stats", t: "ne", q: T`The mean of 5 consecutive even integers is 24. What is the largest?`, a: "28", why: T`Middle is 24: 20, 22, 24, 26, 28.` },
    { topic: "stats", t: "qc", q: T`List: 3, 5, 5, 6, 8, 9, x. The median is 6.`, A: T`⟦x⟧`, B: T`⟦6⟧`, a: 3, why: T`Any ⟦x \ge 6⟧ keeps the median 6 (x = 6 or x = 100 both work).` },
    { topic: "spread", t: "mc", q: T`Data set D has mean 50 and SD 10. Which value is 2.5 SDs above the mean?`, o: ["52.5", "60", "70", "75", "80"], a: 3, why: T`⟦50 + 2.5(10) = 75⟧.` },
    { topic: "spread", t: "qc", q: T`Set X: 10, 20, 30, 40, 50. Set Y: 25, 28, 30, 32, 35.`, A: T`SD of X`, B: T`SD of Y`, a: 0, why: T`Same mean, but X is far more spread out.` },
    { topic: "normal", t: "ne", q: T`A normal distribution has mean 100 and SD 15. About what percent of values are above 130?`, a: "2.5", unit: "%", why: T`130 is ⟦+2\sigma⟧.` },
    { topic: "counting", t: "ne", q: T`How many ways can 4 books be chosen from 7 and placed in a row on a shelf?`, a: "840", why: T`⟦7 \cdot 6 \cdot 5 \cdot 4⟧.` },
    { topic: "counting", t: "qc", q: "", A: T`⟦\binom{10}{2}⟧`, B: T`⟦\binom{10}{8}⟧`, a: 2, why: T`Both 45.` },
    { topic: "counting", t: "mc", q: T`How many diagonals does a hexagon have?`, o: ["6", "9", "12", "15", "18"], a: 1, why: T`⟦\binom{6}{2} - 6 = 15 - 6 = 9⟧.` },
    { topic: "probability", t: "mc", q: T`Three fair coins are flipped. What is the probability of exactly one head?`, o: [T`⟦\frac{1}{8}⟧`, T`⟦\frac{1}{4}⟧`, T`⟦\frac{3}{8}⟧`, T`⟦\frac{1}{2}⟧`, T`⟦\frac{3}{4}⟧`], a: 2, why: T`⟦\frac{\binom{3}{1}}{8}⟧.` },
    { topic: "probability", t: "ne", q: T`A number is picked at random from 1 to 20. What is the probability it is a multiple of 3 or 5? Give a fraction.`, a: "9/20", why: T`Multiples of 3: 6; of 5: 4; of 15: 1. ⟦\frac{6 + 4 - 1}{20}⟧.` },
    { topic: "conditional", t: "qc", q: T`A die is rolled. B: the result is even.`, A: T`⟦P(\text{result} > 3 \mid B)⟧`, B: T`⟦P(\text{result} > 3)⟧`, a: 0, why: T`Given even {2, 4, 6}: ⟦\frac{2}{3}⟧. Overall ⟦\frac{3}{6} = \frac{1}{2}⟧.` },
    { topic: "conditional", t: "ne", q: T`Box A has 2 red and 3 blue balls; box B has 4 red and 1 blue. A box is chosen at random, then a ball. What is the probability the ball is red? Give a fraction.`, a: "3/5", why: T`⟦\frac{1}{2} \cdot \frac{2}{5} + \frac{1}{2} \cdot \frac{4}{5} = \frac{3}{5}⟧.` },
    { topic: "expected", t: "mc", q: T`A raffle sells 500 tickets at $4. One prize of $1,000 and two of $200. What is the expected value of one ticket, after its cost?`, o: ["−$1.20", "−$0.40", "$0", "$0.40", "$2.80"], a: 0, why: T`⟦\frac{1000 + 400}{500} = 2.80⟧; ⟦2.80 - 4 = -1.20⟧.` },
    { topic: "expected", t: "qc", q: T`X is the result of one fair die; Y is the larger of two fair dice.`, A: T`⟦E(X)⟧`, B: T`⟦E(Y)⟧`, a: 1, why: T`The larger of two dice tends to be higher: ⟦E(Y) = \frac{161}{36} \approx 4.47 > 3.5⟧.` },
    { topic: "qc", t: "qc", q: T`⟦x < 0 < y⟧`, A: T`⟦x - y⟧`, B: T`⟦y - x⟧`, a: 1, why: T`⟦x - y < 0 < y - x⟧.` },
    { topic: "qc", t: "qc", q: T`⟦xy > 0⟧`, A: T`⟦\frac{x}{y}⟧`, B: T`⟦0⟧`, a: 0, why: T`Same sign, so the quotient is positive.` },
  ];
})();
