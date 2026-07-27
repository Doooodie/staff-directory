import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import type { Employee } from 'src/employee/entities/employee.entity';

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

  @OneToMany('Employee', (employee: Employee) => employee.department)
  employees: Relation<Employee[]>;
}
