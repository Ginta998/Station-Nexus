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

## Implemented — Itération 28 (2026-07-21) — D-pad OK/halo/swipe + affiches compact mobile + personnalisation rouverte
- **D-pad mobile amélioré** : bouton **OK central** (`dpad-ok`, pastille brand ronde) qui ouvre la création focalisée (comme un tap sur la fiche), flèches gauche/droite espacées autour (gap-3) → ne touche plus le bouton Lancer. Classe `.dpad-btn` avec **halo au clic** (`:active` scale + box-shadow brand) et **vibration** (`navigator.vibrate(15)`).
- **Balayage vertical** (Home) : `onTouchStart/onTouchEnd` sur le conteneur — swipe vertical (>60px, dominante verticale, <700ms) change de catégorie (haut→suivante, bas→précédente) avec vibration.
- **Affiches Compact par défaut sur mobile** : `posterSize` désormais par appareil (`sx_postersize_mobile`/`_desktop`, fallback legacy) — défaut phone=compact, PC=normal ; bascule via listener matchMedia.
- **Personnalisation de l'interface rouverte aux spectateurs** : section dé-gatée du `isAdmin` (couleur d'accent, coins, taille affiches, animations, accroches, thèmes). La section **« Écran de démarrage » reste admin-only**.
- Auto-testé (screenshots mobile) : data-poster=compact, dpad-ok ouvre la création, section personnalisation visible en visiteur, intro-manager caché.


## Implemented — Itération 27 (2026-07-21) — Défaut mobile petit + mémoire par appareil + D-pad tactile
- **Défaut mobile = « petit »** (au lieu de normal), PC reste « grand » (AppContext `resolveScale`).
- **Mémoire de taille distincte par appareil** : clés `sx_textscale_mobile` / `sx_textscale_desktop` (fallback legacy `sx_textscale`). `setTextScale` écrit dans la clé du device courant ; un listener `matchMedia("(max-width:767px)")` recharge la taille du device au changement de breakpoint.
- **D-pad tactile mobile** (Home.js, `mobile-dpad`, `md:hidden`) en bas à droite face au bouton « Lancer » : `dpad-up`/`dpad-down` changent de catégorie, `dpad-left`/`dpad-right` naviguent entre créations, avec son (`sfx('nav')`). Handlers `navLeft/navRight/catUp/catDown` réutilisés par le clavier ET le D-pad. Taille en `em` → suit le réglage d'accessibilité. Masqué sur PC.
- Auto-testé (screenshot mobile) : défaut petit, D-pad présent + navigation OK, clé mobile='grand' après choix / desktop indépendant='grand', D-pad caché sur PC.


## Implemented — Itération 26 (2026-07-21) — Taille de texte « Petit »
- Nouveau niveau `petit` (87,5 % = 14px root, `--text-scale` 0.875) ajouté avant « Normal », utile surtout sur téléphone. Présent dans le menu du bouton « Aa » (`text-size-petit`) et dans les Paramètres (`text-scale-petit`).
- Vérifié (screenshot) : sélection « Petit » → data-textscale="petit", root font-size 14px.


## Implemented — Itération 25 (2026-07-21) — Taille de texte par défaut selon l'appareil
- La taille de texte par défaut (quand aucune préférence n'est enregistrée) dépend maintenant de l'appareil : **« normal » sur téléphone** (`matchMedia("(max-width: 767px)")`), **« grand » sur PC/tablette**. Un choix manuel dans les Paramètres/bouton reste prioritaire (localStorage `sx_textscale`).
- Vérifié (screenshot) : phone 390px → data-textscale="normal" (non stocké), desktop 1440px → "grand".


## Implemented — Itération 24 (2026-07-21) — Réduction du mini-lecteur
- Le `ReadingPlayer` peut désormais être **réduit en pastille** (bouton `reading-player-collapse`, IoChevronDown). Réduit → petite pastille ronde en bas à droite (`reading-player-expand`) avec l'icône ♪ et un **anneau de progression** (conic-gradient selon cur/dur). Tap → rouvre la barre complète. State `collapsed` local au composant.
- Auto-testé (screenshot) : collapse → pastille + anneau, barre complète masquée ; expand → barre complète de retour.


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

## Changelog — 21/07/2026
- Ajout d'une date de sortie (mois et/ou année) pour les créations "À venir".
  - Backend (`server.py`): champs `release_month` (nom du mois FR) et `release_year` (string) sur `Creation` + `CreationInput`.
  - Éditeur (`EditorDialog.js`): bloc mois (select Janvier→Décembre) + année (input) affiché quand "À venir" est coché. testids: `editor-release-month`, `editor-release-year`, `editor-release-section`.
  - Carte (`PosterCard.js`): le badge "À venir" affiche la date ("Mois Année") si renseignée, sinon "À venir". testid: `poster-release-{id}`.
  - Fiche (`Detail.js`): tag "Sortie · Mois Année" à côté de "À venir". testid: `detail-release`.
  - Testé backend via curl (create/list/delete d'une création jetable). Frontend affiché OK.

## Migration Preview → Production — 23/07/2026
- Contexte : le déploiement ne transfère que le code, pas la base MongoDB (bases séparées preview/prod). L'utilisateur avait édité tout son contenu en Preview uniquement.
- Solution : script `/app/scripts/migrate_to_prod.py` qui copie tout via l'API publique de production (backend sans auth serveur — PIN admin uniquement côté client).
- Migré : 5 catégories (key préservée), 15 ambiances + audio, 14 créations (posters/bg/galeries base64 + chapitres + episodes), musiques d'ambiance/lecture/chapitre, 28 assets intégrés (images/audio), réglages site.
- Points clés : les IDs de créations changent → audios réuploadés avec les nouveaux cid ; les IDs de chapitres sont préservés (passés dans le payload) ; les assets intégrés sont réuploadés (nouveaux aid) et les URLs dans le HTML des chapitres réécrites (domaine preview→prod + old_aid→new_aid).
- Sauvegarde préalable : `mongodump` de la base preview dans `/app/memory/backups/preview_YYYYMMDD_HHMMSS`.
- Vérifié : prod affiche 14 créations, assets/posters/audios répondent en 200. Prod home screenshot OK.
- IMPORTANT pour l'avenir : l'utilisateur doit faire ses ajouts/modifs directement en PRODUCTION (le public voit la prod). La Preview = brouillon de test. Re-lancer le script écraserait le contenu prod.

## Espace social — 23/07/2026
- Profils visiteurs : nom + photo uploadée (base64, max 2 Mo) + email optionnel. Stocké en localStorage (sx_profile, sx_visitor_id) + collection backend `profiles` (upsert par id). Email valide → auto-ajouté aux `subscribers`.
- Prompt de création de profil à la 1ère visite (ProfilePrompt, "Plus tard" possible) + bouton "Profil" dans TopBar (avatar+nom). Édition/suppression via ProfileDialog.
- Écran d'entrée (BootIntro) personnalisé : si profil → avatar + message de retour aléatoire (avec {name}) ; sinon logo STATIONEXUS. Messages dans SiteSettings.welcome_messages (5 défauts, éditables en admin via WelcomeMessagesManager). Helper lib/social.js pickWelcome().
- Annonces admin → visiteurs : collection `announcements` (title, text, creation_id optionnel). Bannière AnnouncementBanner sur Home, vue une fois (localStorage sx_seen_ann). Géré dans Settings > AnnouncementsManager (admin).
- Bouton "Partager" proéminent sur la fiche (Detail) via ShareMenu prominent (testid detail-share-prominent; icône header = detail-share-icon).
- Endpoints: POST/GET /api/profiles, GET /api/profiles/{id}, GET/POST/DELETE /api/announcements, welcome_messages dans /api/settings.
- Testé: testing_agent iteration_15 → 11/11 backend, 9/9 frontend. OK.
- NOTE avatars IA générés: ABANDONNÉS sur demande user (upload perso uniquement).
- NON FAIT (à faire) : envoi RÉEL d'emails de notification (nécessite intégration email type Resend + clé API/domaine du user). Actuellement on ne fait que COLLECTER les emails.
- Ces features sont en PREVIEW : nécessitent un redéploiement pour apparaître en production.

## Social v2 — 23/07/2026
- Resend email : envoi d'emails aux abonnés lors d'une annonce (case "Envoyer aussi par email aux abonnés" dans AnnouncementsManager). Backend: resend lib, /api/email/status, _broadcast_email via BackgroundTasks. Env: RESEND_API_KEY, SENDER_EMAIL (onboarding@resend.dev), REPLY_TO_EMAIL (gmail user), PUBLIC_APP_URL. LIMITE: mode test Resend n'envoie qu'à l'email du compte tant qu'un domaine n'est pas vérifié. Envoi réel testé OK vers louzalabrichel@gmail.com.
- Menu mobile (TopBar réécrit, responsive): en mobile, bouton hamburger (mobile-menu-btn) ouvre un drawer avec header profil + Membres/Contact/Paramètres/Créer(admin) + son & Aa dupliqués en bas. Son (mute) et Aa (TextSizeButton) restent AUSSI visibles hors menu. Desktop = boutons complets + bouton Membres.
- Page Membres /membres (Members.js, publique): grille des profils (avatar/initiale, nom, lien Instagram). Admin peut retirer un membre (deleteProfile).
- Champ Instagram ajouté au profil (ProfileDialog + Profile model + saveProfile).
- Endpoints ajoutés: DELETE /api/profiles/{id}, GET /api/email/status, notify_email sur POST /api/announcements.
- Vérifié: curl (profils/instagram/delete/announce-notify), envoi email réel, screenshots (menu mobile, page Membres e2e avec profil Sora+Instagram, desktop).
- À FAIRE pour diffusion email complète: vérifier un domaine dans Resend (sinon envoi limité au compte owner).

## Social v2.1 — 23/07/2026 (ajustements UX)
- Page Membres : bouton "Créer mon profil" / "Modifier mon profil" (members-create-profile) ouvrant ProfileDialog. Fix crash import useState manquant.
- TextSizeButton : prop dropUp (ouvre le menu vers le haut) utilisé dans le drawer mobile.
- TopBar mobile : bouton "Menu" avec libellé + fond var(--brand) (change selon thème). Texte d'invitation "Personnalise ta station... dans les Paramètres" en haut du drawer.

## Social v3 — 23/07/2026 (favoris + notifications + nouveautés)
- Contexte (AppContext): favorites (localStorage sx_favorites) + toggleFavorite/isFavorite ; seenAnnouncements (sx_seen_ann) + markAnnouncementsSeen. Exposés dans value.
- Favoris: cœur cliquable sur PosterCard (poster-fav-{id}, span role=button pour éviter bouton imbriqué) + bouton favori sur la fiche Detail (detail-favorite). Nouvelle catégorie "Favoris" (愛, key __fav__) sur Home qui filtre par favoris.
- Notifications: badge rouge (unread = annonces non vues) sur boutons Profil + Nouveautés (desktop) et Menu (mobile) + pastille sur ligne menu-novelties.
- Page Nouveautés /nouveautes (Novelties.js): liste les annonces (date FR), marque tout comme vu à la visite (efface le badge). Accessible via TopBar desktop + menu mobile.
- AnnouncementBanner refactorisé pour utiliser le contexte (seenAnnouncements/markAnnouncementsSeen) → badge synchronisé.
- Vérifié: badge, page Nouveautés, filtre Favoris + toggle cœur (clic DOM natif), bannière. Compile OK.

## Social v3.1 — 23/07/2026
- Nouveautés (page + bannière) : affichent désormais l'affiche (poster) + le nom de l'œuvre liée + le titre de la nouveauté (ex: "Épisode 3 : C'est lui le commandant"). Le "titre" de l'annonce = titre de la nouveauté ; creation_id fournit poster+nom.
- Placeholder admin du titre d'annonce mis à jour en conséquence.
- TopBar : badge "Visiteur" retiré ; le badge n'apparaît qu'en mode déverrouillé ("Création"). Idem menu mobile (Mode création uniquement si admin). IoLockClosed retiré des imports TopBar.

## Home UX + Tutoriel — 23/07/2026
- Barre de recherche toujours visible (search-input) + bouton "Trier" (filter-toggle révèle le tri).
- Taille des affiches par défaut: "grand" sur PC, "compact" sur mobile (inchangé). resolvePoster AppContext.
- Fix titres coupés / décalage dernière fiche: .sx-poster max-height:100% + rail min-h-0 (les cartes ne dépassent jamais la hauteur du rail) + spacer de fin (w-[42vw] md:38vw) pour centrer la dernière carte.
- Bouton "Lancer" remonté sur PC (md:-mt-4, pb réduit).
- Nouvelle page Tutoriel /tutoriel (Tutorial.js): explique navigation, taille texte, personnalisation, lecture confort, ambiances, favoris, profil/membres, nouveautés, galeries. Liens: bouton "?" desktop (tutorial-btn) + ligne menu mobile (menu-tutorial).
- Bouton Paramètres PC en couleur d'accent (var --brand).
- Vérifié par screenshots (grand posters + titres OK, dernière fiche OK, tutoriel, recherche).

## Taille affiches/texte par appareil — 26/07/2026
- AppContext: états posterDesktop/posterMobile/textDesktop/textMobile + setPosterSizeFor(phone,v)/setTextScaleFor(phone,v) (écrit la clé sx_postersize_{desktop|mobile} / sx_textscale_{...} et applique en direct si c'est l'appareil courant). setPosterSize/setTextScale (appareil courant) synchronisent aussi ces états.
- Settings > Accessibilité: "Taille du texte" en 2 rangées Ordinateur/Mobile (testids text-desktop-*/text-mobile-*). Personnalisation: "Taille des affiches" en 2 rangées Ordinateur/Mobile (poster-desktop-*/poster-mobile-*).
- Défauts inchangés: PC affiches "normal", mobile "compact"; texte PC "grand", mobile "petit".
- Vérifié: sélection indépendante PC/mobile (sx_postersize_mobile=grand sans changer PC). Compile OK.

## Aperçu taille affiches — 26/07/2026
- Settings: composant MiniPoster (data-testid poster-preview) affiché à droite de chaque rangée (Ordinateur/Mobile) de la taille des affiches. Taille en px selon compact(40)/normal(58)/grand(78), transition animée, dégradé brand + fausses lignes de titre. Vérifié par screenshot.

## Guide Cosmic Bunny — 28/07/2026
- Mascotte-guide **Cosmic Bunny** (sans IA, phrases préenregistrées) : lapin en combinaison + casque d'astronaute (image transparente `/public/cosmic-bunny.png`, fond retiré via flood-fill). Toujours présente en bas à gauche, ouvrable au clic ; auto-ouverture à la 1ʳᵉ visite de chaque page.
- Composant `components/CosmicBunny.js` (rendu global dans `App.js`, dans le BrowserRouter). Bulle avec : texte humoristique, « Conseil suivant » (compteur i/n) sinon « Compris ! », fermeture (croix / tap mascotte), et « Je parle trop ? 🙉 Chut ! » (désactive les conseils auto, mascotte reste tappable). Ton humoristique et plein d'entrain.
- Contextes/pages : home, detail, **reader** (mode lecture — déclenché via événement `sx-cb-context` depuis `ChapterReader` au mount/unmount), settings, members, novelties, contact, tutorial. Mémoire des pages vues dans `localStorage sx_cb_seen`.
- Apparaît **seulement après l'entrée dans la station** : flag `sessionStorage sx_entered` posé par `App.js` (BootIntro onDone + early-returns quand intro off/déjà vue) + event `sx-entered`. Sur l'Accueil, la mascotte est surélevée (classe `cb-home`) pour ne pas chevaucher le bouton LANCER.
- Réglages (`Settings.js` → section « Cosmic Bunny », visible par tous) : toggles `sx_cb_hidden` (afficher/masquer la mascotte) + `sx_cb_tips_off` (conseils auto) + bouton « Revoir tous les conseils » (efface `sx_cb_seen`). Live via event `sx-cb-pref`. **Admin** : toggle global `cosmic_bunny_enabled` + éditeur des phrases par page (ajout/suppression, Enregistrer).
- Backend (`server.py`) : `SiteSettings.cosmic_bunny_enabled: bool` + `cosmic_bunny_tips: Dict[str,List[str]]` (défauts FR par page). GET/PUT `/api/settings` inchangés.
- Vérifié par screenshots : auto-open Accueil (1/4) + « Conseil suivant » (2/4), pas de chevauchement LANCER (mascotte y=920 / bouton y=999), section Paramètres + éditeur admin, masquage/affichage live.

## Cosmic Bunny v2 (image + boutons + ordre) — 28/07/2026
- **Image personnalisable** : `SiteSettings.cosmic_bunny_image` (data URI base64, max 2 Mo, comme les avatars). Paramètres → « Changer l'image » (upload) + « Réinitialiser » (revient à `/cosmic-bunny.png`). La mascotte et l'aperçu utilisent `settings.cosmic_bunny_image || "/cosmic-bunny.png"`.
- **Boutons dans les bulles** : chaque conseil peut proposer un bouton (`button_label` + `button_target` = route). Le modèle est passé de `List[str]` à `List[Dict[str,str]]` (`{text, button_label, button_target}`). `normalizeTip` gère la rétro-compat (string → objet). Rendu bulle : `.cb-cta` (data-testid `cb-cta`) qui navigue puis ferme/marque vu.
- **Bouton vers Paramètres dans les conseils du début** : 1ᵉʳ conseil de l'Accueil = « Personnaliser la station ⚙️ » → `/parametres` (défaut). Membres a aussi un bouton « Voir les membres ». `CB_TARGETS` = liste des destinations proposées (Aucun/Paramètres/Accueil/Membres/Nouveautés/Contact/Tutoriel).
- **Réordonnancement** : éditeur admin par conseil avec flèches ↑/↓ (`cb-tip-up/down-{page}-{i}`), + libellé bouton (`cb-tipbtn`), destination (`cb-tiptarget`), texte (`cb-tiptext`), suppression, ajout. Bouton « Enregistrer les phrases » (PUT settings). Upload image testids `cb-image-upload` / `cb-image-reset`.
- Vérifié par screenshots : CTA « Personnaliser la station » sur l'Accueil → navigue vers /parametres ; éditeur admin (image + libellé/destination + ↑/↓) ; réordonnancement confirmé (home-0 change après ↓).

## Cosmic Bunny v3 (multi-poses + décor thématique) — 28/07/2026
- **Nouveau design validé** : Cosmic Bunny = lapin humanoïde mignon/énergique (pas badass, pas timide ; a peur seulement si poursuivie), combinaison spatiale BLANCHE usée à accents pastel, casque à visière (visage caché), grandes oreilles souples. Générée par IA + détourée (chroma green key-out).
- **5 poses** (sprites transparents dans `/public/cosmic-bunny/`) : `wave` (coucou assuré), `thumbs` (pouce assuré), `excited` (saute de joie), `neutral` (repos), `sad` (triste quand on part). Mapping : ouverture/réouverture→wave ; « Conseil suivant »→thumbs ; « Compris ! » (fin)→excited (2,6 s) ; fermeture/CTA/« Chut »→sad/excited (temporaire) puis neutral. Timer via `useRef`.
- **Décor néon thématique** : la mascotte est un petit « stand » (104×138 px desktop / 84×112 mobile), `.cb-stage` = image `/cosmic-bunny/alley.jpg` (ruelle néon japonaise) recolorée automatiquement selon le thème via overlay `::after` `background:var(--brand); mix-blend-mode:color`. Le sprite dépasse du cadre (oreilles au-dessus). Fond image passé en style inline (`process.env.PUBLIC_URL`) car CRA ne résout pas les assets `public/` dans `url()` CSS.
- Si une **image custom** est uploadée (`cosmic_bunny_image`), elle remplace le set de poses (rendu circulaire `.cb-custom`). Aperçu Settings = `cosmic_bunny_image || /cosmic-bunny/wave.png`.
- Vérifié par screenshots : stand 104×138 + sprite 62×168 qui dépasse, recolorisation thème rouge, transitions de poses wave/thumbs/excited/sad OK, CTA fonctionnel. NB : un ancien `cosmic_bunny_image` (2,4 Mo, hérité de la migration prod) a été réinitialisé via le bouton admin « Réinitialiser ».


