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

import type { Department } from '../../departments/entities/department.entity';
import type { Role } from '../../roles/entities/role.entity';

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

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      from: (value: string) => Number(value),
      to: (value: number) => value,
    },
  })
  salary: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @ManyToOne('Department', (department: Department) => department.employees)
  @JoinColumn({ name: 'departmentId' })
  department: Relation<Department>;

  @ManyToOne('Role', (role: Role) => role.employees)
  @JoinColumn({ name: 'roleId' })
  role: Relation<Role>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
