import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Employee } from 'src/employees/entities/employee.entity';

import { Role } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Employee])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
