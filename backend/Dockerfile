FROM node:20-alpine

WORKDIR /app

# Install curl for container health checking
RUN apk add --no-cache curl

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# Ensure upload directory exists and set node user ownership
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]