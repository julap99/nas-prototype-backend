import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { ComponentService } from './component.service';
import { ComponentController } from './component.controller';

@Module({
  controllers: [ProcessController, ComponentController],
  providers: [ProcessService, ComponentService],
  exports: [ProcessService, ComponentService],
})
export class ProfilingModule {} 