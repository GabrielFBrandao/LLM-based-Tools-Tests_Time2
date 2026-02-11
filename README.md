# Avaliação Experimental: Claude 3.5 Sonnet

Este repositório documenta a execução do protocolo de avaliação experimental de ferramentas de IA generativa aplicadas à Engenharia de Software.

**Ferramenta Avaliada:** Claude 3.5 Sonnet (Anthropic)
**Classificação:** Ferramenta Generalista (cobre todo o SDLC)
**Método de Input:** Chat direto (Textual)

---

## 📋 Sobre o Experimento

O objetivo deste projeto é analisar a capacidade da LLM em apoiar as diversas fases do ciclo de vida de desenvolvimento de software (SDLC), utilizando um cenário padronizado de **Sistema de Gestão Hoteleira**.

A avaliação segue estritamente o "Protocolo para Avaliação Experimental" definido pelo grupo de pesquisa.

## 🏨 Contexto do Cenário

O sistema alvo é um software para o "Hotel Litoral Tech", contemplando:
* Gestão de Quartos e Disponibilidade.
* Gestão de Hóspedes.
* Reservas e Check-in/Check-out.

## 🗂 Estrutura do Repositório

O repositório está organizado conforme as etapas do protocolo.

| Diretório | Etapa do Protocolo | Foco |
| :--- | :--- | :--- |
| `/Etapa1-Requisitos` | Etapa 1 | Elicitação, Histórias de Usuário, Casos de Uso |
| `/Etapa2-Arquitetura` | Etapa 2 | Estilo Arquitetural, Diagramas |
| `/Etapa3-Construcao` | Etapa 3 | Geração de Código em Node.js e Java |
| `/Etapa4-Testes` | Etapa 4 | Testes Unitários e de Integração |
| `/Etapa5-Operacoes` | Etapa 5 | CI/CD, Docker, Monitoramento |
| `/Etapa6-Manutencao` | Etapa 6 | Identificação de Code Smells e Refatoração |
| `/Etapa7-Gerenciamento` | Etapa 7 | Planejamento de Sprints, Riscos e KPIs |

## ✅ Critérios de Avaliação

A análise humana é realizada em todas as etapas, verificando:
1.  **Aderência:** O output atende ao solicitado no prompt?
2.  **Corretude:** O código/diagrama é funcional e lógico?
3.  **Métricas:**
    * M1: % de Requisitos Atendidos.
    * LOC: Linhas de Código (sem comentários/espaços).
    * Interações: Quantidade de prompts necessários.