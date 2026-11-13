const book = {
  id: "musashi", title: "Miyamoto Musashi", sub: "Le Livre des cinq anneaux", room: "japon", type: "pensee", cote: "JA-002", color: 210, emblem: "二",
  about: "Musashi raconte depuis sa grotte, à la fin de sa vie : le premier homme tué à treize ans, la maison Yoshioka, le duel de l'île de Ganryū contre Sasaki Kojirō, les deux sabres, la peinture et l'encre, et le livre qu'il écrit pour qu'on comprenne qu'une seule voie, suivie jusqu'au bout, éclaire toutes les autres.",
  links: [
    { label: "Miyamoto Musashi, Le Livre des cinq anneaux (1645)", note: "Le traité, en cinq rouleaux : la Terre, l'Eau, le Feu, le Vent, le Vide. Court, à relire toute sa vie." },
    { label: "Miyamoto Musashi, La Voie à suivre seul (Dokkōdō)", note: "Vingt et un préceptes écrits une semaine avant sa mort." },
    { label: "Eiji Yoshikawa, La Pierre et le Sabre (1935-1939)", note: "Le roman qui a fait de Musashi un héros populaire. Romancé, mais magnifique." },
    { label: "Takehiko Inoue, Vagabond (manga)", note: "L'adaptation dessinée du roman de Yoshikawa, l'un des plus beaux traits du manga." },
    { label: "Hiroshi Inagaki, La Trilogie Samouraï (1954-1956)", note: "Les films, avec Toshirō Mifune en Musashi." },
    { label: "Le Hagakure et le Bushidō, dans cette même salle", note: "D'autres voix du Japon des samouraïs, qui ne disent pas tout à fait la même chose." },
  ],
  text: String.raw`
# La grotte

J'écris dans une grotte. Elle s'appelle Reigandō, la grotte de l'Esprit du rocher. Elle est creusée dans une falaise, au-dessus de Kumamoto, dans l'île de Kyūshū, et l'on y voit au loin la mer. On y vénère une statue de la déesse Kannon. Je viens ici pour écrire. Nous sommes en l'an 1645. Je suis né, je crois, en 1584. J'ai soixante ans. Je sais que je vais mourir cette année.

Je m'appelle Shinmen Musashi no Kami Fujiwara no Genshin, mais on m'appelle Miyamoto Musashi. Depuis ma jeunesse, je me suis consacré à la voie du sabre. J'ai combattu en duel plus de soixante fois, de treize à vingt-neuf ans, et je n'ai jamais été vaincu. Puis j'ai compris que ces victoires ne prouvaient rien. Je me suis demandé si je gagnais parce que j'avais atteint la vraie voie, ou parce que j'avais de la chance, un don naturel, ou des adversaires médiocres. J'ai passé les trente années suivantes à chercher la réponse. Je crois l'avoir trouvée vers cinquante ans. C'est ce que j'écris ici.

Je ne cite aucun livre, ni de Bouddha, ni de Confucius, ni des vieux récits de guerre. Je n'emprunte pas. J'écris ce que j'ai éprouvé. J'ai appelé ce livre Go rin no sho, le Livre des cinq anneaux, parce que j'y suis l'ordre des cinq éléments : la Terre, l'Eau, le Feu, le Vent et le Vide.

Je vais te dire d'abord ma vie, telle que je m'en souviens. Puis ce qu'elle m'a appris.

# De treize à vingt-neuf ans

Je suis né dans la province de Harima, ou de Mimasaka, on ne sait plus très bien. Mon père, Shinmen Munisai, était un maître d'armes, réputé pour le jitte, une arme de fer à crochet. Il était dur. On raconte qu'il a voulu me tuer une fois, quand j'étais enfant, parce que je me moquais de sa technique. Je ne sais pas si c'est vrai. Je sais que j'ai grandi loin de lui, chez un oncle moine.

À treize ans, j'ai tué mon premier homme. Il s'appelait Arima Kihei, un samouraï de l'école Shintō, qui avait planté un écriteau dans mon village pour défier quiconque voulait l'affronter. J'ai écrit mon nom dessous. Mon oncle a voulu présenter des excuses à ma place. Kihei est venu. Je l'ai attendu avec un bâton. Je l'ai jeté à terre et je l'ai frappé à la tête jusqu'à ce qu'il meure. J'étais un enfant. Je n'ai pas eu peur. Je ne te raconte pas cela pour que tu l'admires.

À seize ans, j'ai vaincu un autre adepte. Puis je suis parti. J'avais vingt et un ans quand je suis monté à Kyōto, la capitale. C'était l'époque où le Japon sortait d'un siècle de guerres civiles. La bataille de Sekigahara, en 1600, venait de donner le pays aux Tokugawa. Des dizaines de milliers de samouraïs se retrouvaient sans maître, des rōnin. Beaucoup cherchaient à se faire un nom par les armes, pour être engagés par un seigneur. J'étais l'un d'eux.

À Kyōto vivait une famille célèbre, les Yoshioka, maîtres d'armes des shoguns Ashikaga depuis des générations. J'ai défié le chef de la maison, Yoshioka Seijūrō. Je l'ai battu d'un coup de sabre de bois. Son frère, Denshichirō, a voulu le venger. Je l'ai tué. Alors la famille a désigné comme champion le jeune fils de Seijūrō, Matashichirō, un enfant, et ses disciples sont venus en nombre, avec des arcs et des lances, pour me tuer au pied d'un pin, à Ichijōji. Je suis arrivé avant eux. Je me suis caché. Quand ils ont été en place, j'ai surgi, j'ai tué l'enfant, et je me suis frayé un chemin à travers eux. Après ce jour, la maison Yoshioka n'a plus enseigné le sabre.

J'ai erré ensuite à travers le Japon, de province en province, d'école en école. J'ai affronté des maîtres de la lance, de la chaîne et de la faucille, du bâton. J'apprenais de chacun ce qui le faisait gagner, et ce qui le faisait perdre.

Le combat dont on parle le plus eut lieu en 1612, sur une petite île du détroit de Kanmon, entre Honshū et Kyūshū. Mon adversaire s'appelait Sasaki Kojirō. Il était le maître d'armes du seigneur Hosokawa, célèbre pour une technique qu'on appelait l'hirondelle retournée, et pour un sabre extraordinairement long, qu'il appelait le séchoir à perches.

Je suis arrivé en retard. Très en retard. On a dit que je l'avais fait exprès, pour l'impatienter. Pendant la traversée en barque, j'ai taillé dans une rame un sabre de bois plus long que le sien. Quand j'ai sauté sur le sable, Kojirō m'attendait, furieux. Il a tiré son sabre et jeté le fourreau dans l'eau. Je lui ai dit qu'il avait perdu, puisque celui qui gagne remet son sabre au fourreau. Il s'est jeté sur moi. Je l'ai frappé à la tête avec la rame. Il est tombé. Son sabre avait coupé le bandeau qui serrait mon front. Je suis remonté dans la barque et je suis parti.

Les récits ont tout grossi, comme ils le font. On a raconté ce duel de cent manières, dans des pièces, des romans, des films. Le cœur en est vrai : un homme long, brillant, sûr de son art, et un autre qui avait compris que le combat commence bien avant le premier coup. Le soleil dans le dos de l'un, l'impatience de l'autre, le choix de l'arme, l'heure : tout cela fait partie du sabre.

Après ce combat, j'ai cessé les duels à mort. J'avais vingt-neuf ans.

# L'encre

Les années suivantes, je les ai passées à chercher pourquoi j'avais gagné. J'ai servi des seigneurs, j'ai conseillé, j'ai enseigné. J'ai adopté des fils, deux jeunes gens que j'ai élevés. L'un, Mikinosuke, s'est donné la mort à la mort de son seigneur, comme le voulait encore la coutume, pour le suivre. L'autre, Iori, est devenu un haut fonctionnaire au service d'un daimyō. En 1638, j'ai pris part, aux côtés de mon fils Iori, à la répression de la révolte de Shimabara, où des paysans chrétiens s'étaient soulevés contre leur seigneur. Une pierre lancée du haut des remparts m'a blessé à la jambe. Il n'y avait pas de gloire dans cette guerre.

En 1640, le seigneur Hosokawa Tadatoshi m'a invité à Kumamoto. C'était la maison même que servait Kojirō, autrefois. J'y ai vécu mes dernières années, comme hôte, avec une pension. J'enseignais, je causais avec le seigneur, qui aimait la voie du sabre, et je peignais.

Car je peins. Il faut que tu le saches, parce qu'on l'oublie. J'ai peint à l'encre de Chine sur du papier et sur de la soie : des oiseaux, des bambous, Daruma, le moine qui a apporté le zen, des paysages. Le plus connu de mes tableaux montre une pie-grièche posée sur une branche morte, une seule branche fine et droite qui monte à travers le vide, et l'oiseau, immobile, au sommet, qui attend. On l'a classé, de nos jours, parmi les biens culturels importants du Japon. J'ai aussi sculpté, travaillé le métal, écrit des poèmes, fait de la calligraphie.

On me demande souvent comment un tueur peut peindre des oiseaux. Je réponds que c'est la même chose. Quand je trace une branche d'un seul trait, je ne peux pas revenir en arrière. Il faut que le pinceau parte au bon moment, à la bonne vitesse, avec la bonne pression, et qu'il ne s'arrête pas. Si je pense à la branche pendant que je la trace, elle tremble. C'est exactement ce qui se passe avec le sabre. Celui qui a compris une voie à fond comprend toutes les autres. C'est ce que je voulais dire dans mon livre : quand on connaît vraiment une chose, on en reconnaît dix mille.

# Les cinq anneaux, et la voie à suivre seul

Voici ce que j'ai écrit dans la grotte. Je te le dis avec mes mots, pas avec ceux du livre, pour que tu en sentes le sens.

Le rouleau de la Terre parle de la voie en général. Il compare l'homme d'armes au charpentier : celui qui construit une maison doit connaître ses outils, choisir les bons bois, mettre chaque homme à la place qui lui convient. Il faut voir l'ensemble avant le détail. J'y dis aussi qu'il faut se familiariser avec toutes les armes, sans préférer l'une d'elles, et qu'il ne faut rien faire d'inutile.

Le rouleau de l'Eau parle de la technique de mon école, qu'on appelle Niten Ichi-ryū, l'école des deux ciels. On y tient deux sabres à la fois, le long et le court, un dans chaque main. Les guerriers portent deux sabres toute leur vie ; il est absurde de n'en utiliser qu'un et de mourir avec l'autre au fourreau. Mais je dis surtout que l'esprit doit être comme l'eau, qui prend la forme de son récipient, qui peut être une goutte ou un océan. J'y parle de la posture, du regard, qui doit voir loin et près à la fois, sans fixer l'arme de l'adversaire. J'y dis qu'on doit garder dans le combat le même esprit que dans la vie de tous les jours, et dans la vie de tous les jours le même esprit que dans le combat.

Le rouleau du Feu parle du combat lui-même. De l'endroit où se placer, le soleil dans le dos. Du moment, qui est tout. De l'art de prendre l'initiative, de deviner l'intention de l'autre, de le faire chanceler, de l'effrayer, de l'irriter, de le désorienter. J'y dis que les principes qui valent pour un combat d'homme à homme valent pour une bataille de dix mille hommes.

Le rouleau du Vent parle des autres écoles. Le vent, au Japon, veut dire aussi le style, la manière. J'y critique ceux qui préfèrent les sabres très longs, ceux qui ne jurent que par la force, ceux qui accumulent les techniques secrètes, les postures compliquées, les gestes pour la parade. La vraie voie est simple.

Et le rouleau du Vide est le plus court. Le vide, c'est ce qui n'a pas de forme, ce qu'on ne peut pas connaître. Quand on a appris toutes les techniques, qu'on les a pratiquées jusqu'à ce qu'elles disparaissent dans le corps, l'esprit devient clair, sans nuage, et l'on agit sans hésitation. Le vide n'est pas l'ignorance. C'est ce qui reste quand on a tout appris et tout oublié.

Le livre est fini. Je l'ai confié à un disciple, Terao Magonojō. Je suis malade. Le seigneur Hosokawa est mort, son fils m'a ramené de la grotte à Kumamoto.

Une semaine avant de mourir, j'ai écrit une dernière feuille. Vingt et une lignes. On l'a appelée Dokkōdō, la voie à suivre seul. Ce sont des règles pour moi-même, pas pour les autres. Je les résume ici. Ne va pas contre l'ordre du monde. Ne cherche pas le plaisir pour lui-même. Ne te laisse pas aller à l'envie. Ne regrette rien de ce que tu as fait. N'éprouve ni envie ni ressentiment. Ne te lamente pas d'une séparation. Ne t'attache à aucun bien au point d'en dépendre. Respecte les dieux et les bouddhas, sans compter sur eux. Ne renonce jamais à la voie, même au prix de la vie.

Je suis mort en mai 1645, à Kumamoto. On raconte que je me suis fait habiller en armure pour mourir, et qu'on m'a enterré ainsi, en tenue de combat, au bord de la route, tourné vers la capitale du shogun. Je ne sais pas. Je sais que je n'ai jamais eu de maison à moi, ni femme, ni maître que je n'ai choisi.

# Ce que tu peux en prendre

Trois siècles plus tard, un romancier, Eiji Yoshikawa, a fait de ma vie un grand roman, La Pierre et le Sabre, où je deviens un jeune homme sauvage qui apprend la sagesse auprès d'un moine et l'amour auprès d'une femme qui m'attend. Presque tout y est inventé, et presque tout le monde au Japon le croit. Un dessinateur, Takehiko Inoue, en a fait un manga, Vagabond, où l'on me voit chercher la voie avec un trait d'encre qui ressemble à celui que je cherchais moi-même. Des millions de gens me connaissent par eux. Ce n'est pas grave. Ils ont compris l'essentiel.

Je te laisse trois choses.

La première : quand on connaît vraiment une chose, on en reconnaît dix mille. Ne te disperse pas. Choisis une voie, la tienne, et suis-la jusqu'au bout, avec une discipline de tous les jours. C'est par elle que tu comprendras les autres. Le cinéaste qui maîtrise le cadre comprend la peinture ; le danseur comprend le combat ; le calligraphe comprend le montage.

La deuxième : le combat se gagne avant le premier coup. Le lieu, l'heure, la lumière, l'arme, l'état d'esprit de l'autre. Ceux qui ne pensent qu'à la technique perdent contre ceux qui pensent à tout le reste. Prépare tes projets comme on prépare un duel.

La troisième : ne fais rien d'inutile. Pas de geste pour la parade, pas de posture pour être vu. Un seul trait, au bon moment. C'est vrai pour le sabre, pour l'encre, et pour une image.
`,
};
export default book;
