# Исправление ошибки "AnimateDiffLoader does not exist"

## Проблема
Ошибка: `Cannot execute because node AnimateDiffLoader does not exist.`

## Причина
В AnimateDiff Evolved используются другие названия нод, чем в старых версиях AnimateDiff.

## Решение
Код обновлен с правильными названиями нод для AnimateDiff Evolved:

### Старые названия (не работают):
- `AnimateDiffLoader` ❌
- `AnimateDiffModelLoader` ❌

### Новые названия (работают):
- `ADE_LoadAnimateDiffModel` ✅ - загрузка motion model
- `ADE_ApplyAnimateDiffModelSimple` ✅ - применение motion model
- `ADE_UseEvolvedSampling` ✅ - применение AnimateDiff к модели

## Обновленный workflow

1. **CheckpointLoaderSimple** - загружает базовую модель SD
2. **ADE_LoadAnimateDiffModel** - загружает motion model (`mm_sd_v14.safetensors`)
3. **ADE_ApplyAnimateDiffModelSimple** - применяет motion model
4. **ADE_UseEvolvedSampling** - применяет AnimateDiff к модели
5. **KSampler** - семплинг
6. **VAEDecode** - декодирование
7. **CreateVideo** - создание видео
8. **SaveVideo** - сохранение

## Важно

- Используется `mm_sd_v14.safetensors` вместо `mm_sd_v15_v2.safetensors` (так как v2 недоступен)
- Motion model должен быть скачан в: `ComfyUI/models/animatediff/mm_sd_v14.safetensors`

## Проверка

После обновления кода проверьте:
1. Motion model скачан: `ls ComfyUI/models/animatediff/mm_sd_v14.safetensors`
2. ComfyUI перезапущен
3. Ноды AnimateDiff видны в интерфейсе

Код готов к использованию! 🎬
















