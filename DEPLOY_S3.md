# 🚀 Déploiement sur AWS S3

Guide complet pour déployer FlyBoard sur AWS S3 avec CloudFront.

## 📋 Prérequis

1. **AWS CLI installé et configuré**
   ```bash
   brew install awscli
   aws configure
   ```

2. **Permissions AWS nécessaires:**
   - `s3:CreateBucket`
   - `s3:PutObject`
   - `s3:PutBucketPolicy`
   - `s3:PutBucketWebsite`
   - `s3:PutPublicAccessBlock`
   - `cloudfront:CreateDistribution` (optionnel, pour CloudFront)

## 🚀 Déploiement rapide

### Étape 1: Configuration du bucket S3

```bash
./setup-s3-bucket.sh flyboard-flynesis
```

Cela va:
- Créer le bucket S3
- Activer le site web statique
- Configurer les permissions publiques
- Configurer CORS

### Étape 2: Build et déploiement

```bash
npm run build
./deploy-s3.sh flyboard-flynesis
```

Le script va:
- Vérifier que le build existe (dossier `out/`)
- Uploader tous les fichiers vers S3
- Configurer les en-têtes de cache appropriés

### Étape 3: (Optionnel) Configuration CloudFront

Pour utiliser HTTPS et un domaine personnalisé:

```bash
./setup-cloudfront.sh flyboard-flynesis flyboard.flynesis.com
```

## 🌐 URLs

Après le déploiement:

- **S3 Website Endpoint:**
  ```
  http://flyboard-flynesis.s3-website.eu-north-1.amazonaws.com
  ```

- **CloudFront (si configuré):**
  ```
  https://[distribution-id].cloudfront.net
  ```

## ⚙️ Configuration

### Variables d'environnement

Assurez-vous que les variables suivantes sont configurées dans votre `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xlzrywplyqpyvkcipgei.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### Configuration Supabase

Après le déploiement, configurez Supabase:

1. Allez sur: https://supabase.com/dashboard/project/xlzrywplyqpyvkcipgei/auth/url-configuration

2. Ajoutez dans **Site URL:**
   ```
   http://flyboard-flynesis.s3-website.eu-north-1.amazonaws.com
   ```
   (ou votre URL CloudFront si configuré)

3. Ajoutez dans **Redirect URLs:**
   ```
   http://flyboard-flynesis.s3-website.eu-north-1.amazonaws.com/**
   ```

## 🔄 Mise à jour

Pour mettre à jour le site:

```bash
npm run build
./deploy-s3.sh flyboard-flynesis
```

## ⚠️ Notes importantes

1. **Routing Next.js:**
   - S3 seul ne supporte pas le routing côté client
   - CloudFront est **recommandé** pour que les routes dynamiques fonctionnent
   - CloudFront redirige les erreurs 404/403 vers `index.html`

2. **HTTPS:**
   - S3 Website Endpoint ne supporte que HTTP
   - Utilisez CloudFront pour HTTPS

3. **Coûts:**
   - S3: Gratuit pour les premiers 5 GB de stockage
   - CloudFront: Gratuit pour les premiers 1 TB de transfert/mois
   - Total: **Gratuit** pour la plupart des cas d'usage

## 🐛 Dépannage

### Erreur: "Access Denied"
- Vérifiez que les permissions publiques sont activées
- Vérifiez la politique du bucket

### Routes ne fonctionnent pas
- Configurez CloudFront avec les Custom Error Responses
- Vérifiez que `index.html` est bien l'erreur document

### Build échoue
- Vérifiez que tous les `generateStaticParams` sont présents
- Vérifiez les logs de build: `npm run build`

