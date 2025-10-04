import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Título de la película',
    example: 'A New Hope',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Número de episodio',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  episode_id?: number;

  @ApiPropertyOptional({
    description: 'Texto de apertura',
    example: 'It is a period of civil war...',
  })
  @IsOptional()
  @IsString()
  opening_crawl?: string;

  @ApiPropertyOptional({
    description: 'Director de la película',
    example: 'George Lucas',
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({
    description: 'Productor de la película',
    example: 'Gary Kurtz, Rick McCallum',
  })
  @IsOptional()
  @IsString()
  producer?: string;

  @ApiPropertyOptional({
    description: 'Fecha de lanzamiento (formato ISO)',
    example: '1977-05-25',
  })
  @IsOptional()
  @IsDateString()
  release_date?: string;
}
