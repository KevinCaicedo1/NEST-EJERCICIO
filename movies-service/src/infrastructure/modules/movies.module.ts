import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from '../persistence/typeorm/entities/movie.entity';
import { TypeOrmMovieRepository } from '../persistence/typeorm/repositories/movie.repository';
import { MOVIE_REPOSITORY } from '../../domain/repositories/movie.repository.interface';
import { MoviesController } from '../http/controllers/movies.controller';
import { MovieCrudUseCase } from '../../application/use-cases/movie-crud.use-case';
import { UpsertFromSyncUseCase } from '../../application/use-cases/upsert-from-sync.use-case';
import { MOVIE_CRUD_USE_CASE } from '../../application/ports/movie-crud.use-case.interface';
import { UPSERT_FROM_SYNC_USE_CASE } from '../../application/ports/upsert-from-sync.use-case.interface';
import { SwapiSyncService } from '../services/swapi-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity])],
  controllers: [MoviesController],
  providers: [
    {
      provide: MOVIE_REPOSITORY,
      useClass: TypeOrmMovieRepository,
    },
    {
      provide: MOVIE_CRUD_USE_CASE,
      useClass: MovieCrudUseCase,
    },
    {
      provide: UPSERT_FROM_SYNC_USE_CASE,
      useClass: UpsertFromSyncUseCase,
    },
    SwapiSyncService,
  ],
})
export class MoviesModule {}
