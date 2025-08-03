import { Module } from '@nestjs/common';
import { ProfilingModule } from './profiling/profiling.module';

@Module({
  imports: [ProfilingModule],
  exports: [ProfilingModule],
})
export class AsnafModule {} 