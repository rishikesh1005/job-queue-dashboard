import { IsEnum, IsOptional } from 'class-validator';
import { JobStatus } from '../job.entity';

export class QueryJobDto {
  @IsOptional()
  @IsEnum(JobStatus, {
    message: 'Filter status must be one of: pending, running, completed, failed',
  })
  status?: JobStatus;
}
