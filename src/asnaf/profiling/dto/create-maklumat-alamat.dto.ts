import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsIn, IsNumber, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaklumatAlamatDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  asnafUuid: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  alamat1: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  alamat2: string;

  @IsOptional()
  @IsArray()
  documents?: Array<{
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
  }>;
}