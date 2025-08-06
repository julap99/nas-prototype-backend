import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilingModule } from './configuration/profiling/profiling.module';
import { AsnafModule } from './asnaf/asnaf.module';
import { TestModule } from './test/test.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      ThrottlerModule.forRoot({
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      })
    ] : []),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    ProfilingModule,
    AsnafModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...(process.env.NODE_ENV === 'production' ? [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      }
    ] : []),
  ],
})
export class AppModule {} 