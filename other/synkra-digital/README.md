<div align="center">

# ◈ SYNKRA Digital

<img src="../../docs/previews/synkra-digital.jpg" width="720" alt="SYNKRA Digital, первый экран: заголовок «Digital experiences that move people» и генеративное видео в кобальтовых тонах">

**[Русский](#-русский)  ·  [English](#-english)**

</div>

---

## 🇷🇺 Русский

**Сдержанный, «сеньорный» лендинг цифровой студии в кобальтовых тонах.**

Первый экран, заголовок «Digital experiences that move people» слева и генеративное видео справа, с переключателем настроения (три акцентных цвета: кобальт, коралл, мята). Дальше по скроллу: секция про осмысленное движение с видео, работы, услуги, процесс на три недели, выбор пакета и форма заявки. Есть кнопка «пауза» для видео.

> [!NOTE]
> Это **шаблон**, а не сайт реальной студии. Название «SYNKRA», цены (`$12k`, `$24k`, `$42k+`), сроки, работы и почта, вымышленные заглушки. Ниже по шагам, как заменить их на своё.

> [!IMPORTANT]
> В отличие от большинства шаблонов в этой коллекции, этот собран на **Next.js + [vinext](https://github.com/cloudflare/vinext)** (запуск под Cloudflare), а не на чистых HTML/CSS/JS. Просто скопировать папку и открыть `index.html` не выйдет, нужен Node.js и установка зависимостей. См. «Как запустить».

### 🚀 Как запустить

Нужен **Node.js `>=22.13.0`**.

```bash
cd other/synkra-digital
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
| Вкладка браузера, OG/Twitter | `app/layout.tsx` | функция `generateMetadata` (`title`, `openGraph`, `twitter`) |
| Домен по умолчанию для OG-картинки | `app/layout.tsx` | строка-заглушка хоста внутри `generateMetadata`, поменяйте на свой домен |
| Логотип в шапке | `app/page.tsx` | блок `className="brand"` в `<header>` |
| Логотип в подвале | `app/page.tsx` | блок `className="brand"` в `<footer>` |
| Почта для связи | `app/page.tsx` | ссылки `mailto:hello@synkra.studio` (в подвале и в форме) |
| Техническое имя проекта | `package.json` | поле `"name"` |

#### Шаг 2. Тексты и секции

Каждая секция подписана своим `id` или классом. Найдите нужную в `app/page.tsx`:

| Секция | Якорь / класс | Что внутри |
|---|---|---|
| Первый экран | `id="top"` (`.hero`) | Заголовок, лид, кнопки, факты (21 день, 01, ∞), видео `/synkra-hero.mp4`, переключатель цвета |
| Движение | `.motion-story` | Секция про осмысленную анимацию с видео `/synkra-wave.mp4` |
| Работы | `id="work"` | Две карточки проектов (`AURA`, `NOA`) с видео |
| Услуги | `id="services"` | Три карточки, массив `services` вверху файла |
| Процесс | `id="process"` | Таймлайн на три недели (`.process-list`) |
| Пакеты | `.packages` | Табы с ценами, массив `packages` вверху файла |
| Форма заявки | `id="contact"` (`.contact`) | Финальный призыв и форма `.brief-form` |

Услуги и цены удобнее всего править прямо в массивах `services` и `packages` в самом верху `app/page.tsx`, разметка подхватит изменения автоматически.

#### Шаг 3. Форма

Форма в блоке контакта, **демо-заглушка**: при отправке она не шлёт данные на сервер, а просто показывает экран «успех» и предлагает открыть письмо через `mailto:hello@synkra.studio` (см. функцию `handleBrief` в `app/page.tsx`). Чтобы заявки реально приходили, подключите сервис форм ([Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/)) или свой бэкенд, либо серверный экшен Next.js.

#### Шаг 4. Цвета и шрифты

Вся палитра в начале `app/globals.css`, в блоке `:root`:

```css
:root {
  --night: #0b0d14;      /* основной тёмный фон       */
  --paper: #f3f0e8;      /* светлые секции            */
  --ink: #12131a;        /* тёмный текст              */
  --white: #faf9f6;      /* светлый текст             */
  --muted: #9ca2b6;      /* приглушённый текст        */
  --accent: #637aff;     /* акцент по умолчанию, кобальт */
  --accent-hot: #ff7c6b; /* тёплый доп. акцент         */
}
```

> [!TIP]
> На первом экране есть переключатель настроения (кобальт / коралл / мята). Каждый вариант переопределяет `--accent` через атрибут `data-tone` на корневом `<div className="site">`, ищите строки `.site[data-tone="coral"]` и `.site[data-tone="mint"]` в `app/globals.css`. Начальный цвет задаётся в `useState<Tone>("cobalt")` в `app/page.tsx`.

Шрифты, системные (`Avenir Next`, `Segoe UI` и запасные), заданы в переменных `--display` и `--body`, ничего скачивать не нужно, русский текст отображается сразу.

#### Шаг 5. Видео и OG-картинка

- Видео лежат в `public/`: `synkra-hero.mp4` (первый экран и карточка `AURA`) и `synkra-wave.mp4` (секция «Движение» и карточка `NOA`). Замените файлы на свои с теми же именами или поправьте пути `src` в `app/page.tsx`. Держите видео короткими и без звука, они играют фоном в цикле.
- `public/og.png`, картинка-превью для соцсетей (та, что показывается при отправке ссылки). Замените на своё изображение примерно 1732×909 и проверьте размеры в `generateMetadata` в `app/layout.tsx`.

### 📁 Что в какой папке

```
app/page.tsx      вся разметка, тексты, данные (services, packages), интерактив
app/layout.tsx    название сайта, мета-теги (generateMetadata: title, OpenGraph, Twitter)
app/globals.css   все стили: палитра (:root), темы data-tone, секции, адаптив
public/           статические файлы: видео synkra-hero.mp4, synkra-wave.mp4 и og.png
db/, drizzle/     опциональная база (по умолчанию пустая, для лендинга не нужна)
```

### 🔧 Технические детали

<details>
<summary><b>Стек и как всё устроено</b></summary>
<br>

- **Next.js 16 + React 19**, сборка и запуск через **vinext** (Next под Cloudflare Workers), TypeScript, Tailwind 4.
- Страница помечена `"use client"`, интерактив (скролл-прогресс, параллакс по курсору, появление блоков, переключатель темы) сделан на нативных `IntersectionObserver` и `requestAnimationFrame`, без анимационных библиотек.
- `generateMetadata` в `app/layout.tsx` собирает абсолютный URL OG-картинки из заголовков запроса (`host` / `x-forwarded-proto`), поэтому у него есть хост-заглушка на случай отсутствия заголовков, её и нужно поменять на свой домен.
- Данные секций вынесены в массивы `services` и `packages` в начале `app/page.tsx`.
- Полезные команды: `npm run dev`, `npm run build`, `npm run start`, `npm test`, `npm run lint`.
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
| Не играют видео | Проверьте, что файлы лежат в `public/` и пути `src` совпадают |
| В соцсетях не та превью-картинка | Замените `public/og.png` и проверьте хост-заглушку в `generateMetadata` (`app/layout.tsx`) |

---

## 🇬🇧 English

**A restrained, "senior" digital-studio landing in cobalt tones.**

The first screen has the headline "Digital experiences that move people" on the left and a generative video on the right, with a mood switcher (three accent colors: cobalt, coral, mint). Scrolling then reveals a section on purposeful motion with video, work, services, a three-week process, package selection and a brief form. There is a pause button for the video.

> [!NOTE]
> This is a **template**, not a real studio site. The name "SYNKRA", the prices (`$12k`, `$24k`, `$42k+`), timings, work and email are fictional placeholders. See below for how to make it yours.

> [!IMPORTANT]
> Unlike most templates in this collection, this one is built with **Next.js + [vinext](https://github.com/cloudflare/vinext)** (runs on Cloudflare), not plain HTML/CSS/JS. You cannot just copy the folder and open `index.html`, you need Node.js and an install step. See "Run it".

### 🚀 Run it

You need **Node.js `>=22.13.0`**.

```bash
cd other/synkra-digital
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
| Browser tab, OG/Twitter | `app/layout.tsx` | the `generateMetadata` function (`title`, `openGraph`, `twitter`) |
| Default domain for the OG image | `app/layout.tsx` | the host fallback string inside `generateMetadata`, change it to your domain |
| Header logo | `app/page.tsx` | the `className="brand"` block in `<header>` |
| Footer logo | `app/page.tsx` | the `className="brand"` block in `<footer>` |
| Contact email | `app/page.tsx` | the `mailto:hello@synkra.studio` links (footer and form) |
| Technical project name | `package.json` | the `"name"` field |

#### Step 2. Copy and sections

Each section has its own `id` or class. Find it in `app/page.tsx`:

| Section | Anchor / class | What is inside |
|---|---|---|
| Hero | `id="top"` (`.hero`) | Headline, lead, buttons, facts (21 days, 01, ∞), the `/synkra-hero.mp4` video, color switcher |
| Motion | `.motion-story` | A section on purposeful animation with the `/synkra-wave.mp4` video |
| Work | `id="work"` | Two project cards (`AURA`, `NOA`) with video |
| Services | `id="services"` | Three cards, the `services` array at the top of the file |
| Process | `id="process"` | A three-week timeline (`.process-list`) |
| Packages | `.packages` | Price tabs, the `packages` array at the top of the file |
| Brief form | `id="contact"` (`.contact`) | Final call to action and the `.brief-form` |

Services and prices are easiest to edit right in the `services` and `packages` arrays at the very top of `app/page.tsx`, the markup picks up changes automatically.

#### Step 3. Form

The form in the contact block is a **demo stub**: on submit it does not send anything to a server, it just shows a "success" state and offers to open an email via `mailto:hello@synkra.studio` (see the `handleBrief` function in `app/page.tsx`). To actually receive leads, wire it to a form service ([Formspree](https://formspree.io/), [Web3Forms](https://web3forms.com/)), your own backend, or a Next.js server action.

#### Step 4. Colors and fonts

The whole palette sits at the top of `app/globals.css`, in the `:root` block:

```css
:root {
  --night: #0b0d14;      /* main dark background      */
  --paper: #f3f0e8;      /* light sections            */
  --ink: #12131a;        /* dark text                 */
  --white: #faf9f6;      /* light text                */
  --muted: #9ca2b6;      /* muted text                */
  --accent: #637aff;     /* default accent, cobalt    */
  --accent-hot: #ff7c6b; /* warm secondary accent     */
}
```

> [!TIP]
> The first screen has a mood switcher (cobalt / coral / mint). Each option overrides `--accent` via the `data-tone` attribute on the root `<div className="site">`, look for the `.site[data-tone="coral"]` and `.site[data-tone="mint"]` lines in `app/globals.css`. The starting color is set in `useState<Tone>("cobalt")` in `app/page.tsx`.

Fonts are system stacks (`Avenir Next`, `Segoe UI` and fallbacks), set in the `--display` and `--body` variables, nothing is downloaded and any language renders instantly.

#### Step 5. Video and OG image

- The videos live in `public/`: `synkra-hero.mp4` (hero and the `AURA` card) and `synkra-wave.mp4` (the "Motion" section and the `NOA` card). Replace the files with your own under the same names or fix the `src` paths in `app/page.tsx`. Keep them short and muted, they loop in the background.
- `public/og.png` is the social preview image (the one shown when the link is shared). Replace it with your own image around 1732×909 and check the dimensions in `generateMetadata` in `app/layout.tsx`.

### 📁 What is in each folder

```
app/page.tsx      all markup, copy, data (services, packages), interactivity
app/layout.tsx    site name, meta tags (generateMetadata: title, OpenGraph, Twitter)
app/globals.css   all styles: palette (:root), data-tone themes, sections, responsive
public/           static files: the synkra-hero.mp4, synkra-wave.mp4 videos and og.png
db/, drizzle/     optional database (empty by default, not needed for the landing)
```

### 🔧 Technical details

<details>
<summary><b>Stack and how it works</b></summary>
<br>

- **Next.js 16 + React 19**, built and served via **vinext** (Next on Cloudflare Workers), TypeScript, Tailwind 4.
- The page is `"use client"`, the interactivity (scroll progress, cursor parallax, reveal-on-scroll, theme switcher) uses native `IntersectionObserver` and `requestAnimationFrame`, no animation libraries.
- `generateMetadata` in `app/layout.tsx` builds the absolute OG image URL from request headers (`host` / `x-forwarded-proto`), which is why it has a host fallback for when headers are missing, that is the string to change to your domain.
- Section data lives in the `services` and `packages` arrays at the top of `app/page.tsx`.
- Useful commands: `npm run dev`, `npm run build`, `npm run start`, `npm test`, `npm run lint`.
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
| The videos do not play | Make sure the files are in `public/` and the `src` paths match |
| Wrong preview image on social media | Replace `public/og.png` and check the host fallback in `generateMetadata` (`app/layout.tsx`) |
</content>
