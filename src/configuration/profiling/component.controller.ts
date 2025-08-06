import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ComponentService } from './component.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { Component } from './entities/component.entity';

@Controller('configuration/profiling/component')
// @UseGuards(JwtAuthGuard)
export class ComponentController {
  constructor(private readonly componentService: ComponentService) {}

  @Post()
  async create(@Body() createComponentDto: CreateComponentDto): Promise<Component> {
    try {
      return await this.componentService.create(createComponentDto);
    } catch (error) {
      console.error('Controller error creating component:', error);
      throw error;
    }
  }

  @Get()
  async findAll(): Promise<Component[]> {
    return this.componentService.findAll();
  }

  @Get(':code')
  async findOne(@Param('code') code: string): Promise<Component | null> {
    return this.componentService.findOne(code);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateComponentDto: UpdateComponentDto,
  ): Promise<Component | null> {
    return this.componentService.update(id, updateComponentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.componentService.remove(id);
    return { success: result };
  }

  @Get('workflows/all')
  async findComponentsWithProcesses(): Promise<any[]> {
    return this.componentService.findComponentsWithProcesses();
  }

  @Get('workflows/:code')
  async findComponentWithProcessesById(@Param('code') code: string): Promise<any> {
    return this.componentService.findComponentWithProcessesById(code);
  }
} 