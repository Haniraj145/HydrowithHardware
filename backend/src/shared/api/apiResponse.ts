export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T
  ) {}

  static success<T>(message: string, data?: T) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string) {
    return {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}