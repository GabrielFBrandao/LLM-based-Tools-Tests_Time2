# Estratégia de Cobertura de Testes

Unidade
- Cobrir casos de sucesso e de erro dos casos de uso CadastrarQuarto e EditarQuarto.
- Verificar gatilhos de exceções oriundas dos Value Objects (NumeroQuarto, PrecoHora) e da entidade Quarto (capacidade).
- Isolar persistência com InMemoryQuartoRepository, focando em regras de negócio e orquestração dos use cases.

Integração
- Validar o fluxo crítico: Cadastro de hóspede → Criação de reserva → Atualização de disponibilidade do quarto.
- Confirmar integração entre entidades e repositórios (consistência de ids, estados e invariantes de disponibilidade/overbooking).

Justificativa
- Os testes unitários dão feedback rápido sobre regressões nas regras centrais de domínio.
- Os testes de integração atestam que a combinação dos componentes atende ao cenário de negócio real, reduzindo riscos em operações-chave.
- A divisão permite localizar falhas (isoladamente no domínio vs. coordenação entre componentes) e otimizar a manutenção.
