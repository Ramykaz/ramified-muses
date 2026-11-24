/* GRE Quant lessons: Data analysis, plus the Quantitative Comparison strategy lesson. */
window.QL = window.QL || [];
QL.push(
{
  id: "stats", unit: "Data analysis", title: "Mean, median, mode, range", mins: 12,
  idea: "Mean = sum ÷ count; the median is the middle; use the sum to handle changes.",
  learn: [
    { h: "The four measures", html: "<b>Mean</b> = sum / count. <b>Median</b> = middle value when sorted (average of the two middle values if the count is even). <b>Mode</b> = most common value. <b>Range</b> = max − min." },
    { h: "Work with the sum", html: "If 5 numbers have mean 12, their sum is 60. Add a sixth number 18: new mean = 78/6 = 13." },
    { h: "Weighted average", html: "Class A (10 students) averages 70, class B (30 students) averages 90: (10·70 + 30·90)/40 = 85. The answer is closer to the bigger group." },
    { h: "Effects of changes", html: "Adding k to every value adds k to the mean and median, and the range and SD stay the same. Multiplying every value by k multiplies all of them by k (SD by |k|)." },
    { h: "Evenly spaced sets", html: "For evenly spaced numbers, mean = median = (first + last)/2." },
  ],
  rules: ["Sum = mean × count", "Median: sort, take the middle", "Weighted avg = Σ(n·avg)/Σn", "Evenly spaced: mean = median"],
  widget: "dotplot",
  examples: [
    { q: "The mean of 4 numbers is 15. Three of them are 10, 12 and 20. What is the fourth?", steps: ["Sum = 4 × 15 = 60.", "10 + 12 + 20 = 42.", "Fourth = 60 − 42 = 18."], a: "18" },
    { q: "What is the median of 3, 9, 1, 7, 4, 10?", steps: ["Sort: 1, 3, 4, 7, 9, 10.", "Even count: the middle two are 4 and 7.", "Median = (4 + 7)/2 = 5.5."], a: "5.5" },
  ],
  tips: ["Always sort before finding the median.", "One very big value moves the mean a lot but the median very little."],
  traps: ["The mean of averages is not the overall average unless the groups are the same size."],
  practice: [
    { t: "ne", q: "The average of 6 test scores is 80. After a seventh test the average is 82. What was the seventh score?", a: "94", why: "Sum 480 → 574 (7 × 82). 574 − 480 = 94." },
    { t: "qc", q: "Set S = {2, 4, 6, 8, 30}", A: "Mean of S", B: "Median of S", a: 0, why: "Mean = 50/5 = 10, median = 6." },
    { t: "mc", q: "In a group, 12 men average 30 years old and 8 women average 25. What is the average age of the group?", o: ["26", "27", "27.5", "28", "29"], a: 3, why: "(12·30 + 8·25)/20 = (360 + 200)/20 = 28." },
    { t: "ma", q: "Each number in a list is increased by 5. Which of the following also increase? Select all that apply.", o: ["Mean", "Median", "Range", "Standard deviation", "Mode"], a: [0, 1, 4], why: "Adding 5 shifts the centre (mean, median, mode) but not the spread (range, SD)." },
  ]
},
{
  id: "spread", unit: "Data analysis", title: "Standard deviation, quartiles, boxplots", mins: 12,
  idea: "Standard deviation measures how far values are from the mean; quartiles split sorted data into four parts.",
  learn: [
    { h: "Standard deviation (SD)", html: "SD is about the typical distance from the mean. {10, 10, 10} has SD 0. {5, 10, 15} has a bigger SD than {9, 10, 11}. On the GRE you rarely calculate it; you compare." },
    { h: "Comparing SD", html: "More spread out → bigger SD. Values far from the mean push it up most. Adding the mean itself to a set makes the SD smaller." },
    { h: "Quartiles and IQR", html: "Sort the data. Q2 is the median. Q1 is the median of the lower half, Q3 the median of the upper half. IQR = Q3 − Q1." },
    { h: "Boxplots", html: "A boxplot shows min, Q1, median, Q3, max. The box holds the middle 50% of the data." },
    { h: "Percentiles", html: "The 80th percentile is a value with about 80% of the data below it." },
  ],
  rules: ["More spread → larger SD", "IQR = Q3 − Q1", "Box = middle 50%", "Add/subtract k: SD same", "Multiply by k: SD × |k|"],
  widget: "boxplot",
  examples: [
    { q: "Which has the larger SD: {1, 5, 9} or {4, 5, 6}?", steps: ["Both have mean 5.", "{1, 5, 9} is 4 away from the mean on each side; {4, 5, 6} only 1.", "So {1, 5, 9} has the larger SD."], a: "{1, 5, 9}" },
    { q: "Find the IQR of 2, 4, 5, 7, 8, 10, 12, 15.", steps: ["Lower half: 2, 4, 5, 7 → Q1 = 4.5.", "Upper half: 8, 10, 12, 15 → Q3 = 11.", "IQR = 11 − 4.5 = 6.5."], a: "6.5" },
  ],
  tips: ["For SD comparisons, look at how far the values are from their own mean, not how big they are."],
  traps: ["{100, 101, 102} has a smaller SD than {1, 5, 9}, even though its numbers are bigger."],
  practice: [
    { t: "qc", q: "Set A = {3, 3, 3, 3}. Set B = {1, 2, 4, 5}.", A: "SD of A", B: "SD of B", a: 1, why: "A has no spread (SD 0); B is spread out." },
    { t: "mc", q: "Which set has the smallest standard deviation?", o: ["{1, 2, 3}", "{10, 20, 30}", "{50, 51, 52}", "{1, 10, 100}", "{4, 4, 4}"], a: 4, why: "{4, 4, 4} has SD 0." },
    { t: "ne", q: "The data are 1, 3, 4, 6, 9, 11, 13, 20. What is Q3 − Q1?", a: "8.5", why: "Q1 = (3 + 4)/2 = 3.5, Q3 = (11 + 13)/2 = 12. 12 − 3.5 = 8.5." },
    { t: "qc", q: "Every value in a data set is multiplied by 3.", A: "SD of the new set", B: "3 × SD of the old set", a: 2, why: "Multiplying by k multiplies the SD by |k|." },
  ]
},
{
  id: "normal", unit: "Data analysis", title: "Normal distribution", mins: 8,
  idea: "In a normal distribution, about 68% is within 1 SD, 95% within 2, 99.7% within 3.",
  learn: [
    { h: "The bell curve", html: "Symmetric around the mean: mean = median. Half the data is above the mean, half below." },
    { h: "68-95-99.7", html: "About 68% of values are within 1 SD of the mean, 95% within 2 SD, 99.7% within 3 SD. So about 34% is between the mean and +1 SD, 13.5% between +1 and +2 SD, and 2.5% is above +2 SD." },
    { h: "Using it", html: "Mean 70, SD 10: a score of 90 is +2 SD, so about 97.5% scored below it (the 97th–98th percentile)." },
  ],
  rules: ["Within 1 SD ≈ 68%", "Within 2 SD ≈ 95%", "Within 3 SD ≈ 99.7%", "Mean = median (symmetric)"],
  widget: "normal",
  examples: [
    { q: "Heights are normal with mean 170 cm and SD 8 cm. About what percent are taller than 178 cm?", steps: ["178 = 170 + 8 = mean + 1 SD.", "Above the mean: 50%. Between mean and +1 SD: 34%.", "Above +1 SD: 50% − 34% = 16%."], a: "About 16%" },
  ],
  tips: ["Draw the curve and write 34, 13.5, 2.5 on each side."],
  traps: ["These percents are approximate: the GRE says \"approximately\"."],
  practice: [
    { t: "mc", q: "Scores are normal with mean 500 and SD 100. About what percent are between 400 and 600?", o: ["34%", "50%", "68%", "95%", "99.7%"], a: 2, why: "400 to 600 is within 1 SD of the mean: about 68%." },
    { t: "qc", q: "A normal distribution has mean 50 and SD 5.", A: "The percent of values greater than 60", B: "5%", a: 1, why: "60 is +2 SD: about 2.5% are above it." },
    { t: "ne", q: "Weights are normal with mean 60 kg and SD 4 kg. About what percent weigh between 56 and 68 kg? (Use 68-95-99.7.)", a: "81.5", unit: "%", why: "56 is −1 SD (34%), 68 is +2 SD (34% + 13.5%). Total 34 + 47.5 = 81.5%." },
  ]
},
{
  id: "counting", unit: "Data analysis", title: "Counting: permutations and combinations", mins: 14,
  idea: "Multiply the choices; use permutations when order matters and combinations when it doesn't.",
  learn: [
    { h: "Multiply the choices", html: "3 shirts and 4 trousers: 3 × 4 = 12 outfits." },
    { h: "Permutations (order matters)", html: "Arrange n things: n! ways. Choose and arrange k from n: nPk = n!/(n − k)!. A president and a secretary from 10 people: 10 × 9 = 90." },
    { h: "Combinations (order doesn't matter)", html: "nCk = n! / (k!(n − k)!). A team of 3 from 10: 10·9·8/(3·2·1) = 120." },
    { h: "Repeated letters", html: "Arrangements of BOOK: 4!/2! = 12 (divide by the repeats)." },
    { h: "Overlapping sets", html: "Total = A + B − both + neither. 30 like tea, 25 coffee, 10 both, 5 neither: 30 + 25 − 10 + 5 = 50 people." },
  ],
  rules: ["n! = n(n−1)…1", "nPk = n!/(n−k)!", "nCk = n!/(k!(n−k)!)", "Total = A + B − both + neither"],
  widget: "combo",
  examples: [
    { q: "In how many ways can 5 people stand in a line?", steps: ["5 choices for the first place, 4 for the second…", "5! = 5 × 4 × 3 × 2 × 1 = 120."], a: "120" },
    { q: "A pizza place has 8 toppings. How many pizzas with exactly 3 different toppings?", steps: ["Order doesn't matter (a pizza with ham, olives, corn is the same in any order).", "8C3 = 8 × 7 × 6 / 3! = 336/6 = 56."], a: "56" },
  ],
  tips: ["Ask: if I swap two items, is it a different result? Yes → permutation; no → combination.", "nCk = nC(n−k): choosing 2 to leave out is the same as choosing 8 to keep from 10."],
  traps: ["\"At least one\" problems: count all, then subtract the \"none\" case."],
  practice: [
    { t: "ne", q: "How many 3-letter codes can be made from A, B, C, D, E if no letter repeats?", a: "60", why: "5 × 4 × 3 = 60." },
    { t: "mc", q: "How many ways can a committee of 2 be chosen from 7 people?", o: ["14", "21", "42", "49", "5040"], a: 1, why: "7C2 = 7 × 6/2 = 21." },
    { t: "qc", q: "", A: "The number of ways to choose 3 books from 9", B: "The number of ways to choose 6 books from 9", a: 2, why: "9C3 = 9C6 = 84." },
    { t: "ne", q: "In a class of 40, 22 play football, 15 play basketball and 8 play both. How many play neither?", a: "11", why: "22 + 15 − 8 = 29 play at least one. 40 − 29 = 11." },
    { t: "ne", q: "How many different arrangements are there of the letters in LEVEL?", a: "30", why: "5!/(2!·2!) = 120/4 = 30 (two L's, two E's)." },
  ]
},
{
  id: "probability", unit: "Data analysis", title: "Probability", mins: 12,
  idea: "Probability = good outcomes ÷ all outcomes; AND multiplies, OR adds (minus the overlap).",
  learn: [
    { h: "Basics", html: "P = favorable / total, always between 0 and 1. P(not A) = 1 − P(A)." },
    { h: "AND (independent events)", html: "P(A and B) = P(A) × P(B). Two coins both heads: ½ × ½ = ¼." },
    { h: "OR", html: "P(A or B) = P(A) + P(B) − P(A and B). If A and B can't both happen, just add." },
    { h: "Without replacement", html: "Draw 2 red from 5 red and 3 blue without putting back: 5/8 × 4/7 = 20/56 = 5/14." },
    { h: "At least one", html: "P(at least one) = 1 − P(none). At least one six in 2 rolls: 1 − (5/6)² = 11/36." },
  ],
  rules: ["P(not A) = 1 − P(A)", "Independent: P(A∩B) = P(A)P(B)", "P(A∪B) = P(A) + P(B) − P(A∩B)", "At least one = 1 − none"],
  widget: "venn",
  examples: [
    { q: "Two dice are rolled. What is the probability the sum is 7?", steps: ["Total outcomes: 6 × 6 = 36.", "Sum 7: (1,6) (2,5) (3,4) (4,3) (5,2) (6,1) = 6 ways.", "6/36 = 1/6."], a: "1/6" },
    { q: "A coin is flipped 3 times. What is the probability of at least one head?", steps: ["No heads = TTT: (½)³ = 1/8.", "At least one = 1 − 1/8 = 7/8."], a: "7/8" },
  ],
  tips: ["\"At least one\" → use 1 − none.", "Write a quick list for small cases; it's often fastest."],
  traps: ["Adding probabilities for AND (you should multiply)."],
  practice: [
    { t: "ne", q: "A bag has 4 red and 6 blue marbles. Two are drawn without replacement. What is the probability that both are red? Give a fraction.", a: "2/15", why: "4/10 × 3/9 = 12/90 = 2/15." },
    { t: "mc", q: "P(A) = 0.5, P(B) = 0.4 and P(A and B) = 0.2. What is P(A or B)?", o: ["0.2", "0.5", "0.7", "0.9", "1"], a: 2, why: "0.5 + 0.4 − 0.2 = 0.7." },
    { t: "qc", q: "A fair die is rolled once.", A: "Probability of a number greater than 4", B: "Probability of an even number", a: 1, why: "A: {5, 6} = 1/3. B: {2, 4, 6} = 1/2." },
    { t: "ne", q: "A fair coin is flipped 4 times. What is the probability of getting exactly 2 heads? Give a fraction.", a: "3/8", why: "4C2 = 6 ways out of 16: 6/16 = 3/8." },
  ]
},
{
  id: "charts", unit: "Data analysis", title: "Reading graphs and tables", mins: 10,
  idea: "Read the labels and units first; estimate before you calculate.",
  learn: [
    { h: "Read before you compute", html: "Check the title, the axes, the units (thousands? percent?) and the key. Many mistakes are reading mistakes." },
    { h: "Percent change from a chart", html: "Change / starting value. From 40 to 50 is +25%; from 50 to 40 is −20%." },
    { h: "Pie charts", html: "A sector is a percent of the total: 90° is 25%. Part = percent × total." },
    { h: "Estimate", html: "Data interpretation choices are often far apart. Round: 487/1,210 ≈ 500/1,200 ≈ 40%." },
  ],
  rules: ["% change = change ÷ start", "Pie: angle/360 = percent", "Check units: thousands, millions, %"],
  widget: "chart",
  examples: [
    { q: "Sales were 120 (thousand) in 2022 and 150 in 2023. What is the percent increase?", steps: ["Change = 30.", "30/120 = 0.25.", "25% increase."], a: "25%" },
  ],
  tips: ["Use the chart in the interactive section and answer its question before reading the answer."],
  traps: ["Percent of a percent: 40% of the 30% who are students = 12% of everyone."],
  practice: [
    { t: "ne", q: "A pie chart shows 'Rent' as a sector of 108°. The monthly budget is $2,500. How much is rent, in dollars?", a: "750", why: "108/360 = 30%, and 30% of 2500 = 750." },
    { t: "mc", q: "A company's profit was $80 million in 2021 and $60 million in 2022. What was the percent change?", o: ["−20%", "−25%", "−33%", "+25%", "+33%"], a: 1, why: "−20/80 = −25%." },
    { t: "qc", q: "In a survey of 400 people, 30% are students, and 40% of the students have a car.", A: "Number of students with a car", B: "50", a: 1, why: "400 × 0.3 × 0.4 = 48, which is less than 50. B is greater." },
  ]
},
{
  id: "qc", unit: "Strategy", title: "Quantitative Comparison strategy", mins: 10,
  idea: "Plug in different kinds of numbers to see if the answer can change.",
  learn: [
    { h: "The four answers", html: "(A) A is greater · (B) B is greater · (C) equal · (D) can't be determined. If A > B for one value and A < B for another, the answer is (D)." },
    { h: "Plug in different numbers", html: "Try a positive integer, then <b>0, 1, −1, a fraction (½), a negative fraction and a big number</b>. These are the numbers that break patterns." },
    { h: "Simplify both sides the same way", html: "You can add, subtract, or multiply/divide both quantities by the same <b>positive</b> number. Never multiply by something that could be negative." },
    { h: "No variables?", html: "If both quantities are just numbers, the answer can't be (D)." },
  ],
  rules: ["Try: 2, 0, 1, −1, ½, −½, 100", "Same positive operation on both sides is safe", "Only numbers → never (D)"],
  widget: "plugin",
  examples: [
    { q: "Compare A: x² and B: x (no other information).", steps: ["x = 2: A = 4 > B = 2.", "x = ½: A = ¼ < B = ½.", "Different results, so the answer is (D)."], a: "(D) can't be determined" },
    { q: "x > 0. Compare A: (x + 1)/x and B: 1.", steps: ["(x + 1)/x = 1 + 1/x.", "For x > 0, 1/x > 0, so A > 1.", "Answer (A)."], a: "(A)" },
  ],
  tips: ["Check the given information first: it limits which numbers you can try.", "If two very different numbers give the same result, think about why before choosing it."],
  traps: ["Trying only positive integers.", "Multiplying both sides by a variable that might be negative."],
  practice: [
    { t: "qc", q: "x ≠ 0", A: "x/x²", B: "1/x", a: 2, why: "x/x² = 1/x for every x ≠ 0." },
    { t: "qc", q: "−1 < x < 0", A: "x³", B: "x²", a: 1, why: "x³ is negative and x² is positive." },
    { t: "qc", q: "a > b", A: "a²", B: "b²", a: 3, why: "a = 3, b = 2: A > B. a = 1, b = −5: A < B. Can't tell." },
    { t: "qc", q: "", A: "√50 + √18", B: "√128", a: 2, why: "5√2 + 3√2 = 8√2 = √128." },
    { t: "qc", q: "n is a positive integer.", A: "(−1)ⁿ", B: "0", a: 3, why: "n even → 1 > 0; n odd → −1 < 0." },
  ]
}
);
