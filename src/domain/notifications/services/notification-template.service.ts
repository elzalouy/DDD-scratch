import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: string;
  channel: string;
}

@Injectable()
export class NotificationTemplateService {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Load default notification templates
   */
  private loadDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'post-created',
        name: 'Post Created',
        subject: 'Your post "{{postTitle}}" has been created',
        body: `
          <h2>Hello {{username}}!</h2>
          <p>Your classified ad "<strong>{{postTitle}}</strong>" has been successfully created and is now under review.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Title: {{postTitle}}</li>
            <li>Price: {{price}} {{currency}}</li>
            <li>Category: {{category}}</li>
            <li>Location: {{location}}</li>
          </ul>
          <p>We'll notify you once your ad is approved and goes live.</p>
          <p>Thank you for using our platform!</p>
        `,
        variables: [
          'username',
          'postTitle',
          'price',
          'currency',
          'category',
          'location',
        ],
        type: 'POST_CREATED',
        channel: 'EMAIL',
      },
      {
        id: 'post-approved',
        name: 'Post Approved',
        subject: 'Your post "{{postTitle}}" has been approved!',
        body: `
          <h2>Great news, {{username}}!</h2>
          <p>Your classified ad "<strong>{{postTitle}}</strong>" has been approved and is now live on our platform.</p>
          <p><strong>Your ad details:</strong></p>
          <ul>
            <li>Title: {{postTitle}}</li>
            <li>Price: {{price}} {{currency}}</li>
            <li>Status: Live</li>
            <li>Expires: {{expiryDate}}</li>
          </ul>
          <p><a href="{{postUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Ad</a></p>
          <p>Good luck with your sale!</p>
        `,
        variables: [
          'username',
          'postTitle',
          'price',
          'currency',
          'expiryDate',
          'postUrl',
        ],
        type: 'POST_APPROVED',
        channel: 'EMAIL',
      },
      {
        id: 'post-rejected',
        name: 'Post Rejected',
        subject: 'Your post "{{postTitle}}" needs attention',
        body: `
          <h2>Hello {{username}},</h2>
          <p>Unfortunately, your classified ad "<strong>{{postTitle}}</strong>" could not be approved.</p>
          <p><strong>Reason:</strong> {{rejectionReason}}</p>
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Review our posting guidelines</li>
            <li>Make the necessary changes</li>
            <li>Resubmit your ad</li>
          </ul>
          <p><a href="{{editUrl}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Edit Your Ad</a></p>
          <p>If you have questions, please contact our support team.</p>
        `,
        variables: ['username', 'postTitle', 'rejectionReason', 'editUrl'],
        type: 'POST_REJECTED',
        channel: 'EMAIL',
      },
      {
        id: 'user-welcome',
        name: 'Welcome New User',
        subject: 'Welcome to {{platformName}}!',
        body: `
          <h2>Welcome {{firstName}}!</h2>
          <p>Thank you for joining <strong>{{platformName}}</strong>. We're excited to have you as part of our community!</p>
          <p><strong>Get started:</strong></p>
          <ul>
            <li>Complete your profile</li>
            <li>Post your first classified ad</li>
            <li>Browse our categories</li>
          </ul>
          <p><a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
          <p>Happy selling!</p>
        `,
        variables: ['firstName', 'platformName', 'dashboardUrl'],
        type: 'USER_WELCOME',
        channel: 'EMAIL',
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Reset your password',
        body: `
          <h2>Password Reset Request</h2>
          <p>Hello {{username}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p><a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in {{expiryMinutes}} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        variables: ['username', 'resetUrl', 'expiryMinutes'],
        type: 'PASSWORD_RESET',
        channel: 'EMAIL',
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: string): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type,
    );
  }

  /**
   * Get templates by channel
   */
  getTemplatesByChannel(channel: string): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.channel === channel,
    );
  }

  /**
   * Render template with variables
   */
  renderTemplate(
    templateId: string,
    variables: Record<string, any>,
  ): {
    subject: string;
    body: string;
  } | null {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    try {
      const subjectTemplate = Handlebars.compile(template.subject);
      const bodyTemplate = Handlebars.compile(template.body);

      return {
        subject: subjectTemplate(variables),
        body: bodyTemplate(variables),
      };
    } catch (error) {
      console.error(`Error rendering template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * Add or update template
   */
  setTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove template
   */
  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(
    templateId: string,
    variables: Record<string, any>,
  ): {
    valid: boolean;
    missingVariables: string[];
  } {
    const template = this.templates.get(templateId);
    if (!template) {
      return { valid: false, missingVariables: [] };
    }

    const missingVariables = template.variables.filter(
      (variable) => !(variable in variables),
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * Get template preview
   */
  getTemplatePreview(templateId: string): {
    subject: string;
    body: string;
    variables: string[];
  } | null {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    // Create sample variables for preview
    const sampleVariables: Record<string, any> = {};
    template.variables.forEach((variable) => {
      sampleVariables[variable] = `[${variable.toUpperCase()}]`;
    });

    const rendered = this.renderTemplate(templateId, sampleVariables);
    if (!rendered) {
      return null;
    }

    return {
      subject: rendered.subject,
      body: rendered.body,
      variables: template.variables,
    };
  }
}
