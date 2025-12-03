# 🚀 Déploiement Rapide AWS Amplify

## ✅ État actuel

- ✅ Repository Git initialisé
- ✅ Build fonctionne
- ✅ AWS CLI configuré
- ✅ Fichier `amplify.yml` créé

## 🎯 Déploiement via Console AWS (Recommandé)

### Étape 1 : Créer un repository GitHub

1. Aller sur https://github.com/new
2. Créer un nouveau repository (nom : `flyboard`)
3. **Ne pas** initialiser avec README
4. Copier l'URL du repository

### Étape 2 : Pousser le code sur GitHub

```bash
cd "/Users/taytonaday/Desktop/Workplace Flynesis All/Flynesis App/FlyBoard"
git remote add origin https://github.com/VOTRE_USERNAME/flyboard.git
git branch -M main
git push -u origin main
```

### Étape 3 : Déployer sur AWS Amplify

1. Aller sur https://console.aws.amazon.com/amplify/
2. Cliquer sur **"New app"** → **"Host web app"**
3. Choisir **GitHub** (ou votre provider Git)
4. Autoriser AWS Amplify à accéder à votre compte
5. Sélectionner le repository `flyboard`
6. Sélectionner la branche `main`
7. **Build settings** : Amplify détectera automatiquement Next.js (utilisera `amplify.yml`)
8. **Environment variables** : Ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL` = (votre URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (votre clé)
9. Cliquer sur **"Save and deploy"**

### Étape 4 : Attendre le déploiement

- Premier déploiement : 5-10 minutes
- Vous obtiendrez une URL : `https://main.xxxxx.amplifyapp.com`

## 🔄 Déploiements automatiques

À chaque `git push` sur la branche `main`, Amplify redéploiera automatiquement.

## 📝 Alternative : Déploiement manuel via CLI

Si vous préférez utiliser la CLI :

```bash
cd "/Users/taytonaday/Desktop/Workplace Flynesis All/Flynesis App/FlyBoard"
npx @aws-amplify/cli init
npx @aws-amplify/cli add hosting
npx @aws-amplify/cli publish
```

Mais la console est plus simple pour commencer !

