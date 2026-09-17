import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../job.entity';

export class UpdateJobStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(JobStatus, {
    message: 'Status must be one of: pending, running, completed, failed',
  })
  status: JobStatus;
}
