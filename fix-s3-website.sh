#!/bin/bash

# Script pour réactiver le site web statique S3 avec la bonne région

BUCKET="flyboard.flynesis.com"
REGION="eu-north-1"

echo "🔧 Réactivation du site web statique S3..."
echo ""

# Réactiver le site web statique
aws s3 website s3://$BUCKET/ \
  --index-document index.html \
  --error-document _not-found.html \
  --region $REGION

echo ""
echo "✅ Site web statique réactivé"
echo ""
echo "🌐 URL du site: http://${BUCKET}.s3-website.${REGION}.amazonaws.com"
echo ""
echo "⚠️  Note: Pour HTTPS, configurez CloudFront avec:"
echo "   - Origin: ${BUCKET}.s3-website.${REGION}.amazonaws.com"
echo "   - Certificat SSL pour flyboard.flynesis.com"

