# ⚠️ IMPORTANT : Configuration CloudFront requise

## Problème actuel

Le routing Next.js ne fonctionne pas correctement avec S3 seul. Les routes comme `/auth/login` retournent des erreurs 404 car S3 cherche un fichier physique à cet emplacement.

## Solution : CloudFront avec Custom Error Responses

**CloudFront est OBLIGATOIRE** pour que le routing Next.js fonctionne correctement.

### Configuration CloudFront requise

1. **Créer une distribution CloudFront**
   - Origin: `flyboard.flynesis.com.s3-website.eu-north-1.amazonaws.com`
   - Default Root Object: `index.html`

2. **Configurer les Custom Error Responses** (CRITIQUE) :

   **Erreur 403:**
   - HTTP Error Code: `403`
   - Response Page Path: `/index.html`
   - HTTP Response Code: `200`
   - Error Caching Minimum TTL: `0`

   **Erreur 404:**
   - HTTP Error Code: `404`
   - Response Page Path: `/index.html`
   - HTTP Response Code: `200`
   - Error Caching Minimum TTL: `0`

3. **Configurer SSL**
   - Certificat ACM pour `flyboard.flynesis.com`
   - Alternate Domain Names: `flyboard.flynesis.com`
   - Viewer Protocol Policy: `Redirect HTTP to HTTPS`

## Alternative : AWS Amplify

Pour un déploiement Next.js complet avec API routes, **AWS Amplify** est la meilleure solution :
- Supporte nativement Next.js
- Gère automatiquement le routing
- Supporte les API routes
- SSL automatique

## État actuel

✅ Fichiers déployés sur S3
✅ Permissions configurées
✅ Site web statique activé
❌ Routing Next.js (nécessite CloudFront)
❌ API routes (nécessitent un serveur Node.js)

