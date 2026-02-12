Vou refatorar o código aplicando rigorosamente os princípios SOLID e Clean Code.

Criando diretórios adicionais para melhor organização seguindo Clean Code
`shell`

Completed

```bash
mkdir -p backend/src/modules/quartos/{validators,errors,interfaces}
```

Criando classes de erro customizadas seguindo Single Responsibility Principle

`QuartoErrors.ts`

+39-0

Undo

Criando validators seguindo Single Responsibility Principle

`QuartoValidators.ts`

+83-0

Undo

Criando interfaces seguindo Interface Segregation Principle

`IQuartoRepository.ts`

+24-0

Undo

Refatorando Repository seguindo SOLID e Dependency Inversion Principle

`QuartoRepository.ts`

+21-26

Undo

Criando mappers seguindo Single Responsibility Principle

`QuartoMappers.ts`
+53-0
Undo

Refatorando Service seguindo SOLID e Clean Code com métodos privados descritivos

`QuartosService.ts`

+104-90

Undo

Refatorando Controller seguindo SOLID e Clean Code com tratamento de erros centralizado

`QuartosController.ts`

+84-56

Undo

Refatorando rotas com Factory Pattern para melhor organização
`routes.ts`

+19-13

Undo

Criando documentação sobre princípios SOLID aplicados
`SOLID_CLEAN_CODE.md`

+325-0

Undo

🔄 Undo all changes

---

## ✅ Código Refatorado com SOLID e Clean Code!

### 🎯 Melhorias Implementadas

**1. Single Responsibility Principle (SRP)**

* ✅ Validators separados (NumeroQuartoValidator, CapacidadeValidator, etc.)
* ✅ Mappers específicos (CamaMapper, QuartoResponseMapper, QuartoListMapper)
* ✅ Errors customizados (QuartoNaoEncontradoError, QuartoJaExisteError, etc.)
* ✅ Métodos privados descritivos no Service

**2. Open/Closed Principle (OCP)**

* ✅ Interface IValidator permite extensão sem modificação
* ✅ State Pattern permite novos estados sem alterar existentes
* ✅ Novos validators podem ser adicionados facilmente

**3. Liskov Substitution Principle (LSP)**

* ✅ Qualquer implementação de IQuartoRepository é substituível
* ✅ Service não depende de implementação concreta

**4. Interface Segregation Principle (ISP)**

* ✅ IQuartoReader e IQuartoWriter segregados
* ✅ IDTOMapper genérico
* ✅ Clientes dependem apenas do que precisam

**5. Dependency Inversion Principle (DIP)**

* ✅ Service depende de IQuartoRepository (abstração)
* ✅ Controller depende de Service (abstração)
* ✅ Factory Pattern para injeção de dependências

### 🧹 Clean Code Aplicado

**✅ Nomes Significativos**

```typescript
// Métodos com nomes descritivos
verificarNumeroUnico()
buscarQuartoOuFalhar()
criarQuartoFromDTO()
aplicarAtualizacoes()
```

**✅ Funções Pequenas e Focadas**

* Cada método tem uma única responsabilidade
* Métodos privados extraídos para clareza
* Lógica complexa dividida em passos menores

**✅ Tratamento de Erros Centralizado**

```typescript
// Controller com handleError centralizado
private handleError(error: unknown, res: Response, next: NextFunction)
private getStatusCode(error: DomainError): number
```

**✅ DRY (Don't Repeat Yourself)**

* Mappers reutilizáveis
* Validators compostos
* Lógica de validação centralizada

### 📁 Nova Estrutura

```
quartos/
├── entities/                  → Domínio
├── dtos/                      → DTOs + Mappers
├── interfaces/                → Contratos (ISP)
├── repositories/              → Persistência (DIP)
├── services/                  → Lógica de negócio (SRP)
├── controllers/               → Endpoints (SRP)
├── validators/                → Validações (SRP, OCP)
├── errors/                    → Erros customizados (SRP)
└── routes.ts                  → Factory Pattern
```

### 📊 Benefícios

* Testabilidade: Cada classe testável isoladamente
* Manutenibilidade: Mudanças localizadas
* Extensibilidade: Fácil adicionar funcionalidades
* Legibilidade: Código auto-explicativo
* Reutilização: Componentes independentes

### 📝 Documentação

Criei `SOLID_CLEAN_CODE.md` com:

* Explicação detalhada de cada princípio
* Exemplos práticos de aplicação
* Checklists de verificação
* Guias de extensão

O código agora segue rigorosamente os princípios SOLID e Clean Code! 🚀
