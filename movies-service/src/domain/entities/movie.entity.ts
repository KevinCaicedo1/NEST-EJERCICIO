export class Movie {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly swapiId: number | null,
    public readonly episodeId: number | null,
    public readonly openingCrawl: string | null,
    public readonly director: string | null,
    public readonly producer: string | null,
    public readonly releaseDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    title: string;
    swapiId?: number | null;
    episodeId?: number | null;
    openingCrawl?: string | null;
    director?: string | null;
    producer?: string | null;
    releaseDate?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Movie {
    return new Movie(
      props.id,
      props.title,
      props.swapiId ?? null,
      props.episodeId ?? null,
      props.openingCrawl ?? null,
      props.director ?? null,
      props.producer ?? null,
      props.releaseDate ?? null,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  update(props: {
    title?: string;
    episodeId?: number | null;
    openingCrawl?: string | null;
    director?: string | null;
    producer?: string | null;
    releaseDate?: Date | null;
  }): Movie {
    return new Movie(
      this.id,
      props.title ?? this.title,
      this.swapiId,
      props.episodeId !== undefined ? props.episodeId : this.episodeId,
      props.openingCrawl !== undefined
        ? props.openingCrawl
        : this.openingCrawl,
      props.director !== undefined ? props.director : this.director,
      props.producer !== undefined ? props.producer : this.producer,
      props.releaseDate !== undefined ? props.releaseDate : this.releaseDate,
      this.createdAt,
      new Date(),
    );
  }
}
