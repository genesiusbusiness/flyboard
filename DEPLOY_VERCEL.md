# 🚀 Déploiement sur Vercel

## 📋 Instructions étape par étape

### 1. Ouvrir un terminal et aller dans le projet

```bash
cd '/Users/taytonaday/Desktop/Workplace Flynesis All/Flynesis App/FlyBoard'
```

### 2. Vérifier que vous êtes dans le bon répertoire

```bash
pwd
# Doit afficher: /Users/taytonaday/Desktop/Workplace Flynesis All/Flynesis App/FlyBoard
```

### 3. Déployer sur Vercel

```bash
npx vercel --prod
```

**Répondez aux questions:**
- Link to existing project? → **no** (pour créer un nouveau projet)
- What's your project's name? → **flyboard**
- In which directory is your code located? → **./** (point actuel)
- Want to modify these settings? → **no** (Vercel détecte Next.js automatiquement)

### 4. Configurer les variables d'environnement

Après le déploiement, allez sur https://vercel.com/dashboard

1. Sélectionnez votre projet **flyboard**
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez ces 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xlzrywplyqpyvkcipgei.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

4. Cliquez sur **Save**
5. Redéployez: **Deployments** → Cliquez sur les 3 points → **Redeploy**

### 5. Configurer Supabase

1. Allez sur: https://supabase.com/dashboard/project/xlzrywplyqpyvkcipgei/auth/url-configuration

2. Dans **Site URL**, ajoutez votre URL Vercel:
   ```
   https://flyboard-[votre-id].vercel.app
   ```

3. Dans **Redirect URLs**, ajoutez:
   ```
   https://flyboard-[votre-id].vercel.app/**
   ```

4. Cliquez sur **Save**

## ✅ C'est tout !

Votre application sera accessible sur l'URL Vercel fournie.

## 🔄 Mises à jour futures

Chaque fois que vous poussez sur GitHub:
```bash
git push origin main
```

Vercel déploiera automatiquement si vous avez connecté le repository GitHub.

Ou déployez manuellement:
```bash
npx vercel --prod
```

