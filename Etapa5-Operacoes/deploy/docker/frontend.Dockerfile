# Frontend - Dockerfile multi-stage (React)
# Ajuste comandos de build conforme seu bundler (Vite/CRA)
FROM node:20-alpine AS builder
WORKDIR /web

# Exemplo: se o frontend residir em Etapa3-Construcao/3.1-Stack1_Node_TS/frontend
COPY Etapa3-Construcao/3.1-Stack1_Node_TS/frontend/package.json ./
RUN npm ci || npm install
COPY Etapa3-Construcao/3.1-Stack1_Node_TS/frontend .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
