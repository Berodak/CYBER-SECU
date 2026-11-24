/* ============ ÉTAT & PROGRESSION ============ */
const RANKS=[[0,'Recrue'],[150,'Apprenti'],[400,'Explorateur'],[800,'Chasseur de flags'],[1300,'Hacker junior'],[1900,'Pentester'],[2600,'Élite du Lab'],[3300,'Légende du HackerLab']];
const DEF_ST={xp:0,lessons:{},hints:{},road:{},notes:{},days:[],v:1};
let ST=JSON.parse(JSON.stringify(DEF_ST));
const LS_KEY='hackerlab-academie-v1';
try{const s=localStorage.getItem(LS_KEY);if(s)ST=Object.assign(ST,JSON.parse(s))}catch(e){}
let DB=null,saveTimer=null,saving=false,pending=false;
function save(){
  try{localStorage.setItem(LS_KEY,JSON.stringify(ST))}catch(e){}
  if(DB){clearTimeout(saveTimer);saveTimer=setTimeout(pushDB,1200)}
}
async function pushDB(){if(!DB)return;if(saving){pending=true;return}saving=true;try{await DB.set({json:JSON.stringify(ST),xp:ST.xp,at:Date.now()})}catch(e){}saving=false;if(pending){pending=false;pushDB()}}
async function initDB(){
  try{
    if(!window.claude||!window.claude.use)return;
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user)return;const id=await user.id();if(!id)return;
    const ref=db.collection('data/users/'+id).doc('progress');
    let snap=null;await Promise.race([ref.get().then(s=>snap=s),new Promise(r=>setTimeout(r,10000))]);
    let v=snap&&typeof snap.data==='function'?snap.data():snap;
    if(v&&v.json){const remote=JSON.parse(v.json);if((remote.xp||0)>(ST.xp||0)){ST=Object.assign(JSON.parse(JSON.stringify(DEF_ST)),remote);try{localStorage.setItem(LS_KEY,JSON.stringify(ST))}catch(e){}route()}}
    DB=ref;document.getElementById('sync').textContent='Progression synchronisée sur ton compte';pushDB();
  }catch(e){}
}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function touchDay(){const t=today();if(!ST.days.includes(t)){ST.days.push(t);if(ST.days.length>400)ST.days=ST.days.slice(-400);save()}}
function streak(){let n=0;const d=new Date();for(;;){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');if(ST.days.includes(k)){n++;d.setDate(d.getDate()-1)}else break}return n}
function rankOf(xp){let r=RANKS[0],next=null;for(let i=0;i<RANKS.length;i++){if(xp>=RANKS[i][0]){r=RANKS[i];next=RANKS[i+1]||null}}return {name:r[1],min:r[0],next}}
function L(id){return ST.lessons[id]||(ST.lessons[id]={})}
function gain(n,why){const before=rankOf(ST.xp).name;ST.xp+=n;touchDay();save();refreshSide();const after=rankOf(ST.xp).name;
  toast(`+${n} XP — ${why}`+(after!==before?`  ·  Nouveau rang : ${after} !`:''))}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),3200)}

const ALL_LESSONS=()=>MODULES.flatMap(m=>m.lessons.map(l=>Object.assign(l,{mod:m})));
function lessonDone(l){const s=ST.lessons[l.id]||{};return !!(s.r&&(!l.quiz||s.q)&&(!l.chal||s.c))}
function modPct(m){let tot=0,ok=0;m.lessons.forEach(l=>{const s=ST.lessons[l.id]||{};tot+=1+(l.quiz?1:0)+(l.chal?1:0);ok+=(s.r?1:0)+(l.quiz&&s.q?1:0)+(l.chal&&s.c?1:0)});return tot?Math.round(ok/tot*100):0}
function maxXP(){return ALL_LESSONS().reduce((a,l)=>a+10+(l.quiz?20:0)+(l.chal?l.chal.xp:0),0)}
function flagsCount(){return ALL_LESSONS().filter(l=>l.chal&&(ST.lessons[l.id]||{}).c).length}

const BADGES=[
  {id:'first',n:'Premier sang',d:'Capturer ton premier flag',t:()=>flagsCount()>=1},
  {id:'ten',n:'Collectionneur',d:'Capturer 10 flags',t:()=>flagsCount()>=10},
  {id:'twentyfive',n:'Chasseur',d:'Capturer 25 flags',t:()=>flagsCount()>=25},
  {id:'nohint',n:'Cerveau autonome',d:'Résoudre 5 challenges sans indice',t:()=>ALL_LESSONS().filter(l=>l.chal&&(ST.lessons[l.id]||{}).c&&!(ST.hints[l.id])).length>=5},
  {id:'streak3',n:'Régulier',d:'Apprendre 3 jours de suite',t:()=>streak()>=3},
  {id:'streak7',n:'Discipliné',d:'Apprendre 7 jours de suite',t:()=>streak()>=7},
  {id:'explorer',n:'Explorateur',d:'Terminer le labo de navigation Linux',t:()=>(ST.lessons['m2l4']||{}).c},
  {id:'crypto',n:'Décodeur',d:'Capturer 5 flags de crypto/encodage',t:()=>['m1l1','m1l2','m4l1','m4l2','m4l3'].filter(i=>(ST.lessons[i]||{}).c).length>=5},
];
function modBadges(){return MODULES.map(m=>({id:'mod-'+m.id,n:m.badge||m.titre,d:'Terminer le module « '+m.titre+' »',t:()=>modPct(m)===100}))}

/* ============ NAVIGATION ============ */
const $=s=>document.querySelector(s);
function refreshSide(){
  const r=rankOf(ST.xp);$('#rk').textContent=r.name;
  const pct=r.next?Math.round((ST.xp-r.min)/(r.next[0]-r.min)*100):100;
  $('#xpb').style.width=pct+'%';$('#xpt').textContent=ST.xp+' XP';$('#xpn').textContent=r.next?('prochain : '+r.next[1]+' ('+r.next[0]+')'):'rang maximum';
  $('#mods').innerHTML=MODULES.map((m,i)=>{const p=modPct(m);return `<a href="#module-${m.id}" data-r="module-${m.id}"><span class="ico">${String(i).padStart(2,'0')}</span><span>${esc(m.titre)}</span><span class="pct ${p===100?'full':''}">${p}%</span></a>`}).join('');
  markNav();
}
function markNav(){const h=location.hash.slice(1)||'accueil';document.querySelectorAll('.nav a').forEach(a=>{const r=a.dataset.r;let on=r===h;if(h.startsWith('lecon-')){const l=ALL_LESSONS().find(x=>'lecon-'+x.id===h);if(l&&r==='module-'+l.mod.id)on=true}a.classList.toggle('on',on)})}
function route(){
  const h=location.hash.slice(1)||'accueil';const v=$('#view');
  CURRENT=null;
  if(h==='accueil')viewHome(v);
  else if(h==='parcours')viewParcours(v);
  else if(h.startsWith('module-'))viewModule(v,h.slice(7));
  else if(h.startsWith('lecon-'))viewLesson(v,h.slice(6));
  else if(h==='labo')viewLabo(v);
  else if(h==='terminal')viewTerm(v);
  else if(h==='arsenal')viewStatic(v,ARSENAL);
  else if(h==='plan')viewPlan(v);
  else if(h==='glossaire')viewGloss(v);
  else viewHome(v);
  $('.main').scrollTop=0;markNav();$('.side').classList.remove('open');
}
window.addEventListener('hashchange',route);
let CURRENT=null;

function nextLesson(){return ALL_LESSONS().find(l=>!lessonDone(l))}

function viewHome(v){
  const r=rankOf(ST.xp);const nx=nextLesson();const all=ALL_LESSONS();const done=all.filter(lessonDone).length;
  const badges=BADGES.concat(modBadges());const got=badges.filter(b=>b.t()).length;
  v.innerHTML=`<div class="wrap wide">
  <div class="hero">
    <div><div class="crumb">Ton QG d'entraînement</div><h1>Prêt pour le HackerLab ${new Date().getFullYear()+(new Date().getMonth()>=8?1:0)} ?</h1>
    <p class="muted" style="max-width:62ch">Ici, tu apprends la cybersécurité de zéro, comme sur Hack The Box mais en français et pas à pas : un cours expliqué simplement, un quiz, puis un vrai challenge où tu dois trouver un <b>flag</b> au format <code>HL{...}</code>.</p>
    <div class="row">${nx?`<a class="btn pri" href="#lecon-${nx.id}">${done?'Continuer':'Commencer'} : ${esc(nx.titre)}</a>`:'<span class="pill ok">Tout le parcours est terminé. Respect.</span>'}<a class="btn" href="#plan">Voir le plan jusqu'au HackerLab</a></div></div>
    <div class="card" style="min-width:250px"><div class="muted" style="font-size:.8rem">Rang actuel</div><div class="stat" style="color:var(--accent)">${esc(r.name)}</div><div class="bar" style="margin:10px 0 4px"><i style="width:${r.next?Math.round((ST.xp-r.min)/(r.next[0]-r.min)*100):100}%"></i></div><div class="muted" style="font-size:.8rem">${ST.xp} / ${r.next?r.next[0]:ST.xp} XP</div></div>
  </div>
  <div class="grid g3" style="margin-top:22px">
    <div class="card"><div class="stat">${flagsCount()}<small>flags capturés sur ${all.filter(l=>l.chal).length}</small></div></div>
    <div class="card"><div class="stat">${done}<small>leçons terminées sur ${all.length}</small></div></div>
    <div class="card"><div class="stat">${streak()}<small>jour(s) d'affilée — vise 1 heure par jour</small></div></div>
    <div class="card"><div class="stat">${got}<small>badges sur ${badges.length}</small></div></div>
  </div>
  <h2>Ton parcours</h2>
  <div class="grid g2">${MODULES.map((m,i)=>{const p=modPct(m);return `<a class="card modcard" href="#module-${m.id}"><span class="num">MODULE ${String(i).padStart(2,'0')} · ${esc(m.cat)}</span><h3>${esc(m.titre)}</h3><span class="muted" style="font-size:.9rem">${esc(m.desc)}</span><div class="bar"><i style="width:${p}%"></i></div><span class="muted" style="font-size:.78rem">${p}% · ${m.lessons.length} leçons</span></a>`}).join('')}</div>
  <h2>Badges</h2>
  <div class="badges">${badges.map(b=>`<div class="badge ${b.t()?'got':''}"><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`).join('')}</div>
  <p class="muted" style="margin-top:30px;font-size:.85rem" id="sync">Progression enregistrée dans ce navigateur.</p>
  </div>`;
  if(DB)$('#sync').textContent='Progression synchronisée sur ton compte';
}
function viewParcours(v){viewHome(v)}
function viewModule(v,id){
  const m=MODULES.find(x=>x.id===id);if(!m)return viewHome(v);const i=MODULES.indexOf(m);
  v.innerHTML=`<div class="wrap"><div class="crumb"><a href="#accueil">QG</a> / Module ${String(i).padStart(2,'0')}</div><h1>${esc(m.titre)}</h1><p class="muted">${esc(m.desc)}</p>
  ${m.intro?`<div class="box kid"><b>Pourquoi c'est important</b>${m.intro}</div>`:''}
  <div class="grid" style="margin-top:18px">${m.lessons.map((l,j)=>{const s=ST.lessons[l.id]||{};const d=lessonDone(l);return `<a class="card modcard" href="#lecon-${l.id}"><span class="num">LEÇON ${i}.${j+1} · ${esc(l.duree||'15 min')}${l.chal?' · challenge '+l.chal.xp+' XP':''}</span><h3>${esc(l.titre)}</h3><div class="row"><span class="pill ${s.r?'ok':''}">cours</span>${l.quiz?`<span class="pill ${s.q?'ok':''}">quiz</span>`:''}${l.chal?`<span class="pill ${s.c?'ok':'y'}">${s.c?'flag capturé':'flag à trouver'}</span>`:''}${d?'<span class="pill ok">terminée</span>':''}</div></a>`}).join('')}</div></div>`;
}

function viewLesson(v,id){
  const all=ALL_LESSONS();const idx=all.findIndex(x=>x.id===id);if(idx<0)return viewHome(v);
  const l=all[idx];const m=l.mod;const mi=MODULES.indexOf(m);const li=m.lessons.indexOf(l);const s=L(l.id);CURRENT=l;
  const prev=all[idx-1],next=all[idx+1];
  v.innerHTML=`<div class="wrap lesson">
  <div class="crumb"><a href="#accueil">QG</a> / <a href="#module-${m.id}">${esc(m.titre)}</a> / Leçon ${mi}.${li+1}</div>
  <h1>${esc(l.titre)}</h1>
  <div class="steps"><span class="step ${s.r?'done':''}">1 · Cours</span>${l.quiz?`<span class="step ${s.q?'done':''}">2 · Quiz</span>`:''}${l.chal?`<span class="step ${s.c?'done':''}">${l.quiz?3:2} · Challenge</span>`:''}<span class="pill">${esc(l.duree||'15 min')}</span></div>
  <div class="content">${l.contenu}</div>
  <div class="row" style="margin-top:20px"><button class="btn ${s.r?'':'pri'}" id="readbtn" type="button" ${s.r?'disabled':''}>${s.r?'Cours validé':"J'ai lu et compris (+10 XP)"}</button></div>
  ${l.quiz?`<div class="section"><h2>Quiz</h2><p class="muted">Réponds à toutes les questions. Une erreur ? Pas grave, lis l'explication et réessaie.</p><div id="quiz"></div><div class="msg" id="quizmsg"></div></div>`:''}
  ${l.chal?`<div class="section"><h2>Challenge</h2><div class="chal"><h3>${esc(l.chal.titre)} <span class="pill y">${l.chal.xp} XP</span> <span class="pill">${esc(l.chal.niveau||'facile')}</span></h3>${l.chal.enonce}<div id="chalzone"></div>
    <div class="flagrow"><input type="text" id="flag" placeholder="HL{...}" aria-label="Ton flag" autocomplete="off" spellcheck="false"><button class="btn pri" id="flagbtn" type="button">Valider le flag</button></div><div class="msg" id="flagmsg"></div>${s.c?'<div class="solved-banner">Flag capturé ! Tu peux rejouer le challenge autant que tu veux.</div>':''}
    <div class="hints" id="hints"></div></div></div>`:''}
  <div class="section notes"><h2>Mes notes</h2><p class="muted">Un vrai hacker prend toujours des notes : commandes utiles, ce qui a marché, ce qui a raté. Elles restent enregistrées ici.</p><textarea id="notes" aria-label="Mes notes sur cette leçon" placeholder="Ex : ls -a montre les fichiers cachés...">${esc(ST.notes[l.id]||'')}</textarea></div>
  <div class="pager">${prev?`<a class="btn" href="#lecon-${prev.id}">◀ ${esc(prev.titre)}</a>`:'<span></span>'}${next?`<a class="btn pri" href="#lecon-${next.id}">${esc(next.titre)} ▶</a>`:'<a class="btn pri" href="#accueil">Retour au QG</a>'}</div>
  </div>`;
  mountWidgets(v);
  $('#readbtn').onclick=e=>{if(!s.r){s.r=1;gain(10,'cours lu');e.target.disabled=true;e.target.textContent='Cours validé';e.target.classList.remove('pri');updateSteps(l)}};
  $('#notes').addEventListener('input',e=>{ST.notes[l.id]=e.target.value;save()});
  if(l.quiz)renderQuiz(l);
  if(l.chal)renderChal(l);
}
function updateSteps(l){const s=ST.lessons[l.id]||{};const st=document.querySelectorAll('.steps .step');if(st[0])st[0].classList.toggle('done',!!s.r);let i=1;if(l.quiz){st[i]&&st[i].classList.toggle('done',!!s.q);i++}if(l.chal&&st[i])st[i].classList.toggle('done',!!s.c);refreshSide()}

function renderQuiz(l){
  const box=$('#quiz');const s=L(l.id);const answered={};
  box.innerHTML=l.quiz.map((q,i)=>`<div class="quizq" data-i="${i}"><div class="q">${i+1}. ${q.q}</div><div class="opts">${q.o.map((o,j)=>`<button class="opt" type="button" data-j="${j}">${o}</button>`).join('')}</div><div class="why" hidden></div></div>`).join('');
  box.addEventListener('click',e=>{const b=e.target.closest('.opt');if(!b)return;const qd=b.closest('.quizq');const i=+qd.dataset.i,j=+b.dataset.j;const q=l.quiz[i];
    qd.querySelectorAll('.opt').forEach(x=>x.classList.remove('good','wrong'));
    const why=qd.querySelector('.why');why.hidden=false;
    if(j===q.a){b.classList.add('good');why.innerHTML='<b style="color:var(--ok)">Exact !</b> '+(q.w||'');answered[i]=true}
    else{b.classList.add('wrong');why.innerHTML='<b style="color:var(--bad)">Pas tout à fait.</b> '+(q.f||'Relis le cours et réessaie.');answered[i]=false}
    const ok=l.quiz.every((_,k)=>answered[k]);
    if(ok&&!s.q){s.q=1;gain(20,'quiz réussi');$('#quizmsg').className='msg ok';$('#quizmsg').textContent='Quiz réussi !';updateSteps(l)}
    else if(ok){$('#quizmsg').className='msg ok';$('#quizmsg').textContent='Quiz réussi (déjà validé).'}
  });
}
function renderChal(l){
  const c=l.chal;const s=L(l.id);const zone=$('#chalzone');
  if(c.type==='term'){const d=document.createElement('div');zone.appendChild(d);d._t=new Terminal(d,c.term,{tall:true})}
  else if(c.type==='widget'){const d=document.createElement('div');zone.appendChild(d);WIDGETS[c.widget](d,l)}
  const hb=$('#hints');const used=ST.hints[l.id]||0;
  const drawHints=()=>{const u=ST.hints[l.id]||0;hb.innerHTML=(c.hints||[]).slice(0,u).map((h,i)=>`<div class="hint"><b>Indice ${i+1} :</b> ${h}</div>`).join('')+((c.hints||[]).length>u?`<div><button class="btn sm" type="button" id="hintbtn">Je bloque : voir l'indice ${u+1}/${c.hints.length}${s.c?'':' (−5 XP sur ce challenge)'}</button></div>`:'')
    const b=$('#hintbtn');if(b)b.onclick=()=>{ST.hints[l.id]=(ST.hints[l.id]||0)+1;save();drawHints()}};
  drawHints();
  const check=()=>{const val=$('#flag').value.trim();const msg=$('#flagmsg');
    if(!val){msg.className='msg bad';msg.textContent='Écris le flag dans la case.';return}
    if(val.toLowerCase()===c.flag.toLowerCase()){
      msg.className='msg ok';
      if(!s.c){s.c=1;const pts=Math.max(5,c.xp-5*(ST.hints[l.id]||0));if(!s.r){s.r=1;}gain(pts,'flag capturé !');msg.innerHTML='<b>Bravo, flag correct !</b> '+(c.bravo||'')+' (+'+pts+' XP)';updateSteps(l)}
      else msg.innerHTML='<b>Correct</b> (déjà capturé). '+(c.bravo||'');
    }else if(!/^HL\{.*\}$/i.test(val)){msg.className='msg bad';msg.textContent='Le format attendu est HL{...} : recopie le flag en entier, accolades comprises.'}
    else{msg.className='msg bad';msg.textContent='Ce n\'est pas le bon flag. Continue de chercher, ou demande un indice.'}};
  $('#flagbtn').onclick=check;$('#flag').addEventListener('keydown',e=>{if(e.key==='Enter')check()});
}
function mountWidgets(root){root.querySelectorAll('[data-widget]').forEach(el=>{const w=WIDGETS[el.dataset.widget];if(w)w(el)});
  root.querySelectorAll('[data-term]').forEach(el=>{const cfg=TERMS[el.dataset.term];if(cfg)el._t=new Terminal(el,cfg,{})})}

/* ============ WIDGETS ============ */
const WIDGETS={
  lamps(el){let v=0;const draw=()=>{const bits=[128,64,32,16,8,4,2,1];
    el.innerHTML=`<div class="card"><div class="lamps">${bits.map(b=>`<div class="lamp"><button type="button" class="${v&b?'on':''}" data-b="${b}" aria-label="Bit de valeur ${b}">${v&b?1:0}</button><small>${b}</small></div>`).join('')}</div>
    <div class="row"><span>Binaire : <span class="bigout">${v.toString(2).padStart(8,'0')}</span></span><span>Décimal : <span class="bigout">${v}</span></span><span>Hexa : <span class="bigout">${v.toString(16).toUpperCase().padStart(2,'0')}</span></span><span>Lettre ASCII : <span class="bigout">${v>=32&&v<127?esc(String.fromCharCode(v)):'·'}</span></span></div>
    <p class="muted" style="font-size:.85rem;margin-bottom:0">Clique sur les lampes pour les allumer (1) ou les éteindre (0). Essaie de fabriquer la lettre <b>A</b> (65) : allume 64 et 1.</p></div>`;
    el.querySelectorAll('button[data-b]').forEach(b=>b.onclick=()=>{v^=+b.dataset.b;draw();el.querySelector(`button[data-b="${b.dataset.b}"]`).focus()})};draw()},
  caesar(el){const txt=el.dataset.text||'KHOOR';el.innerHTML=`<div class="card"><label for="cz-s">Décalage : <b id="cz-v">0</b></label><input type="range" id="cz-s" min="0" max="25" value="0" style="width:100%;accent-color:var(--accent)"><p>Message chiffré : <span class="mono">${esc(txt)}</span></p><p>Décalé de <span id="cz-v2">0</span> vers l'arrière : <span class="bigout" id="cz-o">${esc(txt)}</span></p></div>`;
    const s=el.querySelector('#cz-s');s.oninput=()=>{const k=+s.value;el.querySelector('#cz-v').textContent=k;el.querySelector('#cz-v2').textContent=k;el.querySelector('#cz-o').textContent=caesar(txt,-k)}},
  handshake(el){el.innerHTML=`<div class="card" style="overflow-x:auto"><svg viewBox="0 0 560 230" width="100%" style="max-width:560px;display:block;margin:auto" role="img" aria-label="Poignée de main TCP en trois étapes">
    <text x="70" y="22" fill="#fcd116" font-family="Chakra Petch" font-size="15" text-anchor="middle">Toi (client)</text><text x="490" y="22" fill="#fcd116" font-family="Chakra Petch" font-size="15" text-anchor="middle">Serveur</text>
    <line x1="70" y1="32" x2="70" y2="220" stroke="#2a3550" stroke-width="2"/><line x1="490" y1="32" x2="490" y2="220" stroke="#2a3550" stroke-width="2"/>
    <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#5cb8ff"/></marker></defs>
    <line x1="72" y1="60" x2="486" y2="95" stroke="#5cb8ff" stroke-width="2" marker-end="url(#ar)"/><text x="280" y="68" fill="#e4e8f1" font-size="13" text-anchor="middle">1. SYN — « Allô, tu m'entends ? »</text>
    <line x1="488" y1="120" x2="74" y2="155" stroke="#22b573" stroke-width="2" marker-end="url(#ar)"/><text x="280" y="128" fill="#e4e8f1" font-size="13" text-anchor="middle">2. SYN-ACK — « Oui je t'entends, et toi ? »</text>
    <line x1="72" y1="180" x2="486" y2="215" stroke="#5cb8ff" stroke-width="2" marker-end="url(#ar)"/><text x="280" y="190" fill="#e4e8f1" font-size="13" text-anchor="middle">3. ACK — « Oui ! On peut parler. »</text></svg></div>`},
  osi(el){const rows=[['7','Application','Ce que tu utilises : le site web, l\'e-mail','HTTP, DNS, SSH, FTP'],['6','Présentation','Traduire, chiffrer, compresser','TLS, encodages'],['5','Session','Ouvrir/fermer une conversation','sessions'],['4','Transport','Découper en paquets et numéroter, choisir la porte (port)','TCP, UDP'],['3','Réseau','Trouver le chemin, adresses IP','IP, ICMP (ping)'],['2','Liaison','Parler à la machine d\'à côté, adresses MAC','Ethernet, Wi-Fi'],['1','Physique','Les câbles, les ondes, les 0 et 1 électriques','câble, fibre, radio']];
    el.innerHTML='<div class="tablewrap"><table><tr><th>Couche</th><th>Nom</th><th>Comme si...</th><th>Exemples</th></tr>'+rows.map(r=>`<tr><td class="mono">${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td><td class="mono">${r[3]}</td></tr>`).join('')+'</table></div>'},
  cracker(el){const words='123456 password azerty soleil cotonou benin229 iloveyou football princesse dragon 000000 motdepasse bonjour chocolat abc123 superman doudou qwerty marseille admin welcome monkey loulou jesus2020 amour 111111 nicolas toto1234 bebe porto-novo'.split(' ');
    const target='8b9200b2cd16cb81b61273ce74d318e75e820d8613682c9658ee13b533d35f54';
    el.innerHTML=`<div class="card"><p class="muted" style="margin-top:0">Hash volé (SHA-256) :</p><p class="mono" style="word-break:break-all;color:var(--accent)">${target}</p><p class="muted">Mini-dictionnaire (${words.length} mots — le vrai <i>rockyou.txt</i> en contient 14 millions !)</p><button class="btn pri" type="button" id="crk">Lancer l'attaque par dictionnaire</button><pre id="crko" style="max-height:240px;overflow:auto;margin-top:10px" hidden></pre></div>`;
    el.querySelector('#crk').onclick=async()=>{const o=el.querySelector('#crko');o.hidden=false;o.textContent='';
      for(const w of words){const h=await sha256(w);o.textContent+=`${w.padEnd(12)} → ${h.slice(0,24)}...  ${h===target?'<<< CORRESPONDANCE TROUVÉE !':'non'}\n`;o.scrollTop=o.scrollHeight;await new Promise(r=>setTimeout(r,90));if(h===target){o.textContent+=`\nLe mot de passe est : ${w}\nFlag : HL{${w}}`;break}}}},
  packets(el){const P=[
    ['1','0.000','192.168.1.15','192.168.1.1','DNS','Requête : intranet.ecole.bj ?','Le PC demande l\'adresse IP de intranet.ecole.bj (comme chercher un numéro dans l\'annuaire).'],
    ['2','0.012','192.168.1.1','192.168.1.15','DNS','Réponse : 192.168.1.50','Le serveur DNS répond : intranet.ecole.bj = 192.168.1.50'],
    ['3','0.020','192.168.1.15','192.168.1.50','TCP','49822 → 80 [SYN]','Début de la poignée de main TCP vers le port 80 (HTTP).'],
    ['4','0.021','192.168.1.50','192.168.1.15','TCP','80 → 49822 [SYN, ACK]','Le serveur accepte.'],
    ['5','0.022','192.168.1.15','192.168.1.50','TCP','49822 → 80 [ACK]','Connexion établie.'],
    ['6','0.025','192.168.1.15','192.168.1.50','HTTP','GET /login HTTP/1.1','GET /login HTTP/1.1\nHost: intranet.ecole.bj\nUser-Agent: Mozilla/5.0'],
    ['7','0.041','192.168.1.50','192.168.1.15','HTTP','HTTP/1.1 200 OK (text/html)','HTTP/1.1 200 OK\nContent-Type: text/html\n\n<form method="POST" action="/login">...'],
    ['8','4.870','192.168.1.15','192.168.1.50','HTTP','POST /login HTTP/1.1 (application/x-www-form-urlencoded)','POST /login HTTP/1.1\nHost: intranet.ecole.bj\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 44\n\nusername=directrice&password=Ouidah_Plage_2026'],
    ['9','4.902','192.168.1.50','192.168.1.15','HTTP','HTTP/1.1 302 Found','HTTP/1.1 302 Found\nLocation: /tableau-de-bord\nSet-Cookie: session=7f3a9b...'],
    ['10','5.300','192.168.1.15','8.8.8.8','ICMP','Echo (ping) request','Un ping vers 8.8.8.8 (serveur DNS de Google).'],
    ['11','5.324','8.8.8.8','192.168.1.15','ICMP','Echo (ping) reply','Réponse au ping.'],
    ['12','6.100','192.168.1.15','192.168.1.50','TLS','Client Hello','Début d\'une connexion chiffrée HTTPS : à partir d\'ici, on ne peut plus lire le contenu.']];
    el.innerHTML=`<div class="card" style="padding:10px"><div class="tablewrap"><table class="packets"><tr><th>N°</th><th>Temps</th><th>Source</th><th>Destination</th><th>Protocole</th><th>Info</th></tr>${P.map((p,i)=>`<tr data-i="${i}" tabindex="0"><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td><td>${esc(p[5])}</td></tr>`).join('')}</table></div><pre id="pk" style="margin-top:10px">Clique sur un paquet pour voir son contenu.</pre></div>`;
    el.querySelectorAll('tr[data-i]').forEach(tr=>{const f=()=>{el.querySelectorAll('tr').forEach(x=>x.classList.remove('sel'));tr.classList.add('sel');el.querySelector('#pk').textContent=P[+tr.dataset.i][6]};tr.onclick=f;tr.onkeydown=e=>{if(e.key==='Enter')f()}})},
  osint(el){const posts=[
    ['Rachida Akpovi','Comptable chez SoftBénin · Cotonou','12 mars 2026','Trop fière : 5 ans chez SoftBénin aujourd\'hui ! Merci à toute l\'équipe.'],
    ['Rachida Akpovi','','3 avril 2026','Ma petite Biscotte a encore dormi sur le clavier... Ce chat se prend pour la patronne.'],
    ['Rachida Akpovi','','18 juin 2026','Joyeux anniversaire à moi ! 28 ans aujourd\'hui, la vie est belle. Merci pour vos messages.'],
    ['Rachida Akpovi','','2 août 2026','Le service informatique nous oblige à changer de mot de passe tous les 3 mois. Heureusement j\'ai mon astuce : le nom de mon animal + mon année de naissance, impossible à oublier !'],
    ['Koffi D.','Collègue','2 août 2026','@Rachida chut, ne dis pas ça sur Internet !'],
  ];
  el.innerHTML='<div class="feed">'+posts.map(p=>`<div class="post"><div class="who2">${esc(p[0])}</div>${p[1]?`<div class="when">${esc(p[1])}</div>`:''}<div class="when">${esc(p[2])}</div><p style="margin:.4em 0 0">${esc(p[3])}</p></div>`).join('')+'</div>'},
  checklist(el){const items=(el.dataset.items||'').split('|');const k='cl-'+el.dataset.id;el.innerHTML='<div class="card roadmap">'+items.map((t,i)=>`<label><input type="checkbox" data-i="${i}" ${(ST.road[k+'-'+i])?'checked':''}> <span>${t}</span></label>`).join('')+'</div>';
    el.querySelectorAll('input').forEach(c=>c.onchange=()=>{ST.road[k+'-'+c.dataset.i]=c.checked;save()})},
  mini(el){/* mini-labo de transformation intégré */const op=el.dataset.op;el.innerHTML=`<div class="card"><label for="mi-${op}" class="muted" style="font-size:.85rem">Colle ton texte ici :</label><textarea id="mi-${op}"></textarea><div class="row" style="margin-top:8px"><button class="btn pri" type="button">${op==='b64'?'Décoder le base64':op==='hex'?'Hex → texte':op==='bin'?'Binaire → texte':op==='rot13'?'Appliquer ROT13':'Transformer'}</button></div><pre class="out" style="margin-top:8px">Le résultat apparaîtra ici.</pre></div>`;
    el.querySelector('button').onclick=()=>{const t=el.querySelector('textarea').value;let r;try{r=OPS[{b64:'b64d',hex:'hexd',bin:'bind',rot13:'rot13'}[op]].f(t)}catch(e){r='Erreur : '+e.message}el.querySelector('.out').textContent=r}},
};

/* ============ OUTILS CRYPTO ============ */
function caesar(s,k){return s.replace(/[a-z]/gi,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+k%26+26)%26+b)})}
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function hexToBytes(h){h=h.replace(/0x/gi,'').replace(/[^0-9a-f]/gi,'');if(h.length%2)throw new Error('nombre de caractères hexa impair');const o=[];for(let i=0;i<h.length;i+=2)o.push(parseInt(h.substr(i,2),16));return o}
const OPS={
  b64d:{n:'Base64 → texte',f:t=>{try{return decodeURIComponent(escape(atob(t.replace(/\s/g,''))))}catch(e){return atob(t.replace(/\s/g,''))}}},
  b64e:{n:'Texte → Base64',f:t=>btoa(unescape(encodeURIComponent(t)))},
  hexd:{n:'Hexadécimal → texte',f:t=>String.fromCharCode(...hexToBytes(t))},
  hexe:{n:'Texte → hexadécimal',f:t=>[...new TextEncoder().encode(t)].map(b=>b.toString(16).padStart(2,'0')).join(' ')},
  bind:{n:'Binaire → texte',f:t=>t.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join('')},
  bine:{n:'Texte → binaire',f:t=>[...t].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')},
  decd:{n:'Décimal (codes ASCII) → texte',f:t=>t.trim().split(/[\s,]+/).map(n=>String.fromCharCode(+n)).join('')},
  rot13:{n:'ROT13',f:t=>caesar(t,13)},
  caesar:{n:'César avec décalage (clé)',key:true,f:(t,k)=>caesar(t,-(parseInt(k,10)||0))},
  brute:{n:'César : essayer les 25 décalages',f:t=>Array.from({length:25},(_,i)=>`décalage ${String(i+1).padStart(2)} : ${caesar(t,-(i+1))}`).join('\n')},
  rev:{n:'Inverser le texte',f:t=>[...t].reverse().join('')},
  urld:{n:'URL → texte (décoder %20...)',f:t=>decodeURIComponent(t)},
  urle:{n:'Texte → URL (encoder)',f:t=>encodeURIComponent(t)},
  xor:{n:'XOR (entrée en hexa, clé en texte ou 0x..)',key:true,f:(t,k)=>{const d=hexToBytes(t);let key=/^0x/i.test(k)?hexToBytes(k):[...new TextEncoder().encode(k)];if(!key.length)throw new Error('donne une clé');return d.map((b,i)=>String.fromCharCode(b^key[i%key.length])).join('')}},
  sha:{n:'Calculer le SHA-256',async:true,f:t=>sha256(t)},
  upper:{n:'MAJUSCULES',f:t=>t.toUpperCase()},
  lower:{n:'minuscules',f:t=>t.toLowerCase()},
};
function detect(t){t=t.trim();const g=[];if(/^[01\s]+$/.test(t)&&t.length>=8)g.push('binaire');if(/^(0x)?[0-9a-f\s]+$/i.test(t)&&t.replace(/\s/g,'').length%2===0)g.push('hexadécimal');if(/^[A-Za-z0-9+/]+={0,2}$/.test(t.replace(/\s/g,''))&&t.replace(/\s/g,'').length%4===0)g.push('base64 (surtout si ça finit par = ou ==)');if(/%[0-9a-f]{2}/i.test(t))g.push('encodage URL');if(/^[a-f0-9]{32}$/i.test(t))g.push('hash MD5 (32 caractères hexa)');if(/^[a-f0-9]{40}$/i.test(t))g.push('hash SHA-1 (40)');if(/^[a-f0-9]{64}$/i.test(t))g.push('hash SHA-256 (64)');if(/^[A-Za-z{}_ ]+$/.test(t)&&/\{/.test(t))g.push('peut-être César/ROT13 (des lettres et des accolades : un flag chiffré ?)');return g}
function viewLabo(v){
  v.innerHTML=`<div class="wrap"><div class="crumb"><a href="#accueil">QG</a> / Labo</div><h1>Labo de décodage</h1><p class="muted">Ta boîte à outils pour les challenges de crypto et d'encodage, inspirée de CyberChef (l'outil que les pros utilisent : <a href="https://gchq.github.io/CyberChef/">gchq.github.io/CyberChef</a>). Colle un texte, choisis une opération, et enchaîne les étapes si besoin.</p>
  <div class="card"><label for="lab-in"><b>Entrée</b></label><textarea id="lab-in" placeholder="Ex : SEx7YmFzZTY0X2VzdF9mYWNpbGV9"></textarea><div id="lab-det" class="muted" style="font-size:.85rem;margin-top:6px"></div>
  <div class="row" style="margin-top:10px"><label for="lab-op">Opération</label><select id="lab-op">${Object.entries(OPS).map(([k,o])=>`<option value="${k}">${esc(o.n)}</option>`).join('')}</select><input type="text" id="lab-key" placeholder="clé" style="width:120px" hidden aria-label="Clé"><button class="btn pri" type="button" id="lab-go">Appliquer</button><button class="btn" type="button" id="lab-chain">Utiliser le résultat comme entrée</button></div>
  <label for="lab-out" style="display:block;margin-top:14px"><b>Résultat</b></label><pre id="lab-out" style="min-height:60px">…</pre></div>
  <div class="box kid"><b>Comment reconnaître un encodage ?</b><p><b>Base64</b> : lettres, chiffres, + et /, souvent terminé par = ou ==. <b>Hexa</b> : seulement 0-9 et a-f. <b>Binaire</b> : seulement des 0 et des 1, par paquets de 8. <b>ROT13/César</b> : on dirait des mots mais avec des lettres mélangées (ex : <code>UY{...}</code> au lieu de <code>HL{...}</code>). Souvent, un challenge empile plusieurs couches : décode, puis redécode !</p></div></div>`;
  const opSel=$('#lab-op'),key=$('#lab-key'),inp=$('#lab-in');
  const upd=()=>{key.hidden=!OPS[opSel.value].key;const d=detect(inp.value);$('#lab-det').textContent=inp.value.trim()?(d.length?'Ressemble à : '+d.join(', '):'Encodage non reconnu automatiquement.'):''};
  opSel.onchange=upd;inp.oninput=upd;
  $('#lab-go').onclick=async()=>{try{const r=await OPS[opSel.value].f(inp.value,key.value);$('#lab-out').textContent=r}catch(e){$('#lab-out').textContent='Erreur : '+e.message+' — vérifie que l\'entrée correspond bien à cette opération.'}};
  $('#lab-chain').onclick=()=>{const o=$('#lab-out').textContent;if(o&&o!=='…'){inp.value=o;upd()}};
}
function viewTerm(v){
  v.innerHTML=`<div class="wrap wide"><div class="crumb"><a href="#accueil">QG</a> / Terminal libre</div><h1>Terminal libre</h1><p class="muted">Un bac à sable pour t'entraîner aux commandes sans pression. Il y a des choses cachées un peu partout... Commence par <code>cat LISEZMOI.txt</code>.</p><div id="sandbox"></div>
  <div class="box pro"><b>Pour aller plus loin</b><p>Quand tu seras à l'aise ici, passe au vrai : le jeu <a href="https://overthewire.org/wargames/bandit/">OverTheWire Bandit</a> (gratuit, en SSH sur un vrai serveur) est LA référence pour apprendre Linux en jouant.</p></div></div>`;
  new Terminal($('#sandbox'),TERMS.sandbox,{tall:true});
}
function viewStatic(v,html){v.innerHTML=`<div class="wrap lesson">${html}</div>`;mountWidgets(v)}
function viewPlan(v){viewStatic(v,PLAN);}
function viewGloss(v){
  v.innerHTML=`<div class="wrap"><div class="crumb"><a href="#accueil">QG</a> / Glossaire</div><h1>Glossaire du hacker</h1><p class="muted">${GLOSS.length} mots que tu vas croiser partout. Tape pour filtrer.</p><input type="text" id="gq" placeholder="Chercher un mot (ex : payload)" aria-label="Chercher dans le glossaire"><div id="gl" style="margin-top:14px"></div></div>`;
  const draw=q=>{q=(q||'').toLowerCase();$('#gl').innerHTML=GLOSS.filter(g=>(g[0]+g[1]).toLowerCase().includes(q)).map(g=>`<div class="card" style="margin-bottom:8px;padding:12px 16px"><b class="mono" style="color:var(--accent)">${esc(g[0])}</b><div>${g[1]}</div></div>`).join('')||'<p class="muted">Aucun mot trouvé.</p>'};
  draw();$('#gq').oninput=e=>draw(e.target.value);
}

/* ============ PROF IA ============ */
let SAMPLE=null;const CHAT=[];
async function initProf(){try{if(!window.claude||!window.claude.use)return;SAMPLE=await window.claude.use('sample');if(SAMPLE)$('#proftab').hidden=false}catch(e){}}
function profContext(){
  if(!CURRENT)return 'L\'élève est sur une page générale de la plateforme (pas dans une leçon).';
  const l=CURRENT;const strip=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,3500);
  return `Leçon actuelle : « ${l.titre} » (module « ${l.mod.titre} »).\nRésumé du cours : ${strip(l.contenu)}\n`+(l.chal?`Challenge : « ${l.chal.titre} ». Énoncé : ${strip(l.chal.enonce)}\nIndices officiels (dans l'ordre) : ${(l.chal.hints||[]).map(strip).join(' | ')}`:'');
}
async function askProf(q){
  const box=$('#profmsgs');CHAT.push({role:'user',content:q});
  box.insertAdjacentHTML('beforeend',`<div class="pm u">${esc(q)}</div>`);const a=document.createElement('div');a.className='pm a';a.textContent='Je réfléchis…';box.appendChild(a);box.scrollTop=box.scrollHeight;
  const sys=`Tu es « Prof », le formateur en cybersécurité de la plateforme HackerLab Académie. Ton élève est un grand débutant qui veut se préparer au HackerLab (compétition CTF du Bénin organisée par l'ASIN). Règles :
- Réponds en français simple, comme à un enfant de 12 ans intelligent : phrases courtes, analogies de la vie quotidienne, un exemple concret.
- Ne donne JAMAIS directement un flag (format HL{...}) ni la solution complète d'un challenge. Donne un indice qui fait avancer d'une seule étape, puis pose une question pour le faire réfléchir. S'il insiste, donne un indice plus précis mais toujours pas le flag.
- Tu peux montrer des commandes générales (ls -a, grep -r, nmap -sV...) et expliquer ce qu'elles font.
- Rappelle l'éthique si besoin : on ne pirate que ce qu'on a le droit de pirater (labs, CTF, plateformes d'entraînement).
- Réponses de 120 mots maximum sauf si on te demande une explication longue. Pas de markdown lourd : texte simple, éventuellement des commandes entre accents graves.
Contexte : ${profContext()}`;
  try{
    const msgs=[{role:'user',content:sys+'\n\n---\nQuestion de l\'élève : '+CHAT[0].content}].concat(CHAT.slice(1));
    const r=await SAMPLE(msgs,{cache:false,onText:({text})=>{a.textContent=text;box.scrollTop=box.scrollHeight}});
    a.textContent=r.text;CHAT.push({role:'assistant',content:r.text});
  }catch(e){a.textContent=e&&e.code==='rate_limited'?'Je suis un peu débordé, réessaie dans une minute.':(e&&e.code==='not_granted'?'Le prof n\'est pas disponible ici.':'Je n\'ai pas pu répondre. Réessaie.');CHAT.pop();if(e&&e.code==='not_granted')$('#proftab').hidden=true}
  box.scrollTop=box.scrollHeight;
}

/* ============ DÉMARRAGE ============ */
document.addEventListener('DOMContentLoaded',()=>{
  refreshSide();route();touchDay();
  $('#menu').onclick=()=>$('.side').classList.toggle('open');
  $('#proftab').onclick=()=>{const p=$('#profpanel');p.classList.toggle('open');if(p.classList.contains('open'))$('#profq').focus()};
  $('#profclose').onclick=()=>$('#profpanel').classList.remove('open');
  $('#profform').addEventListener('submit',e=>{e.preventDefault();const q=$('#profq').value.trim();if(!q||!SAMPLE)return;$('#profq').value='';askProf(q)});
  $('#profnew').onclick=()=>{CHAT.length=0;$('#profmsgs').innerHTML='<div class="pm a">Nouvelle discussion. Pose-moi ta question !</div>'};
  initDB();initProf();
});
