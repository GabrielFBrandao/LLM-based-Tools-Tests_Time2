Vou implementar o módulo completo de Gestão de Quartos com todas as funcionalidades solicitadas.

Creating directory structure for quartos module components

`shell`

Completed

```bash
mkdir -p src/main/java/com/hotel/reservas/modules/quartos/{controller,service,repository,dto}
```

Creating Cama entity to support multiple beds per room

`Cama.java`

+30-0

 Undo

Adding OneToMany relationship to Cama in Quarto entity

`Quarto.java`

+5-0

 Undo

Creating DTO for Quarto creation request

Creating DTO for Quarto response

Creating Repository interface for Quarto

Creating Service layer for Quarto business logic

Creating REST Controller for Quarto endpoints

`QuartoRequest.java`

+37-0

 Undo

`QuartoResponse.java`

+24-0

 Undo

`QuartoRepository.java`

+15-0

 Undo

`QuartoService.java`

+103-0

 Undo

`QuartoController.java`

+46-0

 Undo

🔄 Undo all changes

---

Implementei o módulo completo de Gestão de Quartos:

## ✅ Componentes Criados

**1. Model**

* Cama.java - Entidade para múltiplas camas (SOLTEIRO, KING, QUEEN)
* Quarto.java - Atualizado com relacionamento OneToMany para camas

**2. Repository**

* QuartoRepository.java - Interface JPA com métodos de busca e validação

**3. Service**

* QuartoService.java - Lógica de negócio:
  * criar() - Cadastro com validação de número único
  * atualizar() - Edição completa do quarto
  * listarTodos() - Listagem de todos os quartos
  * buscarPorId() - Busca individual

**4. Controller**

* QuartoController.java - Endpoints REST:
  * POST /api/v1/quartos - Criar quarto
  * PUT /api/v1/quartos/{id} - Editar quarto
  * GET /api/v1/quartos - Listar todos
  * GET /api/v1/quartos/{id} - Buscar por ID

**5. DTOs**

* QuartoRequest.java - Validações Bean Validation
* QuartoResponse.java - Resposta com todos os dados incluindo camas

## 📋 Funcionalidades Implementadas

✅ Cadastro de quarto  
✅ Edição de quarto  
✅ Listagem com: número, tipo, preço, disponibilidade  
✅ Suporte a múltiplas camas (Solteiro, King, Queen)  
✅ Status: LIVRE, OCUPADO, MANUTENCAO, LIMPEZA  
✅ Validações de entrada  
✅ Transações ACID
