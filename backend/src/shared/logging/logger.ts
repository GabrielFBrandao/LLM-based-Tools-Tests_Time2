/**
 * Sistema de Logging Estruturado
 * 
 * Decisão: Usar Winston por ser:
 * - Logging estruturado (JSON)
 * - Múltiplos transports
 * - Níveis de log configuráveis
 * - Amplamente usado na indústria
 */

import winston from 'winston';

// ============================================
// NÍVEIS DE LOG
// ============================================
/**
 * Níveis de severidade (RFC 5424)
 * error: 0 - Erros que precisam atenção imediata
 * warn: 1 - Avisos que podem indicar problemas
 * info: 2 - Informações gerais sobre operações
 * http: 3 - Logs de requisições HTTP
 * debug: 4 - Informações detalhadas para debugging
 */

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ============================================
// FORMATO DE LOG
// ============================================

/**
 * Formato estruturado em JSON
 * Decisão: JSON para facilitar parsing e análise
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Formato legível para desenvolvimento
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// ============================================
// TRANSPORTS
// ============================================

const transports: winston.transport[] = [];

// Console (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Arquivo - Todos os logs
transports.push(
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: jsonFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  })
);

// Arquivo - Apenas erros
transports.push(
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: jsonFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  })
);

// ============================================
// LOGGER PRINCIPAL
// ============================================

export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  transports,
  exitOnError: false,
});

// ============================================
// FUNÇÕES DE LOG ESTRUTURADO
// ============================================

/**
 * Log de requisição HTTP
 */
export function logHttpRequest(data: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId?: number;
  ip?: string;
}) {
  logger.http('HTTP Request', {
    type: 'http_request',
    ...data,
  });
}

/**
 * Log de erro HTTP
 */
export function logHttpError(data: {
  method: string;
  url: string;
  statusCode: number;
  error: string;
  stack?: string;
  userId?: number;
}) {
  logger.error('HTTP Error', {
    type: 'http_error',
    ...data,
  });
}

/**
 * Log de operação de banco de dados
 */
export function logDatabaseOperation(data: {
  operation: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  duration: number;
  success: boolean;
  error?: string;
}) {
  const level = data.success ? 'debug' : 'error';
  logger.log(level, 'Database Operation', {
    type: 'db_operation',
    ...data,
  });
}

/**
 * Log de operação de cache
 */
export function logCacheOperation(data: {
  operation: 'get' | 'set' | 'delete' | 'invalidate';
  key: string;
  hit?: boolean;
  duration: number;
}) {
  logger.debug('Cache Operation', {
    type: 'cache_operation',
    ...data,
  });
}

/**
 * Log de operação de negócio
 */
export function logBusinessOperation(data: {
  operation: string;
  entity: string;
  entityId?: number;
  userId?: number;
  success: boolean;
  details?: any;
}) {
  logger.info('Business Operation', {
    type: 'business_operation',
    ...data,
  });
}

/**
 * Log de erro de validação
 */
export function logValidationError(data: {
  field: string;
  value: any;
  error: string;
  context?: string;
}) {
  logger.warn('Validation Error', {
    type: 'validation_error',
    ...data,
  });
}

/**
 * Log de autenticação
 */
export function logAuthentication(data: {
  action: 'login' | 'logout' | 'token_refresh' | 'failed_login';
  userId?: number;
  email?: string;
  ip?: string;
  success: boolean;
  reason?: string;
}) {
  logger.info('Authentication', {
    type: 'authentication',
    ...data,
  });
}

/**
 * Log de mudança de estado
 */
export function logStateChange(data: {
  entity: string;
  entityId: number;
  field: string;
  oldValue: any;
  newValue: any;
  userId?: number;
}) {
  logger.info('State Change', {
    type: 'state_change',
    ...data,
  });
}

/**
 * Log de erro crítico
 */
export function logCriticalError(data: {
  error: string;
  stack?: string;
  context?: any;
}) {
  logger.error('Critical Error', {
    type: 'critical_error',
    severity: 'critical',
    ...data,
  });
}

/**
 * Log de performance
 */
export function logPerformance(data: {
  operation: string;
  duration: number;
  threshold: number;
  exceeded: boolean;
}) {
  const level = data.exceeded ? 'warn' : 'debug';
  logger.log(level, 'Performance', {
    type: 'performance',
    ...data,
  });
}

// ============================================
// MIDDLEWARE DE LOGGING
// ============================================

/**
 * Middleware para logar requisições HTTP
 */
export function loggingMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip || req.connection.remoteAddress,
    };

    if (res.statusCode >= 400) {
      logHttpError({
        ...logData,
        error: res.locals.error || 'Unknown error',
        stack: res.locals.stack,
      });
    } else {
      logHttpRequest(logData);
    }
  });

  next();
}

// ============================================
// EXEMPLOS DE USO
// ============================================

/**
 * Exemplo: Log de criação de quarto
 * 
 * logBusinessOperation({
 *   operation: 'create',
 *   entity: 'quarto',
 *   entityId: 101,
 *   userId: 1,
 *   success: true,
 *   details: { numero: 101, tipo: 'MODERNO' }
 * });
 */

/**
 * Exemplo: Log de mudança de status
 * 
 * logStateChange({
 *   entity: 'quarto',
 *   entityId: 101,
 *   field: 'status',
 *   oldValue: 'LIVRE',
 *   newValue: 'OCUPADO',
 *   userId: 1
 * });
 */

/**
 * Exemplo: Log de erro de validação
 * 
 * logValidationError({
 *   field: 'cpf',
 *   value: '000.000.000-00',
 *   error: 'CPF inválido',
 *   context: 'cadastro_hospede'
 * });
 */
