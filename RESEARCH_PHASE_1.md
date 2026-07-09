# Phase 0 — Research Report: Virtual Electricity Lab
## RESEARCH_PHASE_1.md

**Project:** Virtual Physics Laboratory — Electricity Module  
**Phase:** 0 — Research & Mathematical Foundation  
**Date:** 2026-07-05  
**Status:** Academic Foundation (No implementation code)  

---

## Table of Contents

1. [Part A: Modified Nodal Analysis (MNA) — The DC Solver Matrix](#part-a-modified-nodal-analysis-mna--the-dc-solver-matrix)
   - 1.1 Theoretical Foundation
   - 1.2 Matrix Form: $A \cdot x = z$
   - 1.3 Element Stamping (المعادلات والمصفوفة)
     - 1.3.1 Resistor
     - 1.3.2 DC Voltage Source (Battery)
     - 1.3.3 Switch (Closed vs Open)
     - 1.3.4 Potentiometer (3-terminal)
     - 1.3.5 Ammeter & Voltmeter
   - 1.4 Complete Numerical Example
   - 1.5 Gaussian Elimination & LU Decomposition
2. [Part B: Circuit Topology & Graph Theory](#part-b-circuit-topology--graph-theory)
   - 2.1 Graph Representation of Circuits
   - 2.2 Ground Node & Reference Potential
   - 2.3 Floating Node Detection (BFS/DFS)
   - 2.4 Numerical Stability & Division-by-Zero Protection

---

# Part A: Modified Nodal Analysis (MNA) — The DC Solver Matrix

## 1.1 Theoretical Foundation

Modified Nodal Analysis (MNA) هو الإطار الرياضي القياسي لحل الدوائر الكهربائية خطية. يُبنى على قانوني كيرتشوف:

- **KCL (Kirchhoff's Current Law):** $\sum i_{in} = \sum i_{out}$ عند كل عقدة.
- **KVL (Kirchhoff's Voltage Law):** $\sum v_{loop} = 0$ حول كل حلقة مغلقة.

في MNA، نستخدم **potentials (voltages)** كمتغيرات غير معروفة عند العقد، ونضيف **source currents** كمتغيرات إضافية لكل مصدر جهد مستقل.

## 1.2 Matrix Form: $A \cdot x = z$

لنفترض دائرة بـ $N$ عقدة (غير تافهة) و $M$ مصدر جهد مستقل.

$$
A = \begin{bmatrix}
G & B \\
C & D
\end{bmatrix}, \quad
x = \begin{bmatrix}
v_1 \\
v_2 \\
\vdots \\
v_N \\
i_{s_1} \\
i_{s_2} \\
\vdots \\
i_{s_M}
\end{bmatrix}, \quad
z = \begin{bmatrix}
0 \\
\vdots \\
0 \\
V_1 \\
V_2 \\
\vdots \\
V_M
\end{bmatrix}
$$

حيث:
- $G$ — مصفوفة التوصيل $N \times N$ (conductance matrix)
- $B$ — مصفوفة ارتباط المصادر بالعقد $N \times M$
- $C = B^T$ (للدوائر الخطية السلبية)
- $D$ — مصفوفة صفرية $M \times M$ (للمصادر المستقلة)
- $v_k$ — جهد العقدة $k$ بالنسبة للأرضي
- $i_{s_m}$ — تيار مصدر الجهد $m$ (غير معروف إضافي)
- $V_m$ — قيمة جهد المصدر $m$

---

## 1.3 Element Stamping (إسقاط العناصر في المصفوفة)

### 1.3.1 Resistor (المقاومة الثابتة)

قانون أوم: $i = G \cdot (v_i - v_j)$ حيث $G = 1/R$

**Stamp في مصفوفة $G$:**

$$
\begin{array}{c|cc}
 & v_i & v_j \\
\hline
i & +G & -G \\
j & -G & +G \\
\end{array}
$$

**معادلات KCL:**

$$
\text{Node } i: \quad G(v_i - v_j) = 0 \\
\text{Node } j: \quad -G(v_i - v_j) = 0
$$

**مثال رقمي:** $R = 1\,k\Omega = 1000\,\Omega \Rightarrow G = 0.001\,S$

---

### 1.3.2 DC Voltage Source (Battery)

مصدر جهد $V_s$ موصول بين العقدة $p$ (الموجب) والعقدة $n$ (السالب):

$$
v_p - v_n = V_s
$$

**Stamp في المصفوفة الموسعة:**

$$
\begin{array}{c|cc|c}
 & v_p & v_n & i_s \\
\hline
p & 0 & 0 & +1 \\
n & 0 & 0 & -1 \\
\hline
i_s & +1 & -1 & 0 \\
\end{array}
$$

**معادلة الصف الإضافي (KVL):**

$$
(+1) \cdot v_p + (-1) \cdot v_n + (0) \cdot i_s = V_s
$$

**الحق:**
- لا يساهم المصدر في $G$ مباشرة (لأنه يفرض جهدًا، ليس تيارًا).
- يُضاف تيار المصدر $i_s$ كمتغير إضافي لأن التيار عبر المصدر لا يُحدد بواسطة KCL وحده.

---

### 1.3.3 Switch (المفتاح)

المفتاح له حالتان: **مغلق (Closed)** و **مفتوح (Open)**.

#### الحالة أ: مغلق (Closed / ON)

عند إغلاق المفتاح، يصبح مقاومة صغيرة جداً $R_{on} \approx 0.001\,\Omega$.

**يعامل رياضياً كمقاومة:**

$$
G_{on} = \frac{1}{R_{on}} \approx 1000\,S
$$

**Stamp:**

$$
\begin{array}{c|cc}
 & v_i & v_j \\
\hline
i & +G_{on} & -G_{on} \\
j & -G_{on} & +G_{on} \\
\end{array}
$$

#### الحالة ب: مفتوح (Open / OFF)

عند فتح المفتاح، يصبح مقاومة ضخمة $R_{off} \approx 10^{12}\,\Omega$.

$$
G_{off} = \frac{1}{R_{off}} \approx 10^{-12}\,S \approx 0
$$

**Stamp:**

$$
\begin{array}{c|cc}
 & v_i & v_j \\
\hline
i & +G_{off} & -G_{off} \\
j & -G_{off} & +G_{off} \\
\end{array}
$$

**ملاحظة هندسية:**
- $R_{off}$ ليست $\infty$ حقيقية لأن المصفوفة ستصبح غير قابلة للعكس (singular).
- نستخدم $R_{off} = 10^{12}\,\Omega$ كقيمة "عملياً مفتوحة" تُبقي المصفوفة invertible.

---

### 1.3.4 Potentiometer (المقاومة المتغيرة — 3 أطراف)

المقاومة المتغيرة لها 3 أطراف: **A** (أحد الطرفين)، **B** (الطرف الآخر)، **C** (المنزلق / Wiper).

- المقاومة الكلية: $R_{total}$
- موقع المنزلق: $w \in [0, 1]$ (0 = عند A، 1 = عند B)

**توزيع المقاومة:**

$$
R_{AC} = w \cdot R_{total} \\
R_{CB} = (1 - w) \cdot R_{total}
$$

**التوصيل الداخلي:**
- A ---[R_AC]--- C ---[R_CB]--- B

**Stamp (مقاومتان متسلسلتان):**

لنفترض $G_{AC} = 1/R_{AC}$ و $G_{CB} = 1/R_{CB}$:

**مقاومة AC:**
$$
\begin{array}{c|cc}
 & v_A & v_C \\
\hline
A & +G_{AC} & -G_{AC} \\
C & -G_{AC} & +G_{AC} \\
\end{array}
$$

**مقاومة CB:**
$$
\begin{array}{c|cc}
 & v_C & v_B \\
\hline
C & +G_{CB} & -G_{CB} \\
B & -G_{CB} & +G_{CB} \\
\end{array}
$$

**المصفوفة المجمعة للـ Potentiometer:**

$$
\begin{array}{c|ccc}
 & v_A & v_C & v_B \\
\hline
A & +G_{AC} & -G_{AC} & 0 \\
C & -G_{AC} & G_{AC}+G_{CB} & -G_{CB} \\
B & 0 & -G_{CB} & +G_{CB} \\
\end{array}
$$

**مثال رقمي:**

$R_{total} = 10\,k\Omega = 10000\,\Omega$، $w = 0.3$

$$
R_{AC} = 0.3 \times 10000 = 3000\,\Omega \Rightarrow G_{AC} = 0.000333\,S \\
R_{CB} = 0.7 \times 10000 = 7000\,\Omega \Rightarrow G_{CB} = 0.000143\,S
$$

---

### 1.3.5 Ammeter & Voltmeter

#### Ammeter (أمبيرميتر)

جهاز قياس التيار يُوصل على التوالي. مقاومته الداخلية صغيرة جداً $R_A \approx 0.001\,\Omega$.

**يعامل كمقاومة صغيرة:**

$$
G_A = \frac{1}{R_A} = 1000\,S
$$

**Stamp:** مقاومة عادية بين طرفي Ammeter.

#### Voltmeter (فولتميتر)

جهاز قياس الجهد يُوصل على التوازي. مقاومته الداخلية ضخمة $R_V \approx 10^7\,\Omega$.

**يعامل كمقاومة ضخمة:**

$$
G_V = \frac{1}{R_V} = 10^{-7}\,S
$$

**Stamp:** مقاومة عادية بين طرفي Voltmeter.

**الفلسفة الهندسية:**
- Ammeter يُقلل من تأثيره على الدائرة (مقاومة صغيرة → سقوط جهد ضئيل).
- Voltmeter يُقلل من سحب التيار (مقاومة ضخمة → تيار شبه معدوم).

---

## 1.4 Complete Numerical Example

### الدائرة:

```
Node 0 (Ground)
     |
    [+] V_s = 12V
     |
     |--------- Node 1
     |         |
    [R1]     [R2]
    1kΩ      2kΩ
     |         |
     |         |
     |--------- Node 2
     |         |
    [R3]     (Ground)
    3kΩ
     |
     |
    Node 0 (Ground)
```

**التوصيل:**
- Battery: + عند Node 1، - عند Node 0
- R1 (1kΩ): Node 1 → Node 2
- R2 (2kΩ): Node 1 → Node 2
- R3 (3kΩ): Node 2 → Node 0

### تحليل يدوي:

R1 و R2 على التوازي:

$$
R_{12} = \frac{R1 \cdot R2}{R1 + R2} = \frac{1000 \times 2000}{3000} = 666.67\,\Omega
$$

المقاومة الكلية:

$$
R_{total} = R_{12} + R3 = 666.67 + 3000 = 3666.67\,\Omega
$$

التيار الكلي:

$$
I_{total} = \frac{V_s}{R_{total}} = \frac{12}{3666.67} = 0.003273\,A = 3.273\,mA
$$

جهد Node 2:

$$
v_2 = I_{total} \times R3 = 0.003273 \times 3000 = 9.818\,V
$$

جهد Node 1 = 12V (لأن المصدر يُفرضه).

### بناء المصفوفة MNA:

لدينا $N = 2$ عقدة (غير الأرضي) + $M = 1$ مصدر جهد = 3 متغيرات.

متغيرات: $v_1, v_2, i_s$

**Stamp المقاومات في $G$:**

R1 ($G_1 = 0.001\,S$): Node 1 ↔ Node 2
$$
G_{1,1} += 0.001, \quad G_{1,2} -= 0.001 \\
G_{2,1} -= 0.001, \quad G_{2,2} += 0.001
$$

R2 ($G_2 = 0.0005\,S$): Node 1 ↔ Node 2
$$
G_{1,1} += 0.0005, \quad G_{1,2} -= 0.0005 \\
G_{2,1} -= 0.0005, \quad G_{2,2} += 0.0005
$$

R3 ($G_3 = 0.000333\,S$): Node 2 ↔ Node 0 (Ground = 0V)

(العقدة 0 لا تُضمّن في المصفوفة لأنها مرجعية)

$$
G_{2,2} += 0.000333
$$

**Stamp المصدر:**

Battery: Node 1 (+) → Node 0 (-)

$$
B_{1,1} = +1 \quad (\text{تيار المصدر يدخل Node 1}) \\
C_{1,1} = +1, \quad C_{1,2} = 0 \quad (\text{KVL: } v_1 - 0 = 12)
$$

**المصفوفة النهائية $A$:**

$$
A = \begin{bmatrix}
G_{1,1} & G_{1,2} & B_{1,1} \\
G_{2,1} & G_{2,2} & B_{2,1} \\
C_{1,1} & C_{1,2} & D_{1,1}
\end{bmatrix}
$$

حيث:
- $G_{1,1} = 0.001 + 0.0005 = 0.0015$
- $G_{1,2} = -0.001 - 0.0005 = -0.0015$
- $G_{2,1} = -0.0015$
- $G_{2,2} = 0.001 + 0.0005 + 0.000333 = 0.001833$
- $B_{1,1} = +1$, $B_{2,1} = 0$ (المنفذ السالب للبطارية عند Ground)
- $C_{1,1} = +1$, $C_{1,2} = 0$, $D_{1,1} = 0$

$$
A = \begin{bmatrix}
0.0015 & -0.0015 & +1 \\
-0.0015 & 0.001833 & 0 \\
+1 & 0 & 0
\end{bmatrix}
$$

**متجه $z$:**

$$
z = \begin{bmatrix}
0 \\
0 \\
12
\end{bmatrix}
$$

**الحل:**

حل المصفوفة $A \cdot x = z$ يعطي:

$$
v_1 = 12.0\,V \\
v_2 \approx 9.818\,V \\
i_s \approx 3.273\,mA
$$

**التحقق:**

- $v_1 - v_2 = 12 - 9.818 = 2.182\,V$
- تيار R1 = $2.182 / 1000 = 2.182\,mA$
- تيار R2 = $2.182 / 2000 = 1.091\,mA$
- تيار R3 = $9.818 / 3000 = 3.273\,mA$
- KCL عند Node 2: $2.182 + 1.091 = 3.273$ ✅

---

## 1.5 Gaussian Elimination & LU Decomposition

### Gaussian Elimination (الحذف الغاوسي)

الهدف: تحويل $A$ إلى Upper Triangular Matrix، ثم Back Substitution.

**الخطوات:**

1. **Forward Elimination:**
   لكل صف $k$ من $1$ إلى $n-1$:
   - إذا $A_{k,k} = 0$ → pivoting (تبديل الصفوف)
   - لكل صف $i$ من $k+1$ إلى $n$:
     - $factor = A_{i,k} / A_{k,k}$
     - $A_{i,j} -= factor \times A_{k,j}$ لكل $j$ من $k$ إلى $n$
     - $z_i -= factor \times z_k$

2. **Back Substitution:**
   - $x_n = z_n / A_{n,n}$
   - لكل $i$ من $n-1$ إلى $1$:
     - $x_i = (z_i - \sum_{j=i+1}^{n} A_{i,j} \cdot x_j) / A_{i,i}$

### LU Decomposition

تقسيم $A = L \cdot U$ حيث:
- $L$ — Lower triangular (diagonal = 1)
- $U$ — Upper triangular

**الحل:**

1. Forward substitution: $L \cdot y = z$ → حل $y$
2. Back substitution: $U \cdot x = y$ → حل $x$

**الميزة:**
- يُحسب LU مرة واحدة، ثم يُحل لأي $z$ بسرعة.
- مفيد عند محاكاة Transient (تغيّر $z$ مع الزمن لكن $A$ ثابت تقريباً).

### Partial Pivoting

عند $A_{k,k} \approx 0$ أو صغير جداً:

$$
\text{Find row } p \text{ such that } |A_{p,k}| = \max_{i \geq k} |A_{i,k}| \\
\text{Swap rows } k \text{ and } p
$$

يحمي من:
- **Division by Zero:** عندما يكون العنصر المحوري صفراً.
- **Numerical Instability:** عندما يكون العنصر المحوري صغيراً جداً مقارنة بعناصر أخرى.

---

# Part B: Circuit Topology & Graph Theory

## 2.1 Graph Representation of Circuits

يمثل أي دائرة كهربائية **رسم بياني موجه (Directed Graph)**:

$$
G = (V, E)
$$

حيث:
- $V = \{v_1, v_2, ..., v_n\}$ — مجموعة العقد (Nodes / Vertices)
- $E = \{e_1, e_2, ..., e_m\}$ — مجموعة الفروع (Edges / Branches)

**خواص الرسم:**
- كل **Wire** أو **Component** هو فرع.
- كل **Node** (مجموعة pins متصلة) هو عقدة.
- الرسم موجه: كل فرع له اتجاه $i \to j$ (من الكهرباء السالبة إلى الموجبة).

**تمثيل Adjacency List:**

```
Node 1: [Edge_1 (to Node 2), Edge_2 (to Node 3)]
Node 2: [Edge_1 (from Node 1), Edge_3 (to Node 4)]
...
```

**تمثيل Adjacency Matrix:**

$$
M_{ij} = \begin{cases}
G_{ij} & \text{if there is a branch from node } i \text{ to } j \\
0 & \text{otherwise}
\end{cases}
$$

حيث $G_{ij}$ هو التوصيل (Conductance) للفرع.

## 2.2 Ground Node & Reference Potential

### المشكلة الرياضية

في MNA، إذا لم نُثبت جهد أي عقدة:

$$
\sum_{k=1}^{N} G_{k,j} = 0 \quad \text{for every column } j
$$

هذا يعني أن **صفوف مصفوفة $G$ خطياً تابعة** (linearly dependent)، والمصفوفة **singular** (غير قابلة للعكس).

**السبب:** إضافة ثابت إلى جميع الجهود $v_i \to v_i + c$ لا يغير تيارات الفروع:

$$
i = G(v_i - v_j) = G((v_i + c) - (v_j + c)) = G(v_i - v_j)
$$

### الحل: Fixing the Ground Node

نختار عقدة واحدة كـ **Ground** ونُثبت جهدها عند $0\,V$:

$$
v_{ground} = 0
$$

**آلية التطبيق:**

1. نزيل صف وعمود العقدة الأرضية من مصفوفة $G$.
2. نزيل صف وعمود العقدة الأرضية من مصفوفة $B$ و $C$.
3. نستخدم $v_{ground} = 0$ في معادلات KVL.

**بديل: Modified Approach (إذا أردنا الإبقاء على Ground في المصفوفة):**

$$
A_{ground,ground} = 1, \quad A_{ground,j} = 0 \text{ for } j \neq ground, \quad z_{ground} = 0
$$

هذا يُجبر المصفوفة على invertibility.

## 2.3 Floating Node Detection (BFS / DFS)

### ما هو Floating Node؟

عقدة **لا تمتلك أي مسار** إلى العقدة الأرضية أو إلى أي مصدر جهد.

**الأمثلة:**
- مكثف عائم غير موصول لأي مصدر.
- مقاومة معزولة تماماً.
- دائرة مفتوحة (Switch مفتوح) تُفصل عقدة عن Ground.

**المشكلة:**

إذا كانت العقدة $k$ floating، فإن صفها وعمودها في $G$ جميعها أصفار:

$$
G_{k,j} = 0 \quad \forall j
$$

هذا يجعل $G$ singular → **الحل يفشل**.

### خوارزمية BFS للكشف عن Floating Nodes

**المدخلات:**
- $V$ — مجموعة العقد
- $E$ — مجموعة الأضلاع (wires/components)
- $G$ — مجموعة العقد المُوصلة إلى Ground أو Sources

**الخطوات:**

1. **Build Adjacency List:**
   لكل عقدة $v \in V$:
   - $adj[v] = \{u \mid \exists \text{ branch between } v \text{ and } u\}$

2. **BFS from Ground + Sources:**
   - $visited = \emptyset$
   - $queue = [\text{all ground nodes and nodes connected to voltage sources}]$
   - while $queue$ not empty:
     - $v = queue.dequeue()$
     - if $v \notin visited$:
       - $visited.add(v)$
       - for $u \in adj[v]$:
         - $queue.enqueue(u)$

3. **Identify Floating Nodes:**
   
   $$
   \text{Floating} = V \setminus visited
   $$

### خوارزمية DFS البديلة

**DFS-Visit($v$):**
- $visited.add(v)$
- for $u \in adj[v]$:
  - if $u \notin visited$:
    - DFS-Visit($u$)

**المقارنة:**

| الخاصية | BFS | DFS |
|---------|-----|-----|
| Memory | Queue (أكبر قليلاً) | Stack (أقل) |
| Path Discovery | أقصر مسار | أي مسار |
| تنفيذ | Iterative (مفضل) | Recursive (أبسط كتابةً) |
| وقت | $O(V + E)$ | $O(V + E)$ |

### معالجة Floating Nodes

**الاستراتيجيات:**

1. **Ground Injection (المفضلة):**
   - إضافة موصل ضئيل (Leak) من العقدة العائمة إلى Ground.
   - $G_{leak} = 10^{-12}\,S$ (مقاومة $10^{12}\,\Omega$).
   - لا يؤثر على النتائج الفيزيائية لكنه يُحافظ على invertibility.

   $$
   G_{k,k} += G_{leak}
   $$

2. **Remove from Matrix:**
   - حذف صف وعمود العقدة العائمة.
   - المشكلة: إذا أصبحت العقدة متصلة لاحقاً (مثلاً بإغلاق Switch)، نحتاج إعادة بناء المصفوفة.

3. **Error / Warning:**
   - إبلاغ المستخدم أن العقدة عائمة.
   - عدم حل المصفوفة حتى يُصلح المستخدم الدائرة.

## 2.4 Numerical Stability & Division-by-Zero Protection

### نقاط الضعف العددية في MNA

| المشكلة | السبب | الحل |
|---------|-------|------|
| ** singular matrix ** | Floating nodes, دائرة مفتوحة | BFS + $G_{leak}$ |
| ** Zero pivot ** | Battery + Short circuit مباشر | Partial Pivoting |
| ** ill-conditioned ** | أرقام متفاوتة جداً (مقاومات صغيرة وكبيرة) | Scaling, Double Precision |
| ** Division by Zero ** | $R = 0$ (قصر مثالي) | $R_{min} = 10^{-6}\,\Omega$ |

### حماية Division-by-Zero

**عند حساب التوصيل:**

```
if |R| < R_min:
    G = 1 / R_min
else:
    G = 1 / R
```

حيث $R_{min} = 10^{-6}\,\Omega$.

**عند Gaussian Elimination:**

```
if |A[k,k]| < epsilon:
    # Partial pivoting: find max |A[i,k]| for i >= k
    # Swap rows if found
    if no suitable pivot:
        # Matrix is singular — inject leak or abort
```

حيث $\epsilon = 10^{-12}$ (لـ double precision).

### Scaling Strategy

عندما تختلف عناصر المصفوفة بأمرين كبيرين أو أكثر (مثلاً $G = 10^{-12}$ و $B = 1$):

**Scaling:**
- قسمة كل صف على أكبر عنصر مطلق فيه.
- هذا يُحسن condition number ويُقلل من الأخطاء التراكمية.

---

## Summary of Key Design Decisions for Phase 1

| Decision | Rationale |
|----------|-----------|
| MNA as solver framework | Standard, well-understood, handles voltage sources naturally |
| Gaussian Elimination + Partial Pivoting | Simple, adequate for small-to-medium circuits (< 500 nodes) |
| $R_{on} = 0.001\,\Omega$, $R_{off} = 10^{12}\,\Omega$ | Practical approximation for switch states |
| $G_{leak} = 10^{-12}\,S$ | Prevents singular matrix without affecting physics |
| BFS for floating node detection | $O(V+E)$, finds all reachable nodes efficiently |
| Ground removal from matrix | Reduces matrix size by 1, simplifies equations |

---

## References

1. Ho, C.-W., Ruehli, A. E., & Brennan, P. A. (1975). "The Modified Nodal Approach to Network Analysis." *IEEE Transactions on Circuits and Systems*.
2. Pillage, L. T., Rohrer, R. A., & Visweswariah, C. (1995). *Electronic Circuit and System Simulation Methods*. McGraw-Hill.
3. Strang, G. (2016). *Introduction to Linear Algebra* (5th ed.). Wellesley-Cambridge Press.
4. Sedra, A. S., & Smith, K. C. (2014). *Microelectronic Circuits* (7th ed.). Oxford University Press.

---

**End of Research Phase 1**  
*Ready for review and approval before proceeding to implementation.*
