#!/bin/bash
cd ComfyUI
source comfy-env/bin/activate
python main.py # --lowvram --force-fp16 --disable-smart-memory
