import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SwapiSyncService } from '../../../src/infrastructure/services/swapi-sync.service';
import type { UpsertFromSyncUseCasePort } from '../../../src/application/ports/upsert-from-sync.use-case.interface';
import { UPSERT_FROM_SYNC_USE_CASE } from '../../../src/application/ports/upsert-from-sync.use-case.interface';

// Mock global fetch
global.fetch = jest.fn();

describe('SwapiSyncService', () => {
  let service: SwapiSyncService;
  let upsertFromSyncUseCase: UpsertFromSyncUseCasePort;

  const mockSwapiFilm = {
    episode_id: 4,
    title: 'A New Hope',
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    url: 'https://swapi.dev/api/films/1/',
  };

  const mockSwapiResponse = {
    results: [mockSwapiFilm],
  };

  beforeEach(async () => {
    const mockUpsertFromSyncUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapiSyncService,
        {
          provide: UPSERT_FROM_SYNC_USE_CASE,
          useValue: mockUpsertFromSyncUseCase,
        },
      ],
    }).compile();

    service = module.get<SwapiSyncService>(SwapiSyncService);
    upsertFromSyncUseCase = module.get<UpsertFromSyncUseCasePort>(UPSERT_FROM_SYNC_USE_CASE);

    // Mock Logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should successfully sync movies from SWAPI', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockSwapiResponse),
    } as any;
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    (upsertFromSyncUseCase.execute as jest.Mock).mockResolvedValue(undefined);

    await service.syncMoviesFromSwapi();

    expect(fetch).toHaveBeenCalledWith('https://swapi.dev/api/films/');
    expect(upsertFromSyncUseCase.execute).toHaveBeenCalledWith({
      swapiId: 1,
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      release_date: '1977-05-25',
    });
  });

  it('should handle SWAPI API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
    } as any;
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    await service.syncMoviesFromSwapi();

    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('should extract SWAPI ID from URL correctly', () => {
    const url = 'https://swapi.dev/api/films/1/';
    const result = (service as any).extractSwapiIdFromUrl(url);
    expect(result).toBe(1);
  });

  it('should handle individual movie sync errors', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockSwapiResponse),
    } as any;
    (fetch as jest.Mock).mockResolvedValue(mockResponse);
    (upsertFromSyncUseCase.execute as jest.Mock).mockRejectedValue(new Error('Database error'));

    await service.syncMoviesFromSwapi();

    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('should execute manual synchronization', async () => {
    const syncSpy = jest.spyOn(service, 'syncMoviesFromSwapi').mockResolvedValue();

    await service.manualSync();

    expect(syncSpy).toHaveBeenCalled();
  });
});