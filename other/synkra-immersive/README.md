<div align="center">

# ◇ SYNKRA Immersive

<img src="../../docs/previews/synkra-immersive.jpg" width="720" alt="SYNKRA Immersive, первый экран: крупный заголовок «WE MAKE DIGITAL FEEL ALIVE» и лаймовый 3D-объект">

**[Русский](#-русский)  ·  [English](#-english)**

</div>

---

## 🇷🇺 Русский

**Лендинг AI-студии, кинематографичный, с ярким лаймовым акцентом.**

Первый экран, крупная типографика «We make digital feel alive» и живой генеративный объект (лаймовый «цветок» с лепестками) справа. Дальше по скроллу: залипающая секция с видео, интерактивная «лаборатория» (кнопки меняют поведение объекта), услуги, работы, процесс на 21 день, выбор пакета и форма заявки. Есть кнопка «пауза» для анимаций.

> [!NOTE]
> Это **шаблон**, а не сайт реальной студии. Название «SYNKRA», цены (`$12k`, `$24k`, `$42k+`), сроки, работы и почта, вымышленные заглушки. Ниже по шагам, как заменить их на своё.

> [!IMPORTANT]
> В отличие от большинства шаблонов в этой коллекции, этот собран на **Next.js + [vinext](https://github.com/cloudflare/vinext)** (запуск под Cloudflare), а не на чистых HTML/CSS/JS. Просто скопировать папку и открыть `index.html` не выйдет, нужен Node.js и установка зависимостей. См. «Как запустить».

### 🚀 Как запустить

Нужен **Node.js `>=22.13.0`**.

```bash
cd other/synkra-immersive
npm install       # поставить зависимости (один раз)
npm run dev       # локальный сервер для разработки, адрес выведется в терминал
```

Для боевой сборки и предпросмотра:

```bash
npm run build     # собрать проект
npm run start     # запустить собранную версию
npm test          # собрать и проверить, что страница рендерится
```

### ✏️ Как сделать сайт своим

Весь контент лежит в папке `app/`. Тексты и данные, в `app/page.tsx`, название и мета-теги, в `app/layout.tsx`, цвета и стили, в `app/globals.css`.

#### Шаг 1. Название студии

Название «SYNKRA» встречается в нескольких местах:

| Где | Файл | Что искать |
|---|---|---|
| Вкладка браузера, OG/Twitter | `app/layout.tsx` | объект `metadata` (`title`, `openGraph`, `twitter`) |
| Логотип в шапке | `app/page.tsx` | блок `className="brand"` в `<header>` |
| Логотип в подвале | `app/page.tsx` | блок `className="brand"` в `<footer>` |
| Почта для связи | `app/page.tsx` | ссылки `mailto:hello@synkra.studio` (в подвале и в форме) |
| Техническое имя проекта | `package.json` | поле `"name"` |

#### Шаг 2. Тексты и секции

Каждая секция подписана своим `id` или классом. Найдите нужную в `app/page.tsx`:

| Секция | Якорь / класс | Что внутри |
|---|---|---|
| Первый экран | `id="top"` (`.hero`) | Заголовок, вводный абзац, кнопки, метрики (21 день, 3×, 01) |
| Видео-история | `id="lab"` (`.motion-story`) | Залипающая секция с видео `/synkra-motion.mp4` |
| Арт-лаборатория | `.lab` | Кнопки `bloom / orbit / signal` меняют поведение объекта |
| Услуги | `id="services"` | Три карточки, массив `services` вверху файла |
| Работы | `id="work"` | Две карточки проектов (`AURA`, `N / 01`) |
| Процесс | `id="process"` | Таймлайн на 21 день (`.timeline`) |
| Пакеты | `.estimator` | Табы с ценами, массив `packages` вверху файла |
| Форма заявки | `id="start"` (`.final-cta`) | Финальный призыв и форма `.brief-form` |

Услуги и цены удобнее всего править прямо в массивах `services` и `packages` в самом верху `app/page.tsx`, разметка подхватит изменения автоматически.

#### Шаг 3. Форма

Форма на первом экране, **демо-заглушка**: при отправке она не шлёт данные на сервер, а просто показывает экран «успех» и предлагает открыть письмо через `mailto:hello@synkra.studio` (см. функцию `handleBrief` в `app/page.tsx`). Чтобы заявки реально приходили, подключите сервис форм ([Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/)) или свой бэкенд, либо серверный экшен Next.js.

#### Шаг 4. Цвета и шрифты

Вся палитра в начале `app/globals.css`, в блоке `:root`:

```css
:root {
  --ink: #080906;       /* фон                    */
  --ink-soft: #11130d;  /* фон блоков             */
  --cream: #f3eedb;     /* цвет текста            */
  --cream-dim: #aaa994; /* приглушённый текст     */
  --lime: #c7ff3d;      /* главный акцент, лайм    */
  --lime-soft: #99c72a; /* акцент потемнее         */
}
```

Шрифты, системные (`Arial Black` для крупных заголовков, `Helvetica Neue` для текста), заданы в тех же переменных `--display` и `--body`, ничего скачивать не нужно, русский текст отображается сразу.

#### Шаг 5. Видео и картинка-превью

Видео первого экрана лежит в `public/synkra-motion.mp4`. Замените файл на своё видео с тем же именем (или поменяйте путь `src="/synkra-motion.mp4"` в `app/page.tsx`). Держите видео коротким и без звука, оно играет фоном в цикле.

### 📁 Что в какой папке

```
app/page.tsx      вся разметка, тексты, данные (services, packages), интерактив
app/layout.tsx    название сайта, мета-теги (title, OpenGraph, Twitter)
app/globals.css   все стили: палитра (:root), секции, адаптив
public/           статические файлы (видео synkra-motion.mp4)
db/, drizzle/     опциональная база (по умолчанию пустая, для лендинга не нужна)
```

### 🔧 Технические детали

<details>
<summary><b>Стек и как всё устроено</b></summary>
<br>

- **Next.js 16 + React 19**, сборка и запуск через **vinext** (Next под Cloudflare Workers), TypeScript, Tailwind 4.
- Страница помечена `"use client"`, интерактив (скролл-прогресс, параллакс по курсору, появление блоков) сделан на нативных `IntersectionObserver` и `requestAnimationFrame`, без анимационных библиотек.
- Данные секций вынесены в массивы `services` и `packages` в начале `app/page.tsx`.
- Полезные команды: `npm run dev` (разработка), `npm run build` (сборка), `npm run start` (запуск сборки), `npm test` (сборка + проверка рендера), `npm run lint`.
</details>

<details>
<summary><b>vinext, авторизация и база (для разработчиков)</b></summary>
<br>

Проект основан на стартере vinext. Ниже, справочная информация из него, для лендинга-визитки она не нужна, но пригодится, если будете расширять сайт под Cloudflare.

- `.openai/hosting.json` объявляет опциональные привязки Sites D1 и R2. `vite.config.ts` эмулирует их для локальной разработки.
- `db/schema.ts` изначально пустой. `examples/d1/` содержит пример работы с D1. `drizzle.config.ts` и `npm run db:generate` генерируют миграции Drizzle после изменения схемы.
- Сайты в воркспейсе OpenAI могут читать email текущего пользователя из заголовка `oai-authenticated-user-email` (и опционально имя из `oai-authenticated-user-full-name`).
- Готовые хелперы для входа через ChatGPT лежат в `app/chatgpt-auth.ts`: `getChatGPTUser()`, `requireChatGPTUser(returnTo)`, `chatGPTSignInPath()` / `chatGPTSignOutPath()`. Пути `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback` зарезервированы платформой, свои роуты для них создавать не нужно.

Подробности: [vinext](https://github.com/cloudflare/vinext), [Drizzle D1](https://orm.drizzle.team/docs/get-started/d1-new).
</details>

### ❓ Если что-то пошло не так

| Проблема | Решение |
|---|---|
| `npm install` падает | Проверьте версию Node, нужна `>=22.13.0` (`node -v`) |
| Пустая страница при открытии `index.html` | Тут нет статического `index.html`, это Next.js. Запускайте через `npm run dev` |
| Форма «отправилась», но письма нет | Форма, демо-заглушка. Подключите сервис форм или свой бэкенд, см. [шаг 3](#шаг-3-форма) |
| Не играет видео | Проверьте, что файл лежит в `public/` и путь `src` совпадает |

---

## 🇬🇧 English

**A landing page for an AI studio, cinematic, with a bold lime accent.**

The first screen has big typography, "We make digital feel alive", and a living generative object (a lime "bloom" with petals) on the right. Scrolling then reveals a sticky video section, an interactive "lab" (buttons change the object's behavior), services, work, a 21-day process, package selection and a brief form. There is a pause button for the motion.

> [!NOTE]
> This is a **template**, not a real studio site. The name "SYNKRA", the prices (`$12k`, `$24k`, `$42k+`), timings, work and email are fictional placeholders. See below for how to make it yours.

> [!IMPORTANT]
> Unlike most templates in this collection, this one is built with **Next.js + [vinext](https://github.com/cloudflare/vinext)** (runs on Cloudflare), not plain HTML/CSS/JS. You cannot just copy the folder and open `index.html`, you need Node.js and an install step. See "Run it".

### 🚀 Run it

You need **Node.js `>=22.13.0`**.

```bash
cd other/synkra-immersive
npm install       # install dependencies (once)
npm run dev       # local dev server, the URL is printed in the terminal
```

For a production build and preview:

```bash
npm run build     # build the project
npm run start     # run the built version
npm test          # build and check the page renders
```

### ✏️ Make it yours

All content lives in the `app/` folder. Copy and data are in `app/page.tsx`, the name and meta tags in `app/layout.tsx`, colors and styles in `app/globals.css`.

#### Step 1. Studio name

The name "SYNKRA" appears in several places:

| Where | File | What to look for |
|---|---|---|
| Browser tab, OG/Twitter | `app/layout.tsx` | the `metadata` object (`title`, `openGraph`, `twitter`) |
| Header logo | `app/page.tsx` | the `className="brand"` block in `<header>` |
| Footer logo | `app/page.tsx` | the `className="brand"` block in `<footer>` |
| Contact email | `app/page.tsx` | the `mailto:hello@synkra.studio` links (footer and form) |
| Technical project name | `package.json` | the `"name"` field |

#### Step 2. Copy and sections

Each section has its own `id` or class. Find it in `app/page.tsx`:

| Section | Anchor / class | What is inside |
|---|---|---|
| Hero | `id="top"` (`.hero`) | Headline, intro paragraph, buttons, metrics (21 days, 3×, 01) |
| Video story | `id="lab"` (`.motion-story`) | Sticky section with the `/synkra-motion.mp4` video |
| Art lab | `.lab` | Buttons `bloom / orbit / signal` change the object's behavior |
| Services | `id="services"` | Three cards, the `services` array at the top of the file |
| Work | `id="work"` | Two project cards (`AURA`, `N / 01`) |
| Process | `id="process"` | A 21-day timeline (`.timeline`) |
| Packages | `.estimator` | Price tabs, the `packages` array at the top of the file |
| Brief form | `id="start"` (`.final-cta`) | Final call to action and the `.brief-form` |

Services and prices are easiest to edit right in the `services` and `packages` arrays at the very top of `app/page.tsx`, the markup picks up changes automatically.

#### Step 3. Form

The form on the first screen is a **demo stub**: on submit it does not send anything to a server, it just shows a "success" state and offers to open an email via `mailto:hello@synkra.studio` (see the `handleBrief` function in `app/page.tsx`). To actually receive leads, wire it to a form service ([Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/)), your own backend, or a Next.js server action.

#### Step 4. Colors and fonts

The whole palette sits at the top of `app/globals.css`, in the `:root` block:

```css
:root {
  --ink: #080906;       /* background        */
  --ink-soft: #11130d;  /* block backgrounds */
  --cream: #f3eedb;     /* text              */
  --cream-dim: #aaa994; /* muted text        */
  --lime: #c7ff3d;      /* main accent, lime */
  --lime-soft: #99c72a; /* darker accent     */
}
```

Fonts are system stacks (`Arial Black` for big headings, `Helvetica Neue` for body), set in the same `--display` and `--body` variables, nothing is downloaded and any language renders instantly.

#### Step 5. Video and preview image

The hero video lives in `public/synkra-motion.mp4`. Replace the file with your own video under the same name (or change the `src="/synkra-motion.mp4"` path in `app/page.tsx`). Keep it short and muted, it loops in the background.

### 📁 What is in each folder

```
app/page.tsx      all markup, copy, data (services, packages), interactivity
app/layout.tsx    site name, meta tags (title, OpenGraph, Twitter)
app/globals.css   all styles: palette (:root), sections, responsive
public/           static files (the synkra-motion.mp4 video)
db/, drizzle/     optional database (empty by default, not needed for the landing)
```

### 🔧 Technical details

<details>
<summary><b>Stack and how it works</b></summary>
<br>

- **Next.js 16 + React 19**, built and served via **vinext** (Next on Cloudflare Workers), TypeScript, Tailwind 4.
- The page is `"use client"`, the interactivity (scroll progress, cursor parallax, reveal-on-scroll) uses native `IntersectionObserver` and `requestAnimationFrame`, no animation libraries.
- Section data lives in the `services` and `packages` arrays at the top of `app/page.tsx`.
- Useful commands: `npm run dev` (development), `npm run build` (build), `npm run start` (run the build), `npm test` (build + render check), `npm run lint`.
</details>

<details>
<summary><b>vinext, auth and database (for developers)</b></summary>
<br>

The project is based on the vinext starter. Below is reference info from it, not needed for a brochure landing, but useful if you extend the site on Cloudflare.

- `.openai/hosting.json` declares optional Sites D1 and R2 bindings. `vite.config.ts` simulates them for local development.
- `db/schema.ts` starts empty. `examples/d1/` shows a D1 surface. `drizzle.config.ts` and `npm run db:generate` generate Drizzle migrations after schema changes.
- OpenAI workspace sites can read the current user's email from the `oai-authenticated-user-email` header (and optionally the name from `oai-authenticated-user-full-name`).
- Ready-made ChatGPT sign-in helpers live in `app/chatgpt-auth.ts`: `getChatGPTUser()`, `requireChatGPTUser(returnTo)`, `chatGPTSignInPath()` / `chatGPTSignOutPath()`. The paths `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback` are reserved by the platform, do not add your own routes for them.

More: [vinext](https://github.com/cloudflare/vinext), [Drizzle D1](https://orm.drizzle.team/docs/get-started/d1-new).
</details>

### ❓ If something goes wrong

| Problem | Fix |
|---|---|
| `npm install` fails | Check your Node version, you need `>=22.13.0` (`node -v`) |
| Blank page when opening `index.html` | There is no static `index.html`, this is Next.js. Run it with `npm run dev` |
| The form "submitted" but no email arrived | The form is a demo stub. Wire it to a form service or your backend, see [step 3](#step-3-form) |
| The video does not play | Make sure the file is in `public/` and the `src` path matches |
</content>
