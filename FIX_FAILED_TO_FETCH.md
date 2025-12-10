# 🔧 Correction de l'erreur "Failed to fetch"

## 🔴 Problème

Vous voyez l'erreur "Failed to fetch" dans la console du navigateur.

**Causes possibles :**
1. Variables d'environnement non configurées dans Vercel
2. Supabase non configuré avec l'URL Vercel (CORS)
3. URL Supabase incorrecte

## ✅ Solution étape par étape

### Étape 1 : Vérifier les variables d'environnement dans Vercel

1. Allez sur : https://vercel.com/dashboard
2. Cliquez sur **flyboard**
3. **Settings** → **Environment Variables**
4. Vérifiez que ces 2 variables existent :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Si elles n'existent pas, ajoutez-les (voir `CONFIGURER_VERCEL.md`)
6. **Redéployez** après avoir ajouté les variables

### Étape 2 : Configurer Supabase avec l'URL Vercel

1. Allez sur : https://supabase.com/dashboard/project/xlzrywplyqpyvkcipgei/auth/url-configuration

2. **Site URL** : Gardez votre URL actuelle (ex: `https://account.flynesis.com`)
   - ⚠️ Ne changez pas le Site URL si vous en avez déjà un

3. Dans **Redirect URLs**, ajoutez votre URL Vercel :
   ```
   https://flyboard-qwdosy7ja-taytos-projects-62dda2ca.vercel.app/**
   https://*.vercel.app/**
   ```
   (Remplacez par votre URL Vercel actuelle si différente)
   
   **Important :** Ajoutez chaque URL sur une nouvelle ligne dans la liste des Redirect URLs

4. Cliquez sur **Save**

### Étape 3 : Vérifier l'URL de votre déploiement Vercel

1. Allez sur : https://vercel.com/dashboard
2. Cliquez sur **flyboard**
3. Allez dans **Deployments**
4. Copiez l'URL de production (ex: `https://flyboard-xxx.vercel.app`)
5. Utilisez cette URL dans la configuration Supabase ci-dessus

### Étape 4 : Redéployer sur Vercel

Après avoir configuré Supabase, redéployez :

```bash
cd '/Users/taytonaday/Desktop/Workplace Flynesis All/Flynesis App/FlyBoard'
npx vercel --prod
```

Ou depuis le dashboard Vercel :
- **Deployments** → 3 points (⋯) → **Redeploy**

## 🔍 Vérification

1. Ouvrez votre application Vercel dans le navigateur
2. Ouvrez la console (F12 → Console)
3. Vérifiez qu'il n'y a plus d'erreur "Failed to fetch"
4. Essayez de vous connecter

## ⚠️ Si le problème persiste

1. Vérifiez que les variables d'environnement sont bien définies dans Vercel
2. Vérifiez que l'URL Vercel est bien dans Supabase
3. Vérifiez la console du navigateur pour plus de détails sur l'erreur
4. Vérifiez les logs Vercel : **Deployments** → Cliquez sur un déploiement → **Functions** → Logs

