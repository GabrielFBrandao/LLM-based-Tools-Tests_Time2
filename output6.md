## Matriz de Rastreabilidade: Requisitos Histórias de Usuário

## Requisitos Funcionais

## RF01-Gestão de Quartos
| Requisito | História de Usuário | Caso de Uso |
| :--- | :--- | :--- |
| RF01.1 Cadastrar quartos com número, capacidade, tipo, preço e comodidades | US01 Cadastrar Quarto | UC01 |
| RF01.2-Editar informações de quartos cadastrados | US03-Editar Quarto | UC02 |
| RF01.3-Listar todos os quartos com informações básicas e disponibilidade | US02-Listar Quartos | UC10 |
| RF01.4-Cadastrar múltiplas camas por quarto | US01 Cadastrar Quarto | UC01 |
| RF01.5 Gerenciar status de disponibilidade | US04 Gerenciar Status de Disponibilidade | UC03 |

## RF02 - Gestão de Hóspedes
| Requisito | História de Usuário | Caso de Uso |
| :--- | :--- | :--- |
| RF02.1 Cadastrar hóspedes com nome, sobrenome, CPF e email | US05 Cadastrar Hóspede | UC04 |
| RF02.2-Listar todos os hóspedes cadastrados | US06 - Listar Hóspedes | UC05 |
| RF02.3-Validar CPF no formato correto | US05-Cadastrar Hóspede | UC04 |
| RF02.4-Validar email no formato correto | US05 - Cadastrar Hóspede | UC04 |

## RF03-Gestão de Reservas
| Requisito | História de Usuário | Caso de Uso |
| :--- | :--- | :--- |
| RF03.1-Criar reservas vinculando hóspede a quarto | US07 - Criar Reserva | UC06 |
| RF03.2-Editar reservas existentes | US09-Editar Reserva | UC07, UC08 |
| RF03.3-Listar todas as reservas com informações | US08-Listar Reservas | UC09 |
| RF03.4-Atualizar automaticamente status ao criar/cancelar reserva | US07 - Criar Reserva, US09 - Editar reserva | UC06, UC08 |
| RF03.5- Impedir reserva de quartos não livres | US10-Validar Disponibilidade na Reserva | UC06 |

---

## Requisitos Não Funcionais Histórias de Usuário

## RNF01 Usabilidade
| Requisito | Aplicável a |
| :--- | :--- |
| RNF01.1 - Interface com paleta verde e azul | Todas as US (US01-US10) |
| RNF01.2-Componentes modernos e responsivos | Todas as US (US01-US10) |
| RNF01.3 - Sistema intuitivo e fácil navegação | Todas as US (US01-US10) |
| RNF01.4 - Feedback visual para ações | US01, US03, US04, US05, US07, US09 |

## RNF02 - Performance
| Requisito | Aplicável a |
| :--- | :--- |
| RNF02.1 - Carregar listas em menos de 2 segundos | US02, US06, US08 |
| RNF02.2 - Responder a ações em menos de 1 segundo | US01, US03, US04, US05, US07, US09 |

## RNF03 - Compatibilidade
| Requisito | Aplicável a |
| :--- | :--- |
| RNF03.1-Funcionar nos principais navegadores | Todas as US (US01-US10) |
| RNF03.2 - Responsivo para diferentes telas | Todas as US (US01-US10) |

## RNF04 - Segurança
| Requisito | Aplicável a |
| :--- | :--- |
| RNF04.1 Validar dados de entrada | US01, US05, US07 |
| RNF04.2 - Proteger dados sensíveis | US05, US06 |

## RNF05 - Manutenibilidade
| Requisito | Aplicável a |
| :--- | :--- |
| RNF05.1-Código com padrões e boas práticas | Todas as US (US01-US10) |
| RNF05.2 - Arquitetura modular e escalável | Todas as US (US01-US10) |

---

## Resumo de Cobertura
| Módulo | Requisitos Funcionais | Histórias de Usuário | Casos de Uso |
| :--- | :--- | :--- | :--- |
| Gestão de Quartos | RF01.1-RF01.5 | US01, US02, US03, US04 | UC01, UC02, UC03, UC10 |
| Gestão de Hóspedes | RF02.1-RF02.4 | US05, US06 | UC04, UC05 |
| Gestão de Reservas | RF03.1-RF03.5 | US07, US08, US09, US10 | UC06, UC07, UC08, UC09 |

**Total: 14 Requisitos Funcionais | 10 Histórias de Usuário | 10 Casos de Uso**