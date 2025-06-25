import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const { createClient } = require('redis');
        
        const redisConfig: any = {
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(configService.get('REDIS_PORT', '6379')),
          },
          database: parseInt(configService.get('REDIS_DB', '1')), // Use database 1 instead of default 0
        };

        // Password authentication (optional)
        const password = configService.get('REDIS_PASSWORD');
        if (password && password.trim() !== '') {
          redisConfig.password = password;
        }

        console.log('Redis config:', {
          host: redisConfig.socket.host,
          port: redisConfig.socket.port,
          hasPassword: !!password,
        });

        const client = createClient(redisConfig);

        client.on('error', (err) => {
          console.error('Redis Client Error:', err);
        });

        client.on('connect', () => {
          console.log('Redis Client Connected');
        });

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {} 