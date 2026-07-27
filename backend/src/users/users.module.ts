import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from 'src/roles/entities/role.entity';

import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [UsersService],
})
export class UsersModule {}
