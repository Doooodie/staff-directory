import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const newDepartment =
      this.departmentsRepository.create(createDepartmentDto);
    return this.departmentsRepository.save(newDepartment);
  }

  findAll() {
    return this.departmentsRepository.find();
  }

  async findOne(id: string) {
    const department = await this.departmentsRepository.findOneBy({ id });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} does not exist`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.departmentsRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.departmentsRepository.delete(id);
  }
}
