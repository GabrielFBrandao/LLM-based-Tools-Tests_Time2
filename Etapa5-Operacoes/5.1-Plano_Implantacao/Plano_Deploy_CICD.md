# Plano de Implantação e Pipeline CI/CD
**Docker · GitHub Actions · Staging · Produção**

| | |
| :--- | :--- |
| **Stack** | TypeScript 5 + Node.js 22 + React (Vite) |
| **Containerização** | Docker multi-stage + docker-compose |
| **Pipeline CI/CD** | GitHub Actions (6 jobs) |
| **Ambientes** | Local → Staging → Produção |
| **Entregáveis** | 5 arquivos: Dockerfile×2, compose, CI/CD, scripts |

---

## 1. Visão Geral da Estratégia
O plano de implantação cobre três camadas complementares que transformam o código TypeScript em um sistema rodando em produção de forma controlada, rastreável e revertível:

| Camada | O que resolve |
| :--- | :--- |
| **Containerização** | Empacota API + frontend em imagens Docker portáveis (mesmo comportamento em qualquer servidor) |
| **Pipeline CI/CD** | Automatiza validação, testes, build e deploy — elimina passos manuais e erros humanos |
| **Ambientes** | Staging valida antes de produção. Rollback automático em falha. Aprovação manual para produção |

> **DECISÃO CENTRAL:** Nenhum código vai para produção sem passar pelos 53 testes unitários + 21 testes de integração + aprovação manual de um reviewer. O pipeline bloqueia automaticamente se qualquer etapa falhar.

---

## 2. Containerização Docker

### 2.1 Build Multi-Stage
Ambos os Dockerfiles usam build multi-stage — a técnica mais importante para imagens de produção enxutas. O princípio é: cada stage produz apenas o que o próximo precisa.

**Dockerfile.api — API Node.js (3 stages)**
| Stage | Base | O que faz |
| :--- | :--- | :--- |
| `deps` | `node:22-alpine` | `npm ci --omit=dev` → apenas dependências de produção |
| `builder` | `node:22-alpine` | `npm ci` completo + `tsc --noEmitOnError` → gera a pasta `dist/` |
| `runner` | `node:22-alpine` | Copia `node_modules` de deps + `dist/` de builder |

*Resultado: imagem final com ~80 MB. Uma imagem simples teria ~500 MB. A redução de 80% impacta tempo de pull, segurança e custo de armazenamento.*

**Dockerfile.web — Frontend React (2 stages)**
| Stage | Base | O que faz |
| :--- | :--- | :--- |
| `builder` | `node:22-alpine` | `npm ci` + `vite build` → arquivos estáticos (HTML, JS, CSS) |
| `runner` | `nginx:1.27-alpine` | Copia `dist/` do builder + `nginx.conf`. Sem Node.js em produção |

### 2.2 Decisões de Segurança
* **USER node (não-root):** Princípio do menor privilégio — container comprometido não tem acesso root ao host.
* **dumb-init como ENTRYPOINT:** Garante que SIGTERM chegue ao processo Node.
* **.dockerignore completo:** O código-fonte não entra na imagem final.
* **npm ci --frozen-lockfile:** Reprodutibilidade garantida.

### 2.3 Configuração Nginx (Frontend)
O Nginx serve o frontend estático e atua como proxy reverso para a API:
* **CORS entre frontend e API:** Proxy `/api/` → `hotel-api:3000`.
* **React Router (SPA routing):** `try_files $uri $uri/ /index.html`.
* **Gzip:** Reduz transferência de JS/CSS em ~70%.

---

## 3. Docker Compose — Stack Local
O arquivo `docker-compose.yml` replica o ambiente de produção localmente. A API só inicializa após o Postgres estar pronto para aceitar conexões (usando `depends_on` com `condition: service_healthy`).

---

## 4. Pipeline CI/CD — GitHub Actions
O pipeline é definido em `ci-cd.yml` e tem 6 jobs organizados em sequência com paralelismo:

1. **validate:** Todo push e PR. Verifica tipos e lint.
2. **test-unit:** Após validate. Roda 53 testes.
3. **test-integration:** Paralelo ao unit. Roda 21 testes.
4. **build-images:** Apenas em push. Build e push para o GitHub Container Registry (GHCR) com tags automáticas (SHA do commit).
5. **deploy-staging:** Deploy automático para o servidor de staging. Roda smoke tests de health check.
6. **deploy-production:** Executa apenas em tags semânticas (vX.Y.Z). Exige aprovação manual. Possui rollback automático em caso de falha no health check pós-deploy.

---

## 5. Os Três Ambientes

| | Local | Staging | Produção |
| :--- | :--- | :--- | :--- |
| **Ativado por** | `docker compose up` | Push em main/develop | Tag vX.Y.Z + aprovação |
| **Banco** | PostgreSQL local | PostgreSQL no servidor | PostgreSQL no servidor |
| **Dados** | Volume local | Dados de teste | Dados reais |
| **Aprovação** | — | Automática | Manual obrigatória |
| **Rollback** | Backup local | Automático | Automático |

> **DECISÃO — Por que staging antes de produção?** Valida que o sistema funciona em infraestrutura real (servidor, banco real, rede real) antes de afetar usuários.

---

## 6. Estratégia de Rollback
* **Rollback Automático (pipeline):** Se o health check falhar após o deploy em produção, o pipeline restaura o backup do `docker-compose.yml` e sobe a versão anterior.
* **Rollback Manual:** O operador pode usar `./scripts/deploy.sh rollback` diretamente no servidor.

---

## 7. Gerenciamento de Secrets
Nenhum segredo é armazenado no repositório. O `.env.example` guia a configuração de senhas de banco, `JWT_SECRET`, tokens do Codecov e Webhooks do Slack via GitHub Secrets.