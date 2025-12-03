# 🚀 Guide de déploiement FlyBoard sur AWS S3

## ⚠️ Important

FlyBoard utilise des **API routes Next.js** qui nécessitent un serveur Node.js. Pour déployer sur S3, vous avez deux options :

### Option 1 : S3 + CloudFront + Lambda@Edge (Recommandé)

Pour les API routes, utilisez Lambda@Edge ou un service serverless.

### Option 2 : S3 + EC2/ECS (Pour le serveur Next.js)

Déployez le build standalone sur un serveur EC2 ou ECS.

## 📋 Prérequis

1. **AWS CLI configuré** avec vos credentials
2. **Bucket S3** créé : `flyboard.flynesis.com`
3. **Variables d'environnement** configurées :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env.production` ou configurez-les dans votre environnement :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

### 2. Build du projet

```bash
npm run build
```

Le build standalone sera dans `.next/standalone/`

## 📤 Déploiement sur S3

### Script automatique

```bash
./deploy-s3.sh
```

Ou avec des paramètres personnalisés :
```bash
./deploy-s3.sh flyboard.flynesis.com us-east-1
```

### Déploiement manuel

```bash
# 1. Build
npm run build

# 2. Upload des assets statiques
aws s3 sync .next/static s3://flyboard.flynesis.com/_next/static \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# 3. Upload du dossier public
aws s3 sync public s3://flyboard.flynesis.com --delete

# 4. Pour les API routes, déployez .next/standalone sur EC2/ECS
```

## 🌐 Configuration CloudFront (Recommandé)

1. Créez une distribution CloudFront pointant vers votre bucket S3
2. Configurez le certificat SSL pour `flyboard.flynesis.com`
3. Configurez les redirections et les headers de sécurité

## 🔒 Sécurité

- ✅ Headers de sécurité configurés dans `next.config.js`
- ✅ Variables d'environnement non commitées (`.gitignore`)
- ✅ RLS activé sur toutes les tables Supabase

## 📝 Notes

- Les API routes nécessitent un serveur Node.js
- Pour un déploiement 100% statique, il faudrait migrer les API routes vers des fonctions serverless

