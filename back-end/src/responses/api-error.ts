export class ApiError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    // console.log("ApiError: constructor.name", this.constructor.name);
  }
}
