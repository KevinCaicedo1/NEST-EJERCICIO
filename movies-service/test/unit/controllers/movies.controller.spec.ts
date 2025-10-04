import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from '../../../src/infrastructure/http/controllers/movies.controller';
import type { MovieCrudUseCasePort } from '../../../src/application/ports/movie-crud.use-case.interface';
import { MOVIE_CRUD_USE_CASE } from '../../../src/application/ports/movie-crud.use-case.interface';
import { Movie } from '../../../src/domain/entities/movie.entity';
import { CreateMovieDto } from '../../../src/application/dto/create-movie.dto';
import { UpdateMovieDto } from '../../../src/application/dto/update-movie.dto';

describe('MoviesController', () => {
  let controller: MoviesController;
  let movieCrudUseCase: MovieCrudUseCasePort;

  const mockMovie = Movie.create({
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'A New Hope',
    episodeId: 4,
    director: 'George Lucas',
  });

  beforeEach(async () => {
    const mockMovieCrudUseCase = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MOVIE_CRUD_USE_CASE,
          useValue: mockMovieCrudUseCase,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    movieCrudUseCase = module.get<MovieCrudUseCasePort>(MOVIE_CRUD_USE_CASE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated movies', async () => {
    const mockResult = { items: [mockMovie], total: 1, page: 1, limit: 10 };
    (movieCrudUseCase.getAll as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.findAll(1, 10);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(movieCrudUseCase.getAll).toHaveBeenCalledWith(1, 10);
  });

  it('should return a single movie', async () => {
    (movieCrudUseCase.getById as jest.Mock).mockResolvedValue(mockMovie);

    const result = await controller.findOne(mockMovie.id);

    expect(result.id).toBe(mockMovie.id);
    expect(movieCrudUseCase.getById).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should create a new movie', async () => {
    const createDto: CreateMovieDto = { title: 'New Movie', episode_id: 1 };
    (movieCrudUseCase.create as jest.Mock).mockResolvedValue(mockMovie);

    const result = await controller.create(createDto);

    expect(result.title).toBe(mockMovie.title);
    expect(movieCrudUseCase.create).toHaveBeenCalledWith(createDto);
  });

  it('should update a movie', async () => {
    const updateDto: UpdateMovieDto = { title: 'Updated Movie' };
    (movieCrudUseCase.update as jest.Mock).mockResolvedValue(mockMovie);

    const result = await controller.update(mockMovie.id, updateDto);

    expect(result.title).toBe(mockMovie.title);
    expect(movieCrudUseCase.update).toHaveBeenCalledWith(mockMovie.id, updateDto);
  });

  it('should delete a movie', async () => {
    (movieCrudUseCase.delete as jest.Mock).mockResolvedValue(undefined);

    await controller.remove(mockMovie.id);

    expect(movieCrudUseCase.delete).toHaveBeenCalledWith(mockMovie.id);
  });
});