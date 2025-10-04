import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe,
  ValidationPipe,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { Role } from '../../../domain/enums/role.enum';
import type { MovieCrudUseCasePort } from '../../../application/ports/movie-crud.use-case.interface';
import { MOVIE_CRUD_USE_CASE } from '../../../application/ports/movie-crud.use-case.interface';
import { CreateMovieDto } from '../../../application/dto/create-movie.dto';
import { UpdateMovieDto } from '../../../application/dto/update-movie.dto';
import {
  MovieResponseDto,
  PaginatedMoviesResponseDto,
} from '../../../application/dto/movie-response.dto';

@ApiTags('Movies')
@Controller('movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    @Inject(MOVIE_CRUD_USE_CASE)
    private readonly movieCrudUseCase: MovieCrudUseCasePort,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listado paginado de películas (público)',
    description: 'Obtiene un listado paginado de todas las películas',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de películas',
    type: PaginatedMoviesResponseDto,
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<PaginatedMoviesResponseDto> {
    const result = await this.movieCrudUseCase.getAll(page, limit);
    return PaginatedMoviesResponseDto.fromDomain(
      result.items,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':id')
  @Roles(Role.USER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Detalle de película (solo USER - Usuarios Regulares)',
    description: 'Obtiene los detalles de una película específica. Requiere autenticación JWT con rol USER.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID UUID de la película',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Película encontrada',
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (USER requerido)',
  })
  @ApiResponse({
    status: 404,
    description: 'Película no encontrada',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MovieResponseDto> {
    const movie = await this.movieCrudUseCase.getById(id);
    return MovieResponseDto.fromDomain(movie);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva película (solo ADMIN)',
    description: 'Crea una nueva película. Requiere rol ADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Película creada exitosamente',
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (ADMIN requerido)',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async create(
    @Body(ValidationPipe) createMovieDto: CreateMovieDto,
  ): Promise<MovieResponseDto> {
    const movie = await this.movieCrudUseCase.create(createMovieDto);
    return MovieResponseDto.fromDomain(movie);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar película (solo ADMIN)',
    description: 'Actualiza los datos de una película existente. Requiere rol ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID UUID de la película',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Película actualizada exitosamente',
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (ADMIN requerido)',
  })
  @ApiResponse({
    status: 404,
    description: 'Película no encontrada',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateMovieDto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    const movie = await this.movieCrudUseCase.update(id, updateMovieDto);
    return MovieResponseDto.fromDomain(movie);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar película (solo ADMIN)',
    description: 'Elimina una película. Requiere rol ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID UUID de la película',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Película eliminada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (ADMIN requerido)',
  })
  @ApiResponse({
    status: 404,
    description: 'Película no encontrada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.movieCrudUseCase.delete(id);
  }
}
