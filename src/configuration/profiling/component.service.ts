import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { Component } from './entities/component.entity';

@Injectable()
export class ComponentService {
  constructor(private readonly databaseService: DatabaseService) {}

  private parseKodProses(kodProses: any): string[] {
    if (Array.isArray(kodProses)) {
      return kodProses;
    }
    if (typeof kodProses === 'string') {
      try {
        return JSON.parse(kodProses);
      } catch (e) {
        console.warn('Failed to parse kodProses JSON:', kodProses);
        return [];
      }
    }
    return [];
  }

  async create(createComponentDto: CreateComponentDto): Promise<Component> {
    const knex = this.databaseService.connection;

    try {
      console.log(
        'Creating component with data:',
        JSON.stringify(createComponentDto, null, 2),
      );

      // Validate input
      if (
        !createComponentDto.kodProses ||
        createComponentDto.kodProses.length === 0
      ) {
        throw new Error('kodProses array cannot be empty');
      }

      // Check if component with same name already exists
      const existingComponent = await knex('k_profiling_component')
        .where('nama_pendaftaran', createComponentDto.namaPendaftaran)
        .where('status', 1)
        .first();

      if (existingComponent) {
        throw new ConflictException('Component with this name already exists');
      }

      // Extract only the process codes from the kodProses array
      const processCodes = createComponentDto.kodProses.map(
        (process) => process.kodProses,
      );
      console.log('Process codes to insert:', processCodes);

      // Create component - store as JSON string in TEXT column
      const insertResult = await knex('k_profiling_component')
        .insert({
          nama_pendaftaran: createComponentDto.namaPendaftaran,
          description: createComponentDto.description || null,
          kod_proses: JSON.stringify(processCodes), // Store as JSON string
          status: 1, // Default to active
          created_date: new Date(),
          updated_date: new Date(),
        })
        .returning('id_profiling_component'); // Return the inserted ID

      console.log('Insert result:', insertResult);

      if (!insertResult || insertResult.length === 0) {
        throw new Error('Failed to insert component into database');
      }

      // Fetch the created component
      const component = await knex('k_profiling_component')
        .where({ id_profiling_component: insertResult[0] })
        .first();

      console.log('Fetched component:', component);

      if (!component) {
        throw new Error('Failed to create component');
      }

      const result = {
        id: component.id_profiling_component,
        namaPendaftaran: component.nama_pendaftaran,
        description: component.description,
        kodProses: this.parseKodProses(component.kod_proses),
        status: component.status,
        createdAt: component.created_date,
        updatedAt: component.updated_date,
      };

      console.log('Returning result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  async findAll(): Promise<Component[]> {
    const components = await this.databaseService
      .connection('k_profiling_component')
      .select('*')
      .where('status', 1)
      .orderBy('created_date', 'desc');

    console.log('Components:', components);

    return components.map((component) => ({
      id: component.id_profiling_component,
      namaPendaftaran: component.nama_pendaftaran,
      description: component.description,
      kodProses: this.parseKodProses(component.kod_proses),
      status: component.status,
      createdAt: component.created_date,
      updatedAt: component.updated_date,
    }));
  }

  async findOne(id: string): Promise<Component | null> {
    const knex = this.databaseService.connection;

    const component = await knex('k_profiling_component')
      .where({ id_profiling_component: parseInt(id), status: 1 })
      .first();

    if (!component) return null;

    return {
      id: component.id_profiling_component,
      namaPendaftaran: component.nama_pendaftaran,
      description: component.description,
      kodProses: this.parseKodProses(component.kod_proses),
      status: component.status,
      createdAt: component.created_date,
      updatedAt: component.updated_date,
    };
  }

  async update(
    id: string,
    updateComponentDto: UpdateComponentDto,
  ): Promise<Component | null> {
    const knex = this.databaseService.connection;

    const existingComponent = await knex('k_profiling_component')
      .where({ id_profiling_component: parseInt(id), status: 1 })
      .first();

    if (!existingComponent) {
      throw new NotFoundException('Component not found');
    }

    // Check if name is being updated and if it conflicts with existing component
    if (
      updateComponentDto.namaPendaftaran &&
      updateComponentDto.namaPendaftaran !== existingComponent.nama_pendaftaran
    ) {
      const nameConflict = await knex('k_profiling_component')
        .where('nama_pendaftaran', updateComponentDto.namaPendaftaran)
        .where('status', 1)
        .whereNot('id_profiling_component', parseInt(id))
        .first();

      if (nameConflict) {
        throw new ConflictException('Component with this name already exists');
      }
    }

    const updatePayload: any = {};
    if (updateComponentDto.namaPendaftaran)
      updatePayload.nama_pendaftaran = updateComponentDto.namaPendaftaran;
    if (updateComponentDto.description !== undefined)
      updatePayload.description = updateComponentDto.description;
    if (updateComponentDto.kodProses) {
      // Extract only the process codes from the kodProses array
      const processCodes = updateComponentDto.kodProses.map(
        (process) => process.kodProses,
      );
      updatePayload.kod_proses = JSON.stringify(processCodes); // Store as JSON string
    }
    updatePayload.updated_date = new Date();

    // Update the record
    const updateResult = await knex('k_profiling_component')
      .where({ id_profiling_component: parseInt(id) })
      .update(updatePayload);

    if (updateResult === 0) return null;

    // Fetch the updated record
    const component = await knex('k_profiling_component')
      .where({ id_profiling_component: parseInt(id) })
      .first();

    if (!component) return null;

    return {
      id: component.id_profiling_component,
      namaPendaftaran: component.nama_pendaftaran,
      description: component.description,
      kodProses: this.parseKodProses(component.kod_proses),
      status: component.status,
      createdAt: component.created_date,
      updatedAt: component.updated_date,
    };
  }

  async remove(id: string): Promise<boolean> {
    const knex = this.databaseService.connection;

    const result = await knex('k_profiling_component')
      .where({ id_profiling_component: parseInt(id) })
      .update({
        status: 0, // Set to inactive instead of deleting
        updated_date: new Date(),
      });

    return result > 0;
  }

  async findComponentsWithProcesses(): Promise<any[]> {
    const knex = this.databaseService.connection;

    try {
      // Get all active components
      const components = await knex('k_profiling_component')
        .where('status', 1)
        .orderBy('created_date', 'desc');

      const result = [];

      for (const component of components) {
        // Parse the kod_proses JSON string to get process codes
        const processCodes = this.parseKodProses(component.kod_proses);

        // Fetch the actual process details for each code
        const processes = await knex('k_profiling_proses')
          .whereIn('kod_proses', processCodes)
          .where('status', 1);

        // Create a map for quick lookup
        const processMap = new Map();
        processes.forEach((process) => {
          processMap.set(process.kod_proses, process);
        });

        // Map processes in the order specified by processCodes
        const mappedProcesses = processCodes
          .map((kodProses) => {
            const process = processMap.get(kodProses);
            if (process) {
              return {
                id: process.id_profiling_proses,
                name: process.nama_proses,
                url: process.id_page,
              };
            }
            return null;
          })
          .filter((process) => process !== null);

        result.push({
          id: component.id_profiling_component,
          name: component.nama_pendaftaran,
          description: component.description,
          processes: mappedProcesses,
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching components with processes:', error);
      throw error;
    }
  }

  async findComponentWithProcessesById(componentId: string): Promise<any> {
    const knex = this.databaseService.connection;

    console.log('componentId:', componentId);

    try {
      // Get the specific component
      const component = await knex('k_profiling_component')
        .where({ id_profiling_component: parseInt(componentId), status: 1 })
        .first();

      if (!component) {
        throw new Error('Component not found');
      }

      // Parse the kod_proses JSON string to get process codes
      const processCodes = this.parseKodProses(component.kod_proses);

      console.log('processCodes:', processCodes);

      // Fetch the actual process details for each code
      const processes = await knex('k_profiling_proses')
        .whereIn('kod_proses', processCodes)
        .where('status', 1);

      // Create a map for quick lookup
      const processMap = new Map();
      processes.forEach((process) => {
        processMap.set(process.kod_proses, process);
      });

      // Map processes in the order specified by processCodes
      const mappedProcesses = processCodes
        .map((kodProses) => {
          const process = processMap.get(kodProses);
          if (process) {
            return {
              id: process.id_profiling_proses,
              name: process.nama_proses,
              url: process.id_page,
            };
          }
          return null;
        })
        .filter((process) => process !== null);

      console.log('mappedProcesses:', mappedProcesses);

      return {
        id: component.id_profiling_component,
        name: component.nama_pendaftaran,
        description: component.description,
        processes: mappedProcesses,
      };
    } catch (error) {
      console.error('Error fetching component with processes:', error);
      throw error;
    }
  }
}
