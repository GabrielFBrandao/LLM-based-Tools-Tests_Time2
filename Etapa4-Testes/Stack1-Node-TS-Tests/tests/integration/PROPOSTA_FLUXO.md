# Proposta de Testes de Integração

Fluxo: Cadastro de hóspede → Criação de reserva → Atualização de disponibilidade do quarto

Pré-condições
- Utilizar repositórios em memória para Hóspedes, Quartos e Reservas (similares a InMemoryQuartoRepository).
- Disponibilidade inicial do quarto: LIVRE.
- Regras de domínio de CPF/Email válidos e datas/horários de reserva válidos.

Cenário principal (happy path)
1) Cadastrar hóspede: nome, CPF e Email válidos → retorna id.
2) Cadastrar quarto (se ainda não houver): usando o caso de uso CadastrarQuarto.
3) Criar reserva: vincular id do hóspede e id do quarto; definir período válido (check-in/check-out) → retorna reserva criada.
4) Atualizar disponibilidade do quarto: ao criar a reserva, o caso de uso de Reserva deve setar o quarto como RESERVADO/OCUPADO.

Assertivas
- Hóspede criado com id e VO (CPF/Email) válidos.
- Reserva criada com vínculo correto (hóspede/quarto), totais coerentes com PrecoHora do quarto (se houver cálculo), e período consistente.
- Quarto com disponibilidade atualizada (não LIVRE) após a reserva.
- Listagem de quartos não deve considerar quartos inativos ou com disponibilidade inadequada para novos check-ins.

Casos adicionais
- Não deve criar reserva se: quarto não está LIVRE (RESERVADO/OCUPADO) → erro de negócio.
- Não deve criar reserva se: hóspede não encontrado → NotFoundError.
- Cancelamento de reserva: deve reverter disponibilidade do quarto para LIVRE.
- Conflito de sobreposição de horários para o mesmo quarto → erro.

Notas de implementação
- O teste de integração pode ser implementado após existirem os casos de uso e repositórios correspondentes (HospedeRepository, ReservaRepository, casos de uso de CriarReserva e CancelarReserva). Aqui fica o plano detalhado para quando os componentes estiverem disponíveis.
