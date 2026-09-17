import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity({ name: 'jobs' })
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  type: string;

  @Index()
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
    nullable: false,
  })
  status: JobStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
