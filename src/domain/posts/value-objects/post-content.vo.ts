export class PostContent {
  private readonly _title: string;
  private readonly _description: string;

  constructor(title: string, description: string) {
    this.validateTitle(title);
    this.validateDescription(description);
    
    this._title = title.trim();
    this._description = description.trim();
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get summary(): string {
    return this._description.length > 100 
      ? this._description.substring(0, 97) + '...'
      : this._description;
  }

  public get wordCount(): number {
    return this._description.split(/\s+/).length;
  }

  public equals(other: PostContent): boolean {
    return this._title === other._title && this._description === other._description;
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Post title is required');
    }

    if (title.length > 100) {
      throw new Error('Post title cannot exceed 100 characters');
    }

    // Check for spam patterns
    if (this.containsSpamPatterns(title)) {
      throw new Error('Title contains prohibited content');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Post description is required');
    }

    if (description.length > 5000) {
      throw new Error('Post description cannot exceed 5000 characters');
    }

    if (description.length < 10) {
      throw new Error('Post description must be at least 10 characters');
    }

    // Check for spam patterns
    if (this.containsSpamPatterns(description)) {
      throw new Error('Description contains prohibited content');
    }
  }

  private containsSpamPatterns(text: string): boolean {
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner)\b/i,
      /\$\$\$+/,
      /FREE!!!/i,
      /(http|https):\/\/[^\s]+/g, // URLs in title/short description might be spam
    ];

    return spamPatterns.some(pattern => pattern.test(text));
  }

  public static create(title: string, description: string): PostContent {
    return new PostContent(title, description);
  }
} 