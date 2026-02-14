# 4.2 - Testes de Integração Stack 1 (Node/Jest)

## Prompt Enviado
> Agora, vamos fazer testes de integração. Com isso:
> Proponha testes de integração para fluxo: Cadastro de hóspede → Criação de reserva → Atualização de disponibilidade do quarto.

---

## Análise da Resposta

### Comportamento da Ferramenta
A ferramenta foi além de apenas "propor". Ela **implementou e validou** a suíte de testes de integração, rodando o Jest internamente antes de gerar os artefatos finais. Para que o teste fosse possível, a IA expandiu proativamente o domínio, criando as entidades e serviços faltantes (`Hospede`, `Reserva` e seus respectivos Repositórios e Services) necessários para o fluxo completo.

### Artefatos Gerados
* **Código Fonte (.zip):** 5 arquivos TypeScript contendo a expansão do domínio e 21 cenários de teste de integração.
* **Documentação (.docx):** Um documento formal justificando a estratégia de testes, estruturado em 4 suítes principais.

### Decisões Técnicas de Destaque
1. **Sem Mocks (Real Integration):** A IA decidiu não usar mocks (`jest.fn()`). Em vez disso, usou os Repositórios em Memória instanciados juntos. Isso garante a validação do estado compartilhado (ex: se a reserva ocupa o quarto, o repositório de quartos deve refletir isso).
2. **Padrão `criarContexto()`:** Para evitar vazamento de estado entre os testes (test pollution), a IA implementou um helper que gera repositórios e serviços "zerados" antes de cada teste.
3. **Testes de Falha Parcial (Suite 3):** Demonstrou maturidade ao testar não apenas o "caminho feliz" , mas "Race Conditions" e integridade em falhas (ex: garantir que o quarto não mude de status se a validação do hóspede falhar no meio do processo).
4. **Verificação de Estado:** Os asserts não verificam apenas o que a função retorna, mas consultam ativamente o repositório final para garantir que o efeito colateral ocorreu (ex: `quartoRepo.buscarPorId(id).status === OCUPADO`).

**Total Executado:** 21 testes, com 87 asserções (100% passando).