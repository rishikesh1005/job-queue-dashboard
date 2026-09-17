import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { QueryJobDto } from './dto/query-job.dto';

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.FAILED]: [],
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      title: createJobDto.title,
      type: createJobDto.type,
      status: JobStatus.PENDING,
    });
    return await this.jobRepository.save(job);
  }

  async findAll(query: QueryJobDto): Promise<Job[]> {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .orderBy('job.createdAt', 'DESC');

    if (query.status) {
      queryBuilder.where('job.status = :status', { status: query.status });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID "${id}" was not found.`);
    }
    return job;
  }

  async updateStatus(
    id: string,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    const targetStatus = updateJobStatusDto.status;
    const currentJob = await this.findOne(id);

    const allowedNext = VALID_TRANSITIONS[currentJob.status];
    if (!allowedNext.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid state transition: Cannot change status from "${currentJob.status}" to "${targetStatus}".`,
      );
    }

    const updateResult = await this.jobRepository
      .createQueryBuilder()
      .update(Job)
      .set({ status: targetStatus })
      .where('id = :id AND status = :expectedStatus', {
        id,
        expectedStatus: currentJob.status,
      })
      .returning('*')
      .execute();

    if (updateResult.affected === 0) {
      throw new ConflictException(
        'This job was already updated or modified by another concurrent request.',
      );
    }

    return updateResult.raw[0] as Job;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    return { success: true, message: `Job ${id} deleted successfully.` };
  }
}
