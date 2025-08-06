import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMaklumatPendidikanDto } from './dto/create-maklumat-pendidikan.dto';
import {
  GetMaklumatPendidikan,
  PostMaklumatPendidikan,
} from './entities/maklumat-pendidikan.entity';
import { CreateMaklumatAlamatDto } from './dto/create-maklumat-alamat.dto';
import { PostMaklumatAlamat } from './entities/maklumat-alamat.entity';

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

  private parseTahapPendidikan(value: any): any[] {
    if (!value) return [];

    // If it's already an array, return it
    if (Array.isArray(value)) return value;

    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // First try to parse as JSON
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If JSON parsing fails, try to split by comma (for comma-separated values)
        if (value.includes(',')) {
          return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        }
        // If it's a single value, return it as an array
        return [value.trim()];
      }
    }

    return [];
  }

  async createMaklumatPendidikan(
    createMaklumatPendidikanDto: CreateMaklumatPendidikanDto,
  ): Promise<PostMaklumatPendidikan> {
    const knex = this.databaseService.connection;

    const existingRecord = await this.getAsnafDetail(
      createMaklumatPendidikanDto.asnafUuid,
    );

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
  ): Promise<GetMaklumatPendidikan | null> {
    const knex = this.databaseService.connection;

    const asnafProfiling = await knex('k_asnaf_profiling')
      .where('asnaf_uuid', asnafUuid)
      .where('status', 1)
      .first();

    if (!asnafProfiling) return null;

    return {
      asnafUuid: asnafProfiling.asnaf_uuid,
      // masihBersekolah: Boolean(asnafProfiling.masih_bersekolah),
      // pendidikanTertinggi: asnafProfiling.pendidikan_tertinggi,
      // lainLainPendidikanTertinggi:
      //   asnafProfiling.lain_lain_pendidikan_tertinggi,
      // tahapPendidikanDicapai: this.parseTahapPendidikan(asnafProfiling.tahap_pendidikan_dicapai),
      status: asnafProfiling.status,
      createdAt: asnafProfiling.created_date,
      updatedAt: asnafProfiling.updated_date,
    };
  }

  async createMaklumatAlamat(
    createMaklumatAlamatDto: CreateMaklumatAlamatDto,
  ): Promise<PostMaklumatAlamat> {
    const knex = this.databaseService.connection;

    const existingRecord = await knex('k_asnaf_profiling')
      .where('asnaf_uuid', createMaklumatAlamatDto.asnafUuid)
      .where('status', 1)
      .first();

    let asnafProfiling;

    if (!existingRecord) {
      // Create process
      const insertPayload = {
        asnaf_uuid: createMaklumatAlamatDto.asnafUuid,
        alamat_1: createMaklumatAlamatDto.alamat1,
        alamat_2: createMaklumatAlamatDto.alamat2,
        status: 1, // Default to active
        created_date: new Date(),
        updated_date: new Date(),
      };

      const [insertedId] = await knex('k_asnaf_profiling')
        .insert(insertPayload)
        .returning('id_asnaf_profiling');

      if (!insertedId) {
        throw new NotFoundException('Failed to create address record');
      }

      // Fetch the created record
      asnafProfiling = await knex('k_asnaf_profiling')
        .where('id_asnaf_profiling', insertedId)
        .first();
    } else {
      // Update process
      const updatePayload = {
        alamat_1: createMaklumatAlamatDto.alamat1,
        alamat_2: createMaklumatAlamatDto.alamat2,
        updated_date: new Date(),
      };

      const updateResult = await knex('k_asnaf_profiling')
        .where('asnaf_uuid', createMaklumatAlamatDto.asnafUuid)
        .where('status', 1)
        .update(updatePayload);

      if (updateResult === 0) {
        throw new NotFoundException('Failed to update address record');
      }

      // Fetch the updated record
      asnafProfiling = await knex('k_asnaf_profiling')
        .where('asnaf_uuid', createMaklumatAlamatDto.asnafUuid)
        .where('status', 1)
        .first();
    }

    if (!asnafProfiling) {
      throw new NotFoundException('Failed to fetch address record');
    }

    // Handle document storage if documents are provided
    let documents = undefined;
    if (createMaklumatAlamatDto.documents && createMaklumatAlamatDto.documents.length > 0) {
      // Store document information in database
      const documentPayloads = createMaklumatAlamatDto.documents.map(doc => ({
        asnaf_uuid: createMaklumatAlamatDto.asnafUuid,
        original_name: doc.originalName,
        filename: doc.filename,
        file_path: doc.path,
        file_size: doc.size,
        mime_type: doc.mimetype,
        document_type: 'address_document', // Default type for address-related documents
        description: `Document uploaded for asnaf ${createMaklumatAlamatDto.asnafUuid}`,
        status: 1,
        created_date: new Date(),
        updated_date: new Date(),
      }));

      // Insert documents into database
      const insertedDocuments = await knex('k_asnaf_documents')
        .insert(documentPayloads)
        .returning(['id_asnaf_document', 'original_name', 'filename', 'file_path', 'file_size', 'mime_type', 'document_type']);

      documents = insertedDocuments.map(doc => ({
        id: doc.id_asnaf_document,
        originalName: doc.original_name,
        filename: doc.filename,
        path: doc.file_path,
        size: doc.file_size,
        mimetype: doc.mime_type,
        documentType: doc.document_type,
      }));
    }

    return {
      asnafUuid: asnafProfiling.asnaf_uuid,
      alamat1: asnafProfiling.alamat_1,
      alamat2: asnafProfiling.alamat_2,
      status: asnafProfiling.status,
      createdAt: asnafProfiling.created_date,
      updatedAt: asnafProfiling.updated_date,
      documents,
    };
  }

  async getAsnafDetail(asnafUuid: string) {
    const knex = this.databaseService.connection;

    const asnafDetail = await knex('k_asnaf_profiling')
      .where('asnaf_uuid', asnafUuid)
      .where('status', 1)
      .first();

    if (!asnafDetail) {
      return null;
    }

    // Fetch associated documents
    const documents = await knex('k_asnaf_documents')
      .where('asnaf_uuid', asnafUuid)
      .where('status', 1)
      .select(['id_asnaf_document', 'original_name', 'filename', 'file_path', 'file_size', 'mime_type', 'document_type']);

    const formattedDocuments = documents.map(doc => ({
      id: doc.id_asnaf_document,
      originalName: doc.original_name,
      filename: doc.filename,
      path: doc.file_path,
      size: doc.file_size,
      mimetype: doc.mime_type,
      documentType: doc.document_type,
    }));

    return {
      asnafUuid: asnafDetail.asnaf_uuid,
      alamat1: asnafDetail.alamat_1,
      alamat2: asnafDetail.alamat_2,
      documents: formattedDocuments.length > 0 ? formattedDocuments : undefined,
    };
  }

  async getDocumentById(documentId: number) {
    const knex = this.databaseService.connection;

    const document = await knex('k_asnaf_documents')
      .where('id_asnaf_document', documentId)
      .where('status', 1)
      .first();

    if (!document) {
      return null;
    }

    return {
      id: document.id_asnaf_document,
      originalName: document.original_name,
      filename: document.filename,
      path: document.file_path,
      size: document.file_size,
      mimetype: document.mime_type,
      documentType: document.document_type,
    };
  }
}
