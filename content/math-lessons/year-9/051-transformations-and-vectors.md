## 1. Transformations: Rotation and Enlargement

### What does this mean?
* **Rotation:** Turning a shape around a **centre of rotation** $(x,y)$ by a given angle ($90^\circ, 180^\circ, 270^\circ$) clockwise or anti-clockwise.
* **Enlargement:** Scaling a shape larger or smaller from a **centre of enlargement** using a **scale factor** $k$ (including negative and fractional scale factors).

![Diagram: Grid showing enlargement of a triangle from center (0,0) with scale factor -2 flipping the shape into the opposite quadrant](/maths-images/Y9/negative-enlargement-scale-factor.png)

---

### Method (Negative Enlargement):
1. Draw rays from shape vertices through the centre of enlargement.
2. Count grid distances from centre to shape vertices.
3. Multiply distance by scale factor $k$ and measure in the **opposite direction** through the centre.

---

### Worked Example

**Question:**
Enlarge point $P(2, 3)$ from centre $(0, 0)$ with scale factor $-2$.

**Answer:**
* Distance from $(0,0)$ to $P$ is $+2$ right, $+3$ up.
* Multiply by $-2$: move $-4$ (left), $-6$ (down).

Answer: **$(-4, -6)$**

---

## 2. Column Vectors and Vector Arithmetic

### What does this mean?
A **column vector** describes movement in 2D space:

$$\mathbf{v} = \begin{pmatrix} x \\ y \end{pmatrix}$$

* $x$: Top number = Horizontal movement ($+$ right, $-$ left)
* $y$: Bottom number = Vertical movement ($+$ up, $-$ down)

---

### Method
* **Addition/Subtraction:** Add or subtract corresponding top and bottom numbers:

$$\begin{pmatrix} a \\ b \end{pmatrix} + \begin{pmatrix} c \\ d \end{pmatrix} = \begin{pmatrix} a+c \\ b+d \end{pmatrix}$$

* **Scalar Multiplication:** Multiply both $x$ and $y$ by scalar $k$:

$$k \begin{pmatrix} a \\ b \end{pmatrix} = \begin{pmatrix} ka \\ kb \end{pmatrix}$$

---

### Worked Example

**Question:**
If $\mathbf{a} = \begin{pmatrix} 3 \\ -2 \end{pmatrix}$ and $\mathbf{b} = \begin{pmatrix} -1 \\ 4 \end{pmatrix}$, calculate $2\mathbf{a} - \mathbf{b}$.

**Answer:**
$$2\begin{pmatrix} 3 \\ -2 \end{pmatrix} - \begin{pmatrix} -1 \\ 4 \end{pmatrix} = \begin{pmatrix} 6 \\ -4 \end{pmatrix} - \begin{pmatrix} -1 \\ 4 \end{pmatrix} = \begin{pmatrix} 6 - (-1) \\ -4 - 4 \end{pmatrix} = \begin{pmatrix} 7 \\ -8 \end{pmatrix}$$

Answer: **$\begin{pmatrix} 7 \\ -8 \end{pmatrix}$**
