import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const newEmployee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(newEmployee);
  }

  findAll() {
    return this.employeesRepository.find({
      relations: { department: true, role: true },
    });
  }

  findOne(id: string) {
    return this.employeesRepository.findOne({
      where: { id },
      relations: { department: true, role: true },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.employeesRepository.update(id, updateEmployeeDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.employeesRepository.update(id, { isActive: false });
    return this.findOne(id);
  }
}
