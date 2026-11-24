# 🛡️ HackerLab Académie

Plateforme d'apprentissage de la **cybersécurité**, en français, de zéro,
pensée pour préparer le **HackerLab** — le CTF national du Bénin (ASIN).

Cours expliqués simplement, quiz, challenges avec flags `HL{...}`, terminal
Linux simulé, labo de décodage, progression en XP et rangs.

---

## 🚀 Démarrer en 10 secondes

Ouvre **`HackerLab_Academie.html`** dans ton navigateur (double-clic). Rien à
installer, fonctionne hors ligne.

> La version développée se trouve dans **`plateforme/`** (projet multi-fichiers
> à lire et modifier). `HackerLab_Academie.html` en est la version « tout-en-un »
> regroupée pour le partage.

## 📚 Au programme — 12 modules, 31 challenges

| # | Module | Thème |
|---|--------|-------|
| 0 | Démarrage | hacker éthique, loi, CTF, méthode |
| 1 | Le langage des machines | binaire, hexadécimal, ASCII |
| 2 | Linux & le terminal | naviguer, chercher (grep, find) |
| 3 | Les réseaux | IP, ports, DNS, HTTP, captures |
| 4 | Cryptographie & encodage | César, base64, hachage, XOR |
| 5 | Comment marche le web | HTML, code source, cookies |
| 6 | Méthode, forensic & OSINT | méthodologie, fichiers, métadonnées |
| 7 | Windows & Active Directory | postes & domaines Windows |
| 8 | Reverse engineering | binaires, assembleur, strings |
| 9 | Forensic approfondi | stéganographie, magic numbers, logs |
| 10 | OSINT & renseignement | dorking, géolocalisation, traces |
| 11 | Prise de contrôle à distance | SSH/RDP, shells, détection & défense |

## 🗂️ Structure du dépôt

```
.
├── HackerLab_Academie.html   # version tout-en-un (double-clic)
├── plateforme/               # le projet développé (source)
│   ├── index.html
│   ├── css/style.css
│   ├── js/terminal.js, app.js
│   └── contenu/*.js          # les modules de cours
└── labo-attaque/             # monter un vrai labo d'attaque légal
    ├── README.md
    └── lancer-dvwa.md
```

## 🧪 S'entraîner à attaquer (légalement)

Le dossier `labo-attaque/` explique comment monter un **labo isolé**
(VirtualBox + Kali + cible vulnérable) pour pratiquer de vraies attaques sur
des machines **faites pour ça**. Plateformes recommandées : TryHackMe,
Root-Me (FR), PicoCTF, Hack The Box, PortSwigger Academy.

## ⚖️ Éthique

On ne teste **jamais** une attaque sur un système sans autorisation écrite.
Au Bénin, l'accès frauduleux à un système est puni par le Code du numérique
(loi 2017-20). Cette plateforme et les labos cités sont les seuls terrains
d'entraînement autorisés.

---

*Fait pour apprendre. Bonne chasse, et rendez-vous au HackerLab. 🇧🇯*
