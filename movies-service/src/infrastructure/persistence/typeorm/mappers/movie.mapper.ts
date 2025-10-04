import { Movie } from '../../../../domain/entities/movie.entity';
import { MovieEntity } from '../entities/movie.entity';

export class MovieMapper {
  static toDomain(entity: MovieEntity): Movie {
    return new Movie(
      entity.id,
      entity.title,
      entity.swapiId,
      entity.episodeId,
      entity.openingCrawl,
      entity.director,
      entity.producer,
      entity.releaseDate,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: Movie): MovieEntity {
    const entity = new MovieEntity();
    entity.id = domain.id;
    entity.swapiId = domain.swapiId;
    entity.title = domain.title;
    entity.episodeId = domain.episodeId;
    entity.openingCrawl = domain.openingCrawl;
    entity.director = domain.director;
    entity.producer = domain.producer;
    entity.releaseDate = domain.releaseDate;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
