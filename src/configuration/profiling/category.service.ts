import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const knex = this.databaseService.connection;

    // Generate kod_kategori (format: CAT-YYYYMMDD-XXX)
    const kodKategori = await this.generateKodKategori();

    // Check if category with same name already exists
    const existingCategory = await knex('k_profiling_kategori')
      .where('nama_kategori', createCategoryDto.namaKategori)
      .where('status', 1)
      .first();

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    // Create category
    const insertResult = await knex('k_profiling_kategori').insert({
      kod_kategori: kodKategori,
      nama_kategori: createCategoryDto.namaKategori,
      keterangan: createCategoryDto.description || null,
      status: createCategoryDto.status || 1, // Default to active (1)
      created_date: new Date(),
      updated_date: new Date(),
    });

    // Fetch the created category
    const category = await knex('k_profiling_kategori')
      .where({ id_profiling_kategori: insertResult[0] })
      .first();

    return {
      id: category.id_profiling_kategori,
      kodKategori: category.kod_kategori,
      namaKategori: category.nama_kategori,
      description: category.keterangan,
      status: category.status,
      createdAt: category.created_date,
      updatedAt: category.updated_date,
    };
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.databaseService
      .connection('k_profiling_kategori')
      .select('*')
      .orderBy('created_date', 'desc');

    return categories.map((category) => ({
      id: category.id_profiling_kategori,
      kodKategori: category.kod_kategori,
      namaKategori: category.nama_kategori,
      description: category.keterangan,
      status: category.status,
      createdAt: category.created_date,
      updatedAt: category.updated_date,
    }));
  }

  async findActive(): Promise<Category[]> {
    const categories = await this.databaseService
      .connection('k_profiling_kategori')
      .select('*')
      .where('status', 1)
      .orderBy('nama_kategori', 'asc');

    return categories.map((category) => ({
      id: category.id_profiling_kategori,
      kodKategori: category.kod_kategori,
      namaKategori: category.nama_kategori,
      description: category.keterangan,
      status: category.status,
      createdAt: category.created_date,
      updatedAt: category.updated_date,
    }));
  }

  async findOne(identifier: string): Promise<Category | null> {
    const knex = this.databaseService.connection;

    const category = await knex('k_profiling_kategori')
      .where({ kod_kategori: identifier.toString() })
      .first();

    if (!category) return null;

    return {
      id: category.id_profiling_kategori,
      kodKategori: category.kod_kategori,
      namaKategori: category.nama_kategori,
      description: category.keterangan,
      status: category.status,
      createdAt: category.created_date,
      updatedAt: category.updated_date,
    };
  }

  async update(
    identifier: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const knex = this.databaseService.connection;

    const existingCategory = await knex('k_profiling_kategori')
      .where({ kod_kategori: identifier.toString() })
      .first();

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check if name is being updated and if it conflicts with existing category
    if (
      updateCategoryDto.namaKategori &&
      updateCategoryDto.namaKategori !== existingCategory.nama_kategori
    ) {
      const nameConflict = await knex('k_profiling_kategori')
        .where('nama_kategori', updateCategoryDto.namaKategori)
        .whereNot('kod_kategori', identifier)
        .first();

      if (nameConflict) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const updatePayload: any = {};
    if (updateCategoryDto.namaKategori)
      updatePayload.nama_kategori = updateCategoryDto.namaKategori;
    if (updateCategoryDto.description !== undefined)
      updatePayload.keterangan = updateCategoryDto.description;
    if (updateCategoryDto.status !== undefined)
      updatePayload.status = updateCategoryDto.status;
    updatePayload.updated_date = new Date();

    // Update the record
    const updateResult = await knex('k_profiling_kategori')
      .where({ kod_kategori: identifier })
      .update(updatePayload);

    if (updateResult === 0) return null;

    // Fetch the updated record
    const category = await knex('k_profiling_kategori')
      .where({ kod_kategori: identifier })
      .first();

    if (!category) return null;

    return {
      id: category.id_profiling_kategori,
      kodKategori: category.kod_kategori,
      namaKategori: category.nama_kategori,
      description: category.keterangan,
      status: category.status,
      createdAt: category.created_date,
      updatedAt: category.updated_date,
    };
  }

  async remove(identifier: string): Promise<boolean> {
    const knex = this.databaseService.connection;

    // Check if category exists
    const existingCategory = await knex('k_profiling_kategori')
      .where({ kod_kategori: identifier.toString() })
      .first();

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check if category is being used by any processes
    const processesUsingCategory = await knex('k_profiling_proses')
      .where({ kod_kategori: identifier.toString() })
      .where('status', 1)
      .first();

    if (processesUsingCategory) {
      throw new ConflictException('Cannot delete category that is being used by processes');
    }

    // Soft delete by setting status to 0
    const result = await knex('k_profiling_kategori')
      .where({ kod_kategori: identifier })
      .update({
        status: 0,
        updated_date: new Date(),
      });

    return result > 0;
  }

  async updateStatus(
    identifier: string | number,
    status: number,
  ): Promise<Category | null> {
    const knex = this.databaseService.connection;

    // Check if identifier is a number (ID) or string (kodKategori)
    const isNumeric = !isNaN(Number(identifier));
    let whereClause;

    if (isNumeric) {
      whereClause = { id_profiling_kategori: parseInt(identifier.toString()) };
    } else {
      whereClause = { kod_kategori: identifier.toString() };
    }

    // Check if category exists
    const existingCategory = await knex('k_profiling_kategori')
      .where(whereClause)
      .first();
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Update the status
    const updateResult = await knex('k_profiling_kategori')
      .where(whereClause)
      .update({
        status: status,
        updated_date: new Date(),
      });

    if (updateResult === 0) return null;

    // Fetch the updated record
    const category = await knex('k_profiling_kategori').where(whereClause).first();
    if (!category) return null;

    return {
      id: category.id_profiling_kategori,
      kodKategori: category.kod_kategori,
      namaKategori: category.nama_kategori,
      description: category.keterangan,
      status: category.status,
      createdAt: category.created_date,
      updatedAt: category.updated_date,
    };
  }

  private async generateKodKategori(): Promise<string> {
    const knex = this.databaseService.connection;
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');

    // Get the latest category code for today
    const latestCategory = await knex('k_profiling_kategori')
      .where('kod_kategori', 'like', `CAT-${dateStr}-%`)
      .orderBy('kod_kategori', 'desc')
      .first();

    let sequence = 1;
    if (latestCategory) {
      const lastSequence = parseInt(latestCategory.kod_kategori.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `CAT-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
} 