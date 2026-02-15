# 2.3 - Modelagem do Sistema (Diagramas) - Qodo

## Prompt Enviado
> Agora, vamos para a etapa de modelagem. Com isso:
> Gere o diagrama de componentes do sistema(texto ou UML).
> Gere o diagrama de classes principal (Quarto, Hóspede, Reserva.).

---

## Resposta da IA (Qodo)

A IA gerou a resposta no chat e, proativamente, criou e salvou os arquivos físicos (`.puml` e `.md`) direto no *workspace* do VS Code.

### Diagramas gerados em formato PlantUML:

**Diagrama de Componentes:** 
* Etapa2-Arquitetura/2.3-Modelagem_Diagramas/2.3.3-Diagramas_Componentes.puml
* Diagrama de Classes (Quarto, Hóspede, Reserva): Etapa2-Arquitetura/2.3-Modelagem_Diagramas/2.3.2-Diagramas_Classes.puml

## Resumo do conteúdo:

* Componentes: UI Web (SPA) → API/Controller → Módulos (Quartos, Hóspedes, Reservas, Identidade & Acesso, Comum) → PostgreSQL; logs/métricas integrados.
* Classes principais: Quarto com comodidades e disponibilidade; Hospede com CPF/Email; Reserva vinculando Quarto e Hóspede e controlando ocupação; VOs (CPF, Email, NumeroQuarto, PrecoDiaria) e enums (TipoQuarto, Disponibilidade, TipoCama); associação Quarto-Reserva-Hóspede e Quarto-Cama.