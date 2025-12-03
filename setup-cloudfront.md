# Configuration CloudFront pour FlyBoard

## 🌐 Endpoint S3 Website
- **URL**: `http://flyboard.flynesis.com.s3-website.eu-north-1.amazonaws.com`
- **Région**: `eu-north-1`

## 📋 Étapes pour configurer CloudFront

### 1. Créer une distribution CloudFront

Dans la console AWS CloudFront :

1. **Origin Domain**: 
   ```
   flyboard.flynesis.com.s3-website.eu-north-1.amazonaws.com
   ```
   ⚠️ Utilisez l'endpoint **website**, pas l'endpoint API S3

2. **Origin Path**: (laisser vide)

3. **Name**: `flyboard.flynesis.com`

4. **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`

5. **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`

6. **Cache Policy**: `CachingOptimized` ou `CachingDisabled` (pour le développement)

### 2. Configurer le certificat SSL

1. **SSL Certificate**: Utiliser un certificat ACM pour `flyboard.flynesis.com`
2. **Alternate Domain Names (CNAMEs)**: `flyboard.flynesis.com`

### 3. Configurer les erreurs personnalisées (CRITIQUE pour Next.js)

Pour que le routing Next.js fonctionne, vous DEVEZ configurer ces Custom Error Responses :

1. **HTTP Error Code**: `403`
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: `200`

2. **HTTP Error Code**: `404`
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: `200`

⚠️ **IMPORTANT**: Sans ces configurations, les routes Next.js (`/auth/login`, `/dashboard`, etc.) retourneront des erreurs 404.

### 4. Redirections pour Next.js

Ajouter des **Custom Error Responses**:
- **HTTP Error Code**: `403`
- **Response Page Path**: `/index.html`
- **HTTP Response Code**: `200`

- **HTTP Error Code**: `404`  
- **Response Page Path**: `/index.html`
- **HTTP Response Code**: `200`

## 🚀 Alternative: Script AWS CLI

```bash
# Créer la distribution CloudFront (nécessite un certificat ACM)
aws cloudfront create-distribution \
  --origin-domain-name flyboard.flynesis.com.s3-website.eu-north-1.amazonaws.com \
  --default-root-object index.html \
  --viewer-protocol-policy redirect-to-https
```

## ⚠️ Important

- Les **API routes** (`/api/*`) nécessitent un serveur Node.js
- Pour un déploiement complet, utilisez **AWS Amplify** ou déployez le serveur Next.js sur **EC2/ECS**

