/* ============ CONTENU : FONDATIONS ============ */
const toBin=s=>[...s].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
const toHex=s=>[...s].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ');
function rng(seed){return ()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff}}
const MODULES=[];
const TERMS={};

/* Terminaux de démonstration (dans les leçons) */
TERMS.sandbox={user:'recrue',host:'labo',motd:'<span class="hl">Bac à sable libre.</span> <span class="dim">Rien ne peut casser ici. Commence par :</span> cat LISEZMOI.txt',
fs:{
'/home/recrue/LISEZMOI.txt':'Bienvenue dans ton bac à sable !\nEssaie ces commandes, une par une :\n  ls          (liste les fichiers)\n  ls -a       (montre aussi les fichiers caches)\n  cat notes.txt\n  cd Documents  puis  ls  puis  cd ..\n  help        (toutes les commandes)\nAmuse-toi. Il y a peut-etre des choses cachees...',
'/home/recrue/notes.txt':'Mes notes :\n- un octet = 8 bits\n- root = le chef sous Linux\n- toujours lire le code source d\'une page',
'/home/recrue/Documents/devoir_maths.txt':'Exercice 3 page 42.',
'/home/recrue/Documents/idees.txt':'Idees de projet : un site pour ma classe ?',
'/home/recrue/Images/plage.jpg':'\xff\xd8\xff photo',
'/home/recrue/.coffre/tresor.txt':'Tu as trouve un fichier cache ! Bravo.\nLes fichiers qui commencent par un point sont invisibles avec un simple "ls".\nPetit cadeau : HL{tu_sais_deja_fouiller}'
}};

/* ---------- MODULE 0 : DÉMARRAGE ---------- */
MODULES.push({id:'m0',titre:'Démarrage',cat:'Les bases',badge:'Recrue officielle',
desc:'Ce qu\'est un hacker éthique, ce qu\'est un CTF, et comment apprendre efficacement.',
intro:'<p>Avant d\'apprendre à ouvrir des serrures, on apprend les règles du jeu : le métier, la loi, et la méthode qui marche vraiment.</p>',
lessons:[
{id:'m0l1',titre:'Un hacker éthique, c\'est quoi ?',duree:'10 min',
contenu:`
<p>Quand on dit « hacker », on imagine un voleur en capuche. En vrai, un hacker c'est d'abord <b>quelqu'un de curieux qui veut comprendre comment les choses marchent</b>, pour trouver ce qui est cassé.</p>
<div class="box kid"><b>Explication simple</b><p>Imagine une maison. Le cambrioleur cherche une fenêtre mal fermée pour voler. Le <b>serrurier-testeur</b>, lui, est payé par le propriétaire pour chercher la même fenêtre, puis il dit : « Celle-ci ferme mal, répare-la. » Mêmes compétences. La différence : l'<b>autorisation</b> et l'<b>intention</b>.</p></div>
<h2>Les trois chapeaux</h2>
<div class="tablewrap"><table><tr><th>Chapeau</th><th>Qui ?</th><th>Légal ?</th></tr>
<tr><td><b>Blanc</b></td><td>Le hacker éthique : il teste avec permission écrite et aide à se protéger. Ton objectif.</td><td>Oui</td></tr>
<tr><td><b>Noir</b></td><td>Le cybercriminel : il attaque sans permission pour voler ou détruire.</td><td>Non</td></tr>
<tr><td><b>Gris</b></td><td>Il attaque sans permission, même « pour aider ». Ça reste illégal.</td><td>Non</td></tr></table></div>
<div class="box warn"><b>La règle d'or, pour toujours</b><p>On ne touche <b>jamais</b> à un système sans autorisation écrite. Au Bénin, le <b>Code du numérique</b> (loi n° 2017-20) punit l'accès frauduleux à un système, même sans rien voler. « Juste pour voir » n'est pas une excuse devant un juge. On s'entraîne uniquement sur des terrains prévus pour ça : cette plateforme, le HackerLab, TryHackMe, Root-Me, Hack The Box.</p></div>
<h2>Les métiers</h2>
<ul>
<li><b>Pentesteur</b> (équipe rouge) : attaque les entreprises qui le paient pour trouver leurs failles.</li>
<li><b>Analyste SOC</b> (équipe bleue) : surveille et repère les attaques en direct.</li>
<li><b>Analyste forensic</b> : enquête après une attaque, comme la police scientifique.</li>
<li><b>Chasseur de bugs</b> : trouve des failles et touche une récompense (bug bounty).</li>
</ul>
<p>Tous commencent par les mêmes bases — celles de cette plateforme. Cadeau de bienvenue, ton premier flag : <b class="mono" style="color:var(--accent)">HL{bienvenue_recrue}</b>.</p>
`,
quiz:[
{q:'La vraie différence entre hacker éthique et cybercriminel ?',o:['Le niveau technique','L\'autorisation et l\'intention','Le système d\'exploitation','Aucune'],a:1,w:'Mêmes compétences possibles. Ce qui compte : permission écrite et but.'},
{q:'Un ami te dit « pirate le Wi-Fi de l\'école, juste pour voir ». Tu fais quoi ?',o:['J\'essaie si je ne casse rien','Je refuse : sans autorisation écrite, c\'est illégal','La nuit pour ne pas être vu','Je demande à quelqu\'un d\'autre'],a:1},
{q:'Où as-tu le droit de t\'entraîner à attaquer ?',o:['Le site de ma banque','Les plateformes et CTF prévus pour ça','Le téléphone de mon frère','N\'importe quel site mal protégé'],a:1},
{q:'L\'équipe qui défend et surveille s\'appelle...',o:['Rouge','Bleue','Verte','Noire'],a:1}],
chal:{titre:'Ton premier flag',xp:20,niveau:'très facile',enonce:'<p>Un <b>flag</b> (drapeau), c\'est un texte secret qui prouve que tu as réussi. Ici ils ressemblent toujours à <code>HL{...}</code>. Celui-ci est écrit dans le cours ci-dessus. Trouve-le et valide-le.</p>',flag:'HL{bienvenue_recrue}',hints:['Relis la toute dernière phrase du cours, juste avant le quiz.'],bravo:'Premier drapeau capturé !'}},

{id:'m0l2',titre:'C\'est quoi un CTF ?',duree:'12 min',
contenu:`
<p><b>CTF</b> = <i>Capture The Flag</i>, « capture le drapeau ». Les organisateurs cachent des flags dans des systèmes volontairement faibles ; chaque flag trouvé rapporte des points. Le <b>HackerLab</b> est exactement ça : un CTF national organisé par l'ASIN, sur 48h, avec une qualification en ligne (souvent en juin) puis une finale à Cotonou.</p>
<div class="box kid"><b>Explication simple</b><p>Une chasse au trésor géante. Chaque trésor (flag) est enfermé derrière une énigme : un message chiffré, un fichier bizarre, un détail que personne ne regarde. Ton travail : trouver la clé.</p></div>
<h2>Les catégories</h2>
<div class="tablewrap"><table><tr><th>Catégorie</th><th>Ce que tu fais</th></tr>
<tr><td><b>Crypto / encodage</b></td><td>Casser des codes, décoder des messages</td></tr>
<tr><td><b>Réseau</b></td><td>Scanner, analyser des échanges entre machines</td></tr>
<tr><td><b>Forensic</b></td><td>Enquêter sur des fichiers, des journaux, des images</td></tr>
<tr><td><b>Web</b></td><td>Comprendre et tester des sites</td></tr>
<tr><td><b>Système (Linux)</b></td><td>Se repérer et fouiller une machine</td></tr>
<tr><td><b>OSINT</b></td><td>Retrouver des infos publiques sur une cible</td></tr></table></div>
<h2>Le réflexe numéro 1 : tout regarder</h2>
<p>Dans un CTF, les secrets se cachent partout : dans un fichier invisible, dans une couleur de texte, dans des métadonnées. Le hacker regarde ce que les autres ne regardent pas.</p>
<div class="box"><b>Un message presque vide</b><p>Cette fin de paragraphe semble vide, et pourtant... <span style="color:var(--panel)">Bravo, tu as surligné ! Ton flag : HL{surligne_pour_voir}</span></p></div>
`,
quiz:[
{q:'CTF veut dire...',o:['Code To Fight','Capture The Flag','Cyber Test Format','Computer Terminal Force'],a:1},
{q:'Le HackerLab dure...',o:['1 heure','48 heures','1 mois','toute l\'année'],a:1},
{q:'Décoder un message secret, c\'est quelle catégorie ?',o:['Forensic','Crypto / encodage','OSINT','Réseau'],a:1},
{q:'Le réflexe numéro 1 du hacker dans un CTF ?',o:['Tout casser','Regarder ce que les autres ne regardent pas','Aller vite','Copier les autres'],a:1}],
chal:{titre:'L\'encre invisible',xp:25,niveau:'facile',enonce:'<p>Dans le cours, l\'encadré « Un message presque vide » cache un flag écrit de la même couleur que le fond. Trouve un moyen de le lire.</p>',flag:'HL{surligne_pour_voir}',hints:['Le texte est là, juste invisible car même couleur que le fond.','Sélectionne (surligne) la zone après « et pourtant... » avec la souris, comme pour copier. Sur téléphone : appui long.'],bravo:'Ne jamais faire confiance à ce que l\'on voit : premier réflexe acquis.'}},

{id:'m0l3',titre:'Ton labo et ta méthode',duree:'15 min',
contenu:`
<p>Pour commencer, cette plateforme suffit : tout tourne dans ton navigateur. Plus tard, tu monteras le vrai labo des pros.</p>
<h2>La machine virtuelle (VM)</h2>
<div class="box kid"><b>Explication simple</b><p>Une VM, c'est un <b>ordinateur dans ton ordinateur</b> : comme une maison de poupée dans ta chambre. Tu peux tout casser dedans sans danger pour ta vraie machine. Une bêtise ? Tu restaures une « photo » (snapshot) et c'est réparé.</p></div>
<p><b>Kali Linux</b> est un système rempli d'outils de sécurité. Tu l'installeras dans <b>VirtualBox</b> (gratuit). Il te faut idéalement 8 Go de RAM et 40 Go libres. Pas de bon PC ? Les salles en ligne de TryHackMe (« AttackBox ») et Hack The Box (« Pwnbox ») te donnent un Kali dans le navigateur.</p>
<h2>La méthode qui marche</h2>
<ol>
<li><b>Un peu chaque jour</b> vaut mieux que 8h le dimanche. Vise 1h/jour : ton cerveau a besoin de dormir sur ce qu'il apprend.</li>
<li><b>Essaie avant de regarder la solution.</b> Bloquer 20 minutes est normal : c'est là que tu apprends. Ensuite seulement, un indice.</li>
<li><b>Prends des notes</b> (en bas de chaque leçon). Le jour J, tes notes seront ton arme.</li>
<li><b>Lis les writeups</b> (solutions écrites par d'autres joueurs) après chaque challenge.</li>
<li><b>Apprends à chercher</b> : copier une erreur dans Google, lire <code>man commande</code>. C'est 50 % du métier.</li>
<li><b>Apprends l'anglais technique</b> : presque toute la doc est en anglais.</li></ol>
<div class="box kid"><b>Le secret</b><p>Les meilleurs ne sont pas des génies. Ce sont des gens qui ont <b>bloqué des centaines de fois</b> sans abandonner. Chaque blocage te rend plus fort.</p></div>
`,
quiz:[
{q:'Pourquoi s\'entraîner dans une VM ?',o:['C\'est plus rapide','Si on casse quelque chose, la vraie machine ne risque rien','C\'est obligatoire pour Internet','Pour cacher son IP'],a:1},
{q:'Kali Linux, c\'est...',o:['Un antivirus','Un système rempli d\'outils de sécurité','Un jeu','Un site de cours'],a:1},
{q:'Tu bloques depuis 5 minutes. Meilleure réaction ?',o:['Voir la solution tout de suite','Chercher encore, relire mes notes, Google, puis un indice si besoin','Abandonner','Changer de domaine'],a:1},
{q:'Le meilleur rythme pour apprendre ?',o:['8h le dimanche','Un peu chaque jour','Une fois par mois','La nuit entière'],a:1}]}
]});

/* ---------- MODULE 1 : BINAIRE / HEXA / ASCII ---------- */
MODULES.push({id:'m1',titre:'Le langage des machines',cat:'Fondations',badge:'Cerveau binaire',
desc:'Binaire, hexadécimal et ASCII : lire ce que l\'ordinateur comprend vraiment.',
intro:'<p>Un ordinateur ne connaît que des 0 et des 1. Sais lire ce langage, et une grande partie des challenges de crypto deviendront des jeux d\'enfant.</p>',
lessons:[
{id:'m1l1',titre:'Le binaire : 0 et 1',duree:'15 min',
contenu:`
<div class="box kid"><b>Explication simple</b><p>Un ordinateur, c'est des milliards de minuscules interrupteurs, chacun <b>éteint (0)</b> ou <b>allumé (1)</b>. Un interrupteur = un <b>bit</b>. Huit bits côte à côte = un <b>octet</b> (en anglais <i>byte</i>).</p></div>
<h2>Compter avec des lampes</h2>
<p>De droite à gauche, chaque lampe vaut 1, 2, 4, 8, 16, 32, 64, 128 (chaque fois le double). Pour lire un nombre, on additionne les lampes allumées. Exemple : <code>00000101</code> → lampes 4 et 1 → 4+1 = <b>5</b>. Joue avec :</p>
<div data-widget="lamps"></div>
<p>Le plus grand octet, <code>11111111</code> = 255. Un octet va donc de 0 à 255 — un nombre que tu reverras partout (ex : 192.168.1.<b>255</b>).</p>
<h2>Et les lettres ?</h2>
<p>La table <b>ASCII</b> donne un numéro à chaque caractère : <code>A</code>=65, <code>a</code>=97, <code>{</code>=123. Pour écrire « H », l'ordinateur stocke 72 = <code>01001000</code>.</p>
<div class="box pro"><b>Astuce de pro</b><p>Un texte en binaire se reconnaît vite : que des 0 et des 1, souvent par paquets de 8. Réflexe : le convertir dans le <a href="#labo">Labo</a> (« Binaire → texte »).</p></div>
`,
quiz:[
{q:'00001010 en décimal ?',o:['10','2','8','12'],a:0,w:'8+2 = 10.'},
{q:'Combien de bits dans un octet ?',o:['4','8','10','16'],a:1},
{q:'Plus grand nombre sur un octet ?',o:['128','256','255','1000'],a:2,w:'11111111 = 255.'},
{q:'La lettre A en ASCII vaut...',o:['1','65','97','100'],a:1}],
chal:{titre:'Message des machines',xp:30,niveau:'facile',enonce:`<p>Message intercepté, écrit en binaire :</p><pre style="white-space:pre-wrap">${toBin('HL{binaire_maitrise}')}</pre><p>Décode-le. À la main avec la table ASCII (courage !) ou via le <a href="#labo">Labo</a>.</p>`,flag:'HL{binaire_maitrise}',hints:['Chaque groupe de 8 chiffres = une lettre. 01001000 = 64+8 = 72 = « H ».','Labo (menu de gauche) → colle tout → opération « Binaire → texte ».']}},

{id:'m1l2',titre:'L\'hexadécimal',duree:'15 min',
contenu:`
<p>Le binaire est long à écrire. On utilise donc l'<b>hexadécimal</b> (base 16).</p>
<div class="box kid"><b>Explication simple</b><p>On compte en base 10 car on a 10 doigts. L'hexa compte avec <b>16 chiffres</b> : 0-9 puis A B C D E F. Donc A=10, B=11... F=15. Et « 10 » en hexa vaut 16.</p></div>
<p>Un chiffre hexa = 4 bits. Donc un octet = toujours <b>2 chiffres hexa</b>, de <code>00</code> à <code>FF</code> (255).</p>
<div class="tablewrap"><table><tr><th>Car.</th><th>Décimal</th><th>Binaire</th><th>Hexa</th></tr>
<tr><td class="mono">H</td><td>72</td><td class="mono">0100 1000</td><td class="mono">48</td></tr>
<tr><td class="mono">L</td><td>76</td><td class="mono">0100 1100</td><td class="mono">4C</td></tr>
<tr><td class="mono">{</td><td>123</td><td class="mono">0111 1011</td><td class="mono">7B</td></tr></table></div>
<p>Retiens <code>48 4C 7B</code> = début d'un flag <code>HL{</code> en hexa. Si tu vois ça dans un fichier, tu tiens quelque chose !</p>
<h2>Où on croise l'hexa</h2>
<ul><li>Couleurs web : <code>#FCD116</code> (le jaune du drapeau !).</li>
<li>Adresses MAC : <code>00:1A:2B:3C:4D:5E</code>.</li>
<li>Contenu brut des fichiers (commande <code>xxd</code>, en forensic).</li>
<li>Adresses mémoire : <code>0x401000</code> (le <code>0x</code> signifie « hexa »).</li></ul>
`,
quiz:[
{q:'Combien vaut F en hexa ?',o:['6','15','16','pas un chiffre'],a:1},
{q:'Combien de chiffres hexa pour un octet ?',o:['1','2','4','8'],a:1},
{q:'Le préfixe 0x signifie...',o:['nombre négatif','le nombre est en hexadécimal','une adresse IP','une erreur'],a:1},
{q:'48 4C 7B correspond à...',o:['ABC','HL{','123','hl}'],a:1}],
chal:{titre:'Le coffre hexadécimal',xp:30,niveau:'facile',enonce:`<p>Suite d'octets trouvée dans un fichier :</p><pre style="white-space:pre-wrap">${toHex('HL{hexa_des_paires}')}</pre><p>Retrouve le texte caché.</p>`,flag:'HL{hexa_des_paires}',hints:['Chaque paire = une lettre : 48=H, 4c=L, 7b={.','Labo → « Hexadécimal → texte ».']}},

{id:'m1l3',titre:'Dans la machine',duree:'12 min',
contenu:`
<div class="box kid"><b>L'ordinateur est un restaurant</b><p>Le <b>processeur (CPU)</b> est le cuisinier : il calcule très vite. La <b>RAM</b> est le plan de travail : rapide mais petit, vidé quand on éteint. Le <b>disque dur</b> est le frigo : grand, et tout y reste la nuit. Le <b>système d'exploitation</b> (Windows, Linux) est le chef de salle. Les <b>programmes</b> sont les recettes.</p></div>
<h2>Système d'exploitation (OS)</h2>
<ul><li><b>Windows</b> : le plus répandu sur les PC de bureau.</li>
<li><b>Linux</b> : gratuit, sur plus de 90 % des serveurs web et sur Android. C'est pour ça qu'on l'apprend en premier.</li>
<li><b>macOS</b> : Apple.</li></ul>
<h2>Processus et utilisateurs</h2>
<p>Un <b>processus</b> = un programme en train de tourner. Chaque processus appartient à un <b>utilisateur</b>, qui décide de ses droits. Sous Linux, le super-utilisateur s'appelle <b>root</b> (tous les droits). Sous Windows : <b>Administrateur</b>.</p>
<h2>Les fichiers</h2>
<p>Tout est rangé dans des <b>dossiers</b> emboîtés comme des poupées russes. Le nom complet d'un fichier = son <b>chemin</b> : <code>/home/recrue/notes.txt</code> (Linux) ou <code>C:\\Users\\recrue\\notes.txt</code> (Windows).</p>
`,
quiz:[
{q:'Quelle pièce perd son contenu quand on éteint ?',o:['Le disque dur','La RAM','Le processeur','La clé USB'],a:1},
{q:'Sous Linux, l\'utilisateur tout-puissant s\'appelle...',o:['admin','root','boss','system'],a:1},
{q:'Pourquoi apprendre Linux en premier ?',o:['Seul système existant','La majorité des serveurs web tournent dessus','Windows est interdit','Linux n\'a pas de fichiers'],a:1},
{q:'Le chemin complet d\'un fichier sous Linux ressemble à...',o:['C:\\dossier','/home/recrue/notes.txt','www.site.com','HL{...}'],a:1}]}
]});

/* ---------- MODULE 2 : LINUX & TERMINAL ---------- */
function mazeFS(){const f={
'/home/recrue/LISEZMOI.txt':'Mission : un flag est cache dans le dossier "maison".\nVisite les pieces avec cd et ls, lis les fichiers avec cat.\nRappel : cd .. pour remonter, cd ~ pour revenir ici.',
'/home/recrue/maison/salon/tele.txt':'Rien a la tele ce soir.',
'/home/recrue/maison/cuisine/frigo.txt':'Du jus de bissap. Pas de flag ici.',
'/home/recrue/maison/cave/carton.txt':'Il fait noir. Essaie plutot le grenier.',
'/home/recrue/maison/jardin/manguier.txt':'Les mangues ne sont pas mures.',
'/home/recrue/maison/grenier/poussiere.txt':'Atchoum ! Il y a une vieille malle dans le coin...',
'/home/recrue/maison/grenier/malle/jouets/flag.txt':'Bravo explorateur !\nHL{naviguer_comme_un_pirate}'
};return f}
function hiddenFS(){return{
'/home/recrue/LISEZMOI.txt':'Mission : quelqu\'un a cache un flag dans ton dossier.\nMais "ls" ne montre rien... Les fichiers caches commencent par un point.\nIndice : ls -a',
'/home/recrue/photos/plage.jpg':'\xff\xd8\xff photo',
'/home/recrue/.cache/vieux.txt':'Rate, ce n\'est que du cache.',
'/home/recrue/.secret/note.txt':'Tu chauffes ! Il y a encore plus cache ici. Refais ls -a dans ce dossier.',
'/home/recrue/.secret/.vraiment_cache/flag.txt':'HL{les_points_rendent_invisible}'
}}
function grepFS(){const f={'/home/recrue/LISEZMOI.txt':'Mission : 50 rapports sont dans le dossier "archives".\nUn seul contient le flag (il commence par HL{ ).\nLes ouvrir un par un serait trop long. Utilise grep !\nExemple : grep -r "HL{" archives'};
  const r=rng(7);const mots=['reunion','marche','Dantokpa','zemidjan','rapport','mission','RAS','calme','pluie','vehicule','bureau','livraison','surveillance','cible'];
  for(let i=1;i<=50;i++){let t=[];for(let j=0;j<4;j++)t.push(mots[Math.floor(r()*mots.length)]);
    f['/home/recrue/archives/rapport_'+String(i).padStart(2,'0')+'.txt']='Rapport n'+i+' : '+t.join(', ')+'. Fin.';}
  f['/home/recrue/archives/rapport_37.txt']='Rapport n37 : la cible a laisse tomber ce papier : HL{grep_cherche_partout}. Fin.';
  return f}
TERMS.demo2={user:'recrue',host:'labo',motd:'<span class="dim">Terminal de démonstration. Suis les instructions du cours.</span>',
fs:{'/home/recrue/bonjour.txt':'Salut ! Tu viens de lire un fichier avec cat. Bien joue.','/home/recrue/Documents/liste.txt':'lait, pain, bissap','/home/recrue/Images/':{}}};

MODULES.push({id:'m2',titre:'Linux et le terminal',cat:'Fondations',badge:'Maître du terminal',
desc:'Se déplacer, lire, chercher dans une machine Linux avec des commandes. La compétence la plus rentable.',
intro:'<p>Le terminal fait peur au début, puis devient ta super-puissance. Presque tous les serveurs du monde se pilotent comme ça. Ici tu t\'exerces dans un vrai terminal simulé, sans aucun risque.</p>',
lessons:[
{id:'m2l1',titre:'Le terminal, pourquoi et comment',duree:'15 min',
contenu:`
<div class="box kid"><b>Explication simple</b><p>Le terminal, c'est <b>parler à l'ordinateur en écrivant</b> au lieu de cliquer. Comme commander au comptoir d'un maquis en disant exactement ce que tu veux, au lieu de pointer du doigt. C'est plus rapide et plus précis, et ça marche même sans écran (sur un serveur à l'autre bout du monde).</p></div>
<h2>Comment ça marche</h2>
<p>Tu vois une invite : <code>recrue@labo:~$</code>. Le <code>~</code> veut dire « ton dossier personnel ». Tu tapes une commande, tu appuies sur <b>Entrée</b>, l'ordinateur répond.</p>
<h2>Tes 3 premières commandes</h2>
<ul><li><code>pwd</code> — « où suis-je ? » (affiche le dossier courant)</li>
<li><code>ls</code> — « qu'y a-t-il ici ? » (liste les fichiers)</li>
<li><code>cat fichier</code> — affiche le contenu d'un fichier</li></ul>
<p>Essaie dans ce terminal : tape <code>ls</code> puis Entrée, puis <code>cat bonjour.txt</code>.</p>
<div data-term="demo2"></div>
<div class="box pro"><b>Astuces qui changent la vie</b><p>Flèche <b>↑</b> = rappelle la commande précédente. Touche <b>Tab</b> = complète automatiquement un nom de fichier (tape <code>cat bon</code> puis Tab). <b>Ctrl+L</b> = efface l'écran.</p></div>
`,
quiz:[
{q:'Quelle commande affiche le dossier où tu te trouves ?',o:['ls','pwd','cd','cat'],a:1},
{q:'Pour voir le contenu du fichier notes.txt ?',o:['ls notes.txt','pwd notes.txt','cat notes.txt','cd notes.txt'],a:2},
{q:'La touche Tab sert à...',o:['effacer l\'écran','compléter automatiquement un nom','fermer le terminal','changer d\'utilisateur'],a:1},
{q:'Le symbole ~ désigne...',o:['la racine du disque','ton dossier personnel','un fichier caché','root'],a:1}]},

{id:'m2l2',titre:'Se déplacer : cd et ls',duree:'15 min',
contenu:`
<p>Les fichiers sont rangés dans des dossiers emboîtés. Pour te déplacer, tu utilises <code>cd</code> (change directory, « change de dossier »).</p>
<div class="tablewrap"><table><tr><th>Commande</th><th>Effet</th></tr>
<tr><td class="mono">cd Documents</td><td>entrer dans le dossier Documents</td></tr>
<tr><td class="mono">cd ..</td><td>remonter d'un niveau (dossier parent)</td></tr>
<tr><td class="mono">cd ~</td><td>revenir à ton dossier personnel</td></tr>
<tr><td class="mono">cd /</td><td>aller à la racine (tout en haut)</td></tr>
<tr><td class="mono">ls -l</td><td>liste détaillée (droits, taille)</td></tr></table></div>
<div class="box kid"><b>Image mentale</b><p>Pense à un immeuble. <code>cd</code> = prendre l'ascenseur vers un étage. <code>cd ..</code> = descendre d'un étage. <code>ls</code> = regarder ce qu'il y a sur le palier. <code>pwd</code> = lire le numéro de l'étage où tu es.</p></div>
<h2>À toi : la maison labyrinthe</h2>
<p>Dans ce terminal, explore le dossier <code>maison</code>. Commence par <code>cat LISEZMOI.txt</code>, puis balade-toi de pièce en pièce. (C'est aussi le challenge de cette leçon, plus bas — ce terminal est juste pour t'entraîner.)</p>
<div data-term="maze"></div>
`,
quiz:[
{q:'Quelle commande remonte au dossier parent ?',o:['cd ~','cd ..','cd /','ls'],a:1},
{q:'Tu es perdu. Comment revenir chez toi (dossier perso) ?',o:['cd ..','cd ~','pwd','ls -a'],a:1},
{q:'ls -l affiche...',o:['les fichiers cachés','une liste détaillée avec droits et taille','le dossier courant','le contenu d\'un fichier'],a:1},
{q:'Pour entrer dans le dossier "grenier" ?',o:['grenier','cd grenier','ls grenier','cat grenier'],a:1}],
chal:{titre:'La maison labyrinthe',xp:35,niveau:'facile',type:'term',term:{user:'recrue',host:'labo',motd:'<span class="hl">Trouve le flag cache dans la maison.</span> Commence par : cat LISEZMOI.txt',fs:mazeFS()},
enonce:'<p>Un flag est caché quelque part dans le dossier <code>maison</code>. Explore chaque pièce avec <code>cd</code> et <code>ls</code>, lis les fichiers avec <code>cat</code>. Suis les indices que tu trouves dans les fichiers !</p>',flag:'HL{naviguer_comme_un_pirate}',
hints:['cat LISEZMOI.txt pour la mission. Puis cd maison, ls.','Les fichiers te guident : « essaie le grenier ». Dans le grenier, cherche une malle.','Chemin : maison → grenier → malle → jouets → flag.txt. Donc : cat maison/grenier/malle/jouets/flag.txt'],bravo:'Tu sais naviguer dans un système Linux.'}},

{id:'m2l3',titre:'Les fichiers cachés',duree:'12 min',
contenu:`
<p>Sous Linux, un fichier dont le nom commence par un <b>point</b> est <b>caché</b> : <code>ls</code> ne le montre pas. Pour les voir tous, on ajoute l'option <code>-a</code> (all, « tout »).</p>
<div class="box kid"><b>Pourquoi ça existe ?</b><p>Au départ, c'était pour cacher les fichiers de réglages (pour ne pas encombrer l'affichage). Mais du coup, c'est aussi une cachette classique dans les CTF ! Ton réflexe en arrivant sur une machine : <code>ls -a</code>.</p></div>
<pre>recrue@labo:~$ ls
photos
recrue@labo:~$ ls -a
.   ..   .bashrc   .secret   photos</pre>
<p>Vois la différence ? <code>.bashrc</code> et <code>.secret</code> étaient cachés. Les deux premiers, <code>.</code> (dossier courant) et <code>..</code> (parent), apparaissent toujours avec <code>-a</code>.</p>
<div class="box pro"><b>Combiner les options</b><p>On peut cumuler : <code>ls -la</code> (ou <code>ls -al</code>) = liste détaillée ET fichiers cachés. Très utile.</p></div>
`,
quiz:[
{q:'Un fichier caché commence par...',o:['un chiffre','un point','une majuscule','HL'],a:1},
{q:'Quelle commande montre les fichiers cachés ?',o:['ls','ls -a','ls -l','cat'],a:1},
{q:'Que fait ls -la ?',o:['rien de spécial','liste détaillée + fichiers cachés','supprime les fichiers','cache les fichiers'],a:1},
{q:'Ton tout premier réflexe en arrivant sur une machine inconnue ?',o:['tout supprimer','ls -a pour voir ce qui est caché','éteindre','cd /'],a:1}],
chal:{titre:'Cache-cache',xp:35,niveau:'facile',type:'term',term:{user:'recrue',host:'labo',motd:'<span class="hl">Un flag est cache dans des dossiers invisibles.</span> cat LISEZMOI.txt',fs:hiddenFS()},
enonce:'<p>Un flag se cache dans un dossier invisible de ton dossier personnel. <code>ls</code> ne suffit pas : pense à <code>ls -a</code>, et recommence dans chaque dossier caché que tu trouves.</p>',flag:'HL{les_points_rendent_invisible}',
hints:['ls -a chez toi montre un dossier .secret','Entre dedans (cd .secret) puis refais ls -a : il y a ENCORE un dossier caché.','cat .secret/.vraiment_cache/flag.txt'],bravo:'Plus rien ne t\'échappe.'}},

{id:'m2l4',titre:'Chercher : grep et find',duree:'18 min',
contenu:`
<p>Quand il y a des centaines de fichiers, on ne les ouvre pas un par un. Deux commandes font le travail pour toi.</p>
<h2>grep : chercher un mot DANS les fichiers</h2>
<p><code>grep "mot" fichier</code> affiche les lignes qui contiennent « mot ». Options très utiles :</p>
<ul><li><code>-r</code> : cherche dans tous les fichiers d'un dossier (récursif)</li>
<li><code>-i</code> : ignore majuscules/minuscules</li>
<li><code>-n</code> : affiche le numéro de ligne</li></ul>
<div class="box kid"><b>Image simple</b><p><code>grep</code>, c'est le Ctrl+F d'un traitement de texte, mais pour des milliers de fichiers d'un coup. « Trouve-moi toutes les pages où apparaît ce mot. »</p></div>
<p>Dans un CTF, le flag commence toujours par <code>HL{</code>. Donc ce réflexe magique :</p>
<pre>grep -r "HL{" .</pre>
<p>« Cherche HL{ dans tous les fichiers à partir d'ici. » Souvent, ça trouve le flag directement.</p>
<h2>find : chercher un FICHIER par son nom</h2>
<p><code>find . -name "*.txt"</code> = « trouve tous les fichiers .txt à partir d'ici ». Le <code>*</code> remplace n'importe quoi.</p>
<div class="box pro"><b>À retenir</b><p><b>grep</b> cherche DEDANS (le contenu). <b>find</b> cherche le fichier (le nom). Entraîne-toi ci-dessous.</p></div>
<div data-term="grepdemo"></div>
`,
quiz:[
{q:'grep sert à...',o:['chercher un mot dans le contenu des fichiers','supprimer des fichiers','changer de dossier','lister les fichiers'],a:0},
{q:'Quel réflexe pour trouver un flag dans tous les fichiers ?',o:['ls -a','grep -r "HL{" .','cd /','pwd'],a:1},
{q:'find . -name "*.txt" trouve...',o:['le mot txt dans les fichiers','tous les fichiers dont le nom finit par .txt','le dossier txt','rien'],a:1},
{q:'L\'option -r de grep veut dire...',o:['rapide','récursif (dans tous les sous-dossiers)','rouge','renommer'],a:1}],
chal:{titre:'L\'aiguille dans la botte de foin',xp:40,niveau:'moyen',type:'term',term:{user:'recrue',host:'labo',motd:'<span class="hl">Un flag se cache dans l\'un des 50 rapports.</span> cat LISEZMOI.txt',fs:grepFS()},
enonce:'<p>50 rapports sont dans le dossier <code>archives</code>. Un seul contient le flag <code>HL{...}</code>. Les ouvrir un par un ? Non. Utilise <code>grep</code> pour le trouver en une commande.</p>',flag:'HL{grep_cherche_partout}',
hints:['grep cherche dans le contenu. Le flag commence par HL{','grep -r "HL{" archives','Le résultat te montre directement le fichier et la ligne.'],bravo:'grep + find : les deux outils que tu utiliseras dans chaque CTF.'}}
]});
TERMS.maze={user:'recrue',host:'labo',motd:'<span class="dim">Entraîne-toi à explorer. cat LISEZMOI.txt</span>',fs:mazeFS()};
TERMS.grepdemo={user:'recrue',host:'labo',motd:'<span class="dim">Entraîne-toi à grep/find. cat LISEZMOI.txt</span>',fs:grepFS()};
