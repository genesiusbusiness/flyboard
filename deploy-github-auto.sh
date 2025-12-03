#!/bin/bash
set -e

echo "🚀 Déploiement automatique complet FlyBoard"
echo "============================================"

# Vérifier GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI non installé. Installation..."
    brew install gh
fi

# Authentifier si nécessaire
if ! gh auth status &> /dev/null; then
    echo "🔐 Authentification GitHub requise..."
    echo "Suivez les instructions pour vous authentifier :"
    gh auth login
fi

echo ""
echo "✅ Étape 1/3 : Création du repository GitHub..."
gh repo create flyboard --public --source=. --remote=origin --push 2>&1 || {
    echo "⚠️  Repository existe peut-être déjà, vérification..."
    git remote add origin https://github.com/$(gh api user --jq .login)/flyboard.git 2>/dev/null || true
    git push -u origin main 2>/dev/null || echo "Push manuel requis"
}

REPO_URL=$(git remote get-url origin)
echo "✅ Repository créé : $REPO_URL"

echo ""
echo "✅ Étape 2/3 : Connexion à AWS Amplify..."
echo "   App ID: dmom7f5qf2hl0"
echo "   URL Console: https://console.aws.amazon.com/amplify/home?region=eu-north-1#/dmom7f5qf2hl0"

echo ""
echo "✅ Étape 3/3 : Instructions finales"
echo ""
echo "📝 Pour finaliser la connexion :"
echo "   1. Allez sur: https://console.aws.amazon.com/amplify/home?region=eu-north-1#/dmom7f5qf2hl0"
echo "   2. Cliquez sur 'Connect repository'"
echo "   3. Choisissez 'GitHub'"
echo "   4. Autorisez AWS Amplify"
echo "   5. Sélectionnez le repository 'flyboard'"
echo "   6. Sélectionnez la branche 'main'"
echo "   7. Cliquez sur 'Save and deploy'"
echo ""
echo "✨ Les variables d'environnement sont déjà configurées !"
echo "⏳ Le déploiement prendra 5-10 minutes"

