// Exemplo de uso das classes do sistema de reserva de hotel

import {
  Quarto,
  Hospede,
  Reserva,
  Endereco,
  Periodo,
  TipoQuarto,
  StatusQuarto,
  TipoCama,
  StatusReserva,
  MetodoPagamento
} from '../domain';

// Função principal de demonstração
async function demonstrarSistema() {
  console.log('=== Sistema de Reserva de Hotel - Demonstração ===\n');

  // 1. Criando um hóspede
  console.log('1. Criando hóspede...');
  const endereco = new Endereco(
    'Rua das Flores',
    '123',
    'Apto 45',
    'Centro',
    'São Paulo',
    'SP',
    '01234-567'
  );

  const hospede = Hospede.criar(
    'João',
    'Silva',
    '123.456.789-00',
    'joao.silva@email.com',
    '(11) 98765-4321',
    endereco
  );

  console.log(`Hóspede criado: ${hospede.nomeCompleto}`);
  console.log(`CPF: ${hospede.cpfFormatado}`);
  console.log(`E-mail: ${hospede.email}`);
  console.log(`Telefone: ${hospede.telefoneFormatado}`);
  console.log(`Endereço: ${endereco.enderecoCompleto}\n`);

  // 2. Criando um quarto
  console.log('2. Criando quarto...');
  let quarto = Quarto.criar(
    '101',
    2,
    TipoQuarto.LUXO,
    350.00,
    true, // minibar
    true, // café da manhã
    true, // ar condicionado
    true  // TV
  );

  // Adicionando camas ao quarto
  quarto = quarto.adicionarCama(TipoCama.CASAL_KING);
  console.log(`Quarto criado: ${quarto.numero}`);
  console.log(`Tipo: ${quarto.getTipoDescricao()}`);
  console.log(`Capacidade: ${quarto.capacidade} pessoas`);
  console.log(`Preço: ${quarto.getPrecoFormatado()} por noite`);
  console.log(`Comodidades: ${quarto.getComodidades().join(', ')}`);
  console.log(`Camas: ${quarto.camas.map(c => c.getDescricao()).join(', ')}\n`);

  // 3. Criando uma reserva
  console.log('3. Criando reserva...');
  const periodo = new Periodo(
    new Date('2025-03-10'),
    new Date('2025-03-15')
  );

  let reserva = Reserva.criar(hospede, quarto, periodo);
  console.log(`Reserva criada: ${reserva.codigoReserva}`);
  console.log(`Período: ${reserva.periodo.getPeriodoFormatado()}`);
  console.log(`Número de noites: ${reserva.periodo.getNumeroNoites()}`);
  console.log(`Valor total: ${reserva.getValorTotalFormatado()}`);
  console.log(`Status: ${reserva.getStatusDescricao()}\n`);

  // 4. Adicionando hóspedes adicionais
  console.log('4. Adicionando hóspedes adicionais...');
  const hospede2 = Hospede.criar(
    'Maria',
    'Silva',
    '987.654.321-00',
    'maria.silva@email.com'
  );

  reserva = reserva.adicionarHospede(hospede2);
  console.log(`Hóspedes adicionais: ${reserva.hospedesAdicionais.length}`);
  console.log(`Total de hóspedes: ${reserva.getNumeroTotalHospedes()}`);
  console.log(`Novo valor total: ${reserva.getValorTotalFormatado()}\n`);

  // 5. Confirmando a reserva
  console.log('5. Confirmando reserva...');
  reserva = reserva.confirmar();
  console.log(`Status atualizado: ${reserva.getStatusDescricao()}\n`);

  // 6. Simulando check-in
  console.log('6. Simulando check-in...');
  // Para simular, vamos ajustar a data para hoje
  const hoje = new Date();
  const periodoCheckIn = new Periodo(
    new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
    new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2)
  );

  reserva = Reserva.criar(hospede, quarto, periodoCheckIn);
  reserva = reserva.confirmar();
  reserva = reserva.realizarCheckIn();
  console.log(`Check-in realizado em: ${reserva.dataCheckIn?.toLocaleString('pt-BR')}`);
  console.log(`Status: ${reserva.getStatusDescricao()}\n`);

  // 7. Adicionando pagamentos
  console.log('7. Adicionando pagamentos...');
  const { Pagamento } = await import('../domain/entities/Pagamento');
  
  const pagamento1 = Pagamento.criar(reserva.valorTotal * 0.5, MetodoPagamento.CARTAO_CREDITO);
  const pagamento1Processado = pagamento1.processar('TXN_123456');
  reserva = reserva.adicionarPagamento(pagamento1Processado);

  const pagamento2 = Pagamento.criar(reserva.getValorRestante(), MetodoPagamento.PIX);
  const pagamento2Processado = pagamento2.processar('PIX_789012');
  reserva = reserva.adicionarPagamento(pagamento2Processado);

  console.log(`Pagamentos realizados: ${reserva.pagamentos.length}`);
  console.log(`Valor pago: ${reserva.getValorPagoFormatado()}`);
  console.log(`Valor restante: ${reserva.getValorRestanteFormatado()}`);
  console.log(`Reserva totalmente paga: ${reserva.estaTotalmentePaga()}\n`);

  // 8. Simulando check-out
  console.log('8. Simulando check-out...');
  reserva = reserva.realizarCheckOut();
  console.log(`Check-out realizado em: ${reserva.dataCheckOut?.toLocaleString('pt-BR')}`);
  console.log(`Status final: ${reserva.getStatusDescricao()}`);
  console.log(`Reserva finalizada: ${reserva.estaFinalizada()}\n`);

  // 9. Exemplo de validações e erros
  console.log('9. Testando validações...');
  try {
    // Tentando criar quarto sem camas
    const quartoInvalido = Quarto.criar('102', 1, TipoQuarto.BASICO, 150.00);
  } catch (error) {
    console.log(`✓ Validação de quarto sem camas: ${error.message}`);
  }

  try {
    // Tentando criar hóspede com CPF inválido
    const hospedeInvalido = Hospede.criar('Teste', 'Erro', '123', 'invalido@email.com');
  } catch (error) {
    console.log(`✓ Validação de CPF inválido: ${error.message}`);
  }

  try {
    // Tentando criar período com check-out anterior ao check-in
    const periodoInvalido = new Periodo(
      new Date('2025-03-15'),
      new Date('2025-03-10')
    );
  } catch (error) {
    console.log(`✓ Validação de período inválido: ${error.message}`);
  }

  try {
    // Tentando fazer check-in em reserva não confirmada
    const reservaPendente = Reserva.criar(hospede, quarto, periodo);
    reservaPendente.realizarCheckIn();
  } catch (error) {
    console.log(`✓ Validação de check-in em reserva pendente: ${error.message}`);
  }

  console.log('\n=== Demonstração concluída com sucesso! ===');
}

// Exportando a função para uso em outros arquivos
export { demonstrarSistema };

// Executando a demonstração se este arquivo for executado diretamente
if (require.main === module) {
  demonstrarSistema().catch(console.error);
}
