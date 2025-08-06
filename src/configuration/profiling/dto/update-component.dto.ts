import { IsOptional, IsString, MaxLength, IsArray, ValidateNested, ArrayMinSize, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ProcessDto {
  @IsNotEmpty()
  @IsString()
  kodProses: string;
}

export class UpdateComponentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  namaPendaftaran?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProcessDto)
  kodProses?: ProcessDto[]; // Array of process objects with flow order

  @IsOptional()
  @IsString()
  kodKomponen?: string; // Not updatable, but included for completeness
} 