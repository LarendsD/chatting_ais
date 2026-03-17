# Актуальные ссылки для AnimateDiff Motion Models

## ⚠️ Проблема
Старая ссылка `https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.safetensors` возвращает 404.

## ✅ Рабочие ссылки

### 1. Через ComfyUI Manager (САМЫЙ ПРОСТОЙ СПОСОБ)
1. Установите ComfyUI Manager:
   ```bash
   cd /home/timyr/ComfyUI/custom_nodes
   git clone https://github.com/ltdrdata/ComfyUI-Manager.git
   ```
2. Запустите ComfyUI
3. Откройте ComfyUI Manager через веб-интерфейс
4. Найдите "AnimateDiff" в списке моделей
5. Нажмите "Download" - модель скачается автоматически

### 2. Прямое скачивание с HuggingFace

#### Репозиторий со всеми моделями:
- https://huggingface.co/guoyww/animatediff/tree/main

#### Рабочие прямые ссылки:

**Для SD 1.4:**
- https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v14.safetensors ✅ РАБОТАЕТ

**Для SD 1.5 (альтернативные версии):**
- https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15.safetensors (проверьте доступность)
- https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_beta.safetensors

**AnimateDiff V3 (новая версия, более оптимизирована):**
- Репозиторий: https://huggingface.co/guoyww/animatediff-motion-adapter-v3
- Файлы: https://huggingface.co/guoyww/animatediff-motion-adapter-v3/tree/main

### 3. Через Civitai
- https://civitai.com/models?query=AnimateDiff
- Ищите "AnimateDiff motion model" или "mm_sd_v15"

## 📥 Как скачать

### Вариант A: wget/curl
```bash
mkdir -p /home/timyr/ComfyUI/models/animatediff
cd /home/timyr/ComfyUI/models/animatediff

# Для SD 1.4 (гарантированно работает)
wget https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v14.safetensors
```

### Вариант B: HuggingFace CLI
```bash
pip install huggingface_hub
huggingface-cli download guoyww/animatediff mm_sd_v14.safetensors --local-dir /home/timyr/ComfyUI/models/animatediff
```

### Вариант C: Через браузер
1. Откройте https://huggingface.co/guoyww/animatediff/tree/main
2. Найдите нужный файл (например, `mm_sd_v14.safetensors`)
3. Нажмите на файл
4. Нажмите кнопку "Download"
5. Сохраните в `/home/timyr/ComfyUI/models/animatediff/`

## 🔧 Обновление кода

Если вы используете `mm_sd_v14.safetensors` вместо `mm_sd_v15_v2.safetensors`, обновите в коде:

В файле `generateVideoByPromt.ts` строка 229:
```typescript
'model_name': 'mm_sd_v14.safetensors',  // вместо mm_sd_v15_v2.safetensors
```

## 📋 Проверка после скачивания

```bash
# Проверьте наличие файла
ls -lh /home/timyr/ComfyUI/models/animatediff/

# Должен быть файл размером ~1.7GB
# Например: mm_sd_v14.safetensors или mm_sd_v15_v2.safetensors
```

## 💡 Рекомендации

1. **Для RTX 4070:** Используйте `mm_sd_v14.safetensors` - он точно работает и совместим с SD 1.5
2. **Для новых проектов:** Рассмотрите AnimateDiff V3 - он более оптимизирован
3. **Если ничего не работает:** Используйте ComfyUI Manager - он автоматически найдет правильные версии

## 🔗 Полезные ссылки

- Официальный репозиторий AnimateDiff: https://github.com/guoyww/animatediff
- ComfyUI AnimateDiff Evolved: https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved
- HuggingFace профиль автора: https://huggingface.co/guoyww
















