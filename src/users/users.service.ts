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
    const [userId] = await knex('users').insert({
      email: createUserDto.email,
      password: hashedPassword,
      full_name: createUserDto.fullName,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.findById(userId);
  }

  async findById(id: number): Promise<User> {
    const knex = this.databaseService.connection;

    const user = await knex('users')
      .select(
        'id',
        'email',
        'full_name',
        'is_active',
        'created_at',
        'updated_at',
      )
      .where('id', id)
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findByEmail(email: string): Promise<User & { password: string }> {
    const knex = this.databaseService.connection;

    const user = await knex('users').select('*').where('email', email).first();

    console.log('User:', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.full_name,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
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
