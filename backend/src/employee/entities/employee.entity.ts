import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import type { Department } from 'src/department/entities/department.entity';
import type { Role } from 'src/roles/entities/role.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  departmentId: string;

  @Column('uuid')
  roleId: string;

  @Column('varchar', { length: 100 })
  firstName: string;

  @Column('varchar', { length: 100 })
  lastName: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('date')
  hireDate: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  salary: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @ManyToOne('Department', (department: Department) => department.employees)
  @JoinColumn({ name: 'departmentId' })
  department: Relation<Department>;

  @ManyToOne('Role', (role: Role) => role.employees)
  @JoinColumn({ name: 'roleId' })
  role: Relation<Role>;

  @CreateDateColumn('timestamptz')
  createdAt: Date;

  @UpdateDateColumn('timestamptz')
  updatedAt: Date;
}
