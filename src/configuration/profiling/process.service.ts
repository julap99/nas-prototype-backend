import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { Process } from './entities/process.entity';

@Injectable()
export class ProcessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProcessDto: CreateProcessDto): Promise<Process> {
    const knex = this.databaseService.connection;

    // Generate kod_proses (format: PRS-YYYYMMDD-XXX)
    const kodProses = await this.generateKodProses();

    // Check if process with same name already exists
    const existingProcess = await knex('k_profiling_proses')
      .where('nama_proses', createProcessDto.namaProses)
      .where('status', 1)
      .first();

    if (existingProcess) {
      throw new ConflictException('Process with this name already exists');
    }

    // Create process
    const insertResult = await knex('k_profiling_proses')
      .insert({
        kod_proses: kodProses,
        nama_proses: createProcessDto.namaProses,
        id_page: createProcessDto.idPage,
        status: createProcessDto.status || 1, // Default to active (1)
        created_date: new Date(),
        updated_date: new Date(),
      });

    // Fetch the created process
    const process = await knex('k_profiling_proses')
      .where({ id_profiling_proses: insertResult[0] })
      .first();

    return {
      id: process.id_profiling_proses,
      kodProses: process.kod_proses,
      namaProses: process.nama_proses,
      idPage: process.id_page,
      status: process.status,
      createdAt: process.created_date,
      updatedAt: process.updated_date,
    };
  }

  async findAll(): Promise<Process[]> {
    const processes = await this.databaseService
      .connection('k_profiling_proses')
      .select('*')
      .where('status', 1)
      .orderBy('created_date', 'desc');

    return processes.map((process) => ({
      id: process.id,
      kodProses: process.kod_proses,
      namaProses: process.nama_proses,
      idPage: process.id_page,
      status: process.status,
      createdAt: process.created_date,
      updatedAt: process.updated_date,
    }));
  }

  async findOne(identifier: string): Promise<Process | null> {
    const knex = this.databaseService.connection;

    const process = await knex('k_profiling_proses')
      .where({ kod_proses: identifier.toString(), status: 1 })
      .first();

    if (!process) return null;

    return {
      id: process.id,
      kodProses: process.kod_proses,
      namaProses: process.nama_proses,
      idPage: process.id_page,
      status: process.status,
      createdAt: process.created_date,
      updatedAt: process.updated_date,
    };
  }

  async update(
    identifier: string,
    updateProcessDto: UpdateProcessDto,
  ): Promise<Process | null> {
    const knex = this.databaseService.connection;

    const existingProcess = await knex('k_profiling_proses')
      .where({ kod_proses: identifier.toString(), status: 1 })
      .first();

    if (!existingProcess) {
      throw new NotFoundException('Process not found');
    }

    // Check if name is being updated and if it conflicts with existing process
    if (
      updateProcessDto.namaProses &&
      updateProcessDto.namaProses !== existingProcess.nama_proses
    ) {
      const nameConflict = await knex('k_profiling_proses')
        .where('nama_proses', updateProcessDto.namaProses)
        .where('status', 1)
        .whereNot('kod_proses', identifier)
        .first();

      if (nameConflict) {
        throw new ConflictException('Process with this name already exists');
      }
    }

    const updatePayload: any = {};
    if (updateProcessDto.kodProses)
      updatePayload.kod_proses = updateProcessDto.kodProses;
    if (updateProcessDto.namaProses)
      updatePayload.nama_proses = updateProcessDto.namaProses;
    if (updateProcessDto.idPage)
      updatePayload.id_page = updateProcessDto.idPage;
    if (updateProcessDto.status !== undefined)
      updatePayload.status = updateProcessDto.status;
    updatePayload.updated_date = new Date();

    // Update the record
    const updateResult = await knex('k_profiling_proses')
      .where({ kod_proses: identifier })
      .update(updatePayload);

    if (updateResult === 0) return null;

    // Fetch the updated record
    const process = await knex('k_profiling_proses')
      .where({ kod_proses: identifier })
      .first();

    if (!process) return null;

    return {
      id: process.id,
      kodProses: process.kod_proses,
      namaProses: process.nama_proses,
      idPage: process.id_page,
      status: process.status,
      createdAt: process.created_date,
      updatedAt: process.updated_date,
    };
  }

  async remove(identifier: string | number): Promise<boolean> {
    const knex = this.databaseService.connection;

    // Check if identifier is a number (ID) or string (kodProses)
    const isNumeric = !isNaN(Number(identifier));

    let whereClause;
    if (isNumeric) {
      whereClause = { id: parseInt(identifier.toString()) };
    } else {
      whereClause = { kod_proses: identifier.toString() };
    }

    const result = await knex('k_profiling_proses').where(whereClause).update({
      status: 0, // Set to inactive instead of deleting
      updated_date: new Date(),
    });

    return result > 0;
  }

  private async generateKodProses(): Promise<string> {
    const knex = this.databaseService.connection;

    // Get current date in YYYYMMDD format
    const today = new Date();
    const dateStr =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');

    // Find the latest process code for today
    const latestProcess = await knex('k_profiling_proses')
      .where('kod_proses', 'like', `PRS-${dateStr}-%`)
      .orderBy('kod_proses', 'desc')
      .first();

    let sequence = 1;
    if (latestProcess) {
      // Extract sequence number from latest code
      const lastSequence = parseInt(latestProcess.kod_proses.split('-')[2]);
      sequence = lastSequence + 1;
    }

    // Format: PRS-YYYYMMDD-XXX (3-digit sequence)
    return `PRS-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
}
