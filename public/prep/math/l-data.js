/* GRE Quant lessons: Data analysis and Quantitative Comparison strategy. Maths between ⟦ and ⟧ (KaTeX). */
var T = String.raw;
window.QL = window.QL || [];
QL.push(
{
  id: "stats", unit: "Data analysis", title: "Mean, median, mode, range", mins: 12,
  idea: T`⟦\text{mean} = \frac{\text{sum}}{\text{count}}⟧; the median is the middle; work with the sum.`,
  learn: [
    { h: "The four measures", html: T`<b>Mean</b> ⟦= \frac{\text{sum}}{n}⟧. <b>Median</b>: the middle value when sorted (average the two middle values if n is even). <b>Mode</b>: the most common value. <b>Range</b> ⟦= \max - \min⟧.` },
    { h: "Use the sum", html: T`5 numbers with mean 12 have sum 60. Add 18: new mean ⟦= \frac{78}{6} = 13⟧.` },
    { h: "Weighted average", html: T`10 students average 70 and 30 average 90: ⟦\frac{10(70) + 30(90)}{40} = 85⟧, closer to the bigger group.` },
    { h: "Changing every value", html: T`Add k to every value: mean and median go up by k; range and SD stay the same. Multiply by k: all of them are multiplied (SD by ⟦|k|⟧).` },
    { h: "Evenly spaced sets", html: T`⟦\text{mean} = \text{median} = \frac{\text{first} + \text{last}}{2}⟧.` },
  ],
  rules: [T`\text{sum} = \text{mean} \times n`, T`\bar x_w = \frac{\sum n_i \bar x_i}{\sum n_i}`, T`\text{evenly spaced: mean} = \text{median}`],
  widget: "dotplot",
  examples: [
    { q: T`Four numbers have mean 15. Three are 10, 12 and 20. Find the fourth.`, steps: [T`Sum ⟦= 4 \times 15 = 60⟧.`, T`⟦10 + 12 + 20 = 42⟧.`, T`⟦60 - 42 = 18⟧.`], a: T`18` },
    { q: T`Find the median of 3, 9, 1, 7, 4, 10.`, steps: [T`Sort: 1, 3, 4, 7, 9, 10.`, T`Middle pair: 4 and 7.`, T`⟦\frac{4 + 7}{2} = 5.5⟧.`], a: T`5.5` },
  ],
  tips: [T`Always sort before finding the median.`, T`One huge value moves the mean a lot, the median hardly at all.`],
  traps: [T`The mean of two group averages is not the overall average unless the groups are the same size.`],
  practice: [
    { t: "ne", q: T`Six test scores average 80. After a seventh test the average is 82. What was the seventh score?`, a: "94", why: T`⟦7 \times 82 - 6 \times 80 = 574 - 480 = 94⟧.` },
    { t: "qc", q: T`⟦S = \{2, 4, 6, 8, 30\}⟧`, A: T`Mean of S`, B: T`Median of S`, a: 0, why: T`Mean ⟦= 10⟧, median ⟦= 6⟧.` },
    { t: "mc", q: T`12 men average 30 years old and 8 women average 25. What is the group's average age?`, o: ["26", "27", "27.5", "28", "29"], a: 3, why: T`⟦\frac{360 + 200}{20} = 28⟧.` },
    { t: "ma", q: T`Every number in a list is increased by 5. Which of these also increase? Select all that apply.`, o: ["Mean", "Median", "Range", "Standard deviation", "Mode"], a: [0, 1, 4], why: T`The centre moves; the spread doesn't.` },
  ]
},
{
  id: "spread", unit: "Data analysis", title: "Standard deviation, quartiles, boxplots", mins: 12,
  idea: T`Standard deviation measures distance from the mean; quartiles cut sorted data into four parts.`,
  learn: [
    { h: "Standard deviation", html: T`The typical distance from the mean. ⟦\{10, 10, 10\}⟧ has SD 0; ⟦\{5, 10, 15\}⟧ has a bigger SD than ⟦\{9, 10, 11\}⟧. On the GRE you compare SDs more than you calculate them.` },
    { h: "Comparing SD", html: T`More spread → bigger SD. Adding a value equal to the mean makes the SD smaller.` },
    { h: "Quartiles", html: T`Sort. ⟦Q_2⟧ is the median, ⟦Q_1⟧ the median of the lower half, ⟦Q_3⟧ of the upper half. ⟦IQR = Q_3 - Q_1⟧.` },
    { h: "Boxplots", html: T`Min, ⟦Q_1⟧, median, ⟦Q_3⟧, max. The box holds the middle 50%.` },
  ],
  rules: [T`IQR = Q_3 - Q_1`, T`x + k: \ \sigma \text{ same}`, T`kx: \ \sigma \to |k|\sigma`],
  widget: "boxplot",
  examples: [
    { q: T`Which has the larger SD: ⟦\{1, 5, 9\}⟧ or ⟦\{4, 5, 6\}⟧?`, steps: [T`Both have mean 5.`, T`⟦\{1, 5, 9\}⟧ is 4 away on each side; ⟦\{4, 5, 6\}⟧ only 1.`], a: T`⟦\{1, 5, 9\}⟧` },
    { q: T`Find the IQR of 2, 4, 5, 7, 8, 10, 12, 15.`, steps: [T`Lower half 2, 4, 5, 7: ⟦Q_1 = 4.5⟧.`, T`Upper half 8, 10, 12, 15: ⟦Q_3 = 11⟧.`, T`⟦11 - 4.5 = 6.5⟧.`], a: T`6.5` },
  ],
  tips: [T`For SD, look at distance from each set's own mean, not the size of the numbers.`],
  traps: [T`⟦\{100, 101, 102\}⟧ has a smaller SD than ⟦\{1, 5, 9\}⟧.`],
  practice: [
    { t: "qc", q: T`⟦A = \{3, 3, 3, 3\}⟧, ⟦B = \{1, 2, 4, 5\}⟧`, A: T`SD of A`, B: T`SD of B`, a: 1, why: T`A has no spread at all.` },
    { t: "mc", q: T`Which set has the smallest standard deviation?`, o: [T`⟦\{1, 2, 3\}⟧`, T`⟦\{10, 20, 30\}⟧`, T`⟦\{50, 51, 52\}⟧`, T`⟦\{1, 10, 100\}⟧`, T`⟦\{4, 4, 4\}⟧`], a: 4, why: T`⟦\{4, 4, 4\}⟧ has SD 0.` },
    { t: "ne", q: T`For 1, 3, 4, 6, 9, 11, 13, 20, what is ⟦Q_3 - Q_1⟧?`, a: "8.5", why: T`⟦Q_1 = 3.5⟧, ⟦Q_3 = 12⟧.` },
    { t: "qc", q: T`Every value in a data set is multiplied by 3.`, A: T`SD of the new set`, B: T`⟦3 \times⟧ SD of the old set`, a: 2, why: T`Multiplying by k multiplies the SD by ⟦|k|⟧.` },
  ]
},
{
  id: "normal", unit: "Data analysis", title: "Normal distribution", mins: 8,
  idea: T`About 68% of a normal distribution is within 1 SD, 95% within 2, 99.7% within 3.`,
  learn: [
    { h: "The bell curve", html: T`Symmetric about the mean, so mean = median.` },
    { h: "68 – 95 – 99.7", html: T`Between the mean and ⟦+1\sigma⟧: 34%. Between ⟦+1\sigma⟧ and ⟦+2\sigma⟧: 13.5%. Above ⟦+2\sigma⟧: 2.5%. The left side is the same.` },
    { h: "Using it", html: T`Mean 70, SD 10: a score of 90 is ⟦+2\sigma⟧, so about 97.5% scored lower.` },
  ],
  rules: [T`\mu \pm \sigma \approx 68\%`, T`\mu \pm 2\sigma \approx 95\%`, T`\mu \pm 3\sigma \approx 99.7\%`],
  widget: "normal",
  examples: [
    { q: T`Heights are normal with mean 170 cm and SD 8 cm. About what percent are taller than 178 cm?`, steps: [T`⟦178 = \mu + \sigma⟧.`, T`Above the mean: 50%; mean to ⟦+\sigma⟧: 34%.`, T`⟦50\% - 34\% = 16\%⟧.`], a: T`about 16%` },
  ],
  tips: [T`Sketch the curve and write 34 | 13.5 | 2.5 on each side.`],
  traps: [T`These percents are approximate.`],
  practice: [
    { t: "mc", q: T`Scores are normal with mean 500 and SD 100. About what percent are between 400 and 600?`, o: ["34%", "50%", "68%", "95%", "99.7%"], a: 2, why: T`Within 1 SD: about 68%.` },
    { t: "qc", q: T`A normal distribution has mean 50 and SD 5.`, A: T`Percent of values above 60`, B: T`5%`, a: 1, why: T`60 is ⟦+2\sigma⟧: about 2.5% are above it.` },
    { t: "ne", q: T`Weights are normal with mean 60 kg and SD 4 kg. About what percent are between 56 and 68 kg?`, a: "81.5", unit: "%", why: T`⟦34 + 34 + 13.5 = 81.5⟧.` },
  ]
},
{
  id: "counting", unit: "Data analysis", title: "Permutations and combinations", mins: 14,
  idea: T`Multiply the choices. Order matters → permutation; order doesn't → combination.`,
  learn: [
    { h: "Multiply", html: T`3 shirts and 4 trousers: ⟦3 \times 4 = 12⟧ outfits.` },
    { h: "Permutations", html: T`Arrange n things: ⟦n!⟧. Pick k in order: ⟦{}_nP_k = \frac{n!}{(n-k)!}⟧. President and secretary from 10: ⟦10 \times 9 = 90⟧.` },
    { h: "Combinations", html: T`⟦\binom{n}{k} = \frac{n!}{k!\,(n-k)!}⟧. A team of 3 from 10: ⟦\frac{10 \cdot 9 \cdot 8}{3!} = 120⟧.` },
    { h: "Repeated letters", html: T`BOOK: ⟦\frac{4!}{2!} = 12⟧ arrangements.` },
    { h: "Overlapping groups", html: T`⟦\text{Total} = A + B - \text{both} + \text{neither}⟧.` },
  ],
  rules: [T`{}_nP_k = \frac{n!}{(n-k)!}`, T`\binom{n}{k} = \frac{n!}{k!(n-k)!}`, T`\binom{n}{k} = \binom{n}{n-k}`, T`T = A + B - \text{both} + \text{neither}`],
  widget: "combo",
  examples: [
    { q: T`In how many ways can 5 people stand in a line?`, steps: [T`5 choices, then 4, then 3…`, T`⟦5! = 120⟧.`], a: T`120` },
    { q: T`How many pizzas with exactly 3 of 8 toppings?`, steps: [T`Order doesn't matter.`, T`⟦\binom{8}{3} = \frac{8 \cdot 7 \cdot 6}{3!} = 56⟧.`], a: T`56` },
  ],
  tips: [T`Swap two items: is it a different result? Yes → permutation.`],
  traps: [T`"At least one": count all, then subtract the "none" case.`],
  practice: [
    { t: "ne", q: T`How many 3-letter codes can be made from A, B, C, D, E with no repeats?`, a: "60", why: T`⟦5 \cdot 4 \cdot 3 = 60⟧.` },
    { t: "mc", q: T`How many ways can a committee of 2 be chosen from 7 people?`, o: ["14", "21", "42", "49", "5040"], a: 1, why: T`⟦\binom{7}{2} = 21⟧.` },
    { t: "qc", q: "", A: T`⟦\binom{9}{3}⟧`, B: T`⟦\binom{9}{6}⟧`, a: 2, why: T`⟦\binom{n}{k} = \binom{n}{n-k}⟧: both are 84.` },
    { t: "ne", q: T`In a class of 40, 22 play football, 15 play basketball and 8 play both. How many play neither?`, a: "11", why: T`⟦40 - (22 + 15 - 8) = 11⟧.` },
    { t: "ne", q: T`How many arrangements are there of the letters in LEVEL?`, a: "30", why: T`⟦\frac{5!}{2!\,2!} = 30⟧.` },
  ]
},
{
  id: "probability", unit: "Data analysis", title: "Probability", mins: 12,
  idea: T`⟦P = \frac{\text{favorable}}{\text{total}}⟧. AND multiplies; OR adds, minus the overlap.`,
  learn: [
    { h: "Basics", html: T`⟦0 \le P \le 1⟧ and ⟦P(\text{not } A) = 1 - P(A)⟧.` },
    { h: "AND", html: T`Independent events: ⟦P(A \cap B) = P(A)\,P(B)⟧. Two heads: ⟦\frac{1}{2} \cdot \frac{1}{2} = \frac{1}{4}⟧.` },
    { h: "OR", html: T`⟦P(A \cup B) = P(A) + P(B) - P(A \cap B)⟧.` },
    { h: "Without replacement", html: T`2 red from 5 red and 3 blue: ⟦\frac{5}{8} \cdot \frac{4}{7} = \frac{5}{14}⟧.` },
    { h: "At least one", html: T`⟦1 - P(\text{none})⟧. At least one six in two rolls: ⟦1 - \left(\frac{5}{6}\right)^2 = \frac{11}{36}⟧.` },
  ],
  rules: [T`P(A') = 1 - P(A)`, T`P(A \cap B) = P(A)P(B)`, T`P(A \cup B) = P(A) + P(B) - P(A \cap B)`],
  widget: "venn",
  examples: [
    { q: T`Two dice are rolled. What is the probability the sum is 7?`, steps: [T`⟦6 \times 6 = 36⟧ outcomes.`, T`Sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1).`, T`⟦\frac{6}{36} = \frac{1}{6}⟧.`], a: T`⟦\frac{1}{6}⟧` },
    { q: T`A coin is flipped 3 times. What is the probability of at least one head?`, steps: [T`No heads: ⟦\left(\frac{1}{2}\right)^3 = \frac{1}{8}⟧.`, T`⟦1 - \frac{1}{8} = \frac{7}{8}⟧.`], a: T`⟦\frac{7}{8}⟧` },
  ],
  tips: [T`"At least one" → ⟦1 - P(\text{none})⟧.`],
  traps: [T`Adding when you should multiply (AND).`],
  practice: [
    { t: "ne", q: T`A bag has 4 red and 6 blue marbles. Two are drawn without replacement. What is the probability both are red?`, a: "2/15", why: T`⟦\frac{4}{10} \cdot \frac{3}{9} = \frac{2}{15}⟧.` },
    { t: "mc", q: T`⟦P(A) = 0.5⟧, ⟦P(B) = 0.4⟧, ⟦P(A \cap B) = 0.2⟧. Find ⟦P(A \cup B)⟧.`, o: ["0.2", "0.5", "0.7", "0.9", "1"], a: 2, why: T`⟦0.5 + 0.4 - 0.2 = 0.7⟧.` },
    { t: "qc", q: T`A fair die is rolled once.`, A: T`P(a number greater than 4)`, B: T`P(an even number)`, a: 1, why: T`⟦\frac{2}{6} < \frac{3}{6}⟧.` },
    { t: "ne", q: T`A fair coin is flipped 4 times. What is the probability of exactly 2 heads?`, a: "3/8", why: T`⟦\frac{\binom{4}{2}}{2^4} = \frac{6}{16} = \frac{3}{8}⟧.` },
  ]
},
{
  id: "charts", unit: "Data analysis", title: "Reading graphs and tables", mins: 10,
  idea: T`Read the labels and units first; estimate before you calculate.`,
  learn: [
    { h: "Read first", html: T`Title, axes, units (thousands? percent?), key. Most mistakes are reading mistakes.` },
    { h: "Percent change", html: T`⟦\frac{\text{change}}{\text{start}}⟧: 40 → 50 is +25%; 50 → 40 is −20%.` },
    { h: "Pie charts", html: T`⟦\frac{\text{angle}}{360^\circ}⟧ is the percent: ⟦90^\circ = 25\%⟧.` },
    { h: "Estimate", html: T`⟦\frac{487}{1210} \approx \frac{500}{1200} \approx 40\%⟧.` },
  ],
  rules: [T`\%\,\text{change} = \frac{\Delta}{\text{start}}`, T`\text{pie: } \frac{\theta}{360^\circ}`],
  widget: "chart",
  examples: [
    { q: T`Sales were 120 thousand in 2022 and 150 thousand in 2023. Find the percent increase.`, steps: [T`Change ⟦= 30⟧.`, T`⟦\frac{30}{120} = 0.25 = 25\%⟧.`], a: T`25%` },
  ],
  tips: [T`Try the chart above and answer its question first.`],
  traps: [T`40% of the 30% who are students is 12% of everyone.`],
  practice: [
    { t: "ne", q: T`In a pie chart, "Rent" is a ⟦108^\circ⟧ sector of a $2,500 monthly budget. How much is rent, in dollars?`, a: "750", why: T`⟦\frac{108}{360} = 30\%⟧, and ⟦0.3 \times 2500 = 750⟧.` },
    { t: "mc", q: T`Profit fell from $80 million to $60 million. What was the percent change?`, o: ["−20%", "−25%", "−33%", "+25%", "+33%"], a: 1, why: T`⟦\frac{-20}{80} = -25\%⟧.` },
    { t: "qc", q: T`Of 400 people surveyed, 30% are students, and 40% of the students have a car.`, A: T`Students with a car`, B: T`50`, a: 1, why: T`⟦400 \times 0.3 \times 0.4 = 48 < 50⟧.` },
  ]
},
{
  id: "qc", unit: "Strategy", title: "Quantitative Comparison strategy", mins: 10,
  idea: T`Plug in different kinds of numbers and see whether the answer can change.`,
  learn: [
    { h: "The four answers", html: T`(A) A is greater, (B) B is greater, (C) equal, (D) can't be determined. If A wins for one value and B for another, the answer is (D).` },
    { h: "Numbers to try", html: T`A normal positive integer, then <b>⟦0,\ 1,\ -1,\ \frac{1}{2},\ -\frac{1}{2}⟧ and a big number</b>.` },
    { h: "Simplify both sides", html: T`Add, subtract, or multiply/divide both quantities by the same <b>positive</b> number. Never by something that could be negative.` },
    { h: "Only numbers?", html: T`If there are no variables, the answer can't be (D).` },
  ],
  rules: [T`\text{try } 2,\ 0,\ 1,\ -1,\ \tfrac{1}{2},\ -\tfrac{1}{2},\ 100`, T`\text{no variables} \Rightarrow \text{not (D)}`],
  widget: "plugin",
  examples: [
    { q: T`Compare A: ⟦x^2⟧ and B: ⟦x⟧.`, steps: [T`⟦x = 2⟧: ⟦4 > 2⟧, A wins.`, T`⟦x = \frac{1}{2}⟧: ⟦\frac{1}{4} < \frac{1}{2}⟧, B wins.`, T`Different results, so (D).`], a: T`(D)` },
    { q: T`⟦x > 0⟧. Compare A: ⟦\frac{x + 1}{x}⟧ and B: 1.`, steps: [T`⟦\frac{x + 1}{x} = 1 + \frac{1}{x}⟧.`, T`⟦\frac{1}{x} > 0⟧, so A is bigger.`], a: T`(A)` },
  ],
  tips: [T`Read the given information first: it limits which numbers you may try.`],
  traps: [T`Trying only positive integers.`, T`Multiplying both sides by a variable that might be negative.`],
  practice: [
    { t: "qc", q: T`⟦x \ne 0⟧`, A: T`⟦\frac{x}{x^2}⟧`, B: T`⟦\frac{1}{x}⟧`, a: 2, why: T`⟦\frac{x}{x^2} = \frac{1}{x}⟧ for every ⟦x \ne 0⟧.` },
    { t: "qc", q: T`⟦-1 < x < 0⟧`, A: T`⟦x^3⟧`, B: T`⟦x^2⟧`, a: 1, why: T`⟦x^3 < 0 < x^2⟧.` },
    { t: "qc", q: T`⟦a > b⟧`, A: T`⟦a^2⟧`, B: T`⟦b^2⟧`, a: 3, why: T`⟦a = 3, b = 2⟧: A wins. ⟦a = 1, b = -5⟧: B wins.` },
    { t: "qc", q: "", A: T`⟦\sqrt{50} + \sqrt{18}⟧`, B: T`⟦\sqrt{128}⟧`, a: 2, why: T`⟦5\sqrt{2} + 3\sqrt{2} = 8\sqrt{2} = \sqrt{128}⟧.` },
    { t: "qc", q: T`n is a positive integer.`, A: T`⟦(-1)^n⟧`, B: T`⟦0⟧`, a: 3, why: T`n even: 1; n odd: ⟦-1⟧.` },
  ]
}
);
