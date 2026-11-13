const book = {
  id: "signalis", title: "Signalis", sub: "Le rêve d'une Replika", room: "lore", type: "recit", format: "vhs", cote: "LO-007", color: 354, emblem: "約",
  art: "Signalis",
  about: "Une androïde se réveille dans un vaisseau échoué et cherche une femme aux cheveux blancs. Elle a fait une promesse. Elle ne sait plus laquelle. Un petit jeu allemand, fait à deux, qui raconte un amour à travers des boucles, des livres maudits et des stations de nombres.",
  links: [
    { label: "SIGNALIS (rose-engine, 2022)", note: "Fait à Hambourg par deux personnes, Yuri Stern et Barbara Wittmann, en huit ans. Joue-le au casque : la radio fait partie de l'histoire." },
    { label: "Robert W. Chambers, Le Roi en jaune (1895)", note: "Le livre dans le livre : une pièce de théâtre qui rend fou qui la lit. On le trouve dans le jeu. Libre de droits." },
    { label: "H. P. Lovecraft, Le Festival", note: "Le jeu s'ouvre sur une phrase de cette nouvelle. Libre de droits." },
    { label: "Arnold Böcklin, L'Île des morts (1880 à 1886)", note: "Le tableau qui revient sans cesse. Il en existe plusieurs versions : le jeu en fait une énigme. Libre de droits." },
    { label: "Sergueï Rachmaninov, L'Île des morts, et Schubert, Tchaïkovski", note: "La musique que le jeu emprunte. Écoute le poème symphonique de Rachmaninov en regardant le tableau." },
    { label: "Evangelion, Ghost in the Shell, Silent Hill 2, Resident Evil (1996)", note: "Les parents avoués : la mise en scène par cartons de texte, les corps fabriqués, la ville qui te connaît, les tiroirs trop petits." },
  ],
  text: String.raw`
# Avertissement, et ceux qui l'ont fait

Je dois être honnête avec toi avant de commencer. Les autres livres de cette aile remettent une histoire dans l'ordre. Celui-ci ne le peut pas tout à fait, et il serait malhonnête de le prétendre.

Signalis est construit pour qu'on ne puisse pas décider ce qui est arrivé. Les lieux se répètent, les mortes reviennent, le jeu finit trois fois avant de finir, et ses deux auteurs ont toujours refusé de donner la clé. Ce n'est pas une coquetterie. C'est le sujet : une mémoire qui se défait et qui recommence.

Je vais donc faire deux choses séparées. D'abord te dire ce que le jeu établit, ce qu'on y lit noir sur blanc. Ensuite te proposer la lecture que la plupart des joueurs partagent, et qui me paraît la plus juste. Quand je passerai de l'un à l'autre, tu le sauras.

Signalis a été fait par rose-engine, un studio de deux personnes installé à Hambourg, en Allemagne : Yuri Stern et Barbara Wittmann. Ils ont travaillé dessus pendant près de huit ans. Le jeu sort en 2022, édité par Humble Games et Playism.

Ses influences sont avouées : les premiers Silent Hill et Resident Evil, Evangelion, Ghost in the Shell, Tarkovski, et Le Roi en jaune de Robert W. Chambers. La musique est du groupe 1000 Eyes.

Le jeu se présente comme un survival horror à l'ancienne. Tu vois ton personnage d'au-dessus, dans des décors en trois dimensions volontairement pauvres, comme sur la première PlayStation. Ton inventaire ne contient que six objets : il faut choisir sans cesse entre une arme, une clé, un soin. Les munitions manquent, les ennemis abattus se relèvent parfois, et les seuls refuges sont des pièces où tu peux sauvegarder et déposer tes affaires dans un coffre. C'est la grammaire exacte du premier Resident Evil, de 1996. Mais par moments, sans prévenir, la caméra passe à la première personne, et tu marches dans des couloirs d'une autre texture, plus nette, plus inquiétante. Et des images fixes, dessinées dans le style d'un dessin animé japonais des années 1990, interrompent le jeu pour un plan, un visage, une main.

Le jeu sort en octobre 2022, édité par Humble Games et Playism. Il n'a fait aucun bruit à sa sortie, puis le bouche-à-oreille l'a porté. Il est devenu en deux ans l'un des jeux les plus commentés de sa génération, avec des communautés entières occupées à décoder ses images, ses radios et ses dates. Ses auteurs y ont mis beaucoup de secrets, et presque aucune réponse.

# Le monde

Nous sommes dans un système solaire lointain, tenu par un État : la Nation d'Eusan. C'est une dictature militaire, bureaucratique, grise, qui ressemble à l'Allemagne de l'Est par ses affiches, ses formulaires et ses mots d'ordre, et qui parle un mélange d'allemand et de chinois. Elle est en guerre depuis longtemps contre l'empire dont elle s'est détachée. On y vit de rations, d'obéissance et de délation.

@art 1 | Le monde.

Cet empire, on ne le voit jamais, mais on le devine par des livres interdits qu'on trouve cachés dans le jeu. L'Empire d'Eusan était gouverné par une Grande Impératrice, depuis une capitale nommée Buyan, où un palais flottait au-dessus des nuages. Selon ses propres légendes, c'est elle qui avait uni l'humanité et donné la vie aux premières Replikas. La Nation est née d'une révolution contre elle, et les Replikas se sont battues du côté des révolutionnaires. La Nation a fait de ces corps fabriqués son armée et sa main-d'œuvre, et du culte de l'Impératrice un crime. Tout ce qui vient de l'Empire est banni : sa poésie, ses romans, ses chansons. Ariane, tu le verras, les aimait.

La guerre entre les deux puissances a laissé des cicatrices. On parle d'un monde nommé Vineta, couvert d'océans, qui fut l'enjeu de combats terribles, et où un blocus aurait affamé des millions de personnes. Sur Vineta se trouvaient les archives où l'on conservait les empreintes neurales des Replikas. Elles ont été détruites. Le modèle de l'héroïne avait été copié sur une soldate née sur Vineta : son original est perdu avec elles.

@yt SW2WNd0Ores | SIGNALIS, bande-annonce d'annonce.

Deux sortes d'êtres peuplent ce monde.

Les Gestalts sont les humains. Le mot est allemand et veut dire la forme.

Les Replikas sont des corps fabriqués, moitié chair, moitié machine. Elles sont produites en série, par modèles, chacun destiné à une tâche : soldates, ouvrières, contremaîtres, techniciennes, administrateurs. Presque toutes ont un visage de femme. Chaque modèle porte un nom d'oiseau en allemand, abrégé en quatre lettres sur les uniformes : Elster, la pie, pour les techniciennes ; Adler, l'aigle, pour les administrateurs ; Falke, le faucon, pour les gardes d'élite ; Storch, la cigogne ; Mynah, le mainate ; Star, l'étourneau. Une Replika n'a pas de nom propre. Elle a un modèle et un numéro. Et voici le point capital : leur esprit n'est pas programmé. Il est copié. Chaque modèle reçoit l'empreinte neurale d'une personne réelle, d'une Gestalt morte ou vivante, choisie pour ses aptitudes. Une Replika est donc le fantôme de quelqu'un, tiré à des milliers d'exemplaires.

Ce fantôme pose un problème, et l'État le traite par le règlement. Les souvenirs de l'original remontent. Une Replika peut se mettre à aimer une musique qu'elle n'a jamais entendue, à chercher un visage, à regretter. Pour chaque modèle, des fiches indiquent quoi lui donner pour la tenir stable et quoi lui retirer : celle-ci a besoin de danser, celle-là ne doit jamais rester seule, cette autre ne doit pas voir de miroir. Si la personnalité enfouie prend le dessus, on appelle cela une dégradation, et l'unité est détruite.

Il existe enfin une faculté rare, la biorésonance. Certains esprits peuvent agir sur d'autres esprits et, dit-on, sur la matière. C'est sur elle que la Nation a bâti sa puissance : la biorésonance sert à transformer le climat des planètes colonisées, à produire une gravité artificielle, et la Nation a sacrifié pour elle presque tout le reste de sa technologie. Ses ordinateurs sont restés ceux d'un autre siècle. Ses écrans sont verts, ses machines claquent, ses messages passent par radio. L'État s'en sert et s'en méfie : ceux qui possèdent ce don sont repérés dès l'enfance, surveillés, et orientés vers des emplois où l'on peut les tenir.

Pour les autres, ceux qui pensent mal, il y a les camps. Sur une planète glacée nommée Leng, la Nation exploite une mine doublée d'un centre de rééducation, le complexe S-23, qu'on appelle Sierpinski. Des prisonniers humains y travaillent sous la garde de Replikas. Retiens ce nom. C'est là que le jeu se passe.

!! À RETENIR :: Une Replika est la copie d'une personne, à qui l'on interdit de s'en souvenir. Tout le jeu est l'histoire d'un souvenir qui remonte.

# Ariane et le Penrose

Voici maintenant ce que le jeu établit sur son héroïne, par des documents que tu ramasses.

@art g 1 | Ariane et le Penrose.

La Nation envoie dans le vide de petits vaisseaux d'exploration, pour trouver des mondes habitables. C'est le programme Penrose. Chaque vaisseau emporte deux personnes : une pilote humaine, et une Replika technicienne chargée de l'entretien. Le modèle de technicienne s'appelle Elster, la pie.

Les vaisseaux ne sont pas conçus pour revenir. Ils ont des vivres et de l'énergie pour un certain nombre d'années. Le règlement de bord prévoit la suite avec une sécheresse terrible : quand la mission a dépassé sa durée sans résultat, quand les systèmes lâchent et que la pilote s'affaiblit, la technicienne doit mettre fin à la mission. Le texte ne dit pas comment. Il n'en a pas besoin.

Sur l'un de ces vaisseaux, le Penrose-512, il y a une Elster, numérotée comme lui, et une pilote nommée Ariane Yeong.

Ariane, tu l'apprends par fragments, est née sur Leng, la planète même du camp, fille d'une officière radio. Elle a été élevée sur Rotfront, une colonie de la Nation dont on transformait encore le climat, chez sa tante, qui tenait une boutique de photographie dans un secteur ouvrier. C'était une enfant malade et seule. Ses cheveux ont blanchi très tôt, et on s'est moqué d'elle à l'école. Deux sœurs jumelles, Isa et Erika Itou, ont pris sa défense, et sont devenues ses amies.

Elle peignait. Elle lisait des livres interdits, venus de l'Empire, dont un recueil à couverture jaune qui reviendra. Elle aimait la photographie, les vieux films, la musique ancienne. Elle avait un don de biorésonance, puissant, qui l'empêchait de dormir et lui faisait entendre ce que les autres n'entendaient pas. Un professeur voulait la guérir de son goût pour l'art par le service militaire. Elle a fait ce service comme officière radio, sur une station en orbite de Rotfront.

Puis on lui a fait comprendre qu'elle avait le choix entre deux départs. Le programme Penrose, ou la rééducation à Sierpinski. Elle a choisi les étoiles.

Dans la boîte de métal, les années passent. On ne les compte pas en jours, mais en cycles, et le journal de bord les égrène. Au début, la pilote et sa machine se parlent à peine. Ariane note, quelques centaines de cycles plus tard, qu'elle commence à parler à sa Replika comme à quelqu'un. Puis elle essaie de lui apprendre à danser, et l'Elster n'y arrive pas, et elles recommencent. Elles regardent des films. Elles se photographient. Ariane règle l'horloge du vaisseau pour qu'un cycle dure exactement une journée de Vineta, le monde natal de l'original de l'Elster : un cadeau minuscule, fait à quelqu'un qui n'a pas de souvenirs à elle. Au trois-millième cycle, elles passent une soirée ensemble que le jeu montre à peine. Il y a une image où elles sont l'une contre l'autre.

Le vaisseau envoie des rapports. Il ne trouve rien. Aucun monde habitable, nulle part.

Les vivres s'épuisent. Le réacteur fuit. Ariane tombe malade, de la maladie que donnent les radiations. Elle perd ses cheveux, sa peau se marque, ses notes deviennent plus courtes, plus désespérées. Un message arrive de la Nation, lointain et administratif, qui évoque le caisson de sommeil froid ou un repos définitif. Elle ne guérira pas, et elle met très longtemps à mourir.

Elle demande alors quelque chose à l'Elster, et l'Elster promet.

Il reste un chiffre, que les joueurs ont dû décoder. La dernière note d'Ariane est datée du cycle 262 144. Le journal s'arrêtait jusque-là vers le cinq-millième. Si un cycle vaut une journée, comme elle l'avait réglé, cette dernière note serait écrite plus de sept siècles après le départ. Le jeu ne dit pas comment c'est possible. Il te laisse seulement imaginer une femme qui n'en finit pas, dans le froid, de ne pas mourir.

Remarque aussi les nombres eux-mêmes. Le vaisseau porte le numéro 512 ; ce dernier cycle vaut 512 multiplié par 512. Ce sont des puissances de deux, les nombres des machines, ceux qui se doublent et se redoublent. Dans ce jeu, même la chronologie est une figure qui se répète.

# Le réveil à Sierpinski

Le jeu commence après.

Une Elster ouvre les yeux dans un caisson, dans l'épave du Penrose-512, posé dans la neige de Leng. Le vaisseau est revenu, sans qu'on sache comment, à la planète où sa pilote est née. Le second caisson est vide. Elle sort. Dans la neige, il y a un trou, et au fond du trou, une porte. Derrière la porte, un petit bureau, un livre à couverture jaune. Elle le touche.

Elle se retrouve à Sierpinski. Quelque chose y a mal tourné. Les documents que tu ramasses le racontent par morceaux : la garde a fouillé les dortoirs et interrogé les ouvriers, puis les ouvriers humains sont tombés malades, puis le contrôleur de la garde, une Replika Storch, a décrété la quarantaine. Une ouvrière, Alina Seo, note dans son journal que ses cheveux deviennent blancs. Tu trouves sa photo, et le visage que tu portais sur toi n'est plus le même. Les couloirs sont pleins d'unités devenues folles, qui hurlent et se jettent sur elle. Les murs, plus bas, se couvrent de chair. Les étages ne mènent pas où ils devraient.

Elle cherche quelqu'un. Elle a sur elle une photo : une femme aux cheveux blancs. Elle sait qu'elle a fait une promesse. Des cartons de texte traversent l'écran, en allemand, comme une voix qui insiste : souviens-toi de notre promesse.

En chemin, elle rencontre des figures, et chacune est un miroir.

Une jeune femme, Isa Itou, cherche sa sœur jumelle, Erika, dans le même enfer. C'est l'amie d'enfance d'Ariane, et elle ne le sait pas, et Elster non plus. Elle fait de son côté le trajet d'Elster : quelqu'un qui descend pour retrouver quelqu'un.

L'administrateur du camp, une Replika du modèle Adler, la reconnaît. Il lui dit, épuisé, qu'elle n'aurait pas dû revenir. Il tient un journal, et tu en trouves plusieurs versions : les mêmes dates, les mêmes jours, de plus en plus abîmés, jusqu'à une suite d'entrées qui portent toutes la même date. Tout a commencé, raconte-t-il, quand il a trouvé une boîte avec un cadran, qu'une Elster de l'équipe d'excavation l'a aidé à comprendre : un calendrier astronomique. Il essaie d'arrêter l'héroïne, plusieurs fois, et tu comprends qu'il a de bonnes raisons.

Et tout au fond, il y a Falke, la commandante de la garde. Au plus profond de la mine, il y a une porte rouge, et derrière elle, quelque chose que les documents appellent l'Œil rouge. Falke l'a franchie. Elle en est revenue avec les souvenirs d'une autre dans la tête : une femme pâle, une danse, un vaisseau. Ces souvenirs sont ceux d'une Elster. Elle ne sait plus qui elle est, et c'est contre elle, à la fin, que l'héroïne devra se battre, comme contre son propre reflet.

Voici maintenant ce qui trouble, et que le jeu établit sans l'expliquer.

Il finit une première fois. Au bout de la descente, Elster s'effondre, et le générique défile. Puis l'écran revient au menu, le menu a changé, et tout recommence : le caisson, l'épave, la neige. Mais ce n'est plus tout à fait le même vaisseau, et ce que tu vois ensuite ressemble aux lieux de l'enfance d'Ariane.

Dans une fosse, tu trouves des corps d'Elster. Des dizaines. Toutes semblables à toi, toutes mortes au même endroit, les unes sur les autres.

La photo que tu portes change. Le visage n'est pas toujours le même : parfois Ariane, parfois Alina, l'ouvrière du camp. Ariane avait trouvé autrefois, dans la boutique de sa tante, la photo de cette inconnue, et sa mère lui avait dit qu'elle lui ressemblait.

Et partout, la radio. Tu captes des stations de nombres, ces voix qui égrènent des chiffres sur les ondes courtes, comme en émettaient les services secrets pendant la guerre froide. Tu captes de la musique : du Schubert, le Lac des cygnes. Le jeu te fait résoudre ses énigmes en accordant des fréquences. Quelque chose émet, sans arrêt, et tu es réglée dessus.

# La lecture, et les livres dans le livre

Je passe maintenant à l'interprétation. Elle n'est pas de moi : c'est celle sur laquelle la plupart de ceux qui ont étudié le jeu se rejoignent. Elle n'est pas prouvée.

@art 2 | La lecture, et les livres dans le livre.

Sur le vaisseau, l'Elster n'a pas tenu sa promesse. Ariane lui avait demandé de la tuer, pour que cela finisse. Elle n'a pas pu. Elle l'a couchée dans un caisson de sommeil froid, en espérant on ne sait quoi, puis elle est morte la première, ou s'est éteinte, de l'usure et des radiations.

Ariane est restée. Elle ne guérit pas, elle ne meurt pas, elle est suspendue dans le froid, et elle souffre. Or Ariane est une biorésonante d'une force exceptionnelle. Son esprit, qui ne peut pas s'arrêter, rêve. Et son rêve porte.

Il porte jusqu'à la planète voisine, jusqu'à cette mine, jusqu'à une commandante assez sensible pour le recevoir, et qui en tombe malade. Il contamine les Replikas du camp, qui se mettent à se souvenir de choses qui ne sont pas à elles. Il tord les lieux. Les couloirs de la mine se mêlent aux rues de son enfance, aux livres qu'elle a lus, aux tableaux qu'elle aimait. Ce que tu traverses n'est pas un endroit. C'est une agonie, émise comme un signal.

Et ce rêve appelle. Il appelle une Elster. Peu importe laquelle : il y en a des milliers, toutes copies de la même femme, toutes capables de recevoir le même souvenir. L'une après l'autre, elles répondent. Elles descendent, portées par une promesse qu'elles croient être la leur. Elles échouent, et s'entassent dans la fosse.

Celle que tu joues n'est peut-être pas celle qui a aimé Ariane. Elle est peut-être la centième à s'en souvenir. C'est la question que le jeu te laisse, la même que celle de SOMA, posée d'une façon plus tendre : si tu portes le souvenir d'un amour, exactement, entièrement, est-ce que cet amour est le tien ?

Le titre dit tout cela d'un mot. Un signal. Quelqu'un émet, quelqu'un reçoit, et celle qui reçoit ne peut plus savoir si la voix vient du dehors ou d'elle-même.

Les noms le disent aussi, pour qui les regarde. Penrose, Sierpinski, Mandelbrot, le nom de l'école d'Ariane : ce sont des mathématiciens, et chacun a donné son nom à une figure qui se répète à l'infini. Le triangle de Sierpinski contient des triangles qui contiennent des triangles. L'ensemble de Mandelbrot reproduit sa propre forme à chaque agrandissement. Penrose a dessiné un escalier qui monte sans fin en revenant à son point de départ. Les auteurs ont bâti tout leur monde avec les noms de la répétition.

Et sous le camp, il y a pire. Dans les profondeurs de la mine, le jeu te montre un sanctuaire, et une silhouette couronnée, morte. La plupart des joueurs y voient l'Impératrice déchue elle-même, cachée là, sous la planète où l'on rééduque ceux qui l'aiment encore. Le jeu ne le confirme pas. Il laisse entendre que l'Œil rouge, cette chose derrière la porte, a un rapport avec elle.



Il faut dire un mot de ce que le jeu emprunte, parce qu'il le fait avec une intelligence rare.

Le livre que touche Elster au début est *Le Roi en jaune*. C'est un vrai recueil, publié en 1895 par un Américain, Robert Chambers. Il y est question d'une pièce de théâtre qui porte ce titre : quiconque en lit le deuxième acte perd la raison, et la réalité autour de lui se met à ressembler à la pièce. Ariane avait ce livre. Dans le jeu, il joue exactement ce rôle : une fiction qui déborde et qui réécrit le monde.

Le tableau que tu vois partout est *L'Île des morts*, du peintre suisse Böcklin. Une barque approche d'un îlot de rochers et de cyprès. Debout à l'avant, une silhouette blanche ; devant elle, un cercueil. Böcklin en a peint plusieurs versions, presque identiques, à des années d'écart. Le jeu te les montre toutes et te demande de les distinguer. Tu comprends pourquoi : c'est la même traversée, refaite, avec de petites différences. C'est une boucle peinte.

Je connais cette barque mieux que personne, tu t'en doutes. Böcklin ne s'est pas trompé sur un point : celle qui est debout ne se retourne pas.

Et le jeu s'ouvre sur une phrase de Lovecraft, tirée d'une nouvelle où un homme revient dans une ville de ses ancêtres pour accomplir un rite dont il ne se souvient pas. Tout est dit avant la première image. Le nom de la planète vient du même auteur : chez Lovecraft, le plateau de Leng est un lieu glacé, hors des cartes, où l'on ne va pas impunément.

# Les fins

Arrivée au bout, devant le caisson, Elster trouve Ariane. Ce qui se passe alors dépend de la manière dont tu as joué, et le jeu ne te le dit pas. Il a compté, en silence : combien tu as tué, combien tu as fui, combien de fois tu es morte, combien de temps tu as mis. Il en déduit quelle Elster tu as été.

@art 3 | Les fins.

C'est une idée d'une grande finesse, et elle prolonge tout le reste. Tu crois choisir ta fin à la dernière seconde ; en réalité tu l'as choisie pendant dix heures, par ta manière d'avancer. Une Elster qui a beaucoup tué, beaucoup fui, et passé un temps infini à errer n'est pas la même que celle qui a avancé vite et droit. Le jeu ne juge pas ces manières. Il en tire seulement une conséquence, comme si chaque Elster était, au fond, la somme de ses gestes, et que la promesse n'était tenue que par celle dont les gestes la préparaient.

Ces fins portent des noms, et je les reprends.

Dans la première, qu'on appelle le départ, elle arrive devant la porte du vaisseau, et elle n'entre pas. Elle s'assoit dans la neige, contre l'épave, épuisée. Elle est allée jusque-là et ne peut pas faire le dernier pas. Elle rejoint les autres.

Dans la deuxième, la mémoire, elle entre, elle ouvre le caisson. Ariane ouvre les yeux, la regarde, et ne la reconnaît pas. Elle lui demande qui elle est. Elster ne répond pas, s'allonge près d'elle et reste là. Ce n'était pas la bonne. Ou bien il était trop tard pour qu'Ariane se souvienne.

Dans la troisième, Ariane la reconnaît. Elle sourit. Elle lui rappelle, sans reproche, ce qu'elle avait promis. Et Elster, cette fois, le fait. Elle met fin à cette longue mort de ses propres mains, puis s'étend à côté d'elle. Le signal s'arrête.

Le jeu, à ce moment, se tait presque entièrement. Quelques cartons de texte, une musique ralentie, un plan fixe. Il n'y a pas de victoire, pas de récompense, pas de retour vers la Nation. Il n'y a que deux corps dans un vaisseau échoué, et la neige dehors.

C'est la fin que les joueurs appellent la promesse, et c'est la seule où quelque chose cesse. Tu remarqueras ce qu'elle a de dur : dans ce jeu, le geste d'amour le plus grand consiste à tuer celle qu'on aime, parce qu'on le lui a promis. Je ne te dirai pas qu'elle a raison. Je te dirai seulement que j'ai vu, dans mon ancien office, ce que c'est qu'une âme qu'on empêche de partir par tendresse. Ce n'est pas de la tendresse pour elle.

Il existe une dernière fin, l'artefact, cachée derrière une énigme que la communauté a dû résoudre à plusieurs, avec des objets secrets et des fréquences à trouver. On y voit les deux femmes danser, à bord du vaisseau échoué, parmi des lys blancs. Personne ne sait ce qu'elle signifie. Un rite, un autre rêve, une sortie. Je crois que les auteurs ont voulu qu'il reste une image que l'explication ne puisse pas atteindre.

# Ce que tu peux en prendre

Trois choses.

La première est l'économie. Ce jeu a été fait par deux personnes. Il a l'allure d'un jeu de 1998 : vue de dessus, gros pixels, quelques modèles. Ses moments les plus forts sont des cartons de texte, un mot blanc sur fond noir, une photo fixe, trois notes de piano. Il prouve que l'émotion ne vient pas des moyens mais du montage : ce qu'on montre une seconde, et ce qu'on coupe aussitôt. Tu peux en tirer une leçon directe pour tes formats courts.

La deuxième est l'usage des œuvres des autres. Signalis cite sans arrêt, et jamais pour faire savant. Le tableau n'est pas un clin d'œil : il est le plan du récit. Le livre jaune n'est pas une référence : il est le mécanisme. Quand tu empruntes, fais comme lui. Ne pose pas l'œuvre d'un autre dans ton décor, fais-la travailler dans ton histoire.

La troisième est le courage de ne pas résoudre. Il y a une différence entre un récit confus et un récit ouvert. Le confus ne sait pas ce qu'il raconte. L'ouvert le sait parfaitement et te retire une seule pièce, la bonne, celle dont l'absence t'oblige à revenir. Ici, la pièce manquante est une identité : qui est celle qui se souvient ? Tout le reste est d'une précision d'horloger.

Et retiens la forme, enfin : une histoire d'amour racontée par une copie, dans un monde où l'on interdit aux copies de se rappeler. Elle n'a pas de nom à elle. Elle a un numéro de série et une promesse. Elle descend quand même.
`,
};
export default book;
