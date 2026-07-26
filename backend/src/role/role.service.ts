import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(newRole);
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: string) {
    return this.roleRepository.findOneBy({ id });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.roleRepository.delete(id);
  }
}
