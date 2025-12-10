# ⚙️ Configuration Vercel - Variables d'environnement

## 🔴 Problème actuel

Le build échoue avec l'erreur :
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Cause :** Les variables d'environnement Supabase ne sont pas configurées dans Vercel.

## ✅ Solution : Configurer les variables d'environnement

### Étape 1 : Aller sur le dashboard Vercel

1. Ouvrez : https://vercel.com/dashboard
2. Cliquez sur votre projet **flyboard**

### Étape 2 : Ajouter les variables d'environnement

1. Dans le menu de gauche, cliquez sur **Settings**
2. Cliquez sur **Environment Variables**
3. Ajoutez ces 2 variables :

#### Variable 1 :
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://xlzrywplyqpyvkcipgei.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2 :
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4a2J2aHltc3Zhc2tuc2xocHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzI1MjQsImV4cCI6MjA3NzI0ODUyNH0.zbE1YiXZXDEgpLkRS9XDU8yt4n4EiQItU_YSoEQveTM`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

4. Cliquez sur **Save** pour chaque variable

### Étape 3 : Redéployer

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Sélectionnez **Use existing Build Cache** (optionnel)
5. Cliquez sur **Redeploy**

## ✅ C'est tout !

Après le redéploiement, votre application devrait fonctionner.

## 🔗 URL de votre projet

Votre application sera accessible sur :
- **Production:** https://flyboard-qwdosy7ja-taytos-projects-62dda2ca.vercel.app
- Ou votre domaine personnalisé si configuré

## 📝 Note importante

Après le déploiement, configurez aussi Supabase :

1. Allez sur: https://supabase.com/dashboard/project/xlzrywplyqpyvkcipgei/auth/url-configuration

2. Dans **Site URL**, ajoutez :
   ```
   https://flyboard-qwdosy7ja-taytos-projects-62dda2ca.vercel.app
   ```

3. Dans **Redirect URLs**, ajoutez :
   ```
   https://flyboard-qwdosy7ja-taytos-projects-62dda2ca.vercel.app/**
   ```

4. Cliquez sur **Save**

