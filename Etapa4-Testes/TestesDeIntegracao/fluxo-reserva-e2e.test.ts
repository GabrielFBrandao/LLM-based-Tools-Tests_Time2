/**
 * Testes End-to-End (E2E) - Fluxo Completo de Reserva
 * 
 * Testes E2E simulando interação real do usuário através da UI completa
 * 
 * Princípios de Teste E2E aplicados:
 * - Simulação real de usuário com Cypress/Playwright
 * - Navegação entre páginas
 * - Interação com elementos reais da UI
 * - Validação de estados persistentes
 * - Testes de performance real
 * 
 * Cenários cobertos:
 * - Fluxo completo do início ao fim
 * - Navegação e persistência de estado
 * - Performance em condições reais
 * - Tratamento de erros em produção
 * - Experiência do usuário final
 */

import { test, expect } from '@playwright/test';

// Configuração de dados de teste
const dadosTeste = {
  hospede: {
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    dataNascimento: '01/01/1990',
    endereco: {
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    }
  },
  quarto: {
    numero: '101',
    tipo: 'Básico',
    capacidade: 2,
    precoPorNoite: 150.00
  },
  reserva: {
    dataCheckIn: '01/12/2024',
    dataCheckOut: '03/12/2024',
    valorTotal: 300.00
  }
};

test.describe('Fluxo E2E: Cadastro Hóspede → Reserva → Disponibilidade', () => {
  test.beforeEach(async ({ page }) => {
    // Configuração inicial
    await page.goto('/');
    
    // Mock das APIs (em ambiente real, seria sem mocks)
    await page.route('**/api/hospedes', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'hospede-123',
            ...dadosTeste.hospede,
            createdAt: new Date().toISOString()
          })
        });
      }
    });

    await page.route('**/api/quartos/disponiveis', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'quarto-123',
            numero: dadosTeste.quarto.numero,
            tipo: dadosTeste.quarto.tipo,
            capacidade: dadosTeste.quarto.capacidade,
            precoPorNoite: dadosTeste.quarto.precoPorNoite,
            status: 'DISPONIVEL',
            camas: [
              { id: 'cama-1', tipo: 'CASAL_QUEEN', capacidade: 2 }
            ]
          }
        ])
      });
    });

    await page.route('**/api/reservas', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'reserva-123',
            hospedeId: 'hospede-123',
            quartoId: 'quarto-123',
            dataCheckIn: '2024-12-01',
            dataCheckOut: '2024-12-03',
            status: 'CONFIRMADA',
            valorTotal: dadosTeste.reserva.valorTotal,
            createdAt: new Date().toISOString()
          })
        });
      }
    });

    await page.route('**/api/quartos/*/status', route => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'quarto-123',
            status: 'OCUPADO',
            updatedAt: new Date().toISOString()
          })
        });
      }
    });
  });

  /**
   * Teste E2E: Fluxo completo com sucesso
   * 
   * Cenário: Usuário navega por todo o fluxo desde o início
   * Resultado esperado: Experiência completa, todos os passos funcionando
   */
  test('deve completar fluxo de reserva com sucesso', async ({ page }) => {
    // Step 1: Acessar página de cadastro de hóspede
    await page.click('[data-testid="nav-hospedes"]');
    await page.click('[data-testid="btn-novo-hospede"]');
    
    // Verifica página carregou
    await expect(page.locator('h1')).toContainText('Cadastrar Hóspede');
    await expect(page.locator('[data-testid="form-hospede"]')).toBeVisible();

    // Step 2: Preencher dados do hóspede
    await page.fill('[data-testid="input-nome"]', dadosTeste.hospede.nome);
    await page.fill('[data-testid="input-email"]', dadosTeste.hospede.email);
    await page.fill('[data-testid="input-telefone"]', dadosTeste.hospede.telefone);
    await page.fill('[data-testid="input-cpf"]', dadosTeste.hospede.cpf);
    await page.fill('[data-testid="input-data-nascimento"]', dadosTeste.hospede.dataNascimento);
    
    // Endereço
    await page.fill('[data-testid="input-rua"]', dadosTeste.hospede.endereco.rua);
    await page.fill('[data-testid="input-numero"]', dadosTeste.hospede.endereco.numero);
    await page.fill('[data-testid="input-bairro"]', dadosTeste.hospede.endereco.bairro);
    await page.fill('[data-testid="input-cidade"]', dadosTeste.hospede.endereco.cidade);
    await page.selectOption('[data-testid="select-estado"]', dadosTeste.hospede.endereco.estado);
    await page.fill('[data-testid="input-cep"]', dadosTeste.hospede.endereco.cep);

    // Step 3: Submeter cadastro
    await page.click('[data-testid="btn-salvar-hospede"]');
    
    // Verifica sucesso
    await expect(page.locator('[data-testid="alert-success"]')).toContainText('Hóspede cadastrado com sucesso');
    
    // Step 4: Navegar para quartos disponíveis
    await page.click('[data-testid="nav-quartos"]');
    await page.click('[data-testid="btn-ver-disponiveis"]');
    
    // Verifica lista de quartos
    await expect(page.locator('[data-testid="lista-quartos"]')).toBeVisible();
    await expect(page.locator('[data-testid="quarto-card-101"]')).toContainText('Quarto 101');
    await expect(page.locator('[data-testid="quarto-card-101"]')).toContainText('R$ 150,00/noite');

    // Step 5: Selecionar quarto
    await page.click('[data-testid="btn-selecionar-quarto-101"]');
    
    // Verifica navegação para reserva
    await expect(page.locator('h1')).toContainText('Criar Reserva');
    await expect(page.locator('[data-testid="quarto-selecionado"]')).toContainText('Quarto 101');

    // Step 6: Preencher dados da reserva
    await page.fill('[data-testid="input-checkin"]', dadosTeste.reserva.dataCheckIn);
    await page.fill('[data-testid="input-checkout"]', dadosTeste.reserva.dataCheckOut);
    
    // Verifica cálculo automático do valor
    await expect(page.locator('[data-testid="valor-total"]')).toContainText('R$ 300,00');

    // Step 7: Confirmar reserva
    await page.click('[data-testid="btn-confirmar-reserva"]');
    
    // Verifica confirmação
    await expect(page.locator('[data-testid="reserva-confirmada"]')).toBeVisible();
    await expect(page.locator('[data-testid="reserva-detalhes"]')).toContainText('Reserva #123');
    await expect(page.locator('[data-testid="reserva-detalhes"]')).toContainText('João Silva');
    await expect(page.locator('[data-testid="reserva-detalhes"]')).toContainText('Quarto 101');
    await expect(page.locator('[data-testid="reserva-detalhes"]')).toContainText('R$ 300,00');

    // Step 8: Verificar atualização de disponibilidade
    await page.click('[data-testid="nav-quartos"]');
    await page.click('[data-testid="btn-ver-disponiveis"]');
    
    // Verifica que quarto não aparece mais como disponível
    await expect(page.locator('[data-testid="quarto-card-101"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="mensagem-sem-quartos"]')).toContainText('Nenhum quarto disponível');
  });

  /**
   * Teste E2E: Validação de formulário em tempo real
   * 
   * Cenário: Usuário comete erros durante o preenchimento
   * Resultado esperado: Validações em tempo real, mensagens claras
   */
  test('deve validar formulários em tempo real', async ({ page }) => {
    await page.goto('/hospedes/novo');
    
    // Teste validação de email
    await page.fill('[data-testid="input-email"]', 'email-invalido');
    await page.tab(); // Sair do campo
    await expect(page.locator('[data-testid="error-email"]')).toContainText('Email inválido');
    
    // Teste validação de CPF
    await page.fill('[data-testid="input-cpf"]', '123');
    await page.tab();
    await expect(page.locator('[data-testid="error-cpf"]')).toContainText('CPF incompleto');
    
    // Teste validação de datas
    await page.fill('[data-testid="input-data-nascimento"]', '01/01/2025'); // Futuro
    await page.tab();
    await expect(page.locator('[data-testid="error-data-nascimento"]')).toContainText('Data inválida');
    
    // Corrige os erros
    await page.fill('[data-testid="input-email"]', dadosTeste.hospede.email);
    await page.fill('[data-testid="input-cpf"]', dadosTeste.hospede.cpf);
    await page.fill('[data-testid="input-data-nascimento"]', dadosTeste.hospede.dataNascimento);
    
    // Verifica que erros sumiram
    await expect(page.locator('[data-testid="error-email"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="error-cpf"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="error-data-nascimento"]')).not.toBeVisible();
  });

  /**
   * Teste E2E: Tratamento de erro de API
   * 
   * Cenário: API retorna erro durante o fluxo
   * Resultado esperado: Mensagem amigável, opção de retry
   */
  test('deve tratar erros de API gracefulmente', async ({ page }) => {
    // Configura mock para simular erro
    await page.route('**/api/hospedes', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Erro interno do servidor',
          message: 'Tente novamente em alguns minutos'
        })
      });
    });

    await page.goto('/hospedes/novo');
    
    // Preenche formulário
    await page.fill('[data-testid="input-nome"]', dadosTeste.hospede.nome);
    await page.fill('[data-testid="input-email"]', dadosTeste.hospede.email);
    await page.fill('[data-testid="input-cpf"]', dadosTeste.hospede.cpf);
    
    // Tenta salvar
    await page.click('[data-testid="btn-salvar-hospede"]');
    
    // Verifica tratamento de erro
    await expect(page.locator('[data-testid="alert-error"]')).toContainText('Erro ao cadastrar hóspede');
    await expect(page.locator('[data-testid="btn-retry"]')).toBeVisible();
    
    // Teste retry
    await page.unroute('**/api/hospedes');
    await page.route('**/api/hospedes', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'hospede-123',
          ...dadosTeste.hospede
        })
      });
    });
    
    await page.click('[data-testid="btn-retry"]');
    
    // Verifica sucesso após retry
    await expect(page.locator('[data-testid="alert-success"]')).toContainText('Hóspede cadastrado com sucesso');
  });

  /**
   * Teste E2E: Performance do fluxo
   * 
   * Cenário: Usuário com conexão lenta
   * Resultado esperado: Loading states, feedback visual, timeout adequado
   */
  test('deve handle performance adequadamente', async ({ page }) => {
    // Simula conexão lenta
    await page.route('**/api/quartos/disponiveis', route => {
      // Delay de 3 segundos
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'quarto-123',
              numero: '101',
              tipo: 'Básico',
              capacidade: 2,
              precoPorNoite: 150.00,
              status: 'DISPONIVEL'
            }
          ])
        });
      }, 3000);
    });

    await page.goto('/quartos/disponiveis');
    
    // Verifica loading state
    await expect(page.locator('[data-testid="loading-quartos"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-quartos"]')).toContainText('Carregando quartos...');
    
    // Aguarda carregamento
    await expect(page.locator('[data-testid="lista-quartos"]')).toBeVisible({ timeout: 5000 });
    
    // Verifica que loading sumiu
    await expect(page.locator('[data-testid="loading-quartos"]')).not.toBeVisible();
  });

  /**
   * Teste E2E: Acessibilidade
   * 
   * Cenário: Usuário com navegação por teclado
   * Resultado esperado: Navegação completa por teclado, leitor de tela
   */
  test('deve ser acessível por teclado', async ({ page }) => {
    await page.goto('/hospedes/novo');
    
    // Navegação por tab
    await page.keyboard.press('Tab'); // Primeiro campo
    await expect(page.locator('[data-testid="input-nome"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="input-email"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="input-telefone"]:focus')).toBeVisible();
    
    // Preenchimento por teclado
    await page.keyboard.type(dadosTeste.hospede.nome);
    await page.keyboard.press('Tab');
    await page.keyboard.type(dadosTeste.hospede.email);
    
    // Navega até botão e ativa por Enter
    while (await page.locator('[data-testid="btn-salvar-hospede"]:focus').count() === 0) {
      await page.keyboard.press('Tab');
    }
    
    await page.keyboard.press('Enter');
    
    // Verifica que formulário foi submetido
    await expect(page.locator('[data-testid="alert-success"]')).toBeVisible();
  });

  /**
   * Teste E2E: Responsividade
   * 
   * Cenário: Usuário em dispositivos móveis
   * Resultado esperado: Layout adaptado, usabilidade mantida
   */
  test('deve ser responsivo em mobile', async ({ page }) => {
    // Simula dispositivo mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verifica menu mobile
    await expect(page.locator('[data-testid="menu-mobile-toggle"]')).toBeVisible();
    await page.click('[data-testid="menu-mobile-toggle"]');
    await expect(page.locator('[data-testid="menu-mobile"]')).toBeVisible();
    
    // Navega pelo menu mobile
    await page.click('[data-testid="nav-hospedes-mobile"]');
    await expect(page.locator('h1')).toContainText('Hóspedes');
    
    // Verifica layout mobile do formulário
    await page.click('[data-testid="btn-novo-hospede"]');
    await expect(page.locator('[data-testid="form-hospede-mobile"]')).toBeVisible();
    
    // Preenche formulário em mobile
    await page.fill('[data-testid="input-nome"]', dadosTeste.hospede.nome);
    await page.fill('[data-testid="input-email"]', dadosTeste.hospede.email);
    
    // Verifica que botão está visível e acessível
    await expect(page.locator('[data-testid="btn-salvar-hospede"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-salvar-hospede"]')).toBeInViewport();
  });
});

test.describe('Fluxo E2E - Casos de Borda e Erro', () => {
  /**
   * Teste E2E: Concorrência de reservas
   * 
   * Cenário: Dois usuários tentam reservar mesmo quarto
   * Resultado esperado: Apenas um sucesso, mensagem de conflito para outro
   */
  test('deve handle concorrência de reservas', async ({ page, context }) => {
    // Configura mock para simular concorrência
    let tentativas = 0;
    await page.route('**/api/reservas', route => {
      tentativas++;
      if (tentativas === 1) {
        // Primeira tentativa falha
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Conflito de reserva',
            message: 'Quarto já reservado para este período'
          })
        });
      } else {
        // Segunda tentativa sucesso
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'reserva-456',
            status: 'CONFIRMADA'
          })
        });
      }
    });

    await page.goto('/reservas/nova');
    
    // Seleciona quarto
    await page.click('[data-testid="btn-selecionar-quarto-101"]');
    await page.fill('[data-testid="input-checkin"]', '01/12/2024');
    await page.fill('[data-testid="input-checkout"]', '03/12/2024');
    
    // Primeira tentativa
    await page.click('[data-testid="btn-confirmar-reserva"]');
    
    // Verifica erro de conflito
    await expect(page.locator('[data-testid="alert-error"]')).toContainText('Quarto já reservado');
    
    // Tenta novamente com outro quarto
    await page.click('[data-testid="btn-tentar-novamente"]');
    await page.click('[data-testid="btn-selecionar-quarto-102"]');
    await page.click('[data-testid="btn-confirmar-reserva"]');
    
    // Verifica sucesso na segunda tentativa
    await expect(page.locator('[data-testid="reserva-confirmada"]')).toBeVisible();
  });

  /**
   * Teste E2E: Sessão expirada
   * 
   * Cenário: Usuário inativo por muito tempo
   * Resultado esperado: Redirecionamento para login, preservação de dados
   */
  test('deve handle sessão expirada', async ({ page }) => {
    await page.goto('/hospedes/novo');
    
    // Preenche parte do formulário
    await page.fill('[data-testid="input-nome"]', dadosTeste.hospede.nome);
    await page.fill('[data-testid="input-email"]', dadosTeste.hospede.email);
    
    // Simula expiração de sessão
    await page.route('**/api/hospedes', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Sessão expirada',
          message: 'Por favor, faça login novamente'
        })
      });
    });
    
    // Tenta salvar
    await page.click('[data-testid="btn-salvar-hospede"]');
    
    // Verifica redirecionamento
    await expect(page).toHaveURL('/login');
    
    // Verifica mensagem de sessão expirada
    await expect(page.locator('[data-testid="alert-warning"]')).toContainText('Sessão expirada');
    
    // Após login, verificar que dados foram preservados
    await page.fill('[data-testid="input-username"]', 'test@example.com');
    await page.fill('[data-testid="input-password"]', 'password');
    await page.click('[data-testid="btn-login"]');
    
    // Verifica redirecionamento de volta com dados preservados
    await expect(page).toHaveURL('/hospedes/novo');
    await expect(page.locator('[data-testid="input-nome"]')).toHaveValue(dadosTeste.hospede.nome);
    await expect(page.locator('[data-testid="input-email"]')).toHaveValue(dadosTeste.hospede.email);
  });

  /**
   * Teste E2E: Offline/Online
   * 
   * Cenário: Conexão perdida durante o fluxo
   * Resultado esperado: Modo offline, sync quando voltar online
   */
  test('deve handle modo offline', async ({ page }) => {
    await page.goto('/hospedes/novo');
    
    // Preenche formulário
    await page.fill('[data-testid="input-nome"]', dadosTeste.hospede.nome);
    await page.fill('[data-testid="input-email"]', dadosTeste.hospede.email);
    await page.fill('[data-testid="input-cpf"]', dadosTeste.hospede.cpf);
    
    // Simula offline
    await page.setOffline(true);
    
    // Tenta salvar
    await page.click('[data-testid="btn-salvar-hospede"]');
    
    // Verifica modo offline
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-warning"]')).toContainText('Você está offline');
    
    // Verifica que dados foram salvos localmente
    await expect(page.locator('[data-testid="dados-salvos-localmente"]')).toBeVisible();
    
    // Simula volta online
    await page.setOffline(false);
    
    // Verifica sync automático
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-success"]')).toContainText('Dados sincronizados');
  });
});

test.describe('Fluxo E2E - Performance e Monitoramento', () => {
  /**
   * Teste E2E: Performance de carregamento
   * 
   * Cenário: Usuário com dispositivo lento
   * Resultado esperado: Métricas de performance aceitáveis
   */
  test('deve atender métricas de performance', async ({ page }) => {
    // Inicia monitoramento de performance
    const navigationStart = Date.now();
    
    await page.goto('/');
    
    // Aguarda carregamento completo
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - navigationStart;
    
    // Verifica métricas
    expect(loadTime).toBeLessThan(3000); // 3 segundos máximo
    
    // Verifica Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.cls = entry.value;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });
    
    // Verifica se está dentro dos limites recomendados
    expect(metrics.lcp).toBeLessThan(2500); // 2.5s
    expect(metrics.fid).toBeLessThan(100);   // 100ms
    expect(metrics.cls).toBeLessThan(0.1);   // 0.1
  });

  /**
   * Teste E2E: Monitoramento de erros
   * 
   * Cenário: Erros JavaScript durante o fluxo
   * Resultado esperado: Captura de erros, relatório automático
   */
  test('deve monitorar erros JavaScript', async ({ page }) => {
    // Configura listener de erros
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Simula erro JavaScript
    await page.goto('/hospedes/novo');
    await page.evaluate(() => {
      throw new Error('Erro de teste');
    });
    
    // Verifica que erro foi capturado
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Erro de teste');
    
    // Verifica que não quebrou a UI
    await expect(page.locator('[data-testid="form-hospede"]')).toBeVisible();
  });
});
