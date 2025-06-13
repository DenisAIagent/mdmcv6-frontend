# Fichiers de développement
.git
.gitignore
README.md
CHECKLIST_FINALE*
*.md

# Cache et builds locaux
node_modules
dist
.vite
.cache

# Fichiers de configuration locaux
.env.local
.env.development
.env.test

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Tests
coverage
.nyc_output
test-results

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Scripts de développement
scripts/dev*
scripts/test*

# Images non optimisées (garder seulement les optimisées)
src/assets/**/*.png
src/assets/**/*.jpg
src/assets/**/*.jpeg
!src/assets/**/*-optimized.*
!src/assets/**/*-compressed.*

# Documentation
docs/
*.md
