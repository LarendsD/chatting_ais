# Инструкция по установке инструментов для генерации видео

> ⚠️ **ВАЖНО:** Если ссылка на AnimateDiff motion model не работает (404), см. файл `ANIMATEDIFF_LINKS.md` с актуальными рабочими ссылками.

## 1. ComfyUI

### Установка ComfyUI:
```bash
cd /home/timyr
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

**Ссылка:** https://github.com/comfyanonymous/ComfyUI

---

## 2. AnimateDiff для ComfyUI

### ⚠️ Установка вручную (РЕКОМЕНДУЕТСЯ)

Если ComfyUI Manager выдает ошибку безопасности, установите вручную:

```bash
cd /home/timyr/ComfyUI/custom_nodes
git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved.git
```

После установки перезапустите ComfyUI.

### Установка через ComfyUI Manager (если нет ограничений):

1. Установите ComfyUI Manager:
```bash
cd /home/timyr/ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
```

2. Запустите ComfyUI и через веб-интерфейс установите AnimateDiff через Manager

**⚠️ Если получаете ошибку:** `'AnimateDiff': With the current security level configuration, only custom nodes from the "default channel" can be installed.`

**Решение:** Используйте ручную установку через git (см. выше).

**Ссылки:**
- ComfyUI Manager: https://github.com/ltdrdata/ComfyUI-Manager
- AnimateDiff Evolved: https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved

---

## 3. Модель Stable Diffusion 1.5

### Скачать модель:
**Файл:** `v1-5-pruned-emaonly.safetensors`

**Ссылки для скачивания:**
- Hugging Face (официальный): https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
- Civitai: https://civitai.com/models/6424/stable-diffusion-v15
- Прямая ссылка: https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors

**Куда положить:**
```
/home/timyr/ComfyUI/models/checkpoints/v1-5-pruned-emaonly.safetensors
```

---

## 4. AnimateDiff Motion Model

### Скачать motion model:
**Файл:** `mm_sd_v15_v2.safetensors` или альтернативные версии

**⚠️ ВАЖНО:** Старая ссылка больше не работает (404). Используйте один из вариантов:

**Вариант 1 - Через ComfyUI Manager (РЕКОМЕНДУЕТСЯ):**
1. Запустите ComfyUI
2. Откройте ComfyUI Manager (если не установлен, см. раздел 2)
3. Найдите "AnimateDiff" в списке моделей
4. Нажмите "Download" - модель скачается автоматически

**Вариант 2 - Прямое скачивание с HuggingFace:**
- Репозиторий со всеми моделями: https://huggingface.co/guoyww/animatediff/tree/main
- Альтернативная рабочая ссылка (v14): https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v14.safetensors
- AnimateDiff V3 (новая версия): https://huggingface.co/guoyww/animatediff-motion-adapter-v3

**Вариант 3 - Через Civitai:**
- https://civitai.com/models?query=AnimateDiff
- Ищите "AnimateDiff motion model"

**Куда положить:**
```
/home/timyr/ComfyUI/models/animatediff/mm_sd_v15_v2.safetensors
```
или
```
/home/timyr/ComfyUI/models/animatediff/mm_sd_v14.safetensors
```

Создайте папку, если её нет:
```bash
mkdir -p /home/timyr/ComfyUI/models/animatediff
```

**Примечание:** Если файл `mm_sd_v15_v2.safetensors` недоступен, используйте `mm_sd_v14.safetensors` или любую другую версию из репозитория. Также можно использовать AnimateDiff V3, который более оптимизирован для новых видеокарт.

---

## 5. VAE (опционально, но рекомендуется)

Для лучшего качества можно использовать VAE:
**Файл:** `vae-ft-mse-840000-ema-pruned.safetensors`

**Ссылка:**
- https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.safetensors

**Куда положить:**
```
/home/timyr/ComfyUI/models/vae/vae-ft-mse-840000-ema-pruned.safetensors
```

---

## Быстрая установка (скрипт)

Создайте файл `setup_video_gen.sh`:

```bash
#!/bin/bash

# Создаем директории
mkdir -p /home/timyr/ComfyUI/models/checkpoints
mkdir -p /home/timyr/ComfyUI/models/animatediff
mkdir -p /home/timyr/ComfyUI/models/vae
mkdir -p /home/timyr/ComfyUI/custom_nodes

# Устанавливаем ComfyUI (если еще не установлен)
if [ ! -d "/home/timyr/ComfyUI" ]; then
    cd /home/timyr
    git clone https://github.com/comfyanonymous/ComfyUI.git
    cd ComfyUI
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    pip install -r requirements.txt
fi

# Устанавливаем AnimateDiff
cd /home/timyr/ComfyUI/custom_nodes
if [ ! -d "ComfyUI-AnimateDiff-Evolved" ]; then
    git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved.git
fi

# Скачиваем модели
cd /home/timyr/ComfyUI/models/checkpoints
if [ ! -f "v1-5-pruned-emaonly.safetensors" ]; then
    wget https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
fi

cd /home/timyr/ComfyUI/models/animatediff
if [ ! -f "mm_sd_v15_v2.safetensors" ]; then
    wget https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.safetensors
fi

cd /home/timyr/ComfyUI/models/vae
if [ ! -f "vae-ft-mse-840000-ema-pruned.safetensors" ]; then
    wget https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.safetensors
fi

echo "Установка завершена!"
echo "Запустите ComfyUI: cd /home/timyr/ComfyUI && python main.py"
```

---

## Запуск ComfyUI

```bash
cd /home/timyr/ComfyUI
python main.py --listen 0.0.0.0 --port 8188
```

Или для локального использования:
```bash
python main.py --port 8188
```

---

## Проверка установки

После установки проверьте наличие файлов:

```bash
# Проверка модели SD 1.5
ls -lh /home/timyr/ComfyUI/models/checkpoints/v1-5-pruned-emaonly.safetensors

# Проверка motion model
ls -lh /home/timyr/ComfyUI/models/animatediff/mm_sd_v15_v2.safetensors

# Проверка AnimateDiff
ls -d /home/timyr/ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved
```

---

## Альтернативные модели (если нужны другие варианты)

### Другие motion models AnimateDiff:
- `mm_sd_v14.safetensors` - для SD 1.4 (рабочая ссылка: https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v14.safetensors)
- `mm_sd_v15.safetensors` - альтернатива v2
- AnimateDiff V3 - новая версия (https://huggingface.co/guoyww/animatediff-motion-adapter-v3)

**Ссылка на все модели:** 
- Основной репозиторий: https://huggingface.co/guoyww/animatediff/tree/main
- V3 репозиторий: https://huggingface.co/guoyww/animatediff-motion-adapter-v3

### Другие чекпоинты SD:
- SD 1.4: https://huggingface.co/CompVis/stable-diffusion-v-1-4-original
- SD 2.1: https://huggingface.co/stabilityai/stable-diffusion-2-1

---

## Размеры файлов

- `v1-5-pruned-emaonly.safetensors`: ~4 GB
- `mm_sd_v15_v2.safetensors`: ~1.7 GB
- `vae-ft-mse-840000-ema-pruned.safetensors`: ~335 MB

**Общий размер:** ~6 GB

---

## Требования к системе

- **GPU:** NVIDIA RTX 4070 (12GB VRAM) - ✅ подходит
- **RAM:** минимум 16GB (рекомендуется 32GB)
- **Диск:** минимум 20GB свободного места
- **CUDA:** версия 12.1+ (для PyTorch)

---

## Полезные ссылки

- ComfyUI документация: https://github.com/comfyanonymous/ComfyUI
- AnimateDiff документация: https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved
- Hugging Face модели: https://huggingface.co/models

