# Pipeline de Deploy - Sistema de Reserva Hoteleira

## 📋 Visão Geral

Pipeline completo de CI/CD usando **Docker** e **GitHub Actions** para deploy automatizado do sistema de reserva hoteleira.

---

## 🏗️ Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                     PIPELINE CI/CD                           │
└─────────────────────────────────────────────────────────────┘

1️⃣ COMMIT → GitHub
        ↓
2️⃣ LINT & QUALITY
   ├─ ESLint
   ├─ Prettier
   └─ Type Check
        ↓
3️⃣ TESTS
   ├─ Unit Tests (21)
   ├─ Integration Tests (6)
   └─ Coverage Report
        ↓
4️⃣ BUILD
   ├─ Docker Build (Backend)
   ├─ Docker Build (Frontend)
   └─ Push to Registry
        ↓
5️⃣ DEPLOY
   ├─ Staging (auto)
   └─ Production (manual approval)
```

---

## 🐳 Docker Strategy

### Multi-Stage Builds

**Decisão:** Usar multi-stage builds para otimizar tamanho das imagens

**Backend:**
```
Stage 1 (Builder): 
- Node 20 Alpine
- Instala dependências
- Compila TypeScript
- Tamanho: ~500MB

Stage 2 (Production):
- Node 20 Alpine
- Apenas runtime
- Código compilado
- Tamanho final: ~150MB ✅
```

**Frontend:**
```
Stage 1 (Builder):
- Node 20 Alpine
- Build React
- Tamanho: ~800MB

Stage 2 (Production):
- Nginx Alpine
- Apenas arquivos estáticos
- Tamanho final: ~25MB ✅
```

### Otimizações Implementadas

1. **Layer Caching**
   ```dockerfile
   # Copiar package.json primeiro
   COPY package*.json ./
   RUN npm ci
   # Depois copiar código (muda mais frequentemente)
   COPY . ./
   ```

2. **Usuário Não-Root**
   ```dockerfile
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

3. **Healthchecks**
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s \
     CMD node -e "require('http').get('http://localhost:3000/health')"
   ```

4. **Tini Process Manager**
   ```dockerfile
   ENTRYPOINT ["/sbin/tini", "--"]
   ```

---

## 🔄 Pipeline CI/CD

### Jobs Implementados

| Job | Descrição | Tempo | Bloqueante |
|-----|-----------|-------|------------|
| **Lint** | ESLint + Prettier | ~30s | ❌ Warning |
| **Test Unit** | 21 testes unitários | ~5s | ✅ Sim |
| **Test Integration** | 6 testes integração | ~10s | ✅ Sim |
| **Build** | Docker images | ~3min | ✅ Sim |
| **Deploy Staging** | Auto em develop | ~2min | ❌ Não |
| **Deploy Production** | Manual em main | ~2min | ✅ Aprovação |

**Tempo Total:** ~6 minutos

### Fluxo de Branches

```
feature/xxx → develop → staging (auto)
                  ↓
               main → production (manual)
```

**Estratégia:**
- **develop**: Deploy automático para staging
- **main**: Deploy manual para production (requer aprovação)
- **feature**: Apenas testes (sem deploy)

---

## 📦 Docker Compose

### Serviços Orquestrados

```yaml
services:
  postgres:    # Banco de dados
  redis:       # Cache
  backend:     # API Node.js
  frontend:    # React + Nginx
```

### Comandos Úteis

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Rebuild e restart
docker-compose up -d --build

# Parar tudo
docker-compose down

# Limpar volumes
docker-compose down -v
```

---

## 🚀 Deploy Strategies

### 1. Deploy Local (Desenvolvimento)

```bash
# Usar docker-compose
docker-compose up -d

# Acessar
# Frontend: http://localhost
# Backend: http://localhost:3000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### 2. Deploy Staging (Automático)

**Trigger:** Push para branch `develop`

**Processo:**
1. Testes passam ✅
2. Build de imagens Docker
3. Push para registry
4. Deploy automático para staging
5. Notificação no Slack

**URL:** https://staging.hotel-reservation.com

### 3. Deploy Production (Manual)

**Trigger:** Push para branch `main` + Aprovação manual

**Processo:**
1. Testes passam ✅
2. Build de imagens Docker
3. Aguarda aprovação manual ⏸️
4. Deploy para production
5. Cria release tag
6. Notificação no Slack

**URL:** https://hotel-reservation.com

---

## 🔐 Secrets e Variáveis

### GitHub Secrets Necessários

```bash
# Database
DB_PASSWORD=<senha_segura>

# JWT
JWT_SECRET=<secret_seguro>

# Notificações
SLACK_WEBHOOK=<webhook_url>

# Cloud Provider (exemplo AWS)
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-1
```

### Variáveis de Ambiente

**Backend:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=<secret>
```

**Frontend:**
```env
REACT_APP_API_URL=https://api.hotel-reservation.com
REACT_APP_ENV=production
```

---

## 📊 Monitoramento

### Healthchecks Implementados

**Backend:**
```typescript
// GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

**Frontend:**
```
GET /health
Response: 200 OK "healthy"
```

### Métricas Coletadas

- ✅ Tempo de resposta
- ✅ Taxa de erro
- ✅ Uso de memória
- ✅ Uso de CPU
- ✅ Conexões ativas

---

## 🎯 Estratégias de Deploy

### Blue-Green Deployment

```
┌─────────┐     ┌─────────┐
│  Blue   │     │  Green  │
│ (atual) │ ←→  │  (novo) │
└─────────┘     └─────────┘
      ↓              ↓
   Traffic      No Traffic
      
Deploy: Switch traffic Blue → Green
Rollback: Switch traffic Green → Blue
```

**Vantagens:**
- ✅ Zero downtime
- ✅ Rollback instantâneo
- ✅ Testes em produção antes de switch

### Rolling Update

```
Instance 1: v1 → v2
Instance 2: v1 → v2
Instance 3: v1 → v2
(um de cada vez)
```

**Vantagens:**
- ✅ Usa menos recursos
- ✅ Deploy gradual
- ✅ Detecta problemas cedo

### Canary Deployment

```
90% Traffic → v1 (stable)
10% Traffic → v2 (canary)

Se OK: 100% → v2
Se Erro: 100% → v1
```

**Vantagens:**
- ✅ Risco minimizado
- ✅ Testa com usuários reais
- ✅ Rollback fácil

---

## 🔧 Troubleshooting

### Problemas Comuns

**1. Build falha por falta de memória**
```yaml
# Aumentar memória do Docker
docker-compose:
  services:
    backend:
      mem_limit: 2g
```

**2. Testes falham no CI mas passam local**
```bash
# Verificar versão do Node
node --version  # Deve ser 20.x

# Limpar cache
npm ci --cache .npm
```

**3. Container não inicia**
```bash
# Ver logs
docker logs hotel-backend

# Verificar healthcheck
docker inspect hotel-backend | grep Health
```

**4. Conexão com banco falha**
```bash
# Verificar network
docker network inspect hotel-network

# Testar conexão
docker exec hotel-backend ping postgres
```

---

## 📈 Melhorias Futuras

### Fase 1: Atual ✅
- ✅ Docker multi-stage
- ✅ CI/CD básico
- ✅ Testes automatizados
- ✅ Deploy staging/production

### Fase 2: Próxima 📋
- [ ] Kubernetes (K8s)
- [ ] Helm charts
- [ ] Horizontal Pod Autoscaling
- [ ] Ingress controller

### Fase 3: Avançado 📋
- [ ] Service Mesh (Istio)
- [ ] Distributed tracing
- [ ] Prometheus + Grafana
- [ ] ELK Stack (logs)

### Fase 4: Observabilidade 📋
- [ ] APM (New Relic/DataDog)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## 🎓 Decisões Arquiteturais

### 1. Por que Docker?

**Vantagens:**
- ✅ Ambiente consistente (dev = prod)
- ✅ Isolamento de dependências
- ✅ Fácil escalar
- ✅ Portabilidade

**Alternativas consideradas:**
- ❌ VMs: Muito pesadas
- ❌ Bare metal: Difícil gerenciar

### 2. Por que GitHub Actions?

**Vantagens:**
- ✅ Integrado com GitHub
- ✅ Gratuito para projetos públicos
- ✅ Fácil configurar
- ✅ Marketplace de actions

**Alternativas consideradas:**
- Jenkins: Mais complexo
- GitLab CI: Requer GitLab
- CircleCI: Pago

### 3. Por que Multi-Stage Builds?

**Vantagens:**
- ✅ Imagens menores (150MB vs 500MB)
- ✅ Mais seguras (sem dev tools)
- ✅ Deploy mais rápido

**Trade-off:**
- ❌ Build um pouco mais lento
- ✅ Mitigado com cache

---

## 📚 Comandos Úteis

### Docker

```bash
# Build manual
docker build -f docker/Dockerfile.backend -t hotel-backend .

# Run manual
docker run -p 3000:3000 hotel-backend

# Ver imagens
docker images

# Limpar tudo
docker system prune -a --volumes
```

### Docker Compose

```bash
# Logs de um serviço
docker-compose logs -f backend

# Restart um serviço
docker-compose restart backend

# Executar comando em container
docker-compose exec backend npm test

# Ver status
docker-compose ps
```

### CI/CD

```bash
# Testar workflow localmente (act)
act -j test-unit

# Ver logs do workflow
gh run view

# Re-run workflow
gh run rerun
```

---

## 🎯 Checklist de Deploy

### Antes do Deploy

- [ ] Testes passando localmente
- [ ] Código revisado (PR aprovado)
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets configurados no GitHub
- [ ] Backup do banco de dados
- [ ] Documentação atualizada

### Durante o Deploy

- [ ] Monitorar logs
- [ ] Verificar healthchecks
- [ ] Testar endpoints críticos
- [ ] Verificar métricas

### Após o Deploy

- [ ] Smoke tests
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Notificar equipe

---

## 🎉 Conclusão

Pipeline completo de CI/CD implementado com:
- ✅ Docker otimizado (multi-stage)
- ✅ CI/CD automatizado (GitHub Actions)
- ✅ Testes automatizados (27 testes)
- ✅ Deploy staging/production
- ✅ Monitoramento e healthchecks
- ✅ Documentação completa

**Tempo total de deploy: ~6 minutos**
**Downtime: Zero (blue-green deployment)**
**Confiabilidade: Alta (testes + healthchecks)**
