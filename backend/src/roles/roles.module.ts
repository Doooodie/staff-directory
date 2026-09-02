import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity.js';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';
import { Employee } from '../employees/entities/employee.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Employee])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
