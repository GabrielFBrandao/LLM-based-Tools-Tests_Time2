Vou refatorar o código aplicando princípios SOLID e Clean Code.

Creating directories for mapper and exception handling

`shell`

Completed

```bash
mkdir -p src/main/java/com/hotel/reservas/modules/quartos/mapper
src/main/java/com/hotel/reservas/shared/exception
```

Creating custom exception for resource not found (Clean Code)

Creating custom exception for business rule violations (Clean Code)

Creating mapper following Single Responsibility Principle

Creating validator following Single Responsibility Principle

Refactoring QuartoService to follow SOLID principles - Single Responsibility and Dependency Inversion

`ResourceNotFoundException.java`

+7-0

 Undo

`BusinessException.java`

+7-0

 Undo

`QuartoMapper.java`

+59-0

 Undo

`QuartoValidator.java`

+25-0

 Undo

`QuartoService.java`

+22-62

 Undo

🔄 Undo all changes

Creating directory for global exception handler

`shell`

Completed

```bash
mkdir -p src/main/java/com/hotel/reservas/shared/handler
```

Creating global exception handler for consistent error responses

`GlobalExceptionHandler.java`

+60-0

 Undo

---

Refatoração completa aplicando SOLID e Clean Code:

## ✅ Princípios SOLID Aplicados

**1. Single Responsibility Principle (SRP)**

* QuartoService - Apenas orquestração de operações
* QuartoValidator - Apenas validações de negócio
* QuartoMapper - Apenas conversão entre DTOs e entidades
* QuartoRepository - Apenas acesso a dados

**2. Open/Closed Principle (OCP)**

* Exceções customizadas extensíveis (BusinessException, ResourceNotFoundException)
* Mapper permite extensão sem modificar service

**3. Liskov Substitution Principle (LSP)**

* Interfaces JPA respeitam contratos
* Exceções seguem hierarquia de RuntimeException

**4. Interface Segregation Principle (ISP)**

* Repository com métodos específicos
* DTOs separados (Request/Response)

**5. Dependency Inversion Principle (DIP)**

* Service depende de abstrações (Repository interface)
* Injeção de dependências via constructor

## ✅ Clean Code Aplicado

**Nomenclatura Clara**

* Métodos descritivos: validarNumeroUnico(), buscarQuartoPorId()
* Classes com responsabilidade única

**Tratamento de Exceções**

* GlobalExceptionHandler - Tratamento centralizado
* Exceções específicas de domínio
* Mensagens de erro consistentes

**Separação de Responsabilidades**

* Controller - HTTP/REST
* Service - Orquestração
* Validator - Regras de negócio
* Mapper - Transformação de dados
* Repository - Persistência

**Código Limpo**

* Métodos pequenos e focados
* Sem duplicação de código
* Transações bem definidas
* Validações centralizadas
