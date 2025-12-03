#!/bin/bash
set -e

echo "🚀 Déploiement automatique FlyBoard sur AWS Amplify"
echo "=================================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
APP_NAME="flyboard"
REGION="eu-north-1"

echo -e "${GREEN}✅ Étape 1/4 : Vérification du build...${NC}"
npm run build
echo -e "${GREEN}✅ Build réussi !${NC}"

echo ""
echo -e "${GREEN}✅ Étape 2/4 : Vérification Git...${NC}"
if [ ! -d ".git" ]; then
    echo "Initialisation Git..."
    git init
    git add .
    git commit -m "Initial commit - Ready for Amplify"
fi

echo ""
echo -e "${YELLOW}⚠️  Étape 3/4 : Repository Git distant requis${NC}"
echo ""
echo "Pour déployer automatiquement, vous avez 2 options :"
echo ""
echo "OPTION A - Créer un repo GitHub et pousser :"
echo "  1. Créer un repo sur https://github.com/new (nom: flyboard)"
echo "  2. Exécuter :"
echo "     git remote add origin https://github.com/VOTRE_USERNAME/flyboard.git"
echo "     git push -u origin main"
echo "  3. Aller sur https://console.aws.amazon.com/amplify/"
echo "  4. New app → Host web app → GitHub → Sélectionner flyboard"
echo ""
echo "OPTION B - Utiliser Amplify CLI (interactif) :"
echo "  npx @aws-amplify/cli init"
echo "  npx @aws-amplify/cli add hosting"
echo "  npx @aws-amplify/cli publish"
echo ""

echo -e "${GREEN}✅ Étape 4/4 : Variables d'environnement${NC}"
echo ""
echo "Variables à configurer dans AWS Amplify :"
echo "  NEXT_PUBLIC_SUPABASE_URL=https://yxkbvhymsvasknslhpsa.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4a2J2aHltc3Zhc2tuc2xocHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzI1MjQsImV4cCI6MjA3NzI0ODUyNH0.zbE1YiXZXDEgpLkRS9XDU8yt4n4EiQItU_YSoEQveTM"
echo ""

echo -e "${GREEN}✅ Projet prêt pour déploiement !${NC}"
echo ""
echo "📝 Fichiers créés :"
echo "  - amplify.yml (configuration build)"
echo "  - .amplifyignore (fichiers à ignorer)"
echo "  - DEPLOY_NOW.md (instructions détaillées)"
echo ""

