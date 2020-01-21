export class LogicException extends Error {
  private readonly _errorId?: string;
  private readonly _name: string = 'LogicException';
  private readonly _message: string;

  constructor(message: string, errorId?: string) {
    super();
    this._message = message;
    this._errorId = errorId;
  }

  get errorId() {
    return this._errorId;
  }

  get name() {
    return this._name;
  }

  get message() {
    return this._message;
  }

  plainObject() {
    return { message: this.message, name: this.name, errorId: this.errorId };
  }
}
