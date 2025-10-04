import type { Movie } from '../../domain/entities/movie.entity';
import type { UpsertFromSyncDto } from '../dto/upsert-from-sync.dto';

export interface UpsertFromSyncUseCasePort {
  execute(dto: UpsertFromSyncDto): Promise<Movie>;
}

export const UPSERT_FROM_SYNC_USE_CASE = Symbol('UPSERT_FROM_SYNC_USE_CASE');
