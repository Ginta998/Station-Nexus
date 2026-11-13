const book = {
  id: "spinoza", title: "Spinoza", sub: "La joie comme méthode", room: "philo", type: "pensee", cote: "PH-003", color: 200, emblem: "樂",
  about: "Spinoza parle, depuis son établi de polisseur de lentilles : l'exclusion de la synagogue à vingt-trois ans, Dieu qui est la Nature, le désir qui fait de chaque chose ce qu'elle est, les passions tristes qui nous diminuent, la liberté qui consiste à comprendre, et la joie comme seule boussole.",
  links: [
    { label: "Spinoza, L'Éthique (1677)", note: "Le livre de sa vie, écrit comme un traité de géométrie. Commence par la troisième partie, sur les affects, puis reviens au début." },
    { label: "Spinoza, Traité théologico-politique (1670)", note: "La défense de la liberté de penser, publiée sans nom d'auteur, aussitôt interdite." },
    { label: "Gilles Deleuze, Spinoza, philosophie pratique (1981)", note: "Le meilleur petit livre pour entrer dans sa pensée, par un philosophe qui l'aimait." },
    { label: "Frédéric Lenoir, Le Miracle Spinoza (2017)", note: "Une introduction claire et vivante." },
    { label: "Nietzsche et Hegel, dans cette même salle", note: "Deux philosophes qui ont lu Spinoza de très près, l'un pour l'admirer, l'autre pour le dépasser." },
  ],
  text: String.raw`
# La lentille

Je polis des lentilles. C'est mon métier. Je les taille dans du verre, je les use sur un tour, avec de la poudre de plus en plus fine, jusqu'à ce qu'elles soient parfaitement claires, parfaitement courbes. On s'en sert pour les lunettes, pour les microscopes, pour les télescopes. Des savants de toute l'Europe m'en commandent. C'est un travail lent, exact, patient. La poussière de verre me brûle les poumons. Je sais qu'elle me tuera.

Je m'appelle Baruch de Spinoza. On m'appelle aussi Bento, en portugais, ou Benedictus, en latin. Les trois prénoms veulent dire la même chose : béni. Je suis né à Amsterdam, en 1632, dans une famille juive venue du Portugal. Je vis aujourd'hui à La Haye, dans une chambre louée chez un peintre. J'ai quarante-quatre ans. J'écris un livre depuis quinze ans. Il s'appelle l'Éthique. Je ne le publierai pas de mon vivant : il me ferait jeter en prison, ou pire.

Je vais te dire ce qu'il contient. Mais il faut d'abord que je te dise pourquoi un homme comme moi vit seul, dans une chambre, à polir du verre.

# Le herem

Mes grands-parents étaient des marranes. Au Portugal, on avait forcé les Juifs à se convertir au christianisme. Ils avaient fait semblant, pendant des générations, en gardant en secret ce qu'ils pouvaient de leur foi, sous la menace de l'Inquisition. Puis ils avaient fui vers Amsterdam, la ville la plus libre d'Europe, où l'on pouvait être juif au grand jour. Ils y avaient fondé une communauté, avec ses synagogues, ses écoles, ses marchands. Mon père était un négociant respecté, un des dirigeants de la communauté.

J'ai été un élève brillant à l'école juive. J'ai appris l'hébreu, la Bible, le Talmud, les grands commentateurs, Maïmonide. On pensait que je deviendrais rabbin. Puis j'ai lu autre chose. J'ai appris le latin auprès d'un ancien jésuite, Franciscus van den Enden, un homme libre, médecin, révolutionnaire, qui finira pendu à Paris pour avoir comploté contre le roi. Par lui, j'ai découvert Descartes, la nouvelle physique, la philosophie qui ne demande rien à la Révélation et tout à la raison.

Et j'ai commencé à douter. Je me suis demandé si Moïse avait vraiment écrit les cinq livres qu'on lui attribue. Si l'âme était immortelle. Si Dieu avait vraiment choisi un peuple plutôt qu'un autre. Si les miracles étaient autre chose que des choses dont on ignore les causes. Je ne le criais pas sur les toits. Mais je ne savais pas me taire non plus.

Le 27 juillet 1656, j'avais vingt-trois ans, les dirigeants de la communauté ont prononcé contre moi le herem, l'exclusion. Le texte, qu'on a conservé, est d'une violence qu'on n'avait presque jamais employée à Amsterdam. Il me maudissait le jour et la nuit, couché et levé, en sortant et en entrant. Il interdisait à quiconque de me parler, de m'écrire, de me rendre service, de demeurer sous le même toit que moi, de s'approcher de moi à moins de quatre coudées, de lire un écrit de ma main. On ne sait pas exactement ce qu'on me reprochait. Le texte parle d'horribles hérésies que je pratiquais et enseignais, et d'actes monstrueux, sans les nommer.

On raconte qu'un fanatique a tenté de me poignarder, un soir, en sortant du théâtre, et que j'ai gardé le manteau troué pour me souvenir que la haine existe. Je ne sais pas si c'est vrai. Je sais que je ne suis jamais revenu. Je n'ai pas demandé pardon. Je ne me suis pas converti non plus au christianisme, comme on le faisait souvent en pareil cas. Je suis resté entre les deux, seul, avec quelques amis : des marchands, des médecins, des chrétiens dissidents, qui lisaient Descartes et rêvaient d'une religion sans prêtres. J'ai appris un métier manuel, comme le veut la tradition juive pour les savants : le polissage des lentilles.

J'ai vécu à Rijnsburg, près de Leyde, dans une petite maison, puis à Voorburg, puis à La Haye. Je dépense peu. Je mange du gruau, du lait, un peu de vin. Je fume la pipe. On m'a proposé une chaire de philosophie à l'université de Heidelberg, avec la liberté de philosopher, à condition de ne pas troubler la religion établie. J'ai refusé. Je ne savais pas où s'arrêterait cette condition. Je préfère mes lentilles.

# Dieu, c'est-à-dire la Nature

Voici ce que j'ai compris, et qui m'a valu cette solitude.

Il n'y a qu'une seule chose qui existe vraiment, une seule substance, infinie, éternelle, qui contient tout. Je l'appelle Dieu, ou la Nature : Deus sive Natura. Les deux mots désignent la même réalité. Dieu n'est pas un roi assis au-dessus du monde, qui l'aurait créé par caprice, qui le gouvernerait selon sa volonté, qui récompenserait et punirait. Dieu n'est pas une personne. Il n'a ni colère, ni amour, ni projet. Il est le monde lui-même, considéré dans sa puissance infinie de produire toutes choses. Toi, moi, cette pierre, cet arbre, cette pensée, nous sommes des manières d'être de Dieu, des modes, comme les vagues sont des manières d'être de la mer.

Tout ce qui arrive arrive nécessairement. Rien n'est contingent dans la nature. Chaque chose a une cause, et cette cause a une cause, à l'infini. Il n'y a pas de miracles, seulement des choses dont on ignore les causes. Il n'y a pas non plus de but dans la nature. Les hommes croient que le soleil a été fait pour les éclairer, la pluie pour leurs champs, les animaux pour les nourrir. Quand un malheur arrive, ils disent que Dieu est en colère. Quand on leur demande pourquoi, ils répondent que les voies de Dieu sont impénétrables. J'ai appelé cela l'asile de l'ignorance.

On m'a traité d'athée pour cela. Je crois que je suis plus religieux que ceux qui m'accusent. Ils ont fait de Dieu un homme plus grand que les autres. Moi, j'ai essayé de le penser.

J'ai écrit l'Éthique comme un livre de géométrie. Des définitions, des axiomes, des propositions, des démonstrations, comme Euclide. On me demande pourquoi. C'est parce que je voulais que personne ne puisse me croire sur parole. Je voulais qu'on vérifie chaque pas. Et parce que je voulais traiter les passions humaines comme on traite les lignes, les plans et les corps : ni les maudire, ni s'en moquer, ni les déplorer, mais les comprendre.

# Le désir, la joie, la tristesse

Chaque chose, autant qu'il est en elle, s'efforce de persévérer dans son être. J'appelle cela le conatus, l'effort. Une pierre résiste à ce qui la brise. Un arbre pousse vers la lumière. Un homme cherche à vivre, à agir, à penser, à s'étendre. Cet effort, quand nous en avons conscience, je l'appelle le désir. Le désir est l'essence même de l'homme.

Et voici ce que je crois le plus important de tout ce que j'ai écrit. Nous ne désirons pas une chose parce que nous la jugeons bonne. Nous la jugeons bonne parce que nous la désirons. Le bien et le mal ne sont pas inscrits dans le ciel. Ils sont ce qui augmente ou diminue notre puissance d'agir.

Quand notre puissance d'agir augmente, nous éprouvons de la joie. Quand elle diminue, nous éprouvons de la tristesse. Tous les autres sentiments viennent de ces trois-là : le désir, la joie, la tristesse. L'amour est une joie accompagnée de l'idée de sa cause : j'aime ce qui me rend plus fort. La haine est une tristesse accompagnée de l'idée de sa cause. L'espoir est une joie inconstante, mêlée de doute ; la crainte, une tristesse inconstante. Le remords, la honte, l'envie, la pitié, l'humilité : des tristesses.

Les tyrans, les prêtres, tous ceux qui veulent dominer les hommes, ont besoin de les rendre tristes. Ils leur inspirent la crainte de l'enfer, la honte de leur corps, la culpabilité, la haine des autres. Un homme triste est un homme faible, et un homme faible obéit. Ils font croire que la tristesse est une vertu, que la souffrance élève, que l'humilité plaît à Dieu. Je dis le contraire. Rien de ce qui diminue notre puissance n'est bon. La joie n'est pas un péché : c'est le passage d'une moindre à une plus grande perfection.

Cela ne veut pas dire qu'il faut chercher n'importe quel plaisir. Il y a des joies qui nous enchaînent : l'ivresse, l'avidité, la gloire, qui augmentent une partie de nous et diminuent le reste. Ce sont des passions, parce que nous les subissons, poussés par des causes extérieures que nous ne comprenons pas. La vraie joie est celle qui vient de ce que nous comprenons.

# La liberté

Les hommes se croient libres parce qu'ils ont conscience de leurs désirs, et qu'ils ignorent les causes qui les déterminent. Un enfant croit vouloir librement le lait qui le nourrit. Un homme en colère croit vouloir librement se venger. Un ivrogne croit dire librement ce qu'il regrettera le lendemain. Une pierre qu'on a lancée, si elle pouvait penser, croirait qu'elle vole parce qu'elle le veut.

Il n'y a pas de libre arbitre. Mais il y a une liberté. Elle ne consiste pas à échapper à la nécessité. Elle consiste à la comprendre. Celui qui comprend pourquoi il est en colère n'est déjà plus tout à fait en colère. Un sentiment qui est une passion cesse d'en être une dès que nous en formons une idée claire. Comprendre, c'est passer de l'état de pierre lancée à celui de quelqu'un qui agit selon sa propre nature. La liberté n'est pas le contraire de la nécessité ; c'est la nécessité comprise de l'intérieur.

Et au bout de ce chemin, il y a ce que j'appelle la béatitude. Un amour intellectuel de Dieu, c'est-à-dire de la Nature tout entière, qui naît de la compréhension de toutes choses. Ce n'est pas une récompense après la mort. Je ne crois pas que l'âme survive comme une personne. C'est une joie présente, ici, maintenant, celle de quelqu'un qui voit enfin comment il est lié au tout. L'homme libre ne pense à rien moins qu'à la mort, et sa sagesse est une méditation non de la mort, mais de la vie.

Je finis mon livre par cette phrase : tout ce qui est remarquable est aussi difficile que rare. Je n'ai pas promis que ce serait facile.

# La politique, et la fin

Je n'ai pas vécu hors du monde. En 1670, j'ai publié, sans mon nom, un Traité théologico-politique. J'y montrais, en lisant la Bible comme on lit n'importe quel livre ancien, avec son histoire, ses auteurs, ses contradictions, qu'elle n'enseigne pas des vérités sur la nature, mais l'obéissance et la charité. J'y défendais une idée qui paraissait folle : que l'État doit laisser chacun penser ce qu'il veut et dire ce qu'il pense, parce qu'une liberté de pensée étouffée produit des hypocrites et des révoltés, jamais des citoyens. Le livre a été interdit. On l'a appelé un livre forgé en enfer.

Deux ans plus tard, en 1672, j'ai vu ce que peut une foule. La Hollande était envahie par les armées de Louis XIV. Le peuple d'Amsterdam et de La Haye, furieux, s'en est pris aux frères de Witt, Jan et Cornelis, qui gouvernaient la république et qui étaient mes amis, ou du moins mes protecteurs. On les a massacrés dans la rue, on a déchiré leurs corps. J'ai pleuré, moi qui ne pleure pas. J'ai voulu aller afficher sur les lieux un écriteau qui disait : derniers des barbares. Mon logeur m'a enfermé dans la maison pour m'empêcher de sortir. Il m'a sauvé la vie.

J'ai compris, ce jour-là, que la raison ne suffit pas à gouverner les foules, et que la politique doit compter avec les passions. J'ai commencé un Traité politique, pour chercher quelles institutions permettent aux hommes, tels qu'ils sont, de vivre libres. Je ne le finirai pas.

Je vais mourir dans quelques semaines, le 21 février 1677. J'aurai quarante-quatre ans. Mes amis publieront mes œuvres, sans nom d'auteur, sous mes seules initiales, quelques mois après. Elles seront aussitôt interdites.

# Ce que je te laisse

Pendant un siècle, on m'a traité d'athée, de monstre, de corrupteur. Le mot spinoziste était une insulte. Puis les Allemands m'ont redécouvert, Lessing, Goethe, Hegel, qui disait qu'on est spinoziste ou qu'on n'est pas philosophe. Nietzsche a écrit qu'il avait trouvé en moi un précurseur. Einstein, à qui un rabbin demandait s'il croyait en Dieu, a répondu qu'il croyait au Dieu de Spinoza, qui se révèle dans l'harmonie de ce qui existe, et non en un Dieu qui se préoccupe du sort et des actions des hommes. Des neurologues, de nos jours, relisent ce que j'ai écrit sur les affects et le corps. Amsterdam, qui m'avait chassé, a élevé ma statue.

Je te laisse trois choses.

La première : ne ris pas, ne pleure pas, ne déteste pas, mais comprends. Devant ce que font les hommes, et devant ce que tu fais toi-même. Comprendre n'est pas excuser. C'est la seule manière de ne plus être le jouet de ce qu'on subit.

La deuxième : méfie-toi de ceux qui te rendent triste pour te gouverner. La culpabilité, la peur, la honte sont des chaînes. Une œuvre, une communauté, un enseignement qui rend les gens plus forts, plus capables d'agir, plus joyeux, est bon. Celui qui les diminue ne l'est pas, quoi qu'il prétende.

La troisième : cherche ce qui augmente ta puissance d'agir. Les rencontres, les gens, les livres, les lieux, les manières de travailler qui te rendent plus vivant. Éloigne-toi doucement des autres. Ce n'est pas de l'égoïsme. C'est la seule boussole fiable que j'aie trouvée.
`,
};
export default book;
