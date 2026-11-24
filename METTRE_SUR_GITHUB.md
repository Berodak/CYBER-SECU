# Mettre ce projet sur ton GitHub

Tout est déjà prêt dans ce dossier (code + README + .gitignore). Il ne reste
qu'à l'envoyer sur ton compte **Berodak**. Choisis la méthode qui te parle.

---

## Méthode A — GitHub Desktop (la plus simple, sans commande)

1. Installe **GitHub Desktop** : <https://desktop.github.com> et connecte-toi
   avec ton compte Berodak.
2. Menu **File → Add local repository…**
3. Choisis ce dossier : `C:\Users\berodak\OneDrive\Documents\CYBER SECU`
4. GitHub Desktop dit « this directory is not a repository » → clique sur
   **« create a repository »**.
5. Nom : `hackerlab-academie`. Clique **Create repository**.
6. En haut, clique **Publish repository**. Décoche « Keep this code private »
   si tu veux qu'il soit public. Clique **Publish**.

C'est en ligne ! 🎉

---

## Méthode B — En ligne, sans rien installer

1. Va sur <https://github.com/new> (connecté en Berodak).
2. Repository name : `hackerlab-academie` → **Create repository**.
3. Sur la page du dépôt vide, clique **« uploading an existing file »**.
4. Fais glisser le contenu de ce dossier (le fichier HTML, et les dossiers
   `plateforme` et `labo-attaque`) dans la zone, puis **Commit changes**.

---

## Méthode C — En ligne de commande (si tu connais git)

Ouvre un terminal **dans ce dossier** (`CYBER SECU`) et lance :

```bash
git init
git add .
git commit -m "HackerLab Academie : plateforme d'apprentissage cybersecurite"
git branch -M main

# Cree d'abord le depot vide "hackerlab-academie" sur github.com, puis :
git remote add origin https://github.com/Berodak/hackerlab-academie.git
git push -u origin main
```

> Si tu as l'outil **GitHub CLI** (`gh`) installé et connecté, tu peux tout
> faire en une commande à la place des deux dernières lignes :
> ```bash
> gh repo create hackerlab-academie --public --source=. --push
> ```

---

## Ensuite

Ton dépôt sera à l'adresse :
`https://github.com/Berodak/hackerlab-academie`

Tu pourras même activer **GitHub Pages** (Settings → Pages → Branch: main) pour
que la plateforme soit accessible en ligne via une adresse web, sans que
personne n'ait à télécharger le fichier.
