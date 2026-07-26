import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoleLevel {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  title: string;

  @Column('enum', { enum: RoleLevel })
  level: RoleLevel;

  @CreateDateColumn('timestamptz')
  createdAt: Date;

  @UpdateDateColumn('timestamptz')
  updatedAt: Date;
}
