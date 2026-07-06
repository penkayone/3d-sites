<div align="center">

# 👤 Cinematic Portfolio

<img src="../../docs/previews/cinematic-portfolio.jpg" width="720" alt="Cinematic Portfolio, первый экран: имя Anton Goloskokov и сеть нод n8n справа">

**[Русский](#-русский)  ·  [English](#-english)**

</div>

---

## 🇷🇺 Русский

**Кинематографичное 3D-портфолио, собранное на Vite.**

Одностраничник, ведомый скроллом, для инженера по Technical SEO и AI-автоматизации. В центре 3D-сцены, разреженная сеть нод в духе n8n, которая живет в правой части экрана и не мешает тексту слева. Ноды темные, с тонкой fresnel-каймой, связи еле видны, по ребрам иногда бегут импульсы данных. Никакого bloom и постобработки, поэтому ничто не засвечивает заголовок. Скролл ведет через семь актов, от манифеста до контактов.

> [!NOTE]
> Это **личное портфолио** с настоящим контентом (имя, проекты, контакты), а не демо-шаблон с заглушками. Брать его как основу для своего портфолио можно, тогда пройдитесь по шагам ниже и замените имя, проекты и контакты на свои.

> [!IMPORTANT]
> В отличие от остальных сайтов коллекции, это **проект на Vite**, а не чистый HTML. Библиотеки ставятся через `npm`, а не грузятся с CDN, поэтому и запуск другой (см. ниже). Нужен Node 18+ (разрабатывалось на Node 22).

### 🚀 Как запустить

```bash
cd portfolio/cinematic-portfolio
npm install
npm run dev      # локальный сервер, адрес появится в терминале
npm run build    # прод-сборка в ./dist
npm run preview  # посмотреть собранную версию локально
```

### ✏️ Как сделать сайт своим

#### Шаг 1. Тексты и секции

Весь текст лежит в `index.html`, разбит на семь «актов» с комментариями (от `ACT 1` до `ACT 7`). У каждой секции свой `id`:

| Секция | `id` в файле | Что внутри |
|---|---|---|
| Первый экран | `id="hero"` | Имя, роль, короткое интро |
| Манифест | `id="manifesto"` | Крупная фраза, проявляется по словам |
| Цифры | секция `.stats-sec` | Счетчики, атрибуты `data-count` и `data-static` |
| Направления | `id="focus"` | Четыре дисциплины |
| Процесс | `id="process"` | Шаги автономного пайплайна |
| Работы | `id="work"` | Карточки проектов с метриками и SVG-визуалами |
| Стек | `id="stack"` | Списки инструментов по категориям |
| Контакт | `id="contact"` | Заголовок и кнопки связи |

Слова маркизы (`class="marquee"`) продублированы дважды для бесшовной петли, меняйте обе копии.

#### Шаг 2. Контакты

Почта, GitHub и Telegram лежат в двух местах: секция `id="contact"` и подвал `<footer>`. Сейчас это `An.goloskokov@gmail.com`, `github.com/penkayone`, `t.me/antongoloskokov`.

#### Шаг 3. Цвета

Все токены, это CSS-переменные в начале `src/style.css` (`:root`):

```css
:root {
  --bg: #05060a;      /* фон                */
  --bg-soft: #0b0b12; /* фон карточек       */
  --ink: #f4f3f7;     /* текст              */
  --muted: #8a8896;   /* приглушенный текст */
  --cyan: #00e5ff;    /* акцент             */
  --violet: #6d5cff;  /* акцент             */
  --coral: #ff4d9d;   /* единственный CTA   */
}
```

3D-сцена читает те же цвета в `src/scene.js` (объект `COLORS`), меняйте оба места, если делаете ребрендинг.

#### Шаг 4. 3D-сцена

Настройки в начале функции `createScene()` в `src/scene.js`:

| Параметр | Смысл | По умолчанию |
|---|---|---|
| `NODE_COUNT` | сколько нод | 15 |
| `PULSE_COUNT` | одновременных импульсов данных | 5 |
| `PARTICLE_COUNT` | фоновых частиц | 130 |
| `MAX_DIST` | плотность связей между нодами | 1.35 |

Маска `.hero-grad` в `src/style.css` задает, насколько сцена уходит в чистый фон над колонкой текста.

### 📁 Что в какой папке

```
index.html        вся разметка и тексты (семь «актов»)
src/main.js       прелоадер, курсор, Lenis, таймлайны GSAP, скролл-триггеры
src/scene.js      3D-сцена: сеть нод n8n
src/style.css     токены дизайна и стили всех секций
vite.config.js    конфиг сборки (base "./", чтобы dist открывался с любого пути)
package.json      зависимости и скрипты
```

### 🔧 Технические детали

<details>
<summary><b>3D-сцена</b></summary>
<br>

- Разреженный граф нод, размещен только в правом негативном пространстве.
- Ноды темные, с тонкой fresnel-каймой (без светящегося «фонаря»), связи слабые, по ребрам изредка бегут мягкие импульсы данных.
- Ни bloom, ни постобработки, поэтому заголовок слева физически нечем засветить.
</details>

<details>
<summary><b>Скролл и анимации</b></summary>
<br>

- Lenis (плавный скролл) в связке с GSAP ScrollTrigger.
- Таймлайны на семь актов: интро имени, пословесный манифест, счетчики, проявления секций.
- Пайплайн процесса и «провод» с бегущим импульсом, чистый CSS.
</details>

<details>
<summary><b>Доступность и производительность</b></summary>
<br>

- Контраст near-white `#F4F3F7` на near-black `#05060A` (> 7:1), плюс скрим под заголовком.
- `prefers-reduced-motion`: Lenis, анимация прелоадера, движение сцены, импульсы и проявления выключаются, страница остается спокойной.
- Мобильные: WebGL-сцена **не** запускается ниже 760px и на грубом указателе, вместо нее легкий CSS-градиент, курсор системный.
- `pixelRatio` ограничен 2, цикл рендера встает на паузу, когда первый экран уходит из вида. При отсутствии WebGL, мягкая деградация к статичному фону.
- SplitText не используется: пословесное проявление сделано крошечным ручным сплиттером, без зависимости от премиум-плагина GSAP.
</details>

### ❓ Если что-то пошло не так

| Проблема | Решение |
|---|---|
| `npm run dev` не стартует | Проверьте версию Node (нужен 18+), удалите `node_modules` и повторите `npm install` |
| Пустая правая часть на телефоне | Так и задумано: ниже 760px 3D-сцена отключается, показывается градиент |
| Сцена не движется | Возможно, в системе включено «уменьшение движения» (reduced motion), проект честно его уважает |
| `npm audit` ругается | Это dev-only предупреждение в esbuild/Vite, на прод-сборку в `dist/` оно не влияет |

---

## 🇬🇧 English

**A cinematic 3D portfolio built with Vite.**

A single-page, scroll-driven portfolio for a Technical SEO and AI Automation engineer. The 3D centrepiece is a sparse node network (an homage to n8n) that lives in the right negative space only and never crowds the text on the left. Nodes are dark with a thin fresnel rim, links are faint, and soft data pulses travel the edges now and then. There is no bloom and no post-processing, so nothing can wash out the headline. Scrolling moves through seven acts, from manifesto to contact.

> [!NOTE]
> This is a **personal portfolio** with real content (name, projects, contacts), not a demo template with placeholders. You may use it as a base for your own portfolio, just walk through the steps below and replace the name, projects and contacts with yours.

> [!IMPORTANT]
> Unlike the other sites in the collection, this is a **Vite project**, not plain HTML. Libraries are installed via `npm` rather than loaded from a CDN, so it runs differently (see below). Requires Node 18+ (developed on Node 22).

### 🚀 Run it

```bash
cd portfolio/cinematic-portfolio
npm install
npm run dev      # local dev server, prints a localhost URL
npm run build    # production build into ./dist
npm run preview  # serve the production build locally
```

### ✏️ Make it yours

#### Step 1. Copy and sections

All copy lives in `index.html`, grouped into seven "acts" with comments (from `ACT 1` to `ACT 7`). Each section has its own `id`:

| Section | `id` in file | What is inside |
|---|---|---|
| Hero | `id="hero"` | Name, role, short intro |
| Manifesto | `id="manifesto"` | The big line, reveals word by word |
| Numbers | the `.stats-sec` section | Counters, the `data-count` and `data-static` attributes |
| Focus | `id="focus"` | Four disciplines |
| Process | `id="process"` | Steps of the autonomous pipeline |
| Work | `id="work"` | Project cards with metrics and SVG visuals |
| Stack | `id="stack"` | Tool lists by category |
| Contact | `id="contact"` | Heading and contact buttons |

The marquee words (`class="marquee"`) are duplicated twice for a seamless loop, keep both copies in sync.

#### Step 2. Contacts

Email, GitHub and Telegram sit in two places: the `id="contact"` section and the `<footer>`. Currently `An.goloskokov@gmail.com`, `github.com/penkayone`, `t.me/antongoloskokov`.

#### Step 3. Colors

All tokens are CSS variables at the top of `src/style.css` (`:root`):

```css
:root {
  --bg: #05060a;      /* background      */
  --bg-soft: #0b0b12; /* card background */
  --ink: #f4f3f7;     /* text            */
  --muted: #8a8896;   /* muted text      */
  --cyan: #00e5ff;    /* accent          */
  --violet: #6d5cff;  /* accent          */
  --coral: #ff4d9d;   /* the single CTA  */
}
```

The 3D scene reads the same colors in `src/scene.js` (the `COLORS` object), update both if you rebrand.

#### Step 4. The 3D scene

Tuning knobs at the top of `createScene()` in `src/scene.js`:

| Knob | Meaning | Default |
|---|---|---|
| `NODE_COUNT` | how many nodes | 15 |
| `PULSE_COUNT` | concurrent data pulses | 5 |
| `PARTICLE_COUNT` | ambient particles | 130 |
| `MAX_DIST` | link density between nodes | 1.35 |

The `.hero-grad` mask in `src/style.css` controls how far the scene fades to pure background over the text column.

### 📁 What is in each folder

```
index.html        all markup and copy (the seven "acts")
src/main.js       preloader, cursor, Lenis, GSAP timelines, scroll triggers
src/scene.js      the 3D scene: the n8n node network
src/style.css     design tokens and every section style
vite.config.js    build config (base "./" so dist opens from any path)
package.json      dependencies and scripts
```

### 🔧 Technical details

<details>
<summary><b>3D scene</b></summary>
<br>

- A sparse node graph placed only in the right negative space.
- Nodes are dark with a thin fresnel rim (no glowing lantern), links are faint, and soft data pulses travel the edges now and then.
- No bloom and no post-processing, so there is physically nothing that can wash out the headline on the left.
</details>

<details>
<summary><b>Scroll and animation</b></summary>
<br>

- Lenis (smooth scroll) wired to GSAP ScrollTrigger.
- Timelines across seven acts: name intro, word-by-word manifesto, counters, section reveals.
- The process pipeline and its "wire" with a travelling pulse are pure CSS.
</details>

<details>
<summary><b>Accessibility and performance</b></summary>
<br>

- Contrast of near-white `#F4F3F7` on near-black `#05060A` (> 7:1), plus a scrim under the headline.
- `prefers-reduced-motion`: Lenis, the loader animation, scene motion, pulses and reveals are all disabled, the page stays calm.
- Mobile: the WebGL scene does **not** start below 760px or on coarse pointers, a light CSS gradient stands in and the native cursor is used.
- `pixelRatio` is capped at 2, the render loop pauses when the hero scrolls out of view. Without WebGL it degrades gracefully to a static background.
- SplitText is not used: the word-by-word reveal is a tiny manual splitter, with no dependency on GSAP's premium plugin.
</details>

### ❓ If something goes wrong

| Problem | Fix |
|---|---|
| `npm run dev` will not start | Check your Node version (18+ required), delete `node_modules` and run `npm install` again |
| Empty right side on mobile | By design: below 760px the 3D scene is off and a gradient is shown |
| The scene does not move | Reduced motion may be enabled in your system, the project honestly respects it |
| `npm audit` complains | It is a dev-only advisory in esbuild/Vite, it does not affect the production build in `dist/` |
