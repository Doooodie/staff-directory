import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Department } from 'src/departments/entities/department.entity';
import { Role } from 'src/roles/entities/role.entity';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Role])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
