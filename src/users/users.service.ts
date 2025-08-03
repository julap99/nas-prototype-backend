import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const knex = this.databaseService.connection;

    // Check if user already exists
    const existingUser = await knex('users')
      .where('email', createUserDto.email)
      .first();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Create user
    const insertResult = await knex('users')
      .insert({
        email: createUserDto.email,
        password: hashedPassword,
        full_name: createUserDto.fullName,
        role: createUserDto.role || 'asnaf', // Default to 'asnaf' role
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

    // Fetch the created user
    const user = await knex('users')
      .where({ id: insertResult[0] })
      .first();

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.databaseService
      .connection('users')
      .select('*')
      .where('is_active', true);

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.databaseService
      .connection('users')
      .where({ id, is_active: true })
      .first();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findByEmail(
    email: string,
  ): Promise<(User & { password: string }) | null> {
    const user = await this.databaseService
      .connection('users')
      .where({ email, is_active: true })
      .first();

    console.log('user: ', user);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      password: user.password,
    };
  }

  async update(
    id: number,
    updateData: Partial<CreateUserDto>,
  ): Promise<User | null> {
    const updatePayload: any = {};

    if (updateData.email) updatePayload.email = updateData.email;
    if (updateData.fullName) updatePayload.full_name = updateData.fullName;
    if (updateData.role) updatePayload.role = updateData.role;
    if (updateData.password) {
      const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
      updatePayload.password = await bcrypt.hash(
        updateData.password,
        saltRounds,
      );
    }

    // Update the user
    const updateResult = await this.databaseService
      .connection('users')
      .where({ id })
      .update(updatePayload);

    if (updateResult === 0) return null;

    // Fetch the updated user
    const user = await this.databaseService
      .connection('users')
      .where({ id })
      .first();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.databaseService
      .connection('users')
      .where({ id })
      .update({ is_active: false });

    return result > 0;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId: number): Promise<void> {
    const knex = this.databaseService.connection;

    await knex('users').where('id', userId).update({
      last_login_at: new Date(),
      updated_at: new Date(),
    });
  }
}
