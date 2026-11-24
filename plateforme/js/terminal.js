/* ============ TERMINAL LINUX SIMULÉ ============ */
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

/* Construit un système de fichiers à partir d'une table { "/chemin": "contenu" | {d:"contenu", o:"root", m:"600", x:"handler", suid:true} } */
function buildFS(map, defUser){
  const root={t:'d',c:{},o:'root',m:'755'};
  const base=['/bin','/etc','/home','/root','/tmp','/usr','/usr/bin','/var','/var/log','/dev'];
  base.forEach(p=>mkdirp(root,p,'root'));
  const r=getNode(root,'/root'); r.m='700';
  const tmp=getNode(root,'/tmp'); tmp.m='777';
  addFile(root,'/etc/hostname',{d:'machine\n'});
  addFile(root,'/etc/passwd',{d:'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n'+(defUser&&defUser!=='root'?defUser+':x:1000:1000:'+defUser+':/home/'+defUser+':/bin/bash\n':'')});
  addFile(root,'/etc/shadow',{d:'root:$6$Zk3...:19700:0:99999:7:::\n',m:'640'});
  ['ls','cat','grep','find','bash','sh'].forEach(b=>addFile(root,'/bin/'+b,{d:'\x7fELF binaire',m:'755'}));
  ['base64','sudo','vim','python3','passwd','file','strings','head','tail','wc','sort','uniq','nmap','curl','ssh','su','exiftool','xxd'].forEach(b=>addFile(root,'/usr/bin/'+b,{d:'\x7fELF binaire',m:'755',suid:(b==='sudo'||b==='passwd'||b==='su')}));
  if(defUser && defUser!=='root'){mkdirp(root,'/home/'+defUser,defUser);}
  for(const p in map){
    let v=map[p]; if(typeof v==='string') v={d:v};
    if(p.endsWith('/')){mkdirp(root,p.slice(0,-1),v.o||defUser||'root'); const n=getNode(root,p.slice(0,-1)); if(v.m)n.m=v.m; continue;}
    if(v.o===undefined){ v.o = p.startsWith('/home/'+defUser)?defUser:'root'; }
    addFile(root,p,v);
  }
  return root;
}
function splitP(p){return p.split('/').filter(Boolean)}
function mkdirp(root,p,owner){let n=root;for(const s of splitP(p)){if(!n.c[s])n.c[s]={t:'d',c:{},o:owner||'root',m:'755'};n=n.c[s];}return n}
function addFile(root,p,v){const parts=splitP(p);const name=parts.pop();const dir=mkdirp(root,'/'+parts.join('/'),v.o==='root'?'root':(v.o||'root'));
  const ex=dir.c[name];dir.c[name]={t:'f',d:v.d||'',o:v.o||'root',m:v.m||'644',x:v.x||(ex&&ex.x),suid:v.suid||(ex&&ex.suid),exif:v.exif||(ex&&ex.exif),ftype:v.ftype||(ex&&ex.ftype)}}
function getNode(root,p){let n=root;for(const s of splitP(p)){if(!n||n.t!=='d')return null;n=n.c[s];}return n||null}
function normPath(cwd,p,home){
  if(!p)return cwd; if(p==='~')p=home; else if(p.startsWith('~/'))p=home+p.slice(1);
  const abs=p.startsWith('/')?p:(cwd.replace(/\/$/,'')+'/'+p);
  const out=[];for(const s of abs.split('/')){if(!s||s==='.')continue;if(s==='..')out.pop();else out.push(s);}
  return '/'+out.join('/');
}
function canRead(n,user){if(user==='root')return true;const m=n.m||'644';const d=n.o===user?m[0]:m[2];return (parseInt(d,10)&4)!==0}
function canExec(n,user){if(user==='root')return true;const m=n.m||'644';const d=n.o===user?m[0]:m[2];return (parseInt(d,10)&1)!==0}
function canWrite(n,user){if(user==='root')return true;const m=n.m||'644';const d=n.o===user?m[0]:m[2];return (parseInt(d,10)&2)!==0}
function permStr(n){const map=['---','--x','-w-','-wx','r--','r-x','rw-','rwx'];let s=(n.t==='d'?'d':'-')+(n.m||'644').split('').map(x=>map[+x]).join('');if(n.suid)s=s.slice(0,3)+(s[3]==='x'?'s':'S')+s.slice(4);return s}
function globRe(g){return new RegExp('^'+g.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$')}

/* Découpe une ligne de commande en mots en respectant les guillemets */
function tokenize(line){
  const out=[];let cur='',q=null,has=false;
  for(let i=0;i<line.length;i++){const c=line[i];
    if(q){if(c===q)q=null;else cur+=c;continue}
    if(c==="'"||c==='"'){q=c;has=true;continue}
    if(c==='\\'&&i+1<line.length){cur+=line[++i];has=true;continue}
    if(c===' '||c==='\t'){if(cur||has){out.push(cur);cur='';has=false}continue}
    if(c==='|'){if(cur||has){out.push(cur);cur='';has=false}out.push({op:'|'});continue}
    if(c==='>'){if(cur==='2'){cur='';has=false;out.push({op:'2>'});continue}if(cur||has){out.push(cur);cur='';has=false}if(line[i+1]==='>'){i++;out.push({op:'>>'})}else out.push({op:'>'});continue}
    if(c===';'||c==='&'){if(c==='&'&&line[i+1]==='&')i++;if(cur||has){out.push(cur);cur='';has=false}out.push({op:';'});continue}
    cur+=c;
  }
  if(cur||has)out.push(cur);
  return out;
}

class Terminal{
  constructor(el,cfg,opts){
    this.el=el;this.cfg=cfg||{};this.opts=opts||{};
    const user=this.cfg.user||'recrue';
    this.machines={};
    this.sess=[{user,host:this.cfg.host||'labo',fs:buildFS(this.cfg.fs||{},user),cwd:this.cfg.cwd||(user==='root'?'/root':'/home/'+user),net:this.cfg.net||{},sudo:this.cfg.sudo||{},pw:this.cfg.passwords||{}}];
    this.hist=[];this.hi=0;this.asking=null;this.cmdHistory=[];
    this.render();
    this.print(this.cfg.motd!==undefined?this.cfg.motd:'<span class="dim">Terminal d\'entraînement. Tape </span><span class="hl">help</span><span class="dim"> pour voir les commandes.</span>',true);
    this.newPrompt();
  }
  get S(){return this.sess[this.sess.length-1]}
  home(u){u=u||this.S.user;return u==='root'?'/root':'/home/'+u}
  render(){
    this.el.innerHTML='';this.el.classList.add('term');if(this.opts.tall)this.el.classList.add('tall');
    const bar=document.createElement('div');bar.className='tbar';
    bar.innerHTML='<i style="background:#ef3b4f"></i><i style="background:#fcd116"></i><i style="background:#22b573"></i><span style="margin-left:8px" class="ttl"></span><span class="spacer"></span><button class="btn sm" type="button">Réinitialiser</button>';
    bar.querySelector('button').onclick=()=>{const T=new Terminal(this.el,this.cfg,this.opts);this.el._t=T};
    this.body=document.createElement('div');this.body.className='tbody';this.body.setAttribute('role','log');
    this.el.append(bar,this.body);this.ttl=bar.querySelector('.ttl');
    this.body.addEventListener('click',()=>{const sel=window.getSelection();if(sel&&sel.toString())return;this.input&&this.input.focus()});
  }
  print(html,raw){const d=document.createElement('div');d.className='ln';d.innerHTML=raw?html:esc(html);this.body.insertBefore(d,this.inl||null);this.body.scrollTop=this.body.scrollHeight}
  promptHTML(){const S=this.S;let p=S.cwd;const h=this.home();if(p===h)p='~';else if(p.startsWith(h+'/'))p='~'+p.slice(h.length);
    const r=S.user==='root';return `<span class="${r?'pr-r':'pr-u'}">${esc(S.user)}@${esc(S.host)}</span>:<span class="pr-p">${esc(p)}</span>${r?'#':'$'}`}
  newPrompt(label,secret){
    this.ttl.textContent=this.S.user+'@'+this.S.host;
    const line=document.createElement('div');line.className='in';
    this.curLabel=label!==undefined?`<span>${esc(label)}</span>`:this.promptHTML();
    line.innerHTML=this.curLabel;
    const inp=document.createElement('input');inp.type=secret?'password':'text';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('aria-label','Commande');
    line.appendChild(inp);this.body.appendChild(line);this.inl=line;this.input=inp;
    inp.addEventListener('keydown',e=>this.key(e));
    if(this.opts.autofocus!==false && this._started) inp.focus({preventScroll:true});
    this._started=true;
    this.body.scrollTop=this.body.scrollHeight;
  }
  key(e){
    const inp=this.input;
    if(e.key==='Enter'){
      const v=inp.value;const secret=inp.type==='password';
      const frozen=document.createElement('div');frozen.className='ln';
      frozen.innerHTML=this.curLabel+' '+(secret?'':esc(v));
      this.inl.replaceWith(frozen);this.inl=null;
      if(this.asking){const cb=this.asking;this.asking=null;cb(v);}
      else{if(v.trim()){this.hist.push(v);this.cmdHistory.push(v)}this.hi=this.hist.length;this.run(v);}
      if(!this.asking&&!this._noPrompt)this.newPrompt();this._noPrompt=false;
      this.input&&this.input.focus();
    }else if(e.key==='ArrowUp'){if(this.hi>0){this.hi--;inp.value=this.hist[this.hi];}e.preventDefault()}
    else if(e.key==='ArrowDown'){if(this.hi<this.hist.length-1){this.hi++;inp.value=this.hist[this.hi]}else{this.hi=this.hist.length;inp.value=''}e.preventDefault()}
    else if(e.key==='Tab'){e.preventDefault();this.complete()}
    else if(e.key==='l'&&e.ctrlKey){e.preventDefault();this.clear()}
    else if(e.key==='c'&&e.ctrlKey&&!(window.getSelection()+'')){e.preventDefault();const fr=document.createElement('div');fr.className='ln';fr.innerHTML=this.curLabel+' '+esc(inp.value)+'^C';this.inl.replaceWith(fr);this.inl=null;this.asking=null;this.newPrompt();}
  }
  complete(){
    const v=this.input.value;const parts=v.split(' ');const last=parts.pop();
    const slash=last.lastIndexOf('/');const dirPart=slash>=0?last.slice(0,slash+1):'';const pre=slash>=0?last.slice(slash+1):last;
    const dir=getNode(this.S.fs,normPath(this.S.cwd,dirPart||'.',this.home()));
    let names=[];
    if(parts.length===0&&!dirPart){names=Object.keys(this.cmds()).filter(n=>n.startsWith(pre));}
    else if(dir&&dir.t==='d'){names=Object.keys(dir.c).filter(n=>n.startsWith(pre)&&(pre.startsWith('.')||!n.startsWith('.')||pre!==''));}
    if(names.length===1){const n=names[0];const isD=dir&&dir.c[n]&&dir.c[n].t==='d';parts.push(dirPart+n+(isD?'/':(parts.length?' ':' ')));this.input.value=parts.join(' ')}
    else if(names.length>1){this.print(names.join('  '));let common=names[0];for(const n of names){while(!n.startsWith(common))common=common.slice(0,-1)}parts.push(dirPart+common);this.input.value=parts.join(' ')}
  }
  clear(){this.body.innerHTML='';this.inl=null;if(!this.asking){this.newPrompt();}}
  ask(label,secret,cb){this.asking=cb;this._noPrompt=true;setTimeout(()=>{this.newPrompt(label,secret)},0)}

  resolve(p){return normPath(this.S.cwd,p,this.home())}
  node(p){return getNode(this.S.fs,this.resolve(p))}
  readFile(p,asRoot){
    const n=this.node(p);
    if(!n)return {err:`${p}: Aucun fichier ou dossier de ce nom`};
    if(n.t==='d')return {err:`${p}: est un dossier`};
    if(!asRoot&&!canRead(n,this.S.user))return {err:`${p}: Permission refusée`};
    return {d:n.d,n};
  }

  run(line){
    line=line.trim(); if(!line)return;
    const toks=tokenize(line);
    // séquences ;
    const seqs=[[]];toks.forEach(t=>{if(t&&t.op===';')seqs.push([]);else seqs[seqs.length-1].push(t)});
    for(const seq of seqs){ if(!seq.length)continue; this.runPipeline(seq); if(this._noPrompt)break; }
  }
  runPipeline(toks){
    // redirections
    let outFile=null,append=false;const clean=[];
    for(let i=0;i<toks.length;i++){const t=toks[i];
      if(t&&t.op==='2>'){i++;continue}
      if(t&&(t.op==='>'||t.op==='>>')){outFile=toks[i+1];append=t.op==='>>';i++;continue}
      clean.push(t)}
    const stages=[[]];clean.forEach(t=>{if(t&&t.op==='|')stages.push([]);else stages[stages.length-1].push(t)});
    let stdin=null,out='';
    for(const st of stages){
      if(!st.length){out='bash: erreur de syntaxe près de « | »';break}
      const r=this.exec(st,stdin);
      if(r===undefined){out=null;break}
      if(r&&r.err!==undefined){this.print('<span class="err">'+esc(r.err)+'</span>',true);stdin='';out='';continue}
      stdin=r;out=r;
    }
    if(out===null||out===undefined)return;
    if(outFile&&typeof outFile==='string'){
      const p=this.resolve(outFile);const parent=getNode(this.S.fs,p.replace(/\/[^/]*$/,'')||'/');
      if(!parent||parent.t!=='d'){this.print('<span class="err">bash: '+esc(outFile)+': Aucun fichier ou dossier de ce nom</span>',true);return}
      const ex=getNode(this.S.fs,p);
      if(ex&&!canWrite(ex,this.S.user)||(!ex&&!canWrite(parent,this.S.user))){this.print('<span class="err">bash: '+esc(outFile)+': Permission refusée</span>',true);return}
      const txt=(typeof out==='object'?out.html.replace(/<[^>]+>/g,''):out);
      addFile(this.S.fs,p,{d:(append&&ex?ex.d:'')+txt+(txt.endsWith('\n')?'':'\n'),o:this.S.user,m:'644'});
      return;
    }
    if(typeof out==='object'&&out.html!==undefined){if(out.html)this.print(out.html,true);return}
    if(out!=='' )this.print(String(out).replace(/\n$/,''));
  }
  cmds(){return CMDS}
  exec(argv,stdin){
    let [cmd,...args]=argv.map(a=>typeof a==='string'?a:'');
    if(cmd.includes('/')){
      const n=this.node(cmd);
      if(!n)return {err:`bash: ${cmd}: Aucun fichier ou dossier de ce nom`};
      if(n.t==='d')return {err:`bash: ${cmd}: est un dossier`};
      if(n.x&&EXEC[n.x]){if(!canExec(n,this.S.user))return {err:`bash: ${cmd}: Permission refusée`};return EXEC[n.x].call(this,args,stdin)}
      const base=cmd.split('/').pop();
      if(CMDS[base])cmd=base;else return {err:`bash: ${cmd}: Permission refusée`};
    }
    const f=CMDS[cmd];
    if(!f)return {err:`${cmd} : commande introuvable. Tape help pour la liste.`};
    return f.call(this,args,stdin);
  }
}

function lsLong(name,n){const size=n.t==='d'?4096:(n.d||'').length;return `${permStr(n)} 1 ${n.o.padEnd(8)} ${n.o.padEnd(8)} ${String(size).padStart(6)} nov. 19 ${name}`}
function colorName(name,n){if(n.t==='d')return '<span class="blu">'+esc(name)+'</span>';if(n.x||(n.m&&/[1357]/.test(n.m[0])&&n.m!=='644'))return '<span class="okc">'+esc(name)+'</span>';return esc(name)}
function parseFlags(args){const f=new Set(),rest=[];args.forEach(a=>{if(/^-[a-zA-Z]+$/.test(a))a.slice(1).split('').forEach(x=>f.add(x));else rest.push(a)});return {f,rest}}
function textOf(x){if(x==null)return '';if(typeof x==='object'&&x.html!==undefined)return x.html.replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"');return String(x)}

const HELP=`Commandes disponibles (tape "man <commande>" pour l'aide détaillée) :
  Se repérer   : pwd  ls  cd  whoami  id  hostname  uname  history  clear
  Lire         : cat  head  tail  file  strings  xxd  exiftool
  Chercher     : find  grep
  Transformer  : echo  wc  sort  uniq  cut  base64  rev
  Droits       : chmod  sudo  su  exit
  Réseau       : ip  ping  nmap  curl  ssh
Astuces : flèche ↑ = commande précédente, Tab = complète un nom, Ctrl+L = efface l'écran.`;
const MAN={
  pwd:'pwd — affiche le dossier où tu te trouves (Print Working Directory).',
  ls:'ls [-a] [-l] [dossier] — liste le contenu d\'un dossier.\n  -a : montre aussi les fichiers cachés (ceux qui commencent par un point)\n  -l : affichage détaillé (droits, propriétaire, taille)',
  cd:'cd <dossier> — change de dossier.  cd .. = remonter,  cd ~ = retour à la maison,  cd / = la racine.',
  cat:'cat <fichier> — affiche le contenu d\'un fichier.',
  grep:'grep [-r] [-i] [-n] [-v] [-c] <motif> [fichier...] — cherche les lignes qui contiennent un motif.\n  -r : cherche dans tous les fichiers d\'un dossier\n  -i : ignore majuscules/minuscules\n  -v : garde les lignes qui NE contiennent PAS le motif\n  -n : numéro de ligne   -c : compte',
  find:'find <dossier> [-name "motif"] [-type f|d] [-user nom] [-perm -4000] — cherche des fichiers.\n  Exemple : find / -name "*.txt" 2>/dev/null',
  head:'head [-n N] <fichier> — affiche les N premières lignes (10 par défaut).',
  tail:'tail [-n N] <fichier> — affiche les N dernières lignes.',
  file:'file <fichier> — devine le VRAI type d\'un fichier grâce à ses premiers octets (magic number).',
  strings:'strings <fichier> — extrait les morceaux de texte lisibles d\'un fichier binaire.',
  xxd:'xxd <fichier> — affiche le contenu en hexadécimal.',
  exiftool:'exiftool <image> — affiche les métadonnées d\'une image (auteur, appareil, GPS, commentaire...).',
  echo:'echo <texte> — affiche le texte. Utile avec un pipe :  echo SGVsbG8= | base64 -d',
  wc:'wc [-l] [fichier] — compte les lignes, mots, caractères.',
  sort:'sort [-n] [-r] — trie les lignes.  -n : tri numérique,  -r : ordre inverse.',
  uniq:'uniq [-c] — supprime les doublons qui se suivent.  -c : compte les répétitions. (trie avant avec sort !)',
  cut:'cut -d "séparateur" -f N — garde la N-ième colonne.  Exemple : cut -d " " -f 1',
  base64:'base64 [-d] [fichier] — encode en base64, ou décode avec -d.',
  rev:'rev — inverse chaque ligne (abc devient cba).',
  chmod:'chmod <mode> <fichier> — change les droits.  Exemple : chmod +x script.sh  ou  chmod 755 script.sh',
  sudo:'sudo -l — liste ce que tu as le droit de lancer en tant que root.\nsudo <commande> — lance la commande en tant que root (si autorisé).',
  su:'su <utilisateur> — devenir un autre utilisateur (demande son mot de passe).',
  exit:'exit — quitte le shell actuel (revient à l\'utilisateur ou à la machine précédente).',
  ip:'ip a — affiche tes adresses IP.',
  ping:'ping <ip> — vérifie si une machine répond.',
  nmap:'nmap [-sV] [-p-] <ip> — scanne les ports ouverts d\'une machine.\n  -sV : détecte la version des services   -p- : tous les ports (1-65535)',
  curl:'curl <url> — télécharge une page web et affiche son code.  Exemple : curl http://10.10.10.5/robots.txt',
  ssh:'ssh utilisateur@ip — se connecter à distance à une machine.',
  whoami:'whoami — affiche ton nom d\'utilisateur.',
  id:'id — affiche ton identifiant et tes groupes.',
  history:'history — les commandes que tu as tapées.',
};

const CMDS={
  help(){return HELP},
  man(a){return MAN[a[0]]||(a[0]?`Pas de page de manuel pour ${a[0]}`:'Quelle page ? Exemple : man ls')},
  pwd(){return this.S.cwd},
  whoami(){return this.S.user},
  id(){const u=this.S.user;return u==='root'?'uid=0(root) gid=0(root) groupes=0(root)':`uid=${u==='www-data'?33:1000}(${u}) gid=${u==='www-data'?33:1000}(${u}) groupes=${u==='www-data'?33:1000}(${u})`+(this.cfg.groups?','+this.cfg.groups:'')},
  hostname(){return this.S.host},
  uname(a){return a.includes('-a')?`Linux ${this.S.host} 5.15.0-labo x86_64 GNU/Linux`:'Linux'},
  clear(){this.clear();this._noPrompt=true;return undefined},
  history(){return this.cmdHistory.map((c,i)=>String(i+1).padStart(4)+'  '+c).join('\n')},
  echo(a){return a.filter(x=>x!=='-n'&&x!=='-e').join(' ')},
  cd(a){const t=this.resolve(a[0]||'~');const n=getNode(this.S.fs,t);
    if(!n)return {err:`cd: ${a[0]}: Aucun fichier ou dossier de ce nom`};if(n.t!=='d')return {err:`cd: ${a[0]}: N'est pas un dossier`};
    if(!canExec(n,this.S.user))return {err:`cd: ${a[0]}: Permission refusée`};this.S.cwd=t;return ''},
  ls(args){const {f,rest}=parseFlags(args);const targets=rest.length?rest:['.'];const out=[];
    for(const t of targets){const n=this.node(t);if(!n){out.push(`<span class="err">ls: impossible d'accéder à '${esc(t)}': Aucun fichier ou dossier de ce nom</span>`);continue}
      if(n.t==='f'){out.push(f.has('l')?esc(lsLong(t,n)):colorName(t,n));continue}
      if(!canRead(n,this.S.user)){out.push(`<span class="err">ls: impossible d'ouvrir le répertoire '${esc(t)}': Permission refusée</span>`);continue}
      let names=Object.keys(n.c).sort();if(!f.has('a'))names=names.filter(x=>!x.startsWith('.'));
      if(targets.length>1)out.push(esc(t)+':');
      if(f.has('l')){out.push('total '+names.length*4);if(f.has('a')){out.push(esc(lsLong('.',n)));out.push(esc(lsLong('..',n)))}names.forEach(x=>out.push(esc(lsLong(x,n.c[x])).replace(/ ([^ ]+)$/,' '+colorName(x,n.c[x]))))}
      else{const l=(f.has('a')?['.','..']:[]).map(x=>'<span class="blu">'+x+'</span>').concat(names.map(x=>colorName(x,n.c[x])));if(l.length)out.push(l.join('  '))}}
    return {html:out.join('\n')}},
  cat(a,stdin){if(!a.length)return textOf(stdin);const out=[];for(const p of a){const r=this.readFile(p);if(r.err)return {err:'cat: '+r.err};out.push(r.d.replace(/\n$/,''))}return out.join('\n')},
  head(a,stdin){let n=10;const r=[];for(let i=0;i<a.length;i++){if(a[i]==='-n'){n=+a[++i];}else if(/^-\d+$/.test(a[i]))n=+a[i].slice(1);else r.push(a[i])}
    let t;if(r.length){const x=this.readFile(r[0]);if(x.err)return {err:'head: '+x.err};t=x.d}else t=textOf(stdin);return t.split('\n').slice(0,n).join('\n')},
  tail(a,stdin){let n=10;const r=[];for(let i=0;i<a.length;i++){if(a[i]==='-n'){n=+a[++i];}else if(/^-\d+$/.test(a[i]))n=+a[i].slice(1);else r.push(a[i])}
    let t;if(r.length){const x=this.readFile(r[0]);if(x.err)return {err:'tail: '+x.err};t=x.d}else t=textOf(stdin);const L=t.replace(/\n$/,'').split('\n');return L.slice(Math.max(0,L.length-n)).join('\n')},
  wc(a,stdin){const {f,rest}=parseFlags(a);let t;if(rest.length){const x=this.readFile(rest[0]);if(x.err)return {err:'wc: '+x.err};t=x.d}else t=textOf(stdin);
    const lines=t?t.replace(/\n?$/,'\n').split('\n').length-1:0;if(f.has('l'))return String(lines)+(rest[0]?' '+rest[0]:'');return `${lines} ${t.split(/\s+/).filter(Boolean).length} ${t.length}`+(rest[0]?' '+rest[0]:'')},
  sort(a,stdin){const {f,rest}=parseFlags(a);let t;if(rest.length){const x=this.readFile(rest[0]);if(x.err)return {err:'sort: '+x.err};t=x.d}else t=textOf(stdin);
    let L=t.replace(/\n$/,'').split('\n');if(f.has('n'))L.sort((x,y)=>parseFloat(x)-parseFloat(y));else L.sort();if(f.has('r'))L.reverse();return L.join('\n')},
  uniq(a,stdin){const {f,rest}=parseFlags(a);let t;if(rest.length){const x=this.readFile(rest[0]);if(x.err)return {err:'uniq: '+x.err};t=x.d}else t=textOf(stdin);
    const L=t.replace(/\n$/,'').split('\n');const out=[];let prev=null,c=0;for(const l of L.concat([null])){if(l===prev)c++;else{if(prev!==null)out.push(f.has('c')?String(c).padStart(7)+' '+prev:prev);prev=l;c=1}}return out.join('\n')},
  cut(a,stdin){let d='\t',fi=1,file=null;for(let i=0;i<a.length;i++){if(a[i]==='-d')d=a[++i];else if(a[i].startsWith('-d'))d=a[i].slice(2);else if(a[i]==='-f')fi=+a[++i];else if(a[i].startsWith('-f'))fi=+a[i].slice(2);else file=a[i]}
    let t;if(file){const x=this.readFile(file);if(x.err)return {err:'cut: '+x.err};t=x.d}else t=textOf(stdin);return t.replace(/\n$/,'').split('\n').map(l=>l.split(d)[fi-1]||'').join('\n')},
  rev(a,stdin){let t;if(a[0]){const x=this.readFile(a[0]);if(x.err)return {err:'rev: '+x.err};t=x.d}else t=textOf(stdin);return t.replace(/\n$/,'').split('\n').map(l=>l.split('').reverse().join('')).join('\n')},
  grep(args,stdin){const {f,rest}=parseFlags(args);const pat=rest.shift();if(pat===undefined)return {err:'grep: motif manquant. Exemple : grep mot fichier.txt'};
    let re;try{re=new RegExp(pat.replace(/\\\|/g,'|'),f.has('i')?'i':'')}catch(e){re=new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),f.has('i')?'i':'')}
    const out=[];let count=0;
    const scan=(txt,label)=>{txt.replace(/\n$/,'').split('\n').forEach((l,i)=>{const m=re.test(l);if(m!==f.has('v')){count++;out.push((label?'<span class="blu">'+esc(label)+'</span>:':'')+(f.has('n')?'<span class="okc">'+(i+1)+'</span>:':'')+esc(l).replace(f.has('v')?/$^/:new RegExp('('+re.source.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+')',re.flags+'g'),'<span class="hl">$1</span>'))}})};
    if(!rest.length&&!f.has('r')){scan(textOf(stdin),null)}
    else{const targets=rest.length?rest:['.'];const multi=f.has('r')||targets.length>1;
      for(const t of targets){const n=this.node(t);if(!n){out.push('<span class="err">grep: '+esc(t)+': Aucun fichier ou dossier de ce nom</span>');continue}
        if(n.t==='d'){if(!f.has('r')){out.push('<span class="err">grep: '+esc(t)+': est un dossier (ajoute -r)</span>');continue}
          const walk=(node,path)=>{if(!canRead(node,this.S.user)){return}for(const k of Object.keys(node.c).sort()){const c=node.c[k];const p=(path==='/'?'':path)+'/'+k;if(c.t==='d')walk(c,p);else if(canRead(c,this.S.user))scan(c.d,p.replace(/^\.\//,''))}};
          walk(n,t==='.'?'.':t.replace(/\/$/,''));}
        else{if(!canRead(n,this.S.user)){out.push('<span class="err">grep: '+esc(t)+': Permission refusée</span>');continue}scan(n.d,multi?t:null)}}}
    if(f.has('c'))return String(count);
    return {html:out.join('\n')}},
  find(args){let start='.',i=0;if(args[0]&&!args[0].startsWith('-')){start=args[0];i=1}
    const conds=[];let execArgs=null;
    for(;i<args.length;i++){const a=args[i];
      if(a==='-name'||a==='-iname'){const g=args[++i]||'';const re=globRe(g);const ic=a==='-iname';conds.push((n,name)=>ic?new RegExp(re.source,'i').test(name):re.test(name))}
      else if(a==='-type'){const t=args[++i];conds.push(n=>t==='d'?n.t==='d':n.t==='f')}
      else if(a==='-user'){const u=args[++i];conds.push(n=>n.o===u)}
      else if(a==='-perm'){const p=args[++i];if(/4000/.test(p)||p==='-u=s')conds.push(n=>!!n.suid);else conds.push(()=>true)}
      else if(a==='-exec'){execArgs=args.slice(i+1);break}
    }
    const base=this.node(start);if(!base)return {err:`find: '${start}': Aucun fichier ou dossier de ce nom`};
    const out=[];const errs=[];
    const walk=(n,path,name)=>{if(conds.every(c=>c(n,name)))out.push(path);if(n.t==='d'){if(!canRead(n,this.S.user)&&path!==start){errs.push(path);return}if(!canRead(n,this.S.user)){errs.push(path);return}for(const k of Object.keys(n.c).sort())walk(n.c[k],(path==='/'?'':path)+'/'+k,k)}};
    walk(base,start.replace(/(.)\/$/,'$1'),start.split('/').filter(Boolean).pop()||start);
    if(execArgs){ if(this._asRoot && execArgs.some(x=>/\/bin\/(ba)?sh/.test(x))){ return this.becomeRoot('find'); } return out.join('\n'); }
    return out.join('\n');},
  file(a){if(!a[0])return {err:'file: indique un fichier'};const n=this.node(a[0]);if(!n)return {err:`${a[0]}: cannot open (Aucun fichier de ce nom)`};
    if(n.t==='d')return `${a[0]}: directory`;const d=n.d||'';
    let t='ASCII text';if(n.ftype)t=n.ftype;else if(d.startsWith('\x89PNG'))t='PNG image data, 800 x 600, 8-bit/color RGBA';else if(d.startsWith('\xff\xd8\xff'))t='JPEG image data, JFIF standard 1.01';else if(d.startsWith('PK'))t='Zip archive data';else if(d.startsWith('%PDF'))t='PDF document, version 1.7';else if(d.startsWith('\x7fELF'))t='ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped';else if(d.startsWith('#!'))t='Bourne-Again shell script, ASCII text executable';else if(!d)t='empty';
    return `${a[0]}: ${t}`},
  strings(a){const r=this.readFile(a[0]||'');if(r.err)return {err:'strings: '+r.err};return (r.d.match(/[\x20-\x7e]{4,}/g)||[]).join('\n')},
  xxd(a){const r=this.readFile(a[0]||'');if(r.err)return {err:'xxd: '+r.err};const d=r.d.slice(0,256);const out=[];
    for(let i=0;i<d.length;i+=16){const ch=d.slice(i,i+16);let hex='';for(let j=0;j<16;j++){hex+=j<ch.length?ch.charCodeAt(j).toString(16).padStart(2,'0').slice(-2):'  ';if(j%2)hex+=' '}out.push(i.toString(16).padStart(8,'0')+': '+hex+' '+ch.replace(/[^\x20-\x7e]/g,'.'))}return out.join('\n')+(r.d.length>256?'\n...':'')},
  exiftool(a){const n=this.node(a[0]||'');if(!n)return {err:'Error: File not found - '+(a[0]||'')};if(!n.exif)return `ExifTool Version Number         : 12.40\nFile Name                       : ${a[0]}\nFile Type                       : ${n.d.startsWith('\xff\xd8')?'JPEG':'TXT'}\nWarning                         : Pas de métadonnées intéressantes`;
    return Object.entries(Object.assign({'ExifTool Version Number':'12.40','File Name':a[0]},n.exif)).map(([k,v])=>k.padEnd(32)+': '+v).join('\n')},
  base64(a,stdin){const {f,rest}=parseFlags(a);let t;
    if(rest[0]){const n=this.node(rest[0]);const suid=getNode(this.S.fs,'/usr/bin/base64');const asRoot=this._asRoot||(suid&&suid.suid&&this.cfg.suidBase64);const x=this.readFile(rest[0],asRoot);if(x.err)return {err:'base64: '+x.err};t=x.d}else t=textOf(stdin);
    try{if(f.has('d'))return decodeURIComponent(escape(atob(t.replace(/\s/g,''))));return btoa(unescape(encodeURIComponent(t)))}catch(e){return {err:'base64: entrée invalide'}}},
  chmod(a){if(a.length<2)return {err:'chmod: usage : chmod +x fichier'};const n=this.node(a[1]);if(!n)return {err:`chmod: impossible d'accéder à '${a[1]}'`};
    if(n.o!==this.S.user&&this.S.user!=='root')return {err:`chmod: modification des droits de '${a[1]}': Opération non permise`};
    if(/^\d{3}$/.test(a[0]))n.m=a[0];else if(a[0]==='+x'){n.m=n.m.split('').map(d=>String(+d|1)).join('')}else if(a[0]==='-x'){n.m=n.m.split('').map(d=>String(+d&6)).join('')}else if(a[0]==='+r'){n.m=n.m.split('').map(d=>String(+d|4)).join('')}return ''},
  ip(){return `1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: tun0: <POINTOPOINT,UP> mtu 1500\n    inet ${this.cfg.myip||'10.10.14.7'}/23 scope global tun0`},
  ifconfig(){return CMDS.ip.call(this)},
  ping(a){const ip=a.filter(x=>!x.startsWith('-')&&!/^\d+$/.test(x)||/\./.test(x)).pop();if(!ip)return {err:'ping: indique une adresse IP'};
    if(ip==='127.0.0.1'||ip==='localhost'||this.S.net[ip])return `PING ${ip} 56(84) octets de données.\n64 octets de ${ip}: icmp_seq=1 ttl=63 temps=24.1 ms\n64 octets de ${ip}: icmp_seq=2 ttl=63 temps=23.8 ms\n--- statistiques ping ${ip} ---\n2 paquets transmis, 2 reçus, 0% perte`;
    return `PING ${ip} 56(84) octets de données.\n--- statistiques ping ${ip} ---\n2 paquets transmis, 0 reçus, 100% perte (la machine ne répond pas ou n'existe pas)`},
  nmap(a){const ip=a.filter(x=>!x.startsWith('-')).pop();if(!ip)return {err:'nmap: indique une cible. Exemple : nmap 10.10.10.5'};const sv=a.some(x=>/-s[A-Z]*V|-A/.test(x));const all=a.includes('-p-');
    const h=this.S.net[ip];const head=`Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for ${ip}`;
    if(!h)return head+'\nNote: Host seems down. (aucune machine à cette adresse)';
    const ports=h.ports.filter(p=>all||!p.high);
    let o=head+`\nHost is up (0.024s latency).\nNot shown: ${all?65535-ports.length:1000-ports.length} closed tcp ports (reset)\nPORT      STATE SERVICE${sv?'  VERSION':''}\n`;
    o+=ports.map(p=>(p.p+'/tcp').padEnd(10)+'open  '+p.s.padEnd(8)+(sv?' '+p.v:'')).join('\n');
    if(!all&&h.ports.some(p=>p.high))o+='\n\n(Astuce : seuls les 1000 ports les plus courants ont été scannés. Essaie -p- pour tout scanner.)';
    return o+`\n\nNmap done: 1 IP address (1 host up) scanned`},
  curl(a){const url=a.filter(x=>!x.startsWith('-')).pop();if(!url)return {err:'curl: indique une URL. Exemple : curl http://10.10.10.5/'};
    const m=url.match(/^(?:https?:\/\/)?([^/:]+)(?::(\d+))?(\/.*)?$/);if(!m)return {err:'curl: URL invalide'};
    const [,ip,port='80',path='/']=m;const h=this.S.net[ip];
    if(!h)return {err:`curl: (7) Failed to connect to ${ip} port ${port}: Connexion refusée`};
    const web=(h.http||{})[port];if(!web)return {err:`curl: (7) Failed to connect to ${ip} port ${port}: Connexion refusée`};
    const page=web[path]!==undefined?web[path]:web[path.replace(/\/$/,'')]!==undefined?web[path.replace(/\/$/,'')]:null;
    if(a.includes('-I'))return page===null?'HTTP/1.1 404 Not Found\nServer: Apache/2.4.41':'HTTP/1.1 200 OK\nServer: Apache/2.4.41 (Ubuntu)\nContent-Type: text/html';
    return page===null?'<html><body><h1>404 Not Found</h1>La page demandée n\'existe pas.</body></html>':page},
  ssh(a){const t=a.filter(x=>!x.startsWith('-')).pop();if(!t||!t.includes('@'))return {err:'usage : ssh utilisateur@adresse_ip'};
    const [u,ip]=t.split('@');const h=this.S.net[ip];
    if(!h||!h.ports.some(p=>p.p===22))return {err:`ssh: connect to host ${ip} port 22: Connection refused`};
    const rm=h.ssh;
    this.ask(`${u}@${ip}'s password:`,true,pw=>{
      if(rm&&rm.users[u]!==undefined&&rm.users[u]===pw){
        const key=ip;if(!this.machines[key])this.machines[key]=buildFS(rm.fs,u);
        this.sess.push({user:u,host:rm.host,fs:this.machines[key],cwd:'/home/'+u,net:rm.net||{},sudo:rm.sudo||{},pw:rm.passwords||{},remote:true});
        this.print(`<span class="okc">Connecté !</span> Bienvenue sur ${esc(rm.host)} (Ubuntu 22.04 LTS)\n${rm.motd?esc(rm.motd):''}`,true);
      }else this.print('<span class="err">Permission denied, please try again. (mauvais mot de passe)</span>',true);
    });return undefined},
  su(a){const u=a.filter(x=>x!=='-')[0]||'root';
    if(this.S.user==='root'){this.sess.push(Object.assign({},this.S,{user:u,cwd:this.home(u)}));return ''}
    this.ask('Mot de passe :',true,pw=>{
      if(this.S.pw[u]!==undefined&&this.S.pw[u]===pw){const prev=this.S;this.sess.push({user:u,host:prev.host,fs:prev.fs,cwd:u==='root'?'/root':'/home/'+u,net:prev.net,sudo:prev.sudo,pw:prev.pw});if(!getNode(prev.fs,this.home(u)))this.S.cwd='/';}
      else this.print('su: Échec d\'authentification',false);
      });return undefined},
  exit(){if(this.sess.length>1){const s=this.sess.pop();return s.remote&&this.S.host!==s.host?'Connexion à '+s.host+' fermée.':'exit'}return 'Il n\'y a rien à quitter : tu es déjà dans ton shell principal.'},
  sudo(a){const allowed=this.S.sudo[this.S.user]||[];
    if(a[0]==='-l'){if(!allowed.length)return `Désolé, l'utilisateur ${this.S.user} ne peut pas utiliser sudo sur ${this.S.host}.`;
      return `L'utilisateur ${this.S.user} peut lancer les commandes suivantes sur ${this.S.host} :\n`+allowed.map(c=>'    (root) NOPASSWD: '+c).join('\n')}
    if(!a.length)return {err:'usage : sudo -l   ou   sudo <commande>'};
    if(this.S.user==='root')return this.exec(a,null);
    const bin=a[0];const full=bin.startsWith('/')?bin:(['base64','vim','python3','find','less','cat','nmap'].includes(bin)?(bin==='find'||bin==='cat'?'/usr/bin/'+bin:'/usr/bin/'+bin):bin);
    const ok=allowed.some(c=>c==='ALL'||c===full||c.split('/').pop()===bin.split('/').pop());
    if(!ok)return {err:`Désolé, l'utilisateur ${this.S.user} n'est pas autorisé à exécuter « ${a.join(' ')} » en tant que root sur ${this.S.host}.`};
    const name=bin.split('/').pop();
    if(name==='vim'||name==='vi'){const j=a.join(' ');if(/:!\s*\/bin\/(ba)?sh/.test(j)||/-c\s*['"]?:?!/.test(j))return this.becomeRoot('vim');return 'vim s\'ouvre... (dans ce labo, utilise l\'astuce GTFOBins : sudo vim -c \':!/bin/sh\')'}
    if(name==='python3'){if(/os\.system|pty\.spawn|\/bin\/(ba)?sh/.test(a.join(' ')))return this.becomeRoot('python3');return 'Python 3.10.6'}
    if(name==='less'||name==='more'){return 'less ouvert... (astuce GTFOBins : une fois dans less, tape !/bin/sh — ici, lance directement : sudo less /etc/hosts puis ... essaie plutôt vim ou find)'}
    this._asRoot=true;const sess=this.S;const prevU=sess.user;sess.user='root';
    let r;try{r=this.exec([name].concat(a.slice(1)),null)}finally{sess.user=prevU;this._asRoot=false}
    return r},
};
Terminal.prototype.becomeRoot=function(how){
  const prev=this.S;
  this.sess.push({user:'root',host:prev.host,fs:prev.fs,cwd:prev.cwd,net:prev.net,sudo:prev.sudo,pw:prev.pw});
  return {html:`<span class="okc"># Un shell root s'ouvre grâce à ${esc(how)} ! Tape whoami pour vérifier.</span>`};
};
const EXEC={};
