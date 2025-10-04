import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmMovieRepository } from '../../../src/infrastructure/persistence/typeorm/repositories/movie.repository';
import { MovieEntity } from '../../../src/infrastructure/persistence/typeorm/entities/movie.entity';
import { Movie } from '../../../src/domain/entities/movie.entity';

describe('TypeOrmMovieRepository', () => {
  let repository: TypeOrmMovieRepository;
  let typeormRepository: Repository<MovieEntity>;

  const mockMovieEntity: MovieEntity = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'A New Hope',
    swapiId: 1,
    episodeId: 4,
    openingCrawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    releaseDate: new Date('1977-05-25'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockMovie = Movie.create({
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'A New Hope',
    swapiId: 1,
    episodeId: 4,
    director: 'George Lucas',
  });

  beforeEach(async () => {
    const mockTypeormRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmMovieRepository,
        {
          provide: getRepositoryToken(MovieEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmMovieRepository>(TypeOrmMovieRepository);
    typeormRepository = module.get<Repository<MovieEntity>>(getRepositoryToken(MovieEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated movies', async () => {
    (typeormRepository.findAndCount as jest.Mock).mockResolvedValue([[mockMovieEntity], 1]);

    const result = await repository.findAll(1, 10);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(typeormRepository.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: { createdAt: 'DESC' },
    });
  });

  it('should find movie by id', async () => {
    (typeormRepository.findOne as jest.Mock).mockResolvedValue(mockMovieEntity);

    const result = await repository.findById(mockMovieEntity.id);

    expect(result).toBeInstanceOf(Movie);
    expect(result?.id).toBe(mockMovieEntity.id);
  });

  it('should find movie by SWAPI id', async () => {
    (typeormRepository.findOne as jest.Mock).mockResolvedValue(mockMovieEntity);

    const result = await repository.findBySwapiId(1);

    expect(result).toBeInstanceOf(Movie);
    expect(result?.swapiId).toBe(1);
  });

  it('should create a new movie', async () => {
    (typeormRepository.save as jest.Mock).mockResolvedValue(mockMovieEntity);

    const result = await repository.create(mockMovie);

    expect(result).toBeInstanceOf(Movie);
    expect(typeormRepository.save).toHaveBeenCalled();
  });

  it('should update an existing movie', async () => {
    const updatedEntity = { ...mockMovieEntity, title: 'Updated Title' };
    (typeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
    (typeormRepository.findOne as jest.Mock).mockResolvedValue(updatedEntity);

    const result = await repository.update(mockMovie.id, mockMovie);

    expect(result).toBeInstanceOf(Movie);
    expect(typeormRepository.update).toHaveBeenCalled();
    expect(typeormRepository.findOne).toHaveBeenCalled();
  });
});