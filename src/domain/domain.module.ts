import { Module } from '@nestjs/common';

// Domain services would be registered here if any
// Repository interfaces are just TypeScript interfaces, so no need to register

@Module({
  providers: [
    // Domain services would go here
  ],
  exports: [
    // Domain services would be exported here
  ],
})
export class DomainModule {} 