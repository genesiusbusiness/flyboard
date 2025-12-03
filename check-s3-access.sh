#!/bin/bash

# Script pour vérifier l'accès au bucket S3

BUCKET="flyboard.flynesis.com"
REGION="us-east-1"

echo "🔍 Vérification de l'accès au bucket S3..."
echo ""

# Obtenir l'endpoint du site web
ENDPOINT="http://${BUCKET}.s3-website-${REGION}.amazonaws.com"

echo "📍 Endpoint du site web: $ENDPOINT"
echo ""

# Tester l'accès à quelques fichiers
echo "🧪 Test d'accès aux fichiers:"
echo ""

echo "1. Test index.html:"
curl -I "$ENDPOINT/index.html" 2>&1 | head -3
echo ""

echo "2. Test fichier JS:"
curl -I "$ENDPOINT/_next/static/chunks/fd9d1056-1f1f859026f5f0fa.js" 2>&1 | head -3
echo ""

echo "3. Test fichier CSS:"
curl -I "$ENDPOINT/_next/static/css/b03e5e273d91e349.css" 2>&1 | head -3
echo ""

echo "✅ Vérification terminée"
echo ""
echo "🌐 URL du site: $ENDPOINT"

