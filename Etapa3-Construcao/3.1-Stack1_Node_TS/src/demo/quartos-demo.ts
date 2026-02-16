// Script de demonstração do módulo de Gestão de Quartos.
// Mostra cadastro, edição e listagem com campos solicitados.
import { InMemoryQuartoRepository } from '../infra/repositories/InMemoryQuartoRepository.js';
import { CadastrarQuarto } from '../application/quartos/use-cases/CadastrarQuarto.js';
import { EditarQuarto } from '../application/quartos/use-cases/EditarQuarto.js';
import { ListarQuartos } from '../application/quartos/use-cases/ListarQuartos.js';
import { TipoQuarto } from '../domain/enums/TipoQuarto.js';
import { TipoCama } from '../domain/enums/TipoCama.js';
import { Disponibilidade } from '../domain/enums/Disponibilidade.js';

async function main() {
  const repo = new InMemoryQuartoRepository();
  const cadastrar = new CadastrarQuarto(repo);
  const editar = new EditarQuarto(repo);
  const listar = new ListarQuartos(repo);

  // Cadastro de quarto
  const q1 = await cadastrar.execute({
    numero: 101,
    capacidade: 2,
    tipo: TipoQuarto.BASICO,
    precoHora: 50.0,
    frigobar: true,
    cafeManha: false,
    arCondicionado: true,
    tv: true,
    camas: [TipoCama.SOLTEIRO, TipoCama.SOLTEIRO],
  });

  // Cadastro de outro quarto
  const q2 = await cadastrar.execute({
    numero: 202,
    capacidade: 3,
    tipo: TipoQuarto.LUXO,
    precoHora: 150.5,
    frigobar: true,
    cafeManha: true,
    arCondicionado: true,
    tv: true,
    camas: [TipoCama.CASAL_KING, TipoCama.SOLTEIRO],
  });

  // Edição de quarto: atualizar preço e comodidades
  await editar.execute({ id: q1.id!, precoHora: 55.75, cafeManha: true });

  // Simular mudança de disponibilidade
  q2.alterarDisponibilidade(Disponibilidade.MANUTENCAO);
  await repo.atualizar(q2);

  // Listagem
  const lista = await listar.execute();
  console.table(lista);
}

main().catch(err => {
  console.error('Erro no demo:', err);
  process.exit(1);
});
