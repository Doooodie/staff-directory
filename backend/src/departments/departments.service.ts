import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return this.departmentsRepository.findOneBy({ id });
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.departmentsRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.departmentsRepository.delete(id);
  }
}
