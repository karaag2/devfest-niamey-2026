# DevFest Niamey 2026 — Pack de prompts (images, vidéos, landing page)

> Concept : **Niamey Live Build** — la ville se construit bloc par bloc, puis s'allume en festival.
> Les infos de l'événement sont **fictives** et à remplacer.

---

## 0. Bible visuelle (verrouillée)

### Concept

Le scroll de la landing raconte une journée :

- **Le matin (build)** : des blocs colorés tombent du ciel et assemblent Niamey (le fleuve, le pont, le marché).
- **Le coucher du soleil (deploy)** : la ville est terminée et la foule arrive.
- **La nuit (run)** : tout devient scène de festival, avec faisceaux, confettis et écrans géants.

Le grand public voit une ville qui devient une fête. Les devs voient un `build → deploy → run` caché dans toute la page.

### Infos fictives (à remplacer)

| Champ | Valeur |
|---|---|
| Événement | DevFest Niamey 2026, par GDG Niamey |
| Date | Samedi 12 décembre 2026 |
| Lieu | Palais des Congrès, Niamey |
| Slogan | « Niamey compile le futur » |
| Tracks | Web · Mobile & Flutter · Cloud · IA & Gemini · Carrière & Communauté |
| Chiffres | 500+ participants · 20 speakers · 1 journée |

### Palette

| Rôle | Couleur |
|---|---|
| Bleu Google | `#4285F4` |
| Rouge Google | `#EA4335` |
| Jaune Google | `#FBBC04` |
| Vert Google | `#34A853` |
| Neutre jour (sable) | `#F1E6D3` |
| Neutre nuit (anthracite) | `#202124` |

**Règle** : chaque image a une couleur dominante. Les 3 autres restent des accents sous 15 % de la surface.

| Section | Moment | Dominante |
|---|---|---|
| Hero | Aube, la ville se construit | Bleu |
| À propos | Matin, le marché s'assemble | Jaune |
| Tracks | Midi, 5 îlots | Une couleur par track |
| Speakers | Coucher de soleil, la scène se monte | Rouge |
| Programme | Soirée, la foule traverse le pont | Vert |
| Billetterie | Nuit, le festival explose | Bleu nuit + faisceaux aux 4 couleurs |
| Footer | Fin de nuit, la ville dort | Anthracite |

### Règles propres au web

1. **Pas de texte dans les images.** Les titres sont en HTML. Seule exception : les micro-textes d'easter eggs (à retoucher si le générateur les rate).
2. **Zone vide obligatoire** : environ 40 % d'espace calme (ciel, sable, eau) pour poser le texte.
3. **Deux formats** : 16:9 pour le desktop, 9:16 pour le mobile, avec le sujet recentré.
4. **Calques détachables** générés seuls pour le parallax.
5. **Cohérence** : I01 sert de référence de style (image-to-image ou référence de style) pour toutes les autres images.
6. **Logo GDG/DevFest** : intégré en code depuis les fichiers officiels, jamais généré.

### Easter eggs sur 3 niveaux

1. **Dans les images** : du code sur les objets (plaques, gravures, formes).
2. **Dans les vidéos** : des détails d'une seconde (curseur, bloc qui « compile », lampadaire qui bug).
3. **Dans le site** : un message console, un Konami code, des commentaires dans le source.

---

## 1. Blocs à réutiliser

À ajouter à la fin de **chaque** prompt image :

```
STYLE LOCK:
Premium stylized 3D render, collectible miniature diorama aesthetic, matte ceramic and satin plastic building blocks, realistic sun-dried banco mud-brick textures on Sahelian architecture, subtle tilt-shift depth of field, soft global illumination, crisp directional shadows, cinematic composition, ultra detailed. Strict color palette: Google blue #4285F4, red #EA4335, yellow #FBBC04, green #34A853, with warm sand #F1E6D3 neutrals for day scenes or deep charcoal #202124 and midnight blue for night scenes. Stylized figurines with simplified faces, young and diverse, wearing boubous, wax-print fabrics, hoodies and plain t-shirts.
```

Dans le champ négatif (ou en fin de prompt) :

```
NEGATIVE:
text, letters, watermark, logo, brand marks, photorealistic faces, rainbow gradients, clip-art style, flat vector look, snow, dense tropical jungle, distorted architecture, cluttered composition, blurry subject, oversaturated neon
```

À ajouter à la fin de **chaque** prompt vidéo :

```
VIDEO LOCK:
Use the reference image as the exact first frame. Preserve composition, palette, lighting, architecture, figurines and the empty text area. Smooth, slow, premium motion with ease-in-out timing. No cuts, no handheld shake, no new objects, no text appearing, no logo, no morphing of buildings. Silent video, no music, no voice.
```

---

## 2. Prompts images

### [I01] Hero — L'aube, la ville se compile

- **Format** : 16:9, puis 9:16
- **Dominante** : bleu
- **Zone texte** : les 40 % supérieurs (ciel)

```
Wide aerial three-quarter view of Niamey along the Niger River at dawn, the city is being assembled in real time: glossy blue building blocks fall from the pale sky and snap into place to form banco houses, the Grand Mosque minaret and the Kennedy bridge, whose last segments float in mid-air waiting to lock in. Soft early blue light, first golden rays on the horizon, mist on the river. A tall construction crane holds one block shaped like a curly brace. A tiny taxi on the riverbank road. Upper 40% of the frame is calm empty dawn sky for a headline. Strong foreground-middle-background depth.
```

- **Easter eggs** : le bloc `{` sur la grue, la plaque `404` sur le taxi.
- **Mobile** : cadrage vertical sur le minaret et la grue, avec le pont qui sort en bas du cadre.

### [I02] À propos — Le matin, le Grand Marché s'assemble

- **Format** : 16:9, puis 9:16
- **Dominante** : jaune
- **Zone texte** : le tiers gauche (mur de banco nu)

```
Close miniature diorama of a Niamey market square in bright morning light, market stalls built from yellow blocks clicking together, shade canopies in yellow fabric, calabashes, woven baskets and spice pyramids. Vendors and young people with laptops and phones mingle, some sitting on stools coding next to a tea seller. One stall displays glass jars of cookies. Left third of the frame is a clean sunlit banco wall with soft shadows, empty for text. Warm, friendly, lively atmosphere.
```

- **Easter eggs** : les bocaux de `cookies`, le vendeur de thé à côté d'un laptop.
- **Mobile** : on garde l'étal de cookies et le vendeur de thé, avec le mur en haut.

### [I03] Tracks — 5 îlots flottants (une image par track)

- **Format** : 1:1, fond sable uni (pour des cartes interactives)

Template commun :

```
Single floating miniature island diorama, chunk of sand and banco ground hovering in the air with small rocks dropping beneath, isolated on a plain warm sand #F1E6D3 background, soft studio light, gentle shadow below. On the island: [SUJET]. Dominant color [COULEUR], other Google colors as tiny accents only.
```

#### [I03-A] Web — Rouge

```
Single floating miniature island diorama, chunk of sand and banco ground hovering in the air with small rocks dropping beneath, isolated on a plain warm sand #F1E6D3 background, soft studio light, gentle shadow below. On the island: a small banco house with arched doorways shaped like angle brackets, windows shaped like browser tabs, a red block staircase. Dominant color red #EA4335, other Google colors as tiny accents only.
```
Easter egg : les arches en `< >`.

#### [I03-B] Mobile & Flutter — Bleu

```
Single floating miniature island diorama, chunk of sand and banco ground hovering in the air with small rocks dropping beneath, isolated on a plain warm sand #F1E6D3 background, soft studio light, gentle shadow below. On the island: a giant smartphone slab standing like a monument on a tiny square, figurines tapping on it, a blue butterfly fluttering above. Dominant color blue #4285F4, other Google colors as tiny accents only.
```
Easter egg : le papillon pour *flutter*.

#### [I03-C] Cloud — Sable et blanc

```
Single floating miniature island diorama, chunk of sand and banco ground hovering in the air with small rocks dropping beneath, isolated on a plain warm sand #F1E6D3 background, soft studio light, gentle shadow below. On the island: a traditional Sahelian granary with a soft white cloud tied to its roof by ropes, glowing server lights visible through the granary opening. Dominant colors warm sand and white, Google colors as tiny accents only.
```
Easter egg : le grenier qui sert de stockage.

#### [I03-D] IA & Gemini — Jaune

```
Single floating miniature island diorama, chunk of sand and banco ground hovering in the air with small rocks dropping beneath, isolated on a plain warm sand #F1E6D3 background, soft studio light, gentle shadow below. On the island: a golden dune at twilight with a glowing twin-star constellation above it, a figurine looking up through a brass telescope. Dominant color yellow #FBBC04, other Google colors as tiny accents only.
```
Easter egg : les étoiles jumelles (*Gemini*).

#### [I03-E] Carrière & Communauté — Vert

```
Single floating miniature island diorama, chunk of sand and banco ground hovering in the air with small rocks dropping beneath, isolated on a plain warm sand #F1E6D3 background, soft studio light, gentle shadow below. On the island: a staircase of green blocks climbing to a rooftop terrace, one step is missing and a figurine reaches down to help another one up, a small green flag at the top. Dominant color green #34A853, other Google colors as tiny accents only.
```
Easter egg : la marche manquante et la main tendue.

### [I04] Speakers — Le coucher de soleil, la scène se monte

- **Format** : 16:9, puis 9:16
- **Dominante** : rouge
- **Zone texte** : l'écran géant vide (photos des speakers affichées en HTML)

```
Riverbank of the Niger at sunset, a big festival stage under construction made of red blocks and scaffolding, crew figurines lifting speaker cabinets and stringing lights. A huge blank LED screen dominates the center of the stage, completely empty and evenly lit. A road case near the stage, a cable on the ground forming an infinity loop. Deep orange and red sky reflected in the water, long dramatic shadows, sense of anticipation.
```

- **Easter eggs** : la flight case marquée `200 OK` (à ajouter en retouche), le câble en boucle infinie.
- **Mobile** : cadrage vertical sur l'écran, avec le fleuve en bas.

### [I05] Programme — Le soir, la foule traverse le pont

- **Format** : 21:9 (scroll horizontal de la timeline), puis 9:16
- **Dominante** : vert
- **Zone texte** : sous chaque lampadaire

```
Ultra wide panoramic view of the Kennedy bridge over the Niger River at dusk, a joyful crowd of figurines walking across toward a glowing venue on the far side. Evenly spaced lampposts along the bridge glow green, each one like a milestone on a timeline, one lamppost slightly flickering. A wooden pirogue glides on the calm water below. Turquoise-to-violet evening sky, warm lights reflecting on the river.
```

- **Easter eggs** : la pirogue *Pipeline* (calque C04), le lampadaire qui clignote (le bug).
- **Utilisation** : chaque lampadaire correspond à un créneau du programme.
- **Mobile** : vue verticale depuis l'entrée du pont, les lampadaires s'alignent vers le haut (timeline verticale).

### [I06] Billetterie — La nuit, le festival explose

- **Format** : 16:9, puis 9:16
- **Dominante** : bleu nuit, avec faisceaux aux 4 couleurs
- **Zone texte** : le centre du ciel, entre les faisceaux (CTA)

```
Night festival at its peak on the riverbank, massive crowd of figurines with hands raised, glowing wristbands, confetti in blue, red, yellow and green raining down. Four powerful stage light beams in the four Google colors cross in the sky. Fireworks bursting into shapes of angle brackets. Energy, euphoria, celebration. Central sky area between beams kept relatively clear and dark for a call to action.
```

- **Easter eggs** : les feux d'artifice en `</>`, le bracelet `sudo` (calque C06).
- **Mobile** : vertical, avec la foule en bas et les faisceaux qui montent.

### [I07] Footer — Fin de nuit, la ville dort

- **Format** : 16:9, puis 9:16
- **Dominante** : anthracite
- **Zone texte** : le bas de l'image (liens, partenaires)

```
Quiet late night over the sleeping miniature city of Niamey, deep charcoal and midnight blue tones, a large moon reflected in the still river. All windows dark except one, where a figurine sits at a laptop, the screen glow casting soft blue light. Sparse stars, a few forming a subtle angle bracket shape. Calm, intimate, poetic.
```

- **Easter eggs** : la seule fenêtre allumée (quelqu'un code encore), les étoiles en `< >`.
- **Utilisation** : le curseur de l'écran clignote en CSS.

---

## 3. Calques détachables (parallax)

Génère-les sur fond blanc uni, puis détoure-les avec un outil de suppression de fond. Exporte en PNG ou WebP transparent.

Template :

```
Single isolated object, plain pure white background, soft studio lighting, subtle contact shadow, same stylized 3D miniature style, matte ceramic and satin plastic, Google colors blue #4285F4, red #EA4335, yellow #FBBC04, green #34A853: [OBJET]
```

| Code | [OBJET] | Rôle sur la page |
|---|---|---|
| C01 | a set of 8 glossy building blocks in blue, red, yellow and green, various sizes, floating at different angles | Blocs qui tombent dans le hero |
| C02 | a curly brace shaped block hanging from a crane hook | Suit la souris dans le hero |
| C03 | a small taxi car with license plate 404 | Traverse l'écran au scroll |
| C04 | a wooden pirogue with the word Pipeline painted on its side | Glisse sur la timeline |
| C05 | a burst of confetti in four Google colors | Explosion sur le bouton billetterie |
| C06 | a glowing festival wristband with the word sudo | Badge du ticket |
| C07 | a glass jar of cookies | Bannière cookies du site |

---

## 4. Prompts vidéo

**Mode d'emploi**

- Chaque vidéo part de son image (image-to-video), avec le **VIDEO LOCK** à la fin du prompt.
- **Durée** : 6 s.
- **Boucles (L)** : la dernière image doit rejoindre la première. Si ton outil accepte une image de fin, donne-lui la même image qu'au début.
- **Transitions (T)** : utilise l'image de départ et l'image d'arrivée (fonction first frame / last frame). Elles seront pilotées par le scroll.
- **Pas de son** : sur le web, les vidéos sont en lecture automatique et muettes.
- **Export** : MP4 H.264 + WebM, environ 2 à 4 Mo pour le hero, avec I01 en poster de secours.

### [L01] Hero — La ville se compile (boucle)

Source : I01

```
Seamless 6-second loop. Blue building blocks gently fall from the dawn sky and click into place on the houses and the bridge with a soft springy settle. The crane slowly swings, the curly brace block sways on its hook. The river mist drifts, the light warms very slightly then returns. Very subtle slow push-in then return to the start position. The last frame matches the first frame exactly. Keep the upper sky area clean and calm.
```

Easter egg vidéo : un bloc hésite une demi-seconde avant de s'emboîter, comme une compilation qui réfléchit.

### [L02] À propos — Le marché vit (boucle)

Source : I02

```
Seamless 6-second loop. Market life in miniature: canopies sway softly in a light breeze, a vendor arranges calabashes, steam rises from the tea kettle, a figurine types on a laptop, a yellow block settles onto a stall roof with a tiny bounce. Static camera with very slight parallax drift. The left wall area stays empty and still. The last frame matches the first frame.
```

### [L03-A à E] Tracks — Les îlots flottent (5 boucles)

Source : I03-A à I03-E (même prompt pour les 5, seul le détail change)

```
Seamless 6-second loop. The floating island bobs gently up and down with a slow 2-degree rotation, tiny rocks fall from beneath and fade out, soft shadow below breathes with the movement. [DÉTAIL]. Plain background stays perfectly still. The last frame matches the first frame.
```

| Track | [DÉTAIL] |
|---|---|
| Web | the browser-tab windows light up one after another like tabs loading |
| Mobile & Flutter | the blue butterfly flutters in a small figure-eight around the phone |
| Cloud | the white cloud gently tugs on its ropes, server lights blink inside the granary |
| IA & Gemini | the twin stars pulse softly in sync, the telescope tilts slightly |
| Carrière | the helping figurine pulls the other one up the missing step |

Astuce : sur le site, ces boucles ne jouent qu'au survol de la carte (au toucher sur mobile).

### [L04] Speakers — La scène se monte (boucle)

Source : I04

```
Seamless 6-second loop. Sunset glow slowly shimmers on the river, crew figurines lift a speaker cabinet and set it down, string lights flicker on one by one along the scaffolding, a red block clicks onto the stage structure. The big LED screen stays blank, evenly lit and perfectly still. Static camera. The last frame matches the first frame.
```

### [L05] Programme — Le pont s'anime (boucle)

Source : I05

```
Seamless 6-second loop. The crowd walks slowly across the bridge toward the glowing venue, the pirogue glides a short distance on the water leaving a soft ripple, reflections shimmer. The green lampposts glow steadily, except one that flickers twice like a bug then stabilizes. Very slow lateral camera drift that returns to the start. The last frame matches the first frame.
```

Easter egg vidéo : le lampadaire qui bugue.

### [L06] Billetterie — Le festival (boucle)

Source : I06

```
Seamless 6-second loop. The four colored stage beams sweep slowly across the night sky in a rhythmic pattern, confetti falls continuously, the crowd sways with hands raised, wristbands pulse with light, one firework bursts into an angle bracket shape and fades. The central sky area stays relatively dark and clear. Subtle slow push-in and return. The last frame matches the first frame.
```

### [L07] Footer — La ville dort (boucle)

Source : I07

```
Seamless 6-second loop. Almost still. The moon reflection ripples gently on the river, a few stars twinkle, the single lit window's screen glow flickers softly as if someone is typing. Static camera. Calm and quiet. The last frame matches the first frame.
```

### [T01] Transition — De l'aube au matin

Départ : I01 · Arrivée : I02 · Pilotée par le scroll

```
6-second continuous camera move from the start frame to the end frame. The camera descends from the aerial dawn view into the city streets, blocks finish snapping into place, the light shifts from cool blue dawn to warm yellow morning, the market assembles as the camera arrives. Smooth ease-in-out, no cut.
```

### [T02] Transition — Du coucher de soleil à la nuit

Départ : I04 · Arrivée : I06 · Pilotée par le scroll

```
6-second continuous transition from the start frame to the end frame. The sun sets behind the river, the sky darkens to midnight blue, the stage construction completes, lights switch on in a cascade, the four colored beams ignite one after another and the crowd fills the riverbank. Smooth ease-in-out, slight push-in, no cut.
```

### [T03] Transition — Du festival au sommeil

Départ : I06 · Arrivée : I07 · Pilotée par le scroll

```
6-second continuous transition from the start frame to the end frame. The festival lights fade out one by one, the last confetti settles, the crowd disperses into the streets, the camera slowly pulls back and rises over the sleeping city until only one window remains lit. Smooth ease-out, no cut.
```

---

## 5. Prompt de la landing page (à donner au codeur ou à l'IA)

À utiliser une fois les assets générés et rangés dans `/assets`.

```
<challenge>
Create an unforgettable landing page for DevFest Niamey 2026, organized by GDG Niamey (Niger). The page is entirely in French.

Event (placeholder content, easy to replace from a single config object):
- Date: samedi 12 décembre 2026
- Venue: Palais des Congrès, Niamey
- Slogan: « Niamey compile le futur »
- Tracks: Web, Mobile & Flutter, Cloud, IA & Gemini, Carrière & Communauté
- Numbers: 500+ participants, 20 speakers, 1 journée
- Speakers, agenda and partners: placeholder data

Concept: "Niamey Live Build". Scrolling the page is living one day in Niamey. At dawn the city is assembled from colorful blocks (build), at sunset the festival stage is set up (deploy), at night the festival explodes (run), and at the end the city sleeps while one window is still lit.

Use these assets to build the visual world:
- /assets/images/I01-hero (16:9 and 9:16) + /assets/video/L01-hero loop
- /assets/images/I02-about + L02 loop
- /assets/images/I03-A to I03-E track islands + L03 loops (play on hover / tap)
- /assets/images/I04-speakers + L04 loop (the blank LED screen hosts the speakers carousel)
- /assets/images/I05-agenda (21:9) + L05 loop (each lamppost is an agenda slot, horizontal scroll on desktop, vertical on mobile)
- /assets/images/I06-tickets + L06 loop (CTA in the clear sky between the beams)
- /assets/images/I07-footer + L07 loop (CSS blinking cursor on the lit window)
- /assets/video/T01, T02, T03 transitions, scrubbed by scroll
- /assets/layers/C01 to C07 transparent cutouts for parallax and interactions

The experience must speak to the general public: it should hype, captivate and make people want to learn and start coding. It must also hide subtle easter eggs for developers:
- a console message inviting developers to volunteer
- a Konami code that rains C01 blocks across the screen
- the C03 taxi with plate 404 drives across the 404 page
- the C07 cookie jar is the cookie banner
- HTML comments written like commit messages
- the countdown to the event formatted like a build log
</challenge>

<brand>
Google colors only: blue #4285F4, red #EA4335, yellow #FBBC04, green #34A853, with sand #F1E6D3 for day sections and charcoal #202124 for night sections. One dominant color per section. The official GDG / DevFest logo is provided as a file and must not be redrawn. Typography: a bold geometric sans for headlines, a clean sans for body, a monospace for code-like details.
</brand>

<creative-freedom>
Always prioritize creativity. Make bold, unexpected decisions and develop an original concept rather than following familiar landing-page conventions. You have complete creative freedom over the layout, copy, typography details, transitions and interactions within the brand rules. Do not place the images into ordinary rectangular sections. Treat them as raw material for a coherent visual world: crop them, layer them, sequence them, make them react to scroll and cursor. Avoid generic startup layouts and component-library aesthetics.
</creative-freedom>

<delivery>
Build the complete experience in the current repository. It must work beautifully on desktop and mobile, load fast on African mobile networks (lazy-load videos, posters as fallback, respect prefers-reduced-motion and save-data), and stay accessible (contrast, alt text, keyboard navigation). Do not explain the design before building it. Make the creative decisions yourself and deliver the most original, polished result you can.
</delivery>
```
