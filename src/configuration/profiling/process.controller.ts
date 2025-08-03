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
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { Process } from './entities/process.entity';

@Controller('configuration/profiling/process')
@UseGuards(JwtAuthGuard)
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  async create(@Body() createProcessDto: CreateProcessDto): Promise<Process> {
    return this.processService.create(createProcessDto);
  }

  @Get()
  async findAll(): Promise<Process[]> {
    return this.processService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Process | null> {
    return this.processService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProcessDto: UpdateProcessDto,
  ): Promise<Process | null> {
    return this.processService.update(id, updateProcessDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.processService.remove(id);
    return { success: result };
  }
} 