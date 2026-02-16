// Erro base para domínio. Em produção, prefira error codes e i18n.
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
