import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { UpsertFromSyncUseCasePort } from '../../application/ports/upsert-from-sync.use-case.interface';
import { UPSERT_FROM_SYNC_USE_CASE } from '../../application/ports/upsert-from-sync.use-case.interface';

interface SwapiFilm {
  episode_id: number;
  title: string;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  url: string;
}

interface SwapiResponse {
  results: SwapiFilm[];
}

@Injectable()
export class SwapiSyncService {
  private readonly logger = new Logger(SwapiSyncService.name);
  private readonly SWAPI_URL = 'https://swapi.dev/api/films/';

  constructor(
    @Inject(UPSERT_FROM_SYNC_USE_CASE)
    private readonly upsertFromSyncUseCase: UpsertFromSyncUseCasePort,
  ) {}
  
  @Cron(CronExpression.EVERY_MINUTE)
  async syncMoviesFromSwapi(): Promise<void> {
    this.logger.log('Iniciando sincronización de películas desde SWAPI...');

    try {
      const response = await fetch(this.SWAPI_URL);
      
      if (!response.ok) {
        throw new Error(`Error al consultar SWAPI: ${response.status}`);
      }

      const data: SwapiResponse = await response.json();
      this.logger.log(`Se encontraron ${data.results.length} películas en SWAPI`);

      let successCount = 0;
      let errorCount = 0;

      for (const film of data.results) {
        try {
          const swapiId = this.extractSwapiIdFromUrl(film.url);
          
          await this.upsertFromSyncUseCase.execute({
            swapiId,
            title: film.title,
            episode_id: film.episode_id,
            opening_crawl: film.opening_crawl,
            director: film.director,
            producer: film.producer,
            release_date: film.release_date,
          });

          successCount++;
          this.logger.debug(`Película sincronizada: ${film.title}`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Error al sincronizar película ${film.title}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Sincronización completada - Exitosos: ${successCount}, Errores: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error('Error en la sincronización de SWAPI:', error);
    }
  }

  private extractSwapiIdFromUrl(url: string): number {
    const regex = /\/films\/(\d+)\//;
    const match = regex.exec(url);
    if (!match) {
      throw new Error(`No se pudo extraer el ID de la URL: ${url}`);
    }
    return parseInt(match[1], 10);
  }

  async manualSync(): Promise<void> {
    this.logger.log('Ejecutando sincronización manual...');
    await this.syncMoviesFromSwapi();
  }
}
