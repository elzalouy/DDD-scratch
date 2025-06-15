import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class FirebaseConfig {
  private _admin: admin.app.App;
  private _pubsub: PubSub;
  private _firestore: Firestore;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    const serviceAccountPath = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    if (!serviceAccountPath || !projectId) {
      throw new Error('Firebase configuration is missing');
    }

    // Initialize Firebase Admin SDK
    this._admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId,
    });

    // Initialize Pub/Sub
    this._pubsub = new PubSub({
      projectId,
      keyFilename: serviceAccountPath,
    });

    // Initialize Firestore
    this._firestore = new Firestore({
      projectId,
      keyFilename: serviceAccountPath,
    });
  }

  get admin(): admin.app.App {
    return this._admin;
  }

  get pubsub(): PubSub {
    return this._pubsub;
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get messaging(): admin.messaging.Messaging {
    return this._admin.messaging();
  }
}
