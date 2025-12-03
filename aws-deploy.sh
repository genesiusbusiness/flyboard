#!/bin/bash

# Script de déploiement FlyBoard sur AWS S3 + CloudFront
# Usage: ./aws-deploy.sh

set -e

BUCKET="flyboard.flynesis.com"
REGION="us-east-1"

echo "🚀 Déploiement FlyBoard sur AWS S3..."
echo ""

# Build
echo "📦 Build en cours..."
npm run build

# Upload vers S3
echo "📤 Upload vers S3..."
aws s3 sync .next/static s3://$BUCKET/_next/static --delete --cache-control "public, max-age=31536000, immutable"
aws s3 sync public s3://$BUCKET --delete --exclude "*.map"

# Invalider CloudFront (si configuré)
echo "🔄 Invalidation CloudFront..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?@=='$BUCKET']].Id" --output text)
if [ ! -z "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
  echo "✅ Cache CloudFront invalidé"
fi

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 https://$BUCKET"

