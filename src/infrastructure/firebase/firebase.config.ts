import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';

@Injectable()
export class FirebaseConfig {
  private static instance: FirebaseConfig;
  private firebaseApp: admin.app.App;
  private firestoreInstance: Firestore;
  private pubSubInstance: PubSub;

  constructor() {
    this.initializeFirebase();
    this.initializeFirestore();
    this.initializePubSub();
  }

  static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  private initializeFirebase(): void {
    try {
      // Check if Firebase Admin is already initialized
      if (admin.apps.length === 0) {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        const projectId = process.env.FIREBASE_PROJECT_ID;

        if (serviceAccountPath) {
          // Initialize with service account key file
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
            projectId: projectId,
          });
        } else {
          // Initialize with default credentials (for cloud environments)
          this.firebaseApp = admin.initializeApp({
            projectId: projectId,
          });
        }
      } else {
        this.firebaseApp = admin.apps[0] as admin.app.App;
      }

      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }

  private initializeFirestore(): void {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID environment variable is required');
      }

      // Initialize Firestore client
      this.firestoreInstance = new Firestore({
        projectId: projectId,
        // Use default credentials in cloud environments
        // or specify keyFilename for local development
        ...(process.env.FIREBASE_SERVICE_ACCOUNT_PATH && {
          keyFilename: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        }),
      });

      console.log('Firestore initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      throw error;
    }
  }

  private initializePubSub(): void {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID environment variable is required');
      }

      // Initialize Pub/Sub client
      this.pubSubInstance = new PubSub({
        projectId: projectId,
        // Use default credentials in cloud environments
        // or specify keyFilename for local development
        ...(process.env.FIREBASE_SERVICE_ACCOUNT_PATH && {
          keyFilename: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        }),
      });

      console.log('Pub/Sub initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pub/Sub:', error);
      throw error;
    }
  }

  /**
   * Get Firebase Admin instance
   */
  getFirebaseAdmin(): admin.app.App {
    return this.firebaseApp;
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore {
    return this.firestoreInstance;
  }

  /**
   * Get Pub/Sub instance
   */
  getPubSub(): PubSub {
    return this.pubSubInstance;
  }

  /**
   * Get Firebase Cloud Messaging instance
   */
  getMessaging(): admin.messaging.Messaging {
    return this.firebaseApp.messaging();
  }

  /**
   * Health check for Firebase services
   */
  async healthCheck(): Promise<{
    firestore: boolean;
    pubsub: boolean;
    firebase: boolean;
  }> {
    const health = {
      firestore: false,
      pubsub: false,
      firebase: false,
    };

    try {
      // Test Firebase Admin
      await this.firebaseApp.options;
      health.firebase = true;
    } catch (error) {
      console.error('Firebase Admin health check failed:', error);
    }

    try {
      // Test Firestore connection
      await this.firestoreInstance.collection('health-check').limit(1).get();
      health.firestore = true;
    } catch (error) {
      console.error('Firestore health check failed:', error);
    }

    try {
      // Test Pub/Sub connection
      await this.pubSubInstance.getTopics();
      health.pubsub = true;
    } catch (error) {
      console.error('Pub/Sub health check failed:', error);
    }

    return health;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.pubSubInstance) {
        await this.pubSubInstance.close();
      }

      if (this.firestoreInstance) {
        await this.firestoreInstance.terminate();
      }

      if (this.firebaseApp) {
        await this.firebaseApp.delete();
      }

      console.log('Firebase services cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup Firebase services:', error);
    }
  }
}

export default FirebaseConfig;
