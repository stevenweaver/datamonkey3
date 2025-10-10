#!/bin/bash

# Script to clear hyphy-scope cache and rebuild
# This ensures we get the latest version consistently

set -e

echo "🧹 Clearing hyphy-scope cache and rebuilding..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

HYPHY_SCOPE_PATH="/Users/sweaver/Programming/hyphy-scope"
FASTA_VALIDATION_PATH="/Users/sweaver/Programming/fasta-validation"

# Check if hyphy-scope directory exists
if [ ! -d "$HYPHY_SCOPE_PATH" ]; then
    echo -e "${RED}❌ hyphy-scope directory not found at $HYPHY_SCOPE_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📂 Working with hyphy-scope at: $HYPHY_SCOPE_PATH${NC}"
echo -e "${YELLOW}📂 fasta-validation at: $FASTA_VALIDATION_PATH${NC}"

# Step 1: Clear Vite cache in both projects
echo -e "${YELLOW}🗑️  Clearing Vite caches...${NC}"
rm -rf "$HYPHY_SCOPE_PATH/.svelte-kit" 2>/dev/null || true
rm -rf "$HYPHY_SCOPE_PATH/dist" 2>/dev/null || true
rm -rf "$HYPHY_SCOPE_PATH/node_modules/.vite" 2>/dev/null || true

rm -rf "$FASTA_VALIDATION_PATH/.svelte-kit" 2>/dev/null || true
rm -rf "$FASTA_VALIDATION_PATH/node_modules/.vite" 2>/dev/null || true

# Step 2: Clear browser cache instruction
echo -e "${YELLOW}🌐 IMPORTANT: Clear your browser cache (Cmd+Shift+R or Ctrl+Shift+R)${NC}"

# Step 3: Rebuild hyphy-scope
echo -e "${YELLOW}🔨 Rebuilding hyphy-scope...${NC}"
cd "$HYPHY_SCOPE_PATH"

# Run the build process
npm run package

# Step 4: Check if npm link is still active
echo -e "${YELLOW}🔗 Checking npm link status...${NC}"
cd "$FASTA_VALIDATION_PATH"

if [ -L "node_modules/hyphy-scope" ]; then
    echo -e "${GREEN}✅ npm link is active${NC}"
    ls -la node_modules/hyphy-scope
else
    echo -e "${RED}❌ npm link not found, re-linking...${NC}"
    npm link /Users/sweaver/Programming/hyphy-scope
fi

# Step 5: Force restart dev server
echo -e "${YELLOW}🔄 You should restart your dev server now${NC}"
echo -e "${GREEN}✅ Cache cleared and hyphy-scope rebuilt!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart your dev server (Ctrl+C and npm run dev)"
echo "2. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "3. Look for the 🧨 BUSTED debug messages in console"