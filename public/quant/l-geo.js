/* GRE Quant lessons: Geometry. Figures are small inline SVGs (not drawn to scale, like the GRE). */
window.QL = window.QL || [];
const FIG = {
  tri345: '<svg viewBox="0 0 220 140" class="fig"><polygon points="20,120 180,120 20,20" /><text x="96" y="136">8</text><text x="4" y="74">6</text><text x="106" y="64">x</text><path d="M20 108h12v12" class="thin"/></svg>',
  parallel: '<svg viewBox="0 0 240 150" class="fig"><line x1="10" y1="45" x2="230" y2="45"/><line x1="10" y1="110" x2="230" y2="110"/><line x1="70" y1="140" x2="170" y2="10"/><text x="132" y="38">110°</text><text x="86" y="104">y°</text><text x="214" y="40">ℓ</text><text x="214" y="105">m</text></svg>',
  circleIn: '<svg viewBox="0 0 200 160" class="fig"><circle cx="100" cy="80" r="60"/><rect x="58" y="38" width="84" height="84" class="thin"/><text x="146" y="84">side 6</text></svg>',
  sector: '<svg viewBox="0 0 200 160" class="fig"><circle cx="100" cy="80" r="60"/><path d="M100 80 L160 80 A60 60 0 0 0 130 28 Z" class="fill"/><text x="118" y="74">60°</text><text x="124" y="100">r = 9</text></svg>',
  trap: '<svg viewBox="0 0 240 130" class="fig"><polygon points="60,20 180,20 220,110 20,110"/><line x1="60" y1="20" x2="60" y2="110" class="thin"/><text x="110" y="14">8</text><text x="110" y="126">14</text><text x="44" y="70">5</text></svg>',
  box: '<svg viewBox="0 0 220 150" class="fig"><polygon points="30,50 150,50 150,130 30,130"/><polygon points="30,50 70,20 190,20 150,50" class="thin"/><polygon points="150,50 190,20 190,100 150,130" class="thin"/><text x="84" y="145">4</text><text x="160" y="125">3</text><text x="196" y="64">12</text></svg>',
};
QL.push(
{
  id: "angles", unit: "Geometry", title: "Lines and angles", mins: 8,
  idea: "Angles on a straight line add to 180°; parallel lines make only two different angle sizes.",
  learn: [
    { h: "Basic facts", html: "A straight line is 180°. Around a point is 360°. Vertical angles (opposite angles where two lines cross) are equal." },
    { h: "Parallel lines and a transversal", html: "When a line crosses two parallel lines, every angle is one of two sizes, and the two sizes add to 180°. Big angles are equal to each other; small angles are equal to each other." },
    { h: "GRE figures", html: "Figures are <b>not drawn to scale</b> unless the question says so. Trust the numbers and the marks, not how it looks." },
  ],
  rules: ["Straight line = 180°", "Vertical angles are equal", "Parallel lines: big = big, small = small, big + small = 180°"],
  widget: "transversal",
  examples: [
    { q: "Lines ℓ and m are parallel. A transversal makes a 110° angle with ℓ. What are the other angles?", fig: "parallel", steps: ["The angles are either 110° or 180° − 110° = 70°.", "The angle y° in the figure is a small (acute) angle.", "So y = 70."], a: "y = 70" },
  ],
  tips: ["Mark every angle you know on the figure. Usually the answer appears."],
  traps: ["Don't assume lines are parallel or angles are right unless it's stated or marked."],
  practice: [
    { t: "ne", q: "Two lines cross. One of the angles is 3x° and the angle next to it is (x + 40)°. What is x?", a: "35", why: "Angles next to each other on a line add to 180: 4x + 40 = 180 → x = 35." },
    { t: "qc", q: "Lines ℓ and m are parallel. A transversal crosses them, making angles a° and b° with ℓ, and a < b.", A: "a + b", B: "180", a: 2, why: "One small and one big angle always add to 180°." },
    { t: "mc", q: "Three angles around a point measure x°, 2x° and 3x°. What is x?", o: ["30", "45", "60", "72", "90"], a: 2, why: "6x = 360 → x = 60." },
  ]
},
{
  id: "triangles", unit: "Geometry", title: "Triangles", mins: 14,
  idea: "Angles add to 180°, a² + b² = c² in right triangles, and know the special triangles.",
  learn: [
    { h: "Angles and sides", html: "Angles add to 180°. The biggest side is opposite the biggest angle. <b>Triangle inequality:</b> each side is less than the sum and more than the difference of the other two." },
    { h: "Area", html: "Area = ½ × base × height. The height is perpendicular to the base; it can fall outside the triangle." },
    { h: "Pythagorean theorem", html: "In a right triangle a² + b² = c² (c is the side opposite the right angle). Common triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25 and their multiples (6-8-10)." },
    { h: "Special right triangles", html: "<b>45-45-90</b>: sides x, x, x√2. <b>30-60-90</b>: sides x, x√3, 2x (short side opposite 30°)." },
    { h: "Isosceles and equilateral", html: "Isosceles: two equal sides and the two angles opposite them are equal. Equilateral: all 60°, area = (√3/4)s²." },
    { h: "Similar triangles", html: "Same angles → sides in the same ratio k, areas in the ratio k²." },
  ],
  rules: ["A + B + C = 180°", "Area = ½bh", "a² + b² = c²", "45-45-90: x, x, x√2", "30-60-90: x, x√3, 2x", "|a − b| < c < a + b", "Equilateral area = (√3/4)s²"],
  widget: "triangle",
  examples: [
    { q: "A right triangle has legs 6 and 8. What is the hypotenuse?", fig: "tri345", steps: ["6-8-10 is the 3-4-5 triangle doubled.", "Or: 36 + 64 = 100, √100 = 10."], a: "10" },
    { q: "Two sides of a triangle are 4 and 9. What values can the third side take?", steps: ["It must be more than 9 − 4 = 5.", "It must be less than 9 + 4 = 13.", "So 5 < third side < 13."], a: "Between 5 and 13" },
    { q: "The hypotenuse of a 30-60-90 triangle is 10. What is its area?", steps: ["Sides are x, x√3, 2x and 2x = 10, so x = 5.", "Legs: 5 and 5√3.", "Area = ½ × 5 × 5√3 = 12.5√3 ≈ 21.65."], a: "12.5√3" },
  ],
  tips: ["See √2 or √3 in the answers? Look for a special triangle.", "Draw the height to make right triangles."],
  traps: ["The longest side of a right triangle is always the hypotenuse.", "A figure that looks equilateral might not be."],
  practice: [
    { t: "ne", q: "A right triangle has a hypotenuse of 13 and one leg of 5. What is its area?", a: "30", why: "Other leg = 12 (5-12-13). Area = ½ × 5 × 12 = 30." },
    { t: "ma", q: "Two sides of a triangle are 5 and 8. Which could be the third side? Select all that apply.", o: ["2", "3", "4", "10", "13"], a: [2, 3], why: "3 < third < 13: only 4 and 10 work (3 and 13 are not allowed)." },
    { t: "qc", q: "In triangle ABC, angle A = 50° and angle B = 70°.", A: "Side BC (opposite A)", B: "Side AB (opposite C)", a: 1, why: "C = 60°. The side opposite the bigger angle is bigger: 60° > 50°, so AB > BC." },
    { t: "mc", q: "An isosceles right triangle has a hypotenuse of 8. What is its area?", o: ["8", "16", "16√2", "32", "64"], a: 1, why: "Legs = 8/√2 = 4√2. Area = ½ × (4√2)² = ½ × 32 = 16." },
    { t: "ne", q: "Two similar triangles have sides in the ratio 2 : 3. The smaller has area 20. What is the area of the larger?", a: "45", why: "Area ratio = 4 : 9. 20 × 9/4 = 45." },
  ]
},
{
  id: "polygons", unit: "Geometry", title: "Quadrilaterals and polygons", mins: 10,
  idea: "Interior angles add to (n − 2) × 180°; know the area formulas.",
  learn: [
    { h: "Angle sum", html: "A polygon with n sides has angles adding to (n − 2) × 180°. Quadrilateral: 360°. Pentagon: 540°. Hexagon: 720°. Regular polygon: each angle = (n − 2) × 180° / n." },
    { h: "Areas", html: "Rectangle: lw. Square: s². Parallelogram: base × height. Trapezoid: ½(b₁ + b₂) × h. Rhombus: ½ d₁d₂." },
    { h: "Diagonals", html: "Square diagonal = s√2. Rectangle diagonal = √(l² + w²)." },
    { h: "Perimeter tricks", html: "For a fixed perimeter, the square has the biggest area. For a fixed area, the square has the smallest perimeter." },
  ],
  rules: ["Angle sum = (n−2)·180°", "Trapezoid = ½(b₁+b₂)h", "Parallelogram = bh", "Square diagonal = s√2"],
  widget: "polygon",
  examples: [
    { q: "A trapezoid has parallel sides 8 and 14 and height 5. What is its area?", fig: "trap", steps: ["Average of the parallel sides: (8 + 14)/2 = 11.", "× height: 11 × 5 = 55."], a: "55" },
    { q: "Each interior angle of a regular polygon is 150°. How many sides does it have?", steps: ["Each exterior angle = 180° − 150° = 30°.", "Exterior angles add to 360°: 360/30 = 12."], a: "12 sides" },
  ],
  tips: ["Exterior angles of any polygon add to 360°: often the fastest way."],
  traps: ["Height of a parallelogram is not the slanted side."],
  practice: [
    { t: "ne", q: "What is the sum of the interior angles of an octagon, in degrees?", a: "1080", why: "(8 − 2) × 180 = 1080." },
    { t: "qc", q: "A rectangle and a square have the same perimeter, 40. The rectangle is not a square.", A: "Area of the rectangle", B: "Area of the square", a: 1, why: "The square (10 × 10 = 100) has the largest area for a given perimeter." },
    { t: "mc", q: "A square has a diagonal of 10. What is its area?", o: ["25", "50", "50√2", "100", "100√2"], a: 1, why: "s = 10/√2, s² = 100/2 = 50. (Or area = d²/2.)" },
  ]
},
{
  id: "circles", unit: "Geometry", title: "Circles", mins: 12,
  idea: "Everything comes from the radius; arcs and sectors are fractions of the whole.",
  learn: [
    { h: "Basics", html: "Diameter d = 2r. Circumference = 2πr = πd. Area = πr²." },
    { h: "Arcs and sectors", html: "A central angle of x° takes x/360 of the circle: arc length = (x/360) × 2πr, sector area = (x/360) × πr²." },
    { h: "Inscribed angles", html: "An inscribed angle is half the central angle on the same arc. An angle inscribed in a semicircle is 90°." },
    { h: "Tangents", html: "A tangent line is perpendicular to the radius at the point where it touches." },
    { h: "Shapes inside circles", html: "A square inscribed in a circle: its diagonal is the diameter. A circle inscribed in a square: its diameter is the side." },
  ],
  rules: ["C = 2πr", "A = πr²", "Arc = (x/360)·2πr", "Sector = (x/360)·πr²", "Inscribed angle = ½ central angle"],
  widget: "circle",
  examples: [
    { q: "A sector has radius 9 and a central angle of 60°. What are its arc length and area?", fig: "sector", steps: ["60/360 = 1/6 of the circle.", "Arc = 1/6 × 2π × 9 = 3π.", "Area = 1/6 × π × 81 = 13.5π."], a: "Arc 3π, area 13.5π" },
    { q: "A square with side 6 is inscribed in a circle. What is the area of the circle?", fig: "circleIn", steps: ["The square's diagonal is the diameter: 6√2.", "Radius = 3√2, r² = 18.", "Area = 18π."], a: "18π" },
  ],
  tips: ["Leave answers in π: the choices usually are.", "If the area doubles, the radius is multiplied by √2."],
  traps: ["Doubling the radius makes the area 4 times bigger, not 2."],
  practice: [
    { t: "ne", q: "A circle has circumference 10π. What is its area? (Answer as a multiple of π: type only the number.)", a: "25", why: "2πr = 10π → r = 5 → area 25π." },
    { t: "qc", q: "Circle P has radius 3. Circle Q has diameter 6.", A: "Area of P", B: "Area of Q", a: 2, why: "Both have radius 3." },
    { t: "mc", q: "The radius of a circle is increased by 50%. By what percent does the area increase?", o: ["50%", "100%", "125%", "150%", "225%"], a: 2, why: "1.5² = 2.25: a 125% increase." },
    { t: "ne", q: "A wheel of radius 14 cm makes 50 full turns. How far does it travel, in cm? (Use π ≈ 22/7.)", a: "4400", why: "One turn = 2π × 14 = 88 cm. 50 × 88 = 4400." },
  ]
},
{
  id: "solids", unit: "Geometry", title: "3-D figures", mins: 8,
  idea: "Volume = base area × height; surface area = add up the faces.",
  learn: [
    { h: "Rectangular box", html: "Volume = lwh. Surface area = 2(lw + lh + wh). Longest diagonal = √(l² + w² + h²)." },
    { h: "Cube", html: "Volume = s³, surface area = 6s², diagonal = s√3." },
    { h: "Cylinder", html: "Volume = πr²h. Surface area = 2πr² + 2πrh (two circles + the side)." },
  ],
  rules: ["Box: V = lwh", "Box SA = 2(lw+lh+wh)", "Diagonal = √(l²+w²+h²)", "Cylinder: V = πr²h", "Cylinder SA = 2πr² + 2πrh"],
  widget: "box",
  examples: [
    { q: "A box is 3 × 4 × 12. What is the longest straight line inside it?", fig: "box", steps: ["√(3² + 4² + 12²) = √(9 + 16 + 144).", "= √169 = 13."], a: "13" },
  ],
  tips: ["How many small cubes fit? Divide each side, then multiply."],
  traps: ["Surface area counts every face, including the top and bottom."],
  practice: [
    { t: "ne", q: "A cube has a surface area of 54. What is its volume?", a: "27", why: "6s² = 54 → s = 3 → s³ = 27." },
    { t: "mc", q: "A cylinder has radius 3 and height 10. What is its volume?", o: ["30π", "60π", "90π", "180π", "300π"], a: 2, why: "π × 9 × 10 = 90π." },
    { t: "qc", q: "Box A is 2 × 3 × 6. Box B is a cube with side 3.", A: "Volume of A", B: "Volume of B", a: 0, why: "A = 2 × 3 × 6 = 36 and B = 3³ = 27. A is greater." },
  ]
}
);
window.FIG = FIG;
