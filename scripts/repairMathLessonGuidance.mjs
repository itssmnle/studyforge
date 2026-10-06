import fs from 'node:fs/promises';

const guidance = {
  'year-7': {
    13: `## Notes
- The $n$th square number is $n^2$: arrange $n$ rows of $n$ dots.
- The $n$th triangular number is $1+2+\\cdots+n=n(n+1)/2$: arrange rows of 1 through $n$ dots.
- Square numbers grow by successive odd differences; triangular numbers grow by 1,2,3, and so on.

## Method
1. Identify the position $n$ in the pattern.
2. Square $n$ for a square number, or add the first $n$ integers for a triangular number.
3. Check with a diagram or difference pattern.`,
    34: `## Notes
- A one-step or two-step function gives an output for each input.
- Plot input on the horizontal axis and output on the vertical axis.
- A rule of the form $y=mx+c$ gives a straight-line graph; $m$ is its gradient and $c$ its y-intercept.

## Method
1. Choose at least three input values, including zero if convenient.
2. Substitute each input into the function rule and record the output.
3. Plot the ordered pairs $(x,y)$ accurately.
4. Draw a straight line only if the plotted points follow a linear rule.`,
    41: `## Notes
- Factorising reverses expansion: find a factor shared by every term and place it outside a bracket.
- The number or expression left inside each term is found by dividing by the common factor.

## Method
1. Find the highest common factor of all terms, including any shared variable.
2. Divide each term by that factor and write the quotients inside a bracket.
3. Re-expand the bracket to check the result.`,
    59: `## Notes
- A mixed number combines a whole number and a proper fraction.
- To add or subtract mixed numbers, use a common denominator for the fractional parts.
- Regroup one whole as a fraction when subtraction needs more fractional parts.

## Method
1. Convert fractional parts to a common denominator.
2. Combine whole parts and fractional parts, including their signs.
3. Regroup an improper fractional part, or borrow one whole when needed.
4. Simplify and check against an estimate.`,
    70: `## Notes
- Mean uses every value but can be pulled by an outlier.
- Median is the middle ordered value and is often more representative when data are skewed.
- Mode is the most frequent value and is useful for categories or repeated values.

## Method
1. Calculate or identify each candidate average.
2. Check for outliers, skew, and whether values are numerical or categorical.
3. Explain which average best answers the question, using the data as evidence.`,
    87: `## Notes
- When two straight lines cross, the opposite angles at the intersection are equal.
- Each neighbouring pair lies on a straight line and sums to 180°.
- Equal opposite angles follow by subtracting the same adjacent angle from 180°.

## Method
1. Mark the opposite angle pair on the crossing lines.
2. Copy the known angle to its vertically opposite angle.
3. Use the 180° straight-line rule for either neighbouring angle.
4. Check all four angles total 360°.`,
    114: `## Notes
- A prime number has exactly two positive factors: 1 and itself; 2 is the only even prime.
- The $n$th square number is $n^2$ and the $n$th triangular number is $n(n+1)/2$.
- These are different classifications: 3 is prime and triangular; 4 is square but not prime.

## Method
1. Test possible factors up to the square root when checking primality.
2. Use a square array or $n^2$ for square numbers.
3. Use growing rows or $n(n+1)/2$ for triangular numbers.
4. State which classifications a number satisfies.`,
  },
  'year-9': {
    7: `## Notes
- A surd is an exact root that cannot be written as an integer or rational fraction.
- $\\sqrt{ab}=\\sqrt a\\sqrt b$ for non-negative $a,b$; extract the largest square factor.
- Like surds can be combined: $3\\sqrt2+2\\sqrt2=5\\sqrt2$.
- Rationalising removes a surd from a denominator without changing the value.

## Method
1. Factor the number under the root to expose a perfect-square factor.
2. Take that square root outside and leave the non-square factor inside.
3. Combine only like surd terms.
4. To rationalise a single-root denominator, multiply top and bottom by that root.`,
    8: `## Notes
- A rounded value stands for a half-open interval of possible original values.
- For rounding to the nearest unit $u$, subtract and add $u/2$.
- Include the lower bound; exclude the upper bound because it rounds to the next value.

## Method
1. Identify the place value used in the rounding.
2. Find half that unit and subtract/add it around the displayed value.
3. Write $\\text{lower}\\le x<\\text{upper}$ with units.
4. Check both endpoints against the rounding rule.`,
    9: `## Notes
- Bounds preserve uncertainty in measurements that have been rounded.
- For positive lengths, the minimum product uses both lower bounds and the maximum uses both upper bounds.
- Division needs care: for positive values, smallest quotient uses smallest numerator and largest denominator.

## Method
1. Write an interval for every rounded input.
2. Select endpoint combinations that minimise or maximise the requested expression.
3. Calculate each bound and keep inclusive/exclusive endpoints consistent.
4. Include the required squared or cubic units.`,
    11: `## Notes
- To factorise $x^2+bx+c$, find two numbers whose product is $c$ and sum is $b$.
- Write one number in each bracket: $(x+p)(x+q)$.
- Re-expanding checks both the middle and constant terms.

## Method
1. List factor pairs of the constant term with the needed signs.
2. Choose the pair whose sum is the coefficient of $x$.
3. Write the two brackets and expand them to verify.`,
    12: `## Notes
- For $ax^2+bx+c$ with $a>1$, split the middle term using two numbers with product $ac$ and sum $b$.
- Group the four terms, factor each group, then take out the common bracket.

## Method
1. Multiply the first and last coefficients to get $ac$.
2. Find a factor pair of $ac$ that adds to $b$.
3. Split $bx$, factor by grouping, and remove the shared bracket.
4. Re-expand to check all coefficients.`,
    19: `## Notes
- A quadratic equation can be solved by writing its left side as a product of two factors.
- The zero-product rule says a product is zero if at least one factor is zero.
- A quadratic may have two, one repeated, or no real roots.

## Method
1. Move all terms to one side so the other side is zero.
2. Factorise the quadratic expression.
3. Set each factor equal to zero and solve.
4. Substitute every candidate root into the original equation.`,
    26: `## Notes
- In $y=mx+c$, $m$ is the gradient: change in $y$ for one unit of $x$.
- $c$ is the y-intercept because $y=c$ when $x=0$.
- Positive gradients rise left to right; negative gradients fall.

## Method
1. Read the gradient from a rise/run or from two points.
2. Read the y-intercept where the line meets $x=0$.
3. Substitute both into $y=mx+c$.
4. Check a point on the line satisfies the equation.`,
    27: `## Notes
- A line graph provides coordinates that can be used to find its gradient.
- Gradient $m=(y_2-y_1)/(x_2-x_1)$ for two points with different x-coordinates.
- The y-intercept is the value at $x=0$.

## Method
1. Choose two clear grid points on the line.
2. Calculate rise divided by run, with consistent order.
3. Read the y-intercept or solve for it using one point.
4. Write $y=mx+c$ and verify both points.`,
    28: `## Notes
- A known gradient $m$ and point $(x_1,y_1)$ determine one non-vertical line.
- Use $y-y_1=m(x-x_1)$ or substitute the point into $y=mx+c$.

## Method
1. Put the supplied gradient into $y=mx+c$.
2. Substitute the given x- and y-coordinate to solve for $c$.
3. Write the finished equation and check the supplied point.`,
    29: `## Notes
- Two points determine the gradient $m=(y_2-y_1)/(x_2-x_1)$ when $x_1\\ne x_2$.
- The point-gradient form is $y-y_1=m(x-x_1)$.
- If both x-coordinates are equal, the line is vertical: $x=x_1$, not $y=mx+c$.

## Method
1. Subtract the two y-coordinates and x-coordinates in the same order.
2. Divide to obtain the gradient.
3. Substitute one point into the point-gradient form.
4. Simplify if requested and check the second point.`,
    31: `## Notes
- Parallel non-vertical lines have equal gradients.
- Perpendicular non-vertical lines have gradients whose product is -1.
- A point and the new gradient determine the requested line.

## Method
1. Identify the original gradient from its equation or two points.
2. Keep it for a parallel line, or take its negative reciprocal for a perpendicular line.
3. Substitute the given point into $y=mx+c$ or point-gradient form.
4. Check the point and gradient relation.`,
    56: `## Notes
- A fractional enlargement has positive scale factor between 0 and 1, so the image is smaller.
- Every point remains on the ray from the centre through the original point.
- Multiply each centre-to-point vector by the scale factor; angles stay equal.

## Method
1. Mark the centre of enlargement.
2. Find the vector from centre to each vertex.
3. Multiply each vector by the fractional factor and add the centre back.
4. Join image vertices in the original order.`,
    64: `## Notes
- Pythagoras applies only to right triangles: $a^2+b^2=c^2$ with hypotenuse $c$.
- To find a shorter side, subtract the square of the other shorter side from the hypotenuse square.
- The hypotenuse is always the longest side, opposite the right angle.

## Method
1. Mark the right angle and identify the hypotenuse.
2. Write $\\text{missing leg}^2=c^2-\\text{known leg}^2$.
3. Substitute, subtract, and take the positive square root.
4. Check the result is shorter than the hypotenuse.`,
    71: `## Notes
- Surface area is the sum of all exposed face areas and uses square units.
- A cuboid with sides $l,w,h$ has surface area $2(lw+lh+wh)$ because each face size occurs twice.
- A cube of side $s$ has six equal square faces, giving $6s^2$.

## Method
1. Identify each distinct rectangular face size.
2. Multiply side lengths to find each face area.
3. Double their sum for a closed cuboid, or count only exposed faces if open.
4. Give the result in square units.`,
    72: `## Notes
- Volume measures occupied 3D space and uses cubic units.
- A cuboid's volume is length × width × height; a cube of side $s$ has volume $s^3$.

## Method
1. Put all three dimensions in the same unit.
2. Multiply length, width and height.
3. Check the answer's unit is cubic and its size is sensible.`,
  },
};

const root = new URL('../content/math-lessons/', import.meta.url);
let updated = 0;
for (const [year, entries] of Object.entries(guidance)) {
  const dir = new URL(`${year}/`, root);
  const names = await fs.readdir(dir);
  for (const [number, replacement] of Object.entries(entries)) {
    const name = names.find(item => item.startsWith(`${String(number).padStart(3, '0')}-`) && item.endsWith('.md'));
    if (!name) throw new Error(`Missing ${year} lesson ${number}`);
    const file = new URL(name, dir);
    const source = await fs.readFile(file, 'utf8');
    const pattern = /## Notes\n[\s\S]*?(?=\n## (?:Worked example|Example))/;
    if (!pattern.test(source)) throw new Error(`Could not find guidance in ${year}/${name}`);
    const result = source.replace(pattern, `${replacement.trimEnd()}\n`);
    if (result === source) continue;
    await fs.writeFile(file, result);
    updated += 1;
  }
}
console.log(`Replaced off-objective guidance in ${updated} maths lessons.`);
