import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(newRole);
  }

  findAll() {
    return this.rolesRepository.find();
  }

  findOne(id: string) {
    return this.rolesRepository.findOneBy({ id });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.rolesRepository.delete(id);
  }
}
