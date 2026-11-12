const book = {
  id: "hegel", title: "Hegel", sub: "La dialectique, pas à pas", room: "philo", type: "apprentissage", cote: "PH-002", color: 215, emblem: "理",
  about: "Le philosophe réputé le plus illisible. On avance lentement, avec des exemples, jusqu'au maître et au serviteur.",
  links: [
    { label: "Phénoménologie de l'esprit (1807)", note: "Ne commence pas par là. Lis d'abord la préface, puis le chapitre IV (maîtrise et servitude)." },
    { label: "La Raison dans l'histoire", note: "Ses cours : le Hegel le plus accessible." },
    { label: "Alexandre Kojève, Introduction à la lecture de Hegel", note: "La lecture qui a marqué tout le XXe siècle français. Brillante, discutée." },
    { label: "Hegel sur Wikisource", url: "https://fr.wikisource.org/wiki/Auteur:Georg_Wilhelm_Friedrich_Hegel" },
  ],
  text: String.raw`
# Avant de commencer

Hegel a une réputation : personne n'y comprend rien. Elle est à moitié méritée. Il écrit des phrases de douze lignes, invente son vocabulaire, et ne donne presque jamais d'exemple. Mais l'idée qu'il poursuit est simple à dire, et une fois que tu l'as, les phrases s'ouvrent.

La voici : *rien ne se comprend à l'arrêt*. Une chose, une idée, une personne, une époque, ne sont pas des objets posés là. Ce sont des mouvements. Pour savoir ce qu'est un gland, il faut voir le chêne. Pour savoir ce qu'est un homme, il faut suivre ce qu'il devient. La vérité n'est pas une photo, c'est un film.

Tu fais des films : tu as déjà l'intuition qu'il faut. Un plan seul ne dit rien. C'est le plan suivant qui lui donne son sens, parfois en le contredisant. Hegel pense comme un monteur.

!! COMMENT LIRE CE LIVRE :: Chaque chapitre pose une seule idée. Un encadré la résume à la fin. Si un passage résiste, passe : le suivant l'éclaire souvent.

# L'homme et son époque

Georg Wilhelm Friedrich Hegel naît à Stuttgart en 1770. La même année que Beethoven, un an après Napoléon. Au séminaire de Tübingen, il partage sa chambre avec deux garçons qui deviendront célèbres avant lui : le poète Hölderlin et le philosophe Schelling. Ils ont dix-neuf ans quand la Bastille tombe, et ils s'enflamment.

Cette date compte. Toute la génération de Hegel a vu l'histoire accélérer sous ses yeux : un roi décapité, la Terreur, puis un général qui redessine l'Europe. Comment penser un monde qui bouge autant ? Les philosophies d'avant décrivaient des vérités éternelles. Hegel veut une philosophie capable de penser le changement lui-même.

En octobre 1806, il termine son premier grand livre à Iéna, pendant que l'armée française entre dans la ville. Il voit passer Napoléon à cheval et écrit à un ami :

> J'ai vu l'Empereur, cette âme du monde, sortir de la ville pour aller en reconnaissance. | Lettre à Niethammer, 13 octobre 1806

Le lendemain, c'est la bataille d'Iéna. Hegel sauve son manuscrit du pillage. Le livre s'appelle la *Phénoménologie de l'esprit*. Il deviendra ensuite directeur de lycée, puis professeur à Berlin, où il sera le philosophe le plus écouté d'Allemagne. Il meurt en 1831, pendant une épidémie de choléra.

@img https://commons.wikimedia.org/wiki/Special:FilePath/Bataille_d%27I%C3%A9na,_14_octobre_1806_(Vernet).jpg?width=1100 | Horace Vernet, La Bataille d'Iéna, 14 octobre 1806 (peint en 1836). Le lendemain du jour où Hegel voit passer Napoléon. | Wikimedia Commons, domaine public

!! À RETENIR :: Hegel est le philosophe d'une époque qui a vu l'histoire se mettre à courir. Sa question : comment penser ce qui change ?

# Le bouton, la fleur, le fruit

Dans la préface de la *Phénoménologie*, Hegel donne l'une de ses rares images. Regarde une plante. Le bouton apparaît. Puis la fleur éclot, et le bouton disparaît : on pourrait dire que la fleur le réfute. Puis le fruit vient, et la fleur tombe : le fruit déclare que la fleur était une fausse forme de la plante.

Trois moments, et chacun chasse le précédent. Pourtant, personne ne dira que le bouton avait tort. Il était nécessaire. Sans lui, pas de fleur ; sans fleur, pas de fruit. Ils se contredisent *et* ils forment une seule vie.

Voilà le geste de pensée que Hegel te demande. Devant deux positions qui s'opposent, le réflexe est de chercher qui a raison. Hegel propose autre chose : demande-toi de quel mouvement elles sont deux moments.

Exemple. Enfant, tu obéis à tes parents sans discuter. Adolescent, tu rejettes tout en bloc. L'adolescent a-t-il raison contre l'enfant ? Non, et l'adulte que tu deviens le sait : il garde quelque chose de la confiance de l'enfant et quelque chose de la révolte de l'adolescent, dans une forme que ni l'un ni l'autre ne pouvait imaginer.

!! À RETENIR :: Une contradiction n'est pas forcément une erreur. C'est souvent le signe qu'un mouvement est en cours.

# Le mot magique : Aufhebung

Hegel a un mot pour ce passage, et il n'a pas d'équivalent en français : *Aufhebung*, du verbe *aufheben*. En allemand courant, ce verbe veut dire trois choses à la fois : supprimer (une loi), conserver (garder un objet de côté), et soulever (ramasser quelque chose par terre). Hegel adore ce mot précisément parce qu'il dit les trois ensemble.

Quand une chose est « dépassée » au sens de Hegel, elle est en même temps niée, gardée et élevée. L'adolescence supprime l'enfance, la conserve et la porte plus haut. Le fruit supprime la fleur, mais il contient tout ce qu'elle préparait.

On te dira peut-être que la dialectique, c'est « thèse, antithèse, synthèse ». Méfie-toi : Hegel n'emploie presque jamais ces trois mots, et jamais comme une recette. La formule vient d'autres auteurs, et elle a un défaut : elle fait croire qu'on prend deux idées et qu'on les mélange à mi-chemin. Or le troisième moment n'est pas un compromis. C'est quelque chose de neuf, qui n'existait dans aucun des deux premiers.

Les trois temps réels sont plutôt ceux-ci. D'abord, une chose se pose, simple, sûre d'elle. Ensuite, elle se heurte à ce qu'elle n'est pas, elle se divise, elle entre en crise : c'est le moment négatif. Enfin, elle revient à elle-même, mais transformée par l'épreuve, enrichie de ce qu'elle a traversé.

!! À RETENIR :: Aufhebung : supprimer, conserver, élever, en un seul geste. Dépasser n'est pas effacer.

# Le travail du négatif

Pourquoi faut-il passer par la crise ? Hegel est ici très dur, et très beau. Il écrit que la vie de l'esprit n'est pas celle qui recule devant la mort et se garde pure de la destruction, mais celle qui la supporte et se maintient en elle. L'esprit ne gagne sa vérité qu'en se trouvant lui-même dans le déchirement absolu.

Dit plus simplement : on ne devient rien sans perdre quelque chose. Une conviction qui n'a jamais été attaquée n'est qu'une opinion. Un amour qui n'a jamais été mis en doute n'a pas encore fait ses preuves. Un artiste qui n'a jamais détruit ce qu'il savait faire ne progresse plus.

Hegel appelle cela le sérieux, la douleur, la patience et le travail du négatif. Le négatif n'est pas le mal. C'est le moteur. C'est ce qui empêche les choses de rester ce qu'elles sont.

Remarque la différence avec la sagesse ordinaire, qui dit : évite le conflit, reste entier. Pour Hegel, rester entier, c'est rester pauvre. Le chemin de la conscience est un chemin de doute, et même, dit-il, de désespoir.

!! À RETENIR :: Le négatif (la crise, la perte, la contradiction) est ce qui fait avancer. Sans lui, rien ne devient.

# Le maître et le serviteur

Voici le passage le plus célèbre de toute son œuvre. Il tient en quelques pages, au chapitre IV de la *Phénoménologie*. Prenons-le comme une scène.

## Le désir d'être reconnu

Hegel part d'une question : comment un être devient-il conscient de lui-même, un « je » ? Pas en se regardant le nombril. Un animal a faim, il mange, la faim revient. Le désir d'une chose ne te donne jamais que des choses. Pour savoir que tu es un sujet, il te faut autre chose : qu'un autre sujet te le dise. Ce que je désire vraiment, ce n'est pas un objet, c'est d'être *reconnu* par une autre conscience.

Problème : l'autre veut exactement la même chose. Deux consciences se font face, et chacune veut être reconnue sans avoir à reconnaître.

## La lutte

Elles s'affrontent. Hegel dit : une lutte à mort. Pourquoi si loin ? Parce que chacune veut prouver qu'elle est plus qu'un animal, qu'elle tient à quelque chose de plus que sa vie. Montrer que je suis libre, c'est montrer que je suis prêt à risquer ma vie.

Mais si l'une tue l'autre, elle a perdu : il n'y a plus personne pour la reconnaître. Il faut donc que l'une cède. L'une des deux, à un moment, a peur. Elle a senti la mort, « le maître absolu », et elle préfère vivre. Elle se soumet. La voilà serviteur. L'autre, qui n'a pas tremblé, devient maître.

## Le renversement

On pourrait croire l'histoire finie. C'est là que Hegel retourne tout.

Regarde le maître. Il voulait être reconnu par un égal. Il n'est reconnu que par quelqu'un qu'il méprise, quelqu'un qu'il a réduit à l'état d'instrument. Sa victoire est creuse. Et il ne fait plus rien : il consomme ce que l'autre prépare. Il dépend entièrement de celui qu'il domine. Il est dans une impasse.

Regarde le serviteur. Il a connu la peur absolue : tout ce qui était fixe en lui a tremblé. Et depuis, il travaille. Il laboure, il forge, il bâtit. Or travailler, c'est retenir son désir (on ne mange pas le blé, on le sème) et donner une forme durable aux choses. Dans la table qu'il a faite, le serviteur voit quelque chose que le maître ne verra jamais : sa propre marque dans le monde. Il se découvre capable. Il transforme la nature, et en la transformant il se transforme.

> Le travail forme. | Phénoménologie de l'esprit, chapitre IV (formule abrégée)

Conclusion vertigineuse : la vérité de la conscience indépendante, c'est la conscience servile. L'avenir appartient à celui qui a perdu la lutte, parce que lui seul a appris quelque chose.

!! À RETENIR :: Le maître gagne et stagne. Le serviteur perd, a peur, travaille, et c'est lui qui devient libre. La reconnaissance vraie n'existe qu'entre égaux.

# Ce que cette scène a fait au monde

Ces quelques pages ont eu une postérité immense. Marx y a lu l'histoire des classes : le travailleur, en produisant le monde, prépare le renversement de celui qui en profite. Au XXe siècle, à Paris, Alexandre Kojève en a fait le centre de son séminaire, suivi par toute une génération. Simone de Beauvoir s'en est servie pour penser le rapport entre les hommes et les femmes, Frantz Fanon pour penser le colonisé et le colon.

Attention toutefois : chez Hegel, ce n'est pas un récit historique. Il ne décrit pas une bataille qui aurait eu lieu un jour. Il décrit une structure : ce qui se joue chaque fois que deux libertés se rencontrent. Tu peux la retrouver dans un couple, dans une équipe, sur un plateau de tournage. Qui a besoin du regard de qui ? Qui fait, et qui fait faire ?

Et retiens la leçon positive, qu'on oublie souvent. Ce n'est pas la domination qui libère, ni la soumission. C'est le travail : le fait de mettre quelque chose de soi dans le monde, et de s'y reconnaître.

# La raison dans l'histoire

Hegel applique la même logique à l'histoire entière. Pour lui, elle n'est pas une suite de hasards et de massacres, même si elle y ressemble (il l'appelle lui-même un abattoir). Elle a un fil : le progrès de la conscience de la liberté. Dans les anciens empires d'Orient, dit-il, un seul homme était libre, le despote. Chez les Grecs et les Romains, quelques-uns, les citoyens. Dans le monde moderne, on sait que l'homme en tant qu'homme est libre.

Comment ce progrès avance-t-il ? Pas grâce à la bonne volonté. Les grands hommes poursuivent leur ambition, leur gloire, leurs passions. César voulait le pouvoir ; il a fait naître l'Empire. Sans le savoir, ils accomplissent quelque chose de plus grand qu'eux. Hegel appelle cela la *ruse de la raison* : l'histoire se sert des passions des hommes comme d'outils, puis jette les hommes.

C'est le moment où il faut le critiquer. Cette vision classe les civilisations sur une échelle dont l'Europe occupe le sommet, et Hegel a écrit sur l'Afrique et l'Asie des pages ignorantes et méprisantes. Elle peut aussi servir à tout excuser : si l'histoire a toujours raison, les vaincus ont toujours tort. Garde l'outil (chercher la logique sous le chaos), et méfie-toi de la conclusion.

!! À RETENIR :: Pour Hegel, l'histoire a un sens : la liberté devient consciente d'elle-même. La ruse de la raison : les passions individuelles servent un mouvement qui les dépasse.

# La chouette de Minerve

Dernière idée, la plus mélancolique. Dans la préface de ses *Principes de la philosophie du droit*, en 1820, Hegel écrit deux phrases restées célèbres.

La première a fait scandale :

> Ce qui est rationnel est effectif, et ce qui est effectif est rationnel. | Principes de la philosophie du droit, préface

On y a lu une justification de tout ce qui existe, y compris l'État prussien qui le payait. C'est un contresens partiel. « Effectif » ne veut pas dire « tout ce qui existe ». Une institution morte, qui ne tient plus que par habitude, existe encore mais n'est plus effective : elle a perdu sa raison d'être, et elle tombera. La phrase est donc à double tranchant.

La seconde est une image :

> La chouette de Minerve ne prend son envol qu'à la tombée de la nuit. | Principes de la philosophie du droit, préface

Minerve est la déesse de la sagesse, la chouette son oiseau. La philosophie arrive toujours trop tard. Elle ne peut pas dire au monde ce qu'il doit être. Elle comprend une époque quand cette époque s'achève, comme on comprend une journée le soir, ou une histoire d'amour quand elle est finie. Elle peint, dit-il, « gris sur gris » une forme de vie qui a vieilli.

Marx répondra par une phrase aussi célèbre : les philosophes n'ont fait qu'interpréter le monde, il s'agit de le transformer. Tout le débat du siècle suivant est là.

# Ce que tu emportes

Si tu ne devais garder que quatre choses, garde celles-ci.

Un : pense en mouvement. Devant une chose, demande ce qu'elle est en train de devenir.

Deux : ne fuis pas la contradiction. Quand deux idées auxquelles tu tiens s'opposent, ne choisis pas trop vite. Cherche la forme plus haute qui garde ce que chacune avait de vrai.

Trois : ce que tu es, tu ne le sais que par les autres et par ce que tu fais. La reconnaissance et le travail, pas l'introspection.

Quatre : on comprend après. Ce qui t'arrive aujourd'hui n'aura son sens que plus tard, et ce sens dépendra de ce que tu en feras.

Tu peux maintenant ouvrir la *Phénoménologie*. Elle sera encore difficile. Mais tu sauras ce que tu y cherches.
`,
};
export default book;
