# 🔧 Correction de la configuration Cloudflare DNS

## ❌ Problème actuel

Votre CNAME pointe vers :
```
flyboard-kjyjwpx45-taytos-projects-62dda2ca.vercel.app
```

**Ce n'est pas la bonne cible !** C'est l'URL d'un déploiement spécifique, pas la cible DNS pour le domaine.

## ✅ Solution : Utiliser la cible Vercel correcte

### Étape 1 : Ajouter le domaine dans Vercel

1. Allez sur : https://vercel.com/dashboard → **flyboard** → **Settings** → **Domains**

2. Cliquez sur **Add** ou **Add Domain**

3. Entrez votre domaine : `flyboard.flynesis.com` (ou votre domaine)

4. Vercel vous donnera la **vraie cible CNAME** à utiliser

5. **Notez cette cible** (généralement `cname.vercel-dns.com` ou similaire)

### Étape 2 : Corriger le CNAME dans Cloudflare

1. Allez sur : https://dash.cloudflare.com → Votre domaine → **DNS** → **Records**

2. Trouvez votre enregistrement CNAME pour `flyboard`

3. Cliquez sur **Edit**

4. Modifiez le **Target** :
   - ❌ **Ancien:** `flyboard-kjyjwpx45-taytos-projects-62dda2ca.vercel.app`
   - ✅ **Nouveau:** `cname.vercel-dns.com` (ou ce que Vercel vous a donné)

5. Vérifiez que :
   - **Type:** CNAME ✅
   - **Name:** `flyboard` ✅
   - **Target:** `cname.vercel-dns.com` (ou la cible Vercel) ✅
   - **Proxy status:** ✅ **Proxied** (nuage orange)
   - **TTL:** Auto ✅

6. Cliquez sur **Save**

### Étape 3 : Vérifier dans Vercel

1. Dans Vercel : **Settings** → **Domains**
2. Votre domaine devrait apparaître avec le statut **Valid** ou **Configured**
3. Si c'est **Pending**, attendez quelques minutes

### Étape 4 : Attendre la propagation

1. La propagation DNS peut prendre de 5 minutes à 48 heures
2. Généralement, c'est quelques minutes avec Cloudflare
3. Vérifiez avec : https://dnschecker.org

## 🔍 Comment trouver la bonne cible Vercel

Si vous n'avez pas encore ajouté le domaine dans Vercel :

1. **Vercel** → **Settings** → **Domains** → **Add Domain**
2. Entrez : `flyboard.flynesis.com`
3. Vercel affichera quelque chose comme :
   ```
   Add a CNAME record:
   Name: flyboard
   Target: cname.vercel-dns.com
   ```
4. Utilisez cette cible dans Cloudflare

## ✅ Configuration finale correcte

**Dans Cloudflare :**
- **Type:** CNAME
- **Name:** `flyboard`
- **Target:** `cname.vercel-dns.com` (ou la cible fournie par Vercel)
- **Proxy:** ✅ Proxied (orange cloud)
- **TTL:** Auto

**Dans Vercel :**
- Domaine ajouté et validé
- Statut : **Valid** ou **Configured**

## 🎯 Résultat attendu

Après correction :
- Votre domaine `flyboard.flynesis.com` pointera vers Vercel
- HTTPS fonctionnera automatiquement
- L'application sera accessible via votre domaine personnalisé

