export class NotificationContent {
  private readonly _title: string;
  private readonly _message: string;
  private readonly _imageUrl?: string;
  private readonly _actionUrl?: string;
  private readonly _actionText?: string;

  constructor(
    title: string,
    message: string,
    imageUrl?: string,
    actionUrl?: string,
    actionText?: string,
  ) {
    this.validateTitle(title);
    this.validateMessage(message);
    this.validateImageUrl(imageUrl);
    this.validateActionUrl(actionUrl);

    this._title = title.trim();
    this._message = message.trim();
    this._imageUrl = imageUrl?.trim();
    this._actionUrl = actionUrl?.trim();
    this._actionText = actionText?.trim();
  }

  get title(): string {
    return this._title;
  }

  get message(): string {
    return this._message;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
  }

  get actionUrl(): string | undefined {
    return this._actionUrl;
  }

  get actionText(): string | undefined {
    return this._actionText;
  }

  public hasAction(): boolean {
    return !!(this._actionUrl && this._actionText);
  }

  public hasImage(): boolean {
    return !!this._imageUrl;
  }

  public getPreview(maxLength: number = 100): string {
    if (this._message.length <= maxLength) {
      return this._message;
    }
    return this._message.substring(0, maxLength - 3) + '...';
  }

  public getWordCount(): number {
    return this._message.split(/\s+/).filter((word) => word.length > 0).length;
  }

  public getCharacterCount(): number {
    return this._message.length;
  }

  public isRich(): boolean {
    return this.hasImage() || this.hasAction();
  }

  public toEmailFormat(): { subject: string; body: string } {
    return {
      subject: this._title,
      body: this._message,
    };
  }

  public toSMSFormat(): string {
    // SMS format: title + message, truncated to 160 chars
    const combined = `${this._title}: ${this._message}`;
    return combined.length > 160
      ? combined.substring(0, 157) + '...'
      : combined;
  }

  public toPushFormat(): { title: string; body: string; imageUrl?: string } {
    return {
      title: this._title,
      body: this._message,
      imageUrl: this._imageUrl,
    };
  }

  public toWebhookFormat(): Record<string, any> {
    return {
      title: this._title,
      message: this._message,
      imageUrl: this._imageUrl,
      actionUrl: this._actionUrl,
      actionText: this._actionText,
    };
  }

  public equals(other: NotificationContent): boolean {
    return (
      this._title === other._title &&
      this._message === other._message &&
      this._imageUrl === other._imageUrl &&
      this._actionUrl === other._actionUrl &&
      this._actionText === other._actionText
    );
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Notification title cannot be empty');
    }

    if (title.length > 100) {
      throw new Error('Notification title cannot exceed 100 characters');
    }
  }

  private validateMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new Error('Notification message cannot be empty');
    }

    if (message.length > 2000) {
      throw new Error('Notification message cannot exceed 2000 characters');
    }
  }

  private validateImageUrl(imageUrl?: string): void {
    if (imageUrl && !this.isValidUrl(imageUrl)) {
      throw new Error('Invalid image URL format');
    }
  }

  private validateActionUrl(actionUrl?: string): void {
    if (actionUrl && !this.isValidUrl(actionUrl)) {
      throw new Error('Invalid action URL format');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
