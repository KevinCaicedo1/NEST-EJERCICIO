import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { MovieRepositoryPort } from '../../domain/repositories/movie.repository.interface';
import {
  MOVIE_REPOSITORY,
  PaginationResult,
} from '../../domain/repositories/movie.repository.interface';
import { Movie } from '../../domain/entities/movie.entity';
import type { MovieCrudUseCasePort } from '../ports/movie-crud.use-case.interface';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MovieCrudUseCase implements MovieCrudUseCasePort {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: MovieRepositoryPort,
  ) {}

  async getAll(page: number, limit: number): Promise<PaginationResult<Movie>> {
    return this.movieRepository.findAll(page, limit);
  }

  async getById(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    const movie = Movie.create({
      id: uuidv4(),
      title: dto.title,
      episodeId: dto.episode_id ?? null,
      openingCrawl: dto.opening_crawl ?? null,
      director: dto.director ?? null,
      producer: dto.producer ?? null,
      releaseDate: dto.release_date ? new Date(dto.release_date) : null,
    });

    return this.movieRepository.create(movie);
  }

  async update(id: string, dto: UpdateMovieDto): Promise<Movie> {
    const existingMovie = await this.movieRepository.findById(id);

    if (!existingMovie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    const updatedMovie = existingMovie.update({
      title: dto.title,
      episodeId: dto.episode_id,
      openingCrawl: dto.opening_crawl,
      director: dto.director,
      producer: dto.producer,
      releaseDate: dto.release_date ? new Date(dto.release_date) : undefined,
    });

    return this.movieRepository.update(id, updatedMovie);
  }

  async delete(id: string): Promise<void> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    await this.movieRepository.delete(id);
  }
}
