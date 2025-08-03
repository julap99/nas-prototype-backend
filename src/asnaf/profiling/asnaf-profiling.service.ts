import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMaklumatPendidikanDto } from './dto/create-maklumat-pendidikan.dto';
import { MaklumatPendidikan } from './entities/maklumat-pendidikan.entity';

// Helper function to safely parse JSON
function safeJsonParse(value: any): any {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      // If it's not valid JSON, return as is
      return value;
    }
  }
  return value;
}

@Injectable()
export class AsnafProfilingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createMaklumatPendidikan(
    createMaklumatPendidikanDto: CreateMaklumatPendidikanDto,
  ): Promise<MaklumatPendidikan> {
    const knex = this.databaseService.connection;

    // Check if asnaf profiling record exists
    const existingRecord = await knex('k_asnaf_profiling')
      .where('asnaf_uuid', createMaklumatPendidikanDto.asnafUuid)
      .where('status', 1)
      .first();

    const educationPayload: any = {
      masih_bersekolah: createMaklumatPendidikanDto.masihBersekolah,
      pendidikan_tertinggi: createMaklumatPendidikanDto.pendidikanTertinggi,
      lain_lain_pendidikan_tertinggi:
        createMaklumatPendidikanDto.lainLainPendidikanTertinggi,
      tahap_pendidikan_dicapai: JSON.stringify(
        createMaklumatPendidikanDto.tahapPendidikanDicapai,
      ),
      status: createMaklumatPendidikanDto.status || 1,
      updated_date: new Date(),
    };

    let asnafProfiling;

    if (existingRecord) {
      // Update existing record
      const updateResult = await knex('k_asnaf_profiling')
        .where('asnaf_uuid', createMaklumatPendidikanDto.asnafUuid)
        .where('status', 1)
        .update(educationPayload);

      if (updateResult === 0) {
        throw new NotFoundException('Failed to update education record');
      }

      // Fetch the updated record
      asnafProfiling = await knex('k_asnaf_profiling')
        .where('asnaf_uuid', createMaklumatPendidikanDto.asnafUuid)
        .first();
    } else {
      // Create new record
      const insertPayload = {
        ...educationPayload,
        asnaf_uuid: createMaklumatPendidikanDto.asnafUuid,
        created_date: new Date(),
      };

      const [insertedId] = await knex('k_asnaf_profiling')
        .insert(insertPayload)
        .returning('id_asnaf_profiling');

      if (!insertedId) {
        throw new NotFoundException('Failed to create education record');
      }

      // Fetch the created record
      asnafProfiling = await knex('k_asnaf_profiling')
        .where('id_asnaf_profiling', insertedId)
        .first();
    }

    if (!asnafProfiling) {
      throw new NotFoundException('Failed to fetch education record');
    }

    return {
      asnafUuid: asnafProfiling.asnaf_uuid,
      status: asnafProfiling.status,
      createdAt: asnafProfiling.created_date,
      updatedAt: asnafProfiling.updated_date,
    };
  }

  async findMaklumatPendidikanByUuid(
    asnafUuid: string,
  ): Promise<MaklumatPendidikan | null> {
    const knex = this.databaseService.connection;

    const asnafProfiling = await knex('k_asnaf_profiling')
      .where('asnaf_uuid', asnafUuid)
      .where('status', 1)
      .first();

    if (!asnafProfiling) return null;

    return {
      asnafUuid: asnafProfiling.asnaf_uuid,
      status: asnafProfiling.status,
      createdAt: asnafProfiling.created_date,
      updatedAt: asnafProfiling.updated_date,
    };
  }
}
