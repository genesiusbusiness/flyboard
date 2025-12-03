# 🚀 Instructions de déploiement AWS Amplify

## ✅ Prérequis vérifiés

- ✅ Build fonctionne
- ✅ AWS CLI installé
- ✅ Repository Git initialisé

## 📋 Étapes de déploiement

### Option 1 : Via la console AWS (Recommandé - Plus simple)

1. **Aller sur AWS Amplify Console**
   - https://console.aws.amazon.com/amplify/
   - Se connecter avec votre compte AWS

2. **Créer un nouveau repository Git** (si pas déjà fait)
   - GitHub : https://github.com/new
   - Créer un repo privé ou public
   - Pousser le code :
   ```bash
   git remote add origin https://github.com/VOTRE_USERNAME/flyboard.git
   git branch -M main
   git push -u origin main
   ```

3. **Dans AWS Amplify Console**
   - Cliquer sur "New app" → "Host web app"
   - Choisir votre provider Git (GitHub, GitLab, etc.)
   - Autoriser AWS Amplify
   - Sélectionner le repository `flyboard`
   - Sélectionner la branche `main`

4. **Configurer le build**
   - Amplify détectera automatiquement Next.js
   - Le fichier `amplify.yml` sera utilisé automatiquement

5. **Ajouter les variables d'environnement**
   - Dans "Environment variables" :
     - `NEXT_PUBLIC_SUPABASE_URL` = (votre URL Supabase)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (votre clé anonyme)

6. **Déployer**
   - Cliquer sur "Save and deploy"
   - Attendre 5-10 minutes

### Option 2 : Via Amplify CLI (Avancé)

```bash
# 1. Configurer AWS CLI (si pas déjà fait)
aws configure

# 2. Initialiser Amplify
cd "Flynesis App/FlyBoard"
amplify init

# 3. Ajouter hosting
amplify add hosting

# 4. Publier
amplify publish
```

## 🔑 Variables d'environnement nécessaires

Vous devrez configurer ces variables dans AWS Amplify Console :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📝 Notes

- Le premier déploiement prend 5-10 minutes
- Les déploiements suivants sont automatiques à chaque push Git
- HTTPS est inclus automatiquement
- Vous obtiendrez une URL comme : `https://main.xxxxx.amplifyapp.com`

