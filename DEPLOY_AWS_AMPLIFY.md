# 🚀 Déploiement FlyBoard sur AWS Amplify (Gratuit)

## 📋 Pourquoi AWS Amplify ?

**AWS Amplify** est la meilleure option gratuite pour Next.js sur AWS car :
- ✅ **Gratuit jusqu'à 15 GB de stockage et 5 GB de transfert/mois**
- ✅ **Support natif Next.js** (SSR, API routes, etc.)
- ✅ **Déploiement automatique** depuis Git
- ✅ **HTTPS inclus** (certificat SSL automatique)
- ✅ **CDN global** (CloudFront inclus)
- ✅ **Build automatique** à chaque push
- ✅ **Variables d'environnement** sécurisées

## 🎯 Étapes de déploiement

### 1. Préparer le projet

Assurez-vous que votre projet est prêt :
```bash
cd "Flynesis App/FlyBoard"
npm run build  # Vérifier que le build fonctionne
```

### 2. Créer un compte AWS (si pas déjà fait)

1. Aller sur https://aws.amazon.com/free/
2. Créer un compte (nécessite carte bancaire mais pas de frais si vous restez dans les limites gratuites)

### 3. Déployer via AWS Amplify Console

#### Option A : Via la console AWS (Recommandé)

1. **Aller sur AWS Amplify Console**
   - https://console.aws.amazon.com/amplify/
   - Cliquer sur "New app" → "Host web app"

2. **Connecter votre repository Git**
   - GitHub, GitLab, Bitbucket, ou CodeCommit
   - Autoriser AWS Amplify à accéder à votre repo

3. **Configurer le build**
   - Amplify détecte automatiquement Next.js
   - Build settings (généralement automatique) :
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Configurer les variables d'environnement**
   - Dans "Environment variables" :
     - `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anonyme Supabase
     - `SUPABASE_SERVICE_ROLE_KEY` = (optionnel, pour API routes)

5. **Déployer**
   - Cliquer sur "Save and deploy"
   - Attendre 5-10 minutes pour le premier déploiement

#### Option B : Via AWS CLI (Avancé)

```bash
# Installer AWS CLI
brew install awscli  # macOS
# ou télécharger depuis https://aws.amazon.com/cli/

# Configurer AWS CLI
aws configure

# Installer Amplify CLI
npm install -g @aws-amplify/cli

# Initialiser Amplify
cd "Flynesis App/FlyBoard"
amplify init

# Ajouter hosting
amplify add hosting

# Publier
amplify publish
```

### 4. Configuration post-déploiement

1. **Domaine personnalisé** (optionnel)
   - Dans Amplify Console → App settings → Domain management
   - Ajouter votre domaine `flyboard.flynesis.com`
   - AWS gère automatiquement le certificat SSL

2. **Variables d'environnement**
   - App settings → Environment variables
   - Ajouter toutes les variables nécessaires

3. **Redirections** (si besoin)
   - App settings → Rewrites and redirects
   - Pour Next.js, généralement pas besoin (géré automatiquement)

## 💰 Coûts (Gratuit Tier)

### AWS Amplify Hosting (Gratuit)
- ✅ **15 GB de stockage** par mois
- ✅ **5 GB de transfert** par mois
- ✅ **1000 minutes de build** par mois
- ✅ **HTTPS inclus**
- ✅ **CDN CloudFront inclus**

### Si vous dépassez les limites
- Stockage : $0.023/GB/mois
- Transfert : $0.15/GB
- Build : $0.01/minute

**Recommandation** : Pour une app de taille moyenne, vous resterez dans les limites gratuites.

## 🔄 Déploiement continu

Une fois configuré, chaque push sur votre branche principale déclenchera automatiquement un nouveau déploiement.

## 🛠️ Alternative : AWS EC2 Free Tier (Plus complexe)

Si vous préférez plus de contrôle :

1. **Créer une instance EC2 t2.micro** (gratuite 12 mois)
2. **Installer Node.js et PM2**
3. **Configurer Nginx** comme reverse proxy
4. **Configurer SSL** avec Let's Encrypt

Mais c'est beaucoup plus complexe et nécessite maintenance.

## 📝 Checklist avant déploiement

- [ ] Build local fonctionne (`npm run build`)
- [ ] Variables d'environnement Supabase configurées
- [ ] Repository Git à jour
- [ ] Compte AWS créé
- [ ] CORS configuré côté Supabase (si nécessaire)

## 🆘 Support

- Documentation AWS Amplify : https://docs.amplify.aws/
- Support AWS : https://aws.amazon.com/support/

