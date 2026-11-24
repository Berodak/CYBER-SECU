# Lancer DVWA en 2 minutes (appli web vulnérable locale)

DVWA = « Damn Vulnerable Web Application » : un site **fait pour être attaqué**,
avec 4 niveaux de difficulté (Low → Impossible) et des explications intégrées.
C'est le meilleur terrain d'entraînement web pour débuter.

## La méthode la plus simple : Docker

**Docker** permet de lancer une application préparée en une commande, sans rien
configurer.

1. Installe Docker Desktop : <https://www.docker.com/products/docker-desktop/>
   (Windows/Mac) — ou `sudo apt install docker.io` sur Kali/Linux.
2. Lance DVWA :

   ```bash
   docker run -d -p 8080:80 vulnerables/web-dvwa
   ```

3. Ouvre ton navigateur sur **<http://localhost:8080>**.
4. Clique **« Create / Reset Database »**, puis connecte-toi avec
   `admin` / `password`.
5. Va dans **DVWA Security** et commence au niveau **Low**.

## Comment travailler DVWA

Chaque page (« SQL Injection », « XSS », « Command Injection »...) est un
exercice. Monte en difficulté quand tu réussis :

- **Low** : la faille est évidente, pour comprendre le principe.
- **Medium / High** : des protections à contourner, pour apprendre à
  raisonner.
- **Impossible** : le code corrigé — lis-le pour apprendre à **défendre**.

Le bouton **« View Source »** de chaque page montre le code vulnérable *et* le
code corrigé côte à côte. C'est là que tu apprends vraiment : voir pourquoi la
faille existe et comment on la ferme.

## Outil indispensable à côté : Burp Suite

Burp (inclus dans Kali, ou gratuit en « Community Edition ») se place entre ton
navigateur et le site et te laisse **voir et modifier** chaque requête. C'est
l'outil n°1 du pentest web. DVWA + Burp = le duo d'entraînement parfait.

## Sécurité

DVWA est **volontairement dangereuse** : ne l'expose jamais sur Internet,
garde-la en local (`localhost`) ou sur ton réseau host-only. Quand tu as fini :

```bash
docker ps              # trouve l'ID du conteneur
docker stop <ID>       # arrête-le
```

---
Rappel : DVWA, Juice Shop et les plateformes en ligne sont les **seuls**
endroits où tu t'entraînes à attaquer. Jamais un vrai site.
