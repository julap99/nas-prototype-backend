import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AsnafProfilingService } from './asnaf-profiling.service';
import { CreateMaklumatPendidikanDto } from './dto/create-maklumat-pendidikan.dto';
import { MaklumatPendidikan } from './entities/maklumat-pendidikan.entity';

@Controller('asnaf/profiling')
@UseGuards(JwtAuthGuard)
export class AsnafProfilingController {
  constructor(private readonly asnafProfilingService: AsnafProfilingService) {}

  // Education Information Endpoints
  @Post('pendidikan')
  async createMaklumatPendidikan(@Body() createMaklumatPendidikanDto: CreateMaklumatPendidikanDto): Promise<MaklumatPendidikan> {
    return this.asnafProfilingService.createMaklumatPendidikan(createMaklumatPendidikanDto);
  }

  @Get('pendidikan/:asnafUuid')
  async getMaklumatPendidikanByUuid(@Param('asnafUuid') asnafUuid: string): Promise<MaklumatPendidikan | null> {
    return this.asnafProfilingService.findMaklumatPendidikanByUuid(asnafUuid);
  }
} 