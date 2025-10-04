import { Inject, Injectable } from '@nestjs/common';
import type { MovieRepositoryPort } from '../../domain/repositories/movie.repository.interface';
import { MOVIE_REPOSITORY } from '../../domain/repositories/movie.repository.interface';
import { Movie } from '../../domain/entities/movie.entity';
import type { UpsertFromSyncUseCasePort } from '../ports/upsert-from-sync.use-case.interface';
import { UpsertFromSyncDto } from '../dto/upsert-from-sync.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UpsertFromSyncUseCase implements UpsertFromSyncUseCasePort {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: MovieRepositoryPort,
  ) {}

  async execute(dto: UpsertFromSyncDto): Promise<Movie> {
    const existingMovie = await this.movieRepository.findBySwapiId(dto.swapiId);

    if (existingMovie) {
      const updatedMovie = existingMovie.update({
        title: dto.title,
        episodeId: dto.episode_id ?? null,
        openingCrawl: dto.opening_crawl ?? null,
        director: dto.director ?? null,
        producer: dto.producer ?? null,
        releaseDate: dto.release_date ? new Date(dto.release_date) : null,
      });

      return this.movieRepository.update(existingMovie.id, updatedMovie);
    }

    const newMovie = Movie.create({
      id: uuidv4(),
      title: dto.title,
      swapiId: dto.swapiId,
      episodeId: dto.episode_id ?? null,
      openingCrawl: dto.opening_crawl ?? null,
      director: dto.director ?? null,
      producer: dto.producer ?? null,
      releaseDate: dto.release_date ? new Date(dto.release_date) : null,
    });

    return this.movieRepository.create(newMovie);
  }
}
