const book = {
  id: "stalker", title: "Stalker", sub: "La Zone, de Strougatski à Tarkovski", room: "lore", type: "recit", format: "vhs", cote: "LO-039", color: 70, emblem: "区",
  about: "Un jour, quelque chose est venu sur Terre, s'est arrêté quelques heures, et est reparti. Derrière lui, il a laissé des Zones : des territoires où les lois de la physique ne tiennent plus, remplis d'objets miraculeux et de pièges mortels. Des hommes y entrent illégalement pour rapporter ces objets. On les appelle des stalkers. Un roman soviétique, un film qui a peut-être tué son réalisateur, et une saga de jeux ukrainiens nés à l'ombre de Tchernobyl : trois manières d'entrer dans la même Zone.",
  links: [
    { label: "Arcadi et Boris Strougatski, Pique-nique au bord du chemin (1972)", note: "Le roman d'origine. En France chez Denoël (Présence du futur), puis dans une nouvelle traduction intégrale." },
    { label: "Andreï Tarkovski, Stalker (1979)", note: "Le film, écrit par les Strougatski eux-mêmes. Avec Alexandre Kaïdanovski, Anatoli Solonitsyne, Nikolaï Grinko, Alissa Freindlich." },
    { label: "S.T.A.L.K.E.R. (GSC Game World, 2007-2024)", note: "Shadow of Chernobyl, Clear Sky, Call of Pripyat, puis Heart of Chornobyl. Des jeux ukrainiens, tournés vers la vraie zone de Tchernobyl." },
    { label: "Eduard Artemiev, musique de Stalker", note: "Synthétiseurs, instruments d'Orient et d'Occident, et des sons qui ne ressemblent à aucun instrument." },
    { label: "Andreï Tarkovski, Le Temps scellé (1986)", note: "Le livre où Tarkovski explique sa conception du cinéma. Il a son propre volume dans la salle du cinéma." },
    { label: "Jeff VanderMeer, Annihilation (2014)", note: "La Zone X, une héritière directe. Adaptée au cinéma par Alex Garland en 2018." },
  ],
  text: String.raw`
# Avant de commencer

Il y a des histoires qui naissent une fois, et d'autres qui se mettent à vivre toutes seules. Stalker est de la deuxième espèce. Au départ, c'est un petit roman de science-fiction soviétique, écrit par deux frères en 1971. Quelques années plus tard, c'est un des films les plus mystérieux de l'histoire du cinéma. Trente ans après, c'est une saga de jeux vidéo ukrainiens qui fait de la vraie zone d'exclusion de Tchernobyl un territoire de légende. Et entre-temps, le mot lui-même est sorti de la fiction : les gens qui pénètrent illégalement dans la zone de Tchernobyl se font appeler des stalkers.

Ces trois œuvres ne racontent pas la même histoire. Elles ne disent même pas la même chose. Mais elles partagent un lieu, la Zone, et un personnage, l'homme qui sait y marcher. Une terre interdite, où le monde ne fonctionne plus comme ailleurs, où chaque pas peut tuer, et au centre de laquelle quelque chose, paraît-il, exauce les désirs.

Ce livre te fait traverser les trois. D'abord le roman, parce que tout vient de là. Puis le film, parce qu'il a tout transformé. Puis les jeux, parce qu'ils ont rendu la Zone réelle. Prends ton temps. Dans la Zone, on n'avance jamais en ligne droite.

@yt OuEx14WokOA | Stalker (1979), entrer dans la Zone : une analyse du film de Tarkovski (en anglais).

# Ceux qui l'ont fait

**Les frères Strougatski.** Arcadi Strougatski est né en 1925, Boris en 1933. Arcadi est traducteur de japonais et d'anglais, il a servi dans l'armée comme interprète. Boris est astronome, il travaille à l'observatoire de Poulkovo, près de Léningrad. Ensemble, à partir de la fin des années 1950, ils deviennent les plus grands auteurs de science-fiction de l'Union soviétique. Leurs livres commencent par des utopies optimistes, puis deviennent de plus en plus inquiets, ironiques, et dérangeants pour le pouvoir.

Ils écrivent Pique-nique au bord du chemin en 1971. Les premiers plans sont jetés en janvier, à Léningrad, la version finale est terminée en novembre, à Komarovo. Le roman paraît en 1972 dans une revue littéraire de Léningrad, Avrora, en quatre livraisons.

**Andreï Tarkovski.** Né en 1932, fils du poète Arseni Tarkovski, il est en 1979 le cinéaste soviétique le plus admiré à l'étranger et le plus surveillé chez lui. Il a déjà fait L'Enfance d'Ivan, Andreï Roublev, Solaris, Le Miroir. Il tourne peu, lentement, avec une exigence qui épuise tout le monde autour de lui. Stalker sera son dernier film en Union soviétique.

Le scénario est écrit par les Strougatski eux-mêmes, à la demande de Tarkovski. Ils en font de nombreuses versions. À chaque version, Tarkovski enlève quelque chose : les extraterrestres, les objets, l'action, les explications. À la fin, il ne reste presque rien du roman, sinon la Zone, le stalker, et une chambre où les désirs s'exaucent.

Les acteurs sont Alexandre Kaïdanovski, le Stalker ; Anatoli Solonitsyne, l'Écrivain, l'acteur fétiche de Tarkovski ; Nikolaï Grinko, le Professeur ; et Alissa Freindlich, la femme du Stalker. La musique est d'Eduard Artemiev, qui avait déjà travaillé sur Solaris et Le Miroir.

**GSC Game World.** C'est un studio ukrainien, fondé à Kyiv au milieu des années 1990 par Sergueï Grigorovitch. En 2007, après des années de retards, il sort S.T.A.L.K.E.R.: Shadow of Chernobyl. Suivent Clear Sky en 2008 et Call of Pripyat en 2009. Le quatrième, S.T.A.L.K.E.R. 2: Heart of Chornobyl, est développé en grande partie pendant la guerre déclenchée par l'invasion russe de 2022, une partie de l'équipe s'installant à Prague. Il sort en novembre 2024. Le titre adopte au passage l'orthographe ukrainienne : Chornobyl.

# Le jour de la Visite

Le roman commence par une interview à la radio. Un savant, le docteur Valentin Pilman, prix Nobel, répond aux questions d'un journaliste sur sa grande découverte.

@art 1 | Le jour de la Visite.

Il y a treize ans, quelque chose est venu sur Terre. Personne ne l'a vu. On ne sait pas ce que c'était. On sait seulement que pendant une journée, en six endroits du globe, il s'est passé des choses inexplicables, des catastrophes, des incendies, des morts dont personne n'a compris la cause. Puis plus rien. Les visiteurs, si c'étaient des visiteurs, sont repartis.

Ils ont laissé derrière eux six Zones, de quelques kilomètres carrés chacune. Pilman a fait une découverte : si on reporte ces six points sur un globe qui tourne, ils forment une ligne, comme les impacts de balles tirées au pistolet par quelqu'un qui viserait la Terre depuis un point fixe de l'espace, quelque part dans la direction de l'étoile Deneb. C'est ce qu'on appelle le radiant de Pilman. C'est sa grande découverte, et il en parle avec un détachement amusé : elle ne sert à rien.

L'une des Zones se trouve près de Harmont, une petite ville industrielle imaginaire, au Canada. C'est là que se passe le roman.

# Ce qu'il y a dans la Zone

La Zone de Harmont est entourée de barbelés, de miradors, de patrouilles de l'ONU. À l'intérieur, rien n'a changé en apparence. Des rues, des maisons, des garages, un cimetière, une usine. Mais tout est mort, et tout est piégé.

Il y a des endroits où la gravité devient folle, où un homme est écrasé au sol comme sous une presse en une seconde. Les stalkers les appellent des concentrés gravitationnels. Il y a la gelée de sorcière, une substance qui ronge tout, qui dissout les os à travers la chair. Il y a la calvitie de moustique, la toile d'argent, le duvet. Il y a des zones qui brûlent sans flamme. Il y a des choses qu'on ne voit pas et qui tuent quand même.

Et il y a les objets. La Zone est remplie de choses laissées par les visiteurs, que les hommes ramassent sans les comprendre. Les vides, deux disques de cuivre collés l'un à l'autre par rien, à quelques centimètres de distance. Les pleins, la même chose avec, entre les disques, une sorte de liquide bleu. Les bracelets, qui stimulent les processus vitaux. Les jets noirs. Les aiguilles. Les piles éternelles. Certains objets guérissent. D'autres servent à quelque chose qu'on ignore. D'autres encore sont des armes, et les militaires s'arrachent la gelée de sorcière.

On a classé tout cela, comme on peut. Il y a les objets utiles qu'on ne comprend pas. Les objets dont on ignore l'usage. Les phénomènes dangereux. Et les choses uniques, légendaires, qu'aucun savant n'a jamais vues. Dans cette dernière catégorie, il y a une chose dont tout le monde parle à voix basse : la Boule d'or. Une sphère cachée au fond de la Zone, qui exaucerait les vœux.

!! LE MOT STALKER :: En anglais, to stalk veut dire traquer, suivre à pas de loup. Dans le roman, les stalkers sont les pilleurs qui entrent illégalement dans la Zone pour en rapporter des objets et les revendre au marché noir. Le mot a ensuite voyagé : après 1986, les gens qui s'introduisent dans la zone d'exclusion de Tchernobyl l'ont adopté pour eux-mêmes.

# Redrick Schuhart

Le héros du roman s'appelle Redrick Schuhart, Red pour tout le monde. Il a vingt-trois ans au début du livre. Il est roux, nerveux, grossier, intelligent, drôle. Il boit trop. Il a grandi à Harmont, il connaît la Zone mieux que personne, et il la fréquente illégalement depuis l'adolescence.

Au début, il a un emploi officiel : il est assistant de laboratoire à l'Institut international des cultures extraterrestres, qui étudie la Zone. Il y accompagne les scientifiques en expédition. Son chef et ami s'appelle Kirill Panov, un jeune savant russe, idéaliste, qui croit que la Zone peut faire avancer l'humanité.

Ensemble, ils entrent dans la Zone pour récupérer un plein, un objet très rare. Ils le trouvent. Mais en chemin, Kirill frôle une toile d'argent, un fil presque invisible accroché dans un garage. Il ne sent rien. Quelques heures plus tard, de retour en ville, il meurt d'une crise cardiaque.

Red ne se le pardonne pas. Il quitte l'Institut. Il redevient stalker à plein temps.

# Guta et la petite Guenon

Red aime une femme, Guta. Elle est enceinte de lui. Il l'épouse. Ils ont une fille.

C'est là que le roman devient terrible. Les enfants des stalkers naissent souvent différents. La fille de Red est couverte d'un fin duvet doré, elle a les yeux entièrement noirs. On la surnomme la Guenon. Elle est douce, joyeuse, elle aime son père. Et peu à peu, au fil des années, elle devient moins humaine. Elle parle de moins en moins. Elle comprend de moins en moins.

Ce n'est pas tout. À Harmont, les morts du cimetière de la Zone commencent à revenir. Ils sortent de terre et rentrent chez eux, en silence. Ils ne sont pas dangereux, ils ne font rien. Ils s'assoient. Le père de Red, mort depuis longtemps, revient s'installer dans la maison, à table, immobile. Personne ne sait quoi en faire. Les autorités voudraient les enlever. Red refuse.

La Zone ne reste pas dans la Zone. Elle entre dans les familles, dans les corps, dans les maisons. Ceux qui ont quitté Harmont après la Visite connaissent des malheurs étranges : un coiffeur dont les clients meurent, des catastrophes qui suivent les émigrés partout où ils vont.

# Le Vautour

Le deuxième grand personnage de stalker du roman s'appelle Burbridge, et on le surnomme le Vautour. C'est un vieux stalker, plus vieux que Red, rusé, sans scrupules. Il conduit des gens dans la Zone, et il revient souvent seul.

Un jour, Red et le Vautour entrent ensemble dans la Zone. Le Vautour marche dans la gelée de sorcière. Ses jambes se dissolvent de l'intérieur, les os deviennent comme du caoutchouc. Red pourrait l'abandonner. Il le porte sur son dos jusqu'à la sortie. Le Vautour perd ses deux jambes.

Des années plus tard, Burbridge, cul-de-jatte, dirige à Harmont une entreprise de pique-niques pour touristes au bord de la Zone. Une couverture : en réalité, il forme de jeunes stalkers. Il a des enfants, une fille très belle, Dina, et un fils, Arthur, un garçon de vingt ans, beau, gentil, plein d'espoir. Ses enfants, lui, sont parfaitement normaux. On murmure que c'est parce qu'il est allé jusqu'à la Boule d'or, et qu'il lui a demandé des enfants en bonne santé.

# Le pique-nique

Au milieu du roman, il y a une conversation, dans un restaurant. Le docteur Pilman déjeune avec Richard Noonan, un homme d'affaires de Harmont qui est en réalité un agent infiltré chargé de lutter contre la contrebande d'objets. Noonan lui demande ce qu'était vraiment la Visite. Et Pilman répond par une image.

Imagine, dit-il, un pique-nique. Des gens arrivent en voiture au bord d'une route, dans une forêt. Ils s'installent dans une clairière, mangent, boivent, écoutent de la musique. Puis ils repartent. Derrière eux, ils laissent des déchets : des bouteilles, des bougies d'allumage usées, un filtre, des chiffons, une flaque d'huile. Le soir, les animaux de la forêt sortent de leur terrier. Ils trouvent ces objets. Ils ne savent pas ce que c'est. Certains se blessent, certains s'empoisonnent, certains les trouvent utiles.

Voilà ce qu'est la Zone, selon Pilman. Les visiteurs ne sont pas venus pour nous. Ils ne nous ont probablement même pas remarqués. Ils se sont arrêtés au bord du chemin, ils ont mangé, ils sont repartis. Et nous sommes les fourmis qui fouillent leurs ordures en se demandant si c'est un message.

C'est l'idée la plus vertigineuse du roman. Toute la science-fiction de l'époque imaginait le premier contact comme un grand moment de l'histoire humaine. Les Strougatski imaginent un premier contact où l'humanité ne compte pour rien.

@yt D1kVFXa7vwU | Pique-nique au bord du chemin : la Zone du roman (en anglais).

# La Boule d'or

La dernière partie du roman se passe quelques années plus tard. Red a fait de la prison. Sa fille ne parle presque plus. Il a besoin d'argent, et surtout, il a besoin d'un miracle.

Le Vautour lui donne la carte qui mène à la Boule d'or. Et il lui demande d'emmener Arthur, son fils, qui rêve d'y aller.

Red sait une chose qu'Arthur ignore. Le chemin vers la Boule d'or passe par un endroit qu'on appelle le hachoir. Un piège qui tue forcément le premier qui passe. Pour atteindre la Boule, il faut que quelqu'un y aille devant. C'est pour cela que le Vautour revenait seul. C'est pour cela que Red a accepté d'emmener le garçon.

Ils traversent la Zone ensemble. Une longue marche, des heures, des pièges contournés, des détours imposés par des dangers invisibles. Arthur est enthousiaste, confiant, il admire Red. Red le déteste et se déteste.

Ils arrivent au fond d'une carrière. La Boule d'or est là, en contrebas, posée au milieu des cailloux. Arthur se met à courir vers elle en criant son vœu à pleins poumons. Le hachoir le saisit.

# Le vœu

Red reste seul devant la Boule. Il est épuisé, sale, couvert de boue. Il a enfin ce qu'il est venu chercher, et il ne sait plus quoi demander.

@art g 1 | Le vœu.

Il essaie de penser. Il cherche en lui un vœu, quelque chose de vrai, de propre. Il voudrait que sa fille guérisse. Il voudrait de l'argent. Il voudrait que Kirill soit vivant. Il voudrait comprendre. Et il découvre que sa vie entière a été une vie d'animal, qu'il n'a jamais pensé à rien d'autre qu'à survivre, et qu'il ne sait pas ce qu'est le bonheur. Il demande à la Boule de regarder en lui, et de trouver elle-même ce qu'il y a de bon.

Et à la fin, à bout, il répète simplement les mots que criait le garçon qu'il vient d'envoyer à la mort.

!! LE DERNIER VŒU :: Il crie, à pleins poumons, le bonheur pour tout le monde, gratuitement, et que personne ne reste à l'écart. Les mots d'un garçon naïf, dans la bouche d'un homme qui ne croyait plus à rien.

Le roman s'arrête là. On ne sait pas si la Boule a exaucé quoi que ce soit.

# Ce que la censure a fait au roman

Pique-nique au bord du chemin a eu une vie difficile en Union soviétique. Après sa publication en revue, en 1972, les Strougatski ont dû attendre huit ans pour qu'il paraisse en livre. Les éditeurs exigeaient des corrections sans fin : moins de grossièretés, moins de violence, moins de pessimisme, un héros plus présentable.

Les versions publiées entre 1980 et 1990 sont lourdement censurées, et assez éloignées de ce que les frères avaient écrit. Il faut attendre les années 1990 pour lire en russe le texte qu'ils considéraient comme le vrai.

À l'étranger, le roman a fait une carrière immense. Une première traduction anglaise paraît en 1977, avec une préface de l'écrivain américain Theodore Sturgeon. Une nouvelle traduction, complète, sort en 2012, avec une préface d'Ursula K. Le Guin et une postface de Boris Strougatski. Le livre est traduit dans des dizaines de langues.

# Le film

En 1979 sort Stalker, d'Andreï Tarkovski. Il dure près de deux heures quarante. Il ne contient presque aucune action, presque aucun effet spécial. Et il est souvent cité parmi les plus grands films jamais tournés.

Le film commence en noir et blanc, ou plutôt dans un brun sale, sépia. Une chambre, un lit, un homme qui se lève sans bruit pour ne pas réveiller sa femme et sa fille. Un verre d'eau qui tremble sur la table au passage d'un train. Le Stalker s'en va. Sa femme le supplie de ne pas y retourner. Il y va quand même.

Il a deux clients. On ne connaît pas leurs noms : l'un est l'Écrivain, un auteur à succès, cynique, en panne d'inspiration. L'autre est le Professeur, un physicien, silencieux, sérieux, qui porte un sac à dos. Les trois hommes forcent un barrage militaire, en voiture, sous les tirs, puis montent sur une draisine, un petit wagon à moteur, qui les emmène le long d'une voie ferrée, longtemps, dans un vacarme rythmé. Et soudain, la couleur apparaît. Ils sont dans la Zone.

# La Zone de Tarkovski

Dans le film, il n'y a ni extraterrestres, ni objets, ni pièges visibles. La Zone est un paysage. Des herbes hautes, des ruines envahies par la végétation, des tanks rouillés, des poteaux électriques, de l'eau partout, stagnante, sur laquelle flottent des objets abandonnés : une seringue, une pièce de monnaie, une icône.

Le Stalker dit que la Zone est vivante. Qu'elle change sans cesse. Qu'un chemin sûr hier peut tuer aujourd'hui. Qu'on n'y va jamais tout droit. Pour savoir où marcher, il lance devant lui des écrous auxquels sont noués des bouts de bandage, et il avance là où l'écrou est tombé. C'est tout. Le danger n'est jamais montré. On ne voit pas un seul piège se déclencher. Et pourtant, on a peur à chaque pas.

Le Stalker, joué par Kaïdanovski, est un homme fragile, au crâne rasé, aux yeux immenses, presque un saint. Il parle de la Zone avec amour. C'est le seul endroit où il se sent libre. Il dit que ceux qui y entrent doivent être humbles, faibles, malheureux. Les forts ne passent pas.

Il y a un chien noir, aussi. Il apparaît dans la Zone, suit les trois hommes, et repart avec le Stalker à la fin.

# Le hachoir à viande

Au milieu du voyage, les trois hommes doivent traverser un long tunnel, que le Stalker appelle le hachoir à viande. Un couloir sombre, humide, interminable, au fond duquel coule de l'eau.

C'est là qu'on comprend le jeu cruel du Stalker. Il fait passer l'Écrivain en premier, sans lui dire ce que cela signifie.

L'Écrivain y va. Il passe. Il comprendra plus tard qu'il a servi d'éclaireur. Mais il est vivant.

Le film garde l'idée du roman, celle du compagnon qu'on envoie en premier au piège, mais il la retourne. Chez les Strougatski, le garçon meurt. Chez Tarkovski, personne ne meurt. La menace reste suspendue, et c'est encore plus inquiétant.

# Porc-épic

Pendant le voyage, le Stalker raconte l'histoire de son maître, un autre stalker qu'on surnommait Porc-épic.

Porc-épic avait emmené son frère dans la Zone, et son frère y était mort à cause de lui. Alors il est allé jusqu'à la Chambre, au fond de la Zone, pour demander qu'on lui rende son frère. Il est rentré chez lui. Son frère n'est pas revenu. Mais Porc-épic est devenu immensément riche. Une semaine plus tard, il a mis fin à ses jours.

La Chambre ne donne pas ce qu'on demande. Elle donne ce qu'on désire vraiment, au plus profond de soi, même si on ne le sait pas, même si on en a honte. Porc-épic a compris ce qu'il était au fond : un homme qui voulait de l'argent plus que son frère. Il n'a pas pu vivre avec ça.

C'est la grande invention du film. Dans le roman, la Boule d'or exauce peut-être les vœux. Dans le film, la Chambre est un miroir. Elle ne pardonne rien.

# La Chambre

Ils arrivent enfin. Une salle en ruine, inondée, couverte de dunes de sable, puis un seuil, et derrière, la Chambre. Personne n'y entre.

Le Professeur sort de son sac ce qu'il transportait depuis le début : une bombe. Une charge de vingt kilotonnes. Il veut détruire la Chambre. Il explique : un endroit pareil, s'il tombe entre de mauvaises mains, si un fou, un dictateur, un fanatique y entre, peut détruire le monde. Il vaut mieux qu'elle n'existe pas.

Le Stalker se jette sur lui, le supplie, pleure. La Chambre est la dernière chose qui donne de l'espoir aux malheureux. L'Écrivain frappe le Stalker, l'insulte, refuse d'entrer lui aussi : il a compris l'histoire de Porc-épic, et il ne veut pas savoir ce qu'il désire vraiment.

Finalement, le Professeur démonte sa bombe. Il en jette les morceaux dans l'eau. Les trois hommes s'assoient au bord de la Chambre, sans y entrer, sous une pluie fine qui tombe du plafond effondré. Personne n'a fait de vœu.

# La femme du Stalker

Ils rentrent. Le bar du début, les mêmes visages, la sépia revenue. Le Stalker rentre chez lui, épuisé, désespéré. Il dit à sa femme que plus personne ne croit à rien, que les intellectuels ne savent plus espérer.

Puis la femme du Stalker, jouée par Alissa Freindlich, se tourne vers la caméra et parle. Directement au spectateur. Elle raconte comment elle a rencontré cet homme, comment sa mère l'avait prévenue que c'était un stalker, un condamné, un homme éternel, et comment elle l'a suivi quand même. Elle dit qu'elle a eu du malheur, beaucoup. Et qu'elle ne regrette rien, parce que sans malheur, il n'y aurait pas eu de bonheur non plus, ni d'espoir.

C'est un des monologues les plus célèbres du cinéma. Il dit, sans un mot sur la Zone, que la foi ne se trouve peut-être pas au fond d'une chambre miraculeuse, mais dans l'amour obstiné de quelqu'un qui reste.

# La Guenon

La dernière scène est consacrée à la fille du Stalker. On l'appelle la Guenon, comme dans le roman. Elle n'a pas de jambes, ou ne peut pas marcher : on l'a vue plus tôt portée sur les épaules de son père. Elle est assise à une table, seule, un livre à la main. Elle lit, dans sa tête, un poème de Fiodor Tiouttchev.

@art 2 | La Guenon.

Puis elle pose la tête sur la table, et regarde les verres posés devant elle. Le premier glisse lentement, tout seul, sur la table. Puis le deuxième. Le troisième tombe. Un train passe. La table tremble. Et dans le bruit du train se mêlent, lointaines, les mesures de l'Hymne à la joie de Beethoven.

La fille a des pouvoirs. Elle est un enfant de la Zone. Le miracle que les trois hommes n'ont pas osé demander est là, dans la maison, depuis le début. Personne ne le voit.

# Le tournage maudit

Le tournage de Stalker est un des plus éprouvants de l'histoire du cinéma soviétique.

Tarkovski prévoit d'abord de tourner dans une région minière du Tadjikistan. Un tremblement de terre ravage la zone avant le tournage. L'équipe part pour l'Estonie.

Le premier tournage, avec le directeur de la photographie Gueorgui Rerberg, dure des mois. Puis la pellicule est développée, et presque tout est inutilisable. On accuse une nouvelle pellicule Kodak que les laboratoires soviétiques ne savaient pas traiter. Tarkovski, déjà en conflit avec Rerberg, le renvoie. Il doit demander l'autorisation de recommencer presque tout le film. Le remplaçant de Rerberg s'en va à son tour, et c'est Alexandre Kniajinski qui termine. Tarkovski fait entre-temps un infarctus. Il neige en plein été.

Le film est tourné autour de Tallinn, dans des usines abandonnées, une ancienne centrale hydroélectrique détruite pendant la guerre, et le long de la rivière Jägala, en aval d'une usine chimique.

L'ingénieur du son, Vladimir Charoune, a raconté plus tard que des liquides toxiques étaient déversés dans la rivière, qu'on voyait de la mousse flotter à la surface, et que des membres de l'équipe avaient eu des réactions allergiques. Anatoli Solonitsyne est mort d'un cancer du poumon en 1982. Tarkovski en est mort à Paris, en décembre 1986. Larissa Tarkovskaïa, sa femme et assistante sur le film, est morte de la même maladie en 1998. Aucun lien n'a jamais été établi officiellement entre ces cancers et le tournage. Mais l'hypothèse est restée, et elle a donné au film une aura de malédiction.

# Tchernobyl

Le 26 avril 1986, sept ans après la sortie du film, un réacteur de la centrale nucléaire de Tchernobyl, en Ukraine soviétique, explose. Une zone d'exclusion de trente kilomètres est évacuée. La ville de Pripiat, construite pour les employés de la centrale, est vidée de ses habitants en quelques heures. Elle reste telle quelle : les manèges de la fête foraine qui devait ouvrir quelques jours plus tard, les cahiers dans les écoles, les poupées dans les crèches.

La ressemblance avec la Zone de Tarkovski a frappé tout le monde. Une terre interdite, gardée par l'armée, où la nature reprend tout, où le danger est invisible, et où l'on ne revient pas tout à fait le même. Les visiteurs clandestins qui ont commencé à s'y aventurer ont repris le mot. Ils se sont appelés des stalkers.

La fiction avait inventé un lieu. L'histoire l'a fabriqué.

# S.T.A.L.K.E.R.

En 2007, un studio de Kyiv, GSC Game World, sort S.T.A.L.K.E.R.: Shadow of Chernobyl. C'est un jeu de tir et de survie, en monde ouvert, qui se passe dans la zone de Tchernobyl, reconstituée d'après les lieux réels : Pripiat, la centrale, les villages abandonnés, les fermes collectives, le radar géant qu'on appelle le Pic-vert russe.

L'univers du jeu mélange tout. Il imagine qu'en 2006, une deuxième catastrophe a frappé la centrale. Une explosion d'une autre nature, qui a transformé la zone en une Zone, avec une majuscule. Il y a désormais des anomalies qui écrasent, brûlent, électrocutent, comme les pièges du roman. Il y a des artefacts, des objets étranges aux propriétés miraculeuses, que les stalkers ramassent et revendent. Il y a des mutants, des animaux déformés, des chiens aveugles, des créatures invisibles. Et régulièrement, des émissions : des vagues d'énergie qui balaient la Zone et tuent quiconque n'a pas trouvé d'abri.

Des centaines de stalkers vivent dans cette Zone. Ils se regroupent en factions. Le Devoir, militaire et discipliné, veut détruire la Zone. La Liberté, anarchiste, veut l'ouvrir au monde. Les bandits pillent. Les militaires tirent à vue. Les scientifiques étudient. Et au centre, autour de la centrale, il y a le Monolithe, une secte de stalkers en armure qui vénèrent une pierre et tuent tous ceux qui approchent.

Le jeu sort plein de bugs et de défauts techniques. Il se vend à environ deux millions d'exemplaires. Et il devient culte.

@yt c7GIiWl4vMM | Comment Pique-nique au bord du chemin a inspiré toute une génération de créateurs de jeux (en anglais).

# Strelok et la Conscience

Dans Shadow of Chernobyl, on incarne un stalker sans mémoire, qu'on appelle le Marqué, parce qu'il a un tatouage sur le bras : le mot S.T.A.L.K.E.R. On l'a trouvé dans un camion de la mort, un convoi de cadavres. Son assistant numérique contient une seule mission : tuer Strelok.

Strelok est une légende de la Zone. Le stalker qui est allé plus loin que tous les autres, vers le centre, vers la centrale. On raconte qu'au cœur de la centrale se trouve l'Exauceur, un artefact qui accorde n'importe quel vœu. C'est la Boule d'or des Strougatski, et la Chambre de Tarkovski.

Le Marqué remonte la piste. Il explore des laboratoires souterrains, découvre des expériences secrètes sur le cerveau humain, une machine qu'on appelle le Brûle-cerveau, qui transforme ceux qui approchent en zombies. Et il découvre la vérité : le Marqué, c'est Strelok lui-même. On lui a effacé la mémoire.

Au centre de la centrale, il y a deux fins. L'Exauceur est un piège. Ceux qui l'atteignent voient leur vœu se réaliser de la pire des façons : celui qui veut être riche est enseveli sous l'or, celui qui veut l'immortalité est changé en statue. La vraie fin est ailleurs : derrière une porte cachée, Strelok découvre la Conscience C, un groupe de scientifiques qui ont relié leurs esprits pour tenter de modifier la conscience collective de l'humanité. Ce sont eux qui ont créé la Zone, par accident, en 2006. Strelok peut les rejoindre, ou les détruire.

Dans la fin considérée comme officielle, il les détruit. Puis il s'endort dans un champ de blé, sous le soleil, et se demande s'il a fait le bon choix.

# Clear Sky et Call of Pripyat

En 2008, Clear Sky raconte ce qui s'est passé avant. On incarne Balafre, un mercenaire qui survit aux émissions, recruté par une faction secrète de scientifiques, Ciel Clair. Leur chef, Lebedev, pense que Strelok et son groupe, en s'approchant trop du centre, provoquent les émissions. Balafre poursuit Strelok jusqu'à la centrale. Le jeu se termine sur une émission gigantesque, et Strelok qui perd la mémoire : c'est ainsi qu'il devient le Marqué.

En 2009, Call of Pripyat se passe juste après le premier jeu. Le gouvernement ukrainien, croyant la voie libre depuis que Strelok a désactivé le Brûle-cerveau, envoie une opération militaire en hélicoptère vers la centrale, l'opération Fairway. Tous les hélicoptères s'écrasent. On incarne le major Alexandre Degtiarev, envoyé discrètement pour comprendre pourquoi. Il retrouve les survivants à Pripiat. Il y rencontre Strelok. Toutes les fins laissent entendre la même chose : la Zone s'étend. Elle pourrait un jour dépasser l'Ukraine.

C'est souvent le jeu préféré des fans : plus calme, plus libre, plus humain, avec ses stalkers qui racontent des blagues autour du feu, la nuit, une guitare à la main.

# Heart of Chornobyl

Pendant des années, une suite est annoncée, puis annulée, puis annoncée à nouveau. Le studio ferme en 2011, rouvre, reprend le projet. S.T.A.L.K.E.R. 2: Heart of Chornobyl est en plein développement quand, en février 2022, l'armée russe envahit l'Ukraine. Elle traverse justement la zone de Tchernobyl, et occupe la centrale pendant plusieurs semaines.

Une partie de l'équipe quitte Kyiv pour Prague. D'autres restent. Certains s'engagent dans l'armée. Le studio continue de travailler, sous les sirènes et les coupures d'électricité. Le jeu sort finalement en novembre 2024.

Il y a quelque chose de vertigineux dans cette histoire. Un roman soviétique imagine une Zone. Un film soviétique la tourne en Estonie. Une catastrophe soviétique la crée en Ukraine. Des Ukrainiens en font un jeu. Et ce jeu s'achève sous les bombes russes, pendant que de vrais soldats creusent des tranchées dans la terre contaminée de la vraie Zone.

# Trois Zones, trois questions

Le roman, le film et les jeux posent chacun une question différente.

@art 3 | Trois Zones, trois questions.

Le roman des Strougatski demande : que vaut l'humanité face à l'univers ? Sa réponse est terrible : pas grand-chose. Nous sommes des fourmis qui fouillent les ordures d'un pique-nique. Mais au fond de cette humilité, il y a un homme sale et brutal qui, devant un objet magique, ne trouve rien d'autre à demander que le bonheur de tous. Le livre est cynique, et il se termine sur un cri d'espoir.

Le film de Tarkovski demande : que désires-tu vraiment ? Sa Zone n'est pas un lieu extraterrestre, c'est un lieu intérieur, une épreuve morale. La Chambre ne sert pas à obtenir quelque chose, elle sert à savoir qui l'on est. Et personne n'ose entrer. Le vrai miracle est ailleurs : dans une femme qui aime, dans une enfant qui déplace un verre.

Les jeux demandent : peux-tu survivre ici ? Leur Zone est physique, hostile, quotidienne. On y a faim, on y a froid, on y a peur la nuit. Et elle porte le poids d'une catastrophe réelle, d'un pays réel, d'une guerre réelle.

!! CE QUE LA ZONE EST :: Dans les trois œuvres, la Zone est un lieu où les règles du monde sont suspendues, et où l'on découvre ce que l'on vaut vraiment. Elle est ce que l'humanité laisse derrière elle, ou ce qu'on laisse derrière l'humanité. Une ruine qui exauce les vœux, et qui fait payer ceux qui les formulent.

# Ce que tu peux en prendre

La Zone t'apprend la puissance du danger invisible. Ni le roman ni le film ne montrent beaucoup de pièges. Un écrou lancé dans l'herbe, un fil d'argent dans un garage. Le spectateur remplit tout le reste avec sa peur. Moins on montre la menace, plus elle grandit.

Elle t'apprend aussi ce que l'adaptation peut faire. Tarkovski a gardé trois éléments du roman et jeté le reste. Il n'a pas trahi les Strougatski : il a extrait de leur livre une autre œuvre, qui ne pouvait exister qu'au cinéma. Adapter, ce n'est pas recopier. C'est trouver ce qui, dans une histoire, peut vivre ailleurs.

Elle t'apprend que les meilleurs mondes inventés sont ceux qui laissent de la place. La Zone n'est jamais entièrement expliquée. Chaque créateur qui l'a rencontrée y a mis autre chose : la place de l'homme dans l'univers, le désir, la survie, la catastrophe. Un monde trop expliqué se ferme. Un monde mystérieux se transmet.

Et elle t'apprend la plus belle leçon du film : le miracle ne se trouve peut-être pas au bout du voyage. Il est peut-être resté à la maison, assis à une table, en train de regarder un verre.
`,
};
export default book;
