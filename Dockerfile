# Combined Rolefit image: API + built React client
FROM node:20-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client-build /client/dist ./client-dist
ENV NODE_ENV=production
ENV SERVE_CLIENT=true
EXPOSE 5000
CMD ["node", "src/server.js"]
