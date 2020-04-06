export class BusinessLogicException extends Error {
  private readonly _errorId?: string;
  private readonly _name: string = 'BusinessLogicException';
  private readonly _message: string;

  constructor(message: string, errorId?: string) {
    super();
    this._message = message;
    this._errorId = errorId;
  }

  get errorId(): string | undefined {
    return this._errorId;
  }

  get name(): string {
    return this._name;
  }

  get message(): string {
    return this._message;
  }

  plainObject(): Pick<BusinessLogicException, 'message' | 'name' | 'errorId'> {
    return { message: this.message, name: this.name, errorId: this.errorId };
  }
}
