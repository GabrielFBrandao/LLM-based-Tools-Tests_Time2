/**
 * =============================================================================
 * SISTEMA DE RESERVA DE HOTEL — Módulo: Gestão de Quartos
 * =============================================================================
 *
 * DECISÕES DE IMPLEMENTAÇÃO:
 *
 * 1. ARQUITETURA EM CAMADAS (ADR-001)
 *    O código está organizado em camadas bem definidas:
 *    - Domain (Entidades + Tipos): Define o "quê" do negócio
 *    - Repository (Interface + Implementação): Abstrai persistência (ADR-005)
 *    - Service: Contém regras de negócio e orquestra o domínio
 *    - Hooks: Bridge entre a camada de serviço e a UI (React)
 *    - UI Components: Responsável apenas por renderização
 *
 * 2. PRINCÍPIOS SOLID APLICADOS
 *    S — Single Responsibility: Cada classe/função tem uma única razão para mudar
 *    O — Open/Closed: Entidades extensíveis sem modificar código existente
 *    L — Liskov Substitution: QuartoRepository implementa IQuartoRepository
 *    I — Interface Segregation: Interfaces pequenas e coesas (IQuartoRepository)
 *    D — Dependency Inversion: QuartoService depende de IQuartoRepository, não da impl
 *
 * 3. CLEAN CODE
 *    - Nomes descritivos em português alinhados ao domínio
 *    - Funções pequenas com responsabilidade única
 *    - Sem magic numbers/strings (uso de enums e constantes)
 *    - Tratamento explícito de erros
 *
 * 4. TYPESCRIPT ESTRITO
 *    - Todos os tipos explicitamente definidos
 *    - Union types para campos com valores fixos
 *    - Readonly onde aplicável para imutabilidade
 * =============================================================================
 */

import { useState, useCallback, useMemo, useId } from "react";

// =============================================================================
// CAMADA DE DOMÍNIO (Domain Layer)
// Responsabilidade: Definir as entidades e tipos do negócio
// Princípio: estas classes são o coração do sistema — independem de frameworks
// =============================================================================

/**
 * Enumerações do domínio.
 * DECISÃO: Usar const enums evita magic strings e garante type-safety em toda
 * a aplicação. Alterações no domínio impactam apenas este único ponto.
 */
export const TipoQuarto = {
  BASICO: "Básico",
  MODERNO: "Moderno",
  LUXO: "Luxo",
} as const;
export type TipoQuarto = (typeof TipoQuarto)[keyof typeof TipoQuarto];

export const StatusQuarto = {
  LIVRE: "Livre",
  OCUPADO: "Ocupado",
  MANUTENCAO: "Manutenção",
  LIMPEZA: "Limpeza",
} as const;
export type StatusQuarto = (typeof StatusQuarto)[keyof typeof StatusQuarto];

export const TipoCama = {
  SOLTEIRO: "Solteiro",
  CASAL_KING: "Casal King",
  CASAL_QUEEN: "Casal Queen",
} as const;
export type TipoCama = (typeof TipoCama)[keyof typeof TipoCama];

/**
 * Entidade Cama.
 * DECISÃO: Cama é uma entidade separada (não apenas uma string) para suportar
 * a regra de negócio RN05: "Todo quarto deve ter pelo menos um tipo de cama".
 * Isso facilita validações e extensões futuras (ex: número de camas por tipo).
 */
export class Cama {
  readonly id: string;
  readonly tipo: TipoCama;

  constructor(tipo: TipoCama, id?: string) {
    this.tipo = tipo;
    // Gera ID único se não fornecido — permite reconstrução de entidades persistidas
    this.id = id ?? `cama_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  /**
   * Factory method para reconstruir a entidade a partir de dados brutos.
   * DECISÃO: Separar criação (construtor) de reconstrução (fromData) segue
   * o padrão Domain-Driven Design, tornando a intenção explícita.
   */
  static fromData(data: { id: string; tipo: TipoCama }): Cama {
    return new Cama(data.tipo, data.id);
  }
}

/**
 * Entidade Hóspede.
 * DECISÃO: Manter a entidade completa aqui garante que o módulo de Quartos
 * tenha acesso ao tipo ao referenciar reservas futuras, sem duplicar definições.
 */
export class Hospede {
  readonly id: string;
  readonly nome: string;
  readonly sobrenome: string;
  readonly cpf: string;
  readonly email: string;

  constructor(
    nome: string,
    sobrenome: string,
    cpf: string,
    email: string,
    id?: string
  ) {
    this.nome = nome;
    this.sobrenome = sobrenome;
    this.cpf = cpf;
    this.email = email;
    this.id = id ?? `hosp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  get nomeCompleto(): string {
    return `${this.nome} ${this.sobrenome}`;
  }
}

/**
 * Entidade Quarto — entidade principal deste módulo.
 *
 * DECISÃO DE IMUTABILIDADE: Todos os campos são readonly.
 * Modificações geram uma nova instância via método `copiarCom()`.
 * Isso segue o padrão Value Object/Immutable Entity, prevenindo mutações
 * acidentais e facilitando o rastreamento de estado no React.
 *
 * DECISÃO DE VALIDAÇÃO: A validação ocorre no Service, não na entidade.
 * A entidade representa um estado já validado e consistente do negócio.
 */
export class Quarto {
  readonly id: string;
  readonly numero: string;
  readonly capacidade: number;
  readonly tipo: TipoQuarto;
  readonly precoDiaria: number;
  readonly temFrigobar: boolean;
  readonly temCafeDaManha: boolean;
  readonly temArCondicionado: boolean;
  readonly temTV: boolean;
  readonly status: StatusQuarto;
  readonly camas: readonly Cama[];

  constructor(params: {
    numero: string;
    capacidade: number;
    tipo: TipoQuarto;
    precoDiaria: number;
    temFrigobar?: boolean;
    temCafeDaManha?: boolean;
    temArCondicionado?: boolean;
    temTV?: boolean;
    status?: StatusQuarto;
    camas?: Cama[];
    id?: string;
  }) {
    this.numero = params.numero;
    this.capacidade = params.capacidade;
    this.tipo = params.tipo;
    this.precoDiaria = params.precoDiaria;
    this.temFrigobar = params.temFrigobar ?? false;
    this.temCafeDaManha = params.temCafeDaManha ?? false;
    this.temArCondicionado = params.temArCondicionado ?? false;
    this.temTV = params.temTV ?? false;
    // Status padrão LIVRE ao criar um novo quarto (RF05, RN do UC01)
    this.status = params.status ?? StatusQuarto.LIVRE;
    this.camas = params.camas ?? [];
    this.id = params.id ?? `qrt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  /**
   * DECISÃO: Método `copiarCom` (similar ao record update do Kotlin/Scala).
   * Em vez de setters mutáveis, retorna uma nova instância com os campos alterados.
   * Permite atualizações seguras: const atualizado = quarto.copiarCom({ status: OCUPADO })
   */
  copiarCom(alteracoes: Partial<Omit<Quarto, "id" | "copiarCom">>): Quarto {
    return new Quarto({
      id: this.id,
      numero: alteracoes.numero ?? this.numero,
      capacidade: alteracoes.capacidade ?? this.capacidade,
      tipo: alteracoes.tipo ?? this.tipo,
      precoDiaria: alteracoes.precoDiaria ?? this.precoDiaria,
      temFrigobar: alteracoes.temFrigobar ?? this.temFrigobar,
      temCafeDaManha: alteracoes.temCafeDaManha ?? this.temCafeDaManha,
      temArCondicionado: alteracoes.temArCondicionado ?? this.temArCondicionado,
      temTV: alteracoes.temTV ?? this.temTV,
      status: alteracoes.status ?? this.status,
      camas: (alteracoes.camas as Cama[]) ?? [...this.camas],
    });
  }

  /** Verifica se o quarto pode receber reservas (RF18) */
  get estaDisponivel(): boolean {
    return this.status === StatusQuarto.LIVRE;
  }

  /** Formata o preço para exibição */
  get precoFormatado(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.precoDiaria);
  }

  /** Retorna as comodidades disponíveis como lista (facilita renderização) */
  get comodidades(): string[] {
    return [
      this.temFrigobar && "Frigobar",
      this.temCafeDaManha && "Café da manhã",
      this.temArCondicionado && "Ar-condicionado",
      this.temTV && "TV",
    ].filter(Boolean) as string[];
  }
}

/**
 * Entidade Reserva.
 * DECISÃO: Incluída aqui pois o módulo de Quartos precisa conhecer o conceito
 * de reserva para implementar as regras RF15, RF17 e RF18 corretamente.
 */
export class Reserva {
  readonly id: string;
  readonly quartoId: string;
  readonly hospedeId: string;
  readonly dataCriacao: Date;
  readonly ativa: boolean;

  constructor(params: {
    quartoId: string;
    hospedeId: string;
    id?: string;
    dataCriacao?: Date;
    ativa?: boolean;
  }) {
    this.quartoId = params.quartoId;
    this.hospedeId = params.hospedeId;
    this.id = params.id ?? `res_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.dataCriacao = params.dataCriacao ?? new Date();
    this.ativa = params.ativa ?? true;
  }
}

// =============================================================================
// CAMADA DE REPOSITÓRIO (Repository Layer)
// Responsabilidade: Abstrair o acesso a dados
// Princípio SOLID aplicado: DIP — Service depende da interface, não da impl.
// =============================================================================

/**
 * Interface do repositório de quartos.
 * DECISÃO: Definir a interface antes da implementação (Interface Segregation).
 * Em produção, a implementação concreta usaria Prisma + PostgreSQL (ADR-003).
 * Aqui usamos estado em memória para demonstração no browser.
 */
export interface IQuartoRepository {
  listarTodos(): Quarto[];
  buscarPorId(id: string): Quarto | undefined;
  buscarPorNumero(numero: string): Quarto | undefined;
  salvar(quarto: Quarto): Quarto;
  atualizar(quarto: Quarto): Quarto;
}

/**
 * Implementação em memória do repositório.
 * DECISÃO: Esta classe pode ser substituída por PrismaQuartoRepository sem
 * alterar o QuartoService — esse é o benefício direto do DIP.
 */
export class QuartoRepositoryMemoria implements IQuartoRepository {
  // DECISÃO: Map para O(1) nas buscas por ID, mais eficiente que Array.find()
  private quartos: Map<string, Quarto>;

  constructor(dadosIniciais: Quarto[] = []) {
    this.quartos = new Map(dadosIniciais.map((q) => [q.id, q]));
  }

  listarTodos(): Quarto[] {
    // Ordenados por número do quarto (RN07)
    return Array.from(this.quartos.values()).sort((a, b) =>
      a.numero.localeCompare(b.numero, "pt-BR", { numeric: true })
    );
  }

  buscarPorId(id: string): Quarto | undefined {
    return this.quartos.get(id);
  }

  buscarPorNumero(numero: string): Quarto | undefined {
    return Array.from(this.quartos.values()).find((q) => q.numero === numero);
  }

  salvar(quarto: Quarto): Quarto {
    this.quartos.set(quarto.id, quarto);
    return quarto;
  }

  atualizar(quarto: Quarto): Quarto {
    if (!this.quartos.has(quarto.id)) {
      throw new Error(`Quarto com ID ${quarto.id} não encontrado`);
    }
    this.quartos.set(quarto.id, quarto);
    return quarto;
  }
}

// =============================================================================
// DTOs (Data Transfer Objects)
// Responsabilidade: Transportar dados entre camadas sem expor entidades
// DECISÃO: DTOs são objetos simples (sem lógica), tipados com TypeScript.
// Separam o contrato da API/UI da estrutura interna das entidades.
// =============================================================================

export interface CriarQuartoDTO {
  numero: string;
  capacidade: number;
  tipo: TipoQuarto;
  precoDiaria: number;
  temFrigobar: boolean;
  temCafeDaManha: boolean;
  temArCondicionado: boolean;
  temTV: boolean;
  tiposCama: TipoCama[];
}

export type EditarQuartoDTO = Partial<CriarQuartoDTO>;

// =============================================================================
// CAMADA DE SERVIÇO (Service Layer)
// Responsabilidade: Regras de negócio e orquestração
// DECISÃO: Service é stateless — não guarda estado entre chamadas.
// =============================================================================

/**
 * Resultado tipado para operações que podem falhar.
 * DECISÃO: Evitar exceções para fluxos de negócio previsíveis (número duplicado,
 * campos inválidos). Usar Result<T> torna o código mais legível e força o
 * tratamento explícito de erros pela camada chamadora (UI/Hook).
 */
type Resultado<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; erro: string };

export class QuartoService {
  // DECISÃO: Injeção de dependência pelo construtor (DIP).
  // O Service não instancia o repository — recebe de fora.
  constructor(private readonly repository: IQuartoRepository) {}

  /**
   * Cadastra um novo quarto (UC01 / RF01).
   * DECISÃO: Todas as validações de negócio centralizam aqui, não na UI.
   * A UI pode ter validações de formato (campo vazio, etc.), mas as regras
   * de negócio (número único, preço positivo) ficam sempre no service.
   */
  cadastrarQuarto(dto: CriarQuartoDTO): Resultado<Quarto> {
    // RN01: Número do quarto deve ser único
    const quartoExistente = this.repository.buscarPorNumero(dto.numero);
    if (quartoExistente) {
      return {
        sucesso: false,
        erro: `Já existe um quarto com o número "${dto.numero}".`,
      };
    }

    // RN03: Preço por diária deve ser maior que zero
    if (dto.precoDiaria <= 0) {
      return { sucesso: false, erro: "O preço por diária deve ser maior que zero." };
    }

    // RN04: Capacidade deve ser maior que zero
    if (dto.capacidade <= 0) {
      return { sucesso: false, erro: "A capacidade deve ser maior que zero." };
    }

    // RN05: Todo quarto deve ter ao menos um tipo de cama
    if (!dto.tiposCama || dto.tiposCama.length === 0) {
      return { sucesso: false, erro: "O quarto deve ter pelo menos um tipo de cama." };
    }

    const camas = dto.tiposCama.map((tipo) => new Cama(tipo));
    const novoQuarto = new Quarto({
      numero: dto.numero.trim(),
      capacidade: dto.capacidade,
      tipo: dto.tipo,
      precoDiaria: dto.precoDiaria,
      temFrigobar: dto.temFrigobar,
      temCafeDaManha: dto.temCafeDaManha,
      temArCondicionado: dto.temArCondicionado,
      temTV: dto.temTV,
      camas,
      // Status inicial sempre LIVRE ao criar (RN do UC01 - pós-condição)
      status: StatusQuarto.LIVRE,
    });

    const quartoSalvo = this.repository.salvar(novoQuarto);
    return { sucesso: true, dados: quartoSalvo };
  }

  /**
   * Edita um quarto existente (UC03 / RF03).
   * DECISÃO: Usamos `copiarCom` para manter imutabilidade da entidade.
   */
  editarQuarto(id: string, dto: EditarQuartoDTO): Resultado<Quarto> {
    const quartoAtual = this.repository.buscarPorId(id);
    if (!quartoAtual) {
      return { sucesso: false, erro: "Quarto não encontrado." };
    }

    // RN01: Verifica unicidade do número, exceto para o próprio quarto
    if (dto.numero && dto.numero !== quartoAtual.numero) {
      const duplicado = this.repository.buscarPorNumero(dto.numero);
      if (duplicado) {
        return {
          sucesso: false,
          erro: `Já existe outro quarto com o número "${dto.numero}".`,
        };
      }
    }

    if (dto.precoDiaria !== undefined && dto.precoDiaria <= 0) {
      return { sucesso: false, erro: "O preço por diária deve ser maior que zero." };
    }

    if (dto.capacidade !== undefined && dto.capacidade <= 0) {
      return { sucesso: false, erro: "A capacidade deve ser maior que zero." };
    }

    // Constrói as camas apenas se foram alteradas
    const novasCamas =
      dto.tiposCama && dto.tiposCama.length > 0
        ? dto.tiposCama.map((tipo) => new Cama(tipo))
        : undefined;

    const quartoAtualizado = quartoAtual.copiarCom({
      ...(dto.numero && { numero: dto.numero.trim() }),
      ...(dto.capacidade && { capacidade: dto.capacidade }),
      ...(dto.tipo && { tipo: dto.tipo }),
      ...(dto.precoDiaria && { precoDiaria: dto.precoDiaria }),
      ...(dto.temFrigobar !== undefined && { temFrigobar: dto.temFrigobar }),
      ...(dto.temCafeDaManha !== undefined && { temCafeDaManha: dto.temCafeDaManha }),
      ...(dto.temArCondicionado !== undefined && { temArCondicionado: dto.temArCondicionado }),
      ...(dto.temTV !== undefined && { temTV: dto.temTV }),
      ...(novasCamas && { camas: novasCamas }),
    });

    const quartoSalvo = this.repository.atualizar(quartoAtualizado);
    return { sucesso: true, dados: quartoSalvo };
  }

  /**
   * Altera o status de disponibilidade (UC04 / RF05).
   * DECISÃO: Operação separada de `editarQuarto` pois tem semântica diferente
   * e em produção também atualizaria reservas relacionadas (RF15, RF17).
   */
  alterarStatus(id: string, novoStatus: StatusQuarto): Resultado<Quarto> {
    const quarto = this.repository.buscarPorId(id);
    if (!quarto) {
      return { sucesso: false, erro: "Quarto não encontrado." };
    }

    const quartoAtualizado = quarto.copiarCom({ status: novoStatus });
    const quartoSalvo = this.repository.atualizar(quartoAtualizado);
    return { sucesso: true, dados: quartoSalvo };
  }

  /** Lista todos os quartos (UC02 / RF04) */
  listarQuartos(): Quarto[] {
    return this.repository.listarTodos();
  }

  buscarPorId(id: string): Quarto | undefined {
    return this.repository.buscarPorId(id);
  }
}

// =============================================================================
// DADOS DE EXEMPLO para demonstração
// =============================================================================
const QUARTOS_INICIAIS: Quarto[] = [
  new Quarto({
    id: "qrt_001", numero: "101", capacidade: 2, tipo: TipoQuarto.BASICO,
    precoDiaria: 180, temTV: true, temArCondicionado: true,
    status: StatusQuarto.LIVRE,
    camas: [new Cama(TipoCama.CASAL_QUEEN, "c1")],
  }),
  new Quarto({
    id: "qrt_002", numero: "102", capacidade: 1, tipo: TipoQuarto.BASICO,
    precoDiaria: 120, temTV: true,
    status: StatusQuarto.OCUPADO,
    camas: [new Cama(TipoCama.SOLTEIRO, "c2")],
  }),
  new Quarto({
    id: "qrt_003", numero: "201", capacidade: 3, tipo: TipoQuarto.MODERNO,
    precoDiaria: 280, temFrigobar: true, temTV: true, temArCondicionado: true,
    status: StatusQuarto.LIMPEZA,
    camas: [new Cama(TipoCama.CASAL_KING, "c3"), new Cama(TipoCama.SOLTEIRO, "c4")],
  }),
  new Quarto({
    id: "qrt_004", numero: "301", capacidade: 4, tipo: TipoQuarto.LUXO,
    precoDiaria: 580, temFrigobar: true, temCafeDaManha: true,
    temTV: true, temArCondicionado: true,
    status: StatusQuarto.MANUTENCAO,
    camas: [new Cama(TipoCama.CASAL_KING, "c5"), new Cama(TipoCama.CASAL_QUEEN, "c6")],
  }),
  new Quarto({
    id: "qrt_005", numero: "302", capacidade: 2, tipo: TipoQuarto.LUXO,
    precoDiaria: 520, temFrigobar: true, temCafeDaManha: true,
    temTV: true, temArCondicionado: true,
    status: StatusQuarto.LIVRE,
    camas: [new Cama(TipoCama.CASAL_KING, "c7")],
  }),
];

// =============================================================================
// CUSTOM HOOK — Bridge entre Service e UI
// Responsabilidade: Gerenciar estado React e expor ações da camada de serviço
// DECISÃO: Hook centraliza o estado, evitando prop-drilling e separando a
// lógica de estado da lógica de renderização (SRP aplicado a React).
// =============================================================================

function useGestaoQuartos() {
  // DECISÃO: Instanciamos repository e service dentro do hook para demonstração.
  // Em produção, seriam injetados via Context API ou DI container.
  const [repository] = useState(
    () => new QuartoRepositoryMemoria(QUARTOS_INICIAIS)
  );
  const [service] = useState(() => new QuartoService(repository));

  // Estado da lista — dispara re-renders quando quartos mudam
  const [quartos, setQuartos] = useState<Quarto[]>(() => service.listarQuartos());
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Recarrega a lista do repositório após qualquer mutação
  const recarregarLista = useCallback(() => {
    setQuartos(service.listarQuartos());
  }, [service]);

  const limparFeedback = useCallback(() => {
    setErro(null);
    setSucesso(null);
  }, []);

  const mostrarSucesso = useCallback((msg: string) => {
    setSucesso(msg);
    setErro(null);
    setTimeout(() => setSucesso(null), 3500);
  }, []);

  const mostrarErro = useCallback((msg: string) => {
    setErro(msg);
    setSucesso(null);
  }, []);

  const cadastrarQuarto = useCallback(
    (dto: CriarQuartoDTO): boolean => {
      const resultado = service.cadastrarQuarto(dto);
      if (resultado.sucesso) {
        recarregarLista();
        mostrarSucesso(`Quarto ${dto.numero} cadastrado com sucesso!`);
        return true;
      }
      mostrarErro(resultado.erro);
      return false;
    },
    [service, recarregarLista, mostrarSucesso, mostrarErro]
  );

  const editarQuarto = useCallback(
    (id: string, dto: EditarQuartoDTO): boolean => {
      const resultado = service.editarQuarto(id, dto);
      if (resultado.sucesso) {
        recarregarLista();
        mostrarSucesso("Quarto atualizado com sucesso!");
        return true;
      }
      mostrarErro(resultado.erro);
      return false;
    },
    [service, recarregarLista, mostrarSucesso, mostrarErro]
  );

  const alterarStatus = useCallback(
    (id: string, status: StatusQuarto): void => {
      const resultado = service.alterarStatus(id, status);
      if (resultado.sucesso) {
        recarregarLista();
        mostrarSucesso(`Status alterado para "${status}" com sucesso!`);
      } else {
        mostrarErro(resultado.erro);
      }
    },
    [service, recarregarLista, mostrarSucesso, mostrarErro]
  );

  return {
    quartos,
    erro,
    sucesso,
    limparFeedback,
    cadastrarQuarto,
    editarQuarto,
    alterarStatus,
    buscarPorId: (id: string) => service.buscarPorId(id),
  };
}

// =============================================================================
// CAMADA DE UI — Componentes React
// Responsabilidade: SOMENTE renderização e captura de eventos
// =============================================================================

// ── Constantes de estilo (Design System interno) ──────────────────────────
const CORES_STATUS: Record<StatusQuarto, { bg: string; text: string; dot: string }> = {
  [StatusQuarto.LIVRE]:      { bg: "#dcfce7", text: "#15803d", dot: "#16a34a" },
  [StatusQuarto.OCUPADO]:    { bg: "#fee2e2", text: "#b91c1c", dot: "#dc2626" },
  [StatusQuarto.MANUTENCAO]: { bg: "#fef3c7", text: "#b45309", dot: "#d97706" },
  [StatusQuarto.LIMPEZA]:    { bg: "#dbeafe", text: "#1d4ed8", dot: "#2563eb" },
};

const CORES_TIPO: Record<TipoQuarto, string> = {
  [TipoQuarto.BASICO]:  "#6b7280",
  [TipoQuarto.MODERNO]: "#7c3aed",
  [TipoQuarto.LUXO]:    "#b45309",
};

const ICONE_CAMA: Record<TipoCama, string> = {
  [TipoCama.SOLTEIRO]:    "🛏",
  [TipoCama.CASAL_QUEEN]: "🛏",
  [TipoCama.CASAL_KING]:  "🛏",
};

// ── Componente: Badge de Status ────────────────────────────────────────────
function BadgeStatus({ status }: { status: StatusQuarto }) {
  const cores = CORES_STATUS[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      backgroundColor: cores.bg, color: cores.text,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        backgroundColor: cores.dot, flexShrink: 0,
      }} />
      {status}
    </span>
  );
}

// ── Componente: Badge de Tipo ──────────────────────────────────────────────
function BadgeTipo({ tipo }: { tipo: TipoQuarto }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      backgroundColor: CORES_TIPO[tipo] + "18",
      color: CORES_TIPO[tipo],
      border: `1px solid ${CORES_TIPO[tipo]}40`,
      letterSpacing: "0.3px",
    }}>
      {tipo.toUpperCase()}
    </span>
  );
}

// ── Componente: Campo de Formulário ───────────────────────────────────────
function CampoFormulario({
  label, required, children, erro,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  erro?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.3px" }}>
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {erro && (
        <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {erro}</span>
      )}
    </div>
  );
}

// ── Estilos reutilizáveis de input ─────────────────────────────────────────
const estiloInput: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 7,
  border: "1.5px solid #d1d5db", fontSize: 13,
  outline: "none", transition: "border-color 0.15s",
  backgroundColor: "#fff", color: "#111827",
  width: "100%", boxSizing: "border-box",
};

const estiloSelect: React.CSSProperties = {
  ...estiloInput, cursor: "pointer",
};

const estiloCheckbox: React.CSSProperties = {
  width: 15, height: 15, accentColor: "#1565C0", cursor: "pointer",
};

// ── Estado inicial do formulário ──────────────────────────────────────────
const FORM_VAZIO: CriarQuartoDTO = {
  numero: "", capacidade: 1, tipo: TipoQuarto.BASICO,
  precoDiaria: 0, temFrigobar: false, temCafeDaManha: false,
  temArCondicionado: false, temTV: false, tiposCama: [TipoCama.SOLTEIRO],
};

// ── Componente: Modal de Formulário (Cadastro + Edição) ───────────────────
function ModalFormularioQuarto({
  quartoEditando,
  onSalvar,
  onCancelar,
  erroExterno,
}: {
  quartoEditando: Quarto | null;
  onSalvar: (dto: CriarQuartoDTO) => boolean;
  onCancelar: () => void;
  erroExterno: string | null;
}) {
  // DECISÃO: Estado do formulário é local ao modal — não sobe para o hook
  // até o momento do submit. Isso evita re-renders desnecessários da lista.
  const [form, setForm] = useState<CriarQuartoDTO>(() =>
    quartoEditando
      ? {
          numero: quartoEditando.numero,
          capacidade: quartoEditando.capacidade,
          tipo: quartoEditando.tipo,
          precoDiaria: quartoEditando.precoDiaria,
          temFrigobar: quartoEditando.temFrigobar,
          temCafeDaManha: quartoEditando.temCafeDaManha,
          temArCondicionado: quartoEditando.temArCondicionado,
          temTV: quartoEditando.temTV,
          tiposCama: quartoEditando.camas.map((c) => c.tipo),
        }
      : FORM_VAZIO
  );

  const [errosLocais, setErrosLocais] = useState<Partial<Record<keyof CriarQuartoDTO, string>>>({});
  const idForm = useId();

  const atualizar = <K extends keyof CriarQuartoDTO>(campo: K, valor: CriarQuartoDTO[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrosLocais((prev) => ({ ...prev, [campo]: undefined }));
  };

  const alternarCama = (tipo: TipoCama) => {
    setForm((prev) => {
      const jaExiste = prev.tiposCama.includes(tipo);
      if (jaExiste && prev.tiposCama.length === 1) return prev; // RN05: mínimo 1
      return {
        ...prev,
        tiposCama: jaExiste
          ? prev.tiposCama.filter((t) => t !== tipo)
          : [...prev.tiposCama, tipo],
      };
    });
  };

  // Validação local antes de submeter (UX imediata, RNF03)
  const validarForm = (): boolean => {
    const novosErros: Partial<Record<keyof CriarQuartoDTO, string>> = {};
    if (!form.numero.trim()) novosErros.numero = "Número obrigatório";
    if (form.capacidade < 1) novosErros.capacidade = "Mínimo 1 pessoa";
    if (form.precoDiaria <= 0) novosErros.precoDiaria = "Deve ser maior que zero";
    if (form.tiposCama.length === 0) novosErros.tiposCama = "Mínimo 1 tipo de cama";
    setErrosLocais(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarForm()) return;
    onSalvar(form);
  };

  const eModoEdicao = quartoEditando !== null;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: 14,
        width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
      }}>
        {/* Cabeçalho */}
        <div style={{
          background: "linear-gradient(135deg, #0D47A1 0%, #1B5E20 100%)",
          padding: "20px 24px", borderRadius: "14px 14px 0 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: 0 }}>
              {eModoEdicao ? "✏️ Editar Quarto" : "➕ Novo Quarto"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "3px 0 0" }}>
              {eModoEdicao ? `Editando quarto ${quartoEditando?.numero}` : "Preencha os dados do quarto"}
            </p>
          </div>
          <button onClick={onCancelar} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", width: 30, height: 30, borderRadius: "50%",
            cursor: "pointer", fontSize: 16, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Corpo */}
        <form id={idForm} onSubmit={handleSubmit} style={{ padding: "22px 24px" }}>
          {erroExterno && (
            <div style={{
              backgroundColor: "#fee2e2", border: "1px solid #fca5a5",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              color: "#991b1b", fontSize: 13,
            }}>
              ⚠ {erroExterno}
            </div>
          )}

          {/* Linha 1: Número + Capacidade */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <CampoFormulario label="Número do Quarto" required erro={errosLocais.numero}>
              <input
                style={estiloInput} value={form.numero} maxLength={10}
                onChange={(e) => atualizar("numero", e.target.value)}
                placeholder="ex: 101"
              />
            </CampoFormulario>
            <CampoFormulario label="Capacidade (pessoas)" required erro={errosLocais.capacidade}>
              <input
                style={estiloInput} type="number" min={1} max={20}
                value={form.capacidade}
                onChange={(e) => atualizar("capacidade", parseInt(e.target.value) || 1)}
              />
            </CampoFormulario>
          </div>

          {/* Linha 2: Tipo + Preço */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <CampoFormulario label="Tipo do Quarto" required>
              <select style={estiloSelect} value={form.tipo}
                onChange={(e) => atualizar("tipo", e.target.value as TipoQuarto)}>
                {Object.values(TipoQuarto).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </CampoFormulario>
            <CampoFormulario label="Preço por Diária (R$)" required erro={errosLocais.precoDiaria}>
              <input
                style={estiloInput} type="number" min={0} step={0.01}
                value={form.precoDiaria}
                onChange={(e) => atualizar("precoDiaria", parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </CampoFormulario>
          </div>

          {/* Comodidades */}
          <div style={{
            backgroundColor: "#f8fafc", borderRadius: 9,
            padding: "14px 16px", marginBottom: 14,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12, letterSpacing: "0.3px" }}>
              COMODIDADES
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(
                [
                  { campo: "temFrigobar", label: "🧊 Frigobar" },
                  { campo: "temCafeDaManha", label: "☕ Café da Manhã Incluso" },
                  { campo: "temArCondicionado", label: "❄️ Ar-condicionado" },
                  { campo: "temTV", label: "📺 TV" },
                ] as const
              ).map(({ campo, label }) => (
                <label key={campo} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", fontSize: 13, color: "#374151",
                  backgroundColor: form[campo] ? "#dbeafe" : "#fff",
                  padding: "8px 10px", borderRadius: 7,
                  border: `1.5px solid ${form[campo] ? "#93c5fd" : "#e5e7eb"}`,
                  transition: "all 0.15s",
                }}>
                  <input
                    type="checkbox" style={estiloCheckbox}
                    checked={form[campo]}
                    onChange={(e) => atualizar(campo, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Seção Camas */}
          <div style={{
            backgroundColor: "#f8fafc", borderRadius: 9,
            padding: "14px 16px", marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, letterSpacing: "0.3px" }}>
              🛏 TIPOS DE CAMA <span style={{ color: "#ef4444" }}>*</span>
            </p>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
              Selecione um ou mais tipos de cama (mínimo 1)
            </p>
            {errosLocais.tiposCama && (
              <span style={{ fontSize: 11, color: "#ef4444" }}>⚠ {errosLocais.tiposCama}</span>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.values(TipoCama).map((tipo) => {
                const selecionado = form.tiposCama.includes(tipo);
                return (
                  <button
                    key={tipo} type="button"
                    onClick={() => alternarCama(tipo)}
                    style={{
                      padding: "7px 14px", borderRadius: 20, fontSize: 12,
                      fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      backgroundColor: selecionado ? "#1565C0" : "#fff",
                      color: selecionado ? "#fff" : "#374151",
                      border: `2px solid ${selecionado ? "#1565C0" : "#d1d5db"}`,
                    }}
                  >
                    {ICONE_CAMA[tipo]} {tipo}
                    {selecionado && (
                      <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            {form.tiposCama.length > 0 && (
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>
                {form.tiposCama.length} tipo(s) selecionado(s): {form.tiposCama.join(", ")}
              </p>
            )}
          </div>

          {/* Rodapé dos botões */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onCancelar} style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", backgroundColor: "#f3f4f6", color: "#374151",
              border: "1.5px solid #d1d5db",
            }}>
              Cancelar
            </button>
            <button type="submit" style={{
              padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: "pointer",
              background: "linear-gradient(135deg, #1565C0, #1B5E20)",
              color: "#fff", border: "none",
              boxShadow: "0 2px 8px rgba(21,101,192,0.3)",
            }}>
              {eModoEdicao ? "💾 Salvar Alterações" : "✅ Cadastrar Quarto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente: Card de Quarto na listagem ────────────────────────────────
function CardQuarto({
  quarto,
  onEditar,
  onAlterarStatus,
}: {
  quarto: Quarto;
  onEditar: (quarto: Quarto) => void;
  onAlterarStatus: (id: string, status: StatusQuarto) => void;
}) {
  const [menuStatusAberto, setMenuStatusAberto] = useState(false);

  return (
    <div style={{
      backgroundColor: "#fff", borderRadius: 12,
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden", transition: "box-shadow 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")}
    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
    >
      {/* Topo do card com faixa de status */}
      <div style={{
        height: 5,
        backgroundColor: CORES_STATUS[quarto.status].dot,
      }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Cabeçalho: Número + Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px",
              }}>
                {quarto.numero}
              </span>
              <BadgeTipo tipo={quarto.tipo} />
            </div>
            <p style={{ color: "#6b7280", fontSize: 12, margin: "3px 0 0" }}>
              👥 {quarto.capacidade} pessoa(s)
            </p>
          </div>
          <BadgeStatus status={quarto.status} />
        </div>

        {/* Preço */}
        <div style={{
          backgroundColor: "#f0fdf4", borderRadius: 8,
          padding: "10px 12px", marginBottom: 12, textAlign: "center",
        }}>
          <p style={{ fontSize: 11, color: "#166534", marginBottom: 2, fontWeight: 600 }}>
            PREÇO POR DIÁRIA
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#166534", margin: 0 }}>
            {quarto.precoFormatado}
          </p>
        </div>

        {/* Camas */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>
            🛏 CAMAS
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {quarto.camas.map((cama) => (
              <span key={cama.id} style={{
                padding: "2px 8px", fontSize: 11, borderRadius: 4,
                backgroundColor: "#ede9fe", color: "#6d28d9", fontWeight: 500,
              }}>
                {cama.tipo}
              </span>
            ))}
          </div>
        </div>

        {/* Comodidades */}
        {quarto.comodidades.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>
              ✨ COMODIDADES
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {quarto.comodidades.map((c) => (
                <span key={c} style={{
                  padding: "2px 8px", fontSize: 11, borderRadius: 4,
                  backgroundColor: "#f0f9ff", color: "#0369a1", fontWeight: 500,
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div style={{ display: "flex", gap: 8, borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
          {/* Botão editar (ícone de lápis — conforme RF03/UC03) */}
          <button onClick={() => onEditar(quarto)} style={{
            flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: "pointer", backgroundColor: "#eff6ff", color: "#1d4ed8",
            border: "1.5px solid #bfdbfe", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 5,
          }}>
            ✏️ Editar
          </button>

          {/* Seletor de Status (RF05/UC04) */}
          <div style={{ position: "relative", flex: 1 }}>
            <button
              onClick={() => setMenuStatusAberto((v) => !v)}
              style={{
                width: "100%", padding: "8px", borderRadius: 8, fontSize: 12,
                fontWeight: 600, cursor: "pointer", backgroundColor: "#f9fafb",
                color: "#374151", border: "1.5px solid #d1d5db",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              ⚡ Status
            </button>
            {menuStatusAberto && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 4px)", right: 0,
                backgroundColor: "#fff", borderRadius: 9,
                border: "1.5px solid #e5e7eb", zIndex: 100, minWidth: 160,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
              }}>
                {Object.values(StatusQuarto).map((s) => {
                  const cores = CORES_STATUS[s];
                  const ativo = quarto.status === s;
                  return (
                    <button key={s}
                      onClick={() => {
                        if (!ativo) onAlterarStatus(quarto.id, s);
                        setMenuStatusAberto(false);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "9px 14px", fontSize: 12,
                        fontWeight: ativo ? 700 : 500, cursor: ativo ? "default" : "pointer",
                        backgroundColor: ativo ? cores.bg : "transparent",
                        color: ativo ? cores.text : "#374151", border: "none",
                        textAlign: "left",
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        backgroundColor: cores.dot, flexShrink: 0,
                      }} />
                      {s}
                      {ativo && " ✓"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente: Linha da tabela de listagem ───────────────────────────────
function LinhaTabela({
  quarto,
  onEditar,
  onAlterarStatus,
}: {
  quarto: Quarto;
  onEditar: (q: Quarto) => void;
  onAlterarStatus: (id: string, status: StatusQuarto) => void;
}) {
  return (
    <tr style={{ borderBottom: "1px solid #f3f4f6" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827" }}>
        {quarto.numero}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <BadgeTipo tipo={quarto.tipo} />
      </td>
      <td style={{ padding: "12px 16px", color: "#166534", fontWeight: 700 }}>
        {quarto.precoFormatado}
      </td>
      <td style={{ padding: "12px 8px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {quarto.camas.map((c) => (
            <span key={c.id} style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 3,
              backgroundColor: "#ede9fe", color: "#6d28d9", fontWeight: 600,
            }}>
              {c.tipo}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <BadgeStatus status={quarto.status} />
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEditar(quarto)} style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            cursor: "pointer", backgroundColor: "#eff6ff", color: "#1d4ed8",
            border: "1.5px solid #bfdbfe",
          }}>
            ✏️
          </button>
          <select
            value={quarto.status}
            onChange={(e) => onAlterarStatus(quarto.id, e.target.value as StatusQuarto)}
            style={{
              padding: "4px 6px", borderRadius: 6, fontSize: 11, cursor: "pointer",
              border: "1.5px solid #d1d5db", backgroundColor: "#f9fafb", color: "#374151",
            }}
          >
            {Object.values(StatusQuarto).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL — App de Gestão de Quartos
// =============================================================================
export default function GestaoQuartos() {
  const { quartos, erro, sucesso, cadastrarQuarto, editarQuarto, alterarStatus } =
    useGestaoQuartos();

  const [modalAberto, setModalAberto] = useState(false);
  const [quartoEditando, setQuartoEditando] = useState<Quarto | null>(null);
  const [erroModal, setErroModal] = useState<string | null>(null);
  const [visualizacao, setVisualizacao] = useState<"cards" | "tabela">("cards");
  const [filtroStatus, setFiltroStatus] = useState<StatusQuarto | "Todos">("Todos");
  const [filtroTipo, setFiltroTipo] = useState<TipoQuarto | "Todos">("Todos");
  const [busca, setBusca] = useState("");

  // Filtragem memoizada para evitar recalcular a cada render
  const quartosFiltrados = useMemo(() => {
    return quartos.filter((q) => {
      const matchStatus = filtroStatus === "Todos" || q.status === filtroStatus;
      const matchTipo = filtroTipo === "Todos" || q.tipo === filtroTipo;
      const matchBusca =
        !busca ||
        q.numero.toLowerCase().includes(busca.toLowerCase()) ||
        q.tipo.toLowerCase().includes(busca.toLowerCase());
      return matchStatus && matchTipo && matchBusca;
    });
  }, [quartos, filtroStatus, filtroTipo, busca]);

  // Estatísticas calculadas
  const stats = useMemo(() => ({
    total: quartos.length,
    livres: quartos.filter((q) => q.status === StatusQuarto.LIVRE).length,
    ocupados: quartos.filter((q) => q.status === StatusQuarto.OCUPADO).length,
    manutencao: quartos.filter((q) => q.status === StatusQuarto.MANUTENCAO || q.status === StatusQuarto.LIMPEZA).length,
  }), [quartos]);

  const abrirCadastro = () => {
    setQuartoEditando(null);
    setErroModal(null);
    setModalAberto(true);
  };

  const abrirEdicao = (quarto: Quarto) => {
    setQuartoEditando(quarto);
    setErroModal(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setQuartoEditando(null);
    setErroModal(null);
  };

  const handleSalvar = (dto: CriarQuartoDTO): boolean => {
    let sucesso: boolean;
    if (quartoEditando) {
      sucesso = editarQuarto(quartoEditando.id, dto);
    } else {
      sucesso = cadastrarQuarto(dto);
    }
    if (sucesso) {
      fecharModal();
    } else {
      setErroModal(erro);
    }
    return sucesso;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0D47A1 0%, #1B5E20 100%)",
        padding: "24px 32px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>
                🏨 Sistema de Reserva de Hotel
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "4px 0 0" }}>
                Gestão de Quartos — módulo 1 de 3
              </p>
            </div>
            <button onClick={abrirCadastro} style={{
              padding: "10px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700,
              cursor: "pointer", backgroundColor: "#fff", color: "#0D47A1", border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex",
              alignItems: "center", gap: 6,
            }}>
              ➕ Novo Quarto
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>

        {/* Notificações */}
        {sucesso && (
          <div style={{
            backgroundColor: "#dcfce7", border: "1px solid #86efac",
            borderRadius: 9, padding: "12px 16px", marginBottom: 16,
            color: "#166534", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ✅ {sucesso}
          </div>
        )}
        {erro && !modalAberto && (
          <div style={{
            backgroundColor: "#fee2e2", border: "1px solid #fca5a5",
            borderRadius: 9, padding: "12px 16px", marginBottom: 16,
            color: "#991b1b", fontSize: 13, fontWeight: 600,
          }}>
            ⚠ {erro}
          </div>
        )}

        {/* Cards de estatísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total de Quartos", valor: stats.total, cor: "#1565C0", bg: "#dbeafe" },
            { label: "Disponíveis", valor: stats.livres, cor: "#166534", bg: "#dcfce7" },
            { label: "Ocupados", valor: stats.ocupados, cor: "#b91c1c", bg: "#fee2e2" },
            { label: "Manutenção / Limpeza", valor: stats.manutencao, cor: "#b45309", bg: "#fef3c7" },
          ].map(({ label, valor, cor, bg }) => (
            <div key={label} style={{
              backgroundColor: bg, borderRadius: 10, padding: "16px 18px",
              border: `1.5px solid ${cor}30`,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: cor, marginBottom: 6, letterSpacing: "0.5px" }}>
                {label.toUpperCase()}
              </p>
              <p style={{ fontSize: 30, fontWeight: 900, color: cor, margin: 0 }}>{valor}</p>
            </div>
          ))}
        </div>

        {/* Barra de ferramentas: busca + filtros + visualização */}
        <div style={{
          backgroundColor: "#fff", borderRadius: 10,
          padding: "14px 18px", marginBottom: 20,
          border: "1.5px solid #e5e7eb",
          display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
        }}>
          <input
            style={{ ...estiloInput, maxWidth: 200, flex: "1 1 160px" }}
            placeholder="🔍 Buscar quarto..."
            value={busca} onChange={(e) => setBusca(e.target.value)}
          />

          <select style={{ ...estiloSelect, flex: "0 1 160px" }}
            value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusQuarto | "Todos")}>
            <option value="Todos">Todos os status</option>
            {Object.values(StatusQuarto).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select style={{ ...estiloSelect, flex: "0 1 160px" }}
            value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as TipoQuarto | "Todos")}>
            <option value="Todos">Todos os tipos</option>
            {Object.values(TipoQuarto).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {(["cards", "tabela"] as const).map((v) => (
              <button key={v} onClick={() => setVisualizacao(v)} style={{
                padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                backgroundColor: visualizacao === v ? "#1565C0" : "#f3f4f6",
                color: visualizacao === v ? "#fff" : "#374151",
                border: `1.5px solid ${visualizacao === v ? "#1565C0" : "#d1d5db"}`,
              }}>
                {v === "cards" ? "⊞ Cards" : "☰ Tabela"}
              </button>
            ))}
          </div>
        </div>

        {/* Contagem de resultados */}
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
          Exibindo <strong>{quartosFiltrados.length}</strong> de {quartos.length} quartos
          {(filtroStatus !== "Todos" || filtroTipo !== "Todos" || busca) && " (filtros ativos)"}
        </p>

        {/* Lista vazia */}
        {quartosFiltrados.length === 0 && (
          <div style={{
            backgroundColor: "#fff", borderRadius: 12, padding: "48px 24px",
            textAlign: "center", border: "1.5px dashed #d1d5db",
          }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              Nenhum quarto encontrado
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              {quartos.length === 0
                ? "Cadastre o primeiro quarto clicando em 'Novo Quarto'"
                : "Tente ajustar os filtros de busca"}
            </p>
            {quartos.length === 0 && (
              <button onClick={abrirCadastro} style={{
                padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                color: "#fff", border: "none",
              }}>
                ➕ Cadastrar Primeiro Quarto
              </button>
            )}
          </div>
        )}

        {/* Visualização em Cards */}
        {visualizacao === "cards" && quartosFiltrados.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}>
            {quartosFiltrados.map((quarto) => (
              <CardQuarto
                key={quarto.id}
                quarto={quarto}
                onEditar={abrirEdicao}
                onAlterarStatus={alterarStatus}
              />
            ))}
          </div>
        )}

        {/* Visualização em Tabela */}
        {visualizacao === "tabela" && quartosFiltrados.length > 0 && (
          <div style={{
            backgroundColor: "#fff", borderRadius: 12,
            border: "1.5px solid #e5e7eb", overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                  {["Número", "Tipo", "Preço / Diária", "Camas", "Disponibilidade", "Ações"].map((col) => (
                    <th key={col} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#6b7280",
                      letterSpacing: "0.5px", textTransform: "uppercase",
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quartosFiltrados.map((quarto) => (
                  <LinhaTabela
                    key={quarto.id}
                    quarto={quarto}
                    onEditar={abrirEdicao}
                    onAlterarStatus={alterarStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalAberto && (
        <ModalFormularioQuarto
          quartoEditando={quartoEditando}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
          erroExterno={erroModal}
        />
      )}
    </div>
  );
}