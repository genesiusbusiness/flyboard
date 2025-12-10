# 🔧 Correction de l'erreur CORS "Failed to fetch"

## 🔴 Problème identifié

L'erreur CORS indique que les variables d'environnement dans Vercel pointent vers le **mauvais projet Supabase**.

**Erreur :**
```
Access to fetch at 'https://xlzrywplyqpyvkcipgei.supabase.co/auth/v1/token' 
from origin 'https://flyboard-steel.vercel.app' 
has been blocked by CORS policy
```

**Cause :**
- Votre projet Supabase est : **yxkbvhymsvasknslhpsa**
- Mais les variables Vercel pointent vers : **xlzrywplyqpyvkcipgei**

## ✅ Solution : Corriger les variables d'environnement

### Étape 1 : Mettre à jour NEXT_PUBLIC_SUPABASE_URL dans Vercel

1. Allez sur : https://vercel.com/dashboard → **flyboard** → **Settings** → **Environment Variables**

2. Trouvez la variable `NEXT_PUBLIC_SUPABASE_URL`

3. Cliquez sur les **3 points** (⋯) → **Edit**

4. Changez la valeur de :
   ```
   https://xlzrywplyqpyvkcipgei.supabase.co
   ```
   
   Vers :
   ```
   https://yxkbvhymsvasknslhpsa.supabase.co
   ```

5. Cliquez sur **Save**

### Étape 2 : Vérifier la clé API anon

1. Dans Supabase : https://supabase.com/dashboard/project/yxkbvhymsvasknslhpsa/settings/api-keys/legacy

2. Copiez la clé **anon public**

3. Dans Vercel, vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` correspond à cette clé

4. Si différente, mettez à jour la variable dans Vercel

### Étape 3 : Redéployer

1. Dans Vercel : **Deployments** → 3 points (⋯) → **Redeploy**

2. Attendez que le déploiement se termine

3. Testez l'application

## 🔍 Vérification

1. Ouvrez : https://flyboard-steel.vercel.app
2. Ouvrez la console (F12 → Console)
3. Vérifiez qu'il n'y a plus d'erreur CORS
4. Essayez de vous connecter

## ⚠️ Important

Assurez-vous que :
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://yxkbvhymsvasknslhpsa.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = La clé anon du projet **yxkbvhymsvasknslhpsa**
- ✅ Les Redirect URLs dans Supabase incluent vos URLs Vercel

## 📝 Configuration Supabase finale

Dans : https://supabase.com/dashboard/project/yxkbvhymsvasknslhpsa/auth/url-configuration

**Redirect URLs** (doivent être présentes) :
```
https://flyboard-steel.vercel.app/**
https://flyboard-529u2jehw-taytos-projects-62dda2ca.vercel.app/**
https://*.vercel.app/**
```

