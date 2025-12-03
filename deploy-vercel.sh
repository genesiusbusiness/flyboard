#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Déploiement Vercel..."

# Vérifier si connecté
if ! npx vercel whoami &>/dev/null; then
    echo "📝 Connexion à Vercel..."
    npx vercel login
fi

# Déployer
echo "📦 Déploiement en cours..."
npx vercel --prod --yes

echo "✅ Terminé !"

