import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('movies')
export class MovieEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'swapi_id', type: 'integer', nullable: true, unique: true })
  swapiId: number | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ name: 'episode_id', type: 'integer', nullable: true })
  episodeId: number | null;

  @Column({ name: 'opening_crawl', type: 'text', nullable: true })
  openingCrawl: string | null;

  @Column({ type: 'text', nullable: true })
  director: string | null;

  @Column({ type: 'text', nullable: true })
  producer: string | null;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
