import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async logChange(
    entityName: string,
    entityId: string,
    action: string,
    changes: any,
    userId?: string,
    userEmail?: string,
  ) {
    const log = this.auditLogRepository.create({
      entityName,
      entityId,
      action,
      changes,
      userId,
      userEmail,
    });
    return this.auditLogRepository.save(log);
  }

  async findAll(entityName?: string, entityId?: string) {
    const query = this.auditLogRepository.createQueryBuilder('log');

    if (entityName) {
      query.andWhere('log.entityName = :entityName', { entityName });
    }

    if (entityId) {
      query.andWhere('log.entityId = :entityId', { entityId });
    }

    query.orderBy('log.createdAt', 'DESC');

    return query.getMany();
  }
}
