# Creative Doodles 🎨

A small, playful website theme — colorful blob characters with googly eyes
that follow your cursor, floating shapes in the background, and a real,
working **live weather widget** (no AI, just a free public weather API).

## Files
```
creative-doodles/
├── index.html   → page structure
├── style.css    → colors, blob shapes, layout, animations
├── script.js    → googly-eye tracking + weather widget logic
└── README.md    → this file
```

## How to run it (3 steps)
1. Unzip the folder anywhere on your computer.
2. Double-click `index.html` — it opens directly in your browser. No install, no server needed.
3. Move your mouse around to see the eyes follow it, then scroll to "Doodle Weather"
   and search a city (or click "Use my location") to see live temperature.

## How to put it online (optional)
- Easiest: drag the whole folder into **Netlify Drop** (netlify.com/drop) — gives you a live link in seconds.
- Or upload the 3 files to any static host (GitHub Pages, Vercel, cPanel, etc.) — no build step required.

## How it was built — step by step
1. **Reference gathered from your pin**: dark navy background, bright doodle-colored
   blobs (coral, orange, sky blue, mint, near-black), white googly eyes, scattered stars.
2. **`index.html`** — hero section, a "Doodle Weather" tool section, and an "about" section
   explaining what's real vs. decorative.
3. **`style.css`** — defined the color palette and blob shape as CSS variables, then built
   the eyes/pupils/mouth as layered circles, plus a slow drifting star/shape background animation.
4. **`script.js`** — three independent pieces:
   - generates the floating background shapes,
   - creates each hero blob + makes its pupils track the mouse (`atan2` + distance clamp),
   - the weather widget: calls **Open-Meteo's** free geocoding API to turn a city name into
     coordinates, then its free forecast API to get live temperature + conditions — and
     changes the widget's face/color based on how hot or cold it is.
5. Packaged all of it into this zip.

## Customize it
- Change colors: edit the hex values at the top of `style.css` under `:root`.
- Add more characters: copy a line in the `config` array inside `script.js`'s `heroCharacters()`.
- Swap the useful widget for something else later (currency, a timer, etc.) — the
  googly-eye/blob styling in `style.css` can be reused as-is.
