#!/bin/bash
set -e

echo "🚀 Déploiement automatique sur AWS Amplify..."

# Variables
APP_NAME="flyboard"
REGION="eu-north-1"
SUPABASE_URL="https://yxkbvhymsvasknslhpsa.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4a2J2aHltc3Zhc2tuc2xocHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzI1MjQsImV4cCI6MjA3NzI0ODUyNH0.zbE1YiXZXDEgpLkRS9XDU8yt4n4EiQItU_YSoEQveTM"

echo "📦 Build du projet..."
npm run build

echo "✅ Build terminé !"
echo ""
echo "⚠️  Pour déployer automatiquement, vous devez :"
echo "1. Créer un repository GitHub/GitLab"
echo "2. Pousser le code"
echo "3. Connecter dans AWS Amplify Console"
echo ""
echo "Ou utiliser Amplify CLI interactif :"
echo "  npx @aws-amplify/cli init"
