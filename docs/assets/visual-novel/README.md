# Visual Novel Assets

Put generated PNG assets here with these exact filenames:

```text
scene-neutral.png
scene-good.png
scene-bad.png
bg-shibuya-night.png
man-neutral.png
woman-neutral.png
woman-good.png
woman-bad.png
```

The app automatically tries complete scene files first. If they are missing, it tries layered background/character files. If those are also missing, it falls back to the built-in SVG scene.

Recommended sizes:

```text
scene-*.png          1280x720 or 1920x1080
bg-shibuya-night.png  1920x1080
character PNGs       around 1400x2200, transparent background
```

Prompts are in `IMAGE_GENERATION_PROMPTS.md`.
