Vou analisar o construtor e identificar problemas de qualidade no código.

---

## 🔍 Análise de Qualidade do Construtor

Identifiquei **7 problemas de qualidade** no código. Verifique o painel Code Issues para detalhes completos.

### 🔴 Problemas Críticos (High)

1. **Parâmetros públicos quebram encapsulamento** - Todos os campos são mutáveis externamente
2. **Status mutável publicamente** - Bypassa validações do State Pattern

### 🟡 Problemas Médios (Medium)

3. **13 parâmetros no construtor** - Dificulta uso e manutenção
4. **Array de camas mutável** - Permite modificação sem controle

### 🟢 Problemas Menores (Low)

5. **Timestamps mutáveis** - createdAt/updatedAt podem ser alterados externamente
6. **Validação tardia** - Executada após inicialização
7. **Flags booleanas múltiplas** - Code smell para amenidades

### 💡 Refatoração Sugerida

**Opção 1: Builder Pattern (Recomendado)**

```typescript
const quarto = new QuartoBuilder()
  .comId(1)
  .comNumero(101)
  .comCapacidade(2)
  .comTipo(TipoQuarto.LUXO)
  .comPrecoDiaria(200)
  .comFrigobar()
  .comTV()
  .build();
```

**Opção 2: Objeto de Configuração**

```typescript
const quarto = new Quarto({
  id: 1,
  numero: 101,
  capacidade: 2,
  tipo: TipoQuarto.LUXO,
  precoDiaria: 200,
  amenidades: [Amenidade.FRIGOBAR, Amenidade.TV]
});
```

**Opção 3: Campos Privados + Readonly**

```typescript
constructor(
  private readonly id: number,
  private readonly numero: number,
  // ... campos privados com getters
)
```

Consulte o **Code Issues Panel** para ver todas as sugestões de correção! 🚀

---

### Fix Parâmetros públicos no construtor quebram encapsulamento issue in Quarto.ts at [120, 133]

**Fix Parâmetros públicos no construtor quebram encapsulamento issue in Quarto.ts at [120, 133]**

Vou corrigir o problema de encapsulamento tornando os campos privados e adicionando getters/setters apropriados.

**Corrigindo encapsulamento: tornando campos privados/readonly e adicionando getters necessários**

## Fix Status mutável publicamente quebra State Pattern issue in Quarto.ts at [129, 128]

Vou corrigir o problema de encapsulamento tornando os campos privados e adicionando getters/setters apropriados.

## Fix Construtor com muitos parâmetros (13 parâmetros) issue in Quarto.ts at [120, 133]

**Corrigindo encapsulamento: tornando campos privados/readonly e adicionando getters necessários**

Vou corrigir o problema tornando o campo status privado para proteger o State Pattern.

## Fix Array de camas mutável publicamente issue in Quarto.ts at [130, 129]

**Tornando o campo status privado para evitar modificação direta e proteger o State Pattern**

Vou refatorar o construtor usando um objeto de configuração para reduzir os parâmetros.

## Fix Flags booleanas múltiplas (code smell) issue in Quarto.ts at [125, 127]

**Refatorando construtor para usar interface de configuração, reduzindo de 13 para 1 parâmetro**

Vou corrigir o problema tornando o array de camas privado para evitar modificação direta externa.

## Fix Timestamps mutáveis publicamente issue in Quarto.ts at [131]

`Quarto.ts`

+3-1

 Undo

**Tornando o campo camas privado para forçar modificações apenas via métodos controlados (adicionarCama/removerCama)**

Vou refatorar as flags booleanas para um modelo mais extensível usando enum e Set.

Vou corrigir o problema dos timestamps mutáveis publicamente, tornando-os privados e adicionando getters.

**Substituindo flags booleanas por enum Amenidade e Set para melhor extensibilidade**

`Quarto.ts`
Error

`Quarto.ts`
Error

`Quarto.ts`
Error

`Quarto.ts`
Error

`Quarto.ts`
Error

**Tornando timestamps privados e adicionando getters públicos para proteger contra modificação externa**

`Quarto.ts`
Error

**1 file read**
`Quarto.ts`

**Tornando timestamps privados e adicionando getters públicos para proteger contra modificação externa**

`Quarto.ts`

+17-5

 Undo

---

## ✅ Issue corrigido!

**Mudanças aplicadas:**

1. Campos privados criados: 
`_createdAt` (readonly) e `_updatedAt`
2. Parâmetros do construtor: Removido  
`public` de `createdAt` e `updatedAt`
3. Getters públicos adicionados: 
 `getCreatedAt()` e `getUpdatedAt()`
4. Referências atualizadas: Todos os métodos agora usam 
 `this._updatedAt`

**Resultado:**

* ✅ Timestamps não podem mais ser modificados externamente
* ✅ `createdAt` é imutável (readonly)
* ✅ `updatedAt` só é modificado internamente pelos métodos da classe
* ✅ Acesso de leitura via getters públicos

