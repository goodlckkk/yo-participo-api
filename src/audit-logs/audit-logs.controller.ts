import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditLogsController {
  private readonly logger = new Logger(AuditLogsController.name);

  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(
    @Query('entityName') entityName?: string,
    @Query('entityId') entityId?: string,
  ) {
    this.logger.log(`Fetching audit logs for ${entityName}:${entityId}`);
    return this.auditLogsService.findAll(entityName, entityId);
  }
}
