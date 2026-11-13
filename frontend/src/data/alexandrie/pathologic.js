const book = {
  id: "pathologic", title: "Pathologic", sub: "Douze jours de peste", room: "lore", type: "recit", format: "vhs", cote: "LO-025", color: 8, emblem: "疫",
  about: "Une petite ville au bord de la steppe, une tour impossible, un peuple qui vénère un taureau de terre, et une peste qui sort du sol. Trois guérisseurs, douze jours, et une certitude : tu ne sauveras pas tout le monde. Le jeu russe le plus étrange et le plus exigeant qui soit, construit comme une pièce de théâtre.",
  links: [
    { label: "Pathologic (Ice-Pick Lodge, 2005), puis Pathologic Classic HD (2015)", note: "Le jeu original, en russe Мор. Утопия. Trois personnages jouables, trois versions de la même histoire." },
    { label: "Pathologic 2 (Ice-Pick Lodge, 2019)", note: "La refonte complète, centrée sur le Haruspice. Plus beau, plus dur, plus profond." },
    { label: "Nikolay Dybovskiy", note: "Le directeur du studio, auteur de l'univers. Ses textes sur le jeu valent la lecture." },
    { label: "Antonin Artaud, Le Théâtre et la Peste (1934)", note: "L'idée que le théâtre doit agir comme une peste : bouleverser, révéler. Pathologic semble l'avoir prise au mot." },
    { label: "Albert Camus, La Peste (1947)", note: "L'autre grande ville en quarantaine." },
  ],
  text: String.raw`
# Avant de commencer

Pathologic est un jeu qui veut te faire souffrir. Pas par méchanceté : par principe. Il a été conçu par un petit studio moscovite, Ice-Pick Lodge, comme une expérience de théâtre interactif. Tu as faim, tu as froid, tu manques de tout, le temps passe trop vite, et tu sais que tu n'auras jamais le temps de tout faire.

C'est justement le sujet. Une épidémie. Une ville qui meurt. Et toi, qui dois choisir qui sauver.

Le jeu a eu deux vies : une première version en 2005, maladroite et fascinante, devenue culte en Russie puis ailleurs ; et une refonte en 2019, Pathologic 2, centrée sur l'un des trois personnages. Je te raconte le monde, qui est le même dans les deux.

@yt n2fAbqT5GWg | Pathologic 2, la bande-annonce de sortie (2019).


# Ceux qui l'ont fait

Pathologic est développé par Ice-Pick Lodge, un petit studio de Moscou, et sort en 2005. Son auteur et directeur est Nikolay Dybovskiy, qui a fondé le studio et en écrit les mondes. La version de 2015, Classic HD, a été retravaillée avec l'éditeur tinyBuild, qui édite aussi Pathologic 2 en 2019.

Le studio revendique des influences théâtrales et littéraires plus que vidéoludiques. Il présente ses jeux comme des expériences, pas comme des divertissements.

# La ville

Quelque part dans un pays qui ressemble à la Russie du début du vingtième siècle, au bord d'une steppe infinie, il y a une petite ville sur une rivière, la Gorkhon. On l'appelle simplement la Ville.

@art 1 | La ville.

Elle est étrange. Elle a été construite, dit-on, sur le corps d'un être immense, enterré sous la steppe. Trois familles la gouvernent. Les Olgimsky, qui possèdent les abattoirs et l'industrie de la viande. Les Saburov, qui tiennent l'administration. Et les Kain, une famille de visionnaires et de mystiques, qui financent les projets les plus fous.

Le plus fou de tous se dresse au bord de la ville : le Polyèdre. Une tour de verre et de métal, en équilibre sur une pointe, qui défie toutes les lois de la physique. Elle a été construite par deux architectes géniaux, les frères Stamatin, à la demande des Kain. Personne ne sait vraiment à quoi elle sert. Des enfants y vivent, et refusent d'en sortir. Ils disent qu'à l'intérieur, on peut rêver tout ce qu'on veut.

# Le peuple de la steppe

Autour de la ville, dans la steppe, vit un autre peuple. Les Kin, des bergers, des bouchers, qui parlent une langue ancienne et vénèrent la Terre.

Pour eux, la steppe est vivante. Sous la ville dort un taureau immense, Bos Turokh, le Taureau de la Terre, dont le sang coule dans les veines du sol. Les Kin ont leurs prêtres, leurs rites, leurs créatures : des hommes-vers qui creusent la terre et recueillent les herbes, des femmes qui dansent dans la steppe et qu'on appelle les Fiancées de l'herbe.

La ville moderne, avec sa tour et ses usines, s'est construite contre eux, sur eux. Les deux mondes se tolèrent mal.

# La peste

Un jour, une maladie apparaît. La Peste des sables. Elle vient du sol. Elle infecte des quartiers entiers en une nuit. Les malades se couvrent de plaies, crachent du sang, meurent en quelques jours. Les maisons infectées se reconnaissent de loin : leurs murs semblent suinter, une fumée rouge flotte au-dessus.

@art g 1 | La peste.

La ville est mise en quarantaine. Personne ne peut sortir. Les prix explosent. Le pain devient rare. Les gens se battent pour un morceau de viande. Les voleurs envahissent les rues la nuit. Les malades sont enfermés dans des bâtiments réquisitionnés, et le nombre de morts monte chaque jour.

# Les trois guérisseurs

Trois personnes arrivent, ou reviennent, au moment où tout commence. Chacune peut être jouée. Chacune voit la ville autrement.

**Le Bachelier**, Daniil Dankovsky. Un jeune médecin de la capitale, brillant, arrogant, rationaliste, qui dirige un laboratoire consacré à vaincre la mort. Il est venu voir Simon Kain, le patriarche de la famille Kain, un homme dont on dit qu'il ne vieillit pas. Il arrive le jour même où Simon meurt. Pour le Bachelier, la peste est une maladie, et la science la vaincra.

**Le Haruspice**, Artemy Burakh. Le fils du chirurgien de la ville, qui était aussi un guérisseur des Kin. Il revient après des années d'études, appelé par une lettre de son père, et trouve son père assassiné. On l'accuse. Il connaît la médecine de la steppe, les herbes, le sang, les lignes du corps. Pour lui, la ville est un corps, et la peste une blessure de la Terre.

**La Changeline** (The Changeling), Clara. Une jeune fille sortie de nulle part, sans passé, qui prétend pouvoir guérir par le toucher. On la dit sainte, ou sorcière. Peut-être les deux. Elle ne sait pas qui elle est, et la ville ne sait pas quoi faire d'elle.

# Douze jours

Le jeu dure douze jours. Chaque jour, des événements ont lieu, que tu y sois ou non. Chaque jour, des quartiers s'infectent. Chaque jour, tu as des tâches principales, et des gens à protéger : une poignée de personnes qui te sont liées, que le jeu appelle les Bound, et que tu dois garder en vie. Tu n'y arriveras pas pour tous.

Il faut manger, dormir, échanger, voler parfois. Les remèdes sont rares. Les antibiotiques coûtent une fortune. Une seule panacée, un remède capable de tout guérir, peut être fabriquée, et en très petites quantités.

Et le temps ne s'arrête jamais. Si tu passes trop de temps sur une quête, une autre échoue. Quelqu'un meurt, et tu ne l'apprends que le lendemain.

!! CE QUE LE JEU APPREND :: Pathologic est une simulation de l'impuissance. Il ne te laisse jamais être le héros qui sauve tout le monde. Il te met dans la position d'un médecin pendant une épidémie : tu choisis qui vit, et tu portes ce choix.

# Le théâtre

Au centre de la ville, il y a un théâtre. Et le théâtre est partout.

@art 2 | Le théâtre.

Des personnages masqués, les Tragédiens, jouent des scènes dans les rues, qui commentent ce qui se passe. D'autres personnages, en masques d'oiseaux, les Exécuteurs, apparaissent pour accomplir des actes que personne d'autre ne veut faire. Le directeur du théâtre, Mark Immortell, s'adresse parfois directement à toi. Pas à ton personnage : à toi, le joueur.

Le jeu entier est construit comme une pièce. Tu es un acteur, qui doit jouer son rôle avant la fin de la représentation. Et à certains moments, le décor se déchire, et l'on voit les coulisses.

# Ceux qui arrivent

Au milieu de la quarantaine, les autorités envoient leurs représentants. Une Inquisitrice, Aglaya Lilich, chargée de juger qui est responsable de l'épidémie, et qui a ses propres plans. Puis un général, Block, avec une armée et des canons.

Le pouvoir central a une solution simple pour une ville infectée : la raser. Les canons sont pointés.

# La fin

À la fin, le destin de la ville se joue sur un choix, et le choix porte sur le Polyèdre.

Selon le Haruspice, la ville et la tour blessent la Terre. La peste vient de là. Pour sauver les gens, il faut abattre le Polyèdre et rendre à la steppe ce qu'on lui a pris. Mais c'est détruire le rêve, la seule chose miraculeuse que la ville ait bâtie.

Selon le Bachelier, il faut sauver le Polyèdre, l'utopie, quitte à sacrifier une partie de la ville. Le progrès contre la tradition. La tour contre la terre.

Il existe d'autres issues. Laisser les canons faire leur travail. Ou découvrir, dans une fin secrète, que toute cette ville, ses familles, sa tour, sa peste, n'est peut-être que le jeu d'enfants qui ont construit le monde avec leurs jouets.

# Pathologic 2

En 2019, Ice-Pick Lodge a refait le jeu de fond en comble, en se concentrant d'abord sur le Haruspice. Le résultat est plus beau, plus cohérent, et encore plus dur. Le temps est plus serré, la faim plus pressante, les choix plus douloureux. Le jeu est conscient de sa propre difficulté : il te permet de la régler, mais te prévient que ce n'est pas comme ça qu'il est censé être joué.

@art 3 | Pathologic 2.

Les autres personnages devaient suivre dans d'autres jeux. Le studio a toujours eu des moyens modestes, et le projet a avancé lentement.

# Ce que tu peux en prendre

Pathologic t'apprend qu'un jeu peut faire de l'inconfort une forme d'art. Le manque, la fatigue, l'injustice du temps ne sont pas des défauts : ce sont le sujet. Le joueur ressent ce que vivent les personnages.

Il t'apprend aussi à raconter une même histoire depuis plusieurs regards. Le Bachelier, le Haruspice, la Changeline ne voient pas la même ville. Chacun a raison, à sa façon, et chacun ignore ce que voient les autres.

Et il pose une question vieille comme les épidémies : que vaut une communauté, quand il faut choisir entre ses membres ? La ville survivra peut-être. Pas tout le monde. Le jeu te demande de vivre avec ça, et de jouer quand même ton rôle jusqu'à la fin de la pièce.
`,
};
export default book;
