# 📦 assets/ — папка для ваших файлов

Сейчас папка **намеренно пуста**, и это нормально: вся графика шаблона
(стол, тарелка, подача, бокал, капля, пар, свеча) рисуется кодом прямо в браузере.
Поэтому сайт ничего не скачивает и нет вопросов с лицензиями на картинки.

Если стандартного вида хватает — можете вообще сюда не заглядывать.

## Хочу настоящую 3D-модель блюда

1. Найдите модель в формате **GLB** или **GLTF** (например, на [Sketchfab](https://sketchfab.com/) —
   проверьте лицензию) и положите её сюда: `assets/dish.glb`.
2. Откройте `js/scene.js` и найдите место, где вызывается `makePlate()` —
   это та самая «нарисованная кодом» тарелка с подачей.
3. Замените его на загрузку своей модели через `GLTFLoader`
   (`three/addons/loaders/GLTFLoader.js` уже доступен — ничего дополнительно подключать не нужно):

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltf = await new GLTFLoader().loadAsync('assets/dish.glb');
const plate = gltf.scene; // дальше используйте вместо результата makePlate()
plate.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
```

Скорее всего, придётся подстроить масштаб и поворот модели (`plate.scale`, `plate.rotation`).

## Хочу настоящие отражения (HDRI-панораму зала)

1. Скачайте панораму в формате **HDR** — бесплатные и без ограничений есть на
   [Poly Haven](https://polyhaven.com/hdris) (ищите «restaurant», «interior» или тёплый интерьер).
   Положите сюда: `assets/room_2k.hdr`.
2. В `js/scene.js` загрузите её через `RGBELoader` и назначьте в `scene.environment`
   вместо текущего PMREM-купола (`makeEnvScene`):

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const hdr = await new RGBELoader().loadAsync('assets/room_2k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdr; // фон оставьте тёмным — интимнее
```

## Хочу свою текстуру (дерево стола, фарфор тарелки)

Положите сюда картинку (JPG/PNG/WebP) и загрузите её через `THREE.TextureLoader`,
назначив в `.map` нужного материала в `js/scene.js` (например, столу в `table` или
тарелке в `makePlate`). Не забудьте `texture.colorSpace = THREE.SRGBColorSpace` для цветных карт.

## ⚠️ Важно про тяжёлые файлы

Модели и HDRI весят много (мегабайты). Чтобы сайт не открывался «рывком»:

- загружайте их **до** старта сцены и учитывайте в прелоадере —
  в `js/main.js` добавьте свой промис загрузки в `ready`;
- по возможности сжимайте: для GLB есть [gltf.report](https://gltf.report/),
  для HDRI берите разрешение 2K вместо 4K, если не видно разницы.
