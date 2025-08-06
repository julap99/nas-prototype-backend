import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { AsnafProfilingService } from './asnaf-profiling.service';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import * as path from 'path';
import * as fs from 'fs';

import { CreateMaklumatPendidikanDto } from './dto/create-maklumat-pendidikan.dto';
import {
  GetMaklumatPendidikan,
  PostMaklumatPendidikan,
} from './entities/maklumat-pendidikan.entity';
import { CreateMaklumatAlamatDto } from './dto/create-maklumat-alamat.dto';
import {
  PostMaklumatAlamat,
  GetMaklumatAlamat,
} from './entities/maklumat-alamat.entity';

@Controller('asnaf/profiling')
export class AsnafProfilingController {
  constructor(private readonly asnafProfilingService: AsnafProfilingService) {}

  // Education Information Endpoints - Protected with Basic Auth for third-party access
  @Post('pendidikan')
  @UseGuards(BasicAuthGuard)
  async createMaklumatPendidikan(
    @Body() createMaklumatPendidikanDto: CreateMaklumatPendidikanDto,
  ): Promise<PostMaklumatPendidikan> {
    return this.asnafProfilingService.createMaklumatPendidikan(
      createMaklumatPendidikanDto,
    );
    // asdasd
  }

  @Get('pendidikan/:asnafUuid')
  @UseGuards(BasicAuthGuard)
  async getMaklumatPendidikanByUuid(
    @Param('asnafUuid') asnafUuid: string,
  ): Promise<GetMaklumatPendidikan | null> {
    return this.asnafProfilingService.findMaklumatPendidikanByUuid(asnafUuid);
  }

  @Post('alamat')
  @UseGuards(BasicAuthGuard)
  @UseInterceptors(FileUploadInterceptor)
  async createMaklumatAlamat(
    @Body() createMaklumatAlamatDto: CreateMaklumatAlamatDto,
  ): Promise<PostMaklumatAlamat> {
    return this.asnafProfilingService.createMaklumatAlamat(
      createMaklumatAlamatDto,
    );
  }

  @Get('alamat/:asnafUuid')
  @UseGuards(BasicAuthGuard)
  async getMaklumatAlamatByUuid(
    @Param('asnafUuid') asnafUuid: string,
  ): Promise<GetMaklumatAlamat | null> {
    return this.asnafProfilingService.getAsnafDetail(asnafUuid);
  }

  @Get('documents/:documentId')
  @UseGuards(BasicAuthGuard)
  async getDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const document = await this.asnafProfilingService.getDocumentById(parseInt(documentId));
    
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = document.path;
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Document file not found');
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
