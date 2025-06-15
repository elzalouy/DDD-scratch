import { Injectable, Logger } from '@nestjs/common';
import { PubSub, Topic, Message } from '@google-cloud/pubsub';
import { FirebaseConfig } from '../../firebase/firebase.config';
import {
  IPubSubMessagePublisher,
  PubSubMessage,
  TopicMetadata,
  PublishOptions,
  PubSubError,
} from './pubsub-message-publisher.interface';

@Injectable()
export class PubSubMessagePublisher implements IPubSubMessagePublisher {
  private readonly logger = new Logger(PubSubMessagePublisher.name);
  private readonly pubsub: PubSub;
  private readonly topicCache = new Map<string, Topic>();

  constructor(private readonly firebaseConfig: FirebaseConfig) {
    this.pubsub = firebaseConfig.getPubSub();
  }

  async publish(
    topic: string,
    message: any,
    attributes?: Record<string, string>,
  ): Promise<string> {
    try {
      const topicRef = await this.getOrCreateTopic(topic);

      const dataBuffer = Buffer.from(JSON.stringify(message));
      const messageId = await topicRef.publishMessage({
        data: dataBuffer,
        attributes: attributes || {},
      });

      this.logger.debug(`Message published to topic ${topic}: ${messageId}`);
      return messageId;
    } catch (error) {
      this.logger.error(
        `Failed to publish message to topic ${topic}: ${error.message}`,
        error.stack,
      );
      throw this.createPubSubError(error, `Failed to publish to ${topic}`);
    }
  }

  async publishBatch(
    topic: string,
    messages: PubSubMessage[],
  ): Promise<string[]> {
    try {
      const topicRef = await this.getOrCreateTopic(topic);

      const publishPromises = messages.map((msg) => {
        const dataBuffer = Buffer.from(JSON.stringify(msg.data));
        return topicRef.publishMessage({
          data: dataBuffer,
          attributes: msg.attributes || {},
          orderingKey: msg.orderingKey,
        });
      });

      const messageIds = await Promise.all(publishPromises);

      this.logger.debug(
        `Batch published ${messages.length} messages to topic ${topic}`,
      );
      return messageIds;
    } catch (error) {
      this.logger.error(
        `Failed to publish batch to topic ${topic}: ${error.message}`,
        error.stack,
      );
      throw this.createPubSubError(
        error,
        `Failed to publish batch to ${topic}`,
      );
    }
  }

  async publishScheduled(
    topic: string,
    message: any,
    scheduledAt: Date,
    attributes?: Record<string, string>,
  ): Promise<string> {
    try {
      // Add scheduling information to attributes
      const scheduledAttributes = {
        ...attributes,
        scheduledAt: scheduledAt.toISOString(),
        isScheduled: 'true',
      };

      return await this.publish(topic, message, scheduledAttributes);
    } catch (error) {
      this.logger.error(
        `Failed to publish scheduled message to topic ${topic}: ${error.message}`,
        error.stack,
      );
      throw this.createPubSubError(
        error,
        `Failed to publish scheduled message to ${topic}`,
      );
    }
  }

  async createTopic(topicName: string): Promise<void> {
    try {
      const [topic] = await this.pubsub.createTopic(topicName);
      this.topicCache.set(topicName, topic);

      this.logger.log(`Created topic: ${topicName}`);
    } catch (error) {
      if (error.code === 6) {
        // ALREADY_EXISTS
        this.logger.debug(`Topic already exists: ${topicName}`);
        return;
      }

      this.logger.error(
        `Failed to create topic ${topicName}: ${error.message}`,
        error.stack,
      );
      throw this.createPubSubError(
        error,
        `Failed to create topic ${topicName}`,
      );
    }
  }

  async deleteTopic(topicName: string): Promise<void> {
    try {
      const topic = this.pubsub.topic(topicName);
      await topic.delete();

      this.topicCache.delete(topicName);
      this.logger.log(`Deleted topic: ${topicName}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete topic ${topicName}: ${error.message}`,
        error.stack,
      );
      throw this.createPubSubError(
        error,
        `Failed to delete topic ${topicName}`,
      );
    }
  }

  async listTopics(): Promise<string[]> {
    try {
      const [topics] = await this.pubsub.getTopics();
      return topics.map((topic) => topic.name.split('/').pop() || '');
    } catch (error) {
      this.logger.error(`Failed to list topics: ${error.message}`, error.stack);
      throw this.createPubSubError(error, 'Failed to list topics');
    }
  }

  async getTopicMetadata(topicName: string): Promise<TopicMetadata> {
    try {
      const topic = this.pubsub.topic(topicName);
      const [metadata] = await topic.getMetadata();

      return {
        name: metadata.name,
        labels: metadata.labels,
        messageStoragePolicy: metadata.messageStoragePolicy,
        kmsKeyName: metadata.kmsKeyName,
        schemaSettings: metadata.schemaSettings as any,
        satisfiesPzs: metadata.satisfiesPzs,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get topic metadata for ${topicName}: ${error.message}`,
        error.stack,
      );
      throw this.createPubSubError(
        error,
        `Failed to get metadata for ${topicName}`,
      );
    }
  }

  async topicExists(topicName: string): Promise<boolean> {
    try {
      const topic = this.pubsub.topic(topicName);
      const [exists] = await topic.exists();
      return exists;
    } catch (error) {
      this.logger.error(
        `Failed to check if topic exists ${topicName}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  private async getOrCreateTopic(topicName: string): Promise<Topic> {
    // Check cache first
    if (this.topicCache.has(topicName)) {
      return this.topicCache.get(topicName)!;
    }

    // Check if topic exists
    const topic = this.pubsub.topic(topicName);
    const [exists] = await topic.exists();

    if (!exists) {
      await this.createTopic(topicName);
      return this.topicCache.get(topicName)!;
    }

    this.topicCache.set(topicName, topic);
    return topic;
  }

  private createPubSubError(originalError: any, message: string): PubSubError {
    return {
      message,
      code: originalError.code,
      details: originalError,
    };
  }

  /**
   * Initialize default topics for the notification system
   */
  async initializeTopics(): Promise<void> {
    const defaultTopics = [
      'notification-created',
      'notification-scheduled',
      'notification-retry',
      'notification-batch',
      'notification-analytics',
      'notification-deadletter',
      'notification-priority',
    ];

    for (const topicName of defaultTopics) {
      try {
        await this.createTopic(topicName);
      } catch (error) {
        this.logger.warn(
          `Failed to initialize topic ${topicName}: ${error.message}`,
        );
      }
    }

    this.logger.log('Notification system topics initialized');
  }

  /**
   * Health check for Pub/Sub connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.listTopics();
      return true;
    } catch (error) {
      this.logger.error(
        `Pub/Sub health check failed: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
