Vou adicionar comentários explicativos nas decisões de implementação.

Adding explanatory comments to Quarto entity about implementation decisions

`Quarto.java`

+14-0

 Undo

Adding explanatory comments to Cama entity

`Cama.java`

+9-0

 Undo

Adding explanatory comments to QuartoService about implementation decisions

`QuartoService.java`

+36-2

 Undo

Adding explanatory comments to QuartoValidator

`QuartoValidator.java`

+17-0

 Undo

Adding explanatory comments to QuartoMapper

`QuartoMapper.java`

+25-2

 Undo

Adding explanatory comments to QuartoController

`QuartoController.java`

+14-0

 Undo

Adding explanatory comments to QuartoRequest DTO

`QuartoRequest.java`

+11-0

 Undo

Adding explanatory comments to QuartoResponse DTO

`QuartoResponse.java`

+9-0

 Undo

Adding explanatory comments to GlobalExceptionHandler

`GlobalExceptionHandler.java`

+17-0

 Undo

🔄 Undo all changes

---

Comentários explicativos adicionados em todas as classes!

## 📝 Resumo dos Comentários Adicionados

**Entidades (Model)**

* Quarto.java - Decisões sobre Lombok, BigDecimal, Enums, Cascade
* Cama.java - FetchType LAZY, relacionamento bidirecional

**Service Layer**

* QuartoService.java - Transações, readOnly, fluxo de operações, DRY
* QuartoValidator.java - SRP, validações de negócio, exceções de domínio

**Mapper**

* QuartoMapper.java - SRP, reutilização, relacionamento bidirecional

**Controller**

* QuartoController.java - REST, versionamento, status HTTP semânticos

**DTOs**

* QuartoRequest.java - Bean Validation, mensagens customizadas
* QuartoResponse.java - Separação Request/Response

**Exception Handling**

* GlobalExceptionHandler.java - Tratamento centralizado, status HTTP, Records

Todos os comentários explicam por que as decisões foram tomadas, não apenas o que o código faz, seguindo princípios de Clean Code.
