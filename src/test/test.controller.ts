import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestService } from './test.service';

@Controller('admin/test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('process-data')
  // @UseGuards(JwtAuthGuard)
  async processData(@Query('id') id: string) {
    return this.testService.processData(id);
  }

  @Get('business-process-fetch-form')
  async businessProcessFetchForm(@Query('id') id: string) {
    return {
      id: id,
      name: 'Business Process Fetch Form',
      description: 'Business Process Fetch Form',
      url: 'https://www.google.com',
      form: {
        id: '123',
      },
    };
  }
}
