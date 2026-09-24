# Artwork provenance

The current five-chapter Kenyalang experience traces the supplied infinity-logo PNG into 3D geometry; the logo was not regenerated. The original PNG and traced contours are local. MYTH: TANAH uses the existing Aras concept image. The older foreground composition is a subdued supporting layer. The palace and garden plates below belong to the previous prototype and are no longer loaded by the homepage.

## Previous palace prototype

Generated with the built-in image_gen tool (not the CLI/API fallback). Delivered assets stay in this project. Image conversion to WebP preserves alpha; no runtime image service is used.

- `assets/palace.webp`: cinematic palace plate, 1536 x 1024.
- `assets/garden.webp`: cinematic wakaf/garden plate, 1536 x 1024.
- `assets/foreground.webp`: one transparent editorial foreground composition, 1774 x 887; includes grasses, branches, stones, carved ruin, bushes, distant hills/pines, a lantern, and the user-supplied batik, bunga raya, and kenyalang motifs. Alpha is retained in WebP.
- `assets/*-reference.png`: unchanged copies of the user's supplied references.
- `assets/brand.png`: supplied company logo, unchanged.
- `assets/brand.webp`: 128-pixel lossless WebP delivery derivative of the logo, used in the masthead and favicon to keep the first load small.

The plates are original concept artwork for the studio world, not project screenshots or documentary depictions of a historical palace. The world itself is procedural Three.js geometry and never uses these plates as a substitute for camera motion. A plate is used as an accessible fallback when WebGL is unavailable.

## Exact prompts

### Palace — generate

Use case: stylized-concept. Create one cinematic environmental concept-art still for the KenyalangKu website, landscape 1536x1024. Fictional traditional Malay Melaka Sultanate timber palace at night, sprawling dark wooden rumah limas / bumbung panjang layered pitched gable roofs, pointed carved Malay ridge ends, delicate carved timber ventilation screens, warm amber lit windows, high stilts and broad stone steps, intricately carved Kelantan wooden gateway in foreground, wet stone paving, tropical garden, low blue-charcoal mist, faint rainfall, a very large muted vermilion red moon behind the palace. View from a low path looking toward the palace, palace arranged mainly on the right, dark atmospheric space on left. Photoreal high-end game environment matte painting, deep blacks, cold moonlight and restrained amber lanterns. No Japanese or Chinese architecture, no torii, no text, no people, no logos, no excessive glow. This is a fictional cultural world, not a real archaeological reconstruction.

### Garden — generate

Use case: stylized-concept. One wide cinematic environmental concept-art still, 1536x1024, for a Malay cultural game studio website. Intimate nighttime view across a still black garden pond toward a traditional Malay wooden wakaf gazebo, tiered steep timber roof with carved pointed tunjuk langit finials. Hanging amber oil lanterns, carved timber railings, wet stepping stones, tropical grasses, a hibiscus bush at edge, sprawling ancient tree. In distance a Melaka Sultanate inspired timber palace, soft cold blue-charcoal mist with dim vermilion moon. 35mm lens, editorial art-book composition, exquisite natural material detail, dark filmic palette with warm amber, deep red and bone highlights. No people, no text, no Japanese torii, no shoji. Create original concept artwork, landscape.

### Foreground — compositing edit

Inputs: batik.png, bunga-raya.png, kenyalang.png supplied by the user.

Use case: compositing. Create ONE wide horizontal foreground garland/collage asset for a cinematic Malay palace website. GENUINELY TRANSPARENT background with alpha, no white or black backdrop or checkerboard. Image1 is the exact geometric textile reference, image2 the exact ornate bunga raya design reference, image3 the exact linear hornbill reference. Preserve their distinct motif identities faithfully in a single decorative composition. The whole garland occupies the bottom third with a big empty transparent area above: on left dark wet stones, wispy grasses and bushes, a weathered carved wooden ruin wall and a partial blue-magenta batik textile strip tucked along bottom edge; at right the red and gold stylized bunga raya motif among real dark green leaves and a hanging warm amber timber lantern; the linear kenyalang hornbill motif in warm bone color perches on the small wall. Add a few fine branches with dark vermilion maple-like leaves at far edge, a few distant desaturated miniature hill silhouettes and pines as art-book collage elements. The composite is broad and low, foliage frames corners but leaves center and upper two thirds transparent. Rich fine detail, restrained night lighting, near-black blue-charcoal and muted gold/bone/red. Do not add words. Main purpose is real transparent cutout to overlay a 3D scene. No rectangle or opaque background.
