export class ApiError extends Error {
  constructor(
    public override message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
