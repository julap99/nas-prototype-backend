import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const knex = require('knex');
        
        return knex({
          client: 'mysql2',
          connection: {
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            user: configService.get('DB_USER'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
          },
          pool: {
            min: 2,
            max: 10,
          },
          acquireConnectionTimeout: 60000,
        });
      },
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: ['KNEX_CONNECTION', DatabaseService],
})
export class DatabaseModule {} 