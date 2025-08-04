import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { AsnafProfilingService } from './asnaf-profiling.service';
import { CreateMaklumatPendidikanDto } from './dto/create-maklumat-pendidikan.dto';
import { GetMaklumatPendidikan, PostMaklumatPendidikan } from './entities/maklumat-pendidikan.entity';

@Controller('asnaf/profiling')
export class AsnafProfilingController {
  constructor(private readonly asnafProfilingService: AsnafProfilingService) {}

  // Education Information Endpoints - Protected with Basic Auth for third-party access
  @Post('pendidikan')
  @UseGuards(BasicAuthGuard)
  async createMaklumatPendidikan(@Body() createMaklumatPendidikanDto: CreateMaklumatPendidikanDto): Promise<PostMaklumatPendidikan> {
    return this.asnafProfilingService.createMaklumatPendidikan(createMaklumatPendidikanDto);
  }

  @Get('pendidikan/:asnafUuid')
  @UseGuards(BasicAuthGuard)
  async getMaklumatPendidikanByUuid(@Param('asnafUuid') asnafUuid: string): Promise<GetMaklumatPendidikan | null> {
    return this.asnafProfilingService.findMaklumatPendidikanByUuid(asnafUuid);
  }
} 