#!/bin/bash

# Script pour configurer CloudFront pour le bucket S3
# Usage: ./setup-cloudfront.sh [bucket-name] [domain-name]

set -e

BUCKET_NAME="${1:-flyboard-flynesis}"
DOMAIN_NAME="${2:-flyboard.flynesis.com}"
REGION="eu-north-1"
S3_WEBSITE_ENDPOINT="$BUCKET_NAME.s3-website.$REGION.amazonaws.com"

echo "🌐 Configuration de CloudFront pour $BUCKET_NAME"
echo ""

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé."
    exit 1
fi

echo "📋 Configuration:"
echo "   Bucket: $BUCKET_NAME"
echo "   Domain: $DOMAIN_NAME"
echo "   S3 Endpoint: $S3_WEBSITE_ENDPOINT"
echo ""

# Vérifier si une distribution existe déjà
EXISTING_DIST=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='$BUCKET_NAME'].Id" --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_DIST" ] && [ "$EXISTING_DIST" != "None" ]; then
    echo "✅ Distribution CloudFront existe déjà: $EXISTING_DIST"
    echo ""
    echo "🌐 URL CloudFront:"
    DIST_DOMAIN=$(aws cloudfront get-distribution --id "$EXISTING_DIST" --query "Distribution.DomainName" --output text 2>/dev/null || echo "")
    if [ -n "$DIST_DOMAIN" ]; then
        echo "   https://$DIST_DOMAIN"
    fi
    exit 0
fi

echo "📦 Création de la distribution CloudFront..."
echo ""
echo "⚠️  Note: Cette opération peut prendre 15-20 minutes."
echo "   CloudFront doit créer la distribution et la propager."
echo ""

# Créer la configuration CloudFront
cat > /tmp/cloudfront-config.json <<EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "$BUCKET_NAME",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$S3_WEBSITE_ENDPOINT",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only",
                    "OriginSslProtocols": {
                        "Quantity": 1,
                        "Items": ["TLSv1.2"]
                    }
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 0
            },
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 0
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

# Créer la distribution
DIST_OUTPUT=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json --region "$REGION" 2>&1)

if echo "$DIST_OUTPUT" | grep -q "Distribution"; then
    DIST_ID=$(echo "$DIST_OUTPUT" | grep -o '"Id": "[^"]*"' | cut -d'"' -f4)
    DIST_DOMAIN=$(echo "$DIST_OUTPUT" | grep -o '"DomainName": "[^"]*"' | cut -d'"' -f4)
    
    echo "✅ Distribution CloudFront créée !"
    echo ""
    echo "📋 Informations:"
    echo "   Distribution ID: $DIST_ID"
    echo "   Domain: $DIST_DOMAIN"
    echo ""
    echo "🌐 URL temporaire (en cours de déploiement):"
    echo "   https://$DIST_DOMAIN"
    echo ""
    echo "⏳ Le déploiement prend 15-20 minutes."
    echo "   Vérifiez le statut avec:"
    echo "   aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status'"
    echo ""
    echo "📝 Pour configurer un domaine personnalisé:"
    echo "   1. Créez un certificat SSL dans ACM pour $DOMAIN_NAME"
    echo "   2. Mettez à jour la distribution avec le certificat"
    echo "   3. Configurez un enregistrement DNS CNAME pointant vers $DIST_DOMAIN"
else
    echo "❌ Erreur lors de la création de la distribution:"
    echo "$DIST_OUTPUT"
    exit 1
fi

rm -f /tmp/cloudfront-config.json

