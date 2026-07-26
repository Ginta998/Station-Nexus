# 天国道場 — TENGOKU DŌJŌ · Plan de construction (à coller dans un NOUVEAU chat Emergent)

> **Comment utiliser ce document :** ouvre un **nouveau chat Emergent** et colle l'intégralité de ce fichier comme premier message. Il contient tout : la vision, le modèle économique, l'architecture technique, le schéma de données, et un plan de construction par phases. Le codebase **Stationexus** sert de base de départ (≈70 % réutilisable). Ce nouveau projet est une **évolution multi-utilisateurs payante** de Stationexus.

---

## 0. Résumé en une phrase
Tengoku Dōjō est une **plateforme web (PWA) d'apprentissage premium** au design cinématique japonais et à l'esprit **très « gaming »**, où des membres **abonnés (Stripe, 19,99 €/mois)** entrent dans un **Hub central** donnant accès à 3 espaces — **l'École**, **la Bibliothèque** et **la Communauté (Discord)** — et progressent dans des **formations** (la première : « **Le Chemin des 7 Portes** »).

---

## 1. Le principe « poupées russes » — le parcours de l'utilisateur

Tout est imbriqué, on plonge de plus en plus profond, et on peut **toujours remonter au Hub central sans jamais se perdre** :

```
Landing page (publique, vend le rêve)
   └─ Abonnement Stripe (19,99 €/mois)
        └─ Entrée dans l'écosystème → création du compte / profil
             └─ Tutoriel (onboarding gaming)
                  └─ HUB CENTRAL  →  3 espaces devant soi :
                       ├─ 🏫 ÉCOLE
                       │     └─ Formations disponibles (Le Chemin des 7 Portes, + d'autres à venir)
                       │          └─ Portes (門)  ← chaque porte = un chapitre du jeu
                       │               └─ Modules
                       │                    └─ Vidéos (YouTube non répertoriée)
                       │                         └─ Regarder la vidéo → Exercice → Poser une question (commentaires)
                       │                              → Passer à la suivante (progression sauvegardée)
                       ├─ 🏛️ BIBLIOTHÈQUE (layout ES-DE)
                       │     └─ Ressources triées PAR PORTE (par thématique) : livres, films, séries…
                       └─ 💬 COMMUNAUTÉ → Discord (serveur déjà existant)
```

**Règle d'or de navigation :** menu intuitif omniprésent + **retour au Hub central en 1 clic** + fil d'ariane (breadcrumb) à chaque niveau (Hub › École › Formation › Porte › Module › Vidéo). L'utilisateur ne doit **JAMAIS se sentir perdu**. Transitions et feedback visuel/sonore **très gaming** à chaque étape.

---

## 2. Les 3 espaces du Hub

### 🏫 Espace 1 — L'École (layout parcours / progression, esprit jeu vidéo)
- Contient **plusieurs formations** (extensible). La première : **Le Chemin des 7 Portes**.
- Hiérarchie : **Formation → Portes (門) → Modules → Vidéos**.
- Chaque **Porte** rapporte un **badge** quand elle est réussie.
- **Déblocage type jeu vidéo** : au départ seule la **Porte du Feu** est accessible ; **dès que l'élève réussit la Porte du Feu, TOUTES les autres portes se débloquent** (accès libre ensuite).
- Page vidéo = **regarder** (YouTube unlisted, ID protégé) + **exercice** + **poser une question** (fil de commentaires sous la vidéo) + **bouton « Suivant »** avec **progression sauvegardée par utilisateur** (côté serveur).
- Barre de progression, sceaux/badges, ambiance temple/dōjō, feedback gaming (halo, son, vibration à la complétion).

### 🏛️ Espace 2 — La Bibliothèque (layout ES-DE, réutilisé de Stationexus)
- Reprend **exactement** l'expérience Stationexus : rail horizontal de posters, fond dynamique flouté, fiche détail, lecteur immersif (webtoon), galeries, musique, thèmes japonais.
- **Tri principal par Porte** : chaque fiche appartient à **UNE seule porte** (thématique) → l'élève retrouve les lectures/films liés à la porte qu'il étudie.
- **Sections transversales** (en plus du tri par porte) :
  - **Favoris** ❤️ : l'utilisateur marque ses ressources préférées (repris de Stationexus, mais désormais **par utilisateur, côté serveur**).
  - **Nouveautés** ✨ : dernières ressources ajoutées, avec badge de notification (repris de Stationexus).
- **Choix du layout d'affichage** (bascule par l'utilisateur) :
  - **Horizontal** (rail ES-DE, défaut) · **Grille** (grid de posters, façon Netflix) · **Liste verticale** (liste compacte).
  - Préférence mémorisée par utilisateur.
- Contenu **verrouillé derrière l'abonnement** (aperçu visible, « Lancer » réservé aux abonnés).

### 💬 Espace 3 — La Communauté → **Discord** (serveur déjà existant)
- Pas de forum développé dans l'app : **carte « Communauté »** dans le Hub qui mène au **serveur Discord** (lien d'invitation réservé aux abonnés).
- Widget Discord optionnel. (P2) Synchroniser automatiquement le rôle Discord « Abonné » via l'API Discord.

---

## 2. Modèle économique (Stripe)

### Abonnement principal
- **Un seul abonnement mensuel à 19,99 €/mois** qui débloque **TOUT** (École + Bibliothèque + accès Discord abonnés).
- Récurrent (Stripe **Subscription**, prix mensuel unique = 19,99 €).

### Accompagnement personnalisé (offres premium à part)
- Packs d'**accompagnement 1:1** : **3 mois / 6 mois / 12 mois** (⚠️ *à confirmer par l'utilisateur — durées et prix à finaliser*).
- Peuvent être des **paiements uniques** (Stripe Checkout one-time) ou des abonnements à durée fixe. À trancher au moment de l'implémentation.

### Règles Stripe (IMPORTANT pour l'agent du nouveau chat)
- **Utiliser `integration_expert` pour Stripe** — ne PAS coder Stripe à la main.
- La **clé de test Stripe est déjà dans l'environnement du pod** — ne jamais demander de clé à l'utilisateur.
- Utiliser `emergentintegrations` (`StripeCheckout`) selon le playbook. Ne jamais coder les montants côté frontend : **définir un dictionnaire de prix fixe côté backend**.
- Créer une collection `payment_transactions` pour tracer chaque session (status: initiated/paid/failed/expired) et vérifier le statut via polling après redirection.

---

## 3. Authentification (NOUVEAU — Tengoku est multi-utilisateurs)

> Contrairement à Stationexus (mono-utilisateur, PIN admin en localStorage), Tengoku a de **vrais comptes** car Stripe exige un login.

- **Deux méthodes, les deux demandées :**
  1. **Email + mot de passe** (JWT classique).
  2. **Connexion Google** (Emergent-managed Google Auth).
- **Utiliser `integration_expert` AVANT d'écrire le moindre code d'auth** (obligatoire).
- Rôles : `visitor` (non connecté), `member` (connecté), `subscriber` (abonnement actif), `admin` (créateur/toi).
- Le **mode « Création / Admin »** de Stationexus est **conservé** mais désormais lié au rôle `admin` du compte (plus au simple PIN). L'admin peut créer/éditer tout le contenu (Bibliothèque + Portes) directement dans l'app, comme aujourd'hui.
- Stocker `is_subscriber` dérivé de l'état Stripe (webhook ou vérification à la connexion).

---

## 4. YouTube — vidéos non répertoriées, réservées aux abonnés

- Les vidéos sont **« non répertoriées » (unlisted)** sur YouTube → non trouvables publiquement, mais lisibles par quiconque a l'URL.
- **Stratégie de protection dans l'app :**
  - L'ID vidéo YouTube est stocké côté backend et **n'est JAMAIS renvoyé au frontend tant que l'utilisateur n'est pas abonné**. L'endpoint qui donne l'`iframe`/l'ID vérifie `is_subscriber` côté serveur.
  - Embed via `youtube-nocookie.com` + `modestbranding`, `rel=0`. Désactiver le téléchargement direct (impossible à 100 % sur YouTube, mais l'unlisted + l'ID caché suffit pour ce niveau de protection).
  - ⚠️ Être transparent avec l'utilisateur : une vidéo unlisted reste partageable si quelqu'un copie l'URL. Pour une protection forte, il faudrait un hébergeur type Mux/Vimeo Pro (backlog, hors scope initial).

---

## 5. Import en masse (importeur de ressources)

- Sources : **fichiers externes** — **CSV/Excel** (métadonnées : titre, catégorie, description, type…), **dossiers d'images** (posters/fonds), **documents** (contenu des chapitres/leçons).
- Construire un **écran Admin « Import »** :
  1. Upload d'un **CSV/XLSX** → mappage colonnes → prévisualisation → création en masse des créations/leçons.
  2. Upload **multiple d'images** → association automatique par nom de fichier (ex : `titre-slug.jpg` → poster de la création `titre-slug`).
  3. Upload de **docs** (`.docx`/`.md`/`.txt`) → conversion en contenu riche HTML des chapitres/leçons.
- Backend : endpoint `POST /api/admin/import` (multipart), parsing avec `pandas`/`openpyxl` pour Excel. Traiter en **tâche de fond** (BackgroundTasks) avec un rapport d'import (succès/erreurs par ligne).
- ⚠️ Gérer les **gros uploads** en chunks (limites proxy). Stocker images en base64 Mongo comme Stationexus, OU envisager **object storage** (voir §7).

---

## 6. Ce qu'on RÉUTILISE de Stationexus (≈70 %)

| Réutilisé tel quel | Adapté | Nouveau |
|---|---|---|
| Design cinématique + 13 thèmes japonais (CSS variables) | Home/Bibliothèque (ajout paywall) | Auth (JWT + Google) |
| Rail ES-DE + PosterCard + fond dynamique | Detail (verrou « Lancer » si non-abonné) | Stripe (abonnement + accompagnement) |
| Lecteur de chapitres immersif (ChapterReader) | Settings (admin lié au rôle, plus au PIN) | Layout « Chemin des 7 Portes » (parcours vertical) |
| Moteur de sons (sound.js) + intros (BootIntro) | Progression → côté serveur par user | Embed YouTube protégé par abonnement |
| Galeries + lightbox + RichTextEditor WYSIWYG | Backend : ajout `users`, rôles | Importeur CSV/images/docs |
| PWA (manifest, service worker) | — | Intégration Discord (bouton/lien abonnés) |
| Éditeur admin de contenu (EditorDialog) | — | Suivi de complétion des leçons/portes |

---

## 7. Stack & Architecture technique

- **Frontend** : React 18 (CRA) + Tailwind + React Router v6 + Context API (identique à Stationexus). Ajout d'un `AuthContext`.
- **Backend** : FastAPI + MongoDB (Motor async). Routes préfixées `/api`.
- **Intégrations (toutes via `integration_expert`)** : Auth JWT + Google (Emergent), Stripe (`emergentintegrations`, clé de test du pod), éventuellement Discord API (P2).
- **Stockage médias** : commencer comme Stationexus (**base64 en Mongo** + endpoints dédiés poster/bg/asset). ⚠️ Avec beaucoup de contenu payant, **envisager l'object storage** (via `integration_expert`) pour les images/audio lourds → meilleures perfs. À évaluer en Phase 2.
- **PWA installable** conservée.
- **Variables d'env** : uniquement via `.env` (MONGO_URL, DB_NAME côté backend ; REACT_APP_BACKEND_URL côté frontend). Ajouter les clés d'intégration fournies par les playbooks.

---

## 8. Schéma de données (MongoDB) — proposé

```
User            { id, email, password_hash?, google_sub?, name, avatar,
                  role: visitor|member|subscriber|admin,
                  is_subscriber (bool dérivé), created_at }

Subscription    { id, user_id, stripe_customer_id, stripe_subscription_id,
                  status: active|canceled|past_due, plan: monthly,
                  current_period_end, created_at }

Coaching        { id, user_id, duration_months: 3|6|12, status, stripe_session_id }

PaymentTx       { id, user_id, session_id, amount, currency, plan/pack,
                  payment_status: initiated|paid|failed|expired, created_at }

# --- École : Formations → Portes → Modules → Vidéos (NOUVEAU) ---
Formation       { id, slug, title, kanji, description, cover, order,
                  is_published }                       # ex : "Le Chemin des 7 Portes"
Gate (Porte)    { id, formation_id, index (1..7), title, kanji, element,
                  description, cover, badge, order,
                  is_gatekeeper (bool) }                # Porte du Feu = gatekeeper=true
Module          { id, gate_id, order, title, description }
Lesson (Vidéo)  { id, module_id, order, title,
                  youtube_id (SECRET, jamais exposé aux non-abonnés),
                  rich_content(html), exercise(html),
                  resources[], duration }
Progress        { id, user_id, lesson_id, completed (bool), completed_at,
                  scroll_ratio }                        # progression PAR user, côté serveur
Badge           { id, user_id, gate_id, awarded_at }    # 1 badge par porte réussie
Question        { id, lesson_id, user_id, name, text, created_at }  # Q/R sous la vidéo

# Règle de déblocage École : au départ seule la Porte gatekeeper (Feu) est
# accessible. Quand l'utilisateur complète TOUS les modules de la Porte du Feu,
# le backend débloque TOUTES les portes de la formation (flag calculé par user).

# --- Bibliothèque (repris de Stationexus + tri par Porte) ---
Creation        { id, title, category, gate_id (UNE porte / thématique),
                  launch_type, poster(b64), bg(b64),
                  chapters[], episodes[], gallery[], release_month/year,
                  is_new (bool, pour Nouveautés), is_premium (bool) ... }
Favorite        { id, user_id, creation_id, created_at }   # favoris PAR user, serveur
# Layout Bibliothèque (horizontal|grid|list) = préférence stockée par user.

# --- Existant repris de Stationexus ---
Category, Comment, Ambience, Announcement, Subscriber(newsletter), SiteSettings
```

---

## 8bis. Navigation & Hub (CRITIQUE — « ne jamais se perdre »)

- **Hub central** = écran d'accueil post-login : 3 grandes cartes/portails immersifs (École 🏫 / Bibliothèque 🏛️ / Communauté 💬) avec animation d'entrée gaming.
- **Retour au Hub en 1 clic** depuis n'importe quel niveau (logo/bouton « Hub » toujours visible).
- **Fil d'ariane (breadcrumb)** à chaque profondeur : `Hub › École › Le Chemin des 7 Portes › Porte du Feu › Module 2 › Vidéo 3`.
- **Menu latéral/inférieur intuitif** (responsive) toujours accessible.
- Transitions fluides entre niveaux + **feedback gaming** (son, halo, vibration mobile) — cohérent avec le moteur de sons/intros repris de Stationexus.
- Sur mobile : navigation tactile (swipe entre modules/vidéos), barre de progression persistante.

---

## 9. Plan de construction par PHASES (pour l'agent du nouveau chat)

> **Ordre recommandé : d'abord les parties dures (auth + paywall), puis on compose.**

### Phase 0 — Fondations (repartir de Stationexus)
- Copier le codebase Stationexus. Vérifier que Bibliothèque + lecteur + thèmes tournent.
- Nettoyer le PIN admin → préparer la bascule vers l'auth par rôle.

### Phase 1 — Authentification (HARD, à faire en premier)
- `integration_expert` → JWT email/mdp **ET** Google (Emergent).
- `AuthContext`, écrans Login/Register, gestion de session, rôles.
- Migrer le « mode Création » vers le rôle `admin`.
- **Tester** : inscription, login email, login Google, persistance de session, accès admin.

### Phase 2 — Stripe (HARD)
- `integration_expert` → abonnement mensuel + Checkout. Clé de test du pod.
- Dictionnaire de prix backend, `payment_transactions`, polling de statut, mise à jour `is_subscriber`.
- Écran « Devenir membre » (pricing).
- **Tester** : parcours d'achat test, statut passe à `paid`, `is_subscriber=true`, accès débloqué.

### Phase 3 — Paywall sur la Bibliothèque
- Verrouiller « Lancer » / lecteur / vidéos aux abonnés. Aperçus visibles pour tous.
- Endpoints protégés côté serveur (ne pas se fier au frontend).
- **Tester** : non-abonné bloqué, abonné débloqué.

### Phase 3.5 — Hub central + navigation (avant l'École)
- Écran Hub post-login avec 3 portails (École / Bibliothèque / Communauté), animation gaming.
- Système de navigation global : bouton « Hub » 1 clic + breadcrumb + menu responsive.
- **Tester** : on peut plonger et remonter à chaque niveau sans se perdre.

### Phase 4 — L'École : Le Chemin des 7 Portes (NOUVEAU layout)
- Modèles Formation/Gate/Module/Lesson/Progress/Badge/Question. CRUD admin.
- Hiérarchie drill-down : Formation → Portes → Modules → Vidéos.
- **Déblocage jeu vidéo** : seule la **Porte du Feu** (gatekeeper) est ouverte au départ ; sa complétion **débloque toutes les autres portes**.
- **1 badge par porte réussie.** Page vidéo = lecture + exercice + Q/R (commentaires) + « Suivant » + progression serveur.
- Embed YouTube **protégé** (ID renvoyé seulement si abonné).
- **Tester** : déblocage après la Porte du Feu, attribution de badge, vidéo cachée pour non-abonné, progression persistante, Q/R.

### Phase 5 — Bibliothèque triée par Porte + Importeur en masse
- Bibliothèque ES-DE reprise + tri des ressources **par Porte** (1 porte par fiche).
- **Sections transversales** : **Favoris** (par user, serveur) + **Nouveautés** (badge de notif).
- **Bascule de layout** : Horizontal (rail) / Grille / Liste verticale — préférence mémorisée par user.
- Écran Admin Import : CSV/XLSX + images + docs. Parsing `pandas`/`openpyxl`, tâche de fond, rapport.
- **Tester** : tri par porte, favoris, nouveautés, bascule des 3 layouts, import CSV + images.

### Phase 6 — Discord + finitions
- Bouton/section « Rejoindre sur Discord » (visible abonnés). Widget optionnel.
- (P2) Sync rôle Discord via API.
- PWA, polish, thèmes, PRD final.

---

## 10. Contraintes & rappels pour l'agent
- **Langue : répondre à l'utilisateur en FRANÇAIS.**
- **Toute intégration passe par `integration_expert`** (Auth, Stripe, Discord, object storage). Ne rien coder d'intégration à la main.
- **Clé Stripe de test = déjà dans le pod.** Ne jamais la demander.
- Routes backend préfixées `/api`. Frontend via `REACT_APP_BACKEND_URL`. Backend via `MONGO_URL`/`DB_NAME`. Pas de valeurs par défaut en dur.
- MongoDB : jamais renvoyer d'ObjectId brut (sérialiser en str).
- Gros uploads → chunks. YouTube unlisted → prévenir l'utilisateur de la limite de protection.
- Réutiliser au maximum les composants Stationexus (design, lecteur, sons, thèmes).

---

## 11. Décisions confirmées par l'utilisateur ✅
1. **Prix abonnement : 19,99 €/mois** (débloque tout).
2. **Déblocage École type jeu vidéo** : au départ seule la **Porte du Feu** est ouverte ; la réussir **débloque toutes les autres portes**.
3. **1 badge par porte réussie.**
4. **Serveur Discord déjà existant** (espace Communauté = lien vers Discord).
5. **Parcours « poupées russes »** : Landing → abonnement → compte/profil → tutoriel → Hub (3 espaces) → École › Formation › Porte › Module › Vidéo (regarder + exercice + Q/R + suivant).
6. **Navigation essentielle** : menu intuitif, retour au Hub facile, ne jamais se perdre, esprit très gaming partout.

## 11bis. Points restant à préciser (au démarrage du nouveau chat)
- **Packs d'accompagnement 1:1 (3/6/12 mois)** : prix + paiement unique ou abonnement ? (à confirmer plus tard, hors MVP).
- **Object storage vs base64** pour les gros médias (si volume important).
- **Sync automatique du rôle Discord « Abonné »** via l'API Discord : dès le MVP ou plus tard ?
- **Lien d'invitation Discord** exact à intégrer.
