# Backend - Dockerfile multi-stage (Node 20 + Alpine)
FROM node:20-alpine AS builder
WORKDIR /app

# Copia apenas manifests primeiro (para cache eficiente)
COPY Etapa3-Construcao/3.1-Stack1_Node_TS/package.json ./
COPY Etapa3-Construcao/3.1-Stack1_Node_TS/tsconfig.json ./
RUN npm ci || npm install

# Copia fontes
COPY Etapa3-Construcao/3.1-Stack1_Node_TS/src ./src

# Build (assumindo script build presente na Stack1)
RUN npx tsc -p . || npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Dependências apenas de runtime (se aplicável)
COPY Etapa3-Construcao/3.1-Stack1_Node_TS/package.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copia compilado
COPY --from=builder /app/dist ./dist

# Porta padrão
EXPOSE 3000

# CMD - ajustar para seu entrypoint
CMD ["node", "dist/demo/quartos-demo.js"]
