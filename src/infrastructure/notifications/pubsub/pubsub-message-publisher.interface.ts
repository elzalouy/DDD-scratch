import { ISchema } from '@google-cloud/pubsub';

export interface IPubSubMessagePublisher {
  /**
   * Publish a message to the specified topic
   */
  publish(
    topic: string,
    message: any,
    attributes?: Record<string, string>,
  ): Promise<string>;

  /**
   * Publish multiple messages to the specified topic
   */
  publishBatch(topic: string, messages: PubSubMessage[]): Promise<string[]>;

  /**
   * Schedule a message to be published at a specific time
   */
  publishScheduled(
    topic: string,
    message: any,
    scheduledAt: Date,
    attributes?: Record<string, string>,
  ): Promise<string>;

  /**
   * Create a topic if it doesn't exist
   */
  createTopic(topicName: string): Promise<void>;

  /**
   * Delete a topic
   */
  deleteTopic(topicName: string): Promise<void>;

  /**
   * List all topics
   */
  listTopics(): Promise<string[]>;

  /**
   * Get topic metadata
   */
  getTopicMetadata(topicName: string): Promise<TopicMetadata>;

  /**
   * Check if topic exists
   */
  topicExists(topicName: string): Promise<boolean>;
}

export interface PubSubMessage {
  data: any;
  attributes?: Record<string, string>;
  messageId?: string;
  publishTime?: Date;
  orderingKey?: string;
}

export interface TopicMetadata {
  name: string;
  labels?: Record<string, string>;
  messageStoragePolicy?: MessageStoragePolicy;
  kmsKeyName?: string;
  schemaSettings?: SchemaSettings;
  satisfiesPzs?: boolean;
}

export interface MessageStoragePolicy {
  allowedPersistenceRegions?: string[];
}

export interface SchemaSettings {
  schema?: string;
  encoding?: SchemaEncoding;
  firstRevisionId?: string;
  lastRevisionId?: string;
}

export enum SchemaEncoding {
  JSON = 'JSON',
  BINARY = 'BINARY',
  AVRO = 'AVRO',
  PROTOBUF = 'PROTOBUF',
}

export interface PublishOptions {
  attributes?: Record<string, string>;
  orderingKey?: string;
  enableMessageOrdering?: boolean;
}

export interface PubSubError {
  message: string;
  code?: number;
  details?: any;
}
