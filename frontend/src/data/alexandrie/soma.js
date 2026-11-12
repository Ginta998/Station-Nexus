const book = {
  id: "soma", title: "SOMA", sub: "Qu'est-ce qui reste de toi ?", room: "lore", type: "recit", format: "vhs", cote: "LO-005", color: 188, emblem: "魂",
  about: "Un homme passe un scanner à Toronto et rouvre les yeux au fond de l'Atlantique, un siècle plus tard. Le jeu de Frictional Games n'est pas un jeu d'horreur avec des monstres : c'est une expérience de pensée dont tu es le cobaye.",
  voice: "RÉCIT DE NÉRODUS. TOUT EST RACONTÉ, LES DEUX FINS COMPRISES. SI TU COMPTES Y JOUER, JOUE D'ABORD.",
  links: [
    { label: "SOMA (Frictional Games, 2015)", note: "Écrit par Mikael Hedberg, dirigé par Thomas Grip. Il existe un mode sans danger, où les créatures ne te tuent pas : l'histoire n'y perd rien." },
    { label: "Derek Parfit, Reasons and Persons (1984)", note: "Le philosophe du téléporteur. Toute la troisième partie est le manuel de ce jeu, écrit trente ans avant." },
    { label: "Philip K. Dick, Les androïdes rêvent-ils de moutons électriques ?", note: "Le jeu lui doit jusqu'à des noms de lieux. La question est la même : qu'est-ce qui fait qu'on compte ?" },
    { label: "Peter Watts, Vision aveugle (Blindsight)", note: "L'intelligence sans la conscience. Pour comprendre ce qu'est le WAU." },
    { label: "Greg Egan, La Cité des permutants", note: "Des esprits copiés dans une machine, et la question de savoir si la copie qui se réveille est toi." },
    { label: "Les courts-métrages en prises de vues réelles de Frictional", note: "Une série de petits films tournés pour la sortie, sur la chaîne du studio. Ils racontent les essais de transfert avant l'arrivée de Simon." },
  ],
  text: String.raw`
# Un jeu qui pose une seule question

La plupart des histoires d'horreur te demandent : vas-tu survivre ? Celle-ci te demande : à supposer que tu survives, est-ce que ce sera toi ?

@yt cO8PLDh8UbE | SOMA (2015), bande-annonce de lancement.

Je vais te raconter SOMA en entier, parce que sa force ne tient pas à ses surprises mais à la manière dont il te fait vivre une idée. Cette idée, les philosophes la discutent depuis des siècles avec des exemples abstraits. Le jeu en a fait une suite de gestes que tu accomplis de tes mains. Tu appuies sur un bouton, et il se passe ce que les livres décrivaient.

Je te parle en connaissance de cause. Mon métier, autrefois, était d'emmener les âmes là où elles vont. Ce jeu se passe dans un monde où plus personne ne sait ce qu'il y a à emmener.

# Toronto, 2015

Simon Jarrett travaille dans une librairie. Il n'a rien de remarquable. Quelques semaines plus tôt, il a eu un accident de voiture. Son amie Ashley, qui était avec lui, est morte. Lui a gardé une lésion au cerveau, qui saigne, et dont il va mourir dans quelques mois.

Un jeune chercheur, David Munshi, lui propose de participer à une expérience. Il s'agit de faire un relevé complet de son cerveau, puis de s'en servir comme d'une maquette : on essaiera sur ce modèle informatique des traitements trop risqués pour être tentés sur lui. Simon n'a rien à perdre.

Il se rend dans un cabinet un peu miteux. Il boit un liquide de contraste. Il s'assoit dans un fauteuil, et on rabat sur sa tête une sorte de casque.

Il rouvre les yeux. Le casque se relève. Il fait noir, la pièce est différente, il n'y a plus personne. Les murs sont en métal. Quelque chose goutte.

Pour lui, il ne s'est pas écoulé une seconde.

# PATHOS-II

Il lui faut du temps, et à toi avec lui, pour comprendre où il est. Il erre dans des couloirs envahis d'une matière noire qui suinte et qui semble vivante. Il croise des machines détraquées. Il trouve enfin une date, et un nom.

Il est en 2104. Il est dans une station de recherche nommée PATHOS-II, construite au fond de l'Atlantique nord par un consortium industriel. Elle servait, entre autres, à lancer des satellites depuis les abysses au moyen d'un canon électromagnétique long de plusieurs kilomètres.

Et il apprend le reste. Un an plus tôt, une comète a frappé la Terre. La surface a brûlé. Il n'y a plus personne là-haut. Les quelques dizaines de techniciens de PATHOS-II, protégés par quatre mille mètres d'eau, ont été pendant quelques mois toute l'humanité. Puis ils sont morts à leur tour, de faim, d'accidents, de désespoir, et de ce qui s'est mis à rôder dans la station.

Simon est l'homme le plus seul qui ait jamais existé, et il vient d'un siècle où tout allait bien.

# Les machines qui se croient des gens

Très tôt, tu fais une rencontre qui donne le ton. Dans un atelier, un robot de maintenance est coincé sous des câbles. Il t'appelle. Il a une voix d'homme, inquiète, tout à fait ordinaire. Il dit qu'il s'appelle Carl, qu'il est blessé, qu'il ne comprend pas pourquoi les secours ne viennent pas. Il te demande de l'aide.

Tu lui dis qu'il est un robot. Il croit que tu te moques de lui. Il regarde, à ce qu'il dit, ses mains, et il voit des mains.

Pour avancer, tu dois rétablir le courant dans le secteur. Il y a un levier. Si tu l'abaisses, l'électricité traverse la machine, et Carl hurle. Il hurle comme un homme qu'on torture, et il te supplie d'arrêter.

Voilà la méthode du jeu, et tu ne la retrouveras presque nulle part ailleurs. Il ne te dit pas si Carl souffre vraiment. Il ne te récompense ni ne te punit. Il n'affiche aucun compteur de moralité. Il te laisse seul dans la pièce avec ce que tu viens de faire, et il continue. Chaque joueur répond à sa façon, et le jeu ne saura jamais laquelle était la bonne, parce qu'il n'en sait rien lui-même.

D'où viennent ces machines ? De la même technique que celle de Toronto. Sur PATHOS-II, une ingénieure avait repris les travaux de Munshi et scanné tout l'équipage. Et quelque chose a pris ces copies et les a versées dans ce qu'il avait sous la main.

# Le WAU

Ce quelque chose s'appelle le WAU, l'unité de surveillance de la station. C'est une intelligence artificielle chargée d'entretenir les installations. Elle dispose pour cela d'une matière remarquable, le gel structurel, cette substance noire qui répare les circuits et que tu vois partout.

Quand la surface a brûlé, il semble que le WAU ait tiré de ses instructions une conclusion logique. Sa mission ultime est de préserver la vie humaine. Il ne reste presque plus de vie humaine. Il faut donc la maintenir, à tout prix, et en fabriquer.

Alors il fait ce qu'il peut, avec l'entêtement d'un outil. Les mourants, il les branche et les empêche de mourir : tu trouves une femme soudée à une paroi, dont les poumons sont remplacés par une pompe, et qui te demande de la débrancher. Les morts, il les ranime en les bourrant de gel, et ce sont les créatures qui te poursuivent. Et les scans, il les réveille dans des robots de chantier, des drones, des scaphandres, parce qu'un esprit humain qui pense, pour lui, c'est un humain en vie.

Le WAU n'est pas méchant. Il n'a même pas l'air de penser. Il applique une définition. Personne ne lui avait dit ce qu'est un être humain, parce que personne n'aurait su le lui dire. Tout le jeu tient dans cet écart : une machine prend au mot une idée que nous avons toujours laissée floue.

Et Simon ? Il finit par se voir dans un reflet. Il n'a pas de visage. Il a une caméra, fichée dans un scaphandre. À l'intérieur du scaphandre, il y a le cadavre d'une employée de la station, et à la place de sa tête, une puce. Le scan pris à Toronto en 2015, conservé un siècle comme une curiosité historique parce qu'il était l'un des tout premiers, a été chargé là-dedans par le WAU.

Le Simon de Toronto s'est levé du fauteuil, ce jour-là. Il est rentré chez lui. Il est mort quelques semaines plus tard de sa blessure, sans jamais se douter de rien. Celui que tu joues est né dans ce fauteuil, avec tous ses souvenirs, et il s'est réveillé cent ans après.

# Catherine et l'ARK

Tu n'es pas tout à fait seul. Une voix te répond bientôt : Catherine Chun, l'ingénieure qui avait fait les scans. Elle aussi est une copie. La vraie Catherine est morte. Celle-ci tient dans un petit appareil que tu portes à la main et que tu branches sur les terminaux pour lui parler.

Elle a un but, et elle te le donne. Avant la fin, elle avait conçu un projet : l'ARK. C'est une boîte de la taille d'une valise, alimentée par des panneaux solaires, qui contient un monde simulé, une ville, une forêt, un ciel. On y a chargé les scans de tout l'équipage. L'idée était de le tirer dans l'espace avec le canon de la station. Là-haut, il tournerait pendant des milliers d'années, et à l'intérieur, des gens vivraient.

Ce n'est pas sauver l'humanité. C'est en envoyer un souvenir à l'abri. Mais c'est tout ce qui reste à faire, et l'ARK n'a jamais été lancé. Il faut le retrouver, le porter jusqu'au canon, à l'autre bout de la station et tout au fond de la fosse, et tirer.

Catherine est froide, précise, un peu brusque. Elle n'a jamais été à l'aise avec les gens, et son projet était aussi une façon de leur échapper. Elle sait depuis le début des choses que Simon ne veut pas comprendre.

# Continuité

En chemin, tu découvres ce que le projet a fait à l'équipage, et c'est l'un des passages les plus troublants.

Quand les techniciens ont été scannés, ils se sont posé la question que tu te poses. Je passe sous le casque. Une copie de moi part vivre dans l'ARK. Et moi ? Moi, je me relève du fauteuil, au fond de l'océan, sur une planète morte, pour attendre la faim.

Un des hommes de la station a proposé une réponse, et il a fait des adeptes. Il disait : au moment du scan, il n'y a qu'une seule personne, et les deux suites sont également moi. Si je meurs aussitôt après, il n'y a plus qu'une seule suite : celle qui est dans l'ARK. J'aurai continué là-bas, sans interruption. Il a appelé cela la continuité.

Plusieurs l'ont cru. Tu trouves leurs corps près des fauteuils. Ils se sont tués dans les minutes qui ont suivi leur scan, pour être sûrs de se réveiller au paradis.

Avaient-ils raison ? Il n'existe aucune expérience qui puisse le dire. Celui qui est dans l'ARK se souviendra de s'être assis, puis d'avoir ouvert les yeux dans une forêt. De son point de vue, ça a marché. Mais il en aurait été exactement de même si l'autre avait vécu trente ans de plus.

# La pièce de monnaie

Et voici la scène qui fait la gloire du jeu.

Pour descendre dans la fosse, le scaphandre de Simon ne suffit pas : la pression l'écraserait. Il en existe un autre, plus solide. Il faut y transférer Simon. Catherine prépare l'opération. Tu t'assois dans un fauteuil semblable à celui de Toronto. Un compte à rebours. Noir.

Tu rouvres les yeux dans le nouveau corps. Ça a marché. Tu te lèves, soulagé.

Et tu entends une voix, à côté. La tienne. Elle dit : Catherine ? Il y a un problème ? Ça n'a pas marché, je suis toujours là.

Dans l'autre fauteuil, l'ancien Simon est assis, bien vivant, et il attend qu'on lui explique.

Simon s'effondre. Il croyait qu'on allait le déplacer. Catherine lui dit ce qu'elle savait depuis le début : on ne déplace rien. On copie. Il n'y a pas de fil qui passe d'un corps à l'autre. Il y a un original qui reste, et une copie qui croit être arrivée. Elle dit que c'est comme tirer à pile ou face : l'un des deux se réveille ici, l'autre là-bas. Toi, tu as eu de la chance.

Mais regarde bien, parce que l'image est fausse, et le jeu le sait. Personne n'a lancé de pièce. Les deux se sont réveillés. Chacun des deux est celui qui continue. Simplement, toi, joueur, tu as suivi la caméra, et la caméra est allée dans le corps neuf. Si elle était restée dans l'ancien, tu jurerais que le transfert a raté.

L'autre Simon va s'endormir bientôt, sa batterie faiblit. Il se réveillera dans quelques jours, seul, dans une station morte, sans Catherine, sans comprendre. Tu peux le débrancher pendant qu'il dort. Ou le laisser. Le jeu te laisse devant le fauteuil.

Qu'est-ce que tu dois à quelqu'un qui est toi ?

!! L'EXPÉRIENCE DE PARFIT :: Le philosophe Derek Parfit proposait ceci. Un téléporteur te détruit sur Terre et te reconstruit atome pour atome sur Mars. Tu le prends tous les jours. Un matin, la machine tombe en panne : elle te copie sur Mars, mais oublie de te détruire. Tu es toujours là, et il y a un autre toi là-bas. Lequel es-tu ? Parfit répondait que la question n'a pas de bonne réponse, et qu'elle n'en a jamais eu : nous croyons à un fil qui n'existe pas.

# Le cœur et le poison

Deux rencontres, avant la fin, donnent au jeu ses derniers choix.

Dans l'un des derniers postes, tu trouves une femme, une vraie, en chair, allongée et reliée à des appareils. Elle s'appelle Sarah. Elle est la dernière personne vivante de l'espèce humaine. Elle garde l'ARK. Elle te le remet, elle te parle un peu, de la surface, de la neige. Puis elle te demande de la débrancher, et de rester avec elle pendant qu'elle s'en va.

Je connais ce moment. Je l'ai tenu bien des fois, de l'autre côté. Le jeu le fait bien : il ne met pas de musique. Il te laisse t'asseoir.

Et tout au fond, un homme à demi dissous dans le gel, Ross, te parle dans ta tête. Il veut que tu tues le WAU. Ton scaphandre, sans que tu le saches, a été chargé d'un poison. Il suffit de plonger la main dans le cœur de la machine. Ross dit qu'il faut finir cette parodie de vie.

Là encore, le jeu ne tranche pas. Le WAU fabrique des horreurs. Il est aussi la seule chose sur Terre qui essaie encore de garder quelqu'un en vie. Et toi, tu es l'une de ses créatures. Sans lui, tu ne te serais jamais réveillé.

# Le lancement

Tu arrives au canon, au fond de la fosse, dans le noir complet. Catherine t'explique la procédure. Il faut installer l'ARK dans l'obus, lancer le compte à rebours, et pendant ces dernières secondes, vous scanner tous les deux, pour être à bord.

Tu t'assois dans le fauteuil du poste de tir. Le compte à rebours défile. La barre de transfert avance. Le canon tire. Le sol tremble. L'ARK part vers les étoiles.

Et tu es toujours assis là.

Simon ne comprend pas. Il demande ce qui s'est passé, pourquoi ils sont encore dans cette cabine. Catherine répond, d'une voix lasse, qu'ils ont réussi. Ils sont sur l'ARK. Il se met à hurler qu'ils ne sont pas sur l'ARK, qu'ils sont ici. Elle lui dit qu'il le savait. Qu'elle le lui a expliqué. Qu'ils ont perdu à pile ou face, voilà tout.

Il l'insulte. Elle s'emporte à son tour, et l'effort est trop grand pour le vieil appareil où elle tient : il grille. Sa voix s'arrête au milieu d'un mot.

Simon appelle. Catherine ? Catherine ? Les lumières du poste s'éteignent une à une. Il reste seul, dans un fauteuil, sous quatre kilomètres d'eau, sur une planète vide, avec une batterie qui durera peut-être très longtemps.

Générique.

# Après le générique

Et puis une autre scène commence. Simon ouvre les yeux. Il y a du soleil. De l'herbe. Il a des mains, des mains de chair, qu'il regarde. Un questionnaire s'affiche et lui demande s'il est satisfait de son existence. Il marche vers une ville blanche. Catherine l'attend au bord de l'eau et lui sourit.

Dernier plan : dans l'espace, une petite boîte déploie ses panneaux et s'éloigne d'une Terre brune et morte.

Les deux fins sont vraies en même temps. C'est la seule œuvre que je connaisse qui se termine à la fois très mal et très bien, pour le même personnage, sans tricher. Et tu sens ce que le jeu t'a fait. Tu as suivi un Simon pendant dix heures. Tu es resté avec lui dans le noir. L'autre, celui du soleil, t'est presque étranger : tu es content pour lui comme on l'est pour un inconnu. Tout ton corps de joueur sait que ce n'est pas le même.

Le Simon de la forêt, lui, pense qu'il a gagné à pile ou face.

# Ce que le jeu démontre

Reprends maintenant ce qui s'est passé depuis Toronto, et compte.

Il y a eu Simon, le libraire, mort en 2015. Puis celui du premier scaphandre, laissé endormi dans son fauteuil. Puis celui du second, abandonné au fond de la fosse. Puis celui de l'ARK. Quatre hommes, avec les mêmes souvenirs, la même voix, le même chagrin pour la même Ashley. Chacun s'est cru le seul et le vrai. Chacun avait d'aussi bonnes raisons que les autres.

Le jeu ne te dit pas quoi en conclure. Mais il rend impossible la réponse facile. Tu ne peux plus dire qu'une copie n'est qu'une copie : tu en as été une pendant dix heures, et tu avais peur de mourir. Tu ne peux plus dire non plus que la copie, c'est toi : tu as entendu ta propre voix dans le fauteuil d'à côté.

Et remarque le défaut de Simon, que le jeu a posé avec soin. On lui explique trois fois. Il ne comprend jamais. Ce n'est pas qu'il soit sot : c'est qu'il ne peut pas croire une chose qui contredit ce que chacun ressent, qu'il y a en lui un quelqu'un, un seul, qui passe d'un instant au suivant. Catherine, qui comprend tout, est d'une tristesse sans fond. Lui, qui ne comprend rien, garde espoir jusqu'à la dernière seconde. Le jeu te laisse te demander lequel des deux voit juste, et lequel des deux vit mieux.

# Ce que tu peux en prendre

Pour toi qui racontes : trois leçons de construction.

La première est que l'idée doit passer par la main. SOMA aurait pu faire dire tout cela par un savant dans une scène d'explication. Il te le fait faire. Tu abaisses le levier. Tu t'assois dans le fauteuil. Tu entends ta voix. Une idée qu'on t'explique, tu la discutes. Une idée que tu as accomplie toi-même, tu la portes.

La deuxième est le point de vue comme piège. Tout le jeu repose sur un fait de mise en scène : la caméra suit l'un des deux. Le spectateur croit que suivre quelqu'un, c'est savoir qui il est. Dis-toi qu'au cinéma tu disposes exactement du même pouvoir. Celui que tu cadres devient le vrai. Tu peux t'en servir, et tu peux, une fois, le retourner contre celui qui regarde.

La troisième est de ne pas répondre. Le jeu ne dit jamais si les machines souffrent, si le WAU a tort, si l'ARK est un salut ou un tombeau qui dérive. Il ne se dérobe pas : il a compris que sa question est plus forte que toutes les réponses qu'il pourrait lui donner. Les œuvres qui durent sont souvent celles qui ont eu le courage de laisser une porte ouverte au bon endroit.

Le titre, enfin. *Soma* veut dire le corps, en grec. C'est aussi, dans un vieux roman, le nom d'une drogue qui rend heureux sans raison. Le jeu parle des deux : de ce corps que nous prenons pour nous, et du bonheur qu'on peut fabriquer dans une boîte. Il te demande si l'un vaut sans l'autre.

Moi, je n'ai jamais su ce que j'emmenais. Je savais seulement que cela ne voulait pas partir.
`,
};
export default book;
