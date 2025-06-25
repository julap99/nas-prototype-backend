import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class DatabaseService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  get connection(): Knex {
    return this.knex;
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.knex.raw('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
} 