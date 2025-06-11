export class Price {
  private static readonly SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_PRICE = 1000000;

  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string) {
    this.validateAmount(amount);
    this.validateCurrency(currency);
    
    this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this._currency = currency.toUpperCase();
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public isZero(): boolean {
    return this._amount === 0;
  }

  public isNegotiable(): boolean {
    return this._amount === 0; // Zero price indicates negotiable
  }

  public equals(other: Price): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  public compare(other: Price): number {
    if (this._currency !== other._currency) {
      throw new Error('Cannot compare prices with different currencies');
    }
    return this._amount - other._amount;
  }

  public isGreaterThan(other: Price): boolean {
    return this.compare(other) > 0;
  }

  public isLessThan(other: Price): boolean {
    return this.compare(other) < 0;
  }

  public add(other: Price): Price {
    if (this._currency !== other._currency) {
      throw new Error('Cannot add prices with different currencies');
    }
    return new Price(this._amount + other._amount, this._currency);
  }

  public multiply(factor: number): Price {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    return new Price(this._amount * factor, this._currency);
  }

  public format(): string {
    if (this.isNegotiable()) {
      return 'Negotiable';
    }
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this._currency,
    });
    
    return formatter.format(this._amount);
  }

  public toString(): string {
    return this.format();
  }

  public toJSON(): { amount: number; currency: string } {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Price amount must be a valid number');
    }

    if (amount < Price.MIN_PRICE) {
      throw new Error(`Price amount cannot be less than ${Price.MIN_PRICE}`);
    }

    if (amount > Price.MAX_PRICE) {
      throw new Error(`Price amount cannot be greater than ${Price.MAX_PRICE}`);
    }
  }

  private validateCurrency(currency: string): void {
    if (!currency || typeof currency !== 'string') {
      throw new Error('Currency must be a valid string');
    }

    if (!Price.SUPPORTED_CURRENCIES.includes(currency.toUpperCase())) {
      throw new Error(`Currency '${currency}' is not supported. Supported currencies: ${Price.SUPPORTED_CURRENCIES.join(', ')}`);
    }
  }

  public static create(amount: number, currency: string): Price {
    return new Price(amount, currency);
  }

  public static negotiable(): Price {
    return new Price(0, 'USD');
  }

  public static fromJSON(data: { amount: number; currency: string }): Price {
    return new Price(data.amount, data.currency);
  }
} 