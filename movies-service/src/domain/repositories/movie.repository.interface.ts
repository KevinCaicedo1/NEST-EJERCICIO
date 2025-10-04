import { Movie } from '../entities/movie.entity';

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MovieRepositoryPort {
  findAll(page: number, limit: number): Promise<PaginationResult<Movie>>;
  findById(id: string): Promise<Movie | null>;
  findBySwapiId(swapiId: number): Promise<Movie | null>;
  create(movie: Movie): Promise<Movie>;
  update(id: string, movie: Movie): Promise<Movie>;
  delete(id: string): Promise<void>;
}

export const MOVIE_REPOSITORY = Symbol('MOVIE_REPOSITORY');
