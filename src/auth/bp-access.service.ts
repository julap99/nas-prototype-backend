import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import { BpAccess } from './entities/bp-access.entity';

@Injectable()
export class BpAccessService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async validateCredentials(username: string, password: string): Promise<BpAccess | null> {
    try {
      const bpAccess = await this.knex('BP_access')
        .where('username', username)
        .where('isActive', true)
        .first();

      if (!bpAccess) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, bpAccess.password);

      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = bpAccess;
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error validating BP_access credentials:', error);
      return null;
    }
  }

  async findByUsername(username: string): Promise<BpAccess | null> {
    try {
      const bpAccess = await this.knex('BP_access')
        .where('username', username)
        .where('isActive', true)
        .first();

      if (!bpAccess) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = bpAccess;
      return result;
    } catch (error) {
      console.error('Error finding BP_access by username:', error);
      return null;
    }
  }
} 