#!/bin/bash

# Script to remove Better Stack integration from projects
# Usage: ./remove-betterstack.sh [project-path]

PROJECT_PATH=${1:-.}

echo "🧹 Removing Better Stack integration from $PROJECT_PATH"

# Remove status component directory
if [ -d "$PROJECT_PATH/packages/observability/status" ]; then
  echo "  ❌ Removing packages/observability/status directory..."
  rm -rf "$PROJECT_PATH/packages/observability/status"
fi

# Remove Better Stack from keys.ts
if [ -f "$PROJECT_PATH/packages/observability/keys.ts" ]; then
  echo "  📝 Removing Better Stack keys from observability/keys.ts..."
  # Remove BETTERSTACK_API_KEY line
  sed -i '' '/BETTERSTACK_API_KEY:/d' "$PROJECT_PATH/packages/observability/keys.ts"
  # Remove BETTERSTACK_URL line  
  sed -i '' '/BETTERSTACK_URL:/d' "$PROJECT_PATH/packages/observability/keys.ts"
  # Remove from runtimeEnv
  sed -i '' '/BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY/d' "$PROJECT_PATH/packages/observability/keys.ts"
  sed -i '' '/BETTERSTACK_URL: process.env.BETTERSTACK_URL/d' "$PROJECT_PATH/packages/observability/keys.ts"
fi

# Remove from .env.example
if [ -f "$PROJECT_PATH/.env.example" ]; then
  echo "  📝 Removing Better Stack from .env.example..."
  # Remove Better Stack section
  sed -i '' '/# Better Stack/,/^$/d' "$PROJECT_PATH/.env.example"
  sed -i '' '/BETTERSTACK_API_KEY=/d' "$PROJECT_PATH/.env.example"
  sed -i '' '/BETTERSTACK_URL=/d' "$PROJECT_PATH/.env.example"
fi

# Remove from .env.local or .env
for ENV_FILE in "$PROJECT_PATH/.env.local" "$PROJECT_PATH/.env" "$PROJECT_PATH/apps/app/.env"; do
  if [ -f "$ENV_FILE" ]; then
    echo "  📝 Removing Better Stack from $ENV_FILE..."
    sed -i '' '/BETTERSTACK_API_KEY=/d' "$ENV_FILE"
    sed -i '' '/BETTERSTACK_URL=/d' "$ENV_FILE"
  fi
done

# Remove Better Stack imports from any files
echo "  🔍 Checking for Better Stack imports..."
if command -v rg &> /dev/null; then
  rg -l "from.*observability/status" "$PROJECT_PATH" 2>/dev/null | while read -r file; do
    echo "    📝 Removing import from $file"
    sed -i '' '/from.*observability\/status/d' "$file"
  done
fi

# Remove Better Stack from package.json exports if present
if [ -f "$PROJECT_PATH/packages/observability/package.json" ]; then
  echo "  📦 Cleaning package.json exports..."
  # Use a temporary file for complex JSON editing
  if command -v jq &> /dev/null; then
    jq 'del(.exports."./status")' "$PROJECT_PATH/packages/observability/package.json" > tmp.json && mv tmp.json "$PROJECT_PATH/packages/observability/package.json"
  fi
fi

echo "✅ Better Stack removal complete!"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm install' to update dependencies"
echo "2. Run 'pnpm build' to verify the build still works"
echo "3. Commit the changes"