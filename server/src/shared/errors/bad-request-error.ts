export class BadRequestError extends Error {
  statusCode: number
  constructor(message: string) {
    super(message)
    this.name = 'BadRequestError'
    this.message = message ?? 'Bad Request'
    this.statusCode = 400
  }
}