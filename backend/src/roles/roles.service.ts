import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { title } = createRoleDto;
    const role = await this.rolesRepository.findOneBy({ title });

    if (role) {
      throw new ConflictException(`Role with title ${title} already exists`);
    }

    const newRole = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(newRole);
  }

  findAll() {
    return this.rolesRepository.find();
  }

  async findOne(id: string) {
    const role = await this.rolesRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} does not exist`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { title } = updateRoleDto;

    if (!(await this.rolesRepository.existsBy({ id }))) {
      throw new NotFoundException(`Role with id ${id} does not exist`);
    }

    if (title) {
      const role = await this.rolesRepository.findOneBy({ title });

      if (role && role.id !== id) {
        throw new ConflictException(`Role with title ${title} already exists`);
      }
    }

    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!(await this.rolesRepository.existsBy({ id }))) {
      throw new NotFoundException(`Role with id ${id} does not exist`);
    }

    const employeesCount = await this.employeesRepository.count({
      where: { roleId: id },
    });

    if (employeesCount > 0) {
      throw new ConflictException(`Role with id ${id} has employees`);
    }

    await this.rolesRepository.delete(id);
    return { message: 'Role deleted successfully', id };
  }
}
