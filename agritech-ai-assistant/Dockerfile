FROM node:20-alpine

WORKDIR /app

# Install ALL dependencies (including devDeps for tsc)
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --omit=dev

# Remove source artifacts
RUN rm -rf src tsconfig.json

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/server.js"]
