import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  async processData(id: string) {
    return {
      message: 'Data processed successfully',
      id: id,
      timestamp: new Date().toISOString(),
    };
  }
} 