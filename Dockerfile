# Dockerfile simple pour Railway
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Exposer le port (Railway utilise PORT dynamique)
EXPOSE $PORT

# Démarrer avec vite preview
CMD ["npm", "start"]