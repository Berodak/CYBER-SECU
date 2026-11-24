# Ton labo d'attaque — simuler des attaques pour de vrai (et légalement)

> **La question qu'on se pose toujours d'abord : « ai-je le droit d'attaquer
> cette machine ? »** Dans ce labo, la réponse est OUI, parce que les cibles
> t'appartiennent et sont **faites pour être attaquées**. En dehors de ce
> cadre, attaquer un système sans autorisation écrite est un délit (Code du
> numérique du Bénin, loi 2017-20).

On ne code pas un faux simulateur d'attaques. Les pros montent un **labo
isolé** avec de vraies machines vulnérables et les attaquent avec de vrais
outils. C'est exactement ce que font les finalistes du HackerLab, et c'est ce
que tu vas monter ici. Tu as déjà **VirtualBox** : parfait.

---

## Le schéma du labo

```
            ┌─────────────────── Réseau "host-only" (isolé, sans Internet) ───────────────────┐
            │                                                                                   │
   ┌────────┴─────────┐                                                      ┌──────────────────┴───┐
   │   KALI LINUX     │   ──────── tu attaques ────────►                     │   CIBLE VULNÉRABLE   │
   │  (l'attaquant)   │        nmap, Burp, Metasploit...                     │  Metasploitable /    │
   │                  │                                                      │  DVWA / Juice Shop   │
   └──────────────────┘                                                      └──────────────────────┘
```

**La règle de sécurité absolue : le réseau du labo doit être ISOLÉ**
(« host-only » dans VirtualBox). Les machines se parlent entre elles mais
**ne touchent pas Internet**. Ça t'évite deux catastrophes : qu'une machine
volontairement vulnérable se fasse infecter depuis l'extérieur, et que tu
attaques par erreur une vraie machine sur Internet.

---

## Étape 1 — Créer le réseau isolé (5 min)

Dans VirtualBox :
1. Menu **Fichier → Outils → Gestionnaire de réseau hôte** (ou *Host Network
   Manager*).
2. Clique **Créer**. Une interface `vboxnet0` apparaît (ex. 192.168.56.1).
3. Laisse le serveur **DHCP activé**.

Chaque VM du labo utilisera cette interface : dans les réglages de la VM →
**Réseau → Carte 1 → Mode d'accès réseau : Réseau privé hôte (Host-Only)** →
`vboxnet0`.

---

## Étape 2 — La machine attaquante : Kali Linux (20 min)

1. Télécharge l'image **« Virtual Machines » pour VirtualBox** sur
   <https://www.kali.org/get-kali/>.
2. Décompresse, puis dans VirtualBox : **Fichier → Importer un appareil
   virtuel** (ou double-clic sur le `.vbox`).
3. Règle sa carte réseau sur **Host-Only** (voir étape 1).
4. Démarre. Identifiants par défaut : `kali` / `kali`.
5. Fais un instantané (**snapshot**) propre tout de suite : clic droit sur la
   VM → *Instantanés → Prendre*. Si tu casses quelque chose plus tard, tu
   reviens à cet état en un clic.

Kali contient déjà tout : `nmap`, **Burp Suite**, **Metasploit**,
**John the Ripper**, **Wireshark**, `gobuster`...

---

## Étape 3 — Une cible vulnérable (choisis-en une pour commencer)

### Option A — Metasploitable 2 (le classique pour débuter le « système »)
Machine Linux bourrée de failles volontaires. Idéale pour s'entraîner au scan,
à l'exploitation de services et à l'escalade de privilèges.
1. Télécharge sur <https://sourceforge.net/projects/metasploitable/>.
2. Dans VirtualBox : nouvelle VM → type Linux → utilise le disque `.vmdk`
   fourni.
3. Carte réseau en **Host-Only**. Démarre. Identifiants : `msfadmin` /
   `msfadmin`.
4. **Ne lui donne jamais accès à Internet** : elle est volontairement
   dangereuse.

### Option B — DVWA, l'appli web vulnérable (le plus simple)
« Damn Vulnerable Web Application » : un site conçu pour pratiquer les failles
web, **avec 4 niveaux de difficulté** et des explications intégrées. Le plus
rapide : via Docker (voir `lancer-dvwa.md` dans ce dossier). Sinon, elle est
incluse dans certaines VM.

### Option C — OWASP Juice Shop (moderne, ludique)
Un faux site de vente de jus, truffé de défis web notés, du plus facile au plus
dur, avec un tableau de score intégré. Parfait pour progresser seul.
Via Docker : `docker run -d -p 3000:3000 bkimminich/juice-shop` puis
<http://localhost:3000>.

---

## Étape 4 — Ta première reconnaissance

Depuis Kali, vérifie que tu « vois » la cible, puis scanne-la :

```bash
# 1. Quelle est l'IP de la cible ? (regarde l'écran de la VM cible : ip a)
# 2. Est-ce qu'elle répond ?
ping 192.168.56.XXX

# 3. Quelles portes (ports/services) sont ouvertes ?
nmap -sV 192.168.56.XXX
```

`nmap -sV` te liste les services et leurs versions. **C'est toujours la
première étape d'une attaque** : savoir ce qui tourne avant de chercher
comment entrer. Le module « Réseaux » de la plateforme t'a appris à lire ce
résultat.

À partir de là, chaque cible te guide : **DVWA** et **Juice Shop** ont leurs
propres exercices classés par difficulté, et **Metasploitable** se travaille
avec les parcours ci-dessous.

---

## Pas de PC assez puissant ? Le labo dans le navigateur

Si ton ordinateur rame avec les VM, ces plateformes te donnent **l'attaquant ET
la cible en ligne**, légalement, sans rien installer :

| Plateforme | Pour quoi | Lien |
|---|---|---|
| **TryHackMe** | parcours guidés, machine Kali en ligne (AttackBox) | tryhackme.com |
| **Hack The Box** | machines à pirater, du facile au difficile | hackthebox.com |
| **Root-Me** | des centaines de challenges, **en français** | root-me.org |
| **PicoCTF** | CTF pensé pour les élèves/débutants | picoctf.org |
| **PortSwigger Academy** | le web en profondeur, gratuit, labos inclus | portswigger.net/web-security |
| **OverTheWire Bandit** | apprendre Linux en attaquant, en SSH | overthewire.org |

---

## Ton parcours d'attaque, par catégorie du HackerLab

| Catégorie HackerLab | Où t'entraîner à attaquer |
|---|---|
| **Web** | DVWA → Juice Shop → PortSwigger Academy |
| **Système / exploitation** | Metasploitable 2 → TryHackMe (parcours « Offensive Pentesting ») |
| **Escalade de privilèges** | TryHackMe (« Linux PrivEsc », « Windows PrivEsc ») |
| **Reverse engineering** | PicoCTF (catégorie Reverse) → crackmes.one |
| **Forensic** | PicoCTF (Forensics) → challenges Root-Me |
| **Crypto** | Root-Me (Cryptanalyse) → CryptoHack.org |

---

## Les 5 règles d'or du labo

1. **Isolation** : réseau host-only, les cibles ne touchent jamais Internet.
2. **Snapshots** : un instantané propre de chaque VM avant de jouer.
3. **Autorisation** : on n'attaque que ce labo et les plateformes prévues.
   Jamais un vrai système sans autorisation écrite.
4. **Notes** : écris chaque commande qui marche. Ton carnet = ton arme au
   HackerLab.
5. **Writeups** : après chaque cible, lis comment d'autres l'ont résolue.

Bonne chasse. On se retrouve en finale.
