#!/bin/bash

# Script de déploiement FlyBoard sur AWS S3
# Usage: ./deploy-s3.sh [bucket-name] [region]

set -e

echo "🚀 Déploiement de FlyBoard sur AWS S3..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${1:-flyboard.flynesis.com}"
REGION="${2:-eu-north-1}"

echo -e "${BLUE}Configuration:${NC}"
echo "  Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo ""

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
  echo -e "${RED}❌ AWS CLI n'est pas installé${NC}"
  echo "   Installez-le: https://aws.amazon.com/cli/"
  exit 1
fi

# Vérifier la connexion AWS
echo -e "${YELLOW}🔍 Vérification de la connexion AWS...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}❌ Erreur: Impossible de se connecter à AWS${NC}"
  echo "   Configurez vos credentials: aws configure"
  exit 1
fi
echo -e "${GREEN}✅ Connexion AWS OK${NC}"
echo ""

# Vérifier que le bucket existe
echo -e "${YELLOW}🔍 Vérification du bucket S3...${NC}"
if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
  echo -e "${YELLOW}⚠️  Le bucket n'existe pas. Création...${NC}"
  aws s3 mb "s3://$BUCKET_NAME" --region $REGION
  echo -e "${GREEN}✅ Bucket créé${NC}"
else
  echo -e "${GREEN}✅ Bucket trouvé${NC}"
fi
echo ""

# Build
echo -e "${YELLOW}📦 Build du projet...${NC}"
npm run build

if [ ! -d ".next" ]; then
  echo -e "${RED}❌ Le build a échoué${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build réussi${NC}"
echo ""

# Copier les fichiers statiques
echo -e "${YELLOW}📤 Upload des fichiers statiques vers S3...${NC}"

# Copier .next/static
if [ -d ".next/static" ]; then
  aws s3 sync .next/static s3://$BUCKET_NAME/_next/static \
    --delete \
    --region $REGION \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "application/javascript"
fi

# Copier public (incluant favicon, etc.)
if [ -d "public" ]; then
  aws s3 sync public s3://$BUCKET_NAME \
    --delete \
    --region $REGION \
    --exclude "*.map" \
    --cache-control "public, max-age=86400"
fi

# Copier les pages HTML depuis .next/server/app vers la racine
if [ -d ".next/server/app" ]; then
  echo "📄 Copie des pages HTML..."
  # Copier tous les fichiers HTML en préservant la structure
  find .next/server/app -name "*.html" -type f | while read file; do
    # Extraire le chemin relatif
    rel_path=${file#.next/server/app/}
    # Copier avec le bon chemin
    aws s3 cp "$file" "s3://$BUCKET_NAME/$rel_path" \
      --region $REGION \
      --content-type "text/html" \
      --cache-control "public, max-age=0, must-revalidate" \
      --quiet
  done
  echo -e "${GREEN}✅ Pages HTML copiées${NC}"
fi

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo -e "${BLUE}🌐 Votre site est disponible sur: https://$BUCKET_NAME${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT - Configuration requise:${NC}"
echo "   1. Configurez CloudFront pour le CDN et le SSL"
echo "   2. Les API routes nécessitent un serveur Node.js (EC2/ECS/Lambda)"
echo "   3. Configurez les redirections S3 pour les routes Next.js"
echo ""
echo -e "${BLUE}📝 Pour les API routes, vous pouvez:${NC}"
echo "   - Déployer .next/standalone sur EC2/ECS"
echo "   - Convertir les API routes en fonctions Lambda"
echo "   - Utiliser AWS Amplify (recommandé pour Next.js)"

