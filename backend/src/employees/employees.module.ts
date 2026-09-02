import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { Employee } from './entities/employee.entity.js';
import { Department } from '../departments/entities/department.entity.js';
import { Role } from '../roles/entities/role.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Role])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
