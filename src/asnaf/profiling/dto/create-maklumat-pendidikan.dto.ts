import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsIn, IsNumber, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaklumatPendidikanDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  asnafUuid: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  masihBersekolah?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  pendidikanTertinggi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  lainLainPendidikanTertinggi?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['Peringkat Rendah', 'SRP/PMR', 'SPM', 'Sijil', 'Diploma', 'STPM', 'Ijazah', 'Lain-lain'], { each: true })
  tahapPendidikanDicapai?: string[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsIn([0, 1])
  status?: number;
} 