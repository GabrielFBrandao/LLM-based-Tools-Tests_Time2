# 3.1 - Implementação Stack 1

## Prompt Enviado
> Para os próximos passos, considere que a stack tecnológica definida é: TypeScript + Node.js + React.
> Com isso:
> - Implemente as classes para: Quarto, Hóspede e Reserva;
> - Considerando o módulo de Gestão de Quartos, implemente:
>   - Cadastro de quarto
>   - Edição de quarto
>   - Listagem de quartos com: Número, Tipo, Preço por hora, Disponibilidade, Suporte a múltiplas camas
> - Garanta princípios SOLID e clean code;
> - Explique decisões de implementação em comentários.

---

## Resposta da IA (Resumo da Abordagem)

A ferramenta optou por uma abordagem de **"Single File Architecture"** para demonstração, simulando as camadas do backend (Domain, Service, Infra) dentro do cliente (React) para garantir consistência e evitar limites de token.

### Estrutura Implementada
**Camada de Domínio**
* Classes imutáveis (`Quarto`, `Hospede`, `Reserva`, `Cama`).
* Método `copiarCom()` para imutabilidade (padrão Value Object).

**SOLID na Prática**
* **S (SRP):** Separação clara entre Lógica (`QuartoService`) e UI (`GestaoQuartos`).
* **O (OCP):** Uso de Enums e estratégias extensíveis.
* **L (LSP):** `QuartoRepositoryMemoria` implementa `IQuartoRepository` (pode ser trocado por banco real).
* **I (ISP):** Interfaces coesas.
* **D (DIP):** Injeção de dependência manual no Hook (`new QuartoService(repository)`).

### Decisões Arquiteturais
* **Imutabilidade:** Objetos de domínio não são alterados diretamente.
* **Repository em Memória:** Simulação de banco de dados usando `Map<id, Quarto>` para performance O(1).
* **Hooks como Controllers:** O Custom Hook `useGestaoQuartos` atua como o "Controller" do MVC no front, conectando a View ao Service.