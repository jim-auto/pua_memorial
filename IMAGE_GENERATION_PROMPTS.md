# Image Generation Prompts

API keyなしで、ChatGPT Images / Scenario / PixelLab などにそのまま投げるための素材生成メモです。

## Output Files

生成した画像は以下の名前で保存してください。アプリ側はこの名前を自動で読みにいきます。

```text
public/assets/visual-novel/scene-shibuya-neutral.png
public/assets/visual-novel/scene-shibuya-good.png
public/assets/visual-novel/scene-shibuya-bad.png
public/assets/visual-novel/scene-kabukicho-neutral.png
public/assets/visual-novel/scene-kabukicho-good.png
public/assets/visual-novel/scene-kabukicho-bad.png
public/assets/visual-novel/scene-ikebukuro-neutral.png
public/assets/visual-novel/scene-ikebukuro-good.png
public/assets/visual-novel/scene-ikebukuro-bad.png
public/assets/visual-novel/scene-club-neutral.png
public/assets/visual-novel/scene-club-good.png
public/assets/visual-novel/scene-club-bad.png
public/assets/visual-novel/bg-shibuya-night.png
public/assets/visual-novel/man-neutral.png
public/assets/visual-novel/woman-neutral.png
public/assets/visual-novel/woman-good.png
public/assets/visual-novel/woman-bad.png
```

推奨サイズ:

```text
Complete scenes: 1280x720 or 1920x1080 PNG
Background: 1920x1080 PNG
Characters: 1400x2200 PNG, transparent background
```

## Fast Path: Complete Scene Images

APIキーなしで今すぐ反映したい場合は、まずこの3枚だけ作ればOKです。

```text
scene-shibuya-neutral.png
scene-shibuya-good.png
scene-shibuya-bad.png
```

このrepoでは `npm run generate:art` で Pollinations の no-key 画像生成エンドポイントから場所別の complete scene 画像を作ります。既存の `scene-neutral.png`, `scene-good.png`, `scene-bad.png` は互換用です。

## Shared Style

最初にサービス側へこのスタイル指定を入れてから、各プロンプトを使うと揃いやすいです。

```text
Modern Japanese visual novel game art, polished 2D illustration, semi-realistic anime style, clean line art, soft painterly shading, cinematic lighting, expressive but natural faces, adult characters, no brand logos, no readable text, no watermark, no UI, no speech bubbles.
```

## 1. Background

Use this for `bg-shibuya-night.png`.

```text
Create a 1920x1080 background image for a modern Japanese visual novel game.

Scene:
Night street near Shibuya, Tokyo, after light rain. Wet pavement with neon reflections, crosswalk lines, storefront glow, soft city haze, distant pedestrians as vague silhouettes only, no main characters.

Composition:
Wide cinematic shot, eye-level camera, open space in the lower center for two standing character sprites. The left and right sides should have enough contrast for full-body characters to stand in front. No text, no readable signs, no brand logos.

Style:
Modern Japanese visual novel background, polished 2D illustration, semi-realistic anime style, rich but not noisy detail, clean perspective, moody teal, amber, rose, and indigo lighting.

Avoid:
Photorealism, distorted buildings, readable store names, huge empty gradient backgrounds, dark muddy colors, overblown blur, extra main characters, watermark.
```

## 2. Male Character

Use this for `man-neutral.png`.

```text
Create a transparent-background full-body character sprite for a modern Japanese visual novel game.

Subject:
A young adult Japanese man, early 20s, average height and slim build, casual dark jacket over a simple shirt, clean but slightly nervous expression, holding a smartphone loosely in one hand. He should feel like the player-side character in a nighttime street conversation.

Pose:
Standing three-quarter view, body angled slightly toward the right, natural posture, one hand relaxed, one hand holding phone. Full body visible from head to shoes.

Style:
Modern Japanese visual novel character art, polished 2D illustration, semi-realistic anime style, clean line art, soft painterly shading, cinematic rim light from neon signs.

Output:
Transparent PNG, no background, no text, no watermark.

Avoid:
Overly heroic pose, exaggerated muscles, childish look, luxury fashion, weapons, logos, extra props, cropped feet, malformed hands.
```

## 3. Female Character Neutral

Use this for `woman-neutral.png`. After this image is good, reuse it as the reference for the good/bad variants.

```text
Create a transparent-background full-body character sprite for a modern Japanese visual novel game.

Subject:
A young adult Japanese woman, early 20s, average height and slim build, cream or light beige coat, dark skirt or simple dark outfit underneath, shoulder-length dark hair, calm but guarded neutral expression. She should feel like someone deciding whether to continue a street conversation.

Pose:
Standing three-quarter view, body angled slightly toward the left, natural guarded posture, holding a smartphone near her side. Full body visible from head to shoes.

Style:
Modern Japanese visual novel character art, polished 2D illustration, semi-realistic anime style, clean line art, soft painterly shading, cinematic rim light from neon signs. Match the male character style.

Output:
Transparent PNG, no background, no text, no watermark.

Avoid:
Oversexualized clothing, childish look, huge fantasy outfit, logos, extra props, cropped feet, malformed hands.
```

## 4. Female Character Good

Use `woman-neutral.png` as the reference image if the tool supports references. Save as `woman-good.png`.

```text
Using the provided woman-neutral character as a strict reference, create a good-reaction variant.

Keep unchanged:
Same character identity, same outfit, same hairstyle, same body proportions, same art style, same transparent background, same full-body framing.

Change only:
Make her expression warmer and more open. Add a small natural smile, relaxed eyebrows, slightly softer shoulders, and a posture that feels a little more comfortable continuing the conversation.

Output:
Transparent PNG, no background, no text, no watermark.

Avoid:
Changing the outfit, changing the hairstyle, changing the age, changing the character identity, exaggerated grin, romantic pose, cropped body.
```

## 5. Female Character Bad

Use `woman-neutral.png` as the reference image if the tool supports references. Save as `woman-bad.png`.

```text
Using the provided woman-neutral character as a strict reference, create a cautious/bad-reaction variant.

Keep unchanged:
Same character identity, same outfit, same hairstyle, same body proportions, same art style, same transparent background, same full-body framing.

Change only:
Make her expression guarded and uncomfortable. Add slightly tense eyebrows, a smaller mouth, body angled a little away, and posture that suggests she wants more distance.

Output:
Transparent PNG, no background, no text, no watermark.

Avoid:
Changing the outfit, changing the hairstyle, changing the age, changing the character identity, extreme fear, crying, anger, cropped body.
```

## If Using Pixel Art Instead

Pixel artに振り切る場合は、上の素材名は同じで、すべて以下のスタイルに置き換えて生成します。

```text
High-quality 2D pixel art game asset, 32-bit era inspired, clean readable silhouette, limited but rich color palette, crisp pixel edges, no anti-aliased painterly brushwork, transparent background for characters, no text, no watermark.
```

ただし、このゲームではビジュアルノベル風の方が会話の表情差分を見せやすいです。

## Quality Checklist

- 背景に読める文字や実在ブランドが入っていない
- 男と女の絵柄が揃っている
- キャラは全身で、足先が切れていない
- 女キャラ3枚で服・髪型・体格が変わっていない
- 透過PNGになっている
- スマホや手が破綻していない
- 遠目でも表情差分が分かる
