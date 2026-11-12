const book = {
  id: "bushido", title: "Bushidō", sub: "La voie de celui qui sert", room: "japon", type: "pensee", cote: "JA-001", color: 355, emblem: "武",
  about: "Le livre de Nitobe relu vertu par vertu, avec ses histoires, ses sources, ce qu'il a inventé et ce qu'on en a fait. Un livre long, pour un sujet qui ne se résume pas.",
  voice: "NÉRODUS TE PARLE. IL SUIT LE LIVRE D'INAZŌ NITOBE (1900), LIBRE DE DROITS ; LES CITATIONS SONT TRADUITES DE L'ANGLAIS ORIGINAL.",
  links: [
    { label: "Inazō Nitobe, Bushido: The Soul of Japan (1900)", url: "https://www.gutenberg.org/ebooks/12096", note: "Le texte original, en anglais, libre de droits. Tu l'as lu en français : relis un chapitre dans sa langue d'écriture." },
    { label: "Yamamoto Tsunetomo, Hagakure", note: "L'autre versant : la voie comme préparation à mourir. Fragments dictés entre 1709 et 1716." },
    { label: "Miyamoto Musashi, Le Livre des cinq anneaux (1645)", note: "Pas de morale : une technique, écrite par un homme qui n'a jamais perdu un duel." },
    { label: "A. B. Mitford, Tales of Old Japan (1871)", url: "https://www.gutenberg.org/ebooks/13015", note: "Contient le récit des 47 rōnin et le témoignage du seppuku de 1868 que cite Nitobe." },
    { label: "Basil Hall Chamberlain, The Invention of a New Religion (1912)", url: "https://www.gutenberg.org/ebooks/2510", note: "La critique la plus dure, par un contemporain qui vivait au Japon. À lire après." },
    { label: "Harakiri de Masaki Kobayashi (1962)", note: "Le film qui retourne le code contre ceux qui s'en réclament." },
    { label: "Les Sept Samouraïs d'Akira Kurosawa (1954)", note: "Des guerriers sans maître, et ce qu'il reste de la voie quand il n'y a plus rien à gagner." },
  ],
  text: String.raw`
# Une question posée en Belgique

Tu as lu ce livre. Tu sais donc qu'il commence par une promenade.

Vers 1889, un jeune Japonais séjourne chez un juriste belge réputé, Émile de Laveleye. Ils marchent, et la conversation vient sur la religion. Le professeur demande : voulez-vous dire que vous n'avez pas d'instruction religieuse dans vos écoles ? Le Japonais répond que non. Le Belge s'arrête net, stupéfait, et répète d'une voix que l'autre n'oubliera pas : pas de religion ! Mais comment donnez-vous une éducation morale ?

Le jeune homme ne sait pas quoi répondre. Il réfléchit. Les notions du bien et du mal qu'il a reçues, enfant, ne lui ont pas été enseignées dans une école. Elles lui ont été soufflées par quelque chose d'autre, qu'il n'avait jamais eu à nommer.

Il lui faudra dix ans pour trouver la réponse, et elle tiendra en un livre. L'homme s'appelle Inazō Nitobe. Le livre s'appelle *Bushido, l'âme du Japon*. Il paraît à Philadelphie en 1900, en anglais.

Je vais le reprendre avec toi, lentement, sans rien sauter. Mais je vais faire trois choses que Nitobe ne fait pas. Je vais te dire qui il était, parce que cela change la lecture. Je vais te raconter les histoires qu'il ne fait qu'effleurer. Et je te dirai, à la fin, ce que les historiens pensent de son livre, et ce que d'autres en ont fait. Tu verras qu'une chose peut être à moitié inventée et rester une vraie voie.

# Qui écrit

Nitobe naît en 1862 à Morioka, dans le nord du Japon, dans une famille de samouraïs au service du clan Nanbu. Il a cinq ans quand le shogunat s'effondre et que l'empereur Meiji reprend le pouvoir. On lui a ceint, à cet âge, son premier sabre, selon la coutume. Quelques années plus tard, les samouraïs sont abolis : plus de fiefs, plus de privilèges, interdiction de porter les deux sabres dans la rue.

Retiens cela. Nitobe n'a jamais été un guerrier. Il est l'enfant d'un monde qui vient de finir, élevé par des gens qui en gardaient les manières.

Ce monde, il le quitte très tôt. Il étudie à l'école d'agriculture de Sapporo, fondée par des Américains, où tout s'enseigne en anglais. Il s'y convertit au christianisme. Quand il se présente à l'université de Tokyo et qu'on lui demande ce qu'il veut faire, il répond qu'il souhaite être un pont sur le Pacifique. Il part pour l'Amérique, puis pour l'Allemagne, obtient un doctorat, devient quaker, et épouse à Philadelphie une Américaine, Mary Elkinton.

C'est elle qui déclenche le livre. Elle lui demande sans cesse : pourquoi fait-on ceci au Japon ? Pourquoi pense-t-on cela ? En 1899, malade, il se repose en Californie, à Monterey, et il se décide à répondre. Il écrit pour sa femme, pour le professeur belge, pour tous les Occidentaux qui regardent son pays comme une curiosité.

Voilà le premier secret du livre. Ce n'est pas un texte ancien. Ce n'est pas un manuel de samouraï. C'est une explication donnée à des étrangers par un Japonais chrétien, dans leur langue, avec leurs références. À chaque page, il compare : la chevalerie d'Europe, les Grecs, la Bible, Shakespeare. Il ne dit pas : nous sommes différents. Il dit : vous avez eu la même chose, sous un autre nom.

Le livre a un succès immense. Le président des États-Unis, Theodore Roosevelt, en achète des dizaines d'exemplaires pour ses amis. Cinq ans plus tard, quand le Japon bat la Russie, le monde entier veut comprendre ce petit pays, et il n'y a qu'un livre à ouvrir. Les Japonais eux-mêmes ne le liront en japonais qu'en 1908.

# La fleur et le sol

Nitobe ouvre par une image : la chevalerie est une fleur aussi indigène au sol du Japon que son emblème, la fleur de cerisier. Ce n'est pas, dit-il, un spécimen séché dans un herbier. Elle vit encore.

Le mot se décompose en trois signes. *Bu*, la guerre. *Shi*, l'homme de qualité, le gentilhomme. *Dō*, la voie. Bushidō : la voie du guerrier gentilhomme. Nitobe précise aussitôt ce que c'est, et ce que ce n'est pas. Ce n'est pas un code écrit. Aucun texte ne le contient. C'est, dit-il, un code non formulé, gravé sur les tablettes du cœur, fait de quelques maximes passées de bouche en bouche ou sorties de la plume d'un guerrier célèbre. Il a poussé pendant des siècles de vie militaire, comme la constitution anglaise, sans que personne l'ait rédigé.

D'où vient-il ? Nitobe lui donne trois racines, et c'est son deuxième chapitre.

Du bouddhisme, et surtout du zen, la voie tient une confiance tranquille dans le destin, une soumission calme à l'inévitable, le sang-froid devant le danger, un certain dédain de la vie et une familiarité avec la mort. Un grand maître de sabre, quand son élève avait tout appris de la technique, lui disait : au-delà, mon enseignement doit céder la place à celui du zen.

Du shintō, la vieille religion du pays, elle tient la fidélité au souverain, le respect des ancêtres et la piété envers les parents. Nitobe s'arrête sur un détail : dans un sanctuaire shintō, il n'y a pas d'idole. Il y a un miroir. Tu viens prier, et c'est toi que tu vois. Connais-toi toi-même.

De Confucius, enfin, et de son disciple Mencius, elle tient sa morale proprement dite : les cinq relations qui ordonnent la société, entre le maître et le serviteur, le père et le fils, le mari et la femme, l'aîné et le cadet, l'ami et l'ami. Mais les samouraïs se méfiaient des lettrés. Ils appelaient celui qui ne fait que savoir un rat de bibliothèque qui sent l'encre. Leur philosophe préféré était un Chinois plus tardif, Wang Yangming, qui enseignait que savoir et agir ne font qu'un. Connaître le bien et ne pas le faire, c'est ne pas le connaître.

!! À RETENIR :: Trois sources : le zen pour le calme devant la mort, le shintō pour la fidélité, Confucius pour la morale. Et une règle au-dessus : ce qu'on sait ne vaut que par ce qu'on fait.

# Gi, la rectitude

Voici la première vertu, et Nitobe la place en tête parce que toutes les autres en dépendent. *Gi* : la rectitude, la justice. Rien n'est plus répugnant au samouraï que les manœuvres souterraines et les actes tortueux.

Il cite la définition d'un guerrier célèbre : la rectitude est le pouvoir de décider d'une conduite selon la raison, sans vaciller. Mourir quand il est juste de mourir, frapper quand il est juste de frapper. Et celle d'un autre, que je trouve plus belle :

> La rectitude est l'os qui donne fermeté et stature. Sans os, la tête ne peut tenir au sommet de l'épine dorsale, ni les mains bouger, ni les pieds se tenir debout. | Cité par Nitobe, Bushido, chap. III

Remarque l'image. Ce n'est pas une règle qu'on applique de l'extérieur, c'est un squelette. Un homme peut avoir du talent, de la culture, du charme : sans cela, il s'affaisse.

De *gi* vient un mot que tu entendras souvent au Japon : *giri*. À l'origine, c'est la juste raison, le devoir pur et simple : ce qu'on doit à ses parents, à son seigneur, à la société. Nitobe note honnêtement qu'il a dégénéré. Avec le temps, *giri* est devenu une vague peur de la désapprobation, une obligation sociale qu'on invoque pour excuser n'importe quoi. C'est la première leçon du livre, et elle revient à chaque chapitre : toute vertu a une contrefaçon, et elle lui ressemble.

# Yū, le courage

La deuxième vertu ne vaut que par la première. Le courage, dit Nitobe, méritait à peine d'être compté parmi les vertus s'il n'était exercé pour une cause juste. Il cite Confucius, qui le définit par son contraire : voir ce qui est juste et ne pas le faire, c'est manquer de courage.

Tout le chapitre sert à séparer le vrai courage de sa caricature. Courir au danger et s'y faire tuer est à la portée du premier venu. Les samouraïs avaient un mot pour une mort inutile : une mort de chien. Un prince de Mito a dit la chose une fois pour toutes :

> Il est d'un vrai courage de vivre quand il est juste de vivre, et de mourir seulement quand il est juste de mourir. | Cité par Nitobe, Bushido, chap. IV

Comment formait-on des enfants à cela ? Nitobe le raconte, et ce n'est pas tendre. On les privait de nourriture, on les exposait au froid. On les envoyait porter des messages à des inconnus, on les faisait lever avant le soleil pour lire pieds nus en plein hiver. On les menait la nuit sur les lieux d'exécution, et parfois on leur demandait d'y retourner seuls pour laisser une marque sur une tête coupée. Une mère grondait son fils qui pleurait d'une douleur : que feras-tu quand ton bras sera tranché à la bataille ? Que feras-tu quand on t'ordonnera de t'ouvrir le ventre ?

Mais écoute la suite, car c'est ce qui rend ce courage japonais. Sa forme la plus haute n'est pas la fureur : c'est le calme. Un homme vraiment brave est toujours serein. Rien ne trouble son esprit. Au cœur de la bataille, il reste froid ; dans la catastrophe, il garde la tête égale. Les tremblements de terre ne le secouent pas, dit Nitobe, et il rit des tempêtes.

Il en donne des preuves étonnantes : des guerriers qui composent des vers au moment de mourir. Le seigneur Ōta Dōkan, percé d'une lance par un assassin qui connaissait son goût pour la poésie, s'entend réciter le début d'un poème, et, mourant, trouve la force d'en composer la fin. C'est le signe d'une âme qui a de la place en trop.

# Jin, la bienveillance

Si tu t'arrêtais aux deux premières vertus, tu aurais un soldat. La troisième en fait autre chose. *Jin* : la bienveillance, l'amour, la pitié pour autrui. Nitobe l'appelle la vertu des princes, la plus haute de toutes les qualités de l'âme humaine.

Il y a une expression pour cela : *bushi no nasake*, la tendresse du guerrier. Nitobe insiste sur le mot guerrier. La pitié d'un faible ne coûte rien. Celle d'un homme qui a le pouvoir de tuer est la seule qui compte, parce qu'elle est adossée à la force de l'exercer ou non. Les samouraïs avaient un proverbe : il ne sied pas au chasseur de tuer l'oiseau qui se réfugie dans son sein.

Un grand seigneur du nord, Date Masamune, a laissé une maxime qui corrige les deux premières vertus par la troisième : la rectitude poussée à l'excès se durcit en raideur ; la bienveillance, au-delà de la mesure, s'affaisse en faiblesse.

Et il y a l'histoire, que tout Japonais connaît. Je te la raconte en entier, parce que Nitobe la donne en quelques lignes et qu'elle mérite mieux.

Nous sommes en 1184, sur la plage de Suma. La bataille est finie ; le clan Taira fuit vers ses navires. Un guerrier du clan vainqueur, Kumagai Naozane, un vétéran, aperçoit un cavalier qui entre dans l'eau, en riche armure. Il le rappelle, le défie, le jette à bas de son cheval. Il arrache le casque pour trancher la tête, et il découvre un visage d'enfant, poudré, les dents noircies à la mode de la cour. Seize ans à peine. L'âge de son propre fils, blessé le matin même.

La main du vieux soldat s'arrête. Il demande son nom au garçon, qui refuse : prends ma tête et montre-la, on me reconnaîtra. Kumagai veut le laisser fuir. Mais il entend derrière lui le galop de ses compagnons. S'il l'épargne, d'autres le prendront, sans égards. Il lui dit : si je dois te voir mourir, que ce soit de ma main, et je prierai pour toi. Il frappe, en pleurant.

En dépouillant le corps, il trouve une flûte dans un étui de brocart. Le matin, à l'aube, on avait entendu de la musique monter du camp ennemi. C'était lui. Le garçon s'appelait Atsumori.

Kumagai rentre. On lui offre la gloire. Il renonce aux armes, se rase la tête, et finit sa vie en moine, le dos tourné au soleil couchant, vers le paradis où il priait de le retrouver.

@img https://commons.wikimedia.org/wiki/Special:FilePath/Kumagai_Naozane_and_Taira_no_Atsumori.jpg?width=1100 | Kumagai Naozane rappelle Atsumori sur la plage de Suma. Estampe japonaise. | Wikimedia Commons, domaine public

Voilà ce que *jin* veut dire. Pas la douceur d'un homme incapable de frapper. Celle d'un homme qui a frappé, et qui ne s'en remet pas.

Nitobe ajoute que c'est pour cela qu'on apprenait aux guerriers la musique et les vers. Non pour les rendre aimables : pour qu'ils gardent quelque chose à quoi la souffrance des autres puisse s'accrocher.

# Rei, la politesse

Les voyageurs étrangers remarquaient tous la politesse japonaise, et la trouvaient excessive. Nitobe leur répond.

Si la politesse n'est que la crainte d'offenser le bon goût, c'est une pauvre vertu. La vraie est la manifestation extérieure d'un égard pour les sentiments d'autrui. Elle suppose aussi le respect de l'ordre des choses, de la place de chacun. Et dans sa forme la plus haute, dit-il, elle touche à l'amour. Il recopie alors, presque mot pour mot, ce que saint Paul écrit de la charité : elle est patiente, elle est bonne, elle n'envie pas, elle ne s'enfle pas d'orgueil, elle ne cherche pas son intérêt.

Pourquoi tant de règles ? Pourquoi une manière exacte de s'incliner, de marcher, de s'asseoir, de servir ? Parce que, dit Nitobe, il existe toujours une façon de faire qui est la meilleure, et que la meilleure est à la fois la plus économe et la plus gracieuse. Il prend l'exemple de la cérémonie du thé. Chaque geste est fixé : comment tenir la louche, la serviette, le bol. Au débutant, c'est fastidieux. Mais il découvre vite que la manière prescrite est celle qui épargne le plus de temps et d'effort : l'usage le plus économique de la force.

Et le corps, à force de justesse, agit sur l'esprit. Un maître de l'étiquette disait que la fin de toute étiquette est de cultiver l'esprit de telle sorte que, même quand tu es tranquillement assis, le plus grossier des brigands n'ose pas s'en prendre à toi.

Je te laisse méditer la phrase, toi qui diriges des gens sur un plateau. L'autorité n'est pas dans la voix qui monte. Elle est dans une tenue.

Nitobe termine par des exemples qui déroutent les Occidentaux. Tu marches sous le soleil, sans ombrelle ; un ami japonais te rencontre, ôte son chapeau, et ferme aussi la sienne pour te parler. Absurde ? Il ne peut pas t'abriter ; alors il partage ton inconfort. Ou bien il t'offre un cadeau en disant qu'il est sans valeur. Un Américain dirait : c'est un bel objet, je ne t'offrirais pas autre chose. Le Japonais dit : tu es quelqu'un de bien, aucun objet n'est digne de toi. L'un parle de la chose, l'autre de l'esprit qui la donne.

# Makoto, la sincérité

Sans véracité, la politesse est une farce. C'est encore Masamune qui le dit : la politesse poussée au-delà de la juste mesure devient mensonge.

*Makoto* : la sincérité, la vérité. Le signe chinois qui l'écrit réunit deux éléments, la parole et l'accomplissement. Une parole accomplie. Les sages chinois lui prêtaient une puissance presque divine : la sincérité est la fin et le commencement de toutes choses ; sans elle, il n'y aurait rien.

De là vient une expression : *bushi no ichigon*, la parole d'un guerrier. Elle suffisait. Un samouraï ne signait pas d'engagement : écrire une promesse aurait été avouer qu'on pouvait ne pas la tenir. Sa parole avait un tel poids qu'on l'acceptait sans preuve. Et il y avait un mot terrible, *nigon*, la double langue : on a vu des hommes payer cela de leur vie.

Nitobe fait ici un détour par l'argent, et c'est l'un de ses passages les plus honnêtes. De tous les métiers, dit-il, aucun n'était plus éloigné du guerrier que le commerce. Le marchand occupait le dernier rang de la société, après le paysan et l'artisan. Le samouraï tirait son revenu de la terre ; compter lui était une honte, et l'on élevait les enfants à ignorer la valeur des pièces. Un proverbe disait que les hommes ne doivent pas tant ménager l'argent : c'est par les richesses que la sagesse est entravée.

Le résultat fut double. Les guerriers restèrent longtemps à l'abri de la corruption. Mais le commerce, abandonné à ceux que l'opinion méprisait, se moqua de l'honnêteté. Quand le Japon s'ouvrit, les marchands étrangers se plaignirent amèrement de la mauvaise foi de leurs partenaires. Nitobe ne le cache pas. Il en tire une idée : une vertu qu'on réserve à une caste se dessèche partout ailleurs.

# Meiyo, l'honneur

Nous arrivons au centre. *Meiyo* : l'honneur, c'est-à-dire la conscience vive de sa dignité et de sa valeur personnelles.

Dès l'enfance, on le cultivait par la honte. On ne disait pas à un petit garçon : c'est mal. On lui disait : on rira de toi. Cela te déshonorera. N'as-tu pas honte ? Nitobe y voit l'indice le plus ancien de la conscience morale. Et il cite cette sentence d'un samouraï :

> Le déshonneur est comme une cicatrice sur un arbre : le temps, au lieu de l'effacer, ne fait que l'agrandir. | Cité par Nitobe, Bushido, chap. VIII

Tu vois le danger. Un honneur si chatouilleux tourne vite à la susceptibilité. Nitobe rapporte l'histoire d'un bourgeois qui signale poliment à un samouraï qu'une puce saute sur son dos. Le samouraï le coupe en deux : les puces sont des parasites d'animaux, et comparer un guerrier à une bête est une insulte. Nitobe dit qu'il ne croit pas trop à ces anecdotes. Mais qu'on les ait racontées prouve trois choses : qu'on voulait faire peur au peuple, qu'il y avait de vrais abus, et qu'un sens très fort de la honte existait bien.

Le contrepoids, c'est la patience. S'offenser d'une provocation légère était ridiculisé comme un tempérament court. Un proverbe disait : supporter ce que tu crois ne pas pouvoir supporter, voilà supporter vraiment. Et le grand Tokugawa Ieyasu, qui unifia le pays, a laissé à ses descendants quelques maximes : la vie de l'homme est comme un long voyage avec un lourd fardeau ; ne te hâte pas. Ne reproche rien aux autres ; surveille tes propres manquements. La patience est le fondement de la longue durée.

Il existe au Japon un petit apologue qui met en scène les trois hommes qui ont fait l'unité du pays, devant un coucou qui refuse de chanter. Oda Nobunaga dit : je le tuerai s'il ne chante pas. Toyotomi Hideyoshi : je le ferai chanter. Tokugawa Ieyasu : j'attendrai qu'il ouvre le bec. Le premier a été assassiné, le deuxième a perdu son héritage ; c'est la famille du troisième qui a régné deux cent soixante ans.

La maîtrise la plus haute appartient à ceux qui ne s'offensent plus du tout. Saigō Takamori, le dernier grand samouraï, disait qu'il ne fallait pas prendre les hommes pour partenaires, mais le Ciel : le Ciel nous aime tous d'un même amour, aime donc les autres de l'amour dont tu t'aimes toi-même.

# Chūgi, la loyauté

La septième vertu est celle qui nous est la plus étrangère, et Nitobe le sait. *Chūgi* : la loyauté envers le seigneur. Les autres vertus, dit-il, la morale féodale les partage avec d'autres systèmes. Celle-ci, cet hommage et cette fidélité à un supérieur, est son trait propre.

En Chine, Confucius mettait au sommet le devoir du fils envers le père. Au Japon, la loyauté passa devant. Et Nitobe choisit, pour le montrer, l'histoire la plus dure. Elle vient d'une pièce de théâtre célèbre, tirée de la vie d'un ministre du IXe siècle, Sugawara no Michizane.

Michizane est tombé en disgrâce, exilé par ses ennemis, qui veulent maintenant exterminer sa famille. Son jeune fils est caché dans une école de village tenue par un ancien vassal, Genzō. On le découvre. Ordre est donné à Genzō de livrer la tête de l'enfant à une date fixée.

Genzō cherche un substitut. Il parcourt des yeux ses petits élèves : des fils de paysans, aucun qui puisse passer pour l'enfant d'un noble. Ce jour-là, une mère d'allure distinguée amène un nouveau, un garçon du même âge, aux manières fines. Genzō regarde l'enfant. Il a trouvé.

L'officier chargé de reconnaître la tête arrive : il se nomme Matsuō. Genzō, la main sur la garde de son sabre, prêt à tuer si la ruse échoue, lui présente le coffret. Matsuō soulève le couvercle, regarde longuement, et déclare d'une voix calme : c'est bien lui.

Le soir, dans une maison isolée, la mère attend. Son mari rentre. C'est Matsuō. Il lui dit : réjouis-toi, femme, notre fils chéri a rendu service à notre seigneur. Car la famille de Matsuō avait jadis reçu les bienfaits de Michizane ; forcé par les circonstances de servir ses ennemis, il n'avait trouvé qu'un moyen d'acquitter sa dette. C'est lui qui avait envoyé son propre enfant à l'école, sachant ce qui arriverait. Et l'enfant le savait aussi.

Quelle histoire atroce, dit Nitobe à la place de son lecteur. Des parents qui sacrifient délibérément leur fils ! Il répond que l'enfant fut une victime volontaire, et il rappelle une autre histoire, que son lecteur chrétien connaît : Abraham conduisant Isaac sur la montagne.

Tu n'es pas obligé d'être convaincu. Mais lis la nuance qu'il ajoute, car elle sauve le chapitre. La loyauté n'est pas la servilité. La voie n'exigeait pas qu'on fît de sa conscience l'esclave d'un seigneur. Celui qui sacrifiait sa conscience au caprice de son maître était méprisé : on l'appelait courtisan, flatteur. Quand le seigneur se trompait, le devoir du vassal était de tout faire pour le lui montrer. Et s'il n'était pas entendu, il lui restait un dernier argument : prouver la sincérité de ses paroles en versant son propre sang.

# Former un homme

Comment fabriquait-on de tels caractères ? Les chapitres suivants répondent, et ils disent autant par ce qui manque que par ce qui s'y trouve.

Le programme d'un jeune samouraï : l'escrime, le tir à l'arc, le *jūjutsu*, l'équitation, le maniement de la lance, la tactique. Et aussi la calligraphie, parce que l'écriture trahit le caractère ; la morale, la littérature, l'histoire. Les mathématiques en sont absentes. Compter était l'affaire des marchands, et la guerre féodale ne se faisait pas avec des chiffres.

Le but n'était pas le savoir, mais le caractère. Nitobe résume par trois mots les piliers de la voie : sagesse, bienveillance, courage. Un homme qui n'avait que de l'intelligence n'inspirait aucun respect. Et le maître n'était pas payé : on ne rémunère pas ce qui n'a pas de prix. On lui portait des offrandes à certaines saisons. Le travail de l'esprit, dit Nitobe, ne se mesure pas en or.

Vient ensuite la maîtrise de soi. On exigeait du samouraï qu'il ne montre rien sur son visage. Le plus grand éloge d'un caractère : il ne laisse paraître aucun signe de joie ni de colère. Un père n'embrassait pas son fils, un mari n'embrassait pas sa femme en public. Un jeune homme disait, avec un humour que Nitobe rapporte : les maris américains embrassent leur femme en public et la battent en privé ; les maris japonais la battent en public et l'embrassent en privé.

Les étrangers en concluaient que les Japonais n'ont pas de cœur. Nitobe retourne l'argument : c'est parce qu'ils sentent trop qu'ils s'obligent à ne rien montrer. Quand un Japonais te parle en souriant de la mort de son enfant, il ne se moque pas : il te protège de son chagrin. Et la poésie servait de soupape. Une mère qui a perdu son fils écrit qu'elle se demande jusqu'où il est allé aujourd'hui, à la chasse aux libellules.

Nitobe consacre aussi un chapitre aux femmes, et il faut en dire un mot. On apprenait aux filles de samouraï à manier la longue lance à lame courbe et à porter un poignard dans leur ceinture, pour défendre leur honneur ou se donner la mort. Leur vertu était le dévouement : au père, puis au mari, puis au fils. Nitobe le défend en disant que ce renoncement valait celui de l'homme envers son seigneur. C'est le chapitre qui a le plus vieilli, et il le sentait : il annonce que les choses changeront.

# Le ventre

J'en viens au chapitre que tu attendais. Nitobe l'intitule sobrement : les institutions du suicide et de la réparation.

Le mot que l'Occident connaît, *hara-kiri*, veut dire littéralement se couper le ventre. Les Japonais disent plutôt *seppuku*. Pourquoi le ventre ? Parce que l'ancienne anatomie y plaçait le siège de l'âme et des affections. Nitobe rappelle que la Bible parle des entrailles qui s'émeuvent, que les Français disent *ventre* pour le courage et que les Anglais ont du cran dans les boyaux. S'ouvrir le ventre, c'était dire : j'ouvre le siège de mon âme pour vous montrer ce qu'il en est. Voyez vous-même s'il est souillé ou pur.

Ce n'était pas un suicide ordinaire. C'était une institution, légale et cérémonielle, réservée aux guerriers. Un moyen d'expier ses crimes, de s'excuser de ses erreurs, d'échapper à la honte, de racheter ses amis ou de prouver sa sincérité. Imposé comme peine, il valait au condamné de mourir de sa main, c'est-à-dire en homme d'honneur.

Pour qu'on comprenne, Nitobe recopie un témoignage. En 1868, à Kobe, un officier nommé Taki Zenzaburō avait fait tirer sur des étrangers. Il fut condamné à s'ouvrir le ventre devant des représentants des puissances occidentales. L'un d'eux, le diplomate anglais Mitford, a tout noté.

La scène se passe la nuit, dans la grande salle d'un temple, éclairée par de hautes chandelles. Sept témoins japonais d'un côté, sept étrangers de l'autre. Taki entre, en habit de cérémonie, avec son second, un élève choisi pour son habileté au sabre. Il salue les deux groupes, s'assied sur un tapis rouge, face à l'autel. On lui présente, sur un plateau, un poignard enveloppé de papier. Il le reçoit en le portant à son front.

D'une voix qui trahit, écrit Mitford, juste l'émotion qu'on attend d'un homme faisant un aveu pénible, mais sans une hésitation, il dit : c'est moi, et moi seul, qui ai donné sans raison l'ordre de tirer sur les étrangers à Kobe. Pour ce crime, je m'ouvre le ventre, et je prie ceux qui sont présents de me faire l'honneur d'en être témoins.

Il laisse glisser son vêtement jusqu'à la ceinture et replie soigneusement les manches sous ses genoux, pour ne pas tomber à la renverse : un gentilhomme meurt en tombant en avant. Il prend le poignard, le regarde presque avec affection, se frappe au côté gauche, tire lentement la lame vers la droite, puis la retourne et remonte. Pas un muscle de son visage ne bouge. Il retire l'arme et tend le cou. À cet instant, le second, qui n'a pas quitté ses gestes des yeux, se dresse, lève son sabre, et d'un seul coup la tête tombe.

Un silence de mort suit, écrit l'Anglais, rompu seulement par le bruit hideux du sang.

Nitobe ne fait pas l'éloge de cette mort. Il dit lui-même que la glorifier fut une tentation trop forte pour une jeunesse ardente, et que beaucoup se sont tués pour des raisons qui ne le valaient pas. Il répète ce qu'il a dit au chapitre du courage : la mort était facile ; la voie enseignait qu'il est souvent plus brave de vivre.

# Les quarante-sept

L'autre moitié du chapitre porte sur la vengeance, et il n'y a qu'une histoire pour la raconter. Nitobe la suppose connue. La voici.

Au printemps 1701, au château du shogun, à Edo, le seigneur Asano, maître du petit fief d'Akō, est chargé de recevoir des envoyés de l'empereur. Le maître des cérémonies qui doit l'instruire, Kira, un vieux dignitaire arrogant, l'humilie depuis des jours. Un matin, dans un corridor, Asano dégaine et le blesse au front. Tirer le sabre dans le palais est un crime capital. Le soir même, Asano reçoit l'ordre de s'ouvrir le ventre. Son fief est confisqué. Kira, lui, n'est pas inquiété.

Trois cents guerriers se retrouvent sans maître : des *rōnin*, des hommes-vagues, que la marée emporte. Leur chef, l'intendant Ōishi, rend le château sans combattre. Mais quarante-sept d'entre eux se lient par serment. Kira se méfie : il s'entoure de gardes et fait espionner Ōishi.

Alors, pendant près de deux ans, ils jouent la déchéance. Ils se dispersent, se font marchands, artisans, pour entrer dans la maison de l'ennemi et en lever le plan. Ōishi s'installe à Kyoto, court les maisons de plaisir, s'enivre, répudie sa femme. On raconte qu'un samouraï d'une autre province, le trouvant ivre mort dans une rue, lui cracha au visage en le traitant d'indigne. Les espions rapportent qu'il n'y a plus rien à craindre. Kira renvoie ses gardes.

Une nuit de neige, au cœur de l'hiver, ils attaquent. Ils ont prévenu les voisins que c'est une vengeance et non un vol. Ils fouillent la maison et trouvent le vieillard caché dans une remise à charbon. Ōishi s'agenouille, lui explique qui ils sont, et lui offre, par égard pour son rang, de s'ouvrir le ventre avec le poignard même dont leur maître s'est servi. Kira tremble et se tait. Ils lui coupent la tête.

Au matin, ils traversent la ville en cortège jusqu'au temple de Sengaku-ji, où Asano est enterré. Ils lavent la tête à la fontaine, la posent devant la tombe, brûlent de l'encens. Puis ils se livrent.

Le gouvernement est embarrassé, et le débat dure des semaines. Ces hommes ont accompli le devoir de loyauté que tout le régime enseigne. Mais ils ont aussi violé la paix du shogun. On trouve la solution : ils ne seront pas exécutés comme des criminels. Ils recevront l'ordre de s'ouvrir le ventre, en guerriers. Ils le font le même jour. Le plus jeune, le fils d'Ōishi, a seize ans.

On les enterre auprès de leur maître. On dit que le samouraï qui avait craché sur Ōishi vint demander pardon sur sa tombe, et s'y donna la mort. Aujourd'hui encore, des gens y brûlent de l'encens chaque jour.

Remarque ce que cette histoire a de tordu, et pourquoi elle hante le Japon. La loi et l'honneur s'y contredisent, et il faut une mort pour les réconcilier : punis pour ce qu'ils ont fait, honorés dans la manière de l'être.

# Le sabre

Le sabre, dit Nitobe, est l'âme du samouraï. On le remettait à l'enfant à cinq ans, dans une cérémonie. À quinze, il portait les deux : le long et le court. Il ne les quittait pas. La nuit, ils veillaient à son chevet. On leur donnait des noms. Enjamber négligemment le sabre posé à terre d'un autre homme était une insulte grave.

Le forgeron n'était pas un artisan : c'était un artiste inspiré, et son atelier un sanctuaire. Il commençait sa journée par la prière et la purification. Chaque coup de marteau, chaque trempe était un acte religieux. Nitobe écrit que la lame sortait de ses mains froide et parfaite, avec sa surface où se condense une buée dès qu'on la tire, sa courbe, sa trempe immaculée : une œuvre qui unit la beauté la plus exquise à la force la plus extrême.

Et voici le retournement, que je te demande de retenir plus que tout. Posséder une telle arme, c'était d'abord s'interdire de s'en servir. La voie condamnait l'usage inconsidéré du sabre. On méprisait celui qui dégainait sans nécessité : un lâche ou un fanfaron.

Nitobe prend l'exemple d'un homme qu'il admire, le comte Katsu, qui traversa l'époque la plus sanglante de l'histoire récente du pays, quand les assassinats politiques étaient quotidiens. On avait tenté plusieurs fois de le tuer. Katsu racontait qu'il n'avait jamais tué personne. Son sabre était attaché si serré au fourreau qu'il aurait eu du mal à le tirer. Il citait deux adages : être battu, c'est vaincre ; la plus belle victoire est celle qu'on obtient sans verser le sang.

Voilà où mène la voie du guerrier, quand on la suit jusqu'au bout : à la paix. La force n'est entière que chez celui qui n'a plus besoin de la prouver.

# L'autre voie : le Hagakure

Maintenant, laisse Nitobe un instant. Tu dois savoir qu'il existe un autre livre sur le sujet, plus ancien de deux siècles, et qui dit tout autre chose. Nitobe ne le cite pas.

Il s'appelle le *Hagakure*, ce qui veut dire à peu près : caché sous les feuilles. Son auteur, Yamamoto Tsunetomo, était un vassal du clan Nabeshima, dans l'île de Kyūshū. À la mort de son seigneur, en 1700, il voulut le suivre en s'ouvrant le ventre, comme cela se faisait. Mais le seigneur lui-même, puis le gouvernement, avaient interdit cette coutume. Empêché de mourir, il se fit moine et se retira dans un ermitage. Un jeune scribe vint l'y voir pendant sept ans et nota ses propos. Yamamoto lui avait demandé de les brûler.

Le livre s'ouvre presque par cette phrase :

> J'ai découvert que la voie du guerrier, c'est la mort. | Yamamoto Tsunetomo, Hagakure, livre I

Il s'explique. Quand tu es placé devant le choix entre vivre et mourir, choisis la mort sans attendre. Ce n'est pas compliqué. Tout le monde préfère vivre, et l'on trouve toujours de bonnes raisons de le faire ; mais celui qui survit en ayant manqué son but est un lâche. Chaque matin et chaque soir, il faut se tenir pour déjà mort. Alors seulement on est libre dans la voie, et l'on accomplit sa charge sans faute jusqu'au bout de sa vie.

Tu entends la différence de ton. Nitobe écrit pour des salons de Philadelphie : son samouraï est un gentleman. Yamamoto parle dans une cabane, à un seul jeune homme, avec la rage d'un vieillard qui trouve son époque molle. Il se plaint que les guerriers de son temps ne parlent que d'argent, de vêtements et de femmes. Car il vit, lui aussi, dans un Japon en paix depuis cent ans, où les samouraïs sont devenus des fonctionnaires.

Mais ne le lis pas comme un appel au suicide. Lis ce qu'il dit vraiment : c'est une méthode pour agir. La peur de perdre, sa vie, sa place, sa réputation, fausse tous les jugements. Celui qui a accepté d'avance le pire n'a plus rien qui le retienne, et il voit clair. Il conseille de prendre les décisions graves en sept respirations.

Le troisième grand texte est d'un autre genre encore. Miyamoto Musashi, le plus célèbre duelliste du Japon, s'est retiré dans une grotte à la fin de sa vie et y a écrit le *Livre des cinq anneaux*, achevé en 1645, quelques jours avant sa mort. Il n'y parle presque pas de morale. Il parle de rythme, de distance, de regard. Il dit qu'il faut connaître la voie de tous les métiers, et ne rien faire d'inutile. C'est un livre de praticien : le charpentier de la voie, là où Nitobe en est le prédicateur et Yamamoto le mystique.

# Ce que Nitobe a inventé

Il est temps de te dire ce que les historiens pensent du livre. Tu l'aimes, et tu as raison. Mais tu dois l'aimer en sachant.

Le mot *bushidō* existe dans des textes anciens, à partir du XVIIe siècle. Mais il y est rare, et il ne désigne pas un système. Pendant les siècles de guerre, les guerriers japonais ne se conduisaient pas selon un code de loyauté sans faille : ils changeaient de camp, trahissaient leurs seigneurs, se battaient pour des terres. L'époque porte un nom qui veut dire : l'inférieur renverse le supérieur. Les traités qui parlent de vertu datent presque tous d'après, de l'époque de paix, quand les samouraïs n'avaient plus de guerres à faire et qu'il fallait bien justifier leur rang et leur solde. La voie du guerrier a été écrite, pour l'essentiel, par des guerriers qui ne se battaient plus.

Quant à Nitobe, un Anglais qui enseignait à Tokyo depuis trente ans, Basil Hall Chamberlain, lui a répondu avec cruauté en 1912. Il écrit que le bushidō, comme institution ou comme code, n'a jamais existé ; que le mot ne figurait dans aucun dictionnaire, japonais ou étranger, avant 1900 ; et que tout cela a été fabriqué de toutes pièces, surtout à l'usage de l'étranger.

Chamberlain exagère, mais il touche juste. Regarde les sept vertus telles que Nitobe les range : justice, courage, bonté, courtoisie, véracité, honneur, loyauté. Ce sont, à peu de chose près, celles du chevalier chrétien et du gentleman victorien. Nitobe cite plus d'auteurs européens que d'auteurs japonais. Il a lu son pays avec les lunettes d'un quaker formé en Amérique, et il a trouvé ce qu'il cherchait : la preuve que le Japon avait, lui aussi, une noblesse d'âme digne de l'Occident.

Est-ce une tromperie ? Je ne crois pas. Il a fait ce que font tous ceux qui héritent d'un monde disparu : il a choisi dedans. Il a pris les histoires qu'on lui racontait enfant, Kumagai, Genzō, les quarante-sept, et il en a tiré une éthique. Ce n'est pas l'histoire des samouraïs. C'est ce que les samouraïs, à leur meilleur, ont dit qu'il fallait être.

# Ce qu'on en a fait

Il y a plus grave que les erreurs de Nitobe : c'est l'usage qu'on a fait de l'idée après lui.

Le Japon de Meiji bâtissait une armée de conscrits. Il fallait faire, avec des fils de paysans, des soldats prêts à mourir. On leur enseigna qu'ils étaient tous, désormais, des samouraïs de l'empereur. La vertu d'une caste devint le devoir d'un peuple, et la loyauté à un seigneur qu'on connaissait devint l'obéissance à un État.

Dans les années 1930, les militaristes poussèrent cela à bout. On réédita le *Hagakure* pour les soldats, en n'en gardant que la phrase sur la mort. En 1941, le code de campagne de l'armée ordonna de ne pas survivre à la honte d'être fait prisonnier. Des dizaines de milliers d'hommes sont morts dans des charges sans espoir ou se sont tués plutôt que de se rendre. Les prisonniers ennemis, eux, furent traités avec une cruauté que rien dans le livre de Nitobe n'autorise : celui qui s'était rendu n'avait plus d'honneur. À la fin, on envoya des garçons de vingt ans jeter leur avion sur des navires.

Mets cela en face de Katsu, qui n'avait jamais tiré son sabre. En face de Kumagai, qui pleure. En face du prince de Mito : il est d'un vrai courage de vivre quand il est juste de vivre. La voie a été retournée exactement là où Nitobe avait signalé le danger, au chapitre de la loyauté : quand on fait de sa conscience l'esclave d'un maître.

Nitobe a vu venir la fin. Devenu l'un des dirigeants de la Société des Nations, à Genève, il a passé ses dernières années à tenter d'empêcher la rupture entre son pays et le monde. Il est mort en 1933 au Canada, épuisé, au retour d'une conférence, l'année même où le Japon claquait la porte de la Société. Le pont avait cédé.

En 1970, l'écrivain Yukio Mishima, qui avait publié un commentaire du *Hagakure*, entra dans un quartier général de l'armée, harangua des soldats qui le huèrent, et s'ouvrit le ventre. Le Japon moderne le regarda avec stupeur, comme un homme sorti d'un autre siècle. La forme était intacte. Plus personne ne savait à quoi elle servait.

# Ce qui en reste pour toi

Nitobe termine son livre par deux chapitres mélancoliques. Il sait que la voie est condamnée : elle était liée à un ordre féodal qui n'existe plus. Il la compare une dernière fois à la fleur de cerisier. Elle ne laisse pas de fruit. Mais quand les pétales seront dispersés aux quatre vents, dit-il, son parfum viendra encore, longtemps après, bénir le voyageur qui passe.

Alors que peut en faire quelqu'un qui n'est ni japonais, ni guerrier, ni au service de personne ? Je te propose ceci, à toi qui racontes des histoires et qui diriges des gens.

Garde l'ordre des vertus. Il n'est pas indifférent. La justesse d'abord : savoir ce qui doit être fait. Le courage ensuite, qui n'est rien sans elle. Puis la bonté, sans laquelle les deux premières font un homme dur. Puis la tenue, qui est la bonté rendue visible. Puis la parole tenue. L'honneur n'arrive qu'en sixième : il est le résultat, pas le but. Celui qui commence par vouloir être honoré finit par couper un homme en deux pour une puce.

Garde la question du service. Le mot samouraï vient d'un verbe qui veut dire servir. Toute la grandeur de ces hommes venait de ce qu'ils ne s'appartenaient pas : ils répondaient de quelque chose de plus grand. Et toute leur faute venait du choix de ce quelque chose. Demande-toi ce que tu sers. Une œuvre ? Des gens ? Une idée de toi-même ? Et demande-toi si cela mérite ce que tu lui donnes.

Garde la contrefaçon. C'est la leçon la plus fine du livre. Chaque vertu a son double : le devoir et la peur du qu'en-dira-t-on, le courage et la témérité, la bonté et la mollesse, la politesse et le mensonge, l'honneur et la vanité, la loyauté et la servilité. Tu ne les distingueras jamais de l'extérieur. Seulement de l'intérieur, et pas tous les jours.

Et garde le sabre attaché au fourreau. Travaille jusqu'à ce que ta lame soit parfaite. Puis mets ta fierté à ne pas la tirer.

Je referme le livre. Il est long, et il est à moitié un rêve. Mais c'est le rêve d'un homme qui cherchait comment on devient quelqu'un sans qu'un dieu vous y oblige. La question du professeur belge n'a pas vieilli.
`,
};
export default book;
