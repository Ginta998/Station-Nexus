const book = {
  id: "dune", title: "Dune", sub: "L'épice, le Jihad et le piège du messie", room: "lore", type: "recit", format: "livre", cote: "LO-003", color: 28, emblem: "砂",
  about: "Un monde sans ordinateurs, une drogue qui tient l'empire, un adolescent qui voit l'avenir et ne peut pas l'empêcher. Herbert n'a pas écrit l'histoire d'un héros : il a écrit un avertissement.",
  voice: "RÉCIT DE NÉRODUS. IL COUVRE LES QUATRE PREMIERS ROMANS DE FRANK HERBERT, FINS COMPRISES.",
  links: [
    { label: "Frank Herbert, Dune (1965), Le Messie de Dune (1969), Les Enfants de Dune (1976), L'Empereur-Dieu de Dune (1981)", note: "Lis au moins les deux premiers ensemble. Le deuxième est la réponse de l'auteur à ceux qui avaient mal lu le premier." },
    { label: "Dune de Denis Villeneuve (2021 et 2024)", note: "Regarde la dernière scène du second film avec ce livre en tête : le regard de Chani dit ce que Herbert voulait dire." },
    { label: "Dune de David Lynch (1984)", note: "Raté, étrange, inoubliable. Il prend le parti du héros : c'est exactement le contresens que Herbert redoutait." },
    { label: "Jodorowsky's Dune (documentaire, 2013)", note: "Le film qui n'a jamais existé, et tout ce qu'il a semé." },
    { label: "T. E. Lawrence, Les Sept Piliers de la sagesse", note: "L'étranger qui prend la tête d'une révolte du désert. Une des sources du personnage de Paul." },
    { label: "Ibn Khaldoun, la Muqaddima", note: "L'idée que les peuples durs du désert renversent les empires amollis, puis s'amollissent à leur tour. Herbert en a fait le moteur de son histoire." },
  ],
  text: String.raw`
# Le malentendu

On te racontera Dune comme l'histoire d'un jeune duc trahi qui se réfugie au désert, gagne l'amour d'un peuple opprimé, monte un ver géant et reprend ce qu'on lui a volé. C'est exact, et c'est un piège.

Frank Herbert l'a tendu exprès. Il a écrit une histoire de héros si bien faite que le lecteur veut que le héros gagne. Puis il a écrit la suite pour montrer ce que cette victoire coûte : des dizaines de milliards de morts. Il a dit et répété qu'il avait voulu mettre en garde contre les chefs charismatiques, et que les peuples devraient se méfier d'eux d'autant plus qu'ils semblent bons.

Je vais donc te raconter Dune dans l'ordre où il faut le comprendre. D'abord le monde, parce que tout y est construit pour produire un messie. Puis le garçon. Puis ce que le garçon voit venir. Puis ce qui vient.

# Un futur sans machines

L'histoire se passe dans plus de vingt mille ans. Et la première chose qui frappe, c'est ce qui n'y est pas : il n'y a pas d'ordinateurs. Pas de robots, pas d'intelligences artificielles.

Il y en a eu. Des millénaires avant le récit, les hommes avaient confié leur pensée à des machines, et ceux qui possédaient les machines avaient asservi les autres. Une révolte, à moitié guerre et à moitié croisade religieuse, a tout détruit : le Jihad butlérien. Il en est resté un commandement, inscrit dans le livre sacré de l'empire :

> Tu ne feras point de machine à l'esprit de l'homme semblable. | Bible catholique orange, citée dans Dune

Regarde la conséquence, car c'est la plus belle idée de Herbert. Privée de machines, l'humanité a dû se perfectionner elle-même. Trois écoles sont nées, et chacune a fait de l'homme un outil.

Les Mentats sont des ordinateurs humains : des hommes entraînés depuis l'enfance à calculer, mémoriser et déduire sans émotion.

La Guilde spatiale détient le monopole des voyages entre les étoiles. Ses navigateurs, pour plier l'espace sans percuter un soleil, doivent entrevoir l'avenir. Ils y parviennent en respirant une drogue à des doses qui déforment leur corps.

Et il y a le Bene Gesserit. Un ordre de femmes qui a poussé la maîtrise du corps et de l'esprit jusqu'à pouvoir contrôler chaque muscle, lire un mensonge dans un battement de cil, et commander par la seule inflexion de la voix. Elles se présentent comme des conseillères et des épouses. En réalité, depuis des dizaines de générations, elles marient les grandes lignées selon un plan. Elles élèvent des êtres humains comme on élève des chevaux. Leur but est un homme : le Kwisatz Haderach, celui qui pourra voir là où elles ne peuvent pas, dans tous les passés et tous les avenirs. Un homme qu'elles entendent tenir.

!! À RETENIR :: Tout ce monde repose sur des hommes modifiés. Et presque toutes ces modifications dépendent d'une seule substance.

# L'épice

Elle s'appelle le Mélange, ou l'épice. Elle allonge la vie. Elle ouvre l'esprit. Elle donne aux navigateurs leur vision, aux Bene Gesserit leurs pouvoirs les plus hauts. Sans elle, plus de voyage, donc plus de commerce, donc plus d'empire. Ceux qui en prennent longtemps ont les yeux qui deviennent bleus sur bleu, et ne peuvent plus s'en passer sans mourir.

Et elle ne se trouve que sur une seule planète de tout l'univers connu : Arrakis, que ses habitants appellent Dune.

Tu vois ce que Herbert écrit, en 1965 : une ressource unique, enfouie sous un désert, dont dépend toute une civilisation, et autour de laquelle les puissances se déchirent pendant que le peuple qui vit dessus compte pour rien. Il n'a pas eu besoin de la nommer.

Arrakis est un désert total. Il n'y pleut jamais. L'eau y est si rare que cracher devant quelqu'un est une marque de respect, et que les morts sont distillés pour rendre leur eau à la tribu. Dans le sable vivent des vers longs de plusieurs centaines de mètres, attirés par toute vibration régulière, qui engloutissent les machines de récolte. L'épice vient d'eux : elle est un produit de leur cycle de vie. Détruire le désert, ce serait détruire les vers, et l'épice avec.

Le peuple de ce désert s'appelle les Fremen. L'empire les tient pour quelques milliers de pillards. Ils sont des millions, cachés dans des grottes, vêtus de combinaisons qui recyclent chaque goutte de leur sueur. La dureté de leur monde en a fait les meilleurs combattants qui soient. Et ils ont un rêve, qu'un savant impérial leur a donné : faire d'Arrakis, en plusieurs siècles, goutte après goutte, un jardin.

# Le fief empoisonné

Le pouvoir, dans cet empire, tient sur trois pieds : l'empereur, les grandes maisons nobles, et la Guilde. Deux de ces maisons se haïssent depuis toujours.

Les Harkonnen sont des prédateurs. Leur maison tient Arrakis depuis quatre-vingts ans, et leur chef, le baron Vladimir, en tire une fortune par la terreur.

Les Atréides sont ce qu'un seigneur devrait être. Le duc Leto est juste, ses hommes l'adorent, et les autres nobles commencent à l'écouter. C'est ce qui le condamne. L'empereur Shaddam IV, qui craint sa popularité, lui retire son monde d'origine, Caladan, une planète d'océans, et lui confie Arrakis à la place des Harkonnen. C'est un cadeau somptueux. C'est une exécution.

Leto le sait. Tout le monde le sait. C'est le premier trait de tragédie de ce livre : personne n'est dupe, et le piège fonctionne quand même, parce qu'un duc ne peut pas refuser un ordre de l'empereur. Leto y va en espérant gagner les Fremen à temps.

Il emmène sa compagne, dame Jessica, et leur fils de quinze ans, Paul.

Jessica est Bene Gesserit. L'ordre lui avait commandé de ne donner au duc que des filles, car le plan prévoyait encore une génération. Elle aimait Leto. Il voulait un fils. Elle a désobéi. De ce geste d'amour sort toute la catastrophe : le Kwisatz Haderach arrive une génération trop tôt, hors de tout contrôle. Et elle a enseigné à ce garçon les arts de son ordre, tandis que les meilleurs soldats du duc lui enseignaient la guerre et qu'un Mentat lui enseignait à calculer.

Avant le départ, la supérieure de l'ordre vient éprouver Paul. Elle lui fait mettre la main dans une boîte qui inflige une douleur atroce, une aiguille empoisonnée contre son cou : s'il retire la main, il meurt. C'est le test qui sépare, dit-elle, l'humain de l'animal. L'animal pris au piège se ronge la patte. L'humain reste dans le piège, endure, et attend de pouvoir tuer le chasseur. Paul tient. Il récite pour cela une prière que sa mère lui a apprise, et dont tu connais sans doute la première idée :

> La peur tue l'esprit. | Litanie contre la peur du Bene Gesserit, Dune

# La prophétie fabriquée

Voici la pièce la plus cynique de toute la machine, et celle que les lecteurs pressés oublient.

Le Bene Gesserit a un service nommé la Missionaria Protectiva. Depuis des siècles, il envoie des sœurs semer, sur les mondes primitifs, des légendes sur mesure : la venue d'une mère étrangère et de son fils, un sauveur qui connaîtra vos coutumes comme s'il était né parmi vous. Ce sont des assurances. Le jour où une sœur se retrouve en danger sur l'un de ces mondes, il lui suffit de reconnaître les signes et de les jouer : les gens la protégeront, croyant voir leur prophétie s'accomplir.

Les Fremen attendent un messie : le Mahdi, celui qui les mènera au paradis, la Voix venue d'ailleurs. Cette attente a été plantée chez eux.

Quand Paul arrive sur Arrakis, les gens murmurent sur son passage. Jessica comprend aussitôt, et elle sait s'en servir. Paul, lui, comprend autre chose : il va devenir le sauveur de ces gens, et ce sera un mensonge, et ils y croiront tout de même, et lui-même finira par ne plus savoir.

# La chute

Elle vient vite. Un traître ouvre les boucliers de la ville. C'est le docteur Yueh, le médecin de la famille, un homme que son conditionnement rendait incapable de nuire, et que le baron a brisé en torturant sa femme. Les Harkonnen attaquent de nuit, et avec eux, déguisés, les soldats de l'empereur lui-même, les Sardaukars, élevés sur une planète-prison si cruelle que les survivants sont invincibles.

Le duc Leto meurt en essayant de tuer le baron. Paul et Jessica sont abandonnés dans le désert pour que le sable les efface.

Ils survivent, et c'est là, sous une tente, la nuit de la mort de son père, que l'esprit de Paul s'ouvre. L'épice qui sature l'air d'Arrakis, son hérédité préparée depuis des siècles, son entraînement : tout se rejoint. Il voit le temps comme un paysage, avec ses chemins.

Et sur presque tous ces chemins, il voit la même chose. Des légions fanatiques qui se répandent d'étoile en étoile sous une bannière verte et noire, en criant son nom. Une guerre sainte. Il emploie le mot : le jihad. Il comprend que l'espèce humaine, figée depuis dix mille ans dans ses castes et ses lignées, veut ce brassage violent, comme un organisme veut la fièvre, et qu'il en est l'occasion. Qu'il vive ou qu'il meure, d'ailleurs : mort, il serait un martyr.

Voilà ce qui distingue Dune de toutes les histoires d'élu. Paul sait. Dès la première nuit. Tout le roman est celui d'un garçon qui cherche le chemin étroit où il pourrait venger son père sans déclencher le massacre, et qui voit ce chemin se refermer à chaque pas.

# Muad'Dib

Les Fremen les recueillent. Paul tue en duel un homme qui le défiait, son premier mort, et pleure : chez un peuple où l'on ne gaspille aucune eau, donner de l'eau aux morts est un prodige. Il reçoit un nom secret, Usul, et choisit son nom public : Muad'Dib, la petite souris du désert, celle qui sait survivre. Il aime une fille de la tribu, Chani. Jessica boit le poison sacré, le transforme dans son corps, et devient la Révérende Mère des Fremen, portant en elle la mémoire de toutes celles qui l'ont précédée. Elle était enceinte : sa fille, Alia, naîtra avec une conscience d'adulte.

Des années passent. Paul apprend à vivre comme eux, monte le ver, mène leurs raids contre les récoltes d'épice. La légende grossit toute seule. Chaque victoire resserre le piège, car chaque victoire est un miracle de plus.

Puis il fait ce qu'aucun homme n'a fait : il boit à son tour l'Eau de Vie, le poison que seules les femmes transforment. Il reste trois semaines comme mort. Quand il s'éveille, il est le Kwisatz Haderach. Il voit tout, y compris la flotte de l'empereur en orbite.

La fin est rapide. Les Fremen sortent de la tempête à dos de ver et écrasent les Sardaukars. La petite Alia tue le baron, son propre grand-père, car le roman a révélé entre-temps que Jessica était la fille secrète de Harkonnen : le sang de l'ennemi coule dans le sauveur. Paul tue en duel l'héritier du baron. Et il se tient devant l'empereur avec un argument unique. Il peut détruire toute l'épice. Les vers mourraient, la Guilde serait aveugle, l'empire finirait. Celui qui peut détruire une chose, dit-il, en est le maître.

L'empereur abdique. Paul épouse sa fille pour le trône, en promettant à Chani qu'elle seule sera sa femme. Le livre se termine sur un triomphe.

Mais lis la page d'avant. Paul regarde ses Fremen, qui le contemplent, et il comprend qu'il a échoué. Il voulait empêcher le jihad. Il est devant lui, dans leurs yeux. Plus rien ne peut l'arrêter, pas même lui.

# Le Messie

Herbert a vu que ses lecteurs applaudissaient. Il a écrit la suite contre eux. *Le Messie de Dune* est court, sombre, et commence douze ans plus tard.

Le jihad a eu lieu. Les légions de Muad'Dib ont soumis l'univers connu. Paul fait lui-même le compte, dans une conversation glaçante : soixante et un milliards de morts, quatre-vingt-dix planètes stérilisées, quarante religions anéanties. Il se compare aux tyrans de l'histoire ancienne et constate qu'ils étaient des amateurs. Il est empereur, il est dieu, et il ne contrôle rien : une bureaucratie de prêtres gouverne en son nom, et sa légende marche toute seule.

Sa prescience, qui devait le libérer, l'a enfermé. Quand on voit l'avenir, on ne choisit plus : on récite. Il sait qu'un complot se trame, il sait ce qu'il coûtera, et il le laisse venir, parce que tous les autres chemins sont pires.

Une arme le rend aveugle. La loi fremen veut que les aveugles soient abandonnés au désert. Il continue pourtant de marcher sans hésiter, de regarder les gens en face : il voit par sa vision de l'avenir, qui colle si exactement au présent qu'elle lui tient lieu d'yeux. Ses fidèles y voient un miracle de plus.

Chani meurt en accouchant, comme il l'avait vu depuis des années. Elle met au monde des jumeaux, et il ne les avait pas prévus tous les deux. Dans cette petite fêlure, sa vision s'éteint. Il est enfin aveugle pour de bon. Alors, pour la première fois, il fait un geste libre. Il obéit à la loi de son peuple et s'en va seul dans le désert, vers les vers, en refusant d'être un dieu.

C'est la vraie fin de l'histoire de Paul, et c'est une abdication.

# Le Sentier d'or

Les deux romans suivants poussent l'idée jusqu'à son terme, et ils sont vertigineux.

Paul avait vu un chemin et n'avait pas voulu le prendre. Son fils, Leto II, le prend. Il a compris, par la même prescience, que l'humanité court à l'extinction : tant qu'elle reste rassemblée, dépendante d'une seule drogue et de chefs qu'elle adore, il suffira d'une catastrophe pour l'effacer. Il faut la disperser si loin, et la dégoûter si profondément des sauveurs, que plus jamais personne ne puisse la tenir tout entière.

Pour cela, l'enfant laisse se coller à sa peau les larves des vers des sables. Elles lui font une armure vivante. Il cesse lentement d'être un homme et devient lui-même un ver, à visage humain. Et il règne pendant trois mille cinq cents ans.

Il est le pire tyran de l'histoire, et il l'est exprès. Il interdit presque tout voyage. Il impose une paix écrasante, immobile, sans guerre ni aventure. Il laisse Arrakis verdir, ce qui tue les vers et tarit l'épice, dont il garde le dernier stock. Il veut que l'humanité étouffe jusqu'à en garder une horreur définitive. En même temps, il poursuit en secret son propre élevage, pour obtenir des humains que la prescience ne peut pas voir, des êtres qu'aucun oracle ne pourra jamais prédire ni piéger.

Quand il y est parvenu, il se laisse assassiner. Son corps se défait en larves, qui referont un jour des vers et un désert. Et l'humanité, libérée d'un coup, explose dans toutes les directions de l'univers. C'est la Dispersion. Elle ne tiendra plus jamais dans une seule main.

Herbert appelle cela le Sentier d'or. Te voilà devant la question la plus dérangeante du cycle : un monstre qui opprime l'espèce pendant trente-cinq siècles pour la sauver d'elle-même a-t-il raison ? Le livre ne répond pas. Il te fait remarquer que Leto est seul à avoir vu le danger, et qu'on est donc prié de le croire sur parole. C'est exactement ce que demandent tous les sauveurs.

# Ce que Herbert a vu

Il était journaliste. En 1957, on l'envoie sur la côte de l'Oregon faire un article sur des dunes qui avançaient et engloutissaient des routes, et sur les agronomes qui tentaient de les fixer en plantant des herbes. L'article n'a jamais paru. Il en est sorti six ans de recherches et ce livre, refusé par une vingtaine d'éditeurs avant d'être publié par une maison spécialisée dans les manuels de mécanique automobile.

@yt NKXYtglYqm0 | Dune de Denis Villeneuve (2021), bande-annonce. L'adaptation qui a ramené le livre au premier plan.

Il y a mis trois idées, et je te les donne, parce qu'elles servent à qui fabrique des mondes.

La première est l'écologie. Dune est l'un des premiers romans où une planète est un système : l'eau, le sable, les vers, l'épice, les hommes, tout se tient. Tu ne peux rien toucher sans que le reste bouge. Le rêve des Fremen, verdir le désert, finira par détruire ce qui faisait leur force. Un monde bien construit a cette propriété : chaque désir y a un prix ailleurs.

La deuxième est que le pouvoir attire ceux qui se corrompent, et surtout qu'il fabrique ceux qui le subissent. Le Bene Gesserit a semé une prophétie pour se protéger : elle a enfanté une guerre sainte. On ne contrôle pas ce que les gens font d'une croyance qu'on leur a donnée.

La troisième est le piège du héros, et c'est la plus utile pour toi. Herbert te fait aimer Paul. Il est courageux, lucide, il souffre de ce qu'il devient. Rien n'y fait. Ce n'est pas un méchant qui déclenche le massacre : c'est un bon garçon, pris dans une attente plus forte que lui. Le danger, dit le livre, n'est pas le chef. C'est le besoin que nous avons d'en avoir un.

Quand tu écris un personnage qu'on suit, souviens-toi de la dernière image du film de Villeneuve : la foule acclame, et la seule qui l'aimait s'en va.
`,
};
export default book;
