import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employee } from 'src/employees/entities/employee.entity';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name } = createDepartmentDto;
    const department = await this.departmentsRepository.findOneBy({ name });

    if (department) {
      throw new ConflictException(
        `Department with name ${name} already exists`,
      );
    }

    const newDepartment =
      this.departmentsRepository.create(createDepartmentDto);

    return this.departmentsRepository.save(newDepartment);
  }

  async findAll() {
    const departments = await this.departmentsRepository.find();

    return Promise.all(
      departments.map(async (department) => {
        const activeEmployeeCount = await this.employeesRepository.count({
          where: { departmentId: department.id, isActive: true },
        });

        return {
          id: department.id,
          name: department.name,
          description: department.description,
          activeEmployeeCount,
          createdAt: department.createdAt,
          updatedAt: department.updatedAt,
        };
      }),
    );
  }

  async findOne(id: string) {
    const department = await this.departmentsRepository.findOneBy({ id });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} does not exist`);
    }

    const employees = await this.employeesRepository.find({
      where: { departmentId: department.id, isActive: true },
    });

    return {
      id: department.id,
      name: department.name,
      description: department.description,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      employees,
    };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const { name } = updateDepartmentDto;

    if (!(await this.departmentsRepository.existsBy({ id }))) {
      throw new NotFoundException(`Department with id ${id} does not exist`);
    }

    if (name) {
      const department = await this.departmentsRepository.findOneBy({ name });

      if (department && department.id !== id) {
        throw new ConflictException(
          `Department with name ${name} already exists`,
        );
      }
    }

    await this.departmentsRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!(await this.departmentsRepository.existsBy({ id }))) {
      throw new NotFoundException(`Department with id ${id} does not exist`);
    }

    const activeEmployeeCount = await this.employeesRepository.count({
      where: { departmentId: id, isActive: true },
    });

    if (activeEmployeeCount > 0) {
      throw new ConflictException(
        `Department with id ${id} has active employees`,
      );
    }

    await this.departmentsRepository.delete(id);
  }
}
