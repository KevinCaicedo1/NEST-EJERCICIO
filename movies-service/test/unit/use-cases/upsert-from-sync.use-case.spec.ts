import { Test, TestingModule } from '@nestjs/testing';
import { UpsertFromSyncUseCase } from '../../../src/application/use-cases/upsert-from-sync.use-case';
import type { MovieRepositoryPort } from '../../../src/domain/repositories/movie.repository.interface';
import { MOVIE_REPOSITORY } from '../../../src/domain/repositories/movie.repository.interface';
import { Movie } from '../../../src/domain/entities/movie.entity';
import { UpsertFromSyncDto } from '../../../src/application/dto/upsert-from-sync.dto';

describe('UpsertFromSyncUseCase', () => {
  let useCase: UpsertFromSyncUseCase;
  let repository: MovieRepositoryPort;

  const mockMovie = Movie.create({
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'A New Hope',
    swapiId: 1,
    episodeId: 4,
    director: 'George Lucas',
  });

  beforeEach(async () => {
    const mockRepository = {
      findBySwapiId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertFromSyncUseCase,
        {
          provide: MOVIE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpsertFromSyncUseCase>(UpsertFromSyncUseCase);
    repository = module.get<MovieRepositoryPort>(MOVIE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create new movie when not exists', async () => {
    const dto: UpsertFromSyncDto = {
      swapiId: 1,
      title: 'A New Hope',
      episode_id: 4,
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      opening_crawl: 'It is a period of civil war...',
      release_date: '1977-05-25',
    };

    (repository.findBySwapiId as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue(mockMovie);

    const result = await useCase.execute(dto);

    expect(result).toEqual(mockMovie);
    expect(repository.findBySwapiId).toHaveBeenCalledWith(1);
    expect(repository.create).toHaveBeenCalled();
  });

  it('should update existing movie when found', async () => {
    const dto: UpsertFromSyncDto = {
      swapiId: 1,
      title: 'Updated Title',
      episode_id: 4,
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      opening_crawl: 'Updated crawl...',
      release_date: '1977-05-25',
    };

    const updatedMovie = mockMovie.update({ title: 'Updated Title' });
    (repository.findBySwapiId as jest.Mock).mockResolvedValue(mockMovie);
    (repository.update as jest.Mock).mockResolvedValue(updatedMovie);

    const result = await useCase.execute(dto);

    expect(result).toEqual(updatedMovie);
    expect(repository.findBySwapiId).toHaveBeenCalledWith(1);
    expect(repository.update).toHaveBeenCalledWith(mockMovie.id, expect.any(Movie));
  });

  it('should handle date parsing correctly', async () => {
    const dto: UpsertFromSyncDto = {
      swapiId: 1,
      title: 'A New Hope',
      episode_id: 4,
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      opening_crawl: 'It is a period of civil war...',
      release_date: '1977-05-25',
    };

    (repository.findBySwapiId as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue(mockMovie);

    await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      releaseDate: expect.any(Date),
    }));
  });

  it('should handle undefined values in DTO', async () => {
    const dto: UpsertFromSyncDto = {
      swapiId: 1,
      title: 'A New Hope',
      episode_id: undefined,
      director: undefined,
      producer: undefined,
      opening_crawl: undefined,
      release_date: undefined,
    };

    (repository.findBySwapiId as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue(mockMovie);

    const result = await useCase.execute(dto);

    expect(result).toEqual(mockMovie);
    expect(repository.create).toHaveBeenCalled();
  });

  it('should handle missing required fields', async () => {
    const dto = {
      title: 'A New Hope',
      episode_id: 4,
    } as UpsertFromSyncDto;

    (repository.findBySwapiId as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue(mockMovie);

    const result = await useCase.execute(dto);

    expect(result).toEqual(mockMovie);
    expect(repository.create).toHaveBeenCalled();
  });
});