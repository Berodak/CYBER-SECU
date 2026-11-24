/* ============ MODULE 11 : PRISE DE CONTRÔLE À DISTANCE ============ */
/* Angle : comprendre l'accès distant (légitime ET offensif) pour savoir
   l'utiliser en CTF sur des cibles autorisées, et surtout s'en défendre.
   On n'arme aucun outil : la pratique offensive se fait dans les labos légaux. */

MODULES.push({id:'m11',titre:'Prise de contrôle à distance',cat:'Aller plus loin',badge:'Maître du shell distant',
desc:'Accès distant légitime (SSH, RDP), comment les attaquants obtiennent un shell, et comment détecter et bloquer tout ça.',
intro:'<p>« Prendre la main » sur une machine à distance est le cœur de l\'exploitation système au HackerLab. On apprend les outils légitimes, on comprend les techniques des attaquants pour mieux les <b>détecter</b>, et on s\'entraîne uniquement sur des machines qu\'on a le droit d\'attaquer.</p>',
lessons:[
{id:'m11l1',titre:'L\'accès distant légitime : SSH & RDP',duree:'18 min',
contenu:`
<p>Avant de parler d'attaque, parlons du quotidien : les administrateurs pilotent tous les jours des serveurs qui sont à l'autre bout du monde. C'est normal, voulu, et sécurisé.</p>
<div class="box kid"><b>Image simple</b><p>Un accès distant, c'est une télécommande sécurisée pour un ordinateur qui n'est pas devant toi. Tu tapes tes commandes ici, elles s'exécutent là-bas. Les administrateurs gèrent ainsi des milliers de serveurs sans jamais les toucher physiquement.</p></div>
<h2>Les deux grands outils</h2>
<div class="tablewrap"><table><tr><th>Outil</th><th>Port</th><th>Pour quoi</th></tr>
<tr><td><b>SSH</b> (Secure Shell)</td><td class="mono">22</td><td>contrôle en ligne de commande, chiffré. Le standard sous Linux.</td></tr>
<tr><td><b>RDP</b> (Remote Desktop)</td><td class="mono">3389</td><td>le bureau Windows complet à distance (souris, fenêtres).</td></tr>
<tr><td><b>VNC</b></td><td class="mono">5900</td><td>partage d'écran, multi-plateforme.</td></tr></table></div>
<h2>Se connecter en SSH</h2>
<p>La commande de base :</p>
<pre>ssh utilisateur@adresse_ip</pre>
<p>Il te demande le mot de passe, puis tu es « dans » la machine distante : ton invite change, et tes commandes s'exécutent là-bas. Pour revenir chez toi : <code>exit</code>.</p>
<div class="box pro"><b>Pourquoi c'est central en CTF</b><p>Dans une épreuve d'exploitation système, une fois que tu as trouvé des identifiants (dans un fichier, une capture, une base...), tu les utilises souvent pour te connecter en SSH à la machine cible et récupérer le flag. C'est le passage de la « découverte » à la « prise de contrôle ». C'est exactement l'exercice ci-dessous.</p></div>
<div class="box warn"><b>La limite à ne jamais franchir</b><p>Se connecter à une machine suppose d'en avoir le droit : la tienne, un serveur de labo, une cible de CTF. Se connecter aux identifiants de quelqu'un d'autre sur un vrai système est une intrusion, point.</p></div>
<p>À toi : dans le challenge, scanne la cible, trouve les identifiants laissés sur ta machine, et connecte-toi en SSH pour récupérer le flag.</p>
`,
quiz:[
{q:'SSH sert à...',o:['naviguer sur le web','contrôler une machine à distance en ligne de commande (chiffré)','envoyer des e-mails','scanner des ports'],a:1},
{q:'Sur quel port écoute SSH par défaut ?',o:['80','22','3389','443'],a:1},
{q:'RDP permet d\'accéder à...',o:['au bureau graphique complet d\'une machine Windows','à une base de données','à un routeur','à rien'],a:0},
{q:'En CTF, à quoi servent des identifiants trouvés dans un fichier ?',o:['à rien','souvent à se connecter en SSH à la cible','à chiffrer le flag','à éteindre la machine'],a:1}],
chal:{titre:'Premier accès distant',xp:50,niveau:'moyen',type:'term',term:{user:'recrue',host:'kali',myip:'10.10.14.9',motd:'<span class="hl">Mission : prends la main sur le serveur 10.10.10.20.</span> cat LISEZMOI.txt',
fs:{
'/home/recrue/LISEZMOI.txt':'Objectif : te connecter au serveur interne 10.10.10.20 et lire le flag.\nEtapes :\n  1) nmap 10.10.10.20          (quels services ?)\n  2) cat identifiants.txt       (des identifiants ont ete recuperes)\n  3) ssh <user>@10.10.10.20     (connecte-toi, entre le mot de passe)\n  4) une fois connecte : ls, puis cat flag.txt',
'/home/recrue/identifiants.txt':'Notes de reconnaissance :\nIdentifiants trouves dans une sauvegarde oubliee du serveur interne :\n  utilisateur : admin\n  mot de passe : P@ssw0rd_Interne_2026'
},
net:{'10.10.10.20':{ports:[{p:22,s:'ssh',v:'OpenSSH 8.2p1 Ubuntu'},{p:80,s:'http',v:'Apache 2.4.41'}],
  ssh:{host:'serveur-interne',users:{'admin':'P@ssw0rd_Interne_2026'},motd:'Dernier login : il y a 3 jours.',
    fs:{'/home/admin/flag.txt':'Bravo, tu controles le serveur a distance !\nHL{premier_acces_ssh_reussi}','/home/admin/notes.txt':'Penser a changer ce mot de passe...'}}}}},
enonce:'<p>Tu es sur ta machine Kali. Un serveur interne <code>10.10.10.20</code> t\'attend. Scanne-le avec <code>nmap</code>, récupère les identifiants laissés dans <code>identifiants.txt</code>, puis connecte-toi en <code>ssh</code> pour lire le flag sur le serveur.</p>',flag:'HL{premier_acces_ssh_reussi}',
hints:['nmap 10.10.10.20 montre que le port 22 (ssh) est ouvert.','cat identifiants.txt te donne admin / P@ssw0rd_Interne_2026. Puis : ssh admin@10.10.10.20 (et tape le mot de passe quand il le demande).','Une fois connecté (ton invite devient admin@serveur-interne), fais : ls puis cat flag.txt'],bravo:'Tu viens de faire ta première prise de contrôle à distance, comme dans une vraie épreuve système.'}},

{id:'m11l2',titre:'Comment les attaquants obtiennent un shell',duree:'18 min',
contenu:`
<p>Un attaquant qui a trouvé une faille veut souvent la même chose : un <b>shell</b> (un accès en ligne de commande) sur la machine. Comprendre comment il s'y prend, c'est savoir le repérer.</p>
<h2>Reverse shell vs bind shell</h2>
<div class="box kid"><b>Image simple</b><p>Un <b>bind shell</b>, c'est la machine victime qui ouvre une porte et attend : « frappez, j'ouvre ». Problème pour l'attaquant : les pare-feu bloquent les portes ouvertes entrantes. Alors il utilise un <b>reverse shell</b> : c'est la victime qui <b>appelle l'attaquant</b> (« allô, je me connecte à toi »). Comme les appels sortants sont presque toujours autorisés, ça passe. C'est la technique n°1.</p></div>
<svg viewBox="0 0 560 150" width="100%" style="max-width:560px;display:block;margin:12px auto;background:var(--panel);border:1px solid var(--line);border-radius:8px" role="img" aria-label="Schema reverse shell">
<text x="90" y="30" fill="#fcd116" font-family="Chakra Petch" font-size="14" text-anchor="middle">Victime</text>
<text x="470" y="30" fill="#fcd116" font-family="Chakra Petch" font-size="14" text-anchor="middle">Attaquant</text>
<rect x="40" y="45" width="100" height="55" rx="6" fill="#1b2438" stroke="#2a3550"/><rect x="420" y="45" width="100" height="55" rx="6" fill="#1b2438" stroke="#2a3550"/>
<defs><marker id="rs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#ef3b4f"/></marker></defs>
<line x1="140" y1="72" x2="418" y2="72" stroke="#ef3b4f" stroke-width="2" marker-end="url(#rs)"/>
<text x="280" y="64" fill="#e4e8f1" font-size="12" text-anchor="middle">la victime se connecte VERS l'attaquant</text>
<text x="280" y="92" fill="#93a0bb" font-size="11" text-anchor="middle">(sort par le pare-feu comme un appel normal)</text>
</svg>
<h2>RAT et C2</h2>
<p>Un <b>RAT</b> (Remote Access Trojan) est un logiciel malveillant qui donne le contrôle total d'une machine : fichiers, webcam, frappes clavier. Il se cache souvent dans un faux fichier (« facture.pdf.exe »). Il parle à un serveur de l'attaquant appelé <b>C2</b> (Command & Control) : la machine infectée « appelle la maison » régulièrement pour recevoir des ordres. Ces appels réguliers s'appellent un <b>beacon</b>.</p>
<h2>La persistance</h2>
<p>Après être entré, l'attaquant veut <b>rester</b> même après un redémarrage. Il ajoute son programme aux tâches planifiées (<code>cron</code> sous Linux, le planificateur ou le registre sous Windows) ou aux services qui démarrent automatiquement.</p>
<div class="box warn"><b>Pourquoi on apprend ça ici</b><p>Pour <b>défendre</b>. Un analyste SOC reconnaît un reverse shell à une connexion sortante anormale, un RAT à son beacon régulier, une persistance à une tâche planifiée louche. La pratique offensive (générer un shell, utiliser Metasploit) se fait exclusivement sur les labos autorisés — voir le dossier <code>labo-attaque</code> et TryHackMe. On ne fabrique jamais de maliciel ici.</p></div>
<p>Dans le challenge, tu joues le défenseur : repère le beacon du C2 dans les journaux du pare-feu.</p>
`,
quiz:[
{q:'Pourquoi les attaquants préfèrent-ils un reverse shell ?',o:['il est plus rapide','la victime se connecte vers l\'extérieur, ce que les pare-feu autorisent','il est légal','il ne laisse aucune trace'],a:1},
{q:'Un RAT, c\'est...',o:['un antivirus','un logiciel malveillant de contrôle à distance','un type de câble','un pare-feu'],a:1},
{q:'Le serveur qui pilote les machines infectées s\'appelle...',o:['le DNS','le C2 (Command & Control)','le routeur','le proxy'],a:1},
{q:'La « persistance » permet à l\'attaquant de...',o:['aller plus vite','rester présent même après un redémarrage','chiffrer les fichiers','scanner le réseau'],a:1}],
chal:{titre:'Chasse au beacon',xp:50,niveau:'moyen',type:'term',term:{user:'analyste',host:'soc',motd:'<span class="hl">Analyse défensive.</span> cat LISEZMOI.txt',fs:{
'/home/analyste/LISEZMOI.txt':'Un poste est peut-etre infecte par un RAT.\nVoici le journal du pare-feu (connexions sortantes).\nUn RAT "appelle la maison" a intervalle REGULIER (beacon) vers la MEME IP externe.\nTrouve cette adresse suspecte. Le flag (HL{) est sur la ligne qui la demasque.\nAstuce : grep, sort, uniq -c pour compter les connexions par destination.',
'/home/analyste/firewall.log':(function(){const r=rng(2026);const normal=['93.184.216.34','142.250.0.14','151.101.1.69','140.82.121.4'];const L=[];
  for(let i=0;i<70;i++){const h=String(Math.floor(r()*24)).padStart(2,'0');const m=String(Math.floor(r()*60)).padStart(2,'0');L.push(`2026-11-20 ${h}:${m} ALLOW 10.0.0.15 -> ${normal[Math.floor(r()*normal.length)]}:443 (https)`);}
  // beacon regulier toutes les 10 min vers 45.137.88.9:4444
  for(let k=0;k<12;k++){const m=String(k*5).padStart(2,'0');L.push(`2026-11-20 0${k<2?k:''}${k>=2?'':''}:${m} ALLOW 10.0.0.15 -> 45.137.88.9:4444 (inconnu)`);}
  L.push('2026-11-20 RESUME : 12 connexions identiques vers 45.137.88.9:4444, toutes les 5 min, port 4444 inhabituel = beacon de C2. HL{beacon_regulier_demasque_le_c2}');
  // melange
  for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]];}
  return L.join('\n')})()}},
enonce:'<p>Tu es analyste SOC. Le journal <code>firewall.log</code> contient des connexions sortantes normales... et le <b>beacon</b> régulier d\'un RAT vers son serveur C2 (même IP, intervalle régulier, port inhabituel). Isole l\'activité suspecte avec <code>grep</code> et récupère le flag.</p>',flag:'HL{beacon_regulier_demasque_le_c2}',
hints:['Les connexions normales vont vers le port 443 (https). Cherche ce qui sort de l\'ordinaire — un autre port, répété.','grep 4444 firewall.log : un port inhabituel revient plein de fois vers la même IP (45.137.88.9).','La ligne « RESUME » contient le flag : HL{beacon_regulier_demasque_le_c2}'],bravo:'Tu as détecté un canal de commande à distance comme un vrai défenseur.'}},

{id:'m11l3',titre:'Détecter et se défendre',duree:'15 min',
contenu:`
<p>Savoir comment on prend le contrôle d'une machine sert surtout à <b>empêcher</b> qu'on prenne la tienne. Voici les réflexes du défenseur — et de l'utilisateur prudent.</p>
<h2>Détecter une prise de contrôle</h2>
<ul>
<li><b>Connexions sortantes anormales</b> : vers une IP inconnue, sur un port bizarre (4444, 1337...), à intervalle régulier → beacon de C2.</li>
<li><b>Processus inconnus</b> qui tournent, surtout lancés depuis des dossiers temporaires.</li>
<li><b>Nouvelles tâches planifiées</b> ou programmes au démarrage que tu n'as pas créés → persistance.</li>
<li><b>Nouveaux comptes utilisateurs</b> ou connexions SSH/RDP à des heures anormales.</li>
</ul>
<h2>Se protéger (chez toi comme en entreprise)</h2>
<div class="box pro"><b>Les gestes qui comptent</b><p>1) Mises à jour système à jour (90 % des intrusions exploitent de vieilles failles). 2) Mots de passe longs + double authentification (2FA). 3) Ne jamais ouvrir une pièce jointe ou un « .exe » douteux. 4) Un pare-feu qui bloque les connexions sortantes inattendues. 5) RDP et SSH jamais exposés directement sur Internet sans protection. 6) Un antivirus/EDR à jour.</p></div>
<div class="box kid"><b>Le maillon faible, c'est l'humain</b><p>La plupart des prises de contrôle commencent par un clic : une pièce jointe piégée, un faux logiciel « craqué », un lien de phishing. Le meilleur pare-feu, c'est ta prudence avant de cliquer.</p></div>
<h2>Si tu penses être infecté</h2>
<p>Débrancher le réseau (couper le lien avec le C2), ne pas éteindre tout de suite si c'est une enquête (la mémoire vive contient des preuves), prévenir un adulte/responsable, puis analyser depuis une machine saine.</p>
<p>Dans le challenge, tu inspectes les tâches planifiées d'un poste pour trouver le mécanisme de persistance laissé par un attaquant.</p>
`,
quiz:[
{q:'Quel signe trahit souvent un canal de contrôle à distance (C2) ?',o:['un fond d\'écran changé','des connexions sortantes régulières vers une IP inconnue sur un port bizarre','un ordinateur rapide','une mise à jour'],a:1},
{q:'Par quoi commence la plupart des prises de contrôle ?',o:['un clic de l\'utilisateur (pièce jointe, faux logiciel, phishing)','une panne de courant','une mise à jour','un redémarrage'],a:0},
{q:'Quelle protection est la plus efficace contre les intrusions ?',o:['changer de fond d\'écran','garder son système à jour + 2FA + prudence avant de cliquer','éteindre le Wi-Fi la nuit','utiliser un seul mot de passe partout'],a:1},
{q:'Où un attaquant cache-t-il souvent sa « persistance » ?',o:['dans une tâche planifiée / un programme au démarrage','dans le fond d\'écran','dans la corbeille','dans les favoris'],a:0}],
chal:{titre:'La porte dérobée',xp:50,niveau:'moyen',type:'term',term:{user:'analyste',host:'soc',motd:'<span class="hl">Trouve la persistance.</span> cat LISEZMOI.txt',fs:{
'/home/analyste/LISEZMOI.txt':'Un attaquant a laisse une "porte derobee" qui se relance a chaque demarrage.\nInspecte le fichier des taches planifiees (cron) du poste.\nUne ligne lance un programme suspect vers une IP externe : c\'est la persistance.\nLe flag (HL{) est dans le commentaire de cette ligne.',
'/etc/crontab':[
'# /etc/crontab - taches planifiees du systeme',
'0 2 * * * root /usr/bin/sauvegarde.sh        # sauvegarde quotidienne (normal)',
'30 3 * * 0 root /usr/bin/apt update          # mises a jour (normal)',
'*/5 * * * * www-data /tmp/.maj/update.sh      # SUSPECT: lance depuis /tmp toutes les 5 min -> porte derobee HL{persistance_dans_le_cron}',
'@reboot root /usr/bin/demarrer_services.sh   # services au demarrage (normal)'
].join('\n'),
'/tmp/.maj/update.sh':'#!/bin/bash\n# se reconnecte au serveur de l\'attaquant a chaque execution\n# (contenu malveillant - ne pas executer)'
}},
enonce:'<p>Un poste a été compromis. Une tâche planifiée relance une porte dérobée à intervalle régulier. Inspecte <code>/etc/crontab</code>, repère la ligne suspecte (lancée depuis <code>/tmp</code>, à intervalle court) et récupère le flag dans son commentaire.</p>',flag:'HL{persistance_dans_le_cron}',
hints:['cat /etc/crontab affiche toutes les tâches. Les tâches normales lancent des programmes de /usr/bin.','Une ligne lance un script depuis /tmp/.maj/ toutes les 5 minutes : très suspect.','Le flag est dans le commentaire de cette ligne : HL{persistance_dans_le_cron}'],bravo:'Tu sais repérer comment un attaquant garde la main sur une machine. Défense validée.'}}
]});
