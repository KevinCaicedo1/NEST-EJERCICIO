import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../../domain/entities/movie.entity';

export class MovieResponseDto {
  @ApiProperty({
    description: 'ID único de la película',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID de SWAPI (null si es película manual)',
    example: 1,
    nullable: true,
  })
  swapiId: number | null;

  @ApiProperty({
    description: 'Título de la película',
    example: 'A New Hope',
  })
  title: string;

  @ApiProperty({
    description: 'Número de episodio',
    example: 4,
    nullable: true,
  })
  episode_id: number | null;

  @ApiProperty({
    description: 'Texto de apertura',
    example: 'It is a period of civil war...',
    nullable: true,
  })
  opening_crawl: string | null;

  @ApiProperty({
    description: 'Director de la película',
    example: 'George Lucas',
    nullable: true,
  })
  director: string | null;

  @ApiProperty({
    description: 'Productor de la película',
    example: 'Gary Kurtz, Rick McCallum',
    nullable: true,
  })
  producer: string | null;

  @ApiProperty({
    description: 'Fecha de lanzamiento',
    example: '1977-05-25',
    nullable: true,
  })
  release_date: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  static fromDomain(movie: Movie): MovieResponseDto {
    const formatDate = (date: Date | string | null): string | null => {
      if (!date) return null;
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return date;
    };

    const formatTimestamp = (timestamp: Date | string): string => {
      if (timestamp instanceof Date) return timestamp.toISOString();
      return timestamp;
    };

    return {
      id: movie.id,
      swapiId: movie.swapiId,
      title: movie.title,
      episode_id: movie.episodeId,
      opening_crawl: movie.openingCrawl,
      director: movie.director,
      producer: movie.producer,
      release_date: formatDate(movie.releaseDate),
      createdAt: formatTimestamp(movie.createdAt),
      updatedAt: formatTimestamp(movie.updatedAt),
    };
  }
}

export class PaginatedMoviesResponseDto {
  @ApiProperty({
    description: 'Lista de películas',
    type: [MovieResponseDto],
  })
  items: MovieResponseDto[];

  @ApiProperty({
    description: 'Total de películas',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Límite por página',
    example: 10,
  })
  limit: number;

  static fromDomain(
    items: Movie[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedMoviesResponseDto {
    return {
      items: items.map((movie) => MovieResponseDto.fromDomain(movie)),
      total,
      page,
      limit,
    };
  }
}
