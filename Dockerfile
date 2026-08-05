# Rolefit API image
FROM node:20-alpine AS server
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/server.js"]
