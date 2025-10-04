import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  MovieRepositoryPort,
  PaginationResult,
} from '../../../../domain/repositories/movie.repository.interface';
import { Movie } from '../../../../domain/entities/movie.entity';
import { MovieEntity } from '../entities/movie.entity';
import { MovieMapper } from '../mappers/movie.mapper';

@Injectable()
export class TypeOrmMovieRepository implements MovieRepositoryPort {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly repository: Repository<MovieEntity>,
  ) {}

  async findAll(page: number, limit: number): Promise<PaginationResult<Movie>> {
    const skip = (page - 1) * limit;

    const [entities, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: entities.map((entity) => MovieMapper.toDomain(entity)),
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<Movie | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MovieMapper.toDomain(entity) : null;
  }

  async findBySwapiId(swapiId: number): Promise<Movie | null> {
    const entity = await this.repository.findOne({ where: { swapiId } });
    return entity ? MovieMapper.toDomain(entity) : null;
  }

  async create(movie: Movie): Promise<Movie> {
    const entity = MovieMapper.toPersistence(movie);
    const saved = await this.repository.save(entity);
    return MovieMapper.toDomain(saved);
  }

  async update(id: string, movie: Movie): Promise<Movie> {
    const entity = MovieMapper.toPersistence(movie);
    await this.repository.update(id, entity);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('Movie not found after update');
    }
    return MovieMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
