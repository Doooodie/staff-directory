import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn('timestamptz')
  createdAt: Date;

  @UpdateDateColumn('timestamptz')
  updatedAt: Date;
}
