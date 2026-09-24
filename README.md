# KenyalangKu

A local-first company and portfolio website for Syahmir’s independent Malaysian game studio. The homepage is a standalone, framework-free HTML/CSS/Three.js Kenyalang journey. The existing company pages use Next.js 16, React 19, and TypeScript. Nothing has been published.

## Living Kenyalang homepage

The homepage opens with a compact black loading screen matching the supplied video: the circular hornbill logo spins above the Jawi wordmark `کڽالڠکو`, with a fine progress line and percentage. `public/night-walk/intro.js` tracks the essential images, local fonts, and first 3D render. It holds briefly for the introduction, fades out, and then starts the homepage animation. Reduced motion removes the spin and minimum hold. An eight-second timeout releases the page if a resource stalls; without JavaScript, the loader is hidden. `intro.css` controls the composition and timing.

The loading logo is a lossless WebP delivery derivative of the supplied `Kenyalangku.png` (identical to the existing circular logo). The Jawi wordmark uses a local Noto Naskh Arabic subset, including the Malay nya and nga characters, with its OFL license in `public/night-walk/fonts/NotoNaskhArabic-OFL.txt`. The spelling combines `کڽالڠ` (Kenyalang) with `کو` (ku); reference for the root spelling: [Bumi Kenyalang](https://p2k.stekom.ac.id/ensiklopedia/Sarawak). No font service is contacted at runtime.

`public/index.html` contains five chapters: The Beginning, Our Roots, Our Vision, Our Worlds, and Contact / Afterlight. The supplied infinity hornbill logo is traced into separate, extruded aperture, beak, and eye pieces. It assembles, unfolds into a head-led spline, travels through secondary landscape and atmospheric layers, and contracts into the infinity emblem at the end. No alternative bird or literal dragon anatomy is used.

- `public/night-walk/kenyalang.mjs`: original-logo extrusion, circulating aperture pieces, traveling spline, camera rig, materials, atmosphere, and coordinated background/foreground render passes. The transparent near pass lets selected pieces cross HTML; both passes are non-interactive.
- `public/night-walk/journey.mjs`: eased scroll timeline, chapter state, word reveals, accessible menu, pause, reduced motion, and WebGL recovery.
- `public/night-walk/journey.css`: responsive editorial compositions, grain, vignette, foreground occlusion, and local typography.
- `public/night-walk/assets/kenyalang-contours.json`: boundaries traced from the supplied infinity PNG by `scripts/trace-kenyalang.mjs`. The original PNG is preserved unchanged.
- `public/night-walk/assets/logo-emblem.svg`: traced static fallback, available when WebGL is unavailable.
- `public/night-walk/assets/myth-tanah.webp`: optimized delivery derivative of the existing Aras concept image, labelled as early concept material, not gameplay.
- `public/night-walk/ART-DIRECTION.md`: exact image-generation prompts and asset provenance.
- `public/night-walk/vendor/`: locally vendored Three.js r186 and required add-ons, with their MIT license. No CDN imports.

The experience uses no runtime framework, remote fonts, analytics, trackers, or build step. The existing Next server rewrites `/` to the static document and enables links to the company pages through a response header. Home links on those pages load the complete standalone document.

The shared footer uses a four-column sitemap, update-request card, compact follow card, and full-width KenyalangKu wordmark. Its styling lives in `public/night-walk/footer-9.css` and is used by both the standalone homepage and the React pages. The update-request form opens a prefilled email in the visitor's mail app; it does not subscribe anyone automatically. `components.json` is configured for the React Bits Pro registries with `REACTBITS_LICENSE_KEY`, but the licensed source block can only be installed after a Pro license key is added to the ignored `.env.local` file.

To run only the static experience, with Node.js and no dependency installation:

```powershell
node scripts/serve-experience.mjs
```

Open `http://127.0.0.1:4173/`. `npm run experience` is an equivalent shortcut. To check a GitHub Pages style repository subpath:

```powershell
$env:PORT='4174'
$env:BASE_PATH='/kenyalangku'
node scripts/serve-experience.mjs
```

Open `http://127.0.0.1:4174/kenyalangku/`. For static hosting, publish `public/index.html` with `public/night-walk/` together; every runtime import, font, and image path is relative. Static mode links company topics to sections in the experience. The separate company pages require the existing Next.js application. No publishing has been performed.

`node scripts/check-experience.mjs` parses inline scripts and modules and checks local references and anchors. Browser review covers desktop and 390 × 844, the complete five-chapter journey, pause, mobile navigation, keyboard focus, reduced motion, WebGL loss/recovery, local asset loading, and repository-subpath serving. Screenshots and the browser report are stored locally in `.cache/review/`.

Mobile uses 20 traveling blades instead of 34, fewer particles, lower pixel density, and no bloom pass. Reduced motion uses static chapter compositions and keeps all written content visible. The previous palace prototype is preserved in `.cache/palace-version/`; its older scene files and plates are retained but are not loaded by the current homepage.

## Run locally

```powershell
cd D:\kenyalangku
npm install
npm run dev
```

Open http://localhost:3000. If port 3000 is occupied, use the address printed by Next.js.

```powershell
npm run lint
npm run typecheck
npm run build
npm start
```

No API keys, database, or environment variables are needed. Manrope is bundled locally and self-hosted by Next.js; display headings use the system serif stack.

## Pages

- `/` — cinematic five-chapter Kenyalang infinity journey, projects, founder introduction, and contact.
- `/about` — editorial studio masthead, Syahmir’s introduction, expandable focus areas, and company purpose.
- `/projects` — PUSAKA and MYTH: TANAH.
- `/projects/pusaka` and `/projects/myth-tanah` — individual project pages.
- `/journal` — three opening studio perspectives; every entry has its own readable route.
- `/collaboration` — community, development technology, and creative/investor collaboration opportunities.
- `/contact` — direct email and a validated email composition form.
- Unknown paths — custom 404 page.

## Where to edit

- `src/lib/content.ts`: project copy, status, images, alt text, and journal entries.
- `src/components/StudioUI.tsx`: founder introduction, vision/mission/objective, project and journal cards.
- `src/components/PartnerSlider.tsx`: community/tool names, links, and carousel.
- `src/components/ContactForm.tsx`: email preparation. The recipient is also displayed in the contact page and footer.
- `public/index.html`: current homepage content. See the cinematic homepage section above for its scene, motion, and styles.
- `src/sections/StudioHero.tsx` and `src/experience/HeritageScene.tsx`: preserved earlier React hero, superseded by the standalone homepage rewrite.
- `app/globals.css`: shared theme, spacing, typography, mobile layouts, and reduced motion.
- `app/layout.tsx`: metadata and self-hosted font configuration.

Syahmir’s full biography and portrait are still pending. The current introduction uses only the supplied founder/project information. Replace the brand illustration in the About section when a portrait is available.

## Interaction and accessibility

The camera and Kenyalang spline share an eased scroll timeline, with subtle desktop pointer parallax. Motion can be paused. Reduced motion keeps static composed positions and the entire written story. Rendering rests behind the footer or when the browser tab is hidden. GPU resources are disposed on navigation. A traced static infinity emblem remains visible if WebGL cannot start or its context is lost.

The site includes semantic navigation, active-route indication, a skip link, visible focus styles, responsive mobile navigation with Escape support, labelled form controls, native validation, and reduced-motion CSS. Partner rotation is manual, with a live caption and focus handling.

## Contact behaviour

The form does **not** silently submit or pretend to deliver mail. It validates input, prepares an encoded `mailto:` link addressed to `kenyalangku@gmail.com`, and lets the visitor review/send with their email app. A copy-message option and plain-text preview are included. No messages are persisted or sent to a third-party service. Direct server-side delivery would need a separately configured mail service later.

## Art and references

- The supplied KenyalangKu hornbill PNG is used unchanged. Its SHA-256 matches the user attachment. `public/brand-icon.png` is a resized favicon derivative.
- PUSAKA uses an original local SVG illustration, clearly labelled an art direction study, not gameplay. Replace its image entry in `src/lib/content.ts` when real project art is supplied.
- MYTH: TANAH’s Aras, palace, and landscape imagery were already present in this repository. They are treated as concept material; they are not proof of finished gameplay. Confirm final asset provenance before public release.
- The 3D pavilion and fallback illustration are original stylised work inspired by Malay timber architecture; they are not architectural reconstructions of a named building.
- KrackedDevs’ mark was obtained from `https://krackeddevs.com/landing-v3/kdlogodev.svg`; its website is linked. The logo is styled monochrome within the interface.
- Unreal Engine is presented as development technology, using text and a generic 3D cube icon. No Epic Games partnership or endorsement is claimed.
- Experience reference: https://mengto.github.io/kage/ and https://github.com/MengTo/kage — live 3D, atmosphere, and editorial composition. No source code copied.
- About layout reference: https://collectui.com/designs/about-us-ui-design-inspiration/f6cc125d-5dfd-413a-810b-b756b846b475 — oversized studio masthead and a profile/focus panel, adapted to one founder and KenyalangKu’s palette.
- Opening journal copy was drafted for this local preview from the supplied company vision and project descriptions. Review editorial wording before publication.

## Future Vercel setup

Use the standard Next.js preset, `npm run build`, and the repository root. Company pages are prerendered; the homepage is served as a static document with local ES modules. No deployment command, Git push, or public release has been performed. Configure a real domain and absolute social metadata when publishing.

Local browser review screenshots and temporary tooling live under `.cache/`, which is ignored by Git. `agent-browser` is a development-only browser review dependency.
