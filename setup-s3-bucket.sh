#!/bin/bash

# Script pour créer et configurer le bucket S3
# Usage: ./setup-s3-bucket.sh [bucket-name]

set -e

BUCKET_NAME="${1:-flyboard-flynesis}"
REGION="eu-north-1"

echo "📦 Configuration du bucket S3: $BUCKET_NAME"
echo ""

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé."
    echo "   Installez-le avec: brew install awscli"
    exit 1
fi

# Vérifier la connexion AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à AWS."
    echo "   Configurez avec: aws configure"
    exit 1
fi

# Créer le bucket s'il n'existe pas
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "📦 Création du bucket..."
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ Bucket créé"
else
    echo "✅ Bucket existe déjà"
fi

# Activer le site web statique
echo "🌐 Configuration du site web statique..."
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html \
    --region "$REGION"
echo "✅ Site web statique activé"

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
echo "✅ Permissions configurées"

# Désactiver le blocage d'accès public
echo "🔓 Désactivation du blocage d'accès public..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "$REGION"
echo "✅ Accès public activé"

# Configurer CORS
echo "🌐 Configuration CORS..."
aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration "{
    \"CORSRules\": [
        {
            \"AllowedOrigins\": [\"*\"],
            \"AllowedMethods\": [\"GET\", \"HEAD\"],
            \"AllowedHeaders\": [\"*\"],
            \"ExposeHeaders\": [],
            \"MaxAgeSeconds\": 3000
        }
    ]
}" --region "$REGION"
echo "✅ CORS configuré"

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🌐 URL du site web:"
echo "   http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Exécutez: npm run build"
echo "   2. Exécutez: ./deploy-s3.sh $BUCKET_NAME"
echo "   3. (Optionnel) Configurez CloudFront: ./setup-cloudfront.sh"

