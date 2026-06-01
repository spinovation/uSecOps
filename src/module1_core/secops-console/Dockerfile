# Dockerfile for uSecOps Next.js Admin Console
FROM node:20-alpine AS runner

WORKDIR /app

# 1. Install dependencies
COPY package*.json ./
RUN npm install

# 2. Copy source and build assets
COPY . .
RUN npm run build

# 3. Environment parameters
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
