# 🚀 Déploiement Immédiat - Instructions

## ✅ Tout est prêt !

Votre projet est prêt pour le déploiement. Voici la méthode la plus rapide :

## 🎯 Méthode : Console AWS Amplify (5 minutes)

### 1. Créer un repository GitHub (2 min)

```bash
# Si vous avez déjà un repo GitHub, passez à l'étape 2
# Sinon, créez-en un sur https://github.com/new
```

### 2. Pousser le code (1 min)

```bash
cd "/Users/taytonaday/Desktop/Workplace Flynesis All/Flynesis App/FlyBoard"

# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/flyboard.git
git branch -M main
git push -u origin main
```

### 3. Déployer sur AWS Amplify (2 min)

1. **Ouvrir** : https://console.aws.amazon.com/amplify/
2. **Cliquer** : "New app" → "Host web app"
3. **Choisir** : GitHub (ou votre provider)
4. **Autoriser** : AWS Amplify
5. **Sélectionner** : Repository `flyboard`, branche `main`
6. **Build settings** : Laisser par défaut (Amplify détecte Next.js)
7. **Environment variables** : Ajouter ces 2 variables :
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://yxkbvhymsvasknslhpsa.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4a2J2aHltc3Zhc2tuc2xocHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzI1MjQsImV4cCI6MjA3NzI0ODUyNH0.zbE1YiXZXDEgpLkRS9XDU8yt4n4EiQItU_YSoEQveTM
   ```
8. **Cliquer** : "Save and deploy"

### 4. Attendre (5-10 min)

Le premier déploiement prend 5-10 minutes. Vous obtiendrez une URL comme :
`https://main.xxxxx.amplifyapp.com`

## 🎉 C'est tout !

Une fois déployé, chaque `git push` redéploiera automatiquement.

## 📝 Note

Si vous n'avez pas de compte GitHub, vous pouvez aussi :
- Utiliser GitLab : https://gitlab.com
- Utiliser Bitbucket : https://bitbucket.org
- Ou utiliser CodeCommit AWS (mais moins pratique)

