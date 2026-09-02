import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { Department } from './entities/department.entity.js';
import { Employee } from '../employees/entities/employee.entity.js';

interface DepartmentResponseInput {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  private toResponse(department: DepartmentResponseInput) {
    return {
      id: department.id,
      name: department.name,
      description: department.description,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }

  private async findDepartment(id: string) {
    const department = await this.departmentsRepository.findOneBy({ id });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} does not exist`);
    }

    return department;
  }

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
    const savedDepartment =
      await this.departmentsRepository.save(newDepartment);

    return this.toResponse(savedDepartment);
  }

  async findAll() {
    const rows = await this.departmentsRepository
      .createQueryBuilder('department')
      .leftJoin('department.employees', 'employee')
      .select('department.id', 'id')
      .addSelect('department.name', 'name')
      .addSelect('department.description', 'description')
      .addSelect('department.createdAt', 'createdAt')
      .addSelect('department.updatedAt', 'updatedAt')
      .addSelect(
        'COUNT(employee.id) FILTER (WHERE employee.isActive = true)',
        'activeEmployeeCount',
      )
      .groupBy('department.id')
      .getRawMany<DepartmentResponseInput & { activeEmployeeCount: string }>();

    return rows.map((row) => ({
      ...this.toResponse(row),
      activeEmployeeCount: Number(row.activeEmployeeCount),
    }));
  }

  async findOne(id: string) {
    const department = await this.findDepartment(id);
    const employees = await this.employeesRepository.find({
      where: { departmentId: department.id, isActive: true },
    });

    return { ...this.toResponse(department), employees };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const { name } = updateDepartmentDto;

    await this.findDepartment(id);

    if (name) {
      const department = await this.departmentsRepository.findOneBy({ name });

      if (department && department.id !== id) {
        throw new ConflictException(
          `Department with name ${name} already exists`,
        );
      }
    }

    await this.departmentsRepository.update(id, updateDepartmentDto);
    return this.toResponse(await this.findDepartment(id));
  }

  async remove(id: string) {
    await this.findDepartment(id);

    const activeEmployeeCount = await this.employeesRepository.count({
      where: { departmentId: id, isActive: true },
    });

    if (activeEmployeeCount > 0) {
      throw new ConflictException(
        `Department with id ${id} has active employees`,
      );
    }

    await this.departmentsRepository.delete(id);
    return { message: 'Department deleted successfully', id };
  }
}
