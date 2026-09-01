import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Employee])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
