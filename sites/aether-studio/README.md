<div align="center">

# ✦ AETHER

<img src="../../docs/previews/aether-studio.jpg" width="720" alt="AETHER, первый экран: заголовок «Цифровая материя в движении» и 3D-блоб">

**[Русский](#-русский)  ·  [English](#-english)**

</div>

---

## 🇷🇺 Русский

**3D-лендинг для цифровой студии.**

Первый экран, это живой 3D-блоб на шейдерах и облако частиц под заголовком «Цифровая материя в движении». Дальше обычным скроллом открываются манифест, услуги, цифры, работы и контакт. Свой курсор, кинетическая типографика и анимации по секциям.

> [!NOTE]
> Это **шаблон**, а не сайт реальной студии. Название «AETHER», работы, цифры и контакты, вымышленные заглушки. Ниже по шагам, как заменить их на свое.

### 🚀 Как запустить

Нужен любой локальный сервер, двойной клик по `index.html` **не сработает** (браузеры блокируют 3D-модули у файлов, открытых с диска, адрес `file://`).

**Вариант 1, терминал (самый простой):**

```bash
cd sites/aether-studio
npx serve .
```

Откройте адрес из терминала (обычно `http://localhost:3000`).

**Вариант 2, VS Code / WebStorm:** правый клик по `index.html`, «Open with Live Server».

**Вариант 3, Python:**

```bash
cd sites/aether-studio
python3 -m http.server 8000
# открыть http://localhost:8000
```

> [!IMPORTANT]
> Нужен интернет: Three.js, GSAP и шрифты подключаются через CDN.

### ✏️ Как сделать сайт своим

Все правится в обычном текстовом редакторе. Главный файл, `index.html`, цвета и шрифты, в начале `css/style.css`.

#### Шаг 1. Название студии

Откройте `index.html` и через поиск (`Ctrl+F` / `Cmd+F`) найдите все `AETHER`. Название встречается в четырех местах:

| Где | Что искать |
|---|---|
| Вкладка браузера | `<title>` в самом верху файла |
| Логотип в шапке | ссылка `class="logo"` |
| Большая надпись в подвале | блок `class="foot-big"` |
| Копирайт | строка `© 2026 AETHER Studio` в подвале |

#### Шаг 2. Тексты и секции

Каждая секция подписана своим `id`, найдите нужную и поменяйте текст внутри:

| Секция | `id` в файле | Что внутри |
|---|---|---|
| Первый экран | `id="hero"` | Заголовок, подзаголовок, подсказка «скролл» |
| Манифест | `id="studio"` | Крупная фраза-манифест (`id="manifestoText"`) |
| Услуги | `id="services"` | Четыре направления, строки `.svc-row` |
| Цифры | секция со `.stats` | Счетчики, атрибуты `data-count` |
| Работы | `id="work"` | Карточки проектов `.card` |
| Контакт | `id="contact"` | Заголовок и кнопка связи |

#### Шаг 3. Контакты

Почта лежит в кнопке «Начать проект» (`mailto:hello@aether.studio`) и в подвале, в колонке «Связь». Там же телефон-заглушка `+7 999 000 00 00` и ссылки на соцсети (сейчас это пустые `#`).

#### Шаг 4. Форма

Формы на сайте **нет**, связь идет через кнопку-ссылку `mailto`. Если нужна именно форма с отправкой заявок, добавьте ее и подключите любой сервис форм ([Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/)) или свой бэкенд.

#### Шаг 5. Цвета и шрифты

Вся палитра собрана в начале `css/style.css`, в блоке `:root`, поменяли значение в одном месте, и оно поменялось по всему сайту:

```css
:root {
  --bg: #050507;      /* фон                    */
  --bg-soft: #0b0b12; /* фон карточек           */
  --ink: #f4f3f7;     /* цвет текста            */
  --muted: #8a8896;   /* приглушенный текст     */
  --c1: #6d5cff;      /* акцент, фиолетовый     */
  --c2: #00e5ff;      /* акцент, циан           */
  --c3: #ff4d9d;      /* акцент, маджента       */
}
```

Шрифты, `Space Grotesk` (заголовки) и `Inter` (текст), подключаются в `<head>` файла `index.html`.

> [!TIP]
> Три акцентных цвета (`--c1`, `--c2`, `--c3`) используются и в 3D-сцене, они передаются в шейдер блоба в `js/main.js` (объект `uniforms`). Если меняете палитру кардинально, загляните и туда. И учтите: `Space Grotesk` не содержит кириллицу, для русских заголовков возьмите шрифт с ее поддержкой.

#### Шаг 6. Свои ассеты

Вся графика рисуется кодом, внешних файлов нет вообще, поэтому папки `assets` тут нет. Если добавите свои картинки или 3D-модели, создайте `assets/` и складывайте их туда.

### 📁 Что в какой папке

```
index.html      вся разметка + подключение библиотек с CDN
css/style.css   все стили: палитра, секции, адаптив
js/main.js      свой курсор, 3D-сцена, прелоадер, все GSAP-анимации
```

### 🔧 Технические детали

<details>
<summary><b>3D-сцена</b></summary>
<br>

- Икосаэдр-блоб, вершины смещаются в шейдере по simplex-шуму (Ashima), поверх, fresnel-подсветка и градиент из трех акцентных цветов.
- Каркасный ореол вокруг блоба и поле из 900 частиц по сфере.
- Параллакс камеры и деформация блоба следуют за курсором. Постобработки нет.
- `pixelRatio` ограничен значением 2, чтобы не грузить сетчаточные экраны.
</details>

<details>
<summary><b>Скролл и анимации</b></summary>
<br>

- GSAP и ScrollTrigger, плюс свой цикл `requestAnimationFrame` для 3D.
- Прелаудер со счетчиком 0, 100 и «шторкой», затем интро заголовка.
- Манифест проявляется по словам (GSAP SplitText), маркиза дрейфует и подрагивает от скорости скролла.
- Счетчики цифр, масштаб блоба и параллакс на первом экране, легкий 3D-наклон карточек по наведению.
</details>

<details>
<summary><b>Поведение на устройствах</b></summary>
<br>

- Свой курсор работает на десктопе, на тач-устройствах (`hover: none`) он скрыт и возвращается системный.
- Плавные якоря по кликам на `#`-ссылки.
</details>

### ❓ Если что-то пошло не так

| Проблема | Решение |
|---|---|
| Черный или пустой экран | Вы открыли файл двойным кликом (`file://`). Запустите локальный сервер, см. [«Как запустить»](#-как-запустить) |
| Нет шрифтов / 3D не грузится | Проверьте интернет, библиотеки и шрифты идут с CDN |
| Русские заголовки выглядят не так | `Space Grotesk` без кириллицы, замените шрифт заголовков на любой с ее поддержкой |

---

## 🇬🇧 English

**A 3D landing page for a digital studio.**

The first screen is a living shader blob and a particle cloud under the headline "Digital matter in motion". Plain scrolling then reveals the manifesto, services, numbers, work and contact. Custom cursor, kinetic typography and section animations.

> [!NOTE]
> This is a **template**, not a real studio site. The name "AETHER", the work, numbers and contacts are fictional placeholders. See below for how to make it yours.

### 🚀 Run it

You need any local server, double-clicking `index.html` **will not work** (browsers block 3D modules for files opened from disk, the `file://` scheme).

**Option 1, terminal (easiest):**

```bash
cd sites/aether-studio
npx serve .
```

Open the address printed in the terminal (usually `http://localhost:3000`).

**Option 2, VS Code / WebStorm:** right-click `index.html`, "Open with Live Server".

**Option 3, Python:**

```bash
cd sites/aether-studio
python3 -m http.server 8000
# open http://localhost:8000
```

> [!IMPORTANT]
> Internet is required: Three.js, GSAP and the fonts load from a CDN.

### ✏️ Make it yours

Everything is edited in a plain text editor. The main file is `index.html`, colors and fonts live at the top of `css/style.css`.

#### Step 1. Studio name

Open `index.html` and search (`Ctrl+F` / `Cmd+F`) for `AETHER`. The name appears in four places:

| Where | What to look for |
|---|---|
| Browser tab | `<title>` at the very top |
| Header logo | the `class="logo"` link |
| Big footer word | the `class="foot-big"` block |
| Copyright | the `© 2026 AETHER Studio` line in the footer |

#### Step 2. Copy and sections

Each section has its own `id`, find the one you need and edit the text inside:

| Section | `id` in file | What is inside |
|---|---|---|
| Hero | `id="hero"` | Headline, sub-copy, scroll hint |
| Manifesto | `id="studio"` | The big manifesto line (`id="manifestoText"`) |
| Services | `id="services"` | Four disciplines, the `.svc-row` rows |
| Numbers | the `.stats` section | Counters, the `data-count` attributes |
| Work | `id="work"` | Project cards `.card` |
| Contact | `id="contact"` | Heading and the contact button |

#### Step 3. Contacts

The email lives in the "Start a project" button (`mailto:hello@aether.studio`) and in the footer "Contact" column, along with the placeholder phone `+7 999 000 00 00` and social links (empty `#` for now).

#### Step 4. Form

There is **no form**, contact goes through a `mailto` link-button. If you need a real form that sends leads, add one and wire it to any form service ([Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/)) or your own backend.

#### Step 5. Colors and fonts

The whole palette sits at the top of `css/style.css`, in the `:root` block, change a value once and it changes everywhere:

```css
:root {
  --bg: #050507;      /* background      */
  --bg-soft: #0b0b12; /* card background */
  --ink: #f4f3f7;     /* text            */
  --muted: #8a8896;   /* muted text      */
  --c1: #6d5cff;      /* accent, violet  */
  --c2: #00e5ff;      /* accent, cyan    */
  --c3: #ff4d9d;      /* accent, magenta */
}
```

Fonts are `Space Grotesk` (headings) and `Inter` (body), loaded in the `<head>` of `index.html`.

> [!TIP]
> The three accent colors (`--c1`, `--c2`, `--c3`) are also used in the 3D scene, they are passed into the blob shader in `js/main.js` (the `uniforms` object). If you rebrand hard, update them there too.

#### Step 6. Your own assets

All graphics are drawn in code, there are no external files at all, so there is no `assets` folder here. If you add images or 3D models, create an `assets/` folder and put them there.

### 📁 What is in each folder

```
index.html      all markup + CDN library tags
css/style.css   all styles: palette, sections, responsive
js/main.js      custom cursor, 3D scene, preloader, every GSAP animation
```

### 🔧 Technical details

<details>
<summary><b>3D scene</b></summary>
<br>

- An icosahedron blob whose vertices are displaced in the shader by simplex noise (Ashima), with fresnel lighting and a gradient of the three accent colors on top.
- A wireframe halo around the blob and a 900-particle field on a sphere.
- The camera parallax and the blob deformation follow the cursor. No post-processing.
- `pixelRatio` is capped at 2 so retina screens are not overloaded.
</details>

<details>
<summary><b>Scroll and animation</b></summary>
<br>

- GSAP and ScrollTrigger, plus a dedicated `requestAnimationFrame` loop for the 3D.
- A preloader counter from 0 to 100 with a wipe, then the headline intro.
- The manifesto reveals word by word (GSAP SplitText), the marquee drifts and skews with scroll velocity.
- Number counters, blob scaling and hero parallax on scroll, a subtle 3D card tilt on hover.
</details>

<details>
<summary><b>Device behavior</b></summary>
<br>

- The custom cursor runs on desktop, on touch devices (`hover: none`) it is hidden and the native cursor returns.
- Smooth anchors on clicks to `#` links.
</details>

### ❓ If something goes wrong

| Problem | Fix |
|---|---|
| Black or empty screen | You opened the file by double-click (`file://`). Start a local server, see [Run it](#-english) |
| No fonts / 3D does not load | Check your internet, the libraries and fonts come from a CDN |
| Cyrillic headings look off | `Space Grotesk` has no Cyrillic, swap the heading font for one that supports it |
