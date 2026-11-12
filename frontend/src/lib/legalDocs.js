// Textes des pages légales. {{cle}} = valeur de lib/legal.js · [texte](/lien) = lien · "• " = puce.
// Base rédigée à partir de la recherche de conformité (nov. 2026) — à faire relire par un professionnel.

export const DOCS = {
  mentions: {
    title: "Mentions légales",
    sections: [
      { h: "Éditeur du site", p: [
        "Le site Station Nexus est édité par {{editeur}}, {{statut}}, dont le siège est situé {{adresse}}.",
        "SIREN : {{siren}} · SIRET : {{siret}} · immatriculé au {{rcs}} et au Registre national des entreprises (RNE) · code APE : {{ape}}.",
        "Numéro de TVA intracommunautaire : {{tva_num}}.[[ {{tva_mention}}]]",
        "Contact : {{email}}[[ · téléphone : {{telephone}}]] · ou via la page [Contact](/contact).",
      ] },
      { h: "Directeur de la publication", p: ["{{directeur}}."] },
      { h: "Hébergement", p: [
        "Le site est hébergé par {{hebergeur_nom}}, {{hebergeur_adresse}}, tél. {{hebergeur_tel}}.",
        "Les données sont stockées par ses prestataires {{hebergeur_stockage}}.",
      ] },
      { h: "Médiation de la consommation", p: [
        "En cas de litige avec un consommateur, et après une réclamation écrite restée sans solution, le consommateur peut recourir gratuitement au médiateur : {{mediateur_nom}}[[, {{mediateur_adresse}}]][[, {{mediateur_site}}]]. Voir les [conditions générales de vente](/legal/cgv).",
      ] },
      { h: "Propriété intellectuelle", p: [
        "Les œuvres, textes, images, vidéos, musiques, logos et éléments graphiques de Station Nexus sont protégés par le Code de la propriété intellectuelle. Toute reproduction, extraction ou diffusion sans autorisation écrite est interdite. Voir les [conditions générales d'utilisation](/legal/cgu).",
      ] },
      { h: "Signaler un contenu", p: [
        "Tout contenu manifestement illicite peut être signalé à {{email}} (voir la rubrique « Signalement » des [CGU](/legal/cgu)).",
      ] },
      { h: "Données personnelles et cookies", p: [
        "Voir la [politique de confidentialité](/legal/confidentialite) et la [politique cookies](/legal/cookies).",
      ] },
    ],
  },

  cgu: {
    title: "Conditions générales d'utilisation",
    sections: [
      { h: "1. Objet", p: [
        "Station Nexus est l'espace en ligne de {{editeur}} ({{statut}}) consacré à ses créations : lecture de chapitres, épisodes et films, journal de bord, salon communautaire et abonnement de soutien.",
        "Les présentes conditions encadrent l'utilisation du site. Les achats et abonnements sont régis par les [conditions générales de vente](/legal/cgv).",
      ] },
      { h: "2. Acceptation", p: [
        "Utiliser le site, et a fortiori créer un compte, implique l'acceptation des présentes conditions dans leur version en vigueur, datée en bas de page.",
      ] },
      { h: "3. Âge minimum et mineurs", p: [
        "Le service est réservé aux personnes âgées d'au moins {{age_min}} ans. Votre date de naissance vous est demandée à l'inscription.",
        "Si vous avez entre {{age_min}} et 17 ans, vous devez avoir l'accord de l'un de vos parents (ou de votre responsable légal) pour créer un compte, et pour tout achat ou abonnement.",
        "Nous pouvons demander la confirmation de cet accord, et supprimer un compte créé en méconnaissance de ces règles.",
      ] },
      { h: "4. Compte", p: [
        "Vous vous engagez à fournir des informations exactes, à garder votre mot de passe confidentiel et à nous prévenir à {{email}} de toute utilisation frauduleuse de votre compte.",
        "La connexion avec Google est possible : nous recevons alors votre nom, votre adresse email et votre photo de profil Google.",
        "Vous êtes responsable de l'utilisation de votre compte.",
      ] },
      { h: "5. Profil public", p: [
        "Votre pseudo et votre avatar sont visibles des autres membres. L'affichage de votre palier de soutien est modifiable à tout moment dans vos paramètres.",
        "Nous vous conseillons de choisir un pseudo qui ne permet pas de vous identifier, surtout si vous êtes mineur.",
      ] },
      { h: "6. Salon et commentaires", p: [
        "Les échanges dans le salon et les commentaires doivent respecter les [règles de la communauté](/legal/communaute).",
        "Les messages privés ne sont pas publics : nous n'en prenons connaissance qu'en cas de signalement ou d'obligation légale.",
      ] },
      { h: "7. Vos contenus", p: [
        "Vous restez titulaire des droits sur les contenus que vous publiez (messages, images, fichiers).",
        "Vous concédez à l'éditeur, gratuitement et à titre non exclusif, pour le monde entier et pour la durée de leur mise en ligne, le droit de les reproduire et de les représenter sur Station Nexus et dans ses notifications, aux seules fins de faire fonctionner le service. Cette licence prend fin à la suppression du contenu, sous réserve des copies techniques temporaires et des obligations légales de conservation.",
        "Vous garantissez détenir les droits nécessaires sur tout ce que vous publiez ou envoyez.",
      ] },
      { h: "8. Propriété intellectuelle de l'éditeur", p: [
        "Les œuvres de Station Nexus sont protégées. L'accès, gratuit ou payant, vous confère un droit d'usage strictement personnel, privé et non cessible.",
        "Toute copie, capture, extraction, rediffusion ou mise à disposition de tiers est interdite et constitue une contrefaçon (articles L335-2 et suivants du Code de la propriété intellectuelle).",
      ] },
      { h: "9. Signalement des contenus illicites", p: [
        "Tout contenu que vous estimez illicite ou contraire aux règles peut être signalé avec le bouton « Signaler » (drapeau) présent sur chaque message du salon, chaque message privé et chaque commentaire. Vous pouvez aussi écrire à {{email}} ; le signalement doit alors indiquer :",
        "• les raisons pour lesquelles le contenu est illicite ;",
        "• son emplacement exact (lien, salon, date et heure) ;",
        "• vos nom et adresse email (sauf pour les contenus pédocriminels, qui peuvent être signalés sans identification) ;",
        "• une déclaration confirmant que vous agissez de bonne foi.",
        "Nous accusons réception du signalement par email, le traitons rapidement et vous informons de notre décision. Les décisions sont prises par un humain, sans système automatisé.",
        "Les contenus les plus graves (terrorisme, pédocriminalité, haine) peuvent aussi être signalés aux autorités sur [PHAROS](https://www.internet-signalement.gouv.fr).",
      ] },
      { h: "10. Modération et sanctions", p: [
        "En cas de manquement aux présentes conditions ou aux règles de la communauté, nous pouvons retirer un contenu, restreindre certaines fonctions, suspendre ou supprimer un compte, en proportion de la gravité.",
        "Nous vous expliquons les motifs de toute décision qui vous concerne (article 17 du règlement européen sur les services numériques). Vous pouvez la contester à {{email}}.",
      ] },
      { h: "11. Suppression du compte", p: [
        "Vous pouvez supprimer votre compte à tout moment depuis Paramètres → Compte → Mes données, ou en écrivant à {{email_rgpd}}. Un abonnement en cours est alors arrêté immédiatement, sans remboursement de la période entamée (sauf exercice du droit de rétractation).",
      ] },
      { h: "12. Disponibilité et responsabilité", p: [
        "Nous faisons de notre mieux pour que le site soit accessible, sans pouvoir le garantir en permanence (maintenance, incidents techniques).",
        "Pour les contenus publiés par les membres, nous agissons en qualité d'hébergeur : notre responsabilité ne peut être engagée que si, informés d'un contenu manifestement illicite, nous n'agissons pas promptement pour le retirer.",
      ] },
      { h: "13. Points de contact", p: [
        "Point de contact unique pour les autorités et pour les utilisateurs (règlement européen sur les services numériques, articles 11 et 12) : {{email}}, en français ou en anglais.",
      ] },
      { h: "14. Modification des conditions", p: [
        "Toute modification importante vous est annoncée au moins 15 jours avant son entrée en vigueur.",
      ] },
      { h: "15. Droit applicable", p: [
        "Les présentes conditions sont soumises au droit français. Si vous êtes consommateur, vous pouvez saisir la juridiction de votre domicile. Pour les litiges liés à un achat, voir aussi la médiation prévue dans les [CGV](/legal/cgv).",
      ] },
    ],
  },

  cgv: {
    title: "Conditions générales de vente",
    sections: [
      { h: "1. Vendeur", p: [
        "{{editeur}}, {{statut}}, {{adresse}} · SIRET {{siret}} · {{rcs}} · TVA intracommunautaire {{tva_num}} · contact : {{email}}[[, {{telephone}}]].",
      ] },
      { h: "2. Champ d'application", p: [
        "Les présentes conditions s'appliquent aux ventes conclues à distance sur Station Nexus avec des consommateurs :",
        "• l'achat à l'unité d'une création (accès numérique à une œuvre : chapitres, épisodes, film) ;",
        "• l'abonnement mensuel de soutien, proposé en plusieurs paliers.",
        "Elles sont acceptées lors de chaque commande. Leur version est datée en bas de page et conservée.",
      ] },
      { h: "3. Description des offres", p: [
        "Le contenu de chaque création (format, nombre de chapitres ou d'épisodes, durée) est présenté sur sa fiche. Les paliers d'abonnement, leurs prix et leurs avantages sont décrits sur la page [Soutien](/soutien).",
        "Compatibilité : les contenus se consultent en ligne, depuis un navigateur web récent sur ordinateur, tablette ou smartphone, avec une connexion internet et un compte Station Nexus. Sauf mention contraire, ils ne sont pas téléchargeables.",
      ] },
      { h: "4. Prix", p: [
        "Les prix sont indiqués en euros, toutes taxes comprises.[[ {{tva_mention}}]]",
        "Le prix applicable est celui affiché au moment de la commande. Pour l'abonnement, toute hausse de prix vous est annoncée au moins 30 jours à l'avance : vous pouvez alors résilier avant qu'elle ne s'applique.",
      ] },
      { h: "5. Commande", p: [
        "Un compte est nécessaire. Avant le paiement, un récapitulatif vous présente le contenu commandé, son prix et, pour l'abonnement, sa périodicité. Vous acceptez les présentes conditions et, pour un achat à l'unité, demandez l'accès immédiat au contenu (article 8).",
        "La commande est validée par le bouton « Commande avec obligation de paiement », puis le paiement est effectué sur la page sécurisée de notre prestataire Stripe. Le contrat est conclu dès la confirmation du paiement.",
        "Une confirmation reprenant les éléments de la commande, les présentes conditions et, le cas échéant, votre demande d'accès immédiat vous est adressée par email.",
      ] },
      { h: "6. Paiement", p: [
        "Le paiement s'effectue par carte bancaire via Stripe (Stripe Payments Europe, Ltd., Irlande). Vos données bancaires sont traitées par Stripe et ne sont jamais conservées par Station Nexus.",
        "L'abonnement est prélevé à la souscription, puis chaque mois à la même date.",
      ] },
      { h: "7. Accès aux contenus", p: [
        "L'accès est ouvert immédiatement après le paiement, depuis votre compte (rubrique Bibliothèque).",
        "Achat à l'unité : accès permanent tant que le service Station Nexus est exploité. En cas de fermeture définitive du service, vous en êtes informé au moins 3 mois à l'avance.",
        "Abonnement : accès au catalogue payant et aux avantages de votre palier tant que l'abonnement est actif.",
      ] },
      { h: "8. Droit de rétractation", p: [
        "Achat à l'unité : conformément à l'article L221-28, 13° du Code de la consommation, en cochant la case prévue avant le paiement, vous demandez l'accès immédiat au contenu numérique et reconnaissez perdre votre droit de rétractation dès le début de la fourniture. Cette demande est indispensable pour finaliser l'achat. Elle vous est confirmée par email.",
        "Abonnement : vous disposez de 14 jours à compter de la souscription pour vous rétracter, sans avoir à vous justifier. Vous êtes alors intégralement remboursé de la somme payée, au plus tard 14 jours après réception de votre décision, par le même moyen de paiement. L'accès au catalogue payant prend fin à la date de la rétractation. Ce délai s'applique à la première souscription, pas aux renouvellements mensuels.",
        "Pour exercer ce droit : utilisez la fonction [Renoncer au contrat ici](/retractation), ou envoyez le formulaire ci-dessous ou toute déclaration dénuée d'ambiguïté à {{email}}.",
        "Modèle de formulaire de rétractation (à compléter et envoyer uniquement si vous souhaitez vous rétracter) :",
        "• À l'attention de {{editeur}}, {{adresse}}, {{email}} :",
        "• Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de services ci-dessous :",
        "• Commandé le : … · Nom : … · Adresse : …",
        "• Signature (uniquement en cas de notification du présent formulaire sur papier) : … · Date : …",
      ] },
      { h: "9. Durée, renouvellement et résiliation de l'abonnement", p: [
        "L'abonnement est mensuel, sans engagement, et se renouvelle automatiquement chaque mois.",
        "Vous pouvez le résilier à tout moment via le lien [Résilier votre contrat](/resiliation), accessible en permanence en bas de chaque page, depuis vos Paramètres et votre Bibliothèque. La résiliation se fait en trois étapes et vous recevez un accusé de réception.",
        "Elle prend effet à la fin de la période mensuelle déjà payée, jusqu'à laquelle vous gardez votre accès. Hors exercice du droit de rétractation, la période entamée n'est pas remboursée.",
        "Nous pouvons résilier un abonnement en cas de manquement grave aux CGU, après vous en avoir exposé les motifs.",
      ] },
      { h: "10. Garantie légale de conformité", p: [
        "Les contenus et services numériques bénéficient de la garantie légale de conformité (articles L224-25-1 à L224-25-31 du Code de la consommation) :",
        "• pour un achat à l'unité, vous pouvez agir en cas de défaut de conformité qui apparaît dans les 2 ans suivant la fourniture ;",
        "• pour l'abonnement, la garantie s'applique pendant toute la durée de fourniture ;",
        "• vous avez droit à la mise en conformité du contenu, ou à défaut à une réduction du prix ou à la résolution du contrat ;",
        "• vous avez aussi droit aux mises à jour nécessaires au maintien de la conformité.",
      ] },
      { h: "11. Mineurs", p: [
        "Les membres âgés de {{age_min}} à 17 ans doivent obtenir l'accord de l'un de leurs parents avant tout achat ou abonnement ; ils le confirment en cochant une case dédiée avant le paiement.",
        "Sur demande justifiée d'un titulaire de l'autorité parentale, un achat ou un abonnement souscrit sans cet accord est annulé et remboursé.",
      ] },
      { h: "12. Réclamations et médiation", p: [
        "Toute réclamation peut être adressée à {{email}}.",
        "Si elle reste sans réponse satisfaisante, vous pouvez saisir gratuitement le médiateur de la consommation dans un délai d'un an à compter de votre réclamation écrite : {{mediateur_nom}}[[, {{mediateur_adresse}}]][[, {{mediateur_site}}]].",
      ] },
      { h: "13. Preuve et archivage", p: [
        "Les enregistrements de nos systèmes (commande, acceptation des conditions, demande d'accès immédiat) valent preuve des échanges.",
        "Les contrats d'un montant égal ou supérieur à 120 € sont archivés pendant 10 ans, et vous pouvez y accéder sur demande.",
      ] },
      { h: "14. Données personnelles", p: ["Voir la [politique de confidentialité](/legal/confidentialite)."] },
      { h: "15. Droit applicable", p: [
        "Les présentes conditions sont soumises au droit français, sans vous priver de la protection des dispositions impératives du pays de votre résidence.",
      ] },
    ],
  },

  confidentialite: {
    title: "Politique de confidentialité",
    sections: [
      { box: true, h: "En bref (spécialement si tu as entre 15 et 17 ans)", p: [
        "• On garde seulement ce qu'il faut pour faire marcher la Station : ton compte, tes achats, tes messages.",
        "• On ne vend jamais tes données et on ne fait pas de publicité ciblée.",
        "• Ton paiement est géré par Stripe : on ne voit jamais ta carte bancaire.",
        "• Tu peux récupérer ou supprimer tes données toi-même dans Paramètres → Compte → Mes données, ou nous écrire à {{email_rgpd}}.",
        "• Si quelque chose te gêne, tu peux aussi te plaindre à la CNIL, l'autorité qui protège les données en France.",
      ] },
      { h: "1. Responsable du traitement", p: [
        "{{editeur}}, {{statut}}, {{adresse}}. Contact pour toute question sur vos données : {{email_rgpd}}.",
      ] },
      { h: "2. Données que nous traitons", p: [
        "• Compte : email, mot de passe (enregistré sous forme chiffrée), pseudo, avatar, date de naissance (pour vérifier l'âge minimum et protéger les mineurs) ; avec la connexion Google : nom, email et photo de profil Google.",
        "• Achats et abonnements : historique, palier, statut, dates. Les données de carte bancaire sont traitées uniquement par Stripe.",
        "• Salon : vos messages, fichiers envoyés, réactions et messages privés.",
        "• Commentaires sous les œuvres : le nom que vous indiquez et votre texte. Ils ne sont pas rattachés à votre compte : pour les retrouver ou les supprimer, écrivez-nous en indiquant le nom utilisé.",
        "• Signalements, rétractations et résiliations : les informations que vous transmettez et nos réponses.",
        "• Newsletter : votre adresse email, uniquement si vous cochez la case prévue (à l'inscription ou dans le formulaire newsletter).",
        "• Notifications : identifiant technique de l'appareil et préférence de notification, si vous les activez.",
        "• Données techniques : journaux de connexion et de sécurité.",
        "• Préférences (thème, sons, musique, progression de lecture) : enregistrées sur votre appareil.",
      ] },
      { h: "3. Pourquoi et sur quelle base", p: [
        "• Gérer votre compte, le salon et les commentaires : exécution du contrat (CGU).",
        "• Vendre, encaisser, facturer et gérer l'abonnement : exécution du contrat et obligations légales (comptabilité, droit de la consommation).",
        "• Conserver la preuve de vos consentements (date, heure, adresse IP, version des conditions) et de votre demande d'accès immédiat : obligation légale et intérêt légitime.",
        "• Vérifier l'âge minimum et recueillir l'accord parental pour les achats des mineurs : obligation légale et exécution du contrat.",
        "• Modérer et traiter les signalements : obligation légale (règlement européen sur les services numériques) et intérêt légitime.",
        "• Newsletter et notifications push : votre consentement, retirable à tout moment.",
        "• Sécurité du site : intérêt légitime.",
        "Mesure d'audience : {{mesure_audience}}",
      ] },
      { h: "4. Durées de conservation", p: [
        "• Compte : tant qu'il est actif. Un compte inactif depuis 24 mois est supprimé après vous avoir prévenu.",
        "• Pièces comptables : 10 ans. Contrats de 120 € ou plus : 10 ans. Preuves de consentement : 5 ans.",
        "• Messages : jusqu'à leur suppression ou celle de votre compte. Signalements et décisions de modération : 12 mois. Rétractations et résiliations : 5 ans.",
        "• Newsletter : jusqu'à votre désinscription, ou 3 ans après votre dernier contact.",
        "• Journaux techniques : 12 mois au plus.",
      ] },
      { h: "5. Destinataires et prestataires", p: [
        "Vos données ne sont ni vendues ni louées. Elles sont accessibles à l'éditeur et à ses prestataires techniques, dans la limite de leur mission :",
        "• Emergent Labs Inc. : hébergement du site, base de données et connexion Google (via ses sous-traitants Google Cloud, Amazon Web Services et MongoDB Atlas) ;",
        "• Stripe : paiement (Stripe est aussi responsable de ses propres traitements, notamment la lutte contre la fraude) ;",
        "• Resend : envoi des emails ;",
        "• Google : connexion avec Google et lecture des vidéos YouTube intégrées ;",
        "• les services de notification des navigateurs (Google, Mozilla, Apple), si vous activez les notifications.",
        "Les outils d'intelligence artificielle utilisés par l'éditeur dans son espace de travail privé ne reçoivent pas les données des membres, et vos données ne servent pas à entraîner des modèles d'IA.",
      ] },
      { h: "6. Transferts hors de l'Union européenne", p: [
        "Certains prestataires traitent des données aux États-Unis. Ces transferts sont encadrés par le cadre de protection des données UE–États-Unis (Data Privacy Framework) pour les entreprises certifiées, et à défaut par les clauses contractuelles types de la Commission européenne. Vous pouvez en obtenir copie à {{email_rgpd}}.",
      ] },
      { h: "7. Mineurs", p: [
        "Le site est ouvert à partir de {{age_min}} ans, âge auquel un mineur peut consentir seul au traitement de ses données en France. Pour les achats et abonnements, l'accord d'un parent reste nécessaire (voir les [CGV](/legal/cgv)).",
      ] },
      { h: "8. Sécurité", p: [
        "Mots de passe chiffrés, connexion sécurisée (HTTPS), accès restreints : nous prenons des mesures adaptées pour protéger vos données. En cas de violation présentant un risque, nous en informons la CNIL et, si nécessaire, les personnes concernées.",
      ] },
      { h: "9. Vos droits", p: [
        "Vous pouvez accéder à vos données, les rectifier, les effacer, en obtenir une copie dans un format réutilisable (portabilité), vous opposer à un traitement ou en demander la limitation, retirer votre consentement, et définir des directives sur le sort de vos données après votre décès.",
        "Depuis Paramètres → Compte → Mes données, vous pouvez télécharger toutes vos données ou supprimer votre compte vous-même. Pour toute autre demande, écrivez à {{email_rgpd}} : nous répondons sous un mois.",
        "Vous pouvez aussi introduire une réclamation auprès de la [CNIL](https://www.cnil.fr/fr/plaintes).",
      ] },
      { h: "10. Cookies et traceurs", p: ["Voir la [politique cookies](/legal/cookies)."] },
    ],
  },

  cookies: {
    title: "Cookies et traceurs",
    sections: [
      { h: "Ce dont il s'agit", p: [
        "Un traceur est une information lue ou enregistrée sur votre appareil lorsque vous visitez un site : cookies, mais aussi stockage local du navigateur (localStorage) et service de notifications.",
      ] },
      { h: "Ce que la Station utilise sans votre consentement (strictement nécessaire)", p: [
        "Ces traceurs restent sur votre appareil et ne servent à aucun suivi :",
        "• le jeton de connexion, qui vous garde connecté ;",
        "• vos préférences : thème, sons, musique, taille du texte, introduction déjà vue ;",
        "• votre progression de lecture, pour reprendre là où vous en étiez ;",
        "• vos choix concernant les traceurs.",
      ] },
      { h: "Services tiers", p: [
        "• Vidéos YouTube : les vidéos hébergées par YouTube (Google) et intégrées à certaines pages peuvent permettre à Google de lire ou de déposer des traceurs sur votre appareil, selon sa [politique de confidentialité](https://policies.google.com/privacy).",
        "• Notifications : elles ne sont activées que si vous le demandez dans vos Paramètres, et se désactivent au même endroit.",
        "• Paiement : il s'effectue sur la page sécurisée de Stripe, qui utilise ses propres traceurs pour la sécurité et la lutte contre la fraude ([politique de Stripe](https://stripe.com/fr/privacy)).",
        "• Polices de caractères : elles sont hébergées par la Station elle-même, sans appel à un service tiers.",
        "Mesure d'audience : {{mesure_audience}}",
        "La Station n'utilise aucun traceur publicitaire.",
      ] },
      { h: "Gérer vos choix", p: [
        "Vous pouvez à tout moment effacer les données de ce site depuis les réglages de votre navigateur, et désactiver les notifications dans vos Paramètres.",
      ] },
    ],
  },

  communaute: {
    title: "Règles de la communauté",
    sections: [
      { h: "L'esprit du salon", p: [
        "La Station est un lieu de création et d'entraide. On y vient pour partager, découvrir et se motiver, dans le respect de chacun.",
      ] },
      { h: "Respect", p: [
        "• Pas de harcèlement, d'insultes, de moqueries, de menaces ni de discrimination.",
        "• Pas d'acharnement : si quelqu'un te demande d'arrêter, tu arrêtes.",
      ] },
      { h: "Contenus interdits", p: [
        "• Contenus sexuels, violence choquante, apologie de la haine ou du terrorisme, drogues, contenus illégaux.",
        "• Arnaques, spam, liens douteux, usurpation d'identité, manipulation des votes ou des réactions.",
        "• Spoilers non annoncés : préviens toujours avant de dévoiler une intrigue.",
      ] },
      { h: "Protège-toi et protège les autres", p: [
        "• Ne partage jamais tes infos perso : adresse, téléphone, établissement scolaire, mot de passe.",
        "• Ne demande pas celles des autres, ni de photos, et ne propose pas de rencontre.",
        "• Un adulte ne doit jamais solliciter un mineur en message privé. Si ça arrive, signale-le immédiatement.",
        "• Victime ou témoin de cyberharcèlement ? Appelle le 3018 : c'est gratuit et anonyme.",
      ] },
      { h: "Les œuvres", p: [
        "• Ne partage que ce qui t'appartient ou que tu as le droit de diffuser.",
        "• Pas de copie ni de capture des contenus payants : ça prive le créateur de son travail.",
      ] },
      { h: "Signaler", p: [
        "Un message pose problème ? Touche le petit drapeau « Signaler » à côté du message (dans le salon, en message privé ou sous un commentaire), choisis la raison et envoie. Tu peux aussi écrire à {{email}}. Les contenus les plus graves peuvent également être signalés sur [PHAROS](https://www.internet-signalement.gouv.fr). En cas de danger immédiat, appelle le 17.",
      ] },
      { h: "Ce qui peut arriver", p: [
        "Selon la gravité : rappel des règles, suppression du message, suspension temporaire ou exclusion définitive. On t'explique toujours pourquoi, et tu peux contester la décision à {{email}}.",
      ] },
    ],
  },
};

export const DOC_ORDER = [["mentions", "Mentions légales"], ["cgu", "CGU"], ["cgv", "CGV"], ["confidentialite", "Confidentialité"], ["cookies", "Cookies"], ["communaute", "Communauté"]];
