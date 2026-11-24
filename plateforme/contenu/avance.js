/* ============ CONTENU : MODULES 3 à 6 + PAGES ============ */

/* ---------- MODULE 3 : RÉSEAUX ---------- */
MODULES.push({id:'m3',titre:'Les réseaux',cat:'Fondations',badge:'Oreille du réseau',
desc:'IP, ports, DNS, HTTP, et pourquoi le chiffrement change tout. Lire ce qui circule entre les machines.',
intro:'<p>Internet, c\'est des millions de machines qui se parlent. Comprendre comment elles s\'adressent la parole, c\'est comprendre où écouter et où se cachent les secrets.</p>',
lessons:[
{id:'m3l1',titre:'IP, ports et DNS',duree:'15 min',
contenu:`
<div class="box kid"><b>Image simple</b><p>L'<b>adresse IP</b> est l'adresse d'un immeuble (<code>192.168.1.50</code>). Le <b>port</b> est le numéro de l'appartement : au même immeuble, l'appartement 80 sert les pages web, le 22 sert les connexions à distance. Le <b>DNS</b> est l'annuaire : il transforme un nom facile (<code>intranet.ecole.bj</code>) en adresse IP.</p></div>
<h2>Les ports à connaître par cœur</h2>
<div class="tablewrap"><table><tr><th>Port</th><th>Service</th><th>À quoi ça sert</th></tr>
<tr><td class="mono">22</td><td>SSH</td><td>se connecter à distance en ligne de commande</td></tr>
<tr><td class="mono">80</td><td>HTTP</td><td>sites web (non chiffré)</td></tr>
<tr><td class="mono">443</td><td>HTTPS</td><td>sites web chiffrés (le cadenas)</td></tr>
<tr><td class="mono">21</td><td>FTP</td><td>transfert de fichiers</td></tr>
<tr><td class="mono">53</td><td>DNS</td><td>l'annuaire des noms</td></tr>
<tr><td class="mono">3306</td><td>MySQL</td><td>une base de données</td></tr></table></div>
<h2>Les couches (le modèle OSI)</h2>
<p>Un message voyage à travers des « couches », de l'appli jusqu'au câble. Tu n'as pas à tout retenir, juste l'idée : chaque couche a un rôle.</p>
<div data-widget="osi"></div>
<p>Scanner les ports ouverts d'une machine = découvrir quelles « portes » sont ouvertes. L'outil des pros s'appelle <b>nmap</b> (tu l'essaieras en VM).</p>
`,
quiz:[
{q:'Le port 22 sert à...',o:['les sites web','se connecter à distance (SSH)','les e-mails','le DNS'],a:1},
{q:'Qu\'est-ce qui transforme un nom (site.com) en adresse IP ?',o:['le port','le DNS','le HTML','le câble'],a:1},
{q:'Quel port pour un site web CHIFFRÉ (cadenas) ?',o:['80','443','21','3306'],a:1},
{q:'Une adresse IP, c\'est comme...',o:['le numéro de l\'appartement','l\'adresse de l\'immeuble','l\'annuaire','le facteur'],a:1}]},

{id:'m3l2',titre:'La poignée de main et HTTP',duree:'15 min',
contenu:`
<p>Avant d'échanger, deux machines se mettent d'accord : c'est la <b>poignée de main TCP</b>, en 3 étapes.</p>
<div data-widget="handshake"></div>
<p>Ensuite, pour le web, elles parlent <b>HTTP</b>. Le navigateur envoie une <b>requête</b> (« donne-moi la page /login »), le serveur renvoie une <b>réponse</b>.</p>
<pre>GET /login HTTP/1.1
Host: intranet.ecole.bj

HTTP/1.1 200 OK        &lt;-- 200 = tout va bien</pre>
<h2>Les codes de réponse</h2>
<ul><li><b>200</b> OK — ça marche</li><li><b>301/302</b> — redirection vers une autre page</li><li><b>403</b> — interdit</li><li><b>404</b> — page introuvable</li><li><b>500</b> — le serveur a planté</li></ul>
<div class="box warn"><b>Le piège de HTTP</b><p>En <b>HTTP</b> (port 80, sans « s »), tout circule <b>en clair</b> : si quelqu'un écoute le réseau, il lit ton mot de passe comme sur une carte postale. En <b>HTTPS</b> (port 443), tout est chiffré : c'est une lettre scellée. <b>Ne tape jamais un mot de passe sur un site sans cadenas.</b></p></div>
`,
quiz:[
{q:'La poignée de main TCP se fait en combien d\'étapes ?',o:['1','2','3','5'],a:2,w:'SYN, SYN-ACK, ACK.'},
{q:'Un code HTTP 404 signifie...',o:['tout va bien','page introuvable','interdit','serveur planté'],a:1},
{q:'Sur un site en HTTP (sans s), ton mot de passe circule...',o:['chiffré','en clair, lisible par qui écoute','compressé','supprimé'],a:1},
{q:'Le cadenas du navigateur veut dire...',o:['le site est gratuit','la connexion est chiffrée (HTTPS)','le site est béninois','le site est dangereux'],a:1}]},

{id:'m3l3',titre:'Écouter le réseau',duree:'18 min',
contenu:`
<p>Un <b>analyseur réseau</b> (le plus connu : <b>Wireshark</b>) capture tous les paquets qui passent et te les montre un par un. En forensic, on te donne souvent un fichier de capture (<code>.pcap</code>) à analyser.</p>
<div class="box kid"><b>Image simple</b><p>C'est comme enregistrer toutes les conversations d'une rue, puis les réécouter tranquillement pour retrouver une phrase précise. Si quelqu'un a crié son mot de passe (HTTP en clair), tu l'entendras.</p></div>
<h2>Entraîne-toi : lis la capture</h2>
<p>Clique sur chaque paquet pour voir son contenu. Repère le type (DNS, TCP, HTTP, TLS). Un des paquets contient un formulaire de connexion envoyé en clair...</p>
<div data-widget="packets"></div>
<div class="box pro"><b>Ce que tu apprends ici</b><p>Pourquoi le HTTP en clair est dangereux, et comment un défenseur repère une fuite. Le paquet n°8 (POST /login) montre un identifiant et un mot de passe lisibles : la preuve qu'il fallait du HTTPS.</p></div>
`,
quiz:[
{q:'Un fichier de capture réseau porte souvent l\'extension...',o:['.txt','.pcap','.mp3','.exe'],a:1},
{q:'L\'outil le plus connu pour analyser une capture ?',o:['Word','Wireshark','VirtualBox','Photoshop'],a:1},
{q:'Dans la capture, quel paquet contient le mot de passe en clair ?',o:['un paquet DNS','le POST /login en HTTP','un paquet TLS','le ping'],a:1},
{q:'Pourquoi peut-on lire ce mot de passe ?',o:['Wireshark casse le chiffrement','parce que le site utilise HTTP, pas HTTPS','c\'est impossible','le mot de passe est faux'],a:1}],
chal:{titre:'L\'oreille indiscrète',xp:40,niveau:'moyen',type:'widget',widget:'packets',
enonce:'<p>Dans la capture ci-dessous, un utilisateur s\'est connecté à un site en <b>HTTP</b> (non chiffré). Retrouve le <b>mot de passe</b> envoyé dans le formulaire. Le flag est ce mot de passe, sous la forme <code>HL{mot_de_passe}</code>, avec les majuscules et underscores exactement comme écrit.</p>',flag:'HL{Ouidah_Plage_2026}',
hints:['Cherche le paquet de type HTTP qui envoie des données (méthode POST).','Clique sur le paquet n°8 (POST /login) et lis la dernière ligne : username=...&password=...','Le mot de passe est Ouidah_Plage_2026. Le flag : HL{Ouidah_Plage_2026}'],bravo:'Tu comprends maintenant pourquoi HTTPS est vital.'}}
]});

/* ---------- MODULE 4 : CRYPTOGRAPHIE & ENCODAGE ---------- */
MODULES.push({id:'m4',titre:'Cryptographie et encodage',cat:'Fondations',badge:'Briseur de codes',
desc:'César, base64, hachage, XOR : reconnaître et casser les codes. La catégorie préférée des débutants.',
intro:'<p>Encoder, ce n\'est pas chiffrer. Comprendre la différence, et savoir reconnaître chaque code au premier coup d\'œil, te fera gagner des dizaines de points sans effort.</p>',
lessons:[
{id:'m4l1',titre:'Encoder ≠ chiffrer',duree:'15 min',
contenu:`
<div class="box def"><b>Deux mots à ne pas confondre</b><p><b>Encoder</b> = changer la forme pour transporter, <b>sans secret</b>. N'importe qui peut décoder (ex : base64). <b>Chiffrer</b> = cacher avec une <b>clé secrète</b> ; sans la clé, on ne peut pas lire.</p></div>
<h2>Base64 : l'encodage star des CTF</h2>
<p>Le base64 transforme n'importe quoi en lettres, chiffres, <code>+</code> et <code>/</code>. On le reconnaît car il finit souvent par <code>=</code> ou <code>==</code>.</p>
<pre>SGVsbG8=        se décode en "Hello"
SEx7Li4ufQ==    se décode en "HL{...}"</pre>
<p>C'est réversible sans clé : ce n'est donc <b>pas</b> une protection, juste un déguisement. Entraîne-toi :</p>
<div data-widget="mini" data-op="b64"></div>
<div class="box pro"><b>Reconnaître un encodage d'un coup d'œil</b><p><b>Binaire</b> : que des 0 et 1. <b>Hexa</b> : 0-9 et a-f. <b>Base64</b> : lettres/chiffres/+// et des = à la fin. <b>URL</b> : des <code>%20</code>, <code>%3D</code>. Le <a href="#labo">Labo</a> essaie de deviner pour toi et décode tout.</p></div>
`,
quiz:[
{q:'La différence encoder / chiffrer ?',o:['aucune','chiffrer utilise une clé secrète, encoder non','encoder est plus sûr','chiffrer est illégal'],a:1},
{q:'Un texte qui finit par == est probablement...',o:['du binaire','du base64','de l\'hexa','un hash'],a:1},
{q:'Le base64 est-il une protection sûre ?',o:['oui, personne ne peut lire','non, n\'importe qui peut le décoder','seulement avec une clé','oui si c\'est long'],a:1},
{q:'Que reconnais-tu : 48 65 6c 6c 6f ?',o:['base64','hexadécimal','binaire','URL'],a:1}],
chal:{titre:'Les couches de l\'oignon',xp:40,niveau:'moyen',enonce:`<p>Ce message a été encodé <b>deux fois</b> : d'abord le texte en base64, puis le résultat ENCORE en base64. Décode couche par couche pour retrouver le flag.</p><pre style="white-space:pre-wrap;word-break:break-all">${btoa(btoa('HL{base64_dans_base64}'))}</pre><p>Astuce : dans le <a href="#labo">Labo</a>, décode une fois, clique « Utiliser le résultat comme entrée », décode encore.</p>`,flag:'HL{base64_dans_base64}',
hints:['C\'est du base64 (lettres + chiffres). Décode-le une première fois.','Le résultat est... encore du base64 ! Décode-le une deuxième fois.','Labo → « Base64 → texte », puis bouton « Utiliser le résultat comme entrée », puis « Base64 → texte » à nouveau.']}},

{id:'m4l2',titre:'Le chiffre de César',duree:'15 min',
contenu:`
<p>Le plus vieux code du monde : on décale chaque lettre de l'alphabet d'un certain nombre de crans. Avec un décalage de 3, A→D, B→E... C'est le <b>chiffre de César</b>.</p>
<div class="box kid"><b>Image simple</b><p>Imagine deux disques de l'alphabet, l'un sur l'autre. Tu tournes le disque du dessus de quelques crans : la <b>clé</b>, c'est le nombre de crans. Pour lire, tu tournes dans l'autre sens.</p></div>
<p>Joue avec le décalage pour déchiffrer :</p>
<div data-widget="caesar" data-text="KHOOR"></div>
<p><b>ROT13</b> est un César avec un décalage fixe de 13. Sa particularité : l'appliquer deux fois redonne le texte d'origine.</p>
<div class="box pro"><b>Comment casser un César sans connaître la clé ?</b><p>Il n'y a que 25 décalages possibles ! On les essaie tous (c'est la « force brute »), et on repère celui qui donne du texte lisible. Le <a href="#labo">Labo</a> a l'opération « César : essayer les 25 décalages ».</p></div>
`,
quiz:[
{q:'Le chiffre de César consiste à...',o:['décaler chaque lettre dans l\'alphabet','remplacer par des chiffres','encoder en base64','supprimer des lettres'],a:0},
{q:'ROT13 appliqué deux fois donne...',o:['un autre code','le texte d\'origine','une erreur','du base64'],a:1},
{q:'Combien de décalages possibles pour un César (lettres) ?',o:['10','25','100','infini'],a:1},
{q:'Comment casser un César sans la clé ?',o:['c\'est impossible','essayer les 25 décalages','utiliser base64','deviner au hasard'],a:1}],
chal:{titre:'Le message de l\'espion',xp:40,niveau:'moyen',enonce:`<p>Un espion a chiffré le flag avec un César. Tu ne connais pas le décalage. À toi de le casser !</p><pre style="white-space:pre-wrap;word-break:break-all">${(function(){const c=(s,k)=>s.replace(/[a-z]/gi,ch=>{const b=ch<='Z'?65:97;return String.fromCharCode((ch.charCodeAt(0)-b+k)%26+b)});return c('HL{cesar_casse_en_force}',7)})()}</pre><p>Indice : les lettres sont décalées, mais les chiffres et les <code>{ }</code> ne bougent pas.</p>`,flag:'HL{cesar_casse_en_force}',
hints:['Tu vois « HL{ » devenu autre chose. Combien de crans pour revenir à H, L ?','Labo → « César : essayer les 25 décalages ». Lis la ligne qui donne HL{...}.','Le bon décalage est 7 (vers l\'arrière). Le flag : HL{cesar_casse_en_force}']}},

{id:'m4l3',titre:'Hachage et mots de passe',duree:'18 min',
contenu:`
<p>Un <b>hash</b> (empreinte) transforme n'importe quel texte en une suite de caractères de longueur fixe. Deux règles : le même texte donne toujours le même hash, et on ne peut <b>pas</b> remonter du hash au texte.</p>
<div class="box kid"><b>Image simple</b><p>C'est comme passer un fruit au mixeur : « pomme » donne toujours la même purée, mais avec la purée tu ne peux pas reconstruire la pomme. Le hash, c'est l'empreinte digitale d'un fichier ou d'un mot de passe.</p></div>
<p>Les sites ne stockent pas ton mot de passe, mais son hash. Quand tu te connectes, ils hachent ce que tu tapes et comparent. Types courants : <b>MD5</b> (32 caractères hexa), <b>SHA-1</b> (40), <b>SHA-256</b> (64).</p>
<h2>Alors comment les « casser » ?</h2>
<p>On ne « dé-hache » pas. Mais on peut <b>deviner</b> : prendre une liste de mots de passe courants, hacher chacun, et comparer. Si ça correspond, on a trouvé. C'est l'<b>attaque par dictionnaire</b>. Démonstration :</p>
<div data-widget="cracker"></div>
<div class="box warn"><b>La leçon de sécurité</b><p>C'est exactement pour ça qu'un bon mot de passe est <b>long et imprévisible</b>. « doudou » ou « 123456 » sont dans tous les dictionnaires et tombent en une seconde. Une phrase comme « MonChatMangeDuBissap! » est bien plus solide. Les pros utilisent les outils <b>John the Ripper</b> et <b>hashcat</b>.</p></div>
`,
quiz:[
{q:'Peut-on retrouver le texte d\'origine à partir d\'un hash ?',o:['oui facilement','non, le hachage est à sens unique','seulement en base64','oui avec une clé'],a:1},
{q:'Un hash SHA-256 fait combien de caractères hexa ?',o:['16','32','64','100'],a:2},
{q:'L\'attaque par dictionnaire consiste à...',o:['dé-hacher le mot de passe','hacher plein de mots courants et comparer','deviner au hasard','utiliser base64'],a:1},
{q:'Quel mot de passe est le plus solide ?',o:['123456','doudou','MonChatMangeDuBissap!','azerty'],a:2}],
chal:{titre:'Le hash trahi',xp:45,niveau:'moyen',type:'widget',widget:'cracker',
enonce:'<p>Un mot de passe a été volé sous forme de hash SHA-256. Lance l\'attaque par dictionnaire ci-dessous : l\'outil va trouver le mot de passe d\'origine. Une fois révélé, le flag est <code>HL{le_mot_de_passe}</code>.</p>',flag:'HL{doudou}',
hints:['Clique sur « Lancer l\'attaque par dictionnaire » et regarde quelle ligne dit « CORRESPONDANCE TROUVÉE ».','Le mot de passe trouvé est « doudou » (un classique, trop faible).','Le flag est HL{doudou}.'],bravo:'Tu as vu de tes yeux pourquoi les mots de passe faibles sont un désastre.'}}
]});

/* ---------- MODULE 5 : LE WEB ---------- */
MODULES.push({id:'m5',titre:'Comment marche le web',cat:'Fondations',badge:'Lecteur de pages',
desc:'HTML, code source, cookies : comprendre un site de l\'intérieur et développer le réflexe « regarder sous le capot ».',
intro:'<p>Le web est la plus grande catégorie des CTF. Avant d\'attaquer un site (plus tard, en labo), il faut comprendre comment il est fait. Ici, on apprend à lire sous le capot.</p>',
lessons:[
{id:'m5l1',titre:'Qu\'est-ce qu\'une page web',duree:'15 min',
contenu:`
<div class="box kid"><b>Image simple</b><p>Une page web, c'est une recette envoyée par le serveur à ton navigateur. Le <b>HTML</b> donne la structure (les titres, les paragraphes, les boutons), le <b>CSS</b> donne l'apparence (couleurs, polices), le <b>JavaScript</b> donne le comportement (ce qui bouge quand tu cliques).</p></div>
<h2>Le HTML en 1 minute</h2>
<p>Le HTML est fait de <b>balises</b> entre chevrons : <code>&lt;titre&gt;...&lt;/titre&gt;</code>. Exemple :</p>
<pre>&lt;h1&gt;Bienvenue&lt;/h1&gt;
&lt;p&gt;Ceci est un paragraphe.&lt;/p&gt;
&lt;a href="/contact"&gt;Nous contacter&lt;/a&gt;
&lt;!-- ceci est un commentaire, invisible sur la page --&gt;</pre>
<h2>Le réflexe en or : le code source</h2>
<p>Ton navigateur te montre la page <b>finie</b>. Mais tu peux voir la recette brute : clic droit → « Afficher le code source » (ou touche <b>F12</b> pour les outils de développement). Les développeurs y oublient souvent des choses : des commentaires, des mots de passe de test, des liens cachés.</p>
<div class="box pro"><b>Dans un CTF web</b><p>Les tout premiers réflexes, avant toute « attaque » : lire le code source (les <code>&lt;!-- commentaires --&gt;</code>), regarder le fichier <code>/robots.txt</code> (qui liste parfois des pages cachées), et inspecter les cookies. Beaucoup de flags « faciles » sont juste là, en clair.</p></div>
`,
quiz:[
{q:'Le HTML sert à...',o:['la structure de la page','seulement les couleurs','attaquer le serveur','chiffrer les données'],a:0},
{q:'Un commentaire HTML &lt;!-- ... --&gt; est...',o:['affiché en gros','invisible sur la page mais présent dans le code source','un virus','obligatoire'],a:1},
{q:'Comment voir la « recette » brute d\'une page ?',o:['clic droit → afficher le code source','éteindre l\'ordinateur','cd /','ls -a'],a:0},
{q:'Quel fichier liste parfois des pages cachées d\'un site ?',o:['index.html','robots.txt','style.css','flag.txt'],a:1}],
chal:{titre:'Oublié dans le code',xp:35,niveau:'facile',enonce:`<p>Un développeur pressé a laissé un secret dans un commentaire HTML. Voici le code source de sa page d'accueil. Lis-le attentivement et trouve le flag.</p><pre style="white-space:pre-wrap">&lt;html&gt;
&lt;head&gt;&lt;title&gt;Boulangerie Akassa&lt;/title&gt;&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Le meilleur pain de Porto-Novo&lt;/h1&gt;
  &lt;p&gt;Ouvert tous les jours de 6h à 20h.&lt;/p&gt;
  &lt;!-- NOTE pour l'équipe : ne pas oublier de retirer ceci avant la mise en ligne.
       Accès espace gérant : HL{le_code_source_dit_tout} --&gt;
  &lt;ul&gt;&lt;li&gt;Pain : 500 FCFA&lt;/li&gt;&lt;li&gt;Croissant : 300 FCFA&lt;/li&gt;&lt;/ul&gt;
&lt;/body&gt;&lt;/html&gt;</pre>`,flag:'HL{le_code_source_dit_tout}',
hints:['Cherche la partie entre &lt;!-- et --&gt; : c\'est un commentaire que les visiteurs normaux ne voient pas.','Le flag est juste après « Accès espace gérant : ».'],bravo:'Premier réflexe web acquis : toujours lire le code source.'}},

{id:'m5l2',titre:'Les cookies, en clair',duree:'15 min',
contenu:`
<div class="box kid"><b>Image simple</b><p>Quand tu entres dans certains magasins, on te donne un bracelet. En revenant au comptoir, le bracelet prouve qui tu es sans tout réexpliquer. Un <b>cookie</b>, c'est ce bracelet : un petit fichier que le site dépose dans ton navigateur pour te reconnaître (rester connecté, se souvenir de ta langue...).</p></div>
<h2>À quoi ça ressemble</h2>
<pre>session = 7f3a9b2c...     (prouve que tu es connecté)
langue  = fr
role    = eleve</pre>
<p>Tu peux voir et parfois modifier tes propres cookies (F12 → onglet « Application » ou « Stockage »). Un site <b>bien</b> conçu ne fait jamais confiance à un cookie modifiable pour décider des droits — il vérifie côté serveur. Un site <b>mal</b> conçu, oui, et c'est une faille classique.</p>
<div class="box warn"><b>À comprendre, pas à abuser</b><p>On étudie les cookies pour savoir les <b>protéger</b> : les marquer « HttpOnly » et « Secure », ne jamais y mettre d'information sensible en clair, et toujours revérifier côté serveur. Ces tests, tu les feras uniquement sur des cibles autorisées (CTF, ton propre site).</p></div>
<h2>Le secret dans le bracelet</h2>
<p>Parfois, un cookie contient directement une donnée lisible — par exemple encodée en base64. Exemple : un cookie <code>note = SEx7bGVzX2Nvb2tpZXNfc2VfbGlzZW50fQ==</code>. Que cache-t-il ? (c'est le challenge !)</p>
`,
quiz:[
{q:'Un cookie sert à...',o:['attaquer un serveur','permettre au site de te reconnaître','chiffrer Internet','accélérer le processeur'],a:1},
{q:'Un site bien conçu, face à un cookie role=eleve...',o:['fait confiance aveuglément','revérifie les droits côté serveur','supprime le compte','ignore les cookies'],a:1},
{q:'Où voir ses propres cookies ?',o:['dans le BIOS','dans les outils de développement (F12)','dans le terminal uniquement','nulle part'],a:1},
{q:'Que ne faut-il jamais mettre en clair dans un cookie ?',o:['la langue','une information sensible','la date','un numéro de page'],a:1}],
chal:{titre:'Le secret du bracelet',xp:35,niveau:'facile',enonce:'<p>Un cookie contient cette valeur, encodée en base64 :</p><pre style="white-space:pre-wrap;word-break:break-all">SEx7bGVzX2Nvb2tpZXNfc2VfbGlzZW50fQ==</pre><p>Décode-la pour révéler le flag qu\'elle cache.</p>',flag:'HL{les_cookies_se_lisent}',
hints:['La valeur finit par == : c\'est du base64.','Labo → « Base64 → texte ».'],bravo:'Tu sais lire ce que les sites stockent chez toi.'}}
]});

/* ---------- MODULE 6 : MÉTHODO, FORENSIC & OSINT ---------- */
function forensicFS(){return{
'/home/recrue/LISEZMOI.txt':'Mission forensic : 3 fichiers suspects sont dans le dossier "indices".\nLe flag est en 3 morceaux a recoller DANS CET ORDRE :\n  1) programme.bin  -> commande : strings indices/programme.bin\n  2) photo_suspecte.jpg -> commande : exiftool indices/photo_suspecte.jpg\n  3) note.txt       -> commande : cat indices/note.txt\nColle les 3 morceaux bout a bout, sans rien ajouter.',
'/home/recrue/indices/programme.bin':'\x7fELF\x02\x01\x01\x00donnees\x00\x00HL{forensic_\x00plus de donnees binaires illisibles',
'/home/recrue/indices/note.txt':'Felicitations, enqueteur.\nTroisieme et dernier morceau du flag : outils}\nRecolle : (morceau strings)(morceau exif)(morceau note)'
}}
MODULES.push({id:'m6',titre:'Méthode, forensic & OSINT',cat:'Passer à l\'action',badge:'Enquêteur',
desc:'Une méthode pour chaque challenge, les bases du forensic (fichiers, métadonnées) et de l\'OSINT.',
intro:'<p>Tu as les fondations. Ce module te donne la méthode d\'un vrai compétiteur, les outils d\'enquête, et le plan pour arriver prêt au HackerLab.</p>',
lessons:[
{id:'m6l1',titre:'La méthode face à un challenge',duree:'12 min',
contenu:`
<p>Face à un challenge, on ne fonce pas au hasard. On suit une routine.</p>
<ol>
<li><b>Lire l'énoncé en entier</b>, deux fois. Chaque mot compte (« ce fichier n'est pas ce qu'il prétend » = pense au type réel).</li>
<li><b>Identifier la catégorie</b> : crypto ? web ? forensic ? Ça oriente tes outils.</li>
<li><b>Récupérer et observer</b> : ouvre le fichier, regarde son type (<code>file</code>), son contenu lisible (<code>strings</code>), le code source d'une page.</li>
<li><b>Chercher le flag directement</b> : <code>grep -r "HL{" .</code> gagne un temps fou.</li>
<li><b>Décoder / transformer</b> si c'est du binaire, de l'hexa, du base64 (→ Labo).</li>
<li><b>Noter ce que tu essaies.</b> Si tu bloques 20 min, prends un indice, puis un writeup.</li>
</ol>
<div class="box pro"><b>Le format du flag est un indice</b><p>Si l'énoncé dit « le flag fait 32 caractères hexa », pense MD5. S'il finit par <code>=</code>, pense base64. Le format te dit quelle porte ouvrir.</p></div>
<div class="box kid"><b>État d'esprit</b><p>Un challenge, c'est une énigme avec UNE solution logique, posée par un humain. Demande-toi : « qu'est-ce que l'auteur veut me faire découvrir ? » Souvent, le nom du challenge est un indice.</p></div>
`,
quiz:[
{q:'Première chose à faire face à un challenge ?',o:['deviner le flag','lire l\'énoncé en entier, deux fois','abandonner','demander un indice'],a:1},
{q:'Un flag de 32 caractères hexa suggère...',o:['du base64','un hash MD5','du binaire','un cookie'],a:1},
{q:'Quelle commande lance une recherche directe du flag dans tous les fichiers ?',o:['ls -a','grep -r "HL{" .','pwd','file'],a:1},
{q:'Tu bloques depuis 20 minutes. La bonne suite ?',o:['abandonner le CTF','prendre un indice, puis lire un writeup','tout supprimer','recommencer à zéro'],a:1}]},

{id:'m6l2',titre:'Forensic : les fichiers mentent',duree:'18 min',
contenu:`
<p>En forensic, on enquête sur des fichiers. Premier principe : <b>un fichier peut mentir sur son nom</b>. Un fichier appelé <code>photo.jpg</code> peut en réalité être autre chose.</p>
<h2>Trois outils essentiels</h2>
<ul>
<li><code>file &lt;fichier&gt;</code> : lit les premiers octets (le « magic number ») et dit le <b>vrai</b> type. Un vrai JPEG commence par <code>FF D8 FF</code>, un PNG par <code>89 50 4E 47</code>, un PDF par <code>%PDF</code>.</li>
<li><code>strings &lt;fichier&gt;</code> : extrait tous les morceaux de texte lisibles cachés dans un fichier binaire. Un flag y traîne souvent !</li>
<li><code>exiftool &lt;image&gt;</code> : lit les <b>métadonnées</b> d'une photo (appareil, date, position GPS, et parfois un commentaire caché).</li>
</ul>
<div class="box kid"><b>Les métadonnées, c'est quoi ?</b><p>Ce sont les informations « autour » du fichier : qui l'a créé, quand, avec quel appareil, où. Ta propre galerie photo en est pleine. Dans un CTF (et dans la vraie vie !), on y trouve parfois des secrets que l'auteur a oublié d'effacer.</p></div>
<h2>Enquête : recolle le flag</h2>
<p>Trois fichiers suspects t'attendent. Utilise <code>file</code>, <code>strings</code> et <code>exiftool</code> pour trouver les morceaux. (C'est le challenge de cette leçon, juste en dessous.)</p>
<div class="box pro"><b>Pour la vraie vie</b><p>Avant de publier une photo en ligne, pense à ses métadonnées GPS : elles peuvent révéler l'adresse de ta maison. Les réseaux sérieux les effacent, mais pas toujours.</p></div>
`,
quiz:[
{q:'La commande qui révèle le vrai type d\'un fichier ?',o:['ls','file','cat','cd'],a:1},
{q:'strings sert à...',o:['supprimer un fichier','extraire le texte lisible d\'un binaire','chiffrer','lister les dossiers'],a:1},
{q:'Les métadonnées d\'une photo peuvent contenir...',o:['rien d\'intéressant','la date, l\'appareil, parfois la position GPS','le mot de passe Wi-Fi','un virus garanti'],a:1},
{q:'Un vrai fichier PNG commence par les octets...',o:['FF D8 FF','89 50 4E 47','%PDF','HL{'],a:1}],
chal:{titre:'Le puzzle de l\'enquêteur',xp:50,niveau:'moyen',type:'term',term:{user:'recrue',host:'labo',motd:'<span class="hl">Enquete forensic.</span> cat LISEZMOI.txt',fs:(function(){const f=forensicFS();
  f['/home/recrue/indices/photo_suspecte.jpg']={d:'\xff\xd8\xff\xe0 donnees binaires ....',exif:{'Make':'Tecno','Model':'Camon 19','Date/Time Original':'2026:06:15 14:22:03','GPS Position':'6.4969 N, 2.6283 E','User Comment':'3_'},ftype:'JPEG image data'};
  return f})()},
enonce:'<p>Trois fichiers dans le dossier <code>indices</code>. Le flag est en 3 morceaux à recoller <b>dans l\'ordre</b> :</p><ul><li>morceau 1 : dans le binaire <code>programme.bin</code> → <code>strings</code></li><li>morceau 2 : dans les métadonnées de <code>photo_suspecte.jpg</code> → <code>exiftool</code></li><li>morceau 3 : dans <code>note.txt</code> → <code>cat</code></li></ul><p>Colle-les bout à bout, sans rien ajouter.</p>',flag:'HL{forensic_3_outils}',
hints:['strings indices/programme.bin → tu vois « HL{forensic_ » (début du flag).','exiftool indices/photo_suspecte.jpg → le champ « User Comment » donne « 3_ ».','cat indices/note.txt → dernier morceau « outils} ». Recolle tout : HL{forensic_3_outils}'],bravo:'Tu as mené une enquête forensic de bout en bout : file, strings, exiftool.'}},

{id:'m6l3',titre:'OSINT : enquêter en source ouverte',duree:'15 min',
contenu:`
<p><b>OSINT</b> = Open Source INTelligence : trouver des informations à partir de ce qui est <b>public</b> (réseaux sociaux, moteurs de recherche, registres). Pas de piratage : juste de l'observation et de la déduction.</p>
<div class="box kid"><b>Image simple</b><p>Comme un détective qui, sans entrer chez les gens, devine beaucoup juste en observant ce qu'ils laissent traîner dehors : une photo, un commentaire, une date d'anniversaire publiée.</p></div>
<h2>Pourquoi c'est puissant (et dangereux)</h2>
<p>Les gens publient énormément sans réfléchir. Mis bout à bout, ces petits détails permettent de deviner un mot de passe, de répondre à une question secrète, ou de localiser quelqu'un. C'est aussi comme ça que commencent beaucoup d'arnaques.</p>
<h2>Observe ce profil public</h2>
<p>Lis les publications ci-dessous. Cette personne a un mot de passe « facile à retenir » qu'elle a presque donné elle-même...</p>
<div data-widget="osint"></div>
<div class="box warn"><b>La leçon défensive</b><p>Ne publie jamais : le nom de ton animal, ta date de naissance, le modèle de ta première voiture, le nom de ton école... Ce sont exactement les réponses aux « questions secrètes ». Et ne construis jamais un mot de passe à partir d'infos publiques sur toi.</p></div>
`,
quiz:[
{q:'OSINT, c\'est...',o:['pirater des comptes','enquêter à partir d\'informations publiques','un virus','un langage'],a:1},
{q:'Pourquoi l\'OSINT marche si bien ?',o:['les gens publient beaucoup d\'infos sans réfléchir','les ordinateurs sont faibles','c\'est magique','grâce à base64'],a:0},
{q:'Laquelle de ces infos NE faut-il PAS publier ?',o:['ton plat préféré','le nom de ton animal + ton année de naissance','la météo','un paysage'],a:1},
{q:'L\'OSINT implique-t-il de pirater un système ?',o:['oui toujours','non, uniquement des infos publiques','parfois un peu','seulement la nuit'],a:1}],
chal:{titre:'Le profil bavard',xp:45,niveau:'moyen',type:'widget',widget:'osint',
enonce:'<p>En lisant le profil public ci-dessous, reconstitue le mot de passe de Rachida. Elle a expliqué sa « méthode » : <b>le nom de son animal + son année de naissance</b>. Croise ses publications pour trouver les deux. Le flag est <code>HL{animalannée}</code> — le nom de l\'animal en minuscules, collé à l\'année, sans espace.</p><p class="muted">Exemple de format : si l\'animal était « Rex » et l\'année 1990 → HL{rex1990}</p>',flag:'HL{biscotte1998}',
hints:['Le nom de l\'animal (son chat) est dans une publication. L\'année de naissance se déduit de son anniversaire.','Le chat s\'appelle Biscotte. Elle a 28 ans en 2026 → née en 1998.','Le flag : HL{biscotte1998}'],bravo:'Tu comprends maintenant pourquoi protéger sa vie privée en ligne est crucial.'}},

{id:'m6l4',titre:'Ton plan jusqu\'au HackerLab',duree:'10 min',
contenu:`
<p>Tu as parcouru les fondations. Voici comment transformer ça en préparation gagnante. Coche les étapes au fur et à mesure — elles sont enregistrées.</p>
<h2>Les 6 prochains mois</h2>
<div class="roadmap">
<div class="month"><b>Mois 1-2 — Consolider les bases</b>
<div data-widget="checklist" data-id="m1" data-items="Terminer tous les modules de cette plateforme|Refaire les challenges sans indice|Créer un compte TryHackMe et finir le parcours « Pre Security »|Jouer à OverTheWire Bandit (niveaux 0 à 15) pour Linux"></div></div>
<div class="month"><b>Mois 3-4 — Monter en pratique</b>
<div data-widget="checklist" data-id="m2" data-items="Installer Kali Linux dans VirtualBox (ou utiliser la salle en ligne)|Faire 20 challenges sur Root-Me (en français)|Suivre le parcours débutant de PicoCTF|Tenir un carnet de notes de toutes les commandes utiles"></div></div>
<div class="month"><b>Mois 5-6 — Se spécialiser et s'entraîner en conditions réelles</b>
<div data-widget="checklist" data-id="m3" data-items="Choisir 2 catégories fortes (ex : web + crypto) et approfondir|Participer à un petit CTF en ligne (CTFtime liste les événements)|Lire 10 writeups de challenges résolus|S'inscrire à la qualification en ligne du HackerLab (souvent en juin)"></div></div>
</div>
<h2>Les ressources, classées</h2>
<div class="tablewrap"><table><tr><th>Pour...</th><th>Va sur...</th></tr>
<tr><td>Débuter en douceur</td><td>TryHackMe (parcours Pre Security, en anglais simple)</td></tr>
<tr><td>S'entraîner en français</td><td>Root-Me — root-me.org</td></tr>
<tr><td>Apprendre Linux en jouant</td><td>OverTheWire Bandit</td></tr>
<tr><td>CTF pour débutants/élèves</td><td>PicoCTF — picoctf.org</td></tr>
<tr><td>Le web en profondeur</td><td>PortSwigger Web Security Academy (gratuit)</td></tr>
<tr><td>Trouver des CTF en cours</td><td>CTFtime.org</td></tr></table></div>
<div class="box kid"><b>Le mot de la fin</b><p>Tu n'as pas besoin d'être un génie. Tu as besoin de régularité et de ne pas abandonner quand tu bloques. Reviens ici quand tu veux réviser une base. On se retrouve au HackerLab. Dernier flag, pour la route : <b class="mono" style="color:var(--accent)">HL{pret_pour_le_hackerlab}</b></p></div>
`,
quiz:[
{q:'Le meilleur site pour s\'entraîner EN FRANÇAIS ?',o:['TryHackMe','Root-Me','PortSwigger','CTFtime'],a:1},
{q:'Pour apprendre Linux en jouant ?',o:['OverTheWire Bandit','Photoshop','Word','YouTube seulement'],a:0},
{q:'Où trouver la liste des CTF en cours ?',o:['Wikipedia','CTFtime.org','Facebook','nulle part'],a:1},
{q:'Le vrai secret de la réussite ?',o:['être un génie','la régularité et la persévérance','un ordinateur cher','la chance'],a:1}],
chal:{titre:'Prêt pour la mission',xp:30,niveau:'facile',enonce:'<p>Le flag final de ce parcours est caché dans le dernier encadré du cours ci-dessus (« Le mot de la fin »). Trouve-le, valide-le, et considère-toi officiellement en route pour le HackerLab.</p>',flag:'HL{pret_pour_le_hackerlab}',hints:['Relis le tout dernier encadré jaune du cours.'],bravo:'Parcours des fondations terminé. Maintenant, la pratique t\'attend sur les plateformes. Bonne chasse !'}}
]});

/* ---------- PAGES STATIQUES ---------- */
const ARSENAL=`<div class="crumb"><a href="#accueil">QG</a> / Arsenal</div><h1>Arsenal : l'aide-mémoire</h1>
<p class="muted">Toutes les commandes et astuces des cours, réunies ici pour réviser avant le jour J.</p>
<h2>Terminal Linux</h2>
<div class="tablewrap"><table><tr><th>Commande</th><th>Rôle</th></tr>
<tr><td class="mono">pwd</td><td>où suis-je ?</td></tr><tr><td class="mono">ls / ls -a / ls -la</td><td>lister / + cachés / + détails</td></tr>
<tr><td class="mono">cd dossier / cd .. / cd ~</td><td>entrer / remonter / rentrer chez soi</td></tr>
<tr><td class="mono">cat fichier</td><td>afficher un fichier</td></tr><tr><td class="mono">head / tail</td><td>début / fin d'un fichier</td></tr>
<tr><td class="mono">grep -r "HL{" .</td><td>chercher le flag partout</td></tr><tr><td class="mono">find . -name "*.txt"</td><td>chercher un fichier par nom</td></tr>
<tr><td class="mono">file / strings / exiftool</td><td>vrai type / texte caché / métadonnées</td></tr>
<tr><td class="mono">↑ / Tab / Ctrl+L</td><td>commande précédente / compléter / effacer</td></tr></table></div>
<h2>Reconnaître un encodage</h2>
<div class="tablewrap"><table><tr><th>Ça ressemble à...</th><th>C'est...</th><th>Quoi faire</th></tr>
<tr><td class="mono">01001000 01001100</td><td>binaire</td><td>Labo → Binaire → texte</td></tr>
<tr><td class="mono">48 4c 7b</td><td>hexadécimal</td><td>Labo → Hexa → texte</td></tr>
<tr><td class="mono">SEx7fQ==</td><td>base64</td><td>Labo → Base64 → texte</td></tr>
<tr><td class="mono">UY{...} (lettres décalées)</td><td>César / ROT13</td><td>Labo → essayer les 25 décalages</td></tr>
<tr><td class="mono">%48%4C</td><td>encodage URL</td><td>Labo → URL → texte</td></tr>
<tr><td class="mono">32 / 40 / 64 car. hexa</td><td>hash MD5 / SHA-1 / SHA-256</td><td>attaque par dictionnaire</td></tr></table></div>
<h2>Ports réseau</h2>
<div class="tablewrap"><table><tr><td class="mono">22</td><td>SSH</td><td class="mono">80</td><td>HTTP</td><td class="mono">443</td><td>HTTPS</td></tr>
<tr><td class="mono">21</td><td>FTP</td><td class="mono">53</td><td>DNS</td><td class="mono">3306</td><td>MySQL</td></tr></table></div>
<h2>Codes HTTP</h2>
<p><b>200</b> OK · <b>301/302</b> redirection · <b>403</b> interdit · <b>404</b> introuvable · <b>500</b> serveur planté</p>
<h2>La méthode, en 6 pas</h2>
<p>1. Lire l'énoncé 2 fois · 2. Identifier la catégorie · 3. Observer (file, strings, code source) · 4. <code>grep -r "HL{"</code> · 5. Décoder au Labo · 6. Noter, puis indice si bloqué 20 min.</p>`;

const PLAN=`<div class="crumb"><a href="#accueil">QG</a> / Plan</div><h1>Le plan jusqu'au HackerLab</h1>
<p>Le HackerLab est organisé chaque année par l'ASIN : une <b>qualification en ligne</b> (souvent en juin), puis une <b>finale de 48h</b> à Cotonou, en format Capture The Flag. Les épreuves tournent autour de l'exploitation système, du web, du reverse engineering, du forensic et de la crypto.</p>
<div class="box kid"><b>Comment utiliser ce plan</b><p>Coche les étapes au fil des mois (c'est enregistré). Ne saute pas les bases : la régularité bat le talent.</p></div>
<h2>Feuille de route sur 6 mois</h2>
<div class="roadmap">
<div class="month"><b>Mois 1-2 — Fondations</b><div data-widget="checklist" data-id="p1" data-items="Finir tous les modules de cette plateforme|Refaire les challenges sans indice|TryHackMe « Pre Security »|OverTheWire Bandit (Linux en jouant)"></div></div>
<div class="month"><b>Mois 3-4 — Pratique</b><div data-widget="checklist" data-id="p2" data-items="Installer Kali dans VirtualBox|20 challenges sur Root-Me (français)|Parcours débutant PicoCTF|Carnet de notes des commandes"></div></div>
<div class="month"><b>Mois 5-6 — Compétition</b><div data-widget="checklist" data-id="p3" data-items="Se spécialiser dans 2 catégories|Participer à un CTF en ligne (CTFtime)|Lire 10 writeups|S'inscrire à la qualif HackerLab"></div></div>
</div>
<h2>Les plateformes, par ordre</h2>
<div class="tablewrap"><table><tr><th>Étape</th><th>Plateforme</th><th>Pourquoi</th></tr>
<tr><td>1</td><td><a href="https://tryhackme.com">TryHackMe</a></td><td>parcours guidés pour grands débutants</td></tr>
<tr><td>2</td><td><a href="https://overthewire.org/wargames/bandit/">OverTheWire Bandit</a></td><td>Linux en SSH, gratuit, addictif</td></tr>
<tr><td>3</td><td><a href="https://www.root-me.org">Root-Me</a></td><td>des centaines de challenges, en français</td></tr>
<tr><td>4</td><td><a href="https://picoctf.org">PicoCTF</a></td><td>CTF pensé pour les élèves</td></tr>
<tr><td>5</td><td><a href="https://portswigger.net/web-security">PortSwigger Academy</a></td><td>le web en profondeur, gratuit</td></tr>
<tr><td>6</td><td><a href="https://ctftime.org">CTFtime</a></td><td>trouver des CTF en ligne toute l'année</td></tr></table></div>
<p class="muted">Tous ces entraînements sont légaux : les systèmes y sont faits pour être attaqués. C'est la seule façon de s'entraîner — jamais sur un système réel sans autorisation écrite.</p>`;

const GLOSS=[
['flag','Le texte-trésor à trouver dans un challenge. Ici : HL{...}'],
['CTF','Capture The Flag : compétition où l\'on capture des flags cachés.'],
['bit','Le plus petit morceau d\'information : 0 ou 1.'],
['octet (byte)','8 bits. Peut représenter une lettre (via ASCII) ou un nombre de 0 à 255.'],
['ASCII','Table qui associe un numéro à chaque caractère (A=65).'],
['binaire','Écriture avec seulement des 0 et des 1.'],
['hexadécimal','Écriture en base 16 (0-9 puis A-F). Un octet = 2 chiffres hexa.'],
['base64','Encodage (pas un chiffrement !) en lettres/chiffres/+//. Finit souvent par =.'],
['hash','Empreinte à sens unique d\'un texte. Ex : SHA-256 (64 caractères hexa).'],
['chiffrer','Cacher une donnée avec une clé secrète. Différent d\'encoder.'],
['encoder','Changer la forme d\'une donnée, sans secret. Réversible par tous.'],
['César / ROT13','Chiffrement par décalage des lettres de l\'alphabet.'],
['root','Le super-utilisateur tout-puissant sous Linux. « admin » sous Windows.'],
['terminal','Interface où l\'on pilote l\'ordinateur en tapant des commandes.'],
['chemin (path)','Adresse complète d\'un fichier, ex : /home/recrue/notes.txt'],
['IP','Adresse d\'une machine sur un réseau, ex : 192.168.1.50'],
['port','Numéro qui identifie un service sur une machine (80 = web, 22 = SSH).'],
['DNS','Annuaire qui traduit un nom (site.com) en adresse IP.'],
['HTTP / HTTPS','Langage du web. HTTPS = version chiffrée (cadenas).'],
['nmap','Outil pour scanner les ports ouverts d\'une machine.'],
['Wireshark','Outil pour capturer et analyser le trafic réseau.'],
['payload','La charge utile : la donnée ou le code qu\'on envoie pour un test.'],
['cookie','Petit fichier déposé par un site pour te reconnaître.'],
['métadonnées','Informations « autour » d\'un fichier : auteur, date, GPS...'],
['forensic','Enquête numérique sur des fichiers, journaux, captures.'],
['OSINT','Enquête à partir d\'informations publiques (réseaux sociaux...).'],
['phishing','Faux message qui imite un service de confiance pour te piéger.'],
['escalade de privilèges','Passer d\'un petit compte à root/admin sur une machine.'],
['writeup','Solution écrite et expliquée d\'un challenge, par un joueur.'],
['brute force','Essayer des milliers de possibilités jusqu\'à trouver la bonne.'],
['exploit','Programme ou technique qui tire parti d\'une faille.'],
['VM (machine virtuelle)','Un ordinateur simulé à l\'intérieur de ton ordinateur.'],
['Kali Linux','Système Linux rempli d\'outils pour la cybersécurité.'],
];
