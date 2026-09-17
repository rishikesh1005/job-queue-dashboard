import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job, JobStatus } from './job.entity';

describe('JobsService', () => {
  let service: JobsService;
  let mockJobRepository: any;

  const mockJob: Job = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Process payment',
    type: 'payment',
    status: JobStatus.PENDING,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockJobRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((job) =>
        Promise.resolve({ id: mockJob.id, ...job, createdAt: new Date() }),
      ),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue({}),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should create a job in PENDING status', async () => {
    const res = await service.create({ title: 'Task', type: 'sync' });
    expect(res.status).toBe(JobStatus.PENDING);
  });

  it('should reject invalid transition: pending -> completed', async () => {
    mockJobRepository.findOne.mockResolvedValue({ ...mockJob, status: JobStatus.PENDING });
    await expect(
      service.updateStatus(mockJob.id, { status: JobStatus.COMPLETED }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw 409 Conflict if atomic update affects 0 rows', async () => {
    mockJobRepository.findOne.mockResolvedValue({ ...mockJob, status: JobStatus.PENDING });
    const qb: any = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 0, raw: [] }),
    };
    mockJobRepository.createQueryBuilder.mockReturnValue(qb);
    await expect(
      service.updateStatus(mockJob.id, { status: JobStatus.RUNNING }),
    ).rejects.toThrow(ConflictException);
  });
});
