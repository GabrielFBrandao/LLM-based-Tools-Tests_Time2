// Testes unitários para Cadastro e Edição de Quarto
// Importando implementações diretamente da Etapa3, sem alterá-las.

import { InMemoryQuartoRepository } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/infra/repositories/InMemoryQuartoRepository.js';
import { CadastrarQuarto } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/application/quartos/use-cases/CadastrarQuarto.js';
import { EditarQuarto } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/application/quartos/use-cases/EditarQuarto.js';
import { TipoQuarto } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/domain/enums/TipoQuarto.js';
import { TipoCama } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/domain/enums/TipoCama.js';
import { ConflictError } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/application/common/errors/ConflictError.js';
import { NotFoundError } from '../../../Etapa3-Construcao/3.1-Stack1_Node_TS/src/application/common/errors/NotFoundError.js';

const makeCadastroInput = (overrides: Partial<any> = {}) => ({
  numero: 101,
  capacidade: 2,
  tipo: TipoQuarto.BASICO,
  precoHora: 120.5,
  frigobar: true,
  cafeManha: false,
  arCondicionado: true,
  tv: true,
  camas: [TipoCama.SOLTEIRO, TipoCama.SOLTEIRO],
  ...overrides,
});

describe('Stack1 - Quartos: Casos de uso (Unit)', () => {
  test('Cadastro de quarto - sucesso', async () => {
    const repo = new InMemoryQuartoRepository();
    const usecase = new CadastrarQuarto(repo);

    const criado = await usecase.execute(makeCadastroInput());

    expect(criado.id).toBeDefined();
    expect(criado.numero.valor).toBe(101);
    expect(criado.capacidade).toBe(2);
    expect(criado.tipo).toBe(TipoQuarto.BASICO);
    expect(criado.precoHora.valor).toBe(120.5);
    expect(criado.frigobar).toBe(true);
    expect(criado.cafeManha).toBe(false);
    expect(criado.arCondicionado).toBe(true);
    expect(criado.tv).toBe(true);
    expect(criado.camas.length).toBe(2);
  });

  test('Cadastro de quarto - falha: número duplicado', async () => {
    const repo = new InMemoryQuartoRepository();
    const usecase = new CadastrarQuarto(repo);

    await usecase.execute(makeCadastroInput({ numero: 1 }));
    await expect(usecase.execute(makeCadastroInput({ numero: 1 })))
      .rejects.toBeInstanceOf(ConflictError);
  });

  test('Cadastro de quarto - falha: Número de quarto inválido', async () => {
    const repo = new InMemoryQuartoRepository();
    const usecase = new CadastrarQuarto(repo);

    await expect(usecase.execute(makeCadastroInput({ numero: 0 }))).rejects.toThrow('Número de quarto inválido');
  });

  test('Cadastro de quarto - falha: Preço por hora inválido', async () => {
    const repo = new InMemoryQuartoRepository();
    const usecase = new CadastrarQuarto(repo);

    await expect(usecase.execute(makeCadastroInput({ precoHora: 0 }))).rejects.toThrow('Preço por hora inválido');
  });

  test('Edição de quarto - sucesso', async () => {
    const repo = new InMemoryQuartoRepository();
    const cadastrar = new CadastrarQuarto(repo);
    const editar = new EditarQuarto(repo);

    const criado = await cadastrar.execute(makeCadastroInput({ numero: 202, capacidade: 3, tipo: TipoQuarto.MODERNO }));

    const atualizado = await editar.execute({
      id: criado.id!,
      capacidade: 4,
      precoHora: 200.0,
      frigobar: false,
      camas: [TipoCama.CASAL_QUEEN],
    });

    expect(atualizado.capacidade).toBe(4);
    expect(atualizado.precoHora.valor).toBe(200.0);
    expect(atualizado.frigobar).toBe(false);
    expect(atualizado.camas.length).toBe(1);
    expect(atualizado.camas[0].tipoCama).toBe(TipoCama.CASAL_QUEEN);
  });

  test('Edição de quarto - falha: NotFoundError', async () => {
    const repo = new InMemoryQuartoRepository();
    const editar = new EditarQuarto(repo);

    await expect(editar.execute({ id: 'nao-existe', capacidade: 2 }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  test('Edição de quarto - falha: Capacidade inválida', async () => {
    const repo = new InMemoryQuartoRepository();
    const cadastrar = new CadastrarQuarto(repo);
    const editar = new EditarQuarto(repo);

    const criado = await cadastrar.execute(makeCadastroInput({ numero: 303 }));

    await expect(editar.execute({ id: criado.id!, capacidade: 0 }))
      .rejects.toThrow('Capacidade inválida');
  });

  test('Edição de quarto - falha: Tipo de cama inválido', async () => {
    const repo = new InMemoryQuartoRepository();
    const cadastrar = new CadastrarQuarto(repo);
    const editar = new EditarQuarto(repo);

    const criado = await cadastrar.execute(makeCadastroInput({ numero: 404 }));

    // @ts-expect-error força valor inválido para tipo de cama
    await expect(editar.execute({ id: criado.id!, camas: ['INVALIDO'] }))
      .rejects.toThrow('Tipo de cama inválido');
  });
});
