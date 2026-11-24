/* ============ CONTENU : MODULES AVANCÉS 7 à 9 ============ */

/* ---------- MODULE 7 : WINDOWS & ACTIVE DIRECTORY ---------- */
function winFS(){return{
'/home/recrue/LISEZMOI.txt':'Analyse forensic d\'un poste Windows.\nOn a exporte l\'historique PowerShell d\'un administrateur distrait.\nUn secret (mot de passe tape en clair) s\'y cache. Retrouve-le.\nAstuce : grep cherche dans le contenu. Le flag commence par HL{.',
'/home/recrue/export/historique_powershell.txt':[
'PS C:\\> Get-Process',
'PS C:\\> cd C:\\Users\\Admin\\Documents',
'PS C:\\> Get-Content rapport.txt',
'PS C:\\> $cred = "Administrateur"',
'PS C:\\> net use \\\\SRV-FICHIERS\\partage /user:Administrateur HL{powershell_garde_tout_en_memoire}',
'PS C:\\> Clear-Host',
'PS C:\\> dir',
'PS C:\\> exit'
].join('\n'),
'/home/recrue/export/services.txt':'Liste des services Windows... (rien d\'interessant ici)',
'/home/recrue/export/reseau.txt':'Adresse IP : 10.0.0.42\nPasserelle : 10.0.0.1\nDomaine : ECOLE.LOCAL'
}}
MODULES.push({id:'m7',titre:'Windows & Active Directory',cat:'Aller plus loin',badge:'Connaisseur Windows',
desc:'Comprendre Windows de l\'intérieur et Active Directory, la cible n°1 des entreprises.',
intro:'<p>Les serveurs tournent sous Linux, mais les postes de travail des entreprises tournent sous Windows, reliés par Active Directory. Savoir comment ça marche est indispensable, car c\'est là que se jouent la plupart des vraies attaques.</p>',
lessons:[
{id:'m7l1',titre:'Windows de l\'intérieur',duree:'15 min',
contenu:`
<p>Tu connais Linux (dossiers depuis <code>/</code>, l'utilisateur <b>root</b>). Windows s'organise autrement, et le hacker doit parler les deux langues.</p>
<div class="tablewrap"><table><tr><th>Idée</th><th>Linux</th><th>Windows</th></tr>
<tr><td>Racine des fichiers</td><td class="mono">/</td><td class="mono">C:\\</td></tr>
<tr><td>Dossier perso</td><td class="mono">/home/nom</td><td class="mono">C:\\Users\\nom</td></tr>
<tr><td>Super-utilisateur</td><td>root</td><td>Administrateur / SYSTEM</td></tr>
<tr><td>Terminal</td><td>bash</td><td>cmd et PowerShell</td></tr>
<tr><td>Programmes</td><td>fichiers ELF</td><td>fichiers .exe</td></tr></table></div>
<div class="box kid"><b>Le registre, c'est quoi ?</b><p>Windows range tous ses réglages dans une énorme base appelée le <b>registre</b> (comme un gigantesque carnet d'adresses du système). Logiciels installés, mots de passe en cache, réglages... Les enquêteurs forensic y trouvent des trésors, et on l'exporte souvent pour l'analyser.</p></div>
<h2>PowerShell : puissant et bavard</h2>
<p><b>PowerShell</b> est le terminal moderne de Windows, bien plus puissant que l'ancien <code>cmd</code>. Point crucial pour toi : il <b>garde un historique</b> de tout ce qui est tapé. Un administrateur qui tape un mot de passe en clair le laisse donc traîner dans un fichier d'historique — une mine d'or en forensic.</p>
<div class="box pro"><b>Commandes Windows utiles à connaître</b><p><code>whoami</code> (qui suis-je), <code>net user</code> (les comptes), <code>ipconfig</code> (le réseau, équivalent de <code>ip a</code>), <code>dir</code> (équivalent de <code>ls</code>), <code>type fichier</code> (équivalent de <code>cat</code>).</p></div>
`,
quiz:[
{q:'Le super-utilisateur sous Windows s\'appelle...',o:['root','Administrateur / SYSTEM','sudo','boss'],a:1},
{q:'Où Windows range-t-il tous ses réglages ?',o:['dans /etc','dans le registre','dans la RAM','nulle part'],a:1},
{q:'L\'équivalent Windows de la commande cat ?',o:['dir','type','ls','show'],a:1},
{q:'Pourquoi l\'historique PowerShell intéresse un enquêteur ?',o:['il est chiffré','il garde tout ce qui a été tapé, parfois des mots de passe','il efface les preuves','il ne sert à rien'],a:1}]},

{id:'m7l2',titre:'Active Directory, la cible n°1',duree:'15 min',
contenu:`
<div class="box kid"><b>Image simple</b><p>Dans une école avec 500 PC, on ne crée pas 500 fois chaque élève sur chaque machine. On a un <b>bureau central</b> qui connaît tout le monde et dit à chaque PC « cet élève a le droit d'entrer ». Ce bureau central, c'est <b>Active Directory (AD)</b>, et la machine qui le fait tourner s'appelle le <b>contrôleur de domaine</b>.</p></div>
<h2>Le vocabulaire</h2>
<ul>
<li><b>Domaine</b> : l'ensemble géré ensemble (ex : <code>ECOLE.LOCAL</code>).</li>
<li><b>Contrôleur de domaine (DC)</b> : le serveur-chef qui gère les comptes et les droits.</li>
<li><b>Compte de service, groupes, GPO</b> : les comptes des logiciels, les groupes d'utilisateurs, et les règles appliquées à tous.</li>
</ul>
<h2>Pourquoi c'est LA cible</h2>
<p>Qui contrôle Active Directory contrôle <b>toute</b> l'entreprise : tous les PC, tous les comptes, tous les fichiers. En pentest d'entreprise, l'objectif final est presque toujours de devenir <b>administrateur du domaine</b>. C'est pour ça qu'il y a des parcours entiers dédiés à AD sur TryHackMe et Hack The Box.</p>
<div class="box warn"><b>Côté défense</b><p>Comprendre AD sert d'abord à le <b>protéger</b> : mots de passe longs pour les comptes à privilèges, limiter qui est administrateur, surveiller les connexions anormales. Les attaques AD, tu les pratiqueras uniquement sur les labos prévus (voir le dossier labo-attaque).</p></div>
`,
quiz:[
{q:'Active Directory sert à...',o:['stocker des photos','gérer de façon centralisée les comptes et droits d\'un réseau Windows','chiffrer Internet','remplacer Linux'],a:1},
{q:'La machine qui fait tourner Active Directory s\'appelle...',o:['le routeur','le contrôleur de domaine','le pare-feu','le switch'],a:1},
{q:'En pentest d\'entreprise, l\'objectif final est souvent de devenir...',o:['invité','administrateur du domaine','simple utilisateur','visiteur'],a:1},
{q:'Un domaine Windows ressemble à...',o:['HL{...}','ECOLE.LOCAL','192.168.1.1','C:\\Users'],a:1}],
chal:{titre:'L\'admin distrait',xp:45,niveau:'moyen',type:'term',term:{user:'recrue',host:'forensic-win',motd:'<span class="hl">Analyse de l\'export Windows.</span> cat LISEZMOI.txt',fs:winFS()},
enonce:'<p>On a exporté des fichiers d\'un poste Windows, dont l\'<b>historique PowerShell</b> d\'un administrateur. Il y a tapé un mot de passe en clair. Retrouve le flag caché dans ces fichiers — sans les ouvrir un par un.</p>',flag:'HL{powershell_garde_tout_en_memoire}',
hints:['Le flag commence par HL{. Utilise grep pour chercher dans tout le dossier export.','grep -r "HL{" export','Le flag est dans historique_powershell.txt, sur la ligne « net use ».'],bravo:'Tu viens de faire du forensic Windows : l\'historique PowerShell trahit tout.'}}
]});

/* ---------- MODULE 8 : REVERSE ENGINEERING (INITIATION) ---------- */
function reverseFS(){return{
'/home/recrue/LISEZMOI.txt':'Initiation au reverse engineering.\nDeux programmes a examiner, SANS pouvoir lire leur code source.\n  licence.bin : un secret est ecrit en dur dedans\n  verif.bin   : il demande un mot de passe... mais lequel ?\nOutils : file <prog>  puis  strings <prog>',
'/home/recrue/licence.bin':'\x7fELF\x02\x01\x01\x00\x00\x00donnees compilees illisibles....\x00\x00Licence valide si cle = \x00HL{strings_lit_dans_les_binaires}\x00....fin',
'/home/recrue/verif.bin':'\x7fELF\x02\x01\x01\x00programme de verification\x00\x00if(saisie == "\x00Akassa2026!\x00") { acces_autorise(); }\x00\x00sinon refuse\x00plus de donnees binaires....'
}}
MODULES.push({id:'m8',titre:'Reverse engineering (initiation)',cat:'Aller plus loin',badge:'Démonteur',
desc:'Regarder dans un programme compilé sans son code source : la première marche du reverse.',
intro:'<p>Un programme livré n\'est plus du code lisible : c\'est du binaire. Le reverse engineering, c\'est l\'art de comprendre ce qu\'il fait quand même. On commence par le plus simple et le plus utile : lire ce qui traîne dedans.</p>',
lessons:[
{id:'m8l1',titre:'Du code source au binaire',duree:'15 min',
contenu:`
<div class="box kid"><b>Image simple</b><p>Le <b>code source</b> (ce que le programmeur écrit) est une recette en français. Pour que la machine l'exécute vite, on le <b>compile</b> : la recette est transformée en une liste d'instructions pour le processeur, illisible pour un humain. Le reverse engineering, c'est essayer de <b>retrouver la recette à partir du plat</b>.</p></div>
<h2>Pourquoi on fait du reverse</h2>
<ul><li>Comprendre un virus (analyse de malware).</li>
<li>Trouver comment un programme vérifie une licence ou un mot de passe (challenges CTF !).</li>
<li>Découvrir des secrets « codés en dur » que le développeur a oubliés dedans.</li></ul>
<h2>Les premières commandes, avant tout outil compliqué</h2>
<ul><li><code>file prog</code> : quel type de binaire ? (Linux ELF ? Windows ? 32 ou 64 bits ?)</li>
<li><code>strings prog</code> : extrait tous les textes lisibles cachés dans le binaire. Messages, noms de fichiers, et très souvent... des mots de passe ou des clés laissés en clair !</li></ul>
<div class="box pro"><b>La vérité qui surprend les débutants</b><p>Beaucoup de secrets sont écrits <b>en clair</b> dans les programmes (« codés en dur »). Un simple <code>strings</code> suffit à les lire. C'est la toute première chose à essayer sur un binaire, avant de sortir les gros outils.</p></div>
<p>Entraîne-toi sur <code>licence.bin</code> (c'est le challenge ci-dessous) : <code>strings licence.bin</code>.</p>
`,
quiz:[
{q:'Compiler, c\'est...',o:['écrire du code','transformer le code source en instructions pour le processeur','supprimer un programme','chiffrer un fichier'],a:1},
{q:'Le reverse engineering consiste à...',o:['écrire un nouveau programme','comprendre un programme sans son code source','installer Linux','scanner un réseau'],a:1},
{q:'Quelle commande extrait les textes lisibles d\'un binaire ?',o:['cat','strings','cd','ping'],a:1},
{q:'Un secret « codé en dur » dans un programme...',o:['est impossible à lire','se lit souvent avec un simple strings','est toujours chiffré','n\'existe pas'],a:1}],
chal:{titre:'La clé dans le binaire',xp:40,niveau:'facile',type:'term',term:{user:'recrue',host:'reverse-lab',motd:'<span class="hl">Initiation reverse.</span> cat LISEZMOI.txt',fs:reverseFS()},
enonce:'<p>Le programme <code>licence.bin</code> contient une clé de licence écrite en dur. Tu ne peux pas lire son code source, mais tu peux lire les textes qu\'il contient. Trouve le flag.</p>',flag:'HL{strings_lit_dans_les_binaires}',
hints:['D\'abord file licence.bin pour voir que c\'est un binaire.','strings licence.bin affiche tous les textes cachés dedans.','Le flag apparaît après « Licence valide si cle = ».'],bravo:'Premier reflex de reverse : strings avant tout.'}},

{id:'m8l2',titre:'Comment un programme vérifie un mot de passe',duree:'15 min',
contenu:`
<p>Beaucoup de challenges donnent un programme qui demande un mot de passe et répond « bravo » ou « raté ». Comment le battre sans connaître le mot de passe ?</p>
<div class="box kid"><b>Ce que fait le programme, en pseudo-code</b><p>Au fond, la vérification ressemble souvent à ça :</p></div>
<pre>saisie = demander_au_joueur()
si saisie == "LeMotDePasseSecret" :
    afficher("Accès autorisé !")
sinon :
    afficher("Raté.")</pre>
<p>Tu vois le problème ? Le <b>vrai mot de passe est écrit dans le programme</b> pour pouvoir comparer. S'il n'est pas chiffré, un <code>strings</code> le révèle. C'est exactement la faille du « codé en dur ».</p>
<h2>Les vrais outils (pour plus tard)</h2>
<ul><li><b>Ghidra</b> (gratuit, créé par la NSA) et <b>IDA</b> : ils reconstruisent un pseudo-code lisible à partir du binaire.</li>
<li><b>objdump</b> et <b>gdb</b> : afficher et exécuter pas à pas les instructions.</li></ul>
<p>Mais avant de les sortir, on tente toujours le réflexe simple : <code>strings</code>. Fais-le sur <code>verif.bin</code> (challenge ci-dessous).</p>
<div class="box warn"><b>À retenir pour quand tu coderas</b><p>Ne mets <b>jamais</b> un mot de passe ou une clé secrète en dur dans ton code. On l'a vu : ça se lit en une commande. Les secrets se gardent ailleurs, chiffrés.</p></div>
`,
quiz:[
{q:'Pourquoi un mot de passe « en dur » est-il une faille ?',o:['il ralentit le programme','il est écrit dans le binaire et se lit avec strings','il est trop long','il est chiffré'],a:1},
{q:'Ghidra et IDA servent à...',o:['scanner des ports','reconstruire un pseudo-code lisible depuis un binaire','envoyer des e-mails','chiffrer des fichiers'],a:1},
{q:'Avant de sortir les gros outils, quel réflexe sur un binaire ?',o:['le supprimer','essayer strings','le recompiler','rien'],a:1},
{q:'Bonne pratique quand TU codes ?',o:['mettre les mots de passe en dur','ne jamais mettre de secret en dur dans le code','partager ton code source','désactiver l\'antivirus'],a:1}],
chal:{titre:'Le sésame caché',xp:45,niveau:'moyen',type:'term',term:{user:'recrue',host:'reverse-lab',motd:'<span class="hl">Trouve le mot de passe de verif.bin.</span> cat LISEZMOI.txt',fs:reverseFS()},
enonce:'<p>Le programme <code>verif.bin</code> demande un mot de passe et le compare à une valeur écrite en dur dedans. Retrouve cette valeur avec <code>strings</code>. Le flag est <code>HL{le_mot_de_passe_trouve}</code> — par exemple si le mot de passe était « Secret123 », le flag serait <code>HL{Secret123}</code>.</p>',flag:'HL{Akassa2026!}',
hints:['strings verif.bin montre le code de comparaison.','Cherche la ligne « if(saisie == "..." ) » : le mot entre guillemets est le mot de passe.','Le mot de passe est Akassa2026! → flag HL{Akassa2026!}'],bravo:'Tu as « cassé » ta première vérification de mot de passe, juste en lisant le binaire.'}}
]});

/* ---------- MODULE 9 : FORENSIC APPROFONDI ---------- */
function stegoFS(){return{
'/home/recrue/LISEZMOI.txt':'Forensic approfondi. Trois pieces a conviction :\n  photo_vacances.png : une image banale... ou pas (strings / xxd)\n  message.txt        : un texte avec un secret cache a la fin\n  auth.log           : un journal de connexions ; une intrusion s\'y cache',
'/home/recrue/photo_vacances.png':'\x89PNG\x0d\x0a\x1a\x0a donnees de l\'image, pixels, couleurs, illisibles en texte....\x00\x00IEND\x00\x00\x00ajoute apres la fin du PNG : HL{donnees_cachees_apres_IEND}\x00',
'/home/recrue/message.txt':'Cher collegue,\nLa reunion de demain est reportee a 14h.\nMerci et bonne journee.\n\n\n\n                                                            cache_ici: HL{espaces_et_fin_de_fichier}',
'/home/recrue/auth.log':(function(){const r=rng(99);const ips=['10.0.0.12','10.0.0.45','10.0.0.7','192.168.1.33','10.0.0.88'];const L=[];
  for(let i=0;i<80;i++){const h=String(Math.floor(r()*24)).padStart(2,'0');const m=String(Math.floor(r()*60)).padStart(2,'0');const ip=ips[Math.floor(r()*ips.length)];const ok=r()>0.25;
    L.push(`2026-11-18 ${h}:${m}:00 sshd: ${ok?'Accepted':'Failed'} password for ${ok?'recrue':'root'} from ${ip} port 51${String(i).padStart(3,'0')}`);}
  L.splice(52,0,'2026-11-18 03:14:00 sshd: Accepted password for root from 185.42.9.6 port 44122  <-- connexion root reussie a 3h du matin depuis une IP INCONNUE : HL{intrusion_dans_les_logs}');
  return L.join('\n')})()
}}
MODULES.push({id:'m9',titre:'Forensic approfondi',cat:'Aller plus loin',badge:'Légiste du numérique',
desc:'Stéganographie, données cachées, et analyse de journaux pour retrouver une intrusion.',
intro:'<p>Le forensic, c\'est l\'enquête : retrouver ce qui a été caché et reconstituer ce qui s\'est passé. Deux compétences très demandées au HackerLab : débusquer un secret dans un fichier, et repérer une intrusion dans des milliers de lignes de journal.</p>',
lessons:[
{id:'m9l1',titre:'La stéganographie',duree:'15 min',
contenu:`
<div class="box kid"><b>Image simple</b><p>La <b>cryptographie</b> rend un message illisible. La <b>stéganographie</b>, elle, <b>cache l'existence même</b> du message : on glisse un secret dans une image, un son, un fichier d'apparence banale. Comme écrire à l'encre invisible au dos d'une carte postale ordinaire.</p></div>
<h2>Les cachettes classiques</h2>
<ul>
<li><b>Après la fin d'un fichier</b> : une image PNG « finit » par un marqueur (<code>IEND</code>). On peut coller des données <b>après</b> : l'image s'affiche normalement, mais le secret est là. <code>strings</code> ou <code>xxd</code> le révèlent.</li>
<li><b>Dans les métadonnées</b> : le champ « commentaire » d'une photo (vu au module Forensic : <code>exiftool</code>).</li>
<li><b>Dans les pixels eux-mêmes</b> : en modifiant des détails invisibles à l'œil (outils <code>steghide</code>, <code>zsteg</code> — pour plus tard).</li>
<li><b>Les espaces en fin de ligne</b> : du texte caché dans des espaces et tabulations.</li>
</ul>
<div class="box pro"><b>La méthode du légiste</b><p>Face à un fichier suspect : 1) <code>file</code> (vrai type ?), 2) <code>strings</code> (du texte caché ?), 3) <code>exiftool</code> (métadonnées ?), 4) <code>xxd</code> (regarder les octets bruts, surtout au début et à la fin). Un de ces quatre révèle presque toujours le secret des challenges débutants.</p></div>
<p>Deux fichiers t'attendent dans le challenge : une image et un texte. À toi de les faire parler.</p>
`,
quiz:[
{q:'La stéganographie sert à...',o:['rendre un message illisible','cacher l\'existence même d\'un message','supprimer un fichier','scanner un réseau'],a:1},
{q:'Un secret collé APRÈS la fin d\'une image PNG se révèle avec...',o:['ping','strings ou xxd','cd','sort'],a:1},
{q:'Différence crypto / stégano ?',o:['aucune','la crypto rend illisible, la stégano cache l\'existence','la stégano est illégale','la crypto est plus récente'],a:1},
{q:'Face à un fichier suspect, un bon ordre est...',o:['file, strings, exiftool, xxd','l\'ouvrir dans Word','le supprimer','ping'],a:0}],
chal:{titre:'L\'image qui parle',xp:45,niveau:'moyen',type:'term',term:{user:'recrue',host:'forensic-lab',motd:'<span class="hl">Fais parler les fichiers.</span> cat LISEZMOI.txt',fs:stegoFS()},
enonce:'<p>Une image <code>photo_vacances.png</code> cache un secret collé après sa fin. Un texte <code>message.txt</code> en cache un autre à la fin. Trouve-les — il te suffit du flag de l\'<b>image</b> pour valider (<code>strings photo_vacances.png</code>).</p>',flag:'HL{donnees_cachees_apres_IEND}',
hints:['file photo_vacances.png confirme que c\'est une image PNG.','strings photo_vacances.png : lis ce qui apparaît après « IEND ».','Le flag de l\'image est HL{donnees_cachees_apres_IEND}. (Le texte message.txt en cache un autre, bonus !)'],bravo:'Tu sais débusquer un secret caché dans un fichier.'}},

{id:'m9l2',titre:'Analyser les journaux (logs)',duree:'18 min',
contenu:`
<p>Chaque serveur écrit un <b>journal</b> (log) de ce qui se passe : qui se connecte, quand, depuis où. Après une attaque, ces journaux sont la scène de crime. Savoir les lire, c'est repérer l'intrus.</p>
<div class="box kid"><b>Image simple</b><p>C'est le registre d'entrée d'un immeuble sécurisé : chaque passage est noté avec l'heure et le nom. Pour trouver le cambrioleur, tu cherches l'entrée anormale — à 3h du matin, un nom inconnu, une porte forcée.</p></div>
<h2>Ce qui doit t'alerter dans un journal</h2>
<ul>
<li>Beaucoup d'échecs de connexion d'affilée, puis un succès → quelqu'un a <b>deviné</b> un mot de passe (brute force).</li>
<li>Une connexion <b>réussie en root</b> depuis une IP <b>inconnue</b> ou étrangère.</li>
<li>Une activité à une <b>heure anormale</b> (3h du matin un dimanche).</li>
</ul>
<h2>L'outil : grep, encore et toujours</h2>
<p>Un journal peut faire des milliers de lignes. On ne lit pas tout : on filtre.</p>
<pre>grep "Accepted" auth.log        # les connexions réussies
grep "Failed" auth.log          # les échecs
grep "root" auth.log            # tout ce qui touche à root</pre>
<p>Dans le challenge, le fichier <code>auth.log</code> contient 80 lignes normales et <b>une</b> intrusion. À toi de l'isoler.</p>
<div class="box pro"><b>Astuce de pro</b><p>Croise les filtres : une connexion <code>Accepted</code> <b>ET</b> <code>root</code> <b>ET</b> depuis une IP que tu ne reconnais pas = suspect numéro un. C'est le travail quotidien d'un analyste SOC (équipe bleue).</p></div>
`,
quiz:[
{q:'À quoi sert un journal (log) en forensic ?',o:['à rien','à reconstituer ce qui s\'est passé : qui, quand, d\'où','à chiffrer les données','à accélérer le serveur'],a:1},
{q:'Beaucoup d\'échecs puis un succès de connexion suggère...',o:['un utilisateur distrait','une attaque par force brute réussie','une mise à jour','rien'],a:1},
{q:'Quelle commande filtre les connexions réussies ?',o:['grep "Accepted" auth.log','cd auth.log','ping auth.log','rm auth.log'],a:0},
{q:'Le signal le plus suspect ?',o:['une connexion root réussie à 3h depuis une IP inconnue','une connexion à midi depuis le bureau','un échec de connexion','un redémarrage'],a:0}],
chal:{titre:'Qui est entré ?',xp:50,niveau:'moyen',type:'term',term:{user:'recrue',host:'forensic-lab',motd:'<span class="hl">Trouve l\'intrusion dans auth.log.</span> cat LISEZMOI.txt',fs:stegoFS()},
enonce:'<p>Le journal <code>auth.log</code> contient 80 lignes de connexions, dont <b>une seule intrusion</b> : une connexion root réussie, en pleine nuit, depuis une IP inconnue. Isole-la avec <code>grep</code> et récupère le flag qu\'elle contient.</p>',flag:'HL{intrusion_dans_les_logs}',
hints:['L\'intrusion est une connexion « Accepted » pour « root ». Filtre là-dessus.','grep "Accepted password for root" auth.log → une seule ligne sort du lot (3h14, IP 185.42.9.6).','Cette ligne contient directement le flag HL{intrusion_dans_les_logs}.'],bravo:'Tu as mené une analyse de logs comme un analyste SOC. C\'est une compétence très recherchée.'}}
]});
