<div align="center">

# 🌐 3D Sites

**Коллекция кинематографичных 3D-сайтов на чистом вебе: живые сцены, плавный скролл и анимации как в кино.**

[![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5&logoColor=white)](#-стек-и-как-открыть-локально)
[![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)](#-стек-и-как-открыть-локально)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](#-стек-и-как-открыть-локально)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black)](https://gsap.com/)

<br>

[**Сайты по категориям ↓**](#-сайты-по-категориям) · [**Стек и запуск ↓**](#-стек-и-как-открыть-локально)

</div>

---

Здесь собраны 3D-лендинги, разложенные по нишам. Каждый сайт, это отдельная папка с живой 3D-сценой, плавным скроллом и анимациями по секциям. Почти все сделаны на чистых HTML, CSS и JS, библиотеки грузятся с CDN, так что копируете папку и получаете готовый сайт. Одно исключение, личное портфолио, оно собрано на Vite.

---

## 🗂 Сайты по категориям

### ✈️ Авиация, `aviation/`

| Превью | Сайт | О чем |
|:---:|---|---|
| [<img src="docs/previews/jet-charter-dawn.jpg" width="360" alt="ALTIUS AIR, превью">](aviation/jet-charter-dawn/) | **[ALTIUS AIR](aviation/jet-charter-dawn/)**<br>`aviation/jet-charter-dawn` | Частная чартерная авиация. Камера летит сквозь облака к джету на рассвете, а скролл плавно опускает вас по секциям до формы заявки. |

### 🍽 Еда и рестораны, `food/`

| Превью | Сайт | О чем |
|:---:|---|---|
| [<img src="docs/previews/fine-dining-noir.jpg" width="360" alt="NOCTURNE, превью">](food/fine-dining-noir/) | **[NOCTURNE](food/fine-dining-noir/)**<br>`food/fine-dining-noir` | Ресторан высокой кухни. При свете свечей камера наводится на блюдо, пар и капля застыли в кадре, а скролл ведет через вечер до брони стола. |

### 🎰 Казино, демо-концепты, `casino/`

| Превью | Сайт | О чем |
|:---:|---|---|
| [<img src="docs/previews/astra-casino.jpg" width="360" alt="ASTRA, превью">](casino/astra-casino/) | **[ASTRA](casino/astra-casino/)**<br>`casino/astra-casino` | Онлайн-казино, демо-концепт. На первом экране бесшовно крутится кинематографичное видео, а скролл ведет по галерее из шести игр, каждая оживает при наведении. 18+, не сервис азартных игр. |

### 👤 Портфолио, `portfolio/`

| Сайт | О чем |
|---|---|
| **[Cinematic Portfolio](portfolio/cinematic-portfolio/)**<br>`portfolio/cinematic-portfolio` | Личное портфолио инженера по Technical SEO и AI-автоматизации. Разреженная сеть нод в стиле n8n живет в правой части экрана, а скролл ведет через семь актов, от манифеста до контактов. Собрано на Vite, three.js, GSAP и Lenis. |

### 📦 Прочее, `other/`

| Сайт | О чем |
|---|---|
| **[AETHER](other/aether-studio/)**<br>`other/aether-studio` | Лендинг цифровой студии. В центре живой 3D-блоб на шейдерах и облако частиц, свой курсор, кинетическая типографика и анимации по скроллу. |

> Категории в работе: 🔧 ремесла и услуги (`trades/`), 🏥 медицина (`medical/`), 🚗 авто (`automotive/`). Скоро наполнятся.

---

## 🧩 Стек и как открыть локально

Библиотеки одни и те же во всех сайтах: [Three.js](https://threejs.org/) для 3D, [GSAP и ScrollTrigger](https://gsap.com/) для анимаций по скроллу, [Lenis](https://lenis.darkroom.engineering/) для плавного скролла.

**Обычные шаблоны** (авиация, еда, казино, AETHER) сделаны на чистых HTML, CSS и JS без сборщика. Библиотеки подключены с CDN прямо в `index.html`. Структура у всех одинаковая:

```
category/site-name/
├── index.html      ← вся разметка страницы
├── css/style.css   ← все стили
├── js/*.js         ← 3D-сцена и анимации
└── assets/         ← место для картинок и 3D-моделей
```

Запуск, любой локальный сервер (двойной клик по файлу не подойдет, браузер заблокирует 3D-модули):

```bash
cd 3d-sites/aviation/jet-charter-dawn
npx serve .
```

**Портфолио** собрано на Vite, поэтому запускается иначе:

```bash
cd 3d-sites/portfolio/cinematic-portfolio
npm install
npm run dev      # локальный сервер, адрес выведется в терминал
npm run build    # сборка в dist/
```

Внутри каждого сайта лежит свой README с пошаговым гайдом: что и где заменить на свои тексты, контакты и цвета.

---

<div align="center">
<sub>Каждый сайт с вниманием к деталям: производительность, адаптив, доступность и чистая консоль.</sub>
</div>
