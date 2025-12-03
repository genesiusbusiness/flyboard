#!/bin/bash

# Script pour configurer les redirections S3 pour Next.js routing

BUCKET="flyboard.flynesis.com"
REGION="eu-north-1"

echo "🔧 Configuration des redirections S3 pour Next.js..."
echo ""

# Créer le fichier de configuration de redirection
cat > /tmp/website-config.json <<EOF
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    },
    "RoutingRules": [
        {
            "Condition": {
                "HttpErrorCodeReturnedEquals": "404"
            },
            "Redirect": {
                "ReplaceKeyWith": "index.html"
            }
        }
    ]
}
EOF

# Appliquer la configuration
aws s3api put-bucket-website \
    --bucket $BUCKET \
    --website-configuration file:///tmp/website-config.json \
    --region $REGION

rm /tmp/website-config.json

echo ""
echo "✅ Redirections configurées"
echo ""
echo "⚠️  Note: Les redirections S3 sont limitées."
echo "   Pour un routing complet Next.js, configurez CloudFront avec:"
echo "   - Custom Error Response 403 → 200 → /index.html"
echo "   - Custom Error Response 404 → 200 → /index.html"

