#!/bin/bash

# Script de déploiement sur AWS S3
# Usage: ./deploy-s3.sh [bucket-name]

set -e

BUCKET_NAME="${1:-flyboard-flynesis}"
REGION="eu-north-1"
DIST_DIR="out"

echo "🚀 Déploiement sur AWS S3..."
echo ""

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé."
    echo "   Installez-le avec: brew install awscli"
    exit 1
fi

# Vérifier que le build existe
if [ ! -d "$DIST_DIR" ]; then
    echo "📦 Build non trouvé. Construction du projet..."
    npm run build
    
    if [ ! -d "$DIST_DIR" ]; then
        echo "❌ Le build a échoué ou le dossier $DIST_DIR n'existe pas."
        exit 1
    fi
fi

echo "✅ Build trouvé dans $DIST_DIR"
echo ""

# Vérifier si le bucket existe
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "📦 Création du bucket S3: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    
    # Activer le site web statique
    echo "🌐 Configuration du site web statique..."
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html \
        --region "$REGION"
    
    # Configurer les permissions publiques
    echo "🔓 Configuration des permissions..."
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Sid\": \"PublicReadGetObject\",
                \"Effect\": \"Allow\",
                \"Principal\": \"*\",
                \"Action\": \"s3:GetObject\",
                \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
            }
        ]
    }" --region "$REGION"
    
    # Désactiver le blocage d'accès public
    aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
        --region "$REGION"
    
    echo "✅ Bucket créé et configuré"
else
    echo "✅ Bucket existe déjà: $BUCKET_NAME"
fi

echo ""
echo "📤 Upload des fichiers vers S3..."

# Upload avec cache pour les assets statiques
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload des fichiers HTML avec cache court
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "*.json"

# Upload des autres fichiers
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --exclude "*" \
    --include "*.txt" \
    --include "*.xml" \
    --include "*.ico"

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌐 URL du site web:"
echo "   http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
echo ""
echo "⚠️  Note: Pour utiliser un domaine personnalisé et HTTPS, configurez CloudFront."
echo "   Voir: setup-cloudfront.sh"
