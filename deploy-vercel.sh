#!/bin/bash

# Script de déploiement sur Vercel
# Usage: ./deploy-vercel.sh

set -e

echo "🚀 Déploiement sur Vercel..."
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Vérifier si l'utilisateur est connecté
if ! npx vercel whoami &> /dev/null; then
    echo "⚠️  Vous n'êtes pas connecté à Vercel."
    echo ""
    echo "🔐 Connexion nécessaire:"
    echo "   npx vercel login"
    echo ""
    echo "Ensuite, relancez ce script."
    exit 1
fi

echo "✅ Connecté à Vercel"
echo ""

# Build du projet
echo "📦 Build du projet..."
npm run build

if [ ! -d ".next" ]; then
    echo "❌ Le build a échoué."
    exit 1
fi

echo "✅ Build réussi"
echo ""

# Déploiement
echo "🚀 Déploiement en production..."
npx vercel --prod --yes

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌐 Votre application est maintenant en ligne sur Vercel !"
