/* GRE Quant lessons: Geometry. Maths between ⟦ and ⟧ (KaTeX). Figures are inline SVG, drawn like a textbook (not to scale, as on the GRE). */
var T = String.raw;
window.QL = window.QL || [];
window.FIG = {
  tri68: '<svg viewBox="0 0 240 160" class="fig"><polygon class="shape" points="30,135 200,135 30,25"/><path class="mark" d="M30 121h14v14"/><text x="115" y="154" class="v">8</text><text x="12" y="84" class="v">6</text><text x="122" y="72" class="v i">x</text></svg>',
  parallel: '<svg viewBox="0 0 260 160" class="fig"><line class="ln" x1="10" y1="50" x2="250" y2="50"/><line class="ln" x1="10" y1="115" x2="250" y2="115"/><line class="ln2" x1="80" y1="150" x2="175" y2="10"/><path class="arc" d="M168 50 A 22 22 0 0 0 151 31"/><text x="176" y="40" class="v">110°</text><path class="arc" d="M108 115 A 18 18 0 0 0 96 100"/><text x="72" y="108" class="v i">y°</text><text x="236" y="42" class="v i">ℓ</text><text x="236" y="107" class="v i">m</text></svg>',
  sqcircle: '<svg viewBox="0 0 220 180" class="fig"><circle class="shape" cx="110" cy="90" r="70"/><rect class="shape2" x="60.5" y="40.5" width="99" height="99"/><line class="dash" x1="60.5" y1="139.5" x2="159.5" y2="40.5"/><text x="166" y="96" class="v">6</text></svg>',
  sector: '<svg viewBox="0 0 220 180" class="fig"><circle class="shape" cx="110" cy="90" r="70"/><path class="fillshape" d="M110 90 L180 90 A70 70 0 0 0 145 29.4 Z"/><path class="arc" d="M128 90 A18 18 0 0 0 119 74.4"/><text x="132" y="80" class="v">60°</text><text x="134" y="108" class="v"><tspan class="i">r</tspan> = 9</text></svg>',
  trap: '<svg viewBox="0 0 260 150" class="fig"><polygon class="shape" points="70,25 190,25 235,125 25,125"/><line class="dash" x1="70" y1="25" x2="70" y2="125"/><path class="mark" d="M70 113h12v12"/><text x="122" y="18" class="v">8</text><text x="120" y="143" class="v">14</text><text x="54" y="80" class="v">5</text></svg>',
  box: '<svg viewBox="0 0 240 170" class="fig"><polygon class="shape2" points="40,60 160,60 200,30 80,30"/><polygon class="shape2" points="160,60 200,30 200,110 160,140"/><polygon class="shape" points="40,60 160,60 160,140 40,140"/><line class="ln2" x1="40" y1="140" x2="200" y2="30"/><text x="94" y="158" class="v">4</text><text x="184" y="136" class="v">3</text><text x="206" y="74" class="v">12</text></svg>',
};
QL.push(
{
  id: "angles", unit: "Geometry", title: "Lines and angles", mins: 8,
  idea: T`Angles on a straight line add to ⟦180^\circ⟧; parallel lines make only two angle sizes.`,
  learn: [
    { h: "Basic facts", html: T`A straight line is ⟦180^\circ⟧, a full turn ⟦360^\circ⟧. Vertical (opposite) angles are equal.` },
    { h: "Parallel lines", html: T`A line crossing two parallel lines makes only two angle sizes, and they add to ⟦180^\circ⟧.` },
    { h: "GRE figures", html: T`Figures are <b>not drawn to scale</b>. Trust the numbers and marks, not the picture.` },
  ],
  rules: [T`\text{straight line} = 180^\circ`, T`\text{vertical angles are equal}`, T`\text{big} + \text{small} = 180^\circ`],
  widget: "transversal",
  examples: [
    { q: T`Lines ℓ and m are parallel. Find y.`, fig: "parallel", steps: [T`The angles are ⟦110^\circ⟧ or ⟦180^\circ - 110^\circ = 70^\circ⟧.`, T`y is a small (acute) angle, so ⟦y = 70⟧.`], a: T`⟦y = 70⟧` },
  ],
  tips: [T`Write every angle you know on the figure.`],
  traps: [T`Don't assume parallel lines or right angles unless they are stated or marked.`],
  practice: [
    { t: "ne", q: T`Two lines cross. One angle is ⟦3x^\circ⟧ and the angle next to it is ⟦(x + 40)^\circ⟧. What is x?`, a: "35", why: T`⟦4x + 40 = 180 \Rightarrow x = 35⟧.` },
    { t: "qc", q: T`Lines ℓ and m are parallel. A transversal makes angles ⟦a^\circ⟧ and ⟦b^\circ⟧ with ℓ, and ⟦a < b⟧.`, A: T`⟦a + b⟧`, B: T`⟦180⟧`, a: 2, why: T`A small and a big angle always add to ⟦180^\circ⟧.` },
    { t: "mc", q: T`Three angles around a point are ⟦x^\circ, 2x^\circ⟧ and ⟦3x^\circ⟧. What is x?`, o: ["30", "45", "60", "72", "90"], a: 2, why: T`⟦6x = 360⟧.` },
  ]
},
{
  id: "triangles", unit: "Geometry", title: "Triangles", mins: 14,
  idea: T`Angles add to ⟦180^\circ⟧, ⟦a^2 + b^2 = c^2⟧ in right triangles, and know the special triangles.`,
  learn: [
    { h: "Angles and sides", html: T`Angles add to ⟦180^\circ⟧. The longest side is opposite the largest angle. <b>Triangle inequality:</b> ⟦|a - b| < c < a + b⟧.` },
    { h: "Area", html: T`⟦A = \frac{1}{2}bh⟧. The height is perpendicular to the base and can fall outside the triangle.` },
    { h: "Pythagorean theorem", html: T`⟦a^2 + b^2 = c^2⟧ (c opposite the right angle). Triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25 and multiples like 6-8-10.` },
    { h: "Special right triangles", html: T`<b>45-45-90</b>: ⟦x,\; x,\; x\sqrt{2}⟧. <b>30-60-90</b>: ⟦x,\; x\sqrt{3},\; 2x⟧ (shortest side opposite ⟦30^\circ⟧).` },
    { h: "Equilateral", html: T`All angles ⟦60^\circ⟧ and ⟦A = \frac{\sqrt{3}}{4}s^2⟧.` },
    { h: "Similar triangles", html: T`Same angles → sides in ratio k and areas in ratio ⟦k^2⟧.` },
  ],
  rules: [T`A + B + C = 180^\circ`, T`A = \tfrac{1}{2}bh`, T`a^2 + b^2 = c^2`, T`x,\ x,\ x\sqrt{2}`, T`x,\ x\sqrt{3},\ 2x`, T`|a-b| < c < a+b`, T`\tfrac{\sqrt{3}}{4}s^2`],
  widget: "triangle",
  examples: [
    { q: T`A right triangle has legs 6 and 8. Find the hypotenuse x.`, fig: "tri68", steps: [T`6-8-10 is 3-4-5 doubled.`, T`Check: ⟦6^2 + 8^2 = 100⟧, ⟦\sqrt{100} = 10⟧.`], a: T`⟦x = 10⟧` },
    { q: T`Two sides of a triangle are 4 and 9. What can the third side be?`, steps: [T`More than ⟦9 - 4 = 5⟧.`, T`Less than ⟦9 + 4 = 13⟧.`], a: T`⟦5 < c < 13⟧` },
    { q: T`A 30-60-90 triangle has hypotenuse 10. Find its area.`, steps: [T`⟦2x = 10 \Rightarrow x = 5⟧.`, T`Legs: ⟦5⟧ and ⟦5\sqrt{3}⟧.`, T`⟦A = \frac{1}{2} \cdot 5 \cdot 5\sqrt{3} = \frac{25\sqrt{3}}{2}⟧.`], a: T`⟦\frac{25\sqrt{3}}{2}⟧` },
  ],
  tips: [T`⟦\sqrt{2}⟧ or ⟦\sqrt{3}⟧ in the answers? Look for a special triangle.`, T`Draw a height to make right triangles.`],
  traps: [T`The hypotenuse is always the longest side.`],
  practice: [
    { t: "ne", q: T`A right triangle has hypotenuse 13 and one leg 5. What is its area?`, a: "30", why: T`The other leg is 12; ⟦\frac{1}{2}(5)(12) = 30⟧.` },
    { t: "ma", q: T`Two sides of a triangle are 5 and 8. Which could be the third side? Select all that apply.`, o: ["2", "3", "4", "10", "13"], a: [2, 3], why: T`⟦3 < c < 13⟧.` },
    { t: "qc", q: T`In triangle ABC, ⟦\angle A = 50^\circ⟧ and ⟦\angle B = 70^\circ⟧.`, A: T`⟦BC⟧ (opposite A)`, B: T`⟦AB⟧ (opposite C)`, a: 1, why: T`⟦\angle C = 60^\circ > 50^\circ⟧, so the side opposite C is longer.` },
    { t: "mc", q: T`An isosceles right triangle has hypotenuse 8. What is its area?`, o: ["⟦8⟧", "⟦16⟧", T`⟦16\sqrt{2}⟧`, "⟦32⟧", "⟦64⟧"], a: 1, why: T`Legs ⟦4\sqrt{2}⟧: ⟦\frac{1}{2}(4\sqrt{2})^2 = 16⟧.` },
    { t: "ne", q: T`Two similar triangles have sides in the ratio ⟦2 : 3⟧. The smaller has area 20. What is the area of the larger?`, a: "45", why: T`Areas ⟦4 : 9⟧: ⟦20 \cdot \frac{9}{4} = 45⟧.` },
  ]
},
{
  id: "polygons", unit: "Geometry", title: "Quadrilaterals and polygons", mins: 10,
  idea: T`Interior angles add to ⟦(n - 2) \cdot 180^\circ⟧; know the area formulas.`,
  learn: [
    { h: "Angle sum", html: T`⟦(n - 2) \cdot 180^\circ⟧: quadrilateral ⟦360^\circ⟧, pentagon ⟦540^\circ⟧, hexagon ⟦720^\circ⟧. Exterior angles always add to ⟦360^\circ⟧.` },
    { h: "Areas", html: T`Rectangle ⟦lw⟧, parallelogram ⟦bh⟧, trapezoid ⟦\frac{1}{2}(b_1 + b_2)h⟧, rhombus ⟦\frac{1}{2}d_1 d_2⟧.` },
    { h: "Diagonals", html: T`Square: ⟦s\sqrt{2}⟧. Rectangle: ⟦\sqrt{l^2 + w^2}⟧.` },
    { h: "Best shape", html: T`For a fixed perimeter, the square has the largest area.` },
  ],
  rules: [T`(n-2) \cdot 180^\circ`, T`\tfrac{1}{2}(b_1+b_2)h`, T`A_{\square} = \tfrac{d^2}{2}`],
  widget: "polygon",
  examples: [
    { q: T`Find the area of the trapezoid.`, fig: "trap", steps: [T`Average the parallel sides: ⟦\frac{8 + 14}{2} = 11⟧.`, T`⟦11 \times 5 = 55⟧.`], a: T`55` },
    { q: T`Each interior angle of a regular polygon is ⟦150^\circ⟧. How many sides?`, steps: [T`Exterior angle ⟦= 30^\circ⟧.`, T`⟦\frac{360}{30} = 12⟧.`], a: T`12` },
  ],
  tips: [T`Exterior angles (sum ⟦360^\circ⟧) are often the fastest way.`],
  traps: [T`The height of a parallelogram is not its slanted side.`],
  practice: [
    { t: "ne", q: T`What is the sum of the interior angles of an octagon, in degrees?`, a: "1080", why: T`⟦6 \times 180 = 1080⟧.` },
    { t: "qc", q: T`A rectangle (not a square) and a square both have perimeter 40.`, A: T`Area of the rectangle`, B: T`Area of the square`, a: 1, why: T`The square, ⟦10 \times 10 = 100⟧, has the largest area.` },
    { t: "mc", q: T`A square has diagonal 10. What is its area?`, o: ["⟦25⟧", "⟦50⟧", T`⟦50\sqrt{2}⟧`, "⟦100⟧", T`⟦100\sqrt{2}⟧`], a: 1, why: T`⟦\frac{d^2}{2} = 50⟧.` },
  ]
},
{
  id: "circles", unit: "Geometry", title: "Circles", mins: 12,
  idea: T`Everything comes from the radius; arcs and sectors are fractions of the whole circle.`,
  learn: [
    { h: "Basics", html: T`⟦d = 2r⟧, ⟦C = 2\pi r⟧, ⟦A = \pi r^2⟧.` },
    { h: "Arcs and sectors", html: T`A central angle of ⟦x^\circ⟧ is ⟦\frac{x}{360}⟧ of the circle: arc ⟦= \frac{x}{360} \cdot 2\pi r⟧, sector ⟦= \frac{x}{360} \cdot \pi r^2⟧.` },
    { h: "Inscribed angles", html: T`An inscribed angle is half the central angle on the same arc; in a semicircle it is ⟦90^\circ⟧.` },
    { h: "Tangents", html: T`A tangent is perpendicular to the radius at the touching point.` },
    { h: "Shapes inside circles", html: T`A square in a circle: its diagonal is the diameter.` },
  ],
  rules: [T`C = 2\pi r`, T`A = \pi r^2`, T`\text{arc} = \tfrac{x}{360} \cdot 2\pi r`, T`\text{sector} = \tfrac{x}{360} \cdot \pi r^2`],
  widget: "circle",
  examples: [
    { q: T`Find the arc length and area of the sector.`, fig: "sector", steps: [T`⟦\frac{60}{360} = \frac{1}{6}⟧ of the circle.`, T`Arc ⟦= \frac{1}{6} \cdot 2\pi(9) = 3\pi⟧.`, T`Area ⟦= \frac{1}{6} \cdot \pi(81) = \frac{27\pi}{2}⟧.`], a: T`⟦3\pi⟧ and ⟦\frac{27\pi}{2}⟧` },
    { q: T`A square with side 6 is inscribed in a circle. Find the circle's area.`, fig: "sqcircle", steps: [T`Diameter = diagonal ⟦= 6\sqrt{2}⟧.`, T`⟦r = 3\sqrt{2}⟧, ⟦r^2 = 18⟧.`, T`⟦A = 18\pi⟧.`], a: T`⟦18\pi⟧` },
  ],
  tips: [T`Keep π in your answer: the choices usually do.`],
  traps: [T`Doubling the radius makes the area 4 times bigger.`],
  practice: [
    { t: "ne", q: T`A circle has circumference ⟦10\pi⟧. Its area is ⟦k\pi⟧. What is k?`, a: "25", why: T`⟦r = 5⟧, so ⟦A = 25\pi⟧.` },
    { t: "qc", q: T`Circle P has radius 3. Circle Q has diameter 6.`, A: T`Area of P`, B: T`Area of Q`, a: 2, why: T`Both have radius 3.` },
    { t: "mc", q: T`The radius of a circle increases by 50%. By what percent does the area increase?`, o: ["50%", "100%", "125%", "150%", "225%"], a: 2, why: T`⟦1.5^2 = 2.25⟧: up 125%.` },
    { t: "ne", q: T`A wheel of radius 14 cm turns 50 times. How far does it go, in cm? (Use ⟦\pi \approx \frac{22}{7}⟧.)`, a: "4400", why: T`⟦2\pi(14) = 88⟧ cm per turn; ⟦50 \times 88 = 4400⟧.` },
  ]
},
{
  id: "solids", unit: "Geometry", title: "3-D figures", mins: 8,
  idea: T`Volume = base area × height; surface area = the sum of all the faces.`,
  learn: [
    { h: "Box", html: T`⟦V = lwh⟧, ⟦SA = 2(lw + lh + wh)⟧, longest diagonal ⟦= \sqrt{l^2 + w^2 + h^2}⟧.` },
    { h: "Cube", html: T`⟦V = s^3⟧, ⟦SA = 6s^2⟧, diagonal ⟦= s\sqrt{3}⟧.` },
    { h: "Cylinder", html: T`⟦V = \pi r^2 h⟧, ⟦SA = 2\pi r^2 + 2\pi r h⟧.` },
  ],
  rules: [T`V = lwh`, T`SA = 2(lw+lh+wh)`, T`d = \sqrt{l^2+w^2+h^2}`, T`V = \pi r^2 h`],
  widget: "box",
  examples: [
    { q: T`Find the longest straight line inside the box.`, fig: "box", steps: [T`⟦\sqrt{3^2 + 4^2 + 12^2} = \sqrt{169}⟧.`, T`⟦= 13⟧.`], a: T`13` },
  ],
  tips: [T`How many small cubes fit? Divide each side, then multiply.`],
  traps: [T`Surface area counts every face, top and bottom too.`],
  practice: [
    { t: "ne", q: T`A cube has surface area 54. What is its volume?`, a: "27", why: T`⟦6s^2 = 54 \Rightarrow s = 3⟧, ⟦s^3 = 27⟧.` },
    { t: "mc", q: T`A cylinder has radius 3 and height 10. What is its volume?`, o: [T`⟦30\pi⟧`, T`⟦60\pi⟧`, T`⟦90\pi⟧`, T`⟦180\pi⟧`, T`⟦300\pi⟧`], a: 2, why: T`⟦\pi(9)(10) = 90\pi⟧.` },
    { t: "qc", q: T`Box A is ⟦2 \times 3 \times 6⟧. Box B is a cube with side 3.`, A: T`Volume of A`, B: T`Volume of B`, a: 0, why: T`⟦36 > 27⟧.` },
  ]
}
);
