# Testes para Stack1 (Node + TypeScript)

Esta pasta contém uma suíte de testes isolada para a Stack1, sem modificar os arquivos da Etapa3.

Como executar
- Abra um terminal nesta pasta (Etapa4-Testes/Stack1-Node-TS-Tests).
- Instale as dependências:
  npm install
- Execute os testes:
  npm test

Estrutura
- tests/unit/quartos.usecases.test.ts: testes unitários para Cadastro e Edição de quarto usando o repositório em memória da Etapa3.
- tests/integration/PROPOSTA_FLUXO.md: proposta de testes de integração para o fluxo Cadastro de hóspede → Criação de reserva → Atualização de disponibilidade do quarto.
- tests/Cobertura_Estrategia.md: estratégia de cobertura e justificativas.

Observações
- Os imports dos testes apontam diretamente para os arquivos TypeScript da Etapa3 usando caminhos relativos. Nenhuma alteração é necessária na Etapa3.
