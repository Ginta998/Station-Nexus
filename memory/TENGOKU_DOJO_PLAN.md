# 天国道場 — TENGOKU DŌJŌ · Plan de construction (à coller dans un NOUVEAU chat Emergent)

> **Comment utiliser ce document :** ouvre un **nouveau chat Emergent** et colle l'intégralité de ce fichier comme premier message. Il contient tout : la vision, le modèle économique, l'architecture technique, le schéma de données, et un plan de construction par phases. Le codebase **Stationexus** sert de base de départ (≈70 % réutilisable). Ce nouveau projet est une **évolution multi-utilisateurs payante** de Stationexus.

---

## 0. Résumé en une phrase
Tengoku Dōjō est une **plateforme web (PWA) d'apprentissage premium** au design cinématique japonais, où des membres **abonnés (Stripe)** progressent dans un parcours de formation « **Le Chemin des 7 Portes** » et accèdent à une **Bibliothèque** de contenus (livres, films, séries), la vie communautaire se déroulant sur **Discord**.

---

## 1. Les 2 piliers de l'app (+ 1 externe)

### 🏛️ Pilier 1 — La Bibliothèque (layout ES-DE, réutilisé de Stationexus)
- Reprend **exactement** l'expérience Stationexus actuelle : catégories, rail horizontal de posters, fond dynamique flouté, fiche détail avec bouton « Lancer », lecteur de chapitres immersif (webtoon), galeries, musique d'ambiance, thèmes japonais.
- **Différence clé** : le contenu est désormais **verrouillé derrière l'abonnement**. Un visiteur non-abonné voit les posters/aperçus mais ne peut pas « Lancer » (paywall).

### ⛩️ Pilier 2 — Le Chemin des 7 Portes (layout parcours vertical / progression)
- **Nouveau layout** : un parcours d'apprentissage **vertical**, séquentiel, où l'élève franchit les 7 « portes » (門) une à une.
- Chaque **Porte** = un module contenant des **leçons** (vidéos YouTube non répertoriées + texte riche + ressources téléchargeables).
- **Progression déblocable** : une porte se débloque quand la précédente est complétée (ou déblocage libre — à décider). Barre de progression globale, badges/récompenses (thème « dōjō » : ceintures, sceaux).
- Suivi de progression **par utilisateur** (côté serveur, plus seulement localStorage).

### 💬 Pilier 3 — Communauté → **Discord** (externe)
- Pas de feed/forum développé dans l'app. À la place : **intégration Discord** (bouton « Rejoindre le dōjō sur Discord », widget Discord optionnel, lien d'invitation réservé aux abonnés).
- Possibilité future : synchroniser le rôle Discord « Abonné » via l'API Discord (backlog P2).

---

## 2. Modèle économique (Stripe)

### Abonnement principal
- **Un seul abonnement mensuel** qui débloque **TOUT** (Bibliothèque + les 7 Portes + accès Discord abonnés).
- Récurrent (Stripe **Subscription**, prix mensuel unique).

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

# --- Bibliothèque (repris de Stationexus) ---
Creation        { id, title, category, launch_type, poster(b64), bg(b64),
                  chapters[], episodes[], gallery[], release_month/year,
                  is_premium (bool) ... }

# --- Chemin des 7 Portes (NOUVEAU) ---
Gate (Porte)    { id, index (1..7), title, kanji, description, cover,
                  unlock_rule: sequential|free, order }
Lesson          { id, gate_id, order, title, youtube_id (SECRET, jamais
                  exposé aux non-abonnés), rich_content(html),
                  resources[], duration }
Progress        { id, user_id, lesson_id, completed (bool), completed_at,
                  scroll_ratio }  # progression PAR utilisateur, côté serveur

# --- Existant repris ---
Category, Comment, Ambience, Announcement, Subscriber(newsletter), SiteSettings
```

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

### Phase 4 — Le Chemin des 7 Portes (NOUVEAU layout)
- Modèles Gate/Lesson/Progress. CRUD admin des portes/leçons.
- Layout parcours vertical (portes 門, déblocage séquentiel, barre de progression, badges dōjō).
- Embed YouTube **protégé** (ID renvoyé seulement si abonné).
- Progression par user côté serveur.
- **Tester** : progression, déblocage, vidéo cachée pour non-abonné.

### Phase 5 — Importeur en masse
- Écran Admin Import : CSV/XLSX + images + docs. Parsing `pandas`/`openpyxl`, tâche de fond, rapport.
- **Tester** : import d'un CSV de démo + images → créations générées.

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

## 11. Points À CONFIRMER avec l'utilisateur au démarrage du nouveau chat
1. **Prix** de l'abonnement mensuel + prix/durées des packs d'accompagnement (3/6/12 mois).
2. Déblocage des 7 Portes : **séquentiel** (une par une) ou **libre** dès l'abonnement ?
3. Récompenses/badges du parcours (ceintures, sceaux) : souhaités dès le MVP ou plus tard ?
4. Object storage vs base64 pour les gros médias (si le volume est important).
5. Lien d'invitation Discord + faut-il synchroniser automatiquement le rôle « Abonné » ?
