import { ApiStatus } from './api-status';

export class ApiError extends Error {
  constructor(
    public override message: string,
    public statusCode: ApiStatus //number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
