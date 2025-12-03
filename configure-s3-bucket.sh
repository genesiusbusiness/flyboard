#!/bin/bash

# Script pour configurer les permissions du bucket S3 pour FlyBoard
# Usage: ./configure-s3-bucket.sh

set -e

BUCKET="flyboard.flynesis.com"
REGION="eu-north-1"

echo "🔧 Configuration du bucket S3 pour l'accès public..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Désactiver le Block Public Access (nécessaire pour l'accès public)
echo -e "${YELLOW}1. Désactivation du Block Public Access...${NC}"
aws s3api put-public-access-block \
  --bucket $BUCKET \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --region $REGION
echo -e "${GREEN}✅ Block Public Access désactivé${NC}"
echo ""

# 2. Configurer la politique de bucket pour l'accès public en lecture
echo -e "${YELLOW}2. Configuration de la politique de bucket...${NC}"
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET --policy file:///tmp/bucket-policy.json --region $REGION
rm /tmp/bucket-policy.json
echo -e "${GREEN}✅ Politique de bucket configurée${NC}"
echo ""

# 3. Configurer le site web statique
echo -e "${YELLOW}3. Configuration du site web statique...${NC}"
aws s3 website s3://$BUCKET/ \
  --index-document index.html \
  --error-document _not-found.html \
  --region $REGION
echo -e "${GREEN}✅ Configuration du site web activée${NC}"
echo ""

# 4. Configurer les CORS (si nécessaire)
echo -e "${YELLOW}4. Configuration CORS...${NC}"
cat > /tmp/cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET --cors-configuration file:///tmp/cors-config.json --region $REGION
rm /tmp/cors-config.json
echo -e "${GREEN}✅ CORS configuré${NC}"
echo ""

# 5. Note sur les ACLs (non nécessaires si le bucket n'autorise pas les ACLs)
echo -e "${YELLOW}5. Configuration des objets...${NC}"
echo -e "${GREEN}✅ Les objets sont accessibles via la politique de bucket${NC}"
echo ""

echo -e "${GREEN}✅ Configuration terminée !${NC}"
echo ""
echo -e "${YELLOW}⚠️  Note:${NC}"
echo "   Le site sera accessible via:"
echo "   - http://${BUCKET}.s3-website-${REGION}.amazonaws.com"
echo "   - Ou via CloudFront si configuré"
echo ""
echo "   Pour HTTPS, configurez CloudFront avec un certificat SSL."

