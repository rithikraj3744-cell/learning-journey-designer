#!/bin/bash

# ========================================
# Complete Deployment Script for Linux/Mac
# ========================================

set -e  # Exit on error

echo "========================================"
echo "Learning Journey Designer - Deployment"
echo "========================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "[ERROR] Firebase CLI not found!"
    echo "Please install: npm install -g firebase-tools"
    exit 1
fi

echo "Step 1: Login to Firebase"
echo "========================================"
firebase login
echo "[SUCCESS] Logged in to Firebase"
echo ""

echo "Step 2: Deploy Firestore Security Rules"
echo "========================================"
firebase deploy --only firestore:rules,firestore:indexes
echo "[SUCCESS] Firestore rules deployed"
echo ""

echo "Step 3: Deploy Storage Security Rules"
echo "========================================"
firebase deploy --only storage:rules
echo "[SUCCESS] Storage rules deployed"
echo ""

echo "Step 4: Build Frontend Production Bundle"
echo "========================================"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building production bundle..."
npm run build
echo "[SUCCESS] Frontend built successfully"
cd ..
echo ""

echo "Step 5: Deploy to Firebase Hosting"
echo "========================================"
firebase deploy --only hosting
echo "[SUCCESS] Frontend deployed to Firebase Hosting"
echo ""

echo "========================================"
echo "DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "Your application is now live at:"
echo "https://learning-journey-designe-5335a.firebaseapp.com"
echo ""
echo "NEXT STEPS:"
echo "1. Deploy backend to Render.com or Railway.app"
echo "2. Update frontend/.env.production with backend URL"
echo "3. Rebuild and redeploy frontend: npm run build && firebase deploy --only hosting"
echo "4. Test all features in production"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
echo "========================================"
