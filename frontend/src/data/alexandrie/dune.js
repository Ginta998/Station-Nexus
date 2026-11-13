const book = {
  id: "dune", title: "Dune", sub: "L'épice, le Jihad et le piège du messie", room: "lore", type: "recit", format: "livre", cote: "LO-003", color: 28, emblem: "砂",
  about: "Un monde sans ordinateurs, une drogue qui tient l'empire, un adolescent qui voit l'avenir et ne peut pas l'empêcher. Herbert n'a pas écrit l'histoire d'un héros : il a écrit un avertissement.",
  links: [
    { label: "Frank Herbert, Dune (1965), Le Messie de Dune (1969), Les Enfants de Dune (1976), L'Empereur-Dieu de Dune (1981)", note: "Lis au moins les deux premiers ensemble. Le deuxième est la réponse de l'auteur à ceux qui avaient mal lu le premier." },
    { label: "Dune de Denis Villeneuve (2021 et 2024)", note: "Regarde la dernière scène du second film avec ce livre en tête : le regard de Chani dit ce que Herbert voulait dire." },
    { label: "Dune de David Lynch (1984)", note: "Raté, étrange, inoubliable. Il prend le parti du héros : c'est exactement le contresens que Herbert redoutait." },
    { label: "Frank Herbert, Les Hérétiques de Dune (1984) et La Maison des mères (1985)", note: "Les deux derniers livres du père, quinze siècles après l'Empereur-Dieu. Plus étranges, plus durs, et inachevés." },
    { label: "Jodorowsky's Dune (documentaire, 2013)", note: "Le film qui n'a jamais existé, et tout ce qu'il a semé." },
    { label: "T. E. Lawrence, Les Sept Piliers de la sagesse", note: "L'étranger qui prend la tête d'une révolte du désert. Une des sources du personnage de Paul." },
    { label: "Ibn Khaldoun, la Muqaddima", note: "L'idée que les peuples durs du désert renversent les empires amollis, puis s'amollissent à leur tour. Herbert en a fait le moteur de son histoire." },
  ],
  text: String.raw`
# Le malentendu, et ceux qui l'ont fait

On te racontera Dune comme l'histoire d'un jeune duc trahi qui se réfugie au désert, gagne l'amour d'un peuple opprimé, monte un ver géant et reprend ce qu'on lui a volé. C'est exact, et c'est un piège.

Frank Herbert l'a tendu exprès. Il a écrit une histoire de héros si bien faite que le lecteur veut que le héros gagne. Puis il a écrit la suite pour montrer ce que cette victoire coûte : des dizaines de milliards de morts. Il a dit et répété qu'il avait voulu mettre en garde contre les chefs charismatiques, et que les peuples devraient se méfier d'eux d'autant plus qu'ils semblent bons.

Je vais donc te raconter Dune dans l'ordre où il faut le comprendre. D'abord le monde, parce que tout y est construit pour produire un messie. Puis le garçon. Puis ce que le garçon voit venir. Puis ce qui vient.

Mais d'abord, celui qui l'a écrit.

Frank Herbert est né en 1920 à Tacoma, dans l'État de Washington, au nord-ouest des États-Unis. Il a grandi au bord de l'eau et des forêts, appris très jeune à pêcher, à chasser, à observer. Il a été photographe pendant la guerre, puis journaliste pendant des décennies, dans des quotidiens de la côte ouest. Il a aussi écrit des discours pour des hommes politiques, et il en est sorti avec une méfiance tenace pour le pouvoir et pour ceux qui le désirent. Il s'intéressait à tout : la psychanalyse, le bouddhisme zen, la navigation, l'écologie, les langues, l'histoire des religions.

En 1957, un journal l'envoie sur la côte de l'Oregon, près de Florence, faire un article sur des dunes qui avançaient et engloutissaient des routes, et sur les agronomes qui tentaient de les fixer en plantant des herbes. L'article n'a jamais paru. Il en est sorti six ans de recherches et un roman monstrueux, refusé par une vingtaine d'éditeurs avant d'être publié en 1965 par Chilton, une maison connue pour ses manuels de réparation automobile. Le livre reçoit le premier prix Nebula du roman, puis le prix Hugo l'année suivante. Il devient en quelques années le roman de science-fiction le plus vendu au monde. En France, il paraît chez Robert Laffont en 1970, traduit par Michel Demuth.

Herbert écrit cinq suites : *Le Messie de Dune* (1969), *Les Enfants de Dune* (1976), *L'Empereur-Dieu de Dune* (1981), *Les Hérétiques de Dune* (1984) et *La Maison des mères* (1985). Il meurt en 1986, en laissant l'histoire en suspens. Son fils Brian Herbert et l'écrivain Kevin J. Anderson ont ensuite publié de nombreux romans pour la compléter, à partir de notes retrouvées ; je m'en tiens ici aux six livres du père.

Le cinéma s'y est cassé les dents, puis a fini par réussir. Dans les années 1970, Alejandro Jodorowsky prépare une adaptation démesurée avec Moebius pour les dessins, H. R. Giger pour les décors des Harkonnen et Pink Floyd pour la musique : le film ne se fait jamais, mais ses planches circulent dans tout Hollywood. En 1984, David Lynch en tire un film étrange et mutilé par la production, que lui-même a renié. Une série télévisée suit en 2000. Puis Denis Villeneuve, en 2021 et 2024, en deux films, sur une musique de Hans Zimmer. C'est la première fois qu'une adaptation prend au sérieux l'avertissement du livre.

@yt NKXYtglYqm0 | Dune de Denis Villeneuve (2021), bande-annonce. L'adaptation qui a ramené le livre au premier plan.

# Un futur sans machines

L'histoire se passe dans plus de vingt mille ans. Et la première chose qui frappe, c'est ce qui n'y est pas : il n'y a pas d'ordinateurs. Pas de robots, pas d'intelligences artificielles.

Il y en a eu. Des millénaires avant le récit, les hommes avaient confié leur pensée à des machines, et ceux qui possédaient les machines avaient asservi les autres. Une révolte, à moitié guerre et à moitié croisade religieuse, a tout détruit : le Jihad butlérien. Il en est resté un commandement, inscrit dans le livre sacré de l'empire, la Bible catholique orange, qui a fondu en un seul texte les religions de l'ancienne Terre.

!! LE COMMANDEMENT :: Tu ne construiras aucune machine qui imite l'esprit humain. Dix mille ans après le Jihad, c'est encore la première des lois, et la plus respectée.

Regarde la conséquence, car c'est la plus belle idée de Herbert. Privée de machines, l'humanité a dû se perfectionner elle-même. Trois écoles sont nées, et chacune a fait de l'homme un outil.

Les Mentats sont des ordinateurs humains : des hommes entraînés depuis l'enfance à calculer, mémoriser et déduire sans émotion.

La Guilde spatiale détient le monopole des voyages entre les étoiles. Ses navigateurs, pour plier l'espace sans percuter un soleil, doivent entrevoir l'avenir. Ils y parviennent en respirant une drogue à des doses qui déforment leur corps.

Et il y a le Bene Gesserit. Un ordre de femmes qui a poussé la maîtrise du corps et de l'esprit jusqu'à pouvoir contrôler chaque muscle, lire un mensonge dans un battement de cil, et commander par la seule inflexion de la voix. Elles se présentent comme des conseillères et des épouses. En réalité, depuis des dizaines de générations, elles marient les grandes lignées selon un plan. Elles élèvent des êtres humains comme on élève des chevaux. Leur but est un homme : le Kwisatz Haderach, celui qui pourra voir là où elles ne peuvent pas, dans tous les passés et tous les avenirs. Un homme qu'elles entendent tenir.

Autour de ces trois écoles gravitent d'autres spécialistes, tout aussi inquiétants. Les docteurs de l'école Suk reçoivent un conditionnement si profond qu'ils sont réputés incapables de nuire à un patient : les grandes maisons leur confient leur vie pour cette raison. Les Tleilaxu, un peuple secret et méprisé, maîtrisent la génétique comme personne. Ils fabriquent des Danseurs-Visages, capables de prendre l'apparence de n'importe qui, et des gholas, des corps recréés à partir des cellules d'un mort. Les Ixiens, eux, fabriquent des machines aux limites de ce que la loi tolère, et l'on se demande toujours s'ils ne les dépassent pas.

Le monde politique a la même structure d'équilibre fragile. Au sommet, l'empereur Padishah, de la maison Corrino, qui règne depuis des millénaires. Sa force tient dans ses Sardaukars, des soldats élevés sur Salusa Secundus, une planète-prison si cruelle que ceux qui y survivent deviennent les meilleurs combattants de l'univers. En face de lui, le Landsraad, l'assemblée des grandes maisons nobles, chacune maîtresse de ses planètes, chacune avec son armée. Aucune ne peut défier l'empereur seule ; toutes ensemble, elles le pourraient. Et entre eux tous, une compagnie : le CHOAM, qui gère le commerce de l'empire. Ses parts sont la vraie mesure de la richesse, et le vrai signe du rang.

Les combats eux-mêmes portent la marque de ce monde. Chacun se protège par un bouclier, un champ de force qui arrête tout projectile rapide. Les armes à feu sont donc presque inutiles, et l'on se bat de nouveau au couteau et à l'épée, avec une lenteur calculée, parce que seule une lame lente traverse le bouclier. Une civilisation qui voyage entre les étoiles se bat comme au temps des duels. Ce mélange d'archaïsme et d'avenir est le goût propre de Dune : un futur qui ressemble à un Moyen Âge, ou à un empire ottoman, avec ses familles, ses vendettas, ses empoisonneurs et ses alliances par mariage.

!! À RETENIR :: Tout ce monde repose sur des hommes modifiés. Et presque toutes ces modifications dépendent d'une seule substance.

# L'épice et les Fremen

Elle s'appelle le Mélange, ou l'épice. Elle allonge la vie. Elle ouvre l'esprit. Elle donne aux navigateurs leur vision, aux Bene Gesserit leurs pouvoirs les plus hauts. Sans elle, plus de voyage, donc plus de commerce, donc plus d'empire. Ceux qui en prennent longtemps ont les yeux qui deviennent bleus sur bleu, et ne peuvent plus s'en passer sans mourir.

Et elle ne se trouve que sur une seule planète de tout l'univers connu : Arrakis, que ses habitants appellent Dune.

Tu vois ce que Herbert écrit, en 1965 : une ressource unique, enfouie sous un désert, dont dépend toute une civilisation, et autour de laquelle les puissances se déchirent pendant que le peuple qui vit dessus compte pour rien. Il n'a pas eu besoin de la nommer.

Arrakis est un désert total. Il n'y pleut jamais. L'eau y est si rare que cracher devant quelqu'un est une marque de respect, et que les morts sont distillés pour rendre leur eau à la tribu. Dans le sable vivent des vers longs de plusieurs centaines de mètres, attirés par toute vibration régulière, qui engloutissent les machines de récolte. L'épice vient d'eux : elle est un produit de leur cycle de vie. Détruire le désert, ce serait détruire les vers, et l'épice avec.

Le peuple de ce désert s'appelle les Fremen. L'empire les tient pour quelques milliers de pillards. Ils sont des millions, cachés dans des grottes, vêtus de combinaisons qui recyclent chaque goutte de leur sueur. La dureté de leur monde en a fait les meilleurs combattants qui soient. Et ils ont un rêve, qu'un savant impérial leur a donné : faire d'Arrakis, en plusieurs siècles, goutte après goutte, un jardin.

Ce savant s'appelait Pardot Kynes. L'empereur l'avait envoyé étudier la planète. Il est allé vivre chez les Fremen, a épousé l'une des leurs, et leur a révélé ce qu'ils ne savaient pas : qu'il y avait assez d'eau sous Arrakis pour la changer, à condition de la capter, de la garder et d'attendre trois cents ans. Les Fremen ont fait de ce projet une religion. Ils cachent dans des réservoirs souterrains des millions de litres, accumulés goutte à goutte, pendant que les Harkonnen les croient misérables. Quand l'histoire commence, Pardot est mort. Son fils, Liet-Kynes, a pris sa place : officiellement planétologiste de l'empereur, en secret chef des Fremen. Il a une fille, Chani.

Les Fremen vivent en communautés appelées sietch, creusées dans la roche, fermées par des sceaux qui empêchent l'humidité de s'échapper. Ils descendent de pèlerins errants, les Zensunni, chassés de monde en monde pendant des siècles avant de trouver refuge sur cette planète que personne ne voulait. Leur chef de sietch, quand Paul arrive, s'appelle Stilgar : un homme grave, loyal, qui obéit à la loi de sa tribu comme à une seconde nature.

Leurs coutumes sont toutes des réponses au désert. Ils portent des distilles, des combinaisons qui récupèrent la sueur, l'urine et l'humidité du souffle pour les rendre buvables. Ils marchent sur le sable d'un pas irrégulier, pour que les vers ne reconnaissent pas un rythme. Ils portent un couteau taillé dans une dent de ver, le krys, qui ne doit jamais être tiré sans verser le sang. L'eau d'un homme appartient à sa tribu : à sa mort, on la récupère, et sa famille reçoit des anneaux qui en marquent la quantité. Ce que l'empire prend pour de la barbarie est une comptabilité de survie.

Et ils vénèrent les vers. Ils les appellent Shai-Hulud, le vieil homme du désert, le grand-père de l'éternité. Ils savent ce que personne ne sait ailleurs : qu'on peut les monter. Avec des crochets plantés entre les anneaux, un homme peut ouvrir la chair sensible d'un ver et l'obliger à rester à la surface, puis voyager sur lui à travers des milliers de kilomètres de désert. Celui qui y parvient devient un homme accompli, un maître de sable. C'est l'autre secret de leur force : le désert, qui tue les machines de l'empire, est leur route.

Il faut ajouter une chose, parce que Herbert y tenait. Le peuple du désert parle une langue dont les mots viennent de l'arabe, sa religion emprunte au soufisme, ses guerriers rappellent les tribus bédouines qui ont suivi Lawrence d'Arabie pendant la Première Guerre mondiale. Herbert savait ce qu'il faisait : il racontait l'histoire, déjà vue, d'un étranger venu d'un empire qui prend la tête d'une révolte d'un peuple dont il partage à peine la langue. Et il savait comment elle finit.

# Le fief empoisonné

Le pouvoir, dans cet empire, tient sur trois pieds : l'empereur, les grandes maisons nobles, et la Guilde. Deux de ces maisons se haïssent depuis toujours.

Les Harkonnen sont des prédateurs. Leur maison tient Arrakis depuis quatre-vingts ans, et leur chef, le baron Vladimir, en tire une fortune par la terreur. Il est si gros qu'il se déplace porté par des suspenseurs, de petits appareils qui allègent son corps. Il est intelligent, patient, cruel par goût. Il a deux neveux : Rabban, une brute qu'il charge d'écraser Arrakis pour que la population le haïsse, et Feyd-Rautha, un jeune homme beau et vicieux qu'il destine au trône, et qui paraîtra en sauveur après la tyrannie de son frère. Son conseiller est un Mentat dévoyé, Piter de Vries, qui aime le mal comme un problème bien posé.

Les Atréides sont ce qu'un seigneur devrait être. Le duc Leto est juste, ses hommes l'adorent, et les autres nobles commencent à l'écouter. Sa maison tient par trois hommes qui sont autant de pères pour son fils. Thufir Hawat, le vieux Mentat, maître des assassins et de l'espionnage, qui a servi trois générations de ducs. Gurney Halleck, guerrier et poète, laid, balafré, qui joue de la balisette et chante entre deux combats. Duncan Idaho, maître d'armes, le plus loyal et le plus fougueux, que le duc envoie le premier chez les Fremen pour gagner leur confiance. Et il y a le docteur Yueh, médecin de l'école Suk, discret, mélancolique, qui a perdu sa femme aux mains des Harkonnen. C'est ce qui le condamne. L'empereur Shaddam IV, qui craint sa popularité, lui retire son monde d'origine, Caladan, une planète d'océans, et lui confie Arrakis à la place des Harkonnen. C'est un cadeau somptueux. C'est une exécution.

Leto le sait. Tout le monde le sait. C'est le premier trait de tragédie de ce livre : personne n'est dupe, et le piège fonctionne quand même, parce qu'un duc ne peut pas refuser un ordre de l'empereur. Leto y va en espérant gagner les Fremen à temps.

Il emmène sa compagne, dame Jessica, et leur fils de quinze ans, Paul.

Jessica est Bene Gesserit. L'ordre lui avait commandé de ne donner au duc que des filles, car le plan prévoyait encore une génération. Elle aimait Leto. Il voulait un fils. Elle a désobéi. De ce geste d'amour sort toute la catastrophe : le Kwisatz Haderach arrive une génération trop tôt, hors de tout contrôle. Et elle a enseigné à ce garçon les arts de son ordre, tandis que les meilleurs soldats du duc lui enseignaient la guerre et qu'un Mentat lui enseignait à calculer.

Avant le départ, la supérieure de l'ordre vient éprouver Paul. Elle lui fait mettre la main dans une boîte qui inflige une douleur atroce, une aiguille empoisonnée contre son cou : s'il retire la main, il meurt. C'est le test qui sépare, dit-elle, l'humain de l'animal. L'animal pris au piège se ronge la patte. L'humain reste dans le piège, endure, et attend de pouvoir tuer le chasseur. Paul tient. Il récite pour cela une prière que sa mère lui a apprise, la litanie contre la peur.

!! LA LITANIE :: Le Bene Gesserit enseigne que la peur détruit la pensée. La prière demande de la regarder en face, de la laisser passer à travers soi, puis de se retourner pour voir son chemin : là où elle est passée, il ne reste rien, et seul demeure celui qui l'a traversée.

La vieille femme ressort de l'épreuve troublée. Elle a senti dans ce garçon quelque chose qui ne devrait pas être là si tôt. Elle pose une question à Jessica, et le lecteur n'en comprend la portée que plus tard : et si c'était lui ?

Il reste une pièce à poser, la plus cynique de toute la machine, et celle que les lecteurs pressés oublient.

Le Bene Gesserit a un service nommé la Missionaria Protectiva. Depuis des siècles, il envoie des sœurs semer, sur les mondes primitifs, des légendes sur mesure : la venue d'une mère étrangère et de son fils, un sauveur qui connaîtra vos coutumes comme s'il était né parmi vous. Ce sont des assurances. Le jour où une sœur se retrouve en danger sur l'un de ces mondes, il lui suffit de reconnaître les signes et de les jouer : les gens la protégeront, croyant voir leur prophétie s'accomplir.

Les Fremen attendent un messie : le Mahdi, celui qui les mènera au paradis, la Voix venue d'ailleurs. Cette attente a été plantée chez eux.

Quand Paul arrive sur Arrakis, les gens murmurent sur son passage. Jessica comprend aussitôt, et elle sait s'en servir. Paul, lui, comprend autre chose : il va devenir le sauveur de ces gens, et ce sera un mensonge, et ils y croiront tout de même, et lui-même finira par ne plus savoir.

Les premières semaines sur Arrakis sont un huis clos politique. On découvre le palais d'Arrakeen, les serres, les domestiques qui espionnent, un piège mécanique, un chasseur-tueur, une petite machine volante empoisonnée, qui manque Paul de peu dans sa chambre. On découvre une femme de chambre fremen, la Shadout Mapes, qui offre à Jessica un krys pour l'éprouver. On découvre que les Harkonnen ont laissé derrière eux des récolteuses en mauvais état, des pilotes de transport vendus, des stocks vides. Le duc fait ce qu'il peut : il accompagne lui-même une récolte d'épice, voit un ver engloutir la machine, et sauve les ouvriers au lieu de l'épice. Les Fremen qui l'apprennent en parlent entre eux. Ce duc-là est différent. Il est trop tard.

# La chute et Muad'Dib

Elle vient vite. Un traître ouvre les boucliers de la ville. C'est le docteur Yueh, le médecin de la famille, un homme que son conditionnement rendait incapable de nuire, et que le baron a brisé en torturant sa femme. Les Harkonnen attaquent de nuit, et avec eux, déguisés, les soldats de l'empereur lui-même, les Sardaukars, élevés sur une planète-prison si cruelle que les survivants sont invincibles.

Le duc Leto meurt en essayant de tuer le baron. Yueh lui avait placé dans la bouche une dent empoisonnée, en lui disant de la briser devant son ennemi : le traître, sans espoir pour lui-même, offrait à son maître une dernière vengeance. Le gaz tue Piter de Vries ; le baron, lui, en réchappe. Thufir Hawat, capturé, passe au service des Harkonnen, persuadé que c'est Jessica qui a trahi. Paul et Jessica sont abandonnés dans le désert pour que le sable les efface.

Duncan Idaho les retrouve et meurt en couvrant leur fuite, l'épée à la main, contre des Sardaukars. Liet-Kynes les aide à leur tour, en pleine connaissance de cause, puis les Harkonnen le capturent et l'abandonnent sans eau dans le désert. Herbert lui donne une des plus belles morts du livre : en délirant, Kynes entend la voix de son père qui lui parle d'écologie, de systèmes, de conséquences, jusqu'à ce que le sable s'ouvre sous lui. Le savant meurt en récitant sa leçon.

Ils survivent, et c'est là, sous une tente, la nuit de la mort de son père, que l'esprit de Paul s'ouvre. L'épice qui sature l'air d'Arrakis, son hérédité préparée depuis des siècles, son entraînement : tout se rejoint. Il voit le temps comme un paysage, avec ses chemins.

Et sur presque tous ces chemins, il voit la même chose. Des légions fanatiques qui se répandent d'étoile en étoile sous une bannière verte et noire, en criant son nom. Une guerre sainte. Il emploie le mot : le jihad. Il comprend que l'espèce humaine, figée depuis dix mille ans dans ses castes et ses lignées, veut ce brassage violent, comme un organisme veut la fièvre, et qu'il en est l'occasion. Qu'il vive ou qu'il meure, d'ailleurs : mort, il serait un martyr.

Voilà ce qui distingue Dune de toutes les histoires d'élu. Paul sait. Dès la première nuit. Tout le roman est celui d'un garçon qui cherche le chemin étroit où il pourrait venger son père sans déclencher le massacre, et qui voit ce chemin se refermer à chaque pas.


Ensuite, le désert. Paul et Jessica volent un orni, un appareil à ailes battantes, et plongent dans une tempête de sable pour échapper aux poursuivants. Ils marchent, ils voient leur premier ver, ils apprennent à ne pas marcher en rythme. Les Fremen de Stilgar les recueillent. Un homme du sietch, Jamis, défie Paul selon la loi. Paul le tue en duel, son premier mort, et pleure : chez un peuple où l'on ne gaspille aucune eau, donner de l'eau aux morts est un prodige. Selon la coutume, il hérite de la femme et des enfants de Jamis, qu'il protège sans les prendre. Il reçoit un nom secret, Usul, et choisit son nom public : Muad'Dib, la petite souris du désert, celle qui sait survivre. Il aime une fille de la tribu, Chani. Jessica boit le poison sacré, le transforme dans son corps, et devient la Révérende Mère des Fremen, portant en elle la mémoire de toutes celles qui l'ont précédée. Elle était enceinte : sa fille, Alia, naîtra avec une conscience d'adulte.

Des années passent. Paul apprend à vivre comme eux, monte son premier ver, appelé par un martèlement dans le sable, et devient un maître de sable. Il enseigne aux Fremen la manière de combattre que lui ont apprise Duncan et Gurney, et ses commandos deviennent la terreur des Harkonnen. Il retrouve Gurney Halleck parmi des contrebandiers d'épice ; le vieux guerrier, qui croit Jessica coupable, manque de la tuer, et Paul doit s'interposer. Chani lui donne un fils, qu'ils appellent Leto, comme le duc. L'enfant meurt bébé, dans un raid des Sardaukars contre le sietch. Le livre ne s'y attarde pas. Paul non plus, et c'est le signe qu'il change.

La légende grossit toute seule. Chaque victoire resserre le piège, car chaque victoire est un miracle de plus. Les Fremen ne disent plus qu'il est un bon chef : ils disent qu'il est le Lisan al-Gaib, la voix venue d'un autre monde. Paul laisse dire. Il en a besoin pour gagner. Il sait ce que cela prépare.

Puis il fait ce qu'aucun homme n'a fait : il boit à son tour l'Eau de Vie, le poison que seules les femmes transforment. Il reste trois semaines comme mort. Quand il s'éveille, il est le Kwisatz Haderach. Il voit tout, y compris la flotte de l'empereur en orbite.

La fin est rapide. Les Fremen sortent de la tempête à dos de ver et écrasent les Sardaukars. La petite Alia, une enfant de quatre ans qui parle comme une vieille femme, tue le baron, son propre grand-père, d'une aiguille empoisonnée : car le roman a révélé entre-temps que Jessica était la fille secrète du baron, née d'une union arrangée par le Bene Gesserit. Le sang de l'ennemi coule dans le sauveur. Thufir Hawat, à qui les Harkonnen ont ordonné de tuer Paul, préfère mourir que trahir le fils de son duc. Paul affronte en duel Feyd-Rautha, l'héritier du baron, qui triche avec une lame empoisonnée cachée dans sa hanche, et le tue. Et il se tient devant l'empereur avec un argument unique. Il peut détruire toute l'épice. Les vers mourraient, la Guilde serait aveugle, l'empire finirait. Celui qui peut détruire une chose, dit-il, en est le maître.

L'empereur abdique. Paul épouse sa fille pour le trône, en promettant à Chani qu'elle seule sera sa femme. Le livre se termine sur un triomphe.

Mais lis la page d'avant. Paul regarde ses Fremen, qui le contemplent, et il comprend qu'il a échoué. Il voulait empêcher le jihad. Il est devant lui, dans leurs yeux. Plus rien ne peut l'arrêter, pas même lui.

# Le Messie

Herbert a vu que ses lecteurs applaudissaient. Il a écrit la suite contre eux. *Le Messie de Dune* est court, sombre, et commence douze ans plus tard.

Le jihad a eu lieu. Les légions de Muad'Dib ont soumis l'univers connu. Paul fait lui-même le compte, dans une conversation glaçante : soixante et un milliards de morts, quatre-vingt-dix planètes stérilisées, quarante religions anéanties. Il se compare aux tyrans de l'histoire ancienne et constate qu'ils étaient des amateurs. Il est empereur, il est dieu, et il ne contrôle rien : une bureaucratie de prêtres gouverne en son nom, et sa légende marche toute seule.

Cette Église a un nom, le Qizarat. Elle a ses missionnaires, ses inquisiteurs, ses pèlerinages vers Arrakis, et une pompe que Paul déteste. Alia, adulte maintenant, en est la grande prêtresse, et l'on vénère jusqu'à sa jeunesse. Les Fremen eux-mêmes ont changé : les guerriers du désert sont devenus des gouverneurs de planètes, des fonctionnaires, des fanatiques. Ils vivent dans des maisons, ils boivent de l'eau sans compter. Herbert montre le prix de la victoire sur ceux qui l'ont gagnée. Le peuple qu'on a libéré devient, une fois au pouvoir, ce qu'il combattait.

Le livre est construit comme une tragédie classique : peu de lieux, peu de personnages, une suite de conversations où chacun avance masqué, et une fin qu'on voit venir de loin. Herbert l'a voulu ainsi. Les lecteurs attendaient une épopée ; il leur a donné une pièce de chambre, sombre et serrée, où le héros sait tout et ne peut rien.

Sa prescience, qui devait le libérer, l'a enfermé. Quand on voit l'avenir, on ne choisit plus : on récite. Il sait qu'un complot se trame, il sait ce qu'il coûtera, et il le laisse venir, parce que tous les autres chemins sont pires.

Le complot réunit tous ceux qu'il a dépossédés. La Révérende Mère du Bene Gesserit, qui a perdu le contrôle de son élevage. La Guilde, représentée par un navigateur, Edric, qui vit dans une cuve de gaz orange et dont la seule présence brouille la vision de Paul, car un oracle masque un autre oracle. Un Danseur-Visage tleilaxu, Scytale. Et la princesse Irulan, fille de l'ancien empereur, que Paul a épousée sans jamais la toucher. C'est elle qui écrit les citations que tu lis en tête des chapitres du premier livre : l'historienne officielle de Muad'Dib, et sa femme délaissée. Pour assurer à sa maison un héritier, elle glisse en secret dans la nourriture de Chani un contraceptif, et Chani ne parvient pas à concevoir.

Les Tleilaxu font à Paul un cadeau empoisonné : un ghola, un homme recréé à partir du corps de Duncan Idaho, mort pour lui des années plus tôt. On l'appelle Hayt. Il a le visage de Duncan, ses gestes, mais aucun souvenir. Il a des yeux de métal, et il est conditionné pour tuer Paul au moment voulu. Paul l'accepte quand même. Il voit le piège ; il voit aussi ce qu'il y a au bout.

Une arme atomique interdite, un brûle-pierre, explose près de lui et le rend aveugle. La loi fremen veut que les aveugles soient abandonnés au désert. Il continue pourtant de marcher sans hésiter, de regarder les gens en face : il voit par sa vision de l'avenir, qui colle si exactement au présent qu'elle lui tient lieu d'yeux. Ses fidèles y voient un miracle de plus.

Chani meurt en accouchant, comme il l'avait vu depuis des années. Le contraceptif d'Irulan a abîmé son corps ; la grossesse, accélérée par l'épice, l'épuise. Elle met au monde des jumeaux, un garçon et une fille, Leto et Ghanima, et il ne les avait pas prévus tous les deux. Dans cette petite fêlure, sa vision s'éteint. Au même moment, le ghola reçoit l'ordre de tuer. Le choc de cet ordre, contre tout ce qu'il est, lui rend sa mémoire : Hayt redevient Duncan Idaho, et ne frappe pas. C'est ce que les Tleilaxu voulaient vérifier, et c'est le seul vrai miracle du livre. Il est enfin aveugle pour de bon. Alors, pour la première fois, il fait un geste libre. Il obéit à la loi de son peuple et s'en va seul dans le désert, vers les vers, en refusant d'être un dieu.

C'est la vraie fin de l'histoire de Paul, et c'est une abdication.

# Le Sentier d'or

Les deux romans suivants poussent l'idée jusqu'à son terme, et ils sont vertigineux.

*Les Enfants de Dune* commence neuf ans plus tard. Paul a disparu dans le désert. Alia gouverne l'empire comme régente des jumeaux, et elle sombre. Parce qu'elle est née consciente, avec toutes les mémoires de ses ancêtres dans la tête, elle n'a jamais pu les tenir à distance. L'une de ces voix finit par prendre le dessus : celle du baron Harkonnen, son grand-père, qu'elle a tué enfant. Les Bene Gesserit ont un mot pour cela, l'Abomination. L'empire de Paul est désormais gouverné, à travers sa sœur, par le pire ennemi de sa maison.

Dans le désert, un prédicateur aveugle parcourt les villages et maudit la religion de Muad'Dib. Les gens le prennent pour un fou. Le lecteur comprend avant eux : c'est Paul. Il n'est pas mort. Il s'est mis à combattre sa propre légende, et personne ne l'écoute. Il sera tué dans une foule, pendant un sermon, sans qu'on sache qui il était.

Paul avait vu un chemin et n'avait pas voulu le prendre. Son fils, Leto II, le prend. Il a compris, par la même prescience, que l'humanité court à l'extinction : tant qu'elle reste rassemblée, dépendante d'une seule drogue et de chefs qu'elle adore, il suffira d'une catastrophe pour l'effacer. Il faut la disperser si loin, et la dégoûter si profondément des sauveurs, que plus jamais personne ne puisse la tenir tout entière.

Pour cela, l'enfant laisse se coller à sa peau les larves des vers des sables. Elles lui font une armure vivante. Il cesse lentement d'être un homme et devient lui-même un ver, à visage humain. Alia, vaincue, se jette d'une fenêtre pour échapper à la voix qui l'habite. Leto épouse sa sœur Ghanima, pour la forme, afin que la lignée continue. Et il règne pendant trois mille cinq cents ans.

Il est le pire tyran de l'histoire, et il l'est exprès. Il interdit presque tout voyage. Il impose une paix écrasante, immobile, sans guerre ni aventure. Il laisse Arrakis verdir, ce qui tue les vers et tarit l'épice, dont il garde le dernier stock. Il veut que l'humanité étouffe jusqu'à en garder une horreur définitive. Son armée est faite de femmes, les Truitesses, parce qu'il pense que les armées d'hommes dérivent toujours vers la conquête. Auprès de lui, à travers les siècles, revient sans cesse le même homme : Duncan Idaho, recréé encore et encore par les Tleilaxu, ghola après ghola. Chaque Duncan découvre ce qu'est devenu l'enfant de Paul, s'en horrifie, et finit souvent par se révolter. Leto en fait venir un autre. C'est le seul compagnon qui lui reste, et il sait qu'il le perdra à chaque fois.

*L'Empereur-Dieu de Dune* est presque tout entier fait de conversations entre ce monstre et ceux qui l'approchent. Leto parle, il argumente, il se moque, il souffre. Il est le personnage le plus intelligent de toute la saga, et le plus seul. Il aime une femme, Hwi Noree, envoyée par les Ixiens pour le séduire, et cet amour impossible est la seule part d'homme qu'il garde.

En même temps, il poursuit en secret son propre élevage, pour obtenir des humains que la prescience ne peut pas voir, des êtres qu'aucun oracle ne pourra jamais prédire ni piéger. La première réussite s'appelle Siona, une descendante des Atréides, rebelle, qui le hait. C'est elle qu'il choisit pour qu'on le tue.

Quand il y est parvenu, il se laisse assassiner. Son corps se défait en larves, qui referont un jour des vers et un désert. Et l'humanité, libérée d'un coup, explose dans toutes les directions de l'univers. C'est la Dispersion. Elle ne tiendra plus jamais dans une seule main.

Herbert a encore écrit deux livres, quinze siècles plus tard. Dans *Les Hérétiques de Dune* et *La Maison des mères*, les enfants de la Dispersion reviennent, et ce qu'ils ramènent est pire que tout ce qu'on connaissait : un ordre de femmes guerrières, les Honorées Matriarches, qui dominent par la violence et la séduction. Le Bene Gesserit, vieilli, doit survivre, et Arrakis elle-même est détruite. Le cycle s'arrête sur une fin ouverte, que la mort de l'auteur a laissée en suspens.

Herbert appelle cela le Sentier d'or. Te voilà devant la question la plus dérangeante du cycle : un monstre qui opprime l'espèce pendant trente-cinq siècles pour la sauver d'elle-même a-t-il raison ? Le livre ne répond pas. Il te fait remarquer que Leto est seul à avoir vu le danger, et qu'on est donc prié de le croire sur parole. C'est exactement ce que demandent tous les sauveurs.

# Ce que Herbert a vu, et ce que tu peux en prendre

Herbert a mis dans ce cycle trois idées, et je te les donne, parce qu'elles servent à qui fabrique des mondes.

La première est l'écologie. Dune est l'un des premiers romans où une planète est un système : l'eau, le sable, les vers, l'épice, les hommes, tout se tient. Tu ne peux rien toucher sans que le reste bouge. Le rêve des Fremen, verdir le désert, finira par détruire ce qui faisait leur force. Un monde bien construit a cette propriété : chaque désir y a un prix ailleurs.

La deuxième est que le pouvoir attire ceux qui se corrompent, et surtout qu'il fabrique ceux qui le subissent. Le Bene Gesserit a semé une prophétie pour se protéger : elle a enfanté une guerre sainte. On ne contrôle pas ce que les gens font d'une croyance qu'on leur a donnée.

La troisième est le piège du héros, et c'est la plus utile pour toi. Herbert te fait aimer Paul. Il est courageux, lucide, il souffre de ce qu'il devient. Rien n'y fait. Ce n'est pas un méchant qui déclenche le massacre : c'est un bon garçon, pris dans une attente plus forte que lui. Le danger, dit le livre, n'est pas le chef. C'est le besoin que nous avons d'en avoir un.

Tu remarqueras que ces trois idées n'en font qu'une. Une planète, une religion, un héros : partout, Herbert montre des systèmes qui dépassent ceux qui croient les conduire. Personne, dans Dune, ne contrôle vraiment ce qu'il met en mouvement. Pas l'empereur, pas le Bene Gesserit, pas Paul. Seul Leto II y parvient, et il lui faut pour cela cesser d'être humain. C'est peut-être la phrase la plus juste qu'on puisse tirer de six livres : celui qui veut tenir le monde entier doit devenir un monstre, et le monde ne sera libre que le jour où il le tuera.

Il y a une quatrième leçon, de métier pur. Herbert ne te livre presque jamais son monde par une explication. Chaque chapitre s'ouvre sur une citation tirée d'un livre écrit plus tard, par Irulan, par des historiens, par des commentateurs. Tu lis l'histoire au présent, et tu entends déjà comment on la racontera. Ce double regard crée l'inquiétude : tu sais que Paul deviendra une légende avant de savoir ce qu'il aura fait pour cela. Et le vocabulaire du livre, ses dizaines de mots inventés ou empruntés, n'est pas expliqué au fil du texte. Un lexique, à la fin, les rassemble. On apprend la langue comme on apprend un pays : en se perdant d'abord.

Regarde enfin comment les deux grands films ont lu le livre. Lynch a fait de Paul un élu : à la fin de son film, il fait tomber la pluie sur Arrakis, comme un dieu qui sauve. C'est exactement le contresens que Herbert redoutait. Villeneuve a suivi l'autre route. Il a déplacé le regard vers Chani, qui devient dans le second film la conscience de l'histoire, celle qui voit ce que les autres refusent de voir.

Quand tu écris un personnage qu'on suit, souviens-toi de la dernière image de ce film : la foule acclame, et la seule qui l'aimait s'en va.
`,
};
export default book;
