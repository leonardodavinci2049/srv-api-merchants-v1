export class FieldValidations {
  constructor(public errors: string[] = []) {}

  isRequired(
    value: string | unknown[] | undefined | null,
    message: string,
  ): void {
    if (!value || value.length <= 0) {
      this.errors.push(message);
    }
  }

  hasMinLen = (
    value: string | unknown[],
    min: number,
    message: string,
  ): void => {
    if (!value || value.length < min) {
      this.errors.push(message);
    }
  };

  hasMaxLen = (
    value: string | unknown[],
    max: number,
    message: string,
  ): void => {
    if (!value || value.length > max) {
      this.errors.push(message);
    }
  };

  isFixedLen = (
    value: string | unknown[],
    len: number,
    message: string,
  ): void => {
    if (value.length !== len) {
      this.errors.push(message);
    }
  };

  isEmail = (value: string, message: string): void => {
    const reg = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
    if (!reg.test(value)) {
      this.errors.push(message);
    }
  };

  isNotNull = (
    value: string | unknown[] | null | undefined,
    message: string,
  ): void => {
    if (!value?.length) {
      this.errors.push(message);
    }
  };

  isGreaterThan = (valuea: number, valueb: number, message: string): void => {
    if (valuea > valueb) {
      this.errors.push(message);
    }
  };

  clear() {
    this.errors = [];
  }

  isValid() {
    return this.errors.length === 0;
  }
}
