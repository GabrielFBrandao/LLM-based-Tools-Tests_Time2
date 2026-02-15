"""
Plano de Projeto — Sistema de Reserva de Hotel
Cronograma por Sprints com Estimativas em Story Points e Horas

4 abas:
  1. Visão Geral       — uma linha por sprint, totalizadores, legenda
  2. Backlog Detalhado — todas as histórias com SP, horas, critério de aceite
  3. Rastreabilidade   — RF ↔ Sprint ↔ Artefato de teste
  4. Burndown          — tabela de queima de SP sprint a sprint
"""

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = Workbook()

# ─── Paleta de cores ──────────────────────────────────────────────────────────
DARK   = "1A3A5C"  # azul marinho  — fundo de cabeçalhos principais
MID    = "2E6DA4"  # azul médio    — fundo de sub-cabeçalhos
LIGHT  = "D5E8F0"  # azul claro    — linhas alternadas
WHITE  = "FFFFFF"
GRAY   = "F5F5F5"
TEXT   = "333333"

# Status
DONE_BG  = "D5F0DC";  DONE_FG  = "1E8449"   # verde  — Concluído
PROG_BG  = "FFF9E6";  PROG_FG  = "7D6608"   # âmbar  — Em Progresso
PLAN_BG  = "FDECEA";  PLAN_FG  = "C0392B"   # coral  — Planejado

# Categorias
CAT_BG = {
    "Backend":      "EDE7F6", "Frontend":     "E3F2FD",
    "Infra/DevOps": "E8F5E9", "QA/Testes":    "FFF3E0",
    "Gestão":       "FCE4EC", "Manutenção":   "F3E5F5",
}
CAT_FG = {
    "Backend":      "5B2C6F", "Frontend":     "1565C0",
    "Infra/DevOps": "1B5E20", "QA/Testes":    "BF360C",
    "Gestão":       "880E4F", "Manutenção":   "6A1B9A",
}

# ─── Helpers de estilo ────────────────────────────────────────────────────────
def _side(color="CCCCCC"):
    return Side(style="thin", color=color)

def _border():
    s = _side()
    return Border(left=s, right=s, top=s, bottom=s)

def _fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def _font(bold=False, size=10, color=TEXT, name="Arial"):
    return Font(bold=bold, size=size, color=color, name=name)

def _align(h="left", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)

def style(cell, bold=False, size=10, fg=TEXT, bg=None,
          ha="left", wrap=False, va="center"):
    cell.font      = _font(bold=bold, size=size, color=fg)
    cell.alignment = _align(h=ha, v=va, wrap=wrap)
    cell.border    = _border()
    if bg:
        cell.fill = _fill(bg)

def header_row(ws, row, labels, widths=None, fg=WHITE, bg=DARK,
               size=10, height=22, ha="center"):
    ws.row_dimensions[row].height = height
    for col, lbl in enumerate(labels, 1):
        c = ws.cell(row=row, column=col, value=lbl)
        style(c, bold=True, size=size, fg=fg, bg=bg, ha=ha, wrap=True)
    if widths:
        for col, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(col)].width = w

def status_colors(status):
    if "Concluído" in status:
        return DONE_BG, DONE_FG
    if "Progresso" in status:
        return PROG_BG, PROG_FG
    return PLAN_BG, PLAN_FG

def alt_bg(row_idx, status):
    bg, _ = status_colors(status)
    if "Planejado" in status:
        return LIGHT if row_idx % 2 == 0 else WHITE
    return bg

# ══════════════════════════════════════════════════════════════════════════════
# ABA 1 — VISÃO GERAL
# ══════════════════════════════════════════════════════════════════════════════
ws1 = wb.active
ws1.title = "Visão Geral"

# Título principal
ws1.merge_cells("A1:I1")
c = ws1["A1"]
c.value = "PLANO DE PROJETO — Sistema de Reserva de Hotel"
style(c, bold=True, size=16, fg=WHITE, bg=DARK, ha="center")
ws1.row_dimensions[1].height = 38

ws1.merge_cells("A2:I2")
c = ws1["A2"]
c.value = "Stack: TypeScript 5 · Node.js 22 · React 18 · PostgreSQL 16 · Docker · GitHub Actions"
style(c, size=9, fg="8AB8D4", bg=DARK, ha="center")
ws1.row_dimensions[2].height = 18

ws1.row_dimensions[3].height = 10

# Bloco de legenda
ws1.merge_cells("A4:I4")
c = ws1["A4"]
c.value = "Convenções"
style(c, bold=True, size=10, fg=WHITE, bg=MID, ha="center")
ws1.row_dimensions[4].height = 20

leg = [("A","C","✅  Concluído",DONE_BG,DONE_FG),
       ("D","F","🔄  Em Progresso",PROG_BG,PROG_FG),
       ("G","I","📋  Planejado",PLAN_BG,PLAN_FG)]
ws1.row_dimensions[5].height = 20
for s, e, lbl, bg, fg in leg:
    ws1.merge_cells(f"{s}5:{e}5")
    c = ws1[f"{s}5"]
    c.value = lbl
    style(c, bold=True, size=10, fg=fg, bg=bg, ha="center")

ws1.row_dimensions[6].height = 12

# Cabeçalho da tabela de sprints
cols1 = ["Sprint", "Período / Foco", "Vel. (SP)", "Horas", "Status",
         "Categoria", "Módulo", "Entregas Concretas", "DoD"]
ws1_widths = [10, 20, 10, 8, 16, 14, 16, 42, 36]
header_row(ws1, 7, cols1, ws1_widths, height=24)

# Dados — uma linha por sprint
# (sprint, periodo, sp, h, status, cat, módulo, entregas, dod)
SPRINTS = [
    ("S0", "Pré-projeto\n(Setup)", 24, 24, "✅ Concluído",
     "Gestão", "Fundação",
     "Setup monorepo TS/Jest/ESLint; Req. RF01–RF18 documentados; Decisão de arquitetura (DIP/SRP/Resultado<T>); DoD definido",
     "tsconfig compila; npm test verde; ADR escrito"),

    ("S1", "Semana 1–2\n(Domínio)", 34, 34, "✅ Concluído",
     "Backend", "Domínio",
     "Entidades Quarto (imutável + copiarCom), Cama (value object); Enums StatusQuarto/TipoCama/TipoQuarto; Tipo Resultado<T>; DTOs CriarQuartoDTO/EditarQuartoDTO; 18 testes de domínio",
     "18 testes passando; cobertura ≥ 90%; TypeScript sem erros"),

    ("S2", "Semana 3–4\n(QuartoService)", 42, 42, "✅ Concluído",
     "Backend", "QuartoService",
     "cadastrarQuarto (RF01, RN01/03/04/05); editarQuarto (RF03); alterarStatus (RF04–06); listarQuartos + buscarPorId (RF02); IQuartoRepository + impl. em memória",
     "Regras RN01–RN10 implementadas; repositório mock disponível"),

    ("S3", "Semana 5–6\n(Testes Unitários)", 38, 38, "✅ Concluído",
     "QA/Testes", "Testes Unitários",
     "29 testes cadastrarQuarto (FP01–FP07 + RN + edge); 33 testes editarQuarto; MockQuartoRepository com spies; QuartoBuilder fluente; cobertura ≥ 90% enforced no CI",
     "62 testes unitários passando; jest --coverage ≥ 90%; CI bloqueia se cair"),

    ("S4", "Semana 7–8\n(Hóspede + Reserva)", 44, 44, "✅ Concluído",
     "Backend", "Hóspede + Reserva",
     "Entidade Hospede (CPF normalizado); HospedeService: cadastrar/editar (RF07–11, RN11–15); Entidade Reserva (imutável); ReservaService: criarReserva (RF12/15/18) + cancelarReserva (RF16/17); IHospedeRepository + IReservaRepository",
     "RF07–RF18 implementados; CPF único; quarto→OCUPADO/LIVRE automático"),

    ("S5", "Semana 9–10\n(Testes Integração)", 40, 40, "✅ Concluído",
     "QA/Testes", "Testes de Integração",
     "21 testes em 4 suites: fluxo ponta-a-ponta (INT-FP01–05); consistência entre serviços (INT-CS01–05); falhas parciais (INT-FH01–04); cenários avançados (INT-CN01–07); repositórios REAIS (sem mock)",
     "21 testes de integração passando; isolamento por beforeEach; zero dependência de infra"),

    ("S6", "Semana 11–12\n(Deploy / CI-CD)", 52, 52, "✅ Concluído",
     "Infra/DevOps", "Deploy & Pipeline",
     "Dockerfile.api multi-stage 3 fases (~80 MB); Dockerfile.web React+Nginx (~10 MB); docker-compose 3 serviços (hotel-db→hotel-api→hotel-web) com healthcheck; nginx.conf (proxy /api, SPA fallback, gzip, headers seg.); Pipeline GitHub Actions 6 jobs; deploy.sh (deploy/rollback/status/health)",
     "docker compose up sobe em < 60s; pipeline < 8 min; rollback automático em falha"),

    ("S7", "Semana 13–14\n(Observabilidade)", 46, 46, "✅ Concluído",
     "Infra/DevOps", "Observabilidade",
     "logger.ts (JSON estruturado, trace_id, startTimer, LGPD); metrics.ts (17 métricas: 5 HTTP + 8 negócio + 4 Node.js); middleware.ts (requestLogger + metricsMiddleware + /metrics); instrumented-services.ts (wrappers com error_code); 14 alertas Prometheus em 6 grupos; dashboard Grafana 15 painéis",
     "GET /metrics expõe Prometheus; trace_id propaga em todos os logs; 14 alertas configurados"),

    ("S8", "Semana 15–16\n(Refatoração)", 38, 38, "✅ Concluído",
     "Manutenção", "Qualidade de Código",
     "Análise de 8 problemas (P1 SQL Injection, P2+P3 tipagem/encapsulamento, P4 pirâmide→early return, P5 magic number, P6 mensagens opacas, P7 HTTP no service, P8 SQL raw); versão refatorada GestorDeQuartos; 29 testes cobrindo cada correção; documento de dívida técnica",
     "Zero usos de 'any'; complexidade ciclomática = 1; 29 testes passando"),

    ("S9", "Semana 17–18\n(Gerenciamento)", 34, 34, "🔄 Em Progresso",
     "Gestão", "Plano de Projeto",
     "Cronograma por sprints S0–S15; estimativas SP e horas; backlog detalhado 70+ histórias; rastreabilidade RF↔Sprint↔Teste; burndown de SP; runbook de gestão de incidentes",
     "Planilha de projeto completa; rastreabilidade 100% dos RF01–RF18"),

    ("S10", "Semana 19–20\n(API REST)", 48, 48, "📋 Planejado",
     "Backend", "API REST",
     "Controllers Express: /quartos (GET+POST+PATCH), /hospedes (GET+POST+PATCH), /reservas (POST+cancelar+listagem); autenticação JWT (RS256, refresh 7d); validação de entrada (Zod); error handler global; testes supertest todos os endpoints",
     "Todos os RF01–RF18 acessíveis via HTTP; JWT em todas as rotas protegidas; 0 endpoints sem teste"),

    ("S11", "Semana 21–22\n(Persistência)", 52, 52, "📋 Planejado",
     "Backend", "Banco de Dados",
     "Schema Prisma (quartos, camas, hospedes, reservas + índices únicos); migration inicial + seed; PrismaQuartoRepository/PrismaHospedeRepository/PrismaReservaRepository; transação atômica criarReserva (reserva+status em 1 tx); testes com banco PostgreSQL real (Docker); connection pooling",
     "Zero dados perdidos em falha parcial; migration idempotente; testes passam com banco real"),

    ("S12", "Semana 23–24\n(UI — Quartos)", 44, 44, "📋 Planejado",
     "Frontend", "UI — Módulo Quartos",
     "Setup React 18 + Vite + TailwindCSS + React Query; ListaDeQuartos com filtros de status/tipo; FormularioCadastroQuarto (validação client-side); FormularioEdicaoQuarto (patch parcial); botões de status com modal de confirmação; página de detalhe com histórico; testes React Testing Library",
     "WCAG AA nos formulários; Lighthouse ≥ 90; bundle < 200 KB gzipped"),

    ("S13", "Semana 25–26\n(UI — Reservas)", 44, 44, "📋 Planejado",
     "Frontend", "UI — Módulo Reservas",
     "Formulário nova reserva (autocomplete hóspede por CPF; quartos LIVRES only); painel de disponibilidade com polling 30s; fluxo cancelamento com motivo; listagem de reservas com filtros; dashboard gerencial (KPIs: % ocupação, receita estimada); testes com MSW (mock de API)",
     "Painel atualiza sem reload; KPIs calculados corretamente; testes com MSW passando"),

    ("S14", "Semana 27–28\n(Testes E2E)", 36, 36, "📋 Planejado",
     "QA/Testes", "Testes End-to-End",
     "Setup Playwright + fixtures + integração CI; fluxo E2E: cadastrar quarto→reservar→cancelar; validações de formulário (campos inválidos); smoke tests dos 5 fluxos críticos; testes de acessibilidade (axe-playwright); testes de performance (Lighthouse CI)",
     "E2E roda em < 3 min no CI; zero violações acessibilidade nível AA; Lighthouse ≥ 90"),

    ("S15", "Semana 29–30\n(Go-Live)", 28, 28, "📋 Planejado",
     "Infra/DevOps", "Lançamento",
     "Deploy produção (HTTPS + Let's Encrypt + DNS); smoke tests pós-deploy via script curl; Grafana + alertas ativos (Slack webhook); documentação final (README + OpenAPI/Swagger); sessão de treinamento/handoff; retrospectiva e fechamento",
     "Sistema em prod respondendo; alertas disparando em teste; Swagger acessível em /docs"),
]

for i, (sp, per, pts, hrs, status, cat, mod, entregas, dod) in enumerate(SPRINTS):
    row = i + 8
    ws1.row_dimensions[row].height = 40

    sbg, sfg = status_colors(status)
    abg = alt_bg(i, status)

    data = [sp, per, pts, hrs, status, cat, mod, entregas, dod]
    for col, val in enumerate(data, 1):
        c = ws1.cell(row=row, column=col, value=val)
        if col == 1:   # sprint ID
            style(c, bold=True, size=10, fg=MID, bg=abg, ha="center")
        elif col == 2:  # período
            style(c, size=9, fg=TEXT, bg=abg, wrap=True)
        elif col in (3, 4):  # SP e horas
            style(c, size=10, fg=TEXT, bg=abg, ha="center")
        elif col == 5:  # status
            style(c, bold=True, size=9, fg=sfg, bg=sbg, ha="center", wrap=True)
        elif col == 6:  # categoria
            style(c, bold=True, size=9,
                  fg=CAT_FG.get(cat, TEXT),
                  bg=CAT_BG.get(cat, GRAY),
                  ha="center")
        elif col == 7:  # módulo
            style(c, size=9, fg=TEXT, bg=abg, wrap=True)
        elif col == 8:  # entregas
            style(c, size=9, fg=TEXT, bg=abg, wrap=True)
        elif col == 9:  # DoD
            style(c, size=9, fg=TEXT, bg=abg, wrap=True)

# Linha de totais
tot_row = len(SPRINTS) + 8
ws1.row_dimensions[tot_row].height = 24
ws1.merge_cells(f"A{tot_row}:B{tot_row}")
c = ws1[f"A{tot_row}"]
c.value = "TOTAL  (S0 → S15)"
style(c, bold=True, size=10, fg=WHITE, bg=DARK, ha="center")

done_sp  = sum(s[2] for s in SPRINTS if "Concluído" in s[4] or "Progresso" in s[4])
plan_sp  = sum(s[2] for s in SPRINTS if "Planejado" in s[4])
total_sp = sum(s[2] for s in SPRINTS)
total_h  = sum(s[3] for s in SPRINTS)

ws1.cell(tot_row, 3, total_sp)
style(ws1.cell(tot_row, 3), bold=True, size=10, fg=WHITE, bg=DARK, ha="center")
ws1.cell(tot_row, 4, f"{total_h}h")
style(ws1.cell(tot_row, 4), bold=True, size=10, fg=WHITE, bg=DARK, ha="center")
for col in range(5, 10):
    style(ws1.cell(tot_row, col), bold=True, fg=WHITE, bg=DARK)

# Mini-resumo abaixo da tabela
gap = tot_row + 2
ws1.row_dimensions[gap].height = 20
ws1.merge_cells(f"A{gap}:I{gap}")
c = ws1[f"A{gap}"]
c.value = "Resumo de esforço"
style(c, bold=True, size=10, fg=WHITE, bg=MID, ha="center")

resumo = [
    (f"✅  Concluído / Em Progresso  (S0–S9)", f"{done_sp} SP", f"{done_sp}h",
     DONE_BG, DONE_FG),
    (f"📋  Planejado  (S10–S15)",              f"{plan_sp} SP", f"{plan_sp}h",
     PLAN_BG, PLAN_FG),
    (f"📊  Total do Projeto",                  f"{total_sp} SP", f"{total_h}h",
     LIGHT,   DARK),
]
for j, (lbl, sp_v, h_v, bg, fg) in enumerate(resumo):
    r = gap + 1 + j
    ws1.row_dimensions[r].height = 22
    ws1.merge_cells(f"A{r}:G{r}")
    style(ws1[f"A{r}"], bold=True, size=10, fg=fg, bg=bg)
    ws1[f"A{r}"].value = lbl
    ws1[f"H{r}"].value = sp_v
    style(ws1[f"H{r}"], bold=True, size=10, fg=fg, bg=bg, ha="center")
    ws1[f"I{r}"].value = h_v
    style(ws1[f"I{r}"], bold=True, size=10, fg=fg, bg=bg, ha="center")


# ══════════════════════════════════════════════════════════════════════════════
# ABA 2 — BACKLOG DETALHADO
# ══════════════════════════════════════════════════════════════════════════════
ws2 = wb.create_sheet("Backlog Detalhado")

ws2.merge_cells("A1:J1")
c = ws2["A1"]
c.value = "BACKLOG DETALHADO — User Stories e Tarefas Técnicas"
style(c, bold=True, size=14, fg=WHITE, bg=DARK, ha="center")
ws2.row_dimensions[1].height = 30
ws2.row_dimensions[2].height = 8

cols2  = ["Sprint","ID","Título / História","Categoria","SP","Horas",
          "Status","RF / RN","Critério de Aceite","Notas Técnicas"]
wids2  = [8, 10, 34, 13, 6, 7, 14, 11, 32, 26]
header_row(ws2, 3, cols2, wids2, height=22)

# Tabela completa de histórias
# (sprint, id, titulo, cat, sp, h, status, rf, aceite, notas)
BACKLOG = [
    # ── S0 — FUNDAÇÃO ─────────────────────────────────────────────────────────
    ("S0","FND-01","Setup monorepo TypeScript 5 + ESLint + Prettier + Jest 29","Gestão",
     3,"3h","✅","—","npm test verde; tsc --noEmit sem erros","tsconfig strict; paths aliases configurados"),
    ("S0","FND-02","Documentação de requisitos: RF01–RF18 e RN01–RN27","Gestão",
     8,"8h","✅","RF01–RF18","Todos os RFs e RNs escritos com critério de aceite","Formato: ID · Descrição · Regra de negócio · Prioridade"),
    ("S0","FND-03","Definição de arquitetura: Domínio / Serviço / Repositório","Gestão",
     5,"5h","✅","—","ADR com decisões DIP, SRP, Resultado<T>, imutabilidade","Diagrama de camadas no README"),
    ("S0","FND-04","Setup Git + branching strategy (main / develop / feature)","Gestão",
     3,"3h","✅","—","Commits seguem Conventional Commits; secrets nunca commitados","git hooks: lint + test antes de push"),
    ("S0","FND-05","Definition of Done do projeto","Gestão",
     5,"5h","✅","—","DoD publicado: testes passando, cobertura ≥ 90 %, review aprovado","Afixado no README e nos critérios de PR"),

    # ── S1 — DOMÍNIO ──────────────────────────────────────────────────────────
    ("S1","DOM-01","Entidade Quarto: imutável, copiarCom(), estaDisponivel, precoFormatado","Backend",
     8,"8h","✅","RF01","copiarCom gera nova instância sem mutar o original; status default = LIVRE","readonly em todos os campos; Intl.NumberFormat para precoFormatado"),
    ("S1","DOM-02","Entidade Cama: value object com TipoCama e id auto-gerado","Backend",
     3,"3h","✅","RN05","Cama.tipo é um TipoCama válido; id determinístico em testes (id opcional no construtor)","static fromData para hidratação do banco"),
    ("S1","DOM-03","Enums StatusQuarto, TipoCama, TipoQuarto como const objects","Backend",
     3,"3h","✅","RF01–RF06","Valores em português; type-safe via keyof; nenhum enum nativo TS","as const + type = (typeof X)[keyof typeof X]"),
    ("S1","DOM-04","Tipo Resultado<T>: union discriminado por 'sucesso'","Backend",
     5,"5h","✅","—","type narrowing funciona no VS Code; sem throw para erros de negócio","Resultado<Quarto>; Resultado<Hospede>; Resultado<Reserva>"),
    ("S1","DOM-05","DTOs CriarQuartoDTO e EditarQuartoDTO","Backend",
     3,"3h","✅","RF01,RF03","EditarQuartoDTO = Partial<CriarQuartoDTO>; todos os campos tipados","CriarReservaDTO e CancelarReservaDTO também definidos em S4"),
    ("S1","DOM-06","18 testes de domínio: Quarto, Cama, comodidades, precoFormatado","QA/Testes",
     8,"8h","✅","RF01","18 testes passando; cobertura ≥ 90 % na camada de domínio","Testa copiarCom, estaDisponivel, comodidades, precoFormatado"),

    # ── S2 — QUARTOSERVICE ───────────────────────────────────────────────────
    ("S2","QS-01","QuartoService.cadastrarQuarto() — RF01, RN01/03/04/05","Backend",
     8,"8h","✅","RF01","Unicidade número; preço > 0; capacidade > 0; ≥1 cama; status = LIVRE","Early return por validação; sem SQL; delega ao IQuartoRepository"),
    ("S2","QS-02","QuartoService.editarQuarto() — RF03, edição parcial","Backend",
     8,"8h","✅","RF03","Edição parcial via Partial<>; unicidade do número exceto si próprio; camas só atualizam se fornecidas","copiarCom aplicado sobre o quarto existente"),
    ("S2","QS-03","QuartoService.alterarStatus() — RF04, RF05, RF06","Backend",
     5,"5h","✅","RF04–RF06","Transições LIVRE↔OCUPADO↔MANUTENÇÃO↔LIMPEZA; quarto inexistente retorna Resultado falso","StatusQuarto enum garante valores válidos"),
    ("S2","QS-04","IQuartoRepository + QuartoRepositoryMemoria","Backend",
     8,"8h","✅","—","Interface com 5 métodos; Map<id,Quarto> O(1) em busca; ordenação numérica em listarTodos","localeCompare numeric:true para quarto '2' antes de '10'"),
    ("S2","QS-05","QuartoService.listarQuartos() e buscarPorId()","Backend",
     5,"5h","✅","RF02","listarTodos retorna ordem numérica; buscarPorId retorna undefined se não encontrado","Sem filtros ainda (adicionados no frontend em S12)"),
    ("S2","QS-06","Fixtures e MockQuartoRepository com spies","QA/Testes",
     8,"8h","✅","—","Builder fluente umQuarto().comNumero('101').build(); mock reseta em beforeEach","MockQuartoRepository.vezesSalvo e .quartoSalvo para asserções"),

    # ── S3 — TESTES UNITÁRIOS ─────────────────────────────────────────────────
    ("S3","TU-01","29 testes cadastrarQuarto (FP01–FP07 + RN + edge cases)","QA/Testes",
     8,"8h","✅","RF01","FP: sucesso, LIVRE, trim, camas, comodidades, repo chamado 1x; RN01/03/04/05; edge: espaços, camas vazias","AAA explícito; describe aninhado por bloco"),
    ("S3","TU-02","33 testes editarQuarto","QA/Testes",
     8,"8h","✅","RF03","Edição parcial; unicidade numero exceto si; camas opcionais; quarto inexistente; todos os campos","umDtoEdicaoValido() como base"),
    ("S3","TU-03","10 testes repositório em memória","QA/Testes",
     5,"5h","✅","—","CRUD completo; buscarPorNumero; listarTodos ordenado; atualizar lança se ID inexistente","QuartoRepositoryMemoria com estado isolado"),
    ("S3","TU-04","Configuração cobertura ≥ 90 % no jest.config","QA/Testes",
     5,"5h","✅","—","CI falha se branches/lines/functions < 90 %","coverageThreshold no jest.config.ts"),
    ("S3","TU-05","Documentação dos testes (comentários de decisão)","QA/Testes",
     5,"5h","✅","—","Cada bloco describe explica POR QUE existe; fixtures documentam decisões de design","Padrão: DECISÃO em comentário antes do bloco"),
    ("S3","TU-06","Revisão de código: PR review dos testes","Gestão",
     5,"5h","✅","—","Nenhum teste fraco (expect.anything, sem assert); nomes descritivos","Checklist de revisão aplicado"),

    # ── S4 — HÓSPEDE + RESERVA ────────────────────────────────────────────────
    ("S4","HS-01","Entidade Hospede: CPF normalizado, email lowercase, nomeCompleto","Backend",
     5,"5h","✅","RF07","CPF sem máscara (só dígitos); nomeCompleto getter; imutável","Hospede.cpf armazenado como '00000000000' (sem pontos/traços)"),
    ("S4","HS-02","HospedeService.cadastrarHospede() — RF07, RN11–RF15","Backend",
     8,"8h","✅","RF07–RF11","RF09: CPF único; RF10: 11 dígitos; RF11: email regex; nome/sobrenome obrigatórios","replace(/\\D/g,'') antes de validar; email lowercase"),
    ("S4","HS-03","HospedeService.editarHospede() + listarHospedes()","Backend",
     5,"5h","✅","RF08","CPF imutável após cadastro; email e nome editáveis; validação de email se fornecido","EditarHospedeDTO = Partial<Omit<CriarHospedeDTO,'cpf'>>"),
    ("S4","RS-01","Entidade Reserva: imutável, cancelar() retorna nova instância","Backend",
     8,"8h","✅","RF12","StatusReserva ATIVA/CANCELADA; canceladaEm:Date; motivoCancelamento string; estaAtiva getter","cancelar() não muta — retorna new Reserva com status CANCELADA"),
    ("S4","RS-02","ReservaService.criarReserva() — RF12, RF15, RF18","Backend",
     8,"8h","✅","RF12,RF15,RF18","RF18: quarto.estaDisponivel; RF15: quarto→OCUPADO; hóspede existe; reserva salva","Sequencial: salvarReserva → atualizarQuarto (transação em S11)"),
    ("S4","RS-03","ReservaService.cancelarReserva() — RF16, RF17","Backend",
     8,"8h","✅","RF16,RF17","Motivo obrigatório (trim); reserva ATIVA; RF17: quarto→LIVRE; reserva cancelada persistida","cancelar() do domínio chamado antes de persistir"),
    ("S4","RS-04","IHospedeRepository + IReservaRepository + impls. em memória","Backend",
     5,"5h","✅","—","buscarPorCpf em IHospedeRepository; listarPorQuarto/listarPorHospede em IReservaRepository","Map<id,Hospede>; Map<id,Reserva> com índices secundários por quartoId/hospedeId"),

    # ── S5 — TESTES DE INTEGRAÇÃO ─────────────────────────────────────────────
    ("S5","TI-01","Suite 1: fluxo principal ponta-a-ponta — 5 testes","QA/Testes",
     8,"8h","✅","RF12–RF18","INT-FP01–FP05: quarto→OCUPADO após reserva; quarto→LIVRE após cancelamento","criarContexto() gera repositórios REAIS em memória por teste"),
    ("S5","TI-02","Suite 2: consistência entre serviços — 5 testes","QA/Testes",
     8,"8h","✅","RF09,RF18","INT-CS01: OCUPADO rejeita 2ª reserva; INT-CS02: CPF duplicado rejeitado; múltiplas reservas independentes","Estado compartilhado real entre QuartoService e ReservaService"),
    ("S5","TI-03","Suite 3: falhas parciais — 4 testes","QA/Testes",
     8,"8h","✅","RF15,RF17","INT-FH01–FH04: falha não persiste estado; cancelamento duplo rejeitado","Testa que rollback lógico funciona sem banco real"),
    ("S5","TI-04","Suite 4: cenários avançados de negócio — 7 testes","QA/Testes",
     8,"8h","✅","RF14–RF18","INT-CN03/CN04: MANUTENÇÃO/LIMPEZA não reservável; INT-CN02: reuso após cancelamento","Cobre todos os StatusQuarto diferentes de LIVRE"),
    ("S5","TI-05","Fixtures de integração: criarContexto, builders completos","QA/Testes",
     8,"8h","✅","—","dtoCadastroHospedeValido(), dtoCadastroQuartoValido(), hospedeFixture, quartoLivreFixture...","Contexto completamente isolado por describe block"),

    # ── S6 — DEPLOY / CI-CD ───────────────────────────────────────────────────
    ("S6","CI-01","Dockerfile.api — build multi-stage 3 fases","Infra/DevOps",
     8,"8h","✅","—","Imagem final ~80 MB; USER node (não root); dumb-init como PID 1","deps → builder → runner; .dockerignore exclui node_modules e src"),
    ("S6","CI-02","Dockerfile.web — React + Nginx 2 fases","Infra/DevOps",
     5,"5h","✅","—","Imagem final ~10 MB; build Vite; Nginx serve SPA","VITE_API_URL passado como ARG no build"),
    ("S6","CI-03","docker-compose.yml — 3 serviços com healthcheck em cadeia","Infra/DevOps",
     8,"8h","✅","—","hotel-db→hotel-api→hotel-web; condition:service_healthy impede subida prematura","restart:unless-stopped; hotel-net bridge isolado"),
    ("S6","CI-04","nginx.conf — proxy reverso, SPA fallback, gzip, headers de segurança","Infra/DevOps",
     5,"5h","✅","—","proxy_pass para hotel-api:3000; try_files para SPA; Cache-Control 1y para assets","X-Frame-Options DENY; X-Content-Type-Options nosniff"),
    ("S6","CI-05","Pipeline GitHub Actions — 6 jobs em DAG","Infra/DevOps",
     13,"13h","✅","—","validate → test-unit → test-integration → build-images → deploy-staging → deploy-production; staging auto; prod exige tag + aprovação","concurrency cancela runs antigas do mesmo PR"),
    ("S6","CI-06","deploy.sh — deploy / rollback / status / health","Infra/DevOps",
     8,"8h","✅","—","rollback restaura docker-compose.backup.yml; health check com 8 retries; confirmação interativa em prod","set -euo pipefail; dependências validadas na entrada"),
    ("S6","CI-07","Três ambientes: local, staging (auto), production (tag manual)","Infra/DevOps",
     5,"5h","✅","—","staging: push para main/develop; prod: tag vX.Y.Z + aprovação manual no GitHub","URLs de health check diferentes por ambiente"),

    # ── S7 — OBSERVABILIDADE ─────────────────────────────────────────────────
    ("S7","OBS-01","logger.ts — JSON estruturado, trace_id, startTimer(), LGPD","Infra/DevOps",
     5,"5h","✅","—","NDJSON; trace_id em todo log; duration_ms; LOG_LEVEL env; CPF nunca logado","process.hrtime.bigint() para latência nanosegundos"),
    ("S7","OBS-02","metrics.ts — 17 métricas Prometheus (Counter/Histogram/Gauge)","Infra/DevOps",
     8,"8h","✅","—","5 HTTP + 4 quarto + 2 hóspede + 4 reserva + 2 infra + collectDefaultMetrics","Buckets latência: [0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]"),
    ("S7","OBS-03","middleware.ts — requestLogger + metricsMiddleware + /metrics handler","Infra/DevOps",
     8,"8h","✅","—","X-Trace-Id propagado; rota normalizada (/quartos/:id); res.on('finish')","metricsHandler restringe /metrics a :9090 em prod"),
    ("S7","OBS-04","instrumented-services.ts — wrappers com log + métrica + error_code","Infra/DevOps",
     8,"8h","✅","—","Decorator pattern; QUARTO_INDISPONIVEL, HOSPEDE_CPF_DUPLICADO etc.; LGPD: cpf_suffix (3 dígitos)","toErrorCode() mapeia mensagem→código; label granular no Prometheus"),
    ("S7","OBS-05","alertas.yml — 14 regras em 6 grupos com SLOs definidos","Infra/DevOps",
     8,"8h","✅","—","SLO: p95<500ms, 5xx<0.1%, uptime≥99.5%; 'for:' evita falsos positivos por spikes","APIForaDoAr(3m), LatenciaP99(5m), BancoDeDadosIndisponivel(3m)"),
    ("S7","OBS-06","Grafana dashboard — 15 painéis em 5 linhas","Infra/DevOps",
     5,"5h","✅","—","Disponibilidade, Latência p50/p95/p99, Tráfego/Erros, Negócio, Node.js Runtime","Anotações de deploy automáticas via changes(process_start_time_seconds)"),

    # ── S8 — REFATORAÇÃO ──────────────────────────────────────────────────────
    ("S8","MAN-01","Análise dos 8 problemas em GestorDeQuartos","Manutenção",
     5,"5h","✅","—","Relatório com categoria, severidade e consequência de P1–P8","P1=Crítica (SQL Injection); P2/P7/P8=Alta; P3/P4/P5/P6=Média"),
    ("S8","MAN-02","P1: SQL Injection — substituição por IQuartoRepository","Manutenção",
     8,"8h","✅","—","Nenhuma query SQL no service; repositório parametriza internamente","Teste de SQL Injection não é mais possível — vetor eliminado"),
    ("S8","MAN-03","P2+P3: any→tipagem forte + database→private readonly","Manutenção",
     5,"5h","✅","—","q.precoDia detectado como erro de compilação; database não acessível externamente","CriarQuartoDTO e IQuartoRepository como tipos"),
    ("S8","MAN-04","P4: pirâmide 5 níveis → early return","Manutenção",
     3,"3h","✅","—","Complexidade ciclomática = 1; cada validação é uma linha independente","Adicionar nova validação = 3 linhas; sem reorganizar estrutura"),
    ("S8","MAN-05","P5: magic number 50 → PRECO_MINIMO_DIARIA exportada","Manutenção",
     3,"3h","✅","—","Constante exportada referenciada no teste, na mensagem e na validação","Mudar valor em 1 lugar muda os 3 pontos automaticamente"),
    ("S8","MAN-06","P6: mensagens opacas → descritivas (alinhadas ao sistema)","Manutenção",
     3,"3h","✅","—","'Vazio'→'Número do quarto é obrigatório.'; mapeáveis em toErrorCode()","Padrão das mensagens segue QuartoService existente"),
    ("S8","MAN-07","P7: status HTTP → Resultado<T>","Manutenção",
     5,"5h","✅","—","Sem {status:200}; controller decide código HTTP; service reutilizável em GraphQL/CLI","Teste HTTP02 valida que 'status' não existe no retorno"),
    ("S8","MAN-08","29 testes para o código refatorado (cobrindo P1–P8)","QA/Testes",
     8,"8h","✅","—","Prefixo rastreável por problema (VAL, FP, MIN, REP, HTTP, NP); sem banco de dados","28 testes + 1 para PRECO_MINIMO_DIARIA exportada"),

    # ── S9 — GERENCIAMENTO ───────────────────────────────────────────────────
    ("S9","GER-01","Cronograma por sprints S0–S15 com SP e horas","Gestão",
     8,"8h","🔄","—","Este documento; todas as sprints com entregas concretas e DoD","Velocidade média = SP/sprint; referência histórica nas sprints concluídas"),
    ("S9","GER-02","Backlog detalhado: 70+ histórias com critério de aceite","Gestão",
     8,"8h","🔄","RF01–RF18","Cada história rastreável a um RF ou decisão de arquitetura","Aba 'Backlog Detalhado' nesta planilha"),
    ("S9","GER-03","Rastreabilidade RF ↔ Sprint ↔ Artefato de teste","Gestão",
     8,"8h","🔄","RF01–RF18","100% dos RF01–RF18 com sprint, story ID e teste identificados","Aba 'Rastreabilidade' nesta planilha"),
    ("S9","GER-04","Burndown de SP sprint-a-sprint","Gestão",
     5,"5h","🔄","—","Tabela com SP acumulado, SP restante ideal e real; instruções para gráfico","Aba 'Burndown SP' nesta planilha"),
    ("S9","GER-05","Runbook de gestão de incidentes (8 procedimentos)","Gestão",
     5,"5h","🔄","—","RB-01–RB-08 cobrindo todos os 14 alertas; comandos exatos dos containers","Documento .docx separado com 6 seções e pós-mortem template"),

    # ── S10 — API REST ────────────────────────────────────────────────────────
    ("S10","API-01","Setup Express + middlewares globais (cors, helmet, rate-limit, Zod)","Backend",
     5,"5h","📋","—","Rate limiting 100 req/min; Zod schema validation; error handler 4xx/5xx centralizado","express-async-errors para propagação correta de exceptions"),
    ("S10","API-02","Controller /quartos — GET, POST, PATCH /:id, PATCH /:id/status","Backend",
     13,"13h","📋","RF01–RF06","Resultado<T> mapeado para HTTP: sucesso→201/200; falha→409/422","Rota normalizada para métricas; validação Zod antes de chamar service"),
    ("S10","API-03","Controller /hospedes — GET, POST, PATCH /:id","Backend",
     8,"8h","📋","RF07–RF11","CPF retornado mascarado (***.***.***-**); paginação cursor-based","RF09: 409 Conflict para CPF duplicado"),
    ("S10","API-04","Controller /reservas — POST, PATCH /:id/cancelar, GET ?quartoId=&hospedeId=","Backend",
     8,"8h","📋","RF12–RF18","Resposta inclui quarto e hóspede embutidos; RF18 → 409 com status atual do quarto","listarPorQuarto e listarPorHospede como query params"),
    ("S10","API-05","Autenticação JWT: login, middleware, refresh token","Backend",
     8,"8h","📋","—","RS256; access token 15min + refresh 7d; middleware injeta userId no req","Logout por blacklist em memória (Redis em S11)"),
    ("S10","API-06","Testes supertest: todos os endpoints (happy path + validações + auth)","QA/Testes",
     8,"8h","📋","RF01–RF18","100% das rotas com teste; 4xx para entrada inválida; 401 sem token","beforeAll sobe Express; afterAll fecha; banco em memória"),

    # ── S11 — PERSISTÊNCIA ───────────────────────────────────────────────────
    ("S11","DB-01","Schema Prisma: quartos, camas, hospedes, reservas","Backend",
     8,"8h","📋","—","Índices únicos em numero e cpf; relação Quarto↔Cama e Reserva↔Quarto+Hospede","prisma migrate dev; prisma generate"),
    ("S11","DB-02","Migration inicial + seed de dados (10 quartos, 5 hóspedes)","Backend",
     5,"5h","📋","—","Migration idempotente; seed reproduzível via prisma db seed","Seed cobre todos os StatusQuarto para testes visuais"),
    ("S11","DB-03","PrismaQuartoRepository: implementa IQuartoRepository","Backend",
     8,"8h","📋","—","Zero alterações no QuartoService; buscarPorNumero usa índice único","Mapeamento Prisma←→domínio em funções toDomain() e toPrisma()"),
    ("S11","DB-04","PrismaHospedeRepository + PrismaReservaRepository","Backend",
     8,"8h","📋","—","buscarPorCpf com índice; listarPorQuarto com JOIN eficiente","listarPorHospede ordena por criadaEm DESC"),
    ("S11","DB-05","Transação atômica criarReserva (reserva + status quarto em 1 tx)","Backend",
     8,"8h","📋","RF15","prisma.$transaction(); falha em qualquer etapa faz rollback automático","Substitui a sequencialidade atual do ReservaService"),
    ("S11","DB-06","Testes com banco PostgreSQL real (Docker Compose CI)","QA/Testes",
     8,"8h","📋","—","beforeAll: sobe banco via testcontainers ou compose; afterAll: derruba","truncate entre testes; migrations rodadas uma vez"),
    ("S11","DB-07","Connection pooling e configuração de produção","Backend",
     5,"5h","📋","—","DATABASE_URL via env; connection_limit no schema; logs de query em dev apenas","PgBouncer ou Prisma accelerate para escala"),

    # ── S12 — FRONTEND QUARTOS ───────────────────────────────────────────────
    ("S12","FE-01","Setup React 18 + Vite + TailwindCSS + React Query","Frontend",
     5,"5h","📋","—","bundle < 200 KB gzipped; React Query para cache e revalidação","Vite proxy para /api em dev; build analizado com rollup-plugin-visualizer"),
    ("S12","FE-02","ListaDeQuartos: cards com status colorido + filtros de status/tipo","Frontend",
     8,"8h","📋","RF02","Filtros por StatusQuarto e TipoQuarto; loading skeleton; empty state","React Query + GET /quartos; invalidação após mutação"),
    ("S12","FE-03","FormularioCadastroQuarto: validação client-side + feedback inline","Frontend",
     8,"8h","📋","RF01","Erro inline por campo; loading state no submit; toast de sucesso","Zod + react-hook-form; campo de camas dinâmico (add/remove)"),
    ("S12","FE-04","FormularioEdicaoQuarto: campos parciais, PATCH","Frontend",
     8,"8h","📋","RF03","Preenche com dados atuais; submete só campos alterados; otimistic update","react-hook-form reset com defaultValues da API"),
    ("S12","FE-05","Ações de status: botões Manutenção/Limpeza/Livre com confirmação","Frontend",
     5,"5h","📋","RF04–RF06","Modal de confirmação antes de alterar; indicador de transição","PATCH /:id/status; invalidação de lista após sucesso"),
    ("S12","FE-06","Página de detalhe do quarto: tabs (Info / Histórico / Comodidades)","Frontend",
     8,"8h","📋","RF02","Tab histórico lista reservas; comodidades com ícones; ações inline","React Router loader pré-carrega dados"),
    ("S12","FE-07","Testes React Testing Library: ListaDeQuartos + FormularioCadastro","QA/Testes",
     5,"5h","📋","RF01,RF02","Render, filtro, submit, mensagens de erro, acessibilidade básica","MSW para mock de API nos testes"),

    # ── S13 — FRONTEND RESERVAS ──────────────────────────────────────────────
    ("S13","FE-08","FormularioNovaReserva: autocomplete hóspede + quartos LIVRES","Frontend",
     8,"8h","📋","RF12","Busca hóspede por CPF (debounce 300ms); dropdown mostra só quartos LIVRES","POST /reservas; invalidação de /quartos após sucesso"),
    ("S13","FE-09","PainelDeDisponibilidade: grid de quartos por status com polling","Frontend",
     8,"8h","📋","RF18","Grid colorido por StatusQuarto; polling 30s via React Query refetchInterval","Click em quarto abre modal de nova reserva diretamente"),
    ("S13","FE-10","FluxoCancelamento: motivo + modal + atualização otimista","Frontend",
     8,"8h","📋","RF16","Textarea para motivo (mínimo 10 chars); PATCH /:id/cancelar; rollback em erro","useOptimisticMutation do React Query"),
    ("S13","FE-11","ListagemDeReservas: filtros por quarto/hóspede/status + paginação","Frontend",
     8,"8h","📋","RF12–RF17","Paginação cursor-based; exportação CSV básica","Filtros refletem na URL (query params)"),
    ("S13","FE-12","DashboardGerencial: KPIs de ocupação e receita estimada","Frontend",
     5,"5h","📋","—","% quartos livres/ocupados/manutenção; receita = sum(precosDiaria de reservas ativas)","recharts para gráficos de barras e pizza"),
    ("S13","FE-13","Testes: formulário de reserva + cancelamento com MSW","QA/Testes",
     5,"5h","📋","RF12,RF16","Fluxo completo simulado; erro de quarto indisponível exibido corretamente","MSW handlers para cenários de erro"),

    # ── S14 — TESTES E2E ─────────────────────────────────────────────────────
    ("S14","E2E-01","Setup Playwright + fixtures + integração CI","QA/Testes",
     5,"5h","📋","—","npx playwright test no pipeline; screenshots e traces em falha; html report","baseURL, storageState para auth reutilizável"),
    ("S14","E2E-02","Fluxo E2E: cadastrar quarto → reservar → cancelar","QA/Testes",
     8,"8h","📋","RF01,RF12,RF16","Fluxo completo no browser real (Chromium); verificação de estados intermediários","page.waitForResponse para sincronizar com API"),
    ("S14","E2E-03","Fluxo E2E: validações de formulário (campos inválidos)","QA/Testes",
     5,"5h","📋","RN01–RN27","Mensagens de erro visíveis no DOM; submit bloqueado enquanto inválido","Testa RN com dados de boundary value"),
    ("S14","E2E-04","Smoke tests: 5 fluxos críticos em < 3 min","QA/Testes",
     5,"5h","📋","RF01–RF18","Roda em cada PR; falha bloqueia merge; tag @smoke para subconjunto","Paralelismo de workers no CI reduce tempo"),
    ("S14","E2E-05","Testes de acessibilidade: axe-playwright nos formulários","QA/Testes",
     5,"5h","📋","—","Zero violações WCAG nível A/AA; relatório por componente","@axe-core/playwright; verificação de aria-labels e focus order"),
    ("S14","E2E-06","Lighthouse CI nos fluxos principais","QA/Testes",
     5,"5h","📋","—","Performance ≥ 90; Acessibilidade ≥ 95; CI falha se cair abaixo","lighthouse-ci com budget.json"),

    # ── S15 — GO-LIVE ─────────────────────────────────────────────────────────
    ("S15","GL-01","Deploy produção: DNS, SSL/TLS, variáveis de ambiente seguras","Infra/DevOps",
     5,"5h","📋","—","HTTPS com Let's Encrypt + auto-renew; secrets no GitHub Environments; HSTS","Certificado antes do DNS propagar"),
    ("S15","GL-02","Smoke tests pós-deploy: script curl todos os endpoints críticos","QA/Testes",
     3,"3h","📋","RF01–RF18","Script automatizado no pipeline pós-deploy; alertas Slack em falha","Verifica status codes E payload mínimo por rota"),
    ("S15","GL-03","Monitoramento pós-lançamento: Grafana + alertas ativos 48h","Infra/DevOps",
     5,"5h","📋","—","Slack webhook configurado; dashboard aberto 48h após go-live; on-call definido","Runbook impresso disponível para plantão"),
    ("S15","GL-04","Documentação final: README atualizado + OpenAPI/Swagger","Gestão",
     5,"5h","📋","—","Swagger UI em /docs (não autenticado); README com quickstart em 3 comandos","swagger-jsdoc + swagger-ui-express"),
    ("S15","GL-05","Treinamento e handoff: sessão gravada 2h","Gestão",
     5,"5h","📋","—","Gravação no Google Drive; runbook de incidentes distribuído; contatos de escalação","Cobre deploy, rollback, monitoramento, operações do dia-a-dia"),
    ("S15","GL-06","Retrospectiva final e fechamento","Gestão",
     5,"5h","📋","—","Métricas finais vs. estimadas (SP, horas, defeitos); lições aprendidas documentadas","Blameless; foco em processos, não pessoas"),
]

for i, row_data in enumerate(BACKLOG):
    row = i + 4
    ws2.row_dimensions[row].height = 32
    sp, sid, titulo, cat, pts, hrs, status, rf, aceite, notas = row_data
    sbg, sfg = status_colors(status)
    abg = alt_bg(i, status)

    vals = [sp, sid, titulo, cat, pts, hrs, status, rf, aceite, notas]
    for col, val in enumerate(vals, 1):
        c = ws2.cell(row=row, column=col, value=val)
        if col == 1:
            style(c, bold=True, size=9, fg=MID, bg=abg, ha="center")
        elif col == 2:
            style(c, bold=True, size=9, fg=TEXT, bg=abg, ha="center")
        elif col == 3:
            style(c, size=9, fg=TEXT, bg=abg, wrap=True)
        elif col == 4:
            style(c, bold=True, size=8,
                  fg=CAT_FG.get(cat, TEXT),
                  bg=CAT_BG.get(cat, GRAY),
                  ha="center")
        elif col in (5, 6):
            style(c, size=9, fg=TEXT, bg=abg, ha="center")
        elif col == 7:
            style(c, bold=True, size=8, fg=sfg, bg=sbg, ha="center", wrap=True)
        elif col == 8:
            style(c, size=8, fg=TEXT, bg=abg, ha="center")
        elif col in (9, 10):
            style(c, size=8, fg=TEXT, bg=abg, wrap=True)


# ══════════════════════════════════════════════════════════════════════════════
# ABA 3 — RASTREABILIDADE RF ↔ SPRINT
# ══════════════════════════════════════════════════════════════════════════════
ws3 = wb.create_sheet("Rastreabilidade")

ws3.merge_cells("A1:H1")
c = ws3["A1"]
c.value = "RASTREABILIDADE — Requisito Funcional ↔ Sprint ↔ Histórias ↔ Testes"
style(c, bold=True, size=13, fg=WHITE, bg=DARK, ha="center")
ws3.row_dimensions[1].height = 28
ws3.row_dimensions[2].height = 8

cols3  = ["RF","Descrição do Requisito","Sprint(s)","Story IDs",
          "Testes Unitários","Testes Integração","Testes E2E","Status"]
wids3  = [8, 40, 12, 20, 30, 30, 22, 14]
header_row(ws3, 3, cols3, wids3, height=22)

# (rf, descricao, sprints, stories, testes_unit, testes_int, testes_e2e, status)
RFS = [
    ("RF01","Cadastrar quarto (número, capacidade, tipo, preço, camas, comodidades)","S1+S2","DOM-01,QS-01",
     "cadastrarQuarto.test.ts\nFP01–FP07, RN01–RN05",
     "INT-FP01, INT-CS03\nINT-CN07","E2E-02,E2E-03","✅ Concluído"),
    ("RF02","Listar quartos com disponibilidade atual","S2","QS-05",
     "cadastrarQuarto.test.ts\n(listar)","INT-FP02","E2E-02","✅ Concluído"),
    ("RF03","Editar dados do quarto (parcial)","S2","QS-02",
     "editarQuarto.test.ts\n(completo — 33 testes)","—","E2E-03","✅ Concluído"),
    ("RF04","Marcar quarto como Em Manutenção","S2","QS-03",
     "editarQuarto.test.ts\n(alterarStatus)","—","E2E-03","✅ Concluído"),
    ("RF05","Marcar quarto como Em Limpeza","S2","QS-03",
     "editarQuarto.test.ts\n(alterarStatus)","—","E2E-03","✅ Concluído"),
    ("RF06","Marcar quarto como Livre","S2","QS-03",
     "editarQuarto.test.ts\n(alterarStatus)","INT-FP05, INT-CN02","E2E-03","✅ Concluído"),
    ("RF07","Cadastrar hóspede (nome, CPF normalizado, email)","S4","HS-01,HS-02",
     "—","INT-FP01, INT-CS02\nINT-FH01","E2E-02","✅ Concluído"),
    ("RF08","Listar hóspedes","S4","HS-03",
     "—","—","—","✅ Concluído"),
    ("RF09","CPF deve ser único no sistema (RN11)","S4","HS-02",
     "—","INT-CS02","E2E-03","✅ Concluído"),
    ("RF10","CPF deve ter 11 dígitos numéricos (RN12)","S4","HS-02",
     "—","INT-FH01","E2E-03","✅ Concluído"),
    ("RF11","Email deve ser válido — formato básico (RN13)","S4","HS-02",
     "—","INT-FH01","E2E-03","✅ Concluído"),
    ("RF12","Criar reserva vinculando quarto e hóspede","S4","RS-01",
     "—","INT-FP01, INT-CS03\nINT-CN01, INT-CN07","E2E-02","✅ Concluído"),
    ("RF13","Listar reservas por quarto","S4","RS-04",
     "—","INT-CN05","—","✅ Concluído"),
    ("RF14","Listar reservas por hóspede","S4","RS-04",
     "—","INT-CN05","—","✅ Concluído"),
    ("RF15","Quarto → OCUPADO ao criar reserva (pós-condição)","S4","RS-02",
     "—","INT-FP04, INT-CS01\nINT-FH03","E2E-02","✅ Concluído"),
    ("RF16","Cancelar reserva com motivo obrigatório","S4","RS-03",
     "—","INT-FH04, INT-CN06","E2E-02","✅ Concluído"),
    ("RF17","Quarto → LIVRE ao cancelar reserva (pós-condição)","S4","RS-03",
     "—","INT-FP05, INT-CN02","E2E-02","✅ Concluído"),
    ("RF18","Reserva apenas em quarto com status LIVRE (RN)","S4","RS-02",
     "—","INT-CS01, INT-CN03\nINT-CN04","E2E-02,E2E-03","✅ Concluído"),
    ("RF19","API REST /quartos com autenticação JWT","S10","API-02,API-05",
     "supertest /quartos\n(S10)","—","E2E-04","📋 Planejado"),
    ("RF20","API REST /hospedes com autenticação JWT","S10","API-03,API-05",
     "supertest /hospedes\n(S10)","—","E2E-04","📋 Planejado"),
    ("RF21","API REST /reservas com autenticação JWT","S10","API-04,API-05",
     "supertest /reservas\n(S10)","—","E2E-04","📋 Planejado"),
    ("RF22","Persistência em PostgreSQL via Prisma ORM","S11","DB-01–DB-07",
     "—","DB integration\n(S11 com banco real)","—","📋 Planejado"),
    ("RF23","Interface React: gestão de quartos","S12","FE-01–FE-07",
     "React Testing Library\n(S12)","—","E2E-02,E2E-03","📋 Planejado"),
    ("RF24","Interface React: fluxo de reservas","S13","FE-08–FE-13",
     "React Testing Library\n(S13 + MSW)","—","E2E-02,E2E-04","📋 Planejado"),
    ("RF25","Dashboard gerencial com KPIs de ocupação","S13","FE-12",
     "—","—","—","📋 Planejado"),
    ("RF26","Testes E2E Playwright nos fluxos críticos","S14","E2E-01–E2E-06",
     "—","—","E2E-01–E2E-06\n(todos)","📋 Planejado"),
    ("RF27","Deploy contínuo com rollback automático","S6","CI-05,CI-06",
     "—","—","E2E-04\n(smoke pós-deploy)","✅ Concluído"),
]

for i, row_data in enumerate(RFS):
    row = i + 4
    ws3.row_dimensions[row].height = 40
    rf, desc, sprs, stories, tu, ti, te, status = row_data
    sbg, sfg = status_colors(status)
    abg = alt_bg(i, status)

    for col, val in enumerate([rf,desc,sprs,stories,tu,ti,te,status], 1):
        c = ws3.cell(row=row, column=col, value=val)
        if col == 8:
            style(c, bold=True, size=9, fg=sfg, bg=sbg, ha="center", wrap=True)
        elif col == 1:
            style(c, bold=True, size=10, fg=MID, bg=abg, ha="center")
        else:
            style(c, size=9, fg=TEXT, bg=abg, wrap=True,
                  ha="center" if col in (3, 4) else "left")


# ══════════════════════════════════════════════════════════════════════════════
# ABA 4 — BURNDOWN DE STORY POINTS
# ══════════════════════════════════════════════════════════════════════════════
ws4 = wb.create_sheet("Burndown SP")

ws4.merge_cells("A1:G1")
c = ws4["A1"]
c.value = "BURNDOWN DE STORY POINTS — S0 → S15"
style(c, bold=True, size=14, fg=WHITE, bg=DARK, ha="center")
ws4.row_dimensions[1].height = 30
ws4.row_dimensions[2].height = 10

cols4  = ["Sprint","SP do Sprint","SP Acumulado","SP Restante\n(Linha Ideal)",
          "SP Restante\n(Real / Projeção)","Velocidade\nMédia (SP)","Status"]
wids4  = [20, 14, 14, 18, 20, 18, 16]
header_row(ws4, 3, cols4, wids4, height=30)

total_sp = sum(s[2] for s in SPRINTS)

BURNDOWN = [
    ("S0  — Fundação",      24,  24,  total_sp - 24,   total_sp - 24,  "—",  "✅"),
    ("S1  — Domínio",       34,  58,  total_sp - 58,   total_sp - 58,  "34", "✅"),
    ("S2  — QuartoService", 42, 100,  total_sp - 100,  total_sp - 100, "38", "✅"),
    ("S3  — Testes Unit.",  38, 138,  total_sp - 138,  total_sp - 138, "38", "✅"),
    ("S4  — Hóspede+Res.",  44, 182,  total_sp - 182,  total_sp - 182, "40", "✅"),
    ("S5  — Testes Integ.", 40, 222,  total_sp - 222,  total_sp - 222, "40", "✅"),
    ("S6  — Deploy/CI-CD",  52, 274,  total_sp - 274,  total_sp - 274, "43", "✅"),
    ("S7  — Observ.",       46, 320,  total_sp - 320,  total_sp - 320, "42", "✅"),
    ("S8  — Refatoração",   38, 358,  total_sp - 358,  total_sp - 358, "41", "✅"),
    ("S9  — Gerenciamento", 34, 392,  total_sp - 392,  "Em progresso", "40", "🔄"),
    ("S10 — API REST",      48, 440,  total_sp - 440,  "—",            "41", "📋"),
    ("S11 — Persistência",  52, 492,  total_sp - 492,  "—",            "—",  "📋"),
    ("S12 — UI Quartos",    44, 536,  total_sp - 536,  "—",            "—",  "📋"),
    ("S13 — UI Reservas",   44, 580,  total_sp - 580,  "—",            "—",  "📋"),
    ("S14 — Testes E2E",    36, 616,  total_sp - 616,  "—",            "—",  "📋"),
    ("S15 — Go-Live",       28, total_sp, 0,            "—",            "—",  "📋"),
]

for i, (sp, sp_sprint, sp_ac, sp_id, sp_real, vel, status) in enumerate(BURNDOWN):
    row = i + 4
    ws4.row_dimensions[row].height = 24
    sbg, sfg = status_colors(status)
    abg = alt_bg(i, status)

    for col, val in enumerate([sp, sp_sprint, sp_ac, sp_id, sp_real, vel, status], 1):
        c = ws4.cell(row=row, column=col, value=val)
        if col == 7:
            style(c, bold=True, size=10, fg=sfg, bg=sbg, ha="center")
        elif col == 1:
            style(c, bold=(status == "✅"), size=10, fg=TEXT, bg=abg)
        else:
            style(c, size=10, fg=TEXT, bg=abg, ha="center")

# Notas abaixo da tabela
ws4.row_dimensions[21].height = 10
ws4.merge_cells("A22:G25")
c = ws4["A22"]
c.value = (
    "COMO GERAR O GRÁFICO DE BURNDOWN:\n"
    "1. Selecione as colunas A (Sprint), D (SP Restante Ideal) e E (SP Restante Real) — linhas 3 a 19\n"
    "2. Inserir → Gráfico → Linhas → Linhas com marcadores\n"
    "3. Série 'Ideal': linha contínua de 464→0 (referência); Série 'Real': linha tracejada (preenche conforme sprints concluem)\n"
    "4. Eixo X: nomes das sprints; Eixo Y: Story Points restantes\n"
    "VELOCIDADE MÉDIA (S1–S9): ~40 SP/sprint  |  PROJEÇÃO: ~40 SP/sprint para S10–S15"
)
style(c, size=9, fg="555555", bg=GRAY, wrap=True, ha="left", va="top")
ws4.row_dimensions[22].height = 80

# ── Salvar ────────────────────────────────────────────────────────────────────
out = "/home/claude/plano-sprints-hotel.xlsx"
wb.save(out)
print(f"Salvo: {out}")