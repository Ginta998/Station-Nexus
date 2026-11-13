const book = {
  id: "final-fantasy-xiii", title: "Final Fantasy XIII", sub: "Fal'Cie, l'Cie et le destin imposé", room: "lore", type: "recit", format: "vhs", cote: "LO-010", color: 322, emblem: "晶",
  about: "Un monde-coquille suspendu dans le ciel, des dieux-machines abandonnés par leur créateur qui nourrissent les hommes comme du bétail, et six personnes marquées d'une tâche qu'on ne leur a pas dite. L'histoire du jeu remise à plat, avec ce que le jeu cachait dans ses archives, puis toute la trilogie, jusqu'au dernier jour du monde.",
  links: [
    { label: "Final Fantasy XIII (Square Enix, 2009)", note: "Réalisé par Motomu Toriyama, écrit par Daisuke Watanabe, sur une mythologie de Kazushige Nojima. Lis les archives du menu au fur et à mesure : le jeu y a rangé la moitié de son histoire." },
    { label: "Final Fantasy XIII-2 (2011) et Lightning Returns (2013)", note: "Les suites défont la fin, puis le monde. À voir comme une variation, pas comme une conclusion nécessaire." },
    { label: "Les mythes gnostiques", note: "Un monde fabriqué par des puissances inférieures qui tiennent les hommes captifs en les comblant. C'est la structure exacte du jeu, comme celle de Méridien de sang." },
    { label: "Platon, La République, livre VII", note: "La caverne : des prisonniers qui prennent des ombres pour le monde et ne veulent pas sortir. Cocoon est une caverne confortable." },
    { label: "Le Ragnarök dans l'Edda", note: "Le nom de la bête finale. Dans le mythe nordique, c'est la fin du monde et aussi son recommencement. Libre de droits." },
    { label: "La musique de Masashi Hamauzu", note: "Écoute le thème de la Promesse et celui de la steppe d'Archylte. Une grande part de l'émotion du jeu est là." },
  ],
  text: String.raw`
# Le jeu mal aimé

Tu l'aimes, et tu sais qu'on te regarde de travers quand tu le dis. Final Fantasy XIII est le plus contesté de la série. Il est sorti au Japon fin 2009, puis dans le reste du monde début 2010, après une attente immense : on l'avait annoncé dès 2006, avec des images qui faisaient rêver, et il était le premier grand Final Fantasy de la nouvelle génération de consoles. Il s'est très bien vendu. Et il a profondément divisé.

On lui a reproché d'être un couloir. Pendant une vingtaine d'heures, le joueur avance en ligne droite, d'un combat à l'autre, sans ville à visiter, sans marchand à qui parler, sans carte à explorer, avant que le monde s'ouvre enfin. On lui a reproché de ne rien expliquer : les mots fal'Cie, l'Cie, Cie'th pleuvent dès la première heure, et le jeu range la moitié de son histoire dans des archives à lire dans un menu. On lui a reproché des personnages agaçants, un scénario confus, un système de combat qui joue presque tout seul au début.

@yt wgWz9y8eWYY | Final Fantasy XIII (2010), la bande-annonce de lancement.

Ces reproches sont justes, et je ne vais pas faire semblant du contraire. Mais je vais te montrer qu'ils désignent, sans le vouloir, ce que le jeu raconte. C'est l'histoire de six personnes à qui l'on a retiré toute liberté de mouvement, qui avancent dans un couloir que d'autres ont tracé pour elles, sans comprendre la mission qu'on leur a confiée, et qui découvrent à la fin que leur révolte même faisait partie du plan. La forme est pénible parce que le sujet l'est. Et le jour où le couloir s'ouvre sur une plaine immense, le joueur ressent physiquement ce que ressentent les personnages : enfin, de l'air.

Le jeu est développé et édité par Square Enix. Il est dirigé par Motomu Toriyama, qui avait réalisé Final Fantasy X-2, et produit par Yoshinori Kitase, l'un des pères de Final Fantasy VII. Le scénario est écrit par Daisuke Watanabe, à partir de la vision de Toriyama. La mythologie qui le sous-tend a été imaginée par Kazushige Nojima, le scénariste de Final Fantasy VII et X. Les personnages sont dessinés par Tetsuya Nomura. La musique est de Masashi Hamauzu, qui signe une partition plus orchestrale et plus lyrique que celles de la série précédente, avec des thèmes devenus célèbres : Blinded by Light pour les combats, The Sunleth Waterscape, le thème de Fang, et surtout celui de la steppe d'Archylte, qu'on entend au moment où le monde s'ouvre.

Le jeu fait partie d'un projet plus vaste, la Fabula Nova Crystallis, une mythologie commune à plusieurs titres, chacun racontant un monde différent à partir des mêmes dieux. Un autre de ces projets, longtemps appelé Versus XIII, deviendra Final Fantasy XV. Final Fantasy XIII aura deux suites directes. Je vais tout remettre dans l'ordre, y compris ce qui est dans les archives, et que beaucoup de joueurs n'ont jamais lu.

# Les dieux partis et les deux mondes

Pour comprendre Final Fantasy XIII, il faut remonter avant le monde, au mythe que les archives racontent par fragments.

@art 1 | Les dieux partis et les deux mondes.

Au commencement, il y avait une déesse, Mwynn, qui régnait sur le monde visible et le monde invisible. Son fils, Bhunivelze, la tua pour prendre sa place. Mais Mwynn ne disparut pas tout à fait : elle se retira dans le monde invisible, l'au-delà, là où vont les âmes. Et Bhunivelze, devenu le dieu suprême, n'eut plus qu'une obsession : la retrouver, ouvrir la porte de l'invisible, et la détruire pour de bon. Il craignait, dit le mythe, que le monde ne soit maudit tant qu'elle existerait.

Il créa pour cela trois divinités. **Pulse**, chargée de chercher la porte en façonnant le monde. **Lindzei**, chargée de protéger Bhunivelze pendant son sommeil. Et **Etro**, la dernière, faite à l'image de Mwynn, si ressemblante qu'il ne put la regarder : il la rejeta et ne lui donna aucun pouvoir. Puis il s'endormit dans un cristal, pour attendre que la porte s'ouvre.

Etro, abandonnée, se mit à pleurer. De son sang naquirent les humains. Et elle mit en chacun d'eux une parcelle de chaos, cette matière de l'invisible : c'est ce chaos qui leur donne un cœur, des émotions, une âme. Quand un humain meurt, son âme passe dans l'invisible, en traversant une porte que garde Etro. Elle vit seule, dans un monde hors du temps, Valhalla.

Pulse et Lindzei, eux, ne pouvaient pas créer comme les dieux. Ils fabriquèrent des serviteurs pour travailler à leur place. Ce sont les **fal'Cie**. Des machines vivantes, immenses, chacune faite pour une tâche précise : creuser, bâtir, éclairer, gouverner. Les fal'Cie de Pulse façonnèrent le grand monde sauvage d'en bas, qu'on appellera Gran Pulse. Ceux de Lindzei construisirent, dans le ciel, une sphère protégée, un abri : **Cocoon**.

Puis les dieux se turent. Pulse partit on ne sait où. Lindzei aussi. Etro resta seule dans son au-delà. Et les fal'Cie continuèrent leur tâche, seuls, depuis des millénaires, sans maître et sans fin.

Voilà le secret qui commande tout le jeu : les fal'Cie sont des serviteurs abandonnés. Chacun a reçu une fonction et ne peut pas en sortir. Un fal'Cie fait ce pour quoi il a été fait, pour toujours, sans pouvoir vouloir autre chose. Ils sont tout-puissants et ils n'ont aucune liberté. Et ils n'ont qu'un désir, qui est aussi leur seule mission héritée : rouvrir la porte, pour que leur créateur revienne.

!! À RETENIR :: Les dieux sont partis. Leurs machines continuent leur tâche sans eux depuis des millénaires. Tout ce qui arrive dans le jeu vient de ce qu'elles ne le supportent plus, et de ce qu'elles ont trouvé un moyen de faire revenir leur maître.


Il y a donc d'abord un monde vaste, sauvage, magnifique et mortel : Gran Pulse. Des bêtes hautes comme des collines y broutent sous un ciel immense. Des fal'Cie géants y travaillent encore, comme Titan, qui façonne le paysage à coups de poing, ou Atomos, un ver colossal qui creuse la terre. Les hommes y ont vécu autrefois, dans des villages perchés, toujours menacés par les bêtes, et ils étaient durs, libres, habitués à mourir.

Et au-dessus de ce monde, dans son ciel, flotte une sphère grande comme un petit continent. Sa surface est une coque. À l'intérieur, sur la face interne, il y a des villes, des mers, des champs, des forêts, un soleil artificiel au centre, qui est lui-même un fal'Cie, Phoenix. Des millions de gens y vivent. La nourriture est abondante, l'énergie ne manque jamais, le climat est réglé, les monstres sont tenus dans des réserves. Personne n'a besoin de se battre pour survivre. Au cœur du système, à la capitale, Eden, un fal'Cie gouverne, et un autre, caché dans les profondeurs, Orphan, fournit l'énergie qui fait tout tenir.

Les habitants de Cocoon ne voient jamais le monde d'en bas. Mais on leur en parle depuis l'enfance : c'est l'enfer. Tout ce qui vient de Pulse est une souillure. Il y a des siècles, une guerre a eu lieu. Des créatures de Pulse ont attaqué le cocon et en ont fendu la coque, laissant une cicatrice qu'on voit encore. On appelle cela la guerre de la Transgression, et on s'en souvient avec terreur.

Un gouvernement humain, le Sanctum, administre la vie quotidienne au nom des fal'Cie, que les citoyens vénèrent comme des dieux protecteurs. À sa tête, un vieil homme respecté, le Primarque Galenth Dysley. L'armée maintient l'ordre. La propagande entretient la peur de Pulse. Et la peur rend obéissant.

Retiens cette image avant tout le reste : un paradis fermé, suspendu au-dessus d'un monde qu'on a appris à haïr, gouverné par des machines qui veulent quelque chose que les hommes ignorent.

# La marque

Les fal'Cie, qu'ils viennent de Pulse ou de Cocoon, ont un pouvoir sur les hommes. Ils peuvent en choisir un, n'importe lequel, et le marquer.

Celui qui est marqué devient un l'Cie. Un signe noir apparaît sur sa peau, quelque part sur son corps. Il reçoit la magie, une force qu'aucun homme ordinaire ne possède. Et il reçoit une mission, que le jeu appelle une Tâche.

Le fal'Cie ne dit pas quelle est cette tâche. Il n'en a peut-être même pas le moyen, puisqu'il ne parle pas la langue des hommes. Le l'Cie la reçoit sous la forme d'une vision, quelques images confuses, un rêve qu'il doit interpréter seul. À lui de deviner ce qu'on attend de lui, sans jamais être sûr d'avoir compris.

Et la marque est un sablier. Elle grandit. Elle se couvre de flèches, puis un œil s'y ouvre, rouge. Le temps est compté, et il s'écoule plus vite quand le porteur a peur ou désespère.

Il y a deux issues, et pas une de plus.

Si le l'Cie échoue, ou si le temps s'épuise, il devient un Cie'th : une chose de pierre et de cristal noir, qui a perdu son nom et sa raison, qui erre en gémissant, et qui finit par se figer à son tour en statue de pierre, les bras levés. Tu en croises partout dans le jeu. Ce sont des gens. Sur Pulse, on trouve même des stèles où des Cie'th, qui n'ont jamais pu accomplir leur Tâche, attendent qu'un autre la termine à leur place.

S'il réussit, il est changé en cristal. Une statue transparente, figée dans la pose de son dernier instant, qui peut dormir ainsi pendant des siècles. Les fal'Cie appellent cela la vie éternelle. C'est la récompense.

Lis-le une seconde fois. Échouer, c'est devenir un monstre. Réussir, c'est devenir une statue. Dans les deux cas, ta vie est finie à l'instant où la marque apparaît. Le jeu a inventé là une des images les plus nettes que je connaisse d'un destin imposé : on t'a choisi sans te demander, on ne t'a pas dit pour quoi, et les deux sorties sont fermées.

Et il y a une troisième chose, que les personnages découvrent en route. Quand le désespoir d'un l'Cie devient trop lourd, quelque chose surgit de sa marque : une créature de métal et de lumière, un Eidolon, qui se jette sur lui. Il faut la soumettre, ou mourir. Une archive suggère que c'est Etro, la déesse oubliée, qui envoie ces créatures, par pitié : pour achever ceux qui souffrent trop, ou leur donner la force de se relever. C'est la plus belle idée du jeu. Le salut y arrive sous la forme d'un ennemi. Chacun des six héros verra surgir le sien, à l'instant précis où il renonce.

# Bodhum et les six

L'histoire commence dans une ville du bord de mer, Bodhum. Une petite station balnéaire, ensoleillée, où l'on fête chaque année un grand feu d'artifice. Sous la ville, dans une vieille ruine fermée au public, dort depuis des siècles quelque chose qui n'a rien à faire dans le cocon : un fal'Cie de Pulse, Anima, avec son sanctuaire. Les autorités le surveillent. Les habitants n'y pensent pas.

@art g 1 | Bodhum et les six.

Une jeune fille, Serah Farron, entre un jour dans la ruine. Elle a dix-huit ans, elle est douce, rêveuse, elle vit avec sa sœur aînée. Le fal'Cie la marque. Elle devient une l'Cie de Pulse, la pire chose qui existe aux yeux de Cocoon.

Serah a un fiancé, Snow Villiers, un grand garçon blond, bruyant, qui dirige une petite bande de jeunes volontaires, NORA, qui protège la plage et rend service aux habitants. Elle lui montre sa marque. Il lui promet de la protéger, et de l'épouser quand même.

Le jour de l'anniversaire de sa sœur, Serah lui annonce tout à la fois : qu'elle est une l'Cie, et qu'elle va se marier avec Snow. Sa sœur ne la croit pas. Elle pense que c'est un prétexte pour faire accepter le fiancé, qu'elle méprise. Elle se met en colère. Serah part en pleurant. Puis la ruine se referme sur elle.

Le gouvernement réagit à la découverte du fal'Cie par une loi d'exception. Toute la population de Bodhum a pu être contaminée. Elle sera donc déplacée vers Pulse, en exil. On appelle cela la Purge. On embarque les habitants, par familles entières, dans des trains. Le reste de Cocoon applaudit, soulagé. La peur du monde d'en bas est si profonde que personne ne trouve cela étrange.

Les trains ne vont nulle part. Au bout de la ligne, l'armée attend, pour exécuter les déportés.

Dans l'un de ces trains, une femme en uniforme se lève, assomme un garde et prend son arme. Elle s'est fait embarquer exprès. C'est la sœur de Serah.


Elle se fait appeler Lightning. Son vrai nom est Claire. Elle a vingt et un ans, elle est sergent dans la garde de Bodhum, et elle ne sourit plus depuis la mort de ses parents : elle avait quinze ans, une petite sœur à élever, et elle a décidé ce jour-là de devenir une adulte, d'un coup, de prendre un nom de soldat et de ne plus jamais montrer de faiblesse. Elle a tant voulu protéger Serah qu'elle a oublié de l'écouter. Elle va la chercher, et elle ne se pardonne pas leur dernière conversation.

Snow est là aussi, avec ceux de sa bande et ceux des déportés qui veulent se battre. Il se prend pour un héros, et il le dit à voix haute. Pendant l'affrontement avec l'armée, une femme se bat à ses côtés, avec un courage incroyable, et meurt en tombant d'une passerelle. Elle a le temps de le supplier de ramener son fils à la maison. Snow ne sait pas de quel fils elle parle.

Le fils s'appelle Hope Estheim. Il a quatorze ans. Il était venu en vacances à Bodhum avec sa mère, Nora, et il a tout vu. Il suit Snow pendant des jours en serrant un couteau, sans oser lui dire qui il est. Il le tient pour responsable. Il veut le tuer.

Il y a Sazh Katzroy, un pilote d'une quarantaine d'années, avec un petit poussin jaune qui niche dans ses cheveux. Il est le seul adulte du groupe, le seul qui plaisante, et il a l'air de s'être trouvé là par hasard. Tu apprendras tard pourquoi il est là, et c'est l'une des histoires les plus dures du jeu.

Et il y a deux femmes qui ne ressemblent pas aux autres. Vanille est une jeune fille gaie, qui sautille, qui parle trop, et qui raconte l'histoire en voix hors champ. Fang est grande, brusque, porte une lance, et la cherche partout. Elles mentent toutes les deux sur ce qu'elles sont.

Ils arrivent ensemble, par des chemins différents, au cœur de la ruine, devant le fal'Cie de Pulse. Serah est là, à bout de forces, dans les bras de Snow. Elle a le temps de dire une phrase à sa sœur : sauver Cocoon. Puis son corps se change en cristal sous leurs yeux. Elle sourit. Elle a donc accompli sa Tâche. Laquelle ? Personne ne le comprend.

Le fal'Cie se réveille, et il les marque tous les cinq, d'un coup, avec Vanille. Ils perdent connaissance, et ils font le même rêve. Une bête colossale, une chose de fin du monde, qui s'attaque au cocon et l'éventre. Ils en savent le nom sans qu'on le leur dise : Ragnarök.

Ils se réveillent au bord d'un lac devenu cristal, le lac Bresha, figé en pleine vague. Ils regardent leurs marques. Et ils comprennent ce qu'ils sont. Aux yeux de tout Cocoon, ils sont des l'Cie de Pulse : les agents de l'enfer. Leur propre monde va les traquer pour les tuer. Les gens qu'ils croisent hurleront en les voyant. Quant à la Tâche, le rêve semble clair, et il est atroce : on leur demande de détruire leur maison, avec les millions de gens qui y vivent.

C'est tout le milieu du jeu : six personnes qui ne se sont pas choisies, enchaînées à la même tâche, et qui ne s'entendent sur rien. Snow veut croire que la phrase de Serah était la vraie Tâche, et qu'il faut sauver le cocon. Lightning lui écrase son poing sur la figure, parce qu'elle le tient pour responsable de tout. Le groupe se sépare en deux.

# Les deux routes

Lightning part seule, vers la capitale, pour abattre le fal'Cie qui gouverne. Elle n'a plus d'autre plan que la colère. Hope, le garçon de quatorze ans, s'accroche à elle, parce qu'elle a l'air de savoir se battre et que lui ne sait rien faire.

C'est une des paires les plus réussies du jeu. Lightning, au début, le traite comme un poids. Puis elle lui apprend à se battre. Elle lui dit d'être dur, de ne compter que sur lui-même, de ne pas pleurer. Elle lui donne, en somme, ce qu'elle s'est donné à elle-même à quinze ans. Et Hope l'écoute. Il se durcit. Il prépare sa vengeance contre Snow.

Un jour, Lightning s'aperçoit, avec horreur, de ce qu'elle est en train de faire. Elle est en train de fabriquer une arme. Elle a donné à un enfant la force de tuer, et elle comprend que c'est exactement ce qu'elle a fait d'elle-même. Elle essaie de revenir en arrière. Elle lui dit qu'elle s'est trompée.

Hope, lui, va jusqu'au bout de sa haine. Ils arrivent dans sa ville natale, Palumpolum, une grande cité moderne, où vit son père, Bartholomew, avec qui il ne s'est jamais entendu. Là, Hope retrouve Snow. Il le confronte. Il veut le tuer. Mais au moment où l'armée les attaque, Snow le protège, au péril de sa vie, en le portant dans ses bras dans une chute. Hope comprend que l'homme qu'il haïssait est celui que sa mère avait choisi pour le sauver.

Dans la maison de son père, sous la menace de l'armée, Hope se réconcilie avec lui. Il découvre un père qu'il n'avait jamais vraiment regardé. Le garçon qui suivait tout le monde devient, peu à peu, celui qui tient le groupe ensemble. À la fin du jeu, c'est lui qui encourage les autres à croire qu'on peut changer une Tâche. Son nom, en anglais, veut dire espoir. Le jeu ne le dit jamais, mais il le lui fait mériter.


L'autre moitié du groupe, Sazh et Vanille, traverse le pays de son côté, en fugitifs.

Ils arrivent à Nautilus, une ville de divertissement, un immense parc d'attractions au bord de la mer, avec des parades, des feux d'artifice et des chocobos dans des enclos. Sazh y avait promis à son fils de l'emmener. C'est là qu'on apprend la vérité sur lui.

Sazh a un fils de six ans, Dajh, qu'il élève seul. Quelques semaines plus tôt, pendant une sortie, l'enfant a été marqué par un fal'Cie de Cocoon, Kujata. L'armée a emmené l'enfant, pour l'étudier. Sazh veut trouver le fal'Cie de Pulse et le détruire, en espérant que ce soit cela, la Tâche de son fils, et qu'il lui sera rendu. À Nautilus, il voit Dajh, de loin, entre les mains des militaires. L'enfant accomplit sa Tâche sous ses yeux : il trouve les l'Cie de Pulse, il les fait capturer. Et il se change en cristal.

Et Sazh apprend autre chose. C'est Vanille, avec Fang, qui a provoqué le réveil du fal'Cie de Bodhum. C'est à cause d'elles que tout a commencé, que Kujata a marqué son fils, que la Purge a eu lieu. Vanille l'avoue. Sazh lève son arme sur elle. Elle ne s'enfuit pas, elle attend. Il ne peut pas tirer. Il retourne l'arme contre lui. Son Eidolon surgit à cet instant. Il survit.

Le secret de Vanille et Fang se défait peu à peu. Elles ne sont pas de Cocoon. Elles sont nées sur Pulse, dans un village nommé Oerba, il y a plus de cinq cents ans. Elles étaient déjà des l'Cie, marquées par un fal'Cie de Pulse. Leur Tâche, à l'époque, était celle-là même : devenir ensemble Ragnarök et abattre le cocon. C'était la guerre de la Transgression.

Fang a essayé. Elle s'est changée en bête, et elle a fendu la coque. Vanille, qui devait s'unir à elle, n'a pas pu. Elle a eu peur, elle a reculé, et la tâche est restée inachevée. Une divinité, peut-être Etro, les a alors changées en cristal toutes les deux. Et leur cristal a été emporté dans le cocon avec le sanctuaire du fal'Cie de Pulse, comme un trophée de guerre.

Elles ont dormi cinq siècles à Bodhum. Elles se sont réveillées il y a quelques jours. Fang a perdu presque tous ses souvenirs, et sa marque est comme brûlée. Vanille se souvient de tout, et elle se tait. Elle sourit, elle plaisante, elle raconte l'histoire. Et elle porte seule le poids de ce qu'elle a déclenché.

Fang, elle, a été recueillie par une unité rebelle de l'armée, la Cavalerie, qui l'a aidée à chercher Vanille. Quand les deux femmes se retrouvent, tout le groupe se retrouve aussi, à bord d'un vaisseau militaire, le Palamecia, où les attend l'homme le plus puissant du cocon.

# Le plan

Il reste à comprendre pourquoi. Et celui qui l'explique est l'homme le plus respecté du cocon : le vieux chef du gouvernement, le Primarque Galenth Dysley, celui qui a ordonné la Purge.

Sur son vaisseau, devant les six réunis, il se révèle. Il n'est pas un homme. Il est le fal'Cie Barthandelus, l'un des plus anciens fal'Cie du cocon, qui règne depuis des siècles sous ce déguisement. Et au lieu de les tuer, il les aide. Il leur ouvre le chemin.

Voici ce qu'il veut. Les fal'Cie ont été abandonnés par leur créateur. Ils veulent le faire revenir, et ils croient savoir comment. Quand un homme meurt, son âme passe par une porte, vers l'invisible. Si des millions d'hommes mouraient au même instant, cette porte s'ouvrirait si grand que le dieu serait forcé de revenir, pour la franchir. Ce serait la fin du monde, et le retour du maître.

Cocoon n'est pas un refuge. C'est un élevage. Les fal'Cie y ont rassemblé les hommes, les ont nourris, protégés, multipliés pendant des siècles, comme on engraisse un troupeau, en vue d'un seul jour : celui où tous mourraient ensemble.

Mais ils ne peuvent pas tuer eux-mêmes. Leur fonction est d'entretenir le cocon, il leur est impossible d'agir contre elle. Ils ont besoin que quelqu'un d'autre le fasse à leur place : des l'Cie de l'autre camp, des ennemis, dont la Tâche serait justement la destruction. Voilà pourquoi ils ont gardé un fal'Cie de Pulse endormi sous une ville pendant des siècles. Voilà pourquoi la Purge a eu lieu : elle a forcé le fal'Cie de Pulse à se réveiller et à marquer des l'Cie. Il fallait fabriquer des héros désespérés, les jeter sur les routes, les rendre forts, et les amener, à force de colère, jusqu'au cœur de la machine pour qu'ils la brisent.

Car au cœur de la capitale, Eden, dort le fal'Cie qui alimente tout le cocon : Orphan. Si Orphan meurt, Cocoon n'a plus d'énergie. Il tombe. Et tout le monde meurt. C'est Orphan que Barthandelus veut leur faire abattre. C'est cela, la vraie Tâche.

Mesure le piège, car il est parfait. Si les six accomplissent leur Tâche, ils tuent tout le monde, et c'est exactement ce que veut leur ennemi. S'ils refusent, ils deviennent des Cie'th. S'ils tuent Barthandelus, ils ne règlent rien. Chaque acte de révolte les rapproche du but. Leur haine même est utile.

Il y a dans le jeu un personnage qui incarne cette tragédie : Cid Raines, le commandant de la Cavalerie, l'unité rebelle qui a aidé Fang. Cid est un homme droit, calme, qui veut libérer le cocon de l'emprise des fal'Cie. Il aide le groupe en secret. Et il est lui-même un l'Cie de Cocoon, marqué par Barthandelus. Il comprend trop tard que sa révolte a servi, elle aussi, le plan des fal'Cie. Quand il essaie de s'en libérer, il se dresse contre le groupe pour l'éprouver, et il est vaincu. Sa fin est l'une des plus tristes du jeu : même après sa chute, les fal'Cie se serviront encore de lui.

Tu reconnais maintenant le couloir. Pendant vingt heures, le jeu ne t'a laissé qu'un chemin, et tu t'en es plaint. C'était celui que le fal'Cie avait tracé pour eux.

# La descente et le retour

Ils fuient le cocon. Ils descendent sur Pulse, ce monde qu'on leur a appris à craindre depuis l'enfance. Et c'est là, après tout ce temps, que le jeu s'ouvre.

@art 2 | La descente et le retour.

Une plaine sans bord, la steppe d'Archylte. De l'herbe à perte de vue, du vent, des troupeaux de bêtes géantes, des monstres qu'on peut chasser pendant des heures, des montagnes au loin, le ciel immense. Et tout en haut, la sphère d'où ils viennent, petite comme une lune. Le monde qu'on leur avait décrit comme l'enfer est d'une beauté qui coupe le souffle. La musique de Hamauzu se déploie. Le joueur, qui avait avancé vingt heures dans des couloirs, peut enfin marcher où il veut.

Ils le traversent pour chercher un moyen d'ôter leurs marques. Ils passent par des grottes de glace, des forêts suspendues, des ruines anciennes. Sur Pulse, on peut accepter les Tâches des Cie'th figés dans la pierre : ces anciens l'Cie qui n'ont jamais pu finir leur mission, et dont les stèles demandent, à qui passe, de tuer à leur place telle ou telle bête. Le monde d'en bas est plein de destins inachevés.

Ils arrivent à Oerba, le village de Vanille et de Fang. Il n'y a plus personne depuis des siècles. Les maisons sont couvertes d'une poussière de cristal qui tombe comme de la neige. Un vieux robot attend encore que quelqu'un rentre. Tout le monde, ici, est devenu Cie'th ou s'est éteint. Vanille et Fang marchent dans leur maison d'enfance vide. Le monde d'en bas n'était pas l'ennemi. C'était un autre abandonné.

À Oerba, ils retrouvent Barthandelus. Il les pousse une dernière fois. Il leur rappelle qu'il n'y a pas de remède, et que la seule chose qui leur reste est de devenir Ragnarök ou de mourir. Il menace de détruire le cocon par d'autres moyens s'ils ne le font pas.

Ils ne trouvent rien. Il n'y a pas de remède. Alors ils font la seule chose qui leur reste, et le jeu la dit simplement : ils décident. Ils n'accompliront pas la Tâche, ils ne se laisseront pas changer, ils retourneront au cocon et ils sauveront les gens, sans savoir comment, contre toute logique, parce que c'est ce qu'ils veulent et que personne ne le leur a ordonné.


Ils remontent. Le cocon est en chaos : Barthandelus a lâché sur la capitale des monstres de Pulse, pour provoquer la panique et la mort. Les gens fuient, les soldats tombent. Le groupe traverse Eden, la capitale, au milieu de l'apocalypse.

Ils affrontent Barthandelus une dernière fois, et le battent. Mais derrière lui, il y a Orphan, le fal'Cie qui alimente le cocon. Il a deux visages, un homme et une femme, et il désire sa propre mort depuis toujours : sa fonction est de faire vivre le cocon, et il veut, comme les autres, que son créateur revienne. Il les supplie, à sa manière, de le tuer.

Les six le combattent. Au moment où il tombe, il gagne. Le cocon n'a plus rien pour le porter. Il se met à tomber vers Pulse, avec ses millions d'habitants.

Alors Vanille et Fang se regardent. Elles font ce qu'elles n'avaient pas fait cinq siècles plus tôt : elles s'unissent, de leur plein gré, et deviennent Ragnarök. Mais la bête ne frappe pas le cocon. Elle plonge sous lui, dans la lave du monde d'en bas, et la soulève. Une colonne de cristal jaillit du sol, immense, et saisit la sphère dans sa chute comme une main. Le cocon s'arrête, suspendu au sommet d'un pilier de verre.

Elles ont accompli leur Tâche. Ragnarök est venu, comme dans le rêve. Elles ont seulement choisi ce qu'il ferait.

Les quatre autres se réveillent au pied du pilier. Ils avaient été changés en cristal, eux aussi, et quelque chose les en a tirés. Leurs marques ont disparu. Serah vient vers eux en courant, vivante, libérée de son cristal. Le petit Dajh court vers Sazh. Snow serre Serah dans ses bras, et Lightning, pour la première fois, accepte qu'ils se marient. Les habitants du cocon descendent, pour la première fois, sur la terre qu'on leur avait appris à craindre.

Vanille et Fang restent dans le pilier, endormies, les mains jointes. Elles tiennent le monde.

# Après : la déesse et le dernier jour

Final Fantasy XIII a eu deux suites, qui font une trilogie. Elles divisent encore plus que le premier, mais elles complètent sa mythologie, et il faut les connaître.

Dans **Final Fantasy XIII-2**, en 2011, trois ans ont passé. Les habitants de Cocoon vivent maintenant sur Pulse. Mais Lightning a disparu. Tout le monde croit qu'elle est restée dans le cristal avec Vanille et Fang. Seule Serah se souvient qu'elle était là, au pied du pilier. En vérité, Lightning a été emportée à Valhalla, le monde hors du temps où vit Etro, et elle est devenue la gardienne de la déesse.

Un jeune homme venu du futur, Noel, apparaît à Serah. Ils voyagent ensemble à travers le temps pour réparer des paradoxes, ces anomalies qui défont l'histoire. Face à eux, un homme, Caius, et une petite fille, Yeul. Yeul est une voyante qui voit l'avenir, et chaque vision raccourcit sa vie. Elle meurt jeune, puis renaît, encore et encore, depuis des siècles. Caius, son gardien immortel, l'a vue mourir des dizaines de fois. Il veut tuer Etro, pour briser le cycle du temps et libérer Yeul.

Le jeu se termine mal. Serah, qui a elle aussi le don de voir l'avenir, meurt d'une dernière vision. Etro meurt. Et le chaos, cette matière de l'invisible que la déesse retenait, déborde dans le monde. Le temps s'arrête. Lightning, à Valhalla, se change en cristal pour se préserver.

Dans **Lightning Returns**, en 2013, cinq siècles ont passé dans ce monde envahi par le chaos. Plus personne ne vieillit, plus aucun enfant ne naît. Le monde va finir dans treize jours. Bhunivelze, le dieu qui dormait depuis le début, s'est réveillé. Il a fait de Lightning sa Sauveuse : il lui donne treize jours pour sauver le plus d'âmes possible, avant de les emporter dans un monde nouveau qu'il veut créer. Elle accepte, parce qu'il lui promet de lui rendre Serah.

Lightning parcourt le monde mourant, retrouve ses anciens compagnons, les aide à se libérer de ce qui les retient. Snow, devenu gouverneur d'une ville de plaisirs, attend la mort. Sazh veille sur son fils plongé dans le sommeil. Fang et Vanille, sorties du pilier, préparent un rituel. Hope, redevenu enfant, l'accompagne, possédé en secret par Bhunivelze.

À la fin, Lightning comprend ce que veut le dieu : un monde nouveau, sans âmes libres, où il régnera seul. Elle le refuse. Avec ses compagnons, et avec toutes les âmes des morts qui la soutiennent, elle combat Bhunivelze et le renvoie. Puis tous partent vers un monde nouveau, sans dieux.

Dans la toute dernière scène, une jeune femme aux cheveux roses descend d'un train, dans une campagne qui ressemble à notre monde. Elle va retrouver ses amis. Le cycle des dieux est fini. Les humains sont seuls, et libres.

# Ce que cela veut dire

Le premier jeu répond à une question qu'il a mis quarante heures à poser : que peut-on faire quand toutes les issues ont été fermées par plus fort que soi ?

@art 3 | Ce que cela veut dire.

Sa réponse n'est pas qu'on peut s'évader du destin. Personne ne s'évade : la Tâche s'accomplit, Ragnarök se lève, le cocon tombe. La prophétie est exacte jusqu'au dernier mot. Mais ceux qui l'accomplissent en changent le sens. Serah avait dit de sauver Cocoon, et tout le monde avait cru qu'elle se trompait de Tâche. Elle avait simplement compris la première que la même image pouvait se lire de deux façons.

C'est une idée très ancienne et très juste. On ne choisit presque jamais ce qui nous arrive. On choisit qui l'on est pendant que cela arrive. Les fal'Cie, qui peuvent tout, ne peuvent pas cela : ils n'ont qu'une fonction. Les hommes, qui ne peuvent rien, ont cette marge. Le jeu appelle cela un miracle, et laisse entendre qu'Etro, la déesse oubliée, y a aidé. On peut y voir aussi ce qu'on voit souvent dans la vie : des gens qui n'avaient plus aucune raison d'espérer et qui ont agi comme s'ils en avaient une.

Et remarque qui sauve le monde. Pas la guerrière. Pas le héros qui annonçait depuis le début qu'il le ferait. Ce sont les deux menteuses, celles par qui tout le malheur est arrivé, dont l'une avait manqué de courage cinq cents ans plus tôt. Le jeu leur donne une seconde fois le même instant, et cette fois Vanille ne recule pas.

Toute la trilogie, ensuite, pousse cette idée jusqu'au bout. Le premier jeu libère les hommes des fal'Cie. Le deuxième fait mourir la déesse qui gardait les morts. Le troisième renvoie le dieu suprême. À chaque étape, une couche de divin tombe. À la fin, il ne reste que des humains, et un monde qui ressemble au nôtre. C'est une mythologie qui raconte, en trois jeux, comment l'humanité se défait de ses dieux.

!! CE QUE LA TRILOGIE DIT :: Les fal'Cie veulent faire revenir leur créateur. Les hommes, eux, apprennent à vivre sans le leur. Toute l'histoire est celle d'un monde qui passe de la servitude à la liberté, non pas en échappant à son destin, mais en choisissant ce qu'il en fait.

# Ce que tu peux en prendre

Trois choses, pour toi qui construis des mondes.

La première est une mise en garde. Ce jeu a une mythologie superbe, et il l'a rangée dans un menu. Les mots fal'Cie, l'Cie, Cie'th, Tâche pleuvent dès la première heure sans qu'on te les donne. Beaucoup de joueurs ont décroché avant de comprendre qu'il y avait quelque chose à comprendre. Retiens-le pour tes propres univers : une idée qui n'est pas dans la scène n'existe pas pour celui qui regarde. Ce que tu sais de ton monde ne compte que si un personnage le vit devant nous. Les plus belles idées de Final Fantasy XIII, les Eidolons envoyés par pitié, les Cie'th qui attendent qu'on finisse leur Tâche, le dieu qui a rejeté sa propre fille, sont des idées que la plupart des joueurs n'ont jamais vues.

La deuxième est le piège bien construit. Le plan de Barthandelus fait de chaque révolte un service. Un antagoniste qui a besoin que le héros gagne est plus terrible que celui qui veut l'arrêter, parce que la victoire elle-même devient suspecte. Tu peux t'en servir à toute échelle : demande-toi à qui profite ce que ton personnage croit faire contre lui. Et la sortie du piège, quand elle vient, ne doit pas être une astuce, mais un changement de sens : les héros font exactement ce qu'on attendait d'eux, et le font pour une autre raison.

La troisième est le groupe. Ces six-là ne sont pas des amis. Ils se haïssent, se mentent, se servent les uns des autres : une sœur qui n'a pas cru sa sœur, un garçon qui veut tuer l'homme qui le protège, un père qui lève son arme sur une jeune fille. Le jeu les fait changer par paires, deux par deux, sur la route : Lightning et Hope, Sazh et Vanille, Snow et Hope, Fang et Vanille. Une équipe n'est intéressante que si chacun y a une dette envers un autre, et si le voyage est le temps qu'il faut pour la régler.

Le thème musical du jeu s'appelle la Promesse. C'est celle de Serah à sa sœur, celle de Snow à une mourante, celle de Fang à Vanille. Personne, dans cette histoire, n'est libre de ce qui lui arrive. Tous sont libres de ce qu'ils ont promis.
`,
};
export default book;
