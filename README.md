# DevFest Niamey 2026 — landing page

Page d'accueil de l'événement, en français, par et pour GDG Niamey.
Site statique : **pas de build, pas de framework, pas de dépendance**. Ouvre `index.html`, ça marche.

```
index.html          structure + contenu éditorial (titres, textes)
js/config.js        TOUTES les données de l'événement (date, programme, speakers, FAQ, liens…)
js/main.js          rendu de la config, animations, vidéos, accessibilité
js/fx.js            confettis, pluie, easter eggs clavier, API console
js/terminal.js      le petit terminal de la section « Code »
js/badge.js         générateur de badge (canvas → PNG)
css/base.css        design tokens, typo, composants
css/sections.css    mise en page section par section
media/              dérivés optimisés (WebP, MP4 légers) — générés, ne pas éditer
assets/             originaux fournis — jamais modifiés
scripts/            encodage des médias
418.html, humans.txt
```

## Lancer en local

```bash
python3 -m http.server 5173
```

puis http://localhost:5173. (Ouvrir `index.html` directement fonctionne aussi.)

## Changer les infos de l'événement

Tout est dans **`js/config.js`** : `event` (date, lieu, lien de billetterie, e-mail, carte), `stats`,
`tracks`, `agenda`, `speakers`, `partners`, `faq`, `socials`. Les textes sont injectés avec `textContent`
(pas de HTML à échapper).

À remplacer avant la mise en ligne — ce sont des **placeholders** :

- `event.ticketUrl` → `https://example.com/devfest-niamey-2026/billets`
- `event.email`, `event.mapUrl`, `socials[].url`
- tout le programme, les speakers, les partenaires et la FAQ
- `partnersNote` (mets `""` pour retirer la mention « placeholders »)
- le **logo** : `assets/logo-devfest.svg` n'était pas dans le dossier fourni. Le fichier est référencé dans
  `index.html` ; en son absence la page affiche « GDG Niamey » en texte. Dépose le SVG officiel au même
  endroit (il n'est pas redessiné ici).

Le compte à rebours, le fichier `.ics` (« Ajouter à mon agenda ») et le fuseau horaire se calculent
depuis `event.dateISO` / `event.endISO`.

## Régénérer les médias

Si les originaux de `assets/` changent :

```bash
bash scripts/encode-video.sh    # boucles vidéo légères + première image (ffmpeg requis)
python3 scripts/optimize.py     # WebP, détourages à canal alpha, textures, posters (Pillow + numpy)
```

Choix de conception : 16×9 sur desktop, 9×16 sur mobile (≤ 820 px) ; l'image A correspondante sert de
poster. Les détourages B01/B02/B04–B06 sont fournis en JPG sur fond blanc : ils reçoivent un vrai canal
alpha ; B03 et B07 restent sur blanc et sont fondus via `mix-blend-mode: multiply`.

## Performance & accessibilité

- ~0,8 Mo avant tout scroll ; les vidéos sont chargées au scroll (`IntersectionObserver`), muettes, en
  boucle, `preload="none"`, mises en pause hors écran. Une seule (hero) démarre, après `load`.
- Désactivées si `prefers-reduced-motion`, `Save-Data` ou connexion 2G, et via le bouton pause global (⏸,
  mémorisé en `localStorage`).
- Polices auto-hébergées (sous-ensembles latins), aucun appel tiers.
- Lien d'évitement, repères ARIA, focus visible, `radiogroup` au clavier, accordéons `inert`, zones `aria-live`,
  repli `<noscript>`.

## Easter eggs (spoilers 🍵)

<details>
<summary>Déplier</summary>

- **Console du navigateur** : bannière, puis `devfest.help()` (`compile()`, `agenda()`, `speakers()`, `the()`, `billet()`, `indices()`).
- **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) : mode festival.
- Taper **`the`** / **`tea`** / **`thé`** : pluie de feuilles de thé.
- Taper **`niamey`** : la ville compile.
- **5 clics sur le logo** : mode debug (contours de chaque boîte) ; 5 de plus pour sortir.
- Cliquer le **chiffre** d'une statistique : décimal → binaire → hexadécimal.
- Cliquer le **compte à rebours** : il change de format.
- Le **terminal** de la section « Code » (`aide`, `sudo`, `git log`, `rm -rf /`, `cat humans.txt`…).
- Cliquer l'**avion en papier** du hero.
- Cliquer le **wax** du pied de page.
- `418.html` (« Je suis une théière ») et `humans.txt`.
- Le commentaire en haut du code source d'`index.html`.

</details>
