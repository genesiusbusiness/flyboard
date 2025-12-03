#!/bin/bash

# Script pour vérifier la configuration complète du bucket S3

BUCKET="flyboard.flynesis.com"
REGION="eu-north-1"

echo "🔍 Vérification de la configuration S3..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Vérifier la politique de bucket
echo -e "${YELLOW}1. Vérification de la politique de bucket...${NC}"
POLICY=$(aws s3api get-bucket-policy --bucket $BUCKET --region $REGION --query 'Policy' --output text 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$POLICY" ]; then
  echo -e "${GREEN}✅ Politique de bucket configurée${NC}"
  echo "$POLICY" | python3 -m json.tool 2>/dev/null | head -10
else
  echo -e "${RED}❌ Pas de politique de bucket trouvée${NC}"
fi
echo ""

# 2. Vérifier Block Public Access
echo -e "${YELLOW}2. Vérification de Block Public Access...${NC}"
BLOCK=$(aws s3api get-public-access-block --bucket $BUCKET --region $REGION 2>&1)
if echo "$BLOCK" | grep -q "NoSuchPublicAccessBlockConfiguration"; then
  echo -e "${GREEN}✅ Block Public Access désactivé (pas de configuration)${NC}"
else
  echo "$BLOCK" | python3 -m json.tool 2>/dev/null
fi
echo ""

# 3. Vérifier le site web statique
echo -e "${YELLOW}3. Vérification du site web statique...${NC}"
WEBSITE=$(aws s3api get-bucket-website --bucket $BUCKET --region $REGION 2>&1)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Site web statique configuré${NC}"
  echo "$WEBSITE" | python3 -m json.tool 2>/dev/null
else
  echo -e "${RED}❌ Site web statique non configuré${NC}"
fi
echo ""

# 4. Vérifier les fichiers
echo -e "${YELLOW}4. Vérification des fichiers...${NC}"
FILES=$(aws s3 ls s3://$BUCKET/ --region $REGION --recursive | wc -l)
echo -e "${GREEN}✅ $FILES fichiers trouvés${NC}"
echo ""

# 5. Test d'accès
echo -e "${YELLOW}5. Test d'accès aux fichiers...${NC}"
ENDPOINT="http://${BUCKET}.s3-website.${REGION}.amazonaws.com"
echo "Endpoint: $ENDPOINT"
echo ""

# Test index.html
if curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT/index.html" | grep -q "200"; then
  echo -e "${GREEN}✅ index.html accessible${NC}"
else
  echo -e "${RED}❌ index.html non accessible${NC}"
fi

# Test fichier JS
if curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT/_next/static/chunks/fd9d1056-1f1f859026f5f0fa.js" | grep -q "200"; then
  echo -e "${GREEN}✅ Fichiers JS accessibles${NC}"
else
  echo -e "${RED}❌ Fichiers JS non accessibles${NC}"
fi

# Test fichier CSS
if curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT/_next/static/css/b03e5e273d91e349.css" | grep -q "200"; then
  echo -e "${GREEN}✅ Fichiers CSS accessibles${NC}"
else
  echo -e "${RED}❌ Fichiers CSS non accessibles${NC}"
fi

echo ""
echo -e "${GREEN}✅ Vérification terminée${NC}"

