# 📦 assets/ — папка для ваших файлов

Сейчас папка **намеренно пуста**, и это нормально: вся графика шаблона
(облака, небо, свечение, самолёт) рисуется кодом прямо в браузере.
Поэтому сайт ничего не скачивает и нет вопросов с лицензиями на картинки.

Если стандартного вида хватает — можете вообще сюда не заглядывать.

## Хочу настоящую 3D-модель самолёта

1. Найдите модель в формате **GLB** или **GLTF** (например, на [Sketchfab](https://sketchfab.com/) —
   проверьте лицензию) и положите её сюда: `assets/jet.glb`.
2. Откройте `js/scene.js` и найдите место, где вызывается `makeJet()` —
   это тот самый «нарисованный кодом» самолёт.
3. Замените его на загрузку своей модели через `GLTFLoader`
   (`three/addons/loaders/GLTFLoader.js` уже доступен — ничего дополнительно подключать не нужно):

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltf = await new GLTFLoader().loadAsync('assets/jet.glb');
const jet = gltf.scene; // дальше используйте вместо результата makeJet()
```

Скорее всего, придётся подстроить масштаб и поворот модели (`jet.scale`, `jet.rotation`).

## Хочу настоящее небо (HDRI-панораму)

1. Скачайте панораму в формате **HDR** — бесплатные и без ограничений есть на
   [Poly Haven](https://polyhaven.com/hdris) (ищите «sunrise» или «dawn»).
   Положите сюда: `assets/dawn_4k.hdr`.
2. В `js/scene.js` загрузите её через `RGBELoader` и назначьте в `scene.environment`
   вместо текущего PMREM-купола:

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const hdr = await new RGBELoader().loadAsync('assets/dawn_4k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdr;
scene.background = hdr; // если хотите видеть панораму и фоном
```

## Хочу свои облака

Положите сюда PNG-картинку облака **с прозрачностью** и загрузите её через
`THREE.TextureLoader` вместо текстуры из `makeCloudTexture()` в `js/scene.js`.

## ⚠️ Важно про тяжёлые файлы

Модели и HDRI весят много (мегабайты). Чтобы сайт не открывался «рывком»:

- загружайте их **до** старта сцены и учитывайте в прелоадере —
  в `js/main.js` добавьте свой промис загрузки в `ready`;
- по возможности сжимайте: для GLB есть [gltf.report](https://gltf.report/),
  для HDRI берите разрешение 2K вместо 4K, если не видно разницы.
