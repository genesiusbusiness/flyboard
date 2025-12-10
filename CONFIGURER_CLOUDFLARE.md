# 🌐 Configuration Cloudflare pour Vercel

Guide pour configurer Cloudflare avec votre déploiement Vercel et utiliser un domaine personnalisé.

## 📋 Prérequis

1. Un compte Cloudflare
2. Un domaine configuré dans Cloudflare
3. Votre application déployée sur Vercel

## 🚀 Configuration étape par étape

### Étape 1 : Ajouter le domaine dans Vercel

1. Allez sur : https://vercel.com/dashboard → **flyboard** → **Settings** → **Domains**

2. Cliquez sur **Add** ou **Add Domain**

3. Entrez votre domaine (ex: `flyboard.flynesis.com` ou `flyboard.com`)

4. Vercel vous donnera des enregistrements DNS à configurer

5. Notez ces informations :
   - **Type:** CNAME ou A
   - **Name:** (souvent `@` ou `www` ou `flyboard`)
   - **Value:** (l'URL Vercel, ex: `cname.vercel-dns.com`)

### Étape 2 : Configurer DNS dans Cloudflare

1. Allez sur : https://dash.cloudflare.com

2. Sélectionnez votre domaine

3. Allez dans **DNS** → **Records**

4. Ajoutez/modifiez les enregistrements selon ce que Vercel a demandé :

   **Option A : CNAME (recommandé)**
   - **Type:** CNAME
   - **Name:** `flyboard` (ou `@` pour le domaine racine, ou `www`)
   - **Target:** `cname.vercel-dns.com` (ou ce que Vercel a indiqué)
   - **Proxy status:** ✅ Proxied (orange cloud activé)
   - **TTL:** Auto

   **Option B : A Record (si Vercel le demande)**
   - **Type:** A
   - **Name:** `@` (ou `flyboard`)
   - **IPv4 address:** (l'adresse IP fournie par Vercel)
   - **Proxy status:** ✅ Proxied (orange cloud activé)
   - **TTL:** Auto

5. Cliquez sur **Save**

### Étape 3 : Configurer SSL/TLS dans Cloudflare

1. Dans Cloudflare, allez dans **SSL/TLS**

2. **Encryption mode:** Sélectionnez **Full** ou **Full (strict)**
   - **Full** : Cloudflare chiffre la connexion vers Vercel
   - **Full (strict)** : Vérifie aussi le certificat (recommandé si Vercel a un certificat valide)

3. Cliquez sur **Save**

### Étape 4 : Attendre la propagation DNS

1. La propagation DNS peut prendre de quelques minutes à 48 heures
2. Vérifiez avec : https://dnschecker.org
3. Entrez votre domaine et vérifiez que les enregistrements sont corrects

### Étape 5 : Vérifier dans Vercel

1. Dans Vercel : **Settings** → **Domains**
2. Votre domaine devrait apparaître avec un statut **Valid** ou **Configured**
3. Si c'est **Pending**, attendez quelques minutes

## 🔧 Configuration avancée (optionnel)

### Redirection www vers non-www (ou inversement)

Dans Cloudflare → **Rules** → **Redirect Rules** :

**Exemple : Rediriger www vers non-www**
- **Rule name:** Redirect www to non-www
- **If:** `http.host eq "www.flyboard.flynesis.com"`
- **Then:** Redirect to `https://flyboard.flynesis.com` (301 Permanent)

### Page Rules pour cache (optionnel)

Dans Cloudflare → **Rules** → **Page Rules** :

**Exemple : Cache les assets statiques**
- **URL:** `flyboard.flynesis.com/_next/static/*`
- **Settings:**
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

## ✅ Vérification finale

1. Ouvrez votre domaine personnalisé dans le navigateur
2. Vérifiez que l'application se charge correctement
3. Vérifiez que HTTPS fonctionne (cadenas vert)
4. Testez la connexion et les fonctionnalités

## 🔄 Mise à jour de Supabase

Après avoir configuré le domaine personnalisé, mettez à jour Supabase :

1. Allez sur : https://supabase.com/dashboard/project/yxkbvhymsvasknslhpsa/auth/url-configuration

2. Dans **Redirect URLs**, ajoutez :
   ```
   https://flyboard.flynesis.com/**
   https://www.flyboard.flynesis.com/**
   ```
   (Remplacez par votre vrai domaine)

3. Cliquez sur **Save changes**

## 📝 Notes importantes

- **Proxy Cloudflare (orange cloud) :** Activez-le pour bénéficier de la protection DDoS et du cache
- **SSL/TLS :** Utilisez "Full (strict)" si possible pour une sécurité maximale
- **Propagation DNS :** Peut prendre jusqu'à 48h, mais généralement quelques minutes
- **Vercel :** Génère automatiquement un certificat SSL pour votre domaine

## 🐛 Dépannage

### Le domaine ne fonctionne pas

1. Vérifiez les enregistrements DNS dans Cloudflare
2. Vérifiez que le domaine est bien ajouté dans Vercel
3. Attendez la propagation DNS (peut prendre du temps)
4. Vérifiez les logs Vercel pour des erreurs

### Erreur SSL

1. Dans Cloudflare, vérifiez que SSL/TLS est en mode "Full" ou "Full (strict)"
2. Attendez quelques minutes pour que le certificat se génère
3. Vérifiez dans Vercel que le domaine a un statut "Valid"

