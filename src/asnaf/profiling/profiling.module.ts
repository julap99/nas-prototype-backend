import { Module } from '@nestjs/common';
import { AsnafProfilingController } from './asnaf-profiling.controller';
import { AsnafProfilingService } from './asnaf-profiling.service';

@Module({
  controllers: [AsnafProfilingController],
  providers: [AsnafProfilingService],
  exports: [AsnafProfilingService],
})
export class ProfilingModule {} 