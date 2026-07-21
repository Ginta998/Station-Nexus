# Stationexus — PRD

## Problem Statement
Application web pure (PWA installable) inspirée de ES-DE : un launcher cinématique et mono-utilisateur pour lancer les créations personnelles (livres, films, séries, Tengoku Dojo, à venir). Chaque fiche possède un bouton « Lancer ». Pas de comptes ; un mode Admin (Création) protégé par un PIN 4-6 chiffres stocké dans localStorage. Musique d'ambiance au lancement. 12 thèmes interchangeables (défaut : Tengoku). Esthétique japonaise sombre, poster roi, fond dynamique suivant la carte focalisée.

## Stack / Architecture
- Frontend: React (CRA) + React Router v6 + Tailwind (CSS variables par thème via `data-theme`) + react-icons/io5 + html2canvas + Web Share.
- Backend: FastAPI + MongoDB (Motor). Routes préfixées `/api`. Images poster en base64 (data URI), audio uploadé en base64 (max 12 Mo) et streamé via endpoint dédié. Aucune auth serveur.
- PWA: manifest.json + service-worker.js + icônes 192/512.

## User Persona
Un créateur unique gérant sa bibliothèque personnelle depuis PC / tablette / téléphone.

## Core Requirements (static)
- Launcher ES-DE : catégories, rail de posters horizontal, navigation clavier/tactile, fond dynamique flouté.
- Fiche détail avec bouton LANCER (reader / lien / épisodes / info), musique d'ambiance, partage de carte.
- Mode visiteur lecture seule ; mode Création (PIN 1234 par défaut) pour ajouter/modifier/supprimer + upload poster & audio.
- 12 thèmes complets via variables CSS + polices dédiées ; persistance localStorage.

## Implemented (2026-07-19)
- Backend CRUD créations + filtre catégorie + audio upload/stream/delete (limite 12 Mo) + auto-seed 13 créations.
- Home launcher (tabs, rail, hero, fond dynamique, kanji watermark, nav clavier), TopBar, PosterCard fallback kanji.
- Detail (poster shareable, LANCER + reader modal, épisodes, ambiance, achat, partage html2canvas/Web Share).
- Settings (déverrouillage PIN + changement PIN, volume, grille 12 thèmes).
- PWA (manifest, service worker, icônes) ; admin persistant entre rechargements (localStorage `sx_admin`).
- Testé end-to-end : backend 100%, frontend 100% (iteration_1.json).

## Backlog
- P1: Upload/gestion multi-images (galeries), réordonnancement drag-and-drop des posters.
- P1: Contenu de lecture riche (chapitres multiples paginés) et lecteur vidéo intégré pour films.
- P2: Migrer FastAPI on_event → lifespan ; status_code 201 sur création.
- P2: Recherche/filtre texte, favoris, mode plein écran immersif.

## Implemented — Itération 3 (2026-07-19)
- Ambiance de l'app en autoplay (reprise après geste utilisateur, coupée par l'ambiance d'une fiche puis restaurée).
- Fond immersif personnalisable par fiche : image dédiée + curseurs flou & assombrissement (Home + Detail).
- 9 packs de sons UI synthétisés (zen, retro, neo, koto, arcade, glass, vapor, taiko, crystal) + perso + silence (12 tuiles).
- Sélecteur d'icônes (émojis) pour les ambiances de l'app.
- Galerie d'images par fiche (grille + lightbox) et intégrations réseaux (YouTube en iframe, Wattpad/autres en boutons).
- Bouton Contact agrandi et libellé dans la barre du haut.
- Tests : backend 9/9 (+ régressions), frontend 100%.

## Next Tasks
- Uploader vrais posters/fonds/musiques, écrire les chapitres, remplir la catégorie Séries.

## Implemented — Itération 23 (2026-07-21) — Mini-lecteur audio seekable
- **Barre de lecture flottante** dans le reader (`ReadingPlayer` dans `ChapterReader.js`) : apparaît dès qu'une musique joue (immersive ou repère). Affiche titre (♪), temps écoulé/durée (`0:02 / 3:44`), play/pause, et boutons ‑10s / +10s (masqués sur mobile étroit).
- **Barre de progression cliquable (seek)** : `<input type=range>` de 0 à durée, `onChange` positionne `audio.currentTime` → navigation avant/arrière dans le morceau. Boutons ‑10s/+10s via `nudge`.
- **Contexte** : nouvelles fonctions `resumeReading()` (reprend la piste chargée, remet à 0 si terminée) et `getReadingAudio()` (expose l'élément audio pour lecture des `timeupdate`/`loadedmetadata` par le composant, sans re-render global). Play/pause du mini-lecteur passent par `pauseReading`/`resumeReading` → état synchro avec le bouton du header et les pastilles.
- Visibilité : `showPlayer` (state) activé quand `anyMusicOn`, ou au clic d'un repère / lecture header ; réinitialisé au changement de chapitre. Titre = data-title du repère, sinon « Musique de lecture ». Padding bas ajouté à l'article pour ne pas masquer les boutons Préc./Suiv.
- Auto-testé (screenshot) : lecteur affiché, durée/temps corrects (max 224s = 3:44), seek actif (non disabled), toggle OK, header synchro.


## Implemented — Itération 22 (2026-07-21) — Contrôle audio des repères
- **Couper la musique depuis la barre du haut** : le bouton `reader-music` de l'en-tête coupe désormais TOUTE musique en cours (immersive OU repère `cue:`). Nouvel `anyMusicOn` (playingId === readingKey OU commence par "cue:") + nouvelle fonction contexte `pauseReading()` (fond + pause sans quitter le mode lecture). Le bouton est visible dès que `hasMusic || hasCues (regex sx-music-cue dans le contenu) || anyMusicOn`, et affiche ⏸ (rouge) quand ça joue.
- **Pastille musique agrandie/évidente** (`index.css` `.sx-music-cue`) : gros bouton pilule rempli (brand), texte 700, padding ~0.55em 1.05em, ombre portée, ▶ plus grand, hover scale + glow → clairement cliquable. Actif = ⏸ + halo.
- Vérifié (screenshot) : pastille « ▶ Thème de bataille » bien visible/cliquable, bouton stop de l'en-tête actif pendant la lecture.
- ⚠️ INCIDENT : lors des tests de l'itération 21, le testing_agent a écrasé le vrai contenu du Chapitre 1 de « Born X Burn » par le texte seed. Partiellement récupéré via capture mais tronqué ; l'utilisateur remet le texte lui-même. À l'avenir : faire tester les agents sur une œuvre jetable dédiée, jamais sur les vraies créations.


## Implemented — Itération 21 (2026-07-21) — Médias inline dans les chapitres (images + repères musique)
- **Objectif utilisateur** : placer plusieurs images ET plusieurs pistes de musique à des moments précis du chapitre. Choix retenus : repère musique VISIBLE (pastille), lancement MANUEL par le lecteur (pas de scroll auto), arrêt à volonté, un nouveau repère remplace le précédent EN FONDU, musique SANS boucle (se termine puis relançable), COEXISTE avec l'ancien système (couverture + musique de chapitre).
- **Backend** (`server.py`) : bibliothèque de médias par œuvre — `POST /api/creations/{cid}/assets` (multipart file + kind=image|audio + name, max 12 Mo), `GET /api/creations/{cid}/assets` (liste sans data), `GET /api/assets/{id}` (octets + Cache-Control immutable), `DELETE /api/assets/{id}`. Collection `media_assets`, nettoyée à la suppression d'œuvre. Import `Form` ajouté.
- **api.js** : `uploadAsset`, `listAssets`, `deleteAsset`, `assetUrl`.
- **RichTextEditor** : prop `creationId` ; boutons `rte-image` (upload + insertion `<img class="sx-rich-img">` à la position du curseur) et `rte-music` (panneau `rte-music-menu` : titre + upload d'une piste OU réutilisation d'une piste existante → insertion pastille `<span class="sx-music-cue" data-track data-title>`). Sélection du curseur mémorisée (`savedRange`) pour insérer au bon endroit.
- **ChapterReader** : clic sur une pastille → `toggleReadingUrl(url, "cue:"+url, {loop:false})` (fondu + remplacement) ; effet qui met `data-active` (▶/⏸) selon `playingId/isPlaying`.
- **AppContext** : `playReadingUrl`/`toggleReadingUrl` acceptent `opts.loop` (défaut true = immersif) ; listener `ended` sur cardAudio remet `isPlaying=false` (pas de boucle pour les repères).
- **CSS** : `.sx-rich-img` (image responsive encadrée) et `.sx-music-cue` (pastille pilule, ▶ / ⏸ actif).
- Testé par testing_agent (iteration_13.json) : backend 3/3 pytest, frontend 100% (insertion image+cue, persistance, rendu lecteur, lecture manuelle data-active, remplacement en fondu, loop=false confirmé, coexistence/régressions OK). Assets de test nettoyés.


## Implemented — Itération 20 (2026-07-21) — Préchargement pendant l'intro (demande Msg 70)
- **Zéro chargement après l'écran de démarrage** : `IntroGate` (App.js) précharge en tâche de fond, PENDANT l'animation d'intro, les données de l'Accueil via React Query (`qc.prefetchQuery(["creations"])` + `["categories"]`) et met en cache `["settings"]` (`fetchQuery`, réutilisé pour choisir le type d'intro/aléatoire). Après réception des créations, les **images d'affiches** des 16 premières fiches sont préchauffées (`new Image().src = posterUrl(...)`) pour un rendu visuel quasi instantané.
- Résultat : quand l'utilisateur appuie sur « Entrer », `Home` monte avec les données déjà en cache (staleTime 60s) → plus de spinner « Chargement… ».
- Auto-testé (screenshot) : 250 ms après « Entrer », 0 « Chargement » visible et 15 cartes déjà rendues avec affiches. N'affecte pas le cas « intro désactivée » (Home charge comme avant).


## Implemented — Itération 19 (2026-07-20) — Mini-jeu arcade
- **Nouvelle catégorie « Jeux » (遊)** créée (categories, order 6) + nouveau `launch_type: "game"` (string libre, aucun changement de modèle backend requis ; option « Jeu arcade » ajoutée dans `EditorDialog`).
- **Jeu « Cosmic Bunny · Astro Delivery »** (`CosmicBunnyGame.js`) : runner latéral en Canvas 2D. Un lapin coursier (casque/tenue) conduit une moto et **livre des colis 📦 sur une Terre V2 hostile** (ciel rouge toxique, skyline en ruines parallax, sol fissuré, poussière, éclairs). Mécaniques : saut (Espace/↑/tap), gravité, obstacles au sol (🪨🚧🛢️⚙️) à esquiver, colis flottants à collecter (+15), score = distance + livraisons, 3 vies avec invincibilité temporaire, vitesse croissante, record en localStorage (`sx_game_cosmic_bunny_hi`). Écrans Démarrer / Game Over.
- Intégration `Detail.js` : `launch_type==="game"` ouvre `<CosmicBunnyGame>` en modale plein-écran. Fiche créée avec affiche IA (lapin motard sur Terre V2 hostile). Le lapin motard en jeu est composé en emoji (🐰+🏍️+📦) pour un rendu net (sprite IA en JPEG non transparent, non utilisé en jeu).
- Auto-testé (screenshots) : onglet Jeux + carte OK, lancement, gameplay (score 99, collision→2 vies, colis/obstacles rendus), écran titre thématique.


## Implemented — Itération 18 (2026-07-20)
- **Reprise directe depuis la carte** : le libellé de progression sur `PosterCard` est désormais cliquable (`poster-resume-{id}`, `stopPropagation`) → `Home.resume(id)` navigue vers `/oeuvre/{id}` avec `state:{resume:true}`. `Detail` détecte ce state (via `useLocation`) et ouvre directement le `ChapterReader` au chapitre sauvegardé (puis nettoie le state avec `nav(replace)`), sans passer par la fiche. Toast « Reprise au chapitre N » comme d'habitude.
- **Badge « ✓ Terminé »** : quand la progression atteint 100 % (`done = pct>=100`), affichage d'un badge `poster-done-{id}` en haut à droite de l'affiche et le libellé devient « ✓ Terminé · Relire » (clic = relire depuis le chapitre courant/début).
- Auto-testé (screenshots) : clic reprise ouvre le lecteur au bon chapitre, badge Terminé + libellé Relire OK à 100 %.


## Implemented — Itération 17 (2026-07-20)
- **Barre de progression de lecture par carte** (`PosterCard.js`) : pour les œuvres `launch_type==="chapters"`, la carte lit `localStorage sx_progress_{id}` et affiche un libellé « ▸ Ch. N/total · X% » (remplace l'accroche) + une fine barre de progression rouge en bas de l'affiche. Progression globale = (chapitre + ratio) / total. Backend : nouveau champ léger `chapters_count` (Creation) exposé dans la liste allégée et le détail (calculé dans `_lighten` + branche media) sans réintroduire les gros base64.
- **2 nouveaux écrans de démarrage anime dynamiques** (`BootIntro.js` + `intro.js` + `index.css`) :
  - **Anime Slash** (`slash`, 閃) : lignes de vitesse balayantes + deux tranches de sabre croisées + flash d'impact + kanji glitché. Son : swipes métalliques → impact grave → traîne.
  - **Hanabi** (`hanabi`, 華) : anneaux concentriques + ~30 particules multicolores qui explosent en radial + kanji lumineux. Son : sifflement de lancement → boom → étincelles.
  - Ajoutés aux INTROS → automatiquement inclus dans le tirage « Aléatoire ». Nouveaux keyframes : introSpeed, introFlash, introSlashStreak(2), introBurst.
- Auto-testé (curl + screenshots) : `chapters_count=2` renvoyé, libellé carte « ▸ Ch. 1/2 · 25% » + barre, aperçu des deux écrans OK.


## Implemented — Itération 16 (2026-07-20)
- **Boutons du haut du lecteur agrandis** (`ChapterReader.js`) : Sommaire / Aa (réglages) / Musique / Fermer passent en boutons bordés plus grands (icônes 22-26px, padding p-2.5, fond léger) → plus lisibles et tactiles.
- **Pack son personnalisé réservé à l'admin** (`Settings.js`) : le bouton « Pack personnalisé » et ses uploads (`soundpack-custom` / `custom-sounds`) sont désormais enveloppés dans `{isAdmin && ...}`. Un visiteur ne peut plus uploader ses propres sons (les packs synthétisés + Silence restent dispos).
- **Écran de démarrage aléatoire** : nouvelle option `intro_type === "random"`. Carte « Aléatoire » 🎲 dans IntroManager (`intro-random`, bouton `intro-choose-random` admin uniquement). Dans `App.js` (IntroGate), si `intro_type==="random"`, on tire au hasard un écran parmi les INTROS non masqués (+ vidéo si présente) → un écran différent à chaque session. `intro_type` accepte déjà une string libre côté backend (aucun changement serveur).
- Auto-testé (screenshots) : boutons lecteur agrandis, pack perso masqué pour visiteur, carte Aléatoire présente pour tous mais « Définir » admin-only, `intro_type` persiste à "random", intro tirée aléatoirement au boot.


## Implemented — Itération 15 (2026-07-20)
- **Accessibilité — Taille du texte globale** (demande utilisateur myope : « normaliser » le zoom du lecteur à toute l'app car descriptions/commentaires/chapitres trop petits). Réglage `textScale` (localStorage `sx_textscale`), 4 niveaux : Normal / Grand (112,5 %) / Très grand (125 %) / Maximum (140 %). **Défaut = Grand.** Appliqué via `font-size` racine sur `<html>` (attribut `data-textscale`) → tout le texte en rem grandit (descriptions, synopsis, commentaires, chapitres/épisodes, chrome UI). Le lecteur de chapitres garde son propre réglage px (orthogonal).
- **Bouton d'accès rapide** (`TextSizeButton.js`, testids `text-size-btn` + menu `text-size-menu` + `text-size-{normal|grand|xl|max}`) ajouté dans la TopBar de l'Accueil et dans la barre d'actions des fiches (Detail) → menu déroulant pour changer la taille à la volée.
- **Affiches neutralisées** : largeurs `.sx-poster` en `calc(rem / var(--text-scale))` pour que l'échelle de texte n'agrandisse PAS le rail (elles gardent leur propre réglage « Taille des affiches »).
- **Section « Accessibilité »** dans Paramètres visible par tous (hors gate admin), `text-scale-grid`.
- Testé par testing_agent (iteration_12.json) : 16/16 checks frontend PASS, 0 erreur console. Défaut 'grand' confirmé, persistance, pas de débordement mobile (390=390), bouton présent Accueil + fiche. **Régressions héritées revalidées** : `chapter_size`/`button_size` (round-trip PUT OK), bloc engagement `reader-engagement` (Commenter/Partager) présent avant préc./suiv. dans le lecteur. (Valeurs de test 'xl' sur Born X Burn remises à 'md'.)


## Implemented — Itération 14 (2026-07-20)
- **Police Tengoku → Anton** (sans-serif condensé impactant) : `--font-display` du thème Tengoku (et `:root`) passé de « Bodoni Moda » à « Anton » (déjà chargée dans index.html). Logo STATIONEXUS + titres en Anton.
- **Nouveau thème « Horizon »** (13e) : « la mer & la douceur » — bleu-vert `#1f8a8c`, blanc cassé `#f1efe7`, rouge pâle `#e08d8d`, coins arrondis (1rem), ombres douces, titre Cormorant Garamond italique. Ajouté dans index.css + swatch dans themes.js. Lisible (texte sur média blanc global).
- **Chapitres affichés « en série » sur la fiche** (plus besoin de passer par le sommaire) : pour `launch_type==="chapters"`, la liste des chapitres s'affiche sous le bouton principal (qui reste « Reprendre/Lire », inchangé). Deux modes d'affichage au choix via nouveau champ `chapter_display` ("button" | "image") réglable dans l'éditeur : boutons (liste numérotée) ou images (vignettes 16:9). Icône musique si le chapitre a sa piste, surbrillance du chapitre en cours. Clic → ouvre le lecteur directement à ce chapitre (`ChapterReader` reçoit `startChapter`), sans écraser la reprise.
- Vérifié : Anton + Horizon (screenshots), persistance `chapter_display` + préservation images (curl round-trip), modes boutons & images, ouverture au bon chapitre.

## Implemented — Itération 13 (2026-07-20)
- **Reprise de lecture** : progression (chapitre + ratio de défilement) mémorisée par œuvre dans `localStorage` (`sx_progress_{id}`), sauvegarde throttlée au scroll + au changement de chapitre. À la réouverture, le lecteur reprend au bon chapitre et à la bonne position (restauration par ratio, robuste aux images) + toast « Reprise au chapitre N ». Le bouton de la fiche affiche « Reprendre · ch. N » quand une progression existe.
- **Lettrine (dropcap) rétablie sur le contenu enrichi** : le CSS ciblait `p:first-of-type` alors que le contenu WYSIWYG produit des `<div>` → lettrine invisible. Corrigé pour cibler le premier `<p>` ou `<div>`, en couleur du thème (`var(--brand)`) + ombre.
- **Collage intelligent dans l'éditeur** (`onPaste`) : conserve gras/italique/souligné, titres/sous-titres, citations, listes, alignement (dialogues centrés) et couleurs, tout en nettoyant le HTML parasite de Word/Google Docs (polices, tailles, classes, styles mso). Repli en paragraphes si collage de texte brut.
- Vérifié via screenshots (reprise exacte au ratio 0.45, lettrine 76px couleur thème). Collage : logique additive, dégradation gracieuse.

## Fix — Itération 12b (2026-07-20)
- **Texte de chapitre enrichi invisible** : le conteneur `.reader-rich` (un seul grand bloc, ex. 11096px) portait l'animation reveal avec un `IntersectionObserver` à `threshold: 0.12` → 12% de la hauteur > hauteur écran, donc jamais déclenché → texte bloqué à `opacity:0`. Corrigé : `threshold: 0` + `rootMargin: 0px 0px -8% 0px` (s'affiche dès l'entrée à l'écran). Le texte brut fonctionnait déjà car découpé en petits paragraphes. Vérifié sur Born X Burn (chapitre riche).

## Implemented — Itération 12 (2026-07-20)
- **Musique par chapitre** : chaque chapitre peut avoir sa propre musique de lecture (endpoints `POST/GET/DELETE /api/creations/{cid}/chapters/{chid}/audio`, flag `has_music` par chapitre). Repli automatique sur la musique de lecture générale de l'œuvre si le chapitre n'en a pas ; transition en fondu au changement de chapitre + dédup (ne redémarre pas la même piste partagée). Nettoyage `chapter_media` à la suppression d'une création.
- **Éditeur visuel WYSIWYG** (`RichTextEditor.js`) pour le contenu des chapitres : gras, italique, souligné, titres/sous-titres (H2/H3), citations, séparateurs, alignement gauche/centre, couleurs de texte (palette). Contenu stocké en HTML (`chapter.rich=true`), assaini légèrement. Rétro-compat : les chapitres en texte brut existants restent lisibles et sont convertis en paragraphes éditables à l'ouverture.
- **Rendu riche dans le lecteur** (`.reader-rich`) + **réglages de lecture globaux** (panneau « Aa ») : police (Serif/Sans/Display/Mono), taille, interligne, largeur de colonne (Étroit/Normal/Large), lettrine on/off. Persistés en localStorage (`sx_reader_*`).
- Tests : backend 7/7, frontend 100%, 0 régression (iteration_11.json). Image-preservation à l'édition toujours OK.

## Backlog technique (non bloquant, noté par la revue)
- Durcir la sanitisation du HTML riche (DOMPurify) car rendu via `dangerouslySetInnerHTML` (contenu admin uniquement → risque faible).
- `RichTextEditor` utilise `document.execCommand` (déprécié mais fonctionnel) — migrer vers Tiptap/Lexical à terme.
- `server.py` ~660 lignes — envisager de découper les routers par ressource.

## Implemented — Itération 11 (2026-07-20)
- **FIX bug texte coupé sur mobile (page Detail)** — cause racine réelle : la colonne de contenu (`flex-1` dans un `flex-col items-center`) n'avait pas de largeur contrainte, donc le titre `<h1>` (police display, une ligne) s'étendait à sa largeur naturelle (~732px) et débordait de l'écran (390px), coupant titre/synopsis/boutons des deux côtés. Corrigé : colonne passée en `w-full md:flex-1 min-w-0` + `break-words` sur le titre. Vérifié : plus aucun débordement horizontal sur mobile, texte entièrement lisible ; desktop inchangé.
- **Personnalisation de l'interface réservée au mode création** : la section est désormais enveloppée dans `{isAdmin && ...}` (visiteurs ne la voient plus).
- **Bouton Paramètres sur chaque fiche** (`detail-settings`) à côté de Retour / Accueil / Partage.
- **Service worker durci** : stratégie network-first pour le document HTML (app shell) + cache renommé `stationexus-v3` (purge des anciens caches) → évite de servir une version périmée de l'app sur mobile (ancien index.html cache-first). Assets statiques en stale-while-revalidate ; `/api` jamais intercepté.
- **FIX P0 affichage mobile des fiches** : `GET /api/creations` renvoyait **38 Mo** (posters/fonds/galeries base64 intégrés) → sur mobile la page restait bloquée sur « Chargement… », d'où l'obligation d'actualiser. Refactor : la liste est allégée (**~14 Ko**, champs `has_poster`/`has_bg`, images vidées) et les images sont servies via endpoints dédiés `GET /api/creations/{id}/poster` et `/bg` (avec `Cache-Control`). Le détail garde galerie+chapitres ; `?media=1` renvoie l'item complet (base64) pour l'éditeur.
  - Frontend : `posterUrl`/`bgUrl`/`getCreationFull` (api.js) ; PosterCard/Home/Detail/recommandations utilisent les endpoints ; **EditorDialog récupère l'item complet à l'édition** pour ne pas écraser les images au save (testé bout-en-bout).
- **Préchargement écran de démarrage** : liste désormais quasi instantanée → plus de « Chargement » après l'intro.
- **Écran d'entrée** : bloc centré (`boot-ready`) avec le mot-symbole STATIONEXUS et le bouton **Entrer** plus gros directement en dessous, centré à l'écran.
- **Bouton Accueil** ajouté sur chaque fiche (`detail-home`) à côté de Retour.
- **Personnalisation de l'interface** (nouvelle section Paramètres, persistée en localStorage, appliquée sur `<html>`) : couleur d'accent (10 presets + picker), style des coins (Net/Arrondi/Doux/Pilule), taille des affiches (Compact/Normal/Grand), réduire les animations, afficher/masquer les accroches sur les cartes.
- Nettoyage : suppression d'items de test résiduels (`TEST_*`).
- Tests : backend 6/6, frontend 100%, 0 erreur console (iteration_10.json).

## Implemented — Itération 9 (2026-07-20)
- **FIX P0 crash page Detail** : `useMemo` (recommandations) était appelé APRÈS le `return` anticipé dans `Detail.js` → violation des règles des hooks React → toute la page Detail plantait (timeout Playwright sur `detail-share`). `useMemo` remonté avant le early return. Bouton Partager + section Recommandations désormais fonctionnels.
- **FIX P0 autoplay audio (solution A choisie par l'utilisateur)** : le BootIntro devient un écran d'entrée cinématique. Après l'animation, un bouton « Entrer » (`data-testid=boot-enter`) apparaît ; le clic amorce l'AudioContext + démarre l'ambiance (`primeAudio()` dans `AppContext`, `primeAudioCtx()` dans `sound.js`). Respecte la contrainte navigateur (geste utilisateur requis).
- **FIX P1 lisibilité thèmes** : ajout de variables CSS globales `--on-media` (#fff) et `--on-media-2` (rgba blanc 72%) dans `:root`. `TopBar` + navigation/onglets/aide de `Home` utilisent ces couleurs claires (avec text-shadow) car ce contenu est toujours posé sur le fond image sombre. Corrige Shiro & Washi (texte sombre auparavant invisible) ; Yugen & Kurogane étaient déjà OK.
- Tests : backend 9/9, frontend 100% (Detail/Partage/Reco/écran d'entrée/thèmes), 0 erreur console (iteration_9.json).
- Note mineure restante (optionnel) : logo « EXUS » en thème Washi utilise `--brand` (brun foncé) → contraste plus faible sur fond sombre, mais lisible.

## Implemented — Itération 2 (2026-07-19)
- Onglet virtuel « Toutes mes créations » en première page + badges de catégorie sur cartes et fiches.
- Catégories dynamiques (CRUD + réordonnancement) gérées dans Paramètres (admin).
- Filtres/recherche + tri (Ordre / A→Z / Z→A / Récent) sur l'accueil.
- Commentaires publics par fiche (nom + texte), suppression admin, cascade au delete.
- Packs de sons UI synthétisés (Zen / Rétro / Neo) + pack personnalisé (upload) + Silence ; coupure globale du son (mute-all).
- Ambiance sonore de l'app : admin upload (titre + émoji), visiteur la choisit comme un thème ; coupée automatiquement quand l'ambiance d'une fiche démarre.
- Page Contact éditable (bio, avatar, réseaux : mail/Instagram/YouTube) + collecte d'emails newsletter (liste + export CSV admin).
- Lecteur de chapitres immersif type webtoon (défilement vertical, révélations au scroll, sommaire, chapitre préc./suiv., musique d'immersion, images par chapitre) pour launch_type='chapters'.
- Backend : endpoints categories/comments/ambiences/subscribers/settings + migration idempotente des chapitres. Tests 26/26 backend + frontend 100%.
