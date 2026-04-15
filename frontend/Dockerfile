# ── Frontend Dockerfile ───────────────────────────────────────
# Dev mode:  runs Vite dev server (for docker-compose)
# Prod mode: build → nginx static serving
#
# Build:  docker build -t crm-frontend ./frontend
# Run:    docker run -p 5173:5173 crm-frontend

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
