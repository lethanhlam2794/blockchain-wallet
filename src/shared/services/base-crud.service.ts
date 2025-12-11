import {
  Any,
  DeleteResult,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  IsNull,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as queryHelper from '../helpers/query-helper';
import { mergeRefCodeToMetadata } from '../helpers/refcode';
import { PaginationResult, RunnerUser } from '../interfaces';
import { PaginationDTO } from '../models/pagination.dto';

@Injectable()
export abstract class BaseCRUDService<T extends ObjectLiteral> {
  constructor(public model: Repository<any>) {}

  public async create(dto: Partial<T>, refCode?: string): Promise<T> {
    // Thêm refCode vào metadata nếu có
    if (refCode && dto && (dto as any).metadata !== undefined) {
      (dto as any).metadata = mergeRefCodeToMetadata(
        (dto as any).metadata,
        refCode,
      );
    }

    const created: T = await this.model.save(dto);

    return this.findByID(created.id);
  }

  public async findOneOrCreate(
    filter: FindOptionsWhere<Partial<T>>,
    dto: Partial<T>,
  ): Promise<T> {
    const found = await this.findOne(filter);

    if (found) return found;

    return this.create(dto);
  }

  public async createWithOpts(dto: Partial<T>, opts: RunnerUser): Promise<T> {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    const insertResult = await queryBuilder
      .insert()
      .into(this.model.target)
      .values(dto)
      .execute();

    return Array.isArray(insertResult.raw) && insertResult.raw.length === 1
      ? insertResult.raw[0]
      : insertResult.raw;
  }

  public async updateByIdWithOpts(
    id: number | string,
    dto: Partial<T>,
    opts: RunnerUser,
  ) {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    await queryBuilder.update().set(dto).whereInIds(id).execute();

    return this.findByID(id);
  }

  public async deleteByIdWithOpts(
    id: number | string,
    opts: RunnerUser & { isSoft?: boolean },
  ) {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    const deleteSmt = opts.isSoft
      ? queryBuilder.softDelete()
      : queryBuilder.delete();

    await deleteSmt.whereInIds(id).execute();
  }

  public findByID(id: number | string): Promise<T> {
    return this.model.findOneBy({ id, deletedAt: IsNull() });
  }

  public findByIdWithOpts(id: number | string, opts: RunnerUser): Promise<T> {
    const queryBuilder = this.model.createQueryBuilder(opts.alias, opts.runner);

    return queryBuilder.where({ id }).getOne();
  }

  public count(
    filter: FindOptionsWhere<Partial<T>>,
    options: { withDeleted?: boolean } = { withDeleted: false },
  ): Promise<number> {
    return this.model.count({
      withDeleted: options.withDeleted,
      where: filter,
    });
  }

  public deleteOne(filter: any): Promise<DeleteResult> {
    return this.model.softDelete(filter);
  }

  public findOne(
    filter: FindOptionsWhere<T>,
    options: {
      select?: FindOptionsSelect<T>;
      relations?: FindOptionsRelations<T>;
      order?: FindOptionsOrder<T>;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<T> {
    return this.model.findOne({
      where: filter,
      withDeleted: options.withDeleted,
      order: options.order,
      select: options.select,
      relations: options.relations,
    });
  }

  public findOneWithOr(
    filter: FindOptionsWhere<Partial<T>>[],
    options: {
      select?: FindOptionsSelect<T>;
      relations?: FindOptionsRelations<T>;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<T> {
    return this.model.findOne({
      where: filter,
      withDeleted: options.withDeleted,
      select: options.select,
      relations: options.relations,
    });
  }

  public async deleteByID(entityID: number | string): Promise<void> {
    await this.model.softDelete({ id: entityID });
  }

  public async findAll(
    filter?: FindOptionsWhere<Partial<T>>,
    options: {
      select?: FindOptionsSelect<any>;
      relations?: FindOptionsRelations<any>;
      sort?: string;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<T[]> {
    const parsedSort = queryHelper.parseSort(options.sort);

    const data = await this.model.find({
      order: parsedSort,
      select: options.select,
      relations: options.relations,
      withDeleted: options.withDeleted,
      where: filter,
    });

    return data;
  }

  protected parseLimit(limit: number) {
    return limit || 10;
  }

  protected parseOffset(offset: number) {
    return offset || 0;
  }

  public async paginate(
    dto: PaginationDTO,
    filter?: FindOptionsWhere<any> | FindOptionsWhere<any>[],
    options: {
      select?: FindOptionsSelect<any>;
      relations?: FindOptionsRelations<any>;
      withDeleted?: boolean;
    } = { withDeleted: false },
  ): Promise<PaginationResult<T>> {
    const limit = this.parseLimit(dto.limit);
    const offset = this.parseOffset(dto.offset);

    const where = filter ?? {};

    const totalCount = await this.model.count({
      withDeleted: options.withDeleted,
      where,
    });

    if (totalCount === 0) {
      return {
        rows: [],
        total: 0,
        limit,
        offset,
      };
    }

    const parsedSort = queryHelper.parseSort(dto.sort);

    const data = await this.model.find({
      take: limit,
      skip: offset,
      order: parsedSort,
      select: options.select,
      relations: options.relations,
      withDeleted: options.withDeleted,
      where,
    });

    return {
      rows: data,
      total: totalCount,
      limit,
      offset,
    };
  }

  public async bulkUpdateByIDs(
    ids: (number | string)[],
    dto: Partial<T>,
  ): Promise<void> {
    if (!ids?.length) {
      throw new InternalServerErrorException('ids list must not be empty');
    }

    await this.model.update({ id: Any(ids), deletedAt: IsNull() }, dto);
  }

  public async bulkUpdate(
    filter: Record<string, any>,
    dto: Partial<T>,
  ): Promise<void> {
    await this.model.update(filter, dto);
  }

  public async updateByID(id: number | string, dto: Partial<T>): Promise<T> {
    if (!id) {
      throw new InternalServerErrorException('missing id for update');
    }

    await this.model.update({ id, deletedAt: IsNull() }, dto);

    return this.findByID(id);
  }

  public async bulkCreate(dto: Partial<T>[]): Promise<T[]> {
    const insertResult = await this.model.insert(dto);

    const insertedRows = insertResult.identifiers;

    return Promise.all(insertedRows.map((item) => this.findByID(item.id)));
  }

  public async updateOneWithOpts(
    filter: Record<string, any>,
    dto: Partial<T>,
    opts: RunnerUser,
  ) {
    if (opts?.alias && opts?.runner) {
      const queryBuilder = this.model.createQueryBuilder(
        opts.alias,
        opts.runner,
      );
      await queryBuilder.update().set(dto).where(filter).execute();
    } else {
      await this.model.update(filter, dto);
    }

    return this.findOne(filter);
  }

  public async updateOne(
    filter: Record<string, any>,
    dto: Partial<T>,
  ): Promise<T> {
    if (!filter) {
      throw new InternalServerErrorException('missing filter for update');
    }

    await this.model.update({ ...filter, deletedAt: IsNull() }, dto);

    return this.findOne(filter);
  }

  public async sum(
    columnName: string,
    filter: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<number> {
    const result = await this.model.sum(columnName, filter);

    return result || 0;
  }
}
