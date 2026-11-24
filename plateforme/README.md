# HackerLab Académie — plateforme d'apprentissage

Plateforme pour apprendre les **fondations** de la cybersécurité, de zéro,
en français, en vue du **HackerLab** (CTF national du Bénin).

## Comment l'ouvrir

Double-clique sur **`index.html`**. Tout se charge dans ton navigateur,
sans Internet (sauf les polices d'écriture). Rien à installer.

> La version **en ligne** (lien claude.ai fourni dans la conversation) ajoute
> deux choses : la **synchronisation de ta progression** sur ton compte, et le
> **Prof IA** qui te met sur la piste. En local, les indices de chaque
> challenge suffisent.

## Structure du projet (pour comprendre / modifier le code)

```
plateforme/
├── index.html              La page : squelette + barre de navigation
├── css/
│   └── style.css           Tout l'habillage (couleurs, mise en page)
├── js/
│   ├── terminal.js         Le moteur du terminal Linux simulé
│   └── app.js              Le moteur : navigation, progression, quiz, Labo
└── contenu/
    ├── fondations.js       Modules 0 à 2 (démarrage, binaire, Linux)
    └── avance.js           Modules 3 à 6 (réseau, crypto, web, forensic)
```

L'ordre de chargement des scripts dans `index.html` est important :
`terminal.js` puis le contenu puis `app.js`.

## Ajouter ou modifier une leçon

Chaque module est un objet dans `contenu/fondations.js` ou `contenu/avance.js` :

```js
MODULES.push({ id:'m7', titre:'Mon module', cat:'...', desc:'...',
  lessons:[
    { id:'m7l1', titre:'Ma leçon', duree:'15 min',
      contenu:` ...du HTML... `,
      quiz:[ {q:'Question ?', o:['A','B','C'], a:1, w:'explication'} ],
      chal:{ titre:'...', xp:30, flag:'HL{...}', enonce:'...', hints:['...'] }
    }
  ]});
```

Types de challenge possibles : texte (décoder un flag), `type:'term'`
(terminal Linux avec un système de fichiers), `type:'widget'`.

## Reconstruire la version « un seul fichier »

La version `HackerLab_Academie.html` (à la racine du dossier) est le même
projet, mais regroupé en un seul fichier pour le partage facile. C'est une
pratique normale : on développe en fichiers séparés, on « build » un fichier
unique pour distribuer.

---
Fait pour apprendre. On ne teste jamais une attaque sur un système qu'on n'a
pas le droit d'attaquer. Pour la pratique offensive, voir le dossier
`labo-attaque/`.
