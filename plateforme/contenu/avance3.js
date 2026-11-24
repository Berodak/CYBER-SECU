/* ============ EXTENSIONS : reverse +, forensic +, module OSINT ============ */

/* ---- REVERSE ENGINEERING : 2 leçons de plus (module 8) ---- */
(function(){const m8=MODULES.find(m=>m.id==='m8');if(!m8)return;
m8.lessons.push(
{id:'m8l3',titre:'Lire l\'assembleur sans peur',duree:'18 min',
contenu:`
<p>Quand on démonte un programme, on tombe sur l'<b>assembleur</b> (abrégé « asm ») : la liste des instructions que le processeur exécute vraiment. Ça paraît effrayant, mais pour les CTF débutants, il suffit de reconnaître quelques mots.</p>
<div class="box kid"><b>Image simple</b><p>L'assembleur, c'est la recette décomposée en gestes minuscules : « prends l'œuf », « casse l'œuf », « compare la couleur ». Le processeur ne sait faire que des micro-gestes, mais enchaînés très vite. Tu n'as pas à tout lire : juste repérer le moment de la décision.</p></div>
<h2>Le minimum vital</h2>
<div class="tablewrap"><table><tr><th>Instruction</th><th>Ce que ça fait</th></tr>
<tr><td class="mono">mov A, B</td><td>met la valeur B dans A (déplacer)</td></tr>
<tr><td class="mono">cmp A, B</td><td>compare A et B</td></tr>
<tr><td class="mono">je  cible</td><td>« jump if equal » : saute si la comparaison était égale</td></tr>
<tr><td class="mono">jne cible</td><td>« jump if not equal » : saute si c'était différent</td></tr>
<tr><td class="mono">call f</td><td>appelle la fonction f</td></tr></table></div>
<h2>À quoi ressemble une vérification de mot de passe</h2>
<p>Presque tous les challenges « crackme » ont ce motif : on compare ta saisie à une valeur, et un saut décide du résultat.</p>
<pre>  mov   eax, [saisie_utilisateur]
  cmp   eax, "Zinsou229"        ; compare ta saisie au mot de passe
  je    acces_autorise          ; si EGAL -> on saute vers le succes
  call  afficher_rate           ; sinon -> "Raté"
acces_autorise:
  call  afficher_bravo</pre>
<p>Tu vois tout de suite le secret : <code>"Zinsou229"</code>. Le <b>cmp</b> te montre à quoi ta saisie est comparée. C'est là que les débutants trouvent 90 % des flags de reverse.</p>
<div class="box pro"><b>L'astuce du « patch »</b><p>Parfois le mot de passe est calculé et illisible. Alors on triche autrement : on <b>modifie le saut</b>. Transformer <code>je</code> (saute si égal) en <code>jmp</code> (saute toujours) fait accepter n'importe quelle saisie. C'est le « patching », que font les outils comme Ghidra. Tu le découvriras en labo.</p></div>
`,
quiz:[
{q:'L\'instruction cmp sert à...',o:['additionner','comparer deux valeurs','supprimer','afficher'],a:1},
{q:'je signifie...',o:['jump if equal (saute si égal)','join','juste','jamais'],a:0},
{q:'Dans une vérif de mot de passe en asm, où est souvent le secret ?',o:['dans le mov final','dans la valeur du cmp','nulle part','dans je'],a:1},
{q:'« Patcher » un binaire pour le faire accepter n\'importe quoi, c\'est...',o:['supprimer le fichier','transformer le saut conditionnel en saut inconditionnel','chiffrer le code','le recompiler'],a:1}],
chal:{titre:'Le saut qui trahit',xp:45,niveau:'moyen',enonce:`<p>Voici un extrait d'assembleur d'un programme qui vérifie un mot de passe. Lis-le et trouve le mot de passe secret. Le flag est <code>HL{le_mot_de_passe}</code>.</p><pre>  mov   eax, [saisie]
  cmp   eax, "Dantokpa_1958"     ; &lt;-- comparaison
  jne   mauvais                   ; si DIFFERENT -&gt; echec
  call  afficher_flag
mauvais:
  call  afficher_erreur</pre><p>Astuce : le mot de passe est la valeur à laquelle ta saisie est comparée.</p>`,flag:'HL{Dantokpa_1958}',
hints:['Regarde la ligne cmp : ta saisie est comparée à une chaîne entre guillemets.','Cette chaîne EST le mot de passe : Dantokpa_1958.','Le flag : HL{Dantokpa_1958}'],bravo:'Tu sais lire la décision d\'un programme dans son assembleur.'}},

{id:'m8l4',titre:'Les outils, et combiner reverse + crypto',duree:'18 min',
contenu:`
<p>Les vrais reverseurs ont une boîte à outils. Tu n'as pas besoin de la maîtriser aujourd'hui, juste de savoir qui fait quoi.</p>
<div class="tablewrap"><table><tr><th>Outil</th><th>Rôle</th></tr>
<tr><td><b>strings</b></td><td>lire les textes (ton premier réflexe, toujours)</td></tr>
<tr><td><b>file</b></td><td>type du binaire (ELF Linux ? EXE Windows ? 32/64 bits)</td></tr>
<tr><td><b>objdump -d</b></td><td>afficher tout l'assembleur d'un coup</td></tr>
<tr><td><b>gdb</b></td><td>exécuter le programme pas à pas, voir les valeurs en direct</td></tr>
<tr><td><b>Ghidra</b> / <b>IDA</b></td><td>reconstruire un pseudo-code presque lisible depuis le binaire</td></tr></table></table></div>
<h2>Quand le secret est « brouillé »</h2>
<p>Les auteurs malins ne laissent pas le flag en clair. Ils le <b>brouillent</b>, souvent avec un <b>XOR</b> : chaque octet du flag est combiné avec une clé. C'est réversible si tu connais la clé — et la clé est souvent... dans le binaire aussi !</p>
<div class="box kid"><b>Le XOR en une phrase</b><p>XOR, c'est un « ou exclusif » : appliquer deux fois la même clé redonne le texte d'origine. <code>flag XOR clé = charabia</code>, et <code>charabia XOR clé = flag</code>. Pratique pour cacher… et pour retrouver.</p></div>
<h2>La méthode « reverse + crypto »</h2>
<ol><li><code>strings</code> le binaire : tu trouves une <b>clé</b> et un <b>bloc de données en hexa</b>.</li>
<li>Tu vas au <a href="#labo">Labo</a>, opération <b>XOR</b>, tu colles le bloc hexa en entrée et la clé.</li>
<li>Le flag apparaît.</li></ol>
<p>C'est exactement le challenge ci-dessous. Beaucoup de challenges de reverse « moyens » ne sont que ça : lire, puis décoder.</p>
`,
quiz:[
{q:'Quel outil reconstruit un pseudo-code lisible depuis un binaire ?',o:['ping','Ghidra','sort','grep'],a:1},
{q:'Appliquer deux fois la même clé XOR...',o:['détruit les données','redonne le texte d\'origine','double le texte','chiffre en base64'],a:1},
{q:'Si un flag est brouillé par XOR dans un binaire, la clé est souvent...',o:['impossible à trouver','cachée dans le binaire aussi','sur Internet','inutile'],a:1},
{q:'objdump -d sert à...',o:['afficher l\'assembleur du programme','supprimer le binaire','scanner le réseau','lire un cookie'],a:0}],
chal:{titre:'Le flag brouillé',xp:50,niveau:'difficile',type:'term',term:{user:'recrue',host:'reverse-lab',motd:'<span class="hl">strings puis Labo (XOR).</span> cat LISEZMOI.txt',fs:{
'/home/recrue/LISEZMOI.txt':'Le flag de crackme3.bin est brouille par XOR.\n1) strings crackme3.bin  -> tu y liras la CLE et le BLOC hexa\n2) Labo (menu de gauche) -> operation XOR -> entree = bloc hexa, cle = la cle trouvee',
'/home/recrue/crackme3.bin':'\x7fELF\x02\x01\x01\x00programme protege\x00\x00XOR key (un seul caractere ASCII): K\x00\x00donnees (hex): 030730392e3d2e39382e143b273e38142839323b3f2436\x00\x00fin'}},
enonce:'<p>Le programme <code>crackme3.bin</code> cache son flag en le brouillant par <b>XOR</b>. Utilise <code>strings</code> pour trouver la <b>clé</b> et le <b>bloc hexadécimal</b>, puis décode-les dans le <a href="#labo">Labo</a> (opération XOR).</p>',flag:'HL{reverse_plus_crypto}',
hints:['strings crackme3.bin te donne « XOR key ... : K » et « donnees (hex): ... ».','Labo → opération « XOR (entrée en hexa, clé en texte) ». Entrée = le bloc hexa, clé = K.','Le résultat est le flag : HL{reverse_plus_crypto}'],bravo:'Lire PUIS décoder : tu viens de résoudre un vrai challenge de reverse de niveau moyen.'}}
);})();

/* ---- FORENSIC APPROFONDI : 2 leçons de plus (module 9) ---- */
(function(){const m9=MODULES.find(m=>m.id==='m9');if(!m9)return;
m9.lessons.push(
{id:'m9l3',titre:'Les fichiers déguisés (magic numbers)',duree:'15 min',
contenu:`
<p>Tu l'as vu : un fichier peut mentir sur son nom. Allons plus loin. Chaque type de fichier commence par une <b>signature</b> connue (le « magic number »), écrite dans ses premiers octets. C'est elle, pas l'extension, qui dit la vérité.</p>
<div class="tablewrap"><table><tr><th>Type</th><th>Premiers octets (hexa)</th><th>En texte</th></tr>
<tr><td>PNG (image)</td><td class="mono">89 50 4E 47</td><td class="mono">.PNG</td></tr>
<tr><td>JPEG (image)</td><td class="mono">FF D8 FF</td><td class="mono">...</td></tr>
<tr><td>PDF (document)</td><td class="mono">25 50 44 46</td><td class="mono">%PDF</td></tr>
<tr><td>ZIP (archive)</td><td class="mono">50 4B 03 04</td><td class="mono">PK..</td></tr>
<tr><td>ELF (programme Linux)</td><td class="mono">7F 45 4C 46</td><td class="mono">.ELF</td></tr></table></div>
<div class="box kid"><b>Image simple</b><p>L'extension (<code>.pdf</code>, <code>.jpg</code>) est juste l'étiquette collée sur la boîte. Le magic number, c'est ce qu'il y a vraiment <b>dedans</b>. Un attaquant renomme un programme en <code>facture.pdf</code> pour tromper la victime ; l'enquêteur, lui, regarde les vrais octets.</p></div>
<h2>Comment vérifier</h2>
<ul><li><code>file fichier</code> : te donne le vrai type d'un coup.</li>
<li><code>xxd fichier</code> : affiche les octets bruts ; regarde les premiers, ils trahissent la signature.</li></ul>
<p>Le « file carving », c'est récupérer un vrai fichier caché à l'intérieur d'un autre en repérant sa signature. Un outil comme <b>binwalk</b> automatise ça (pour plus tard).</p>
<p>Dans le challenge, un fichier porte une fausse extension. Démasque-le.</p>
`,
quiz:[
{q:'Qu\'est-ce qui dit le VRAI type d\'un fichier ?',o:['son extension','sa signature (magic number) dans ses premiers octets','son nom','sa taille'],a:1},
{q:'Un vrai PDF commence par...',o:['%PDF','PK','.ELF','FF D8'],a:0},
{q:'Quelle commande révèle le vrai type en une fois ?',o:['cat','file','cd','ping'],a:1},
{q:'Récupérer un fichier caché dans un autre via sa signature s\'appelle...',o:['le file carving','le phishing','le scan','le hachage'],a:0}],
chal:{titre:'La fausse facture',xp:45,niveau:'moyen',type:'term',term:{user:'recrue',host:'forensic-lab',motd:'<span class="hl">Un fichier ment sur son extension.</span> cat LISEZMOI.txt',fs:{
'/home/recrue/LISEZMOI.txt':'On a recu une "facture.pdf" suspecte.\nVerifie son VRAI type (file), puis lis ce qu\'elle contient (strings).\nLe flag est cache dedans.',
'/home/recrue/facture.pdf':'\x89PNG\x0d\x0a\x1a\x0a ceci n\'est PAS un PDF, c\'est une image PNG deguisee !\x00donnees\x00HL{une_image_deguisee_en_pdf}\x00IEND'}},
enonce:'<p>Un fichier nommé <code>facture.pdf</code> n\'est pas ce qu\'il prétend. Vérifie son vrai type avec <code>file</code>, puis trouve le flag caché dedans avec <code>strings</code>.</p>',flag:'HL{une_image_deguisee_en_pdf}',
hints:['file facture.pdf → surprise, ce n\'est pas un PDF mais une image PNG.','strings facture.pdf → le flag est écrit dedans.','Flag : HL{une_image_deguisee_en_pdf}'],bravo:'Tu ne te fies plus jamais à une extension.'}},

{id:'m9l4',titre:'Analyser une capture réseau',duree:'18 min',
contenu:`
<p>En forensic réseau, on te donne une <b>capture</b> (fichier <code>.pcap</code>) : l'enregistrement de tout ce qui a circulé. On y retrouve ce qui a été envoyé en clair — y compris des mots de passe, si le site utilisait HTTP.</p>
<div class="box kid"><b>Rappel</b><p>Souviens-toi du module Réseaux : en HTTP (sans « s »), tout passe en clair. Une capture, c'est l'enregistrement de la rue : si quelqu'un a « crié » son mot de passe, il est dans le fichier.</p></div>
<h2>Que cherche-t-on dans une capture ?</h2>
<ul><li>Les requêtes <b>POST</b> (envoi de formulaire) : souvent un <code>login=...&password=...</code>.</li>
<li>Les champs <b>Authorization</b> (parfois un mot de passe encodé en base64).</li>
<li>Des fichiers transférés, des commandes, des messages.</li></ul>
<p>L'outil complet est <b>Wireshark</b> (interface graphique). Mais sur une capture exportée en texte, ton vieil ami <code>grep</code> fait déjà beaucoup : on filtre sur <code>password</code>, <code>POST</code>, <code>login</code>...</p>
<div class="box pro"><b>Astuce</b><p>Wireshark a une fonction « Follow HTTP Stream » qui reconstitue une conversation complète. En CTF, c'est souvent là que le flag se cache : dans l'échange reconstitué entre le client et le serveur.</p></div>
<p>Dans le challenge, une capture texte contient un identifiant envoyé en clair. Retrouve-le avec <code>grep</code>.</p>
`,
quiz:[
{q:'Pourquoi trouve-t-on des mots de passe dans une capture ?',o:['Wireshark les devine','parce qu\'ils ont circulé en clair (HTTP)','c\'est impossible','ils sont inventés'],a:1},
{q:'Quelle requête contient souvent un login/password envoyé ?',o:['GET','POST','PING','DNS'],a:1},
{q:'Sur une capture exportée en texte, quel outil simple aide déjà ?',o:['cat seulement','grep','cd','rm'],a:1},
{q:'La fonction de Wireshark qui reconstitue une conversation ?',o:['Delete Packet','Follow HTTP Stream','Shutdown','Encrypt'],a:1}],
chal:{titre:'Le mot de passe dans la capture',xp:50,niveau:'moyen',type:'term',term:{user:'recrue',host:'forensic-lab',motd:'<span class="hl">Analyse la capture.</span> cat LISEZMOI.txt',fs:{
'/home/recrue/LISEZMOI.txt':'capture.txt est l\'export texte d\'une capture reseau (.pcap).\nUn formulaire de connexion a ete envoye en clair (HTTP).\nRetrouve la ligne du mot de passe avec grep. Le flag commence par HL{.',
'/home/recrue/capture.txt':[
'0.001 192.168.1.10 -> 192.168.1.50 TCP 49201 > 80 [SYN]',
'0.002 192.168.1.50 -> 192.168.1.10 TCP 80 > 49201 [SYN, ACK]',
'0.010 192.168.1.10 -> 192.168.1.50 HTTP GET /login HTTP/1.1',
'0.055 192.168.1.50 -> 192.168.1.10 HTTP 200 OK (formulaire de connexion)',
'3.400 192.168.1.10 -> 192.168.1.50 HTTP POST /login HTTP/1.1',
'3.400   Content-Type: application/x-www-form-urlencoded',
'3.400   utilisateur=directrice&motdepasse=HL{capture_en_clair_http}',
'3.450 192.168.1.50 -> 192.168.1.10 HTTP 302 Found (connexion reussie)',
'4.000 192.168.1.10 -> 8.8.8.8 ICMP Echo request'
].join('\n')}},
enonce:'<p>Le fichier <code>capture.txt</code> est l\'export d\'une capture réseau. Un mot de passe a été envoyé en clair dans une requête POST. Retrouve-le avec <code>grep</code> — le flag EST ce mot de passe.</p>',flag:'HL{capture_en_clair_http}',
hints:['Le mot de passe est dans la ligne du POST. Filtre sur « motdepasse » ou « POST ».','grep motdepasse capture.txt','La ligne montre motdepasse=HL{capture_en_clair_http}'],bravo:'Forensic réseau validé : tu sais extraire un secret d\'une capture.'}}
);})();

/* ---- MODULE 10 : OSINT & RENSEIGNEMENT (dédié) ---- */
MODULES.push({id:'m10',titre:'OSINT & renseignement',cat:'Aller plus loin',badge:'Détective du web',
desc:'Enquêter avec des informations publiques : recherche avancée, géolocalisation, et comment te protéger.',
intro:'<p>Tu as découvert l\'OSINT au module 6. On approfondit maintenant la vraie méthode d\'enquête : chercher mieux que tout le monde, géolocaliser une photo, recouper des traces — et surtout apprendre à effacer les tiennes.</p>',
lessons:[
{id:'m10l1',titre:'Chercher comme un pro (Google dorking)',duree:'15 min',
contenu:`
<p>L'OSINT commence par savoir chercher. Un moteur de recherche n'affiche qu'une partie de ce qu'il connaît — si tu lui parles mieux, il révèle bien plus. Les requêtes avancées s'appellent des <b>Google dorks</b>.</p>
<h2>Les opérateurs qui changent tout</h2>
<div class="tablewrap"><table><tr><th>Dork</th><th>Ce que ça trouve</th></tr>
<tr><td class="mono">"phrase exacte"</td><td>la phrase mot pour mot</td></tr>
<tr><td class="mono">site:ecole.bj</td><td>uniquement les pages d'un site précis</td></tr>
<tr><td class="mono">filetype:pdf</td><td>uniquement des fichiers d'un type (pdf, xlsx...)</td></tr>
<tr><td class="mono">intitle:"index of"</td><td>des dossiers de serveurs laissés ouverts</td></tr>
<tr><td class="mono">inurl:admin</td><td>des pages dont l'adresse contient « admin »</td></tr></table></div>
<p>Combinés, ils deviennent puissants : <code>site:ecole.bj filetype:pdf "mot de passe"</code> cherche des PDF contenant « mot de passe » sur le site de l'école. On découvre ainsi des documents mis en ligne par erreur.</p>
<div class="box warn"><b>Éthique</b><p>Lire un document <b>public</b> est légal. Mais exploiter des données trouvées pour nuire, ou aller fouiller un accès non prévu pour le public, ne l'est pas. L'OSINT observe ; il ne force aucune porte.</p></div>
<div class="box kid"><b>À retenir</b><p>Avant de « pirater » quoi que ce soit, les pros cherchent ce qui traîne déjà en ligne. On est souvent surpris de ce que les gens et les organisations publient sans faire attention.</p></div>
`,
quiz:[
{q:'Un « Google dork », c\'est...',o:['un virus','une requête de recherche avancée','un mot de passe','un réseau'],a:1},
{q:'Que fait filetype:pdf ?',o:['supprime les PDF','ne cherche que des fichiers PDF','crée un PDF','chiffre un PDF'],a:1},
{q:'site:ecole.bj limite la recherche...',o:['à un seul site','à un seul pays','aux images','à rien'],a:0},
{q:'L\'OSINT, éthiquement...',o:['force les accès privés','observe ce qui est public, sans forcer de porte','est toujours illégal','nécessite un mandat'],a:1}],
chal:{titre:'Le document oublié',xp:40,niveau:'facile',enonce:`<p>Un stagiaire a cherché avec le dork <code>site:mairie-exemple.bj filetype:xlsx "identifiants"</code>. Voici un résultat renvoyé par le moteur. Lis-le et trouve le flag qui s'y est retrouvé exposé.</p><div class="browser" style="margin-top:10px"><div class="page" style="font-family:Arial,sans-serif"><p style="color:#1a0dab;font-size:1.05rem;margin:0">comptes_internes.xlsx</p><p style="color:#006621;font-size:.85rem;margin:2px 0">mairie-exemple.bj › documents › comptes_internes.xlsx</p><p style="color:#444;font-size:.9rem;margin:4px 0">... feuille "acces" — utilisateur: accueil ; note de service: ne pas diffuser — code wifi invités: HL{indexe_par_erreur} ; derniere modif ...</p></div></div><p>Le flag est dans l'extrait du document indexé par erreur.</p>`,flag:'HL{indexe_par_erreur}',
hints:['Lis l\'extrait gris du résultat de recherche, après « code wifi invités ».','Le flag est HL{indexe_par_erreur}.'],bravo:'Tu as compris : un simple fichier mal rangé devient public pour toujours.'}},

{id:'m10l2',titre:'Géolocaliser une photo (GeoINT)',duree:'18 min',
contenu:`
<p>Une photo en dit long sur l'endroit où elle a été prise. Les enquêteurs OSINT savent retrouver un lieu à partir d'une simple image — compétence reine dans beaucoup de CTF.</p>
<h2>Deux approches</h2>
<ol>
<li><b>Les métadonnées GPS</b> (le plus direct). Beaucoup de téléphones enregistrent la position exacte dans la photo. On la lit avec <code>exiftool</code> : un champ « GPS Position » donne latitude et longitude.</li>
<li><b>Les indices visuels</b> (quand il n'y a pas de GPS) : panneaux, langue, plaques de voitures, type de végétation, architecture, ombres... On recoupe pour deviner le pays, puis la ville.</li>
</ol>
<div class="box kid"><b>Lire des coordonnées GPS</b><p>Une position, c'est deux nombres : la <b>latitude</b> (Nord/Sud) et la <b>longitude</b> (Est/Ouest). Exemple : <code>6.50 N, 2.63 E</code>. Tu les colles dans une carte (OpenStreetMap, Google Maps) et tu tombes pile sur l'endroit.</p></div>
<h2>Quelques repères au Bénin</h2>
<div class="tablewrap"><table><tr><th>Ville</th><th>Latitude</th><th>Longitude</th></tr>
<tr><td>Cotonou</td><td class="mono">6.37 N</td><td class="mono">2.42 E</td></tr>
<tr><td>Porto-Novo</td><td class="mono">6.50 N</td><td class="mono">2.63 E</td></tr>
<tr><td>Abomey</td><td class="mono">7.18 N</td><td class="mono">1.99 E</td></tr>
<tr><td>Parakou</td><td class="mono">9.34 N</td><td class="mono">2.63 E</td></tr></table></div>
<div class="box warn"><b>Côté protection</b><p>C'est pour ça qu'il ne faut pas publier de photos brutes de chez toi : leurs coordonnées GPS peuvent donner ton adresse exacte. Les bons réseaux sociaux effacent ces données, mais pas tous, et pas si tu envoies la photo par fichier.</p></div>
<p>Dans le challenge, lis le GPS d'une photo avec <code>exiftool</code> et identifie la ville grâce au tableau ci-dessus.</p>
`,
quiz:[
{q:'Quel champ de métadonnées donne le lieu d\'une photo ?',o:['la couleur','la position GPS','le nom du fichier','la taille'],a:1},
{q:'Quelle commande lit les métadonnées d\'une image ?',o:['exiftool','ping','cd','sort'],a:0},
{q:'Sans GPS, comment géolocaliser ?',o:['c\'est impossible','en recoupant les indices visuels (panneaux, architecture...)','en supprimant la photo','avec base64'],a:1},
{q:'Pourquoi ne pas publier une photo brute de chez soi ?',o:['elle est trop lourde','ses coordonnées GPS peuvent révéler ton adresse','elle est floue','aucune raison'],a:1}],
chal:{titre:'Où a été prise la photo ?',xp:50,niveau:'moyen',type:'term',term:{user:'recrue',host:'osint-lab',motd:'<span class="hl">Geolocalise la photo.</span> cat LISEZMOI.txt',fs:{
'/home/recrue/LISEZMOI.txt':'Lis le GPS de la photo avec exiftool, puis identifie la VILLE\ngrace au tableau de reperes du cours (module OSINT, lecon 2).\nLe flag est le nom de la ville en minuscules : HL{ville}',
'/home/recrue/indice.jpg':{d:'\xff\xd8\xff photo',ftype:'JPEG image data',exif:{'Make':'Infinix','Model':'Zero 30','Date/Time Original':'2026:07:01 09:12:44','GPS Position':'6.50 N, 2.63 E','Image Description':'vue du matin'}}}},
enonce:'<p>La photo <code>indice.jpg</code> contient des coordonnées GPS. Lis-les avec <code>exiftool</code>, puis sers-toi du tableau de repères du cours pour trouver la <b>ville</b>. Le flag est le nom de la ville, tout en minuscules : <code>HL{ville}</code>.</p>',flag:'HL{porto-novo}',
hints:['exiftool indice.jpg → champ « GPS Position : 6.50 N, 2.63 E ».','Compare avec le tableau du cours : 6.50 N / 2.63 E correspond à Porto-Novo.','Le flag : HL{porto-novo}'],bravo:'Tu sais géolocaliser une photo par ses métadonnées. Compétence OSINT très prisée.'}},

{id:'m10l3',titre:'Recouper les traces d\'une personne',duree:'18 min',
contenu:`
<p>Le cœur de l'OSINT sur une personne : rassembler des miettes éparpillées (un pseudo par-ci, un commentaire par-là) jusqu'à former une image nette. Aucune de ces miettes n'est secrète ; c'est leur <b>recoupement</b> qui révèle tout.</p>
<div class="box kid"><b>Image simple</b><p>Chaque trace est une pièce de puzzle inoffensive. Mais quelqu'un de patient réunit le pseudo du forum, la photo de profil, la ville, l'école... et reconstitue une personne entière. C'est comme ça que commencent le harcèlement et les arnaques ciblées.</p></div>
<h2>La technique du pseudo réutilisé</h2>
<p>La plupart des gens gardent le <b>même pseudo</b> partout. Trouve-le sur un site, cherche-le sur les autres : forums, anciens blogs, dépôts de code... Des outils comme <b>Sherlock</b> cherchent un pseudo sur des centaines de sites d'un coup.</p>
<h2>Le danger des « questions secrètes »</h2>
<p>« Nom de votre premier animal ? », « École primaire ? », « Ville de naissance ? » : ces réponses sont souvent... publiées sur les réseaux. Un attaquant les récolte par OSINT pour réinitialiser un mot de passe. C'est une des méthodes d'attaque de compte les plus courantes.</p>
<div class="box warn"><b>Ta défense (important)</b><p>1) Un pseudo différent pour tes comptes sensibles. 2) Des réponses de questions secrètes <b>fausses</b> (invente-les, note-les dans un gestionnaire de mots de passe). 3) Réfléchis avant de publier anniversaire, ville, école, nom de ton animal. 4) Active la double authentification (2FA) partout.</p></div>
<p>Dans le challenge, plusieurs traces d'une même personne ont été collectées. Recoupe-les pour trouver le flag.</p>
`,
quiz:[
{q:'Ce qui rend l\'OSINT sur une personne puissant, c\'est...',o:['une seule info secrète','le recoupement de plusieurs infos publiques','le piratage','la chance'],a:1},
{q:'Pourquoi réutiliser le même pseudo partout est risqué ?',o:['ça ralentit','ça permet de relier tous tes comptes entre eux','ça coûte cher','aucun risque'],a:1},
{q:'Pourquoi inventer de fausses réponses aux questions secrètes ?',o:['pour s\'amuser','parce que les vraies réponses sont souvent trouvables en ligne','c\'est obligatoire','pour aller plus vite'],a:1},
{q:'Meilleure protection supplémentaire d\'un compte ?',o:['un pseudo rigolo','la double authentification (2FA)','publier moins de photos de chats','changer d\'e-mail'],a:1}],
chal:{titre:'Le puzzle du pseudo',xp:50,niveau:'moyen',type:'term',term:{user:'recrue',host:'osint-lab',motd:'<span class="hl">Recoupe les traces.</span> cat LISEZMOI.txt',fs:{
'/home/recrue/LISEZMOI.txt':'Dossier "traces" : plusieurs infos publiques sur la meme personne,\nrepere par le pseudo reutilise. Recoupe-les.\nUn des fichiers contient directement le flag (HL{). grep est ton ami.',
'/home/recrue/traces/forum_cuisine.txt':'Pseudo: akassa_dev\nMessage: quelqu\'un a une bonne recette de pate rouge ? merci !',
'/home/recrue/traces/profil_github.txt':'Utilisateur: akassa_dev\nBio: dev junior a Cotonou. Repos publics: site-ecole, todo-app.',
'/home/recrue/traces/vieux_blog.txt':'Auteur: akassa_dev\nArticle 2019: "Mon premier animal etait un chien nomme Pablo"\nNote perso laissee dans le code source de la page: HL{tout_se_recoupe_en_osint}',
'/home/recrue/traces/annonce.txt':'Vendeur: akassa_dev - vend velo, contact par message.'}},
enonce:'<p>Le dossier <code>traces</code> contient plusieurs informations publiques sur une même personne (même pseudo). Recoupe-les : l\'une d\'elles contient un flag laissé par erreur. Trouve-le (pense à <code>grep</code>).</p>',flag:'HL{tout_se_recoupe_en_osint}',
hints:['Tous les fichiers partagent le pseudo akassa_dev. Cherche le flag dans tout le dossier.','grep -r "HL{" traces','Le flag est dans vieux_blog.txt : HL{tout_se_recoupe_en_osint}'],bravo:'Tu as mené une enquête OSINT complète. N\'oublie pas : protège TES propres traces.'}}
]});
