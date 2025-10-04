import type { Movie } from '../../domain/entities/movie.entity';
import type { PaginationResult } from '../../domain/repositories/movie.repository.interface';
import type { CreateMovieDto } from '../dto/create-movie.dto';
import type { UpdateMovieDto } from '../dto/update-movie.dto';

export interface MovieCrudUseCasePort {
  getAll(page: number, limit: number): Promise<PaginationResult<Movie>>;
  getById(id: string): Promise<Movie>;
  create(dto: CreateMovieDto): Promise<Movie>;
  update(id: string, dto: UpdateMovieDto): Promise<Movie>;
  delete(id: string): Promise<void>;
}

export const MOVIE_CRUD_USE_CASE = Symbol('MOVIE_CRUD_USE_CASE');
