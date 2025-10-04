import { Test, TestingModule } from '@nestjs/testing';
import { MovieCrudUseCase } from '../../../src/application/use-cases/movie-crud.use-case';
import type { MovieRepositoryPort } from '../../../src/domain/repositories/movie.repository.interface';
import { MOVIE_REPOSITORY } from '../../../src/domain/repositories/movie.repository.interface';
import { Movie } from '../../../src/domain/entities/movie.entity';
import { CreateMovieDto } from '../../../src/application/dto/create-movie.dto';
import { UpdateMovieDto } from '../../../src/application/dto/update-movie.dto';

describe('MovieCrudUseCase', () => {
  let useCase: MovieCrudUseCase;
  let repository: MovieRepositoryPort;

  const mockMovie = Movie.create({
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'A New Hope',
    episodeId: 4,
    director: 'George Lucas',
  });

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieCrudUseCase,
        {
          provide: MOVIE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<MovieCrudUseCase>(MovieCrudUseCase);
    repository = module.get<MovieRepositoryPort>(MOVIE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated movies', async () => {
    const mockResult = { items: [mockMovie], total: 1, page: 1, limit: 10 };
    (repository.findAll as jest.Mock).mockResolvedValue(mockResult);

    const result = await useCase.getAll(1, 10);

    expect(result).toEqual(mockResult);
    expect(repository.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('should return movie by id', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(mockMovie);

    const result = await useCase.getById(mockMovie.id);

    expect(result).toEqual(mockMovie);
    expect(repository.findById).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should create a new movie', async () => {
    const createDto: CreateMovieDto = { title: 'New Movie', episode_id: 1 };
    (repository.create as jest.Mock).mockResolvedValue(mockMovie);

    const result = await useCase.create(createDto);

    expect(result).toEqual(mockMovie);
    expect(repository.create).toHaveBeenCalled();
  });

  it('should update a movie', async () => {
    const updateDto: UpdateMovieDto = { title: 'Updated Movie' };
    (repository.findById as jest.Mock).mockResolvedValue(mockMovie);
    (repository.update as jest.Mock).mockResolvedValue(mockMovie);

    const result = await useCase.update(mockMovie.id, updateDto);

    expect(result).toEqual(mockMovie);
    expect(repository.findById).toHaveBeenCalledWith(mockMovie.id);
    expect(repository.update).toHaveBeenCalledWith(mockMovie.id, expect.any(Movie));
  });

  it('should delete a movie', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(mockMovie);
    (repository.delete as jest.Mock).mockResolvedValue(undefined);

    await useCase.delete(mockMovie.id);

    expect(repository.findById).toHaveBeenCalledWith(mockMovie.id);
    expect(repository.delete).toHaveBeenCalledWith(mockMovie.id);
  });
});