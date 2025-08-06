import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { ComponentService } from './component.service';
import { ComponentController } from './component.controller';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  controllers: [ProcessController, ComponentController, CategoryController],
  providers: [ProcessService, ComponentService, CategoryService],
  exports: [ProcessService, ComponentService, CategoryService],
})
export class ProfilingModule {} 