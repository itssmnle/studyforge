## 1. Surds and Exact Values

### What does this mean?
A **surd** is an irrational number expressed as a square root that cannot be simplified into a whole number or exact fraction (e.g., $\sqrt{2}, \sqrt{3}, \sqrt{5}$). Leaving answers in surd form preserves exact mathematical values without rounding errors.

![Diagram: Square root simplification tree showing sqrt(12) split into sqrt(4) x sqrt(3) simplifying to 2*sqrt(3)](/maths-images/Y9/square-root-simplification-tree.png)

---

### Method
1. To simplify $\sqrt{N}$, find the largest **square number** ($4, 9, 16, 25, 36, \dots$) that divides evenly into $N$.
2. Split $\sqrt{N}$ into $\sqrt{\text{Square Number}} \times \sqrt{\text{Other Number}}$.
3. Take the square root of the square number.

---

### Worked Example

**Question:**
Simplify $\sqrt{48}$.

**Answer:**
* Largest square number factor of $48$ is $16$ ($16 \times 3 = 48$).
* $\sqrt{48} = \sqrt{16 \times 3}$
* $\sqrt{48} = \sqrt{16} \times \sqrt{3} = 4\sqrt{3}$

Answer: **$4\sqrt{3}$**

> [!INFO] **Examiner Tips and Tricks**
> Always look for the **largest** square factor first! If you picked $4$ instead of $16$, you would get $\sqrt{4} \times \sqrt{12} = 2\sqrt{12}$, which requires a second simplification step ($2 \times 2\sqrt{3} = 4\sqrt{3}$).

---

## 2. Error Intervals and Bounds

### What does this mean?
When a number is rounded, its exact value lies within an **error interval** bounded by a **lower bound** and an **upper bound**.
* **Lower Bound (LB):** The smallest possible value before rounding up.
* **Upper Bound (UB):** The smallest value that would round up to the next number.

![Diagram: Number line showing rounded value 5.6 rounded to 1 dp with Lower Bound 5.55 and Upper Bound 5.65 highlighted](/maths-images/Y9/rounding-bounds-number-line.png)

---

### Method
1. Identify the rounding unit (e.g., nearest $10$, nearest integer, $1\text{ decimal place} = 0.1$).
2. Divide the rounding unit by $2$ to get the **bound step**.
3. $\text{Lower Bound} = \text{Rounded Value} - \text{Bound Step}$
4. $\text{Upper Bound} = \text{Rounded Value} + \text{Bound Step}$
5. Express as an inequality: $\text{LB} \le x < \text{UB}$.

---

### Worked Example

**Question:**
A length $L$ is measured as $8.4\text{ cm}$ rounded to $1\text{ decimal place}$. Write down the error interval for $L$.

**Answer:**
* Rounding unit $= 0.1\text{ cm}$
* Bound step $= 0.1 \div 2 = 0.05\text{ cm}$
* $\text{Lower Bound} = 8.4 - 0.05 = 8.35\text{ cm}$
* $\text{Upper Bound} = 8.4 + 0.05 = 8.45\text{ cm}$

Answer: **$8.35 \le L < 8.45$**

---

## 3. Algebraic Fractions

### What does this mean?
Fractions that contain algebraic variables in the numerator, denominator, or both. They follow the same operational rules as numerical fractions.

---

### Method

#### Addition & Subtraction:
1. Find a **common denominator** by multiplying the denominators.
2. Cross-multiply numerators proportionally and simplify.

#### Multiplication & Division:
* Multiply numerators together and denominators together.
* For division: **Keep, Change, Flip (KCF)**.

---

### Worked Example

**Question:**
Express $\frac{2}{x + 1} + \frac{3}{x - 2}$ as a single fraction.

**Answer:**
1. Common denominator: $(x + 1)(x - 2)$
2. Combine numerators:
   $$\frac{2(x - 2) + 3(x + 1)}{(x + 1)(x - 2)}$$
3. Expand numerator: $2x - 4 + 3x + 3 = 5x - 1$

Answer: **$\frac{5x - 1}{(x + 1)(x - 2)}$**
