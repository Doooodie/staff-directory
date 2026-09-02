import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { GetAllEmployeesQuery } from './dto/get-all-employees.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { Employee } from './entities/employee.entity.js';
import { Department } from '../departments/entities/department.entity.js';
import { Role } from '../roles/entities/role.entity.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  private async ensureDepartmentExists(id: string) {
    const department = await this.departmentsRepository.findOneBy({ id });
    if (!department)
      throw new NotFoundException(`Department with id ${id} does not exist`);
  }

  private async ensureRoleExists(id: string) {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) throw new NotFoundException(`Role with id ${id} does not exist`);
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { email, departmentId, roleId } = createEmployeeDto;
    const employee = await this.employeesRepository.findOneBy({ email });

    if (employee) {
      throw new ConflictException(
        `Employee with email ${email} already exists`,
      );
    }

    await this.ensureDepartmentExists(departmentId);
    await this.ensureRoleExists(roleId);

    const newEmployee = this.employeesRepository.create(createEmployeeDto);
    const saved = await this.employeesRepository.save(newEmployee);
    return this.findOne(saved.id);
  }

  async findAll(query: GetAllEmployeesQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      departmentId,
      roleId,
      isActive,
    } = query;

    const qb = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.role', 'role')
      .orderBy('employee.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (departmentId) {
      qb.andWhere('employee.departmentId = :departmentId', { departmentId });
    }

    if (roleId) {
      qb.andWhere('employee.roleId = :roleId', { roleId });
    }

    if (isActive !== undefined) {
      qb.andWhere('employee.isActive = :isActive', { isActive });
    }

    if (search) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .orWhere('employee.firstName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('employee.lastName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('employee.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  }

  async getStats() {
    const employeeStatsQb = this.employeesRepository
      .createQueryBuilder('employee')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE employee.isActive = true)', 'active')
      .addSelect(
        'COUNT(*) FILTER (WHERE employee.isActive = false)',
        'inactive',
      )
      .getRawOne<{
        total: string;
        active: string;
        inactive: string;
      }>();

    const departmentStatsQb = this.employeesRepository
      .createQueryBuilder('employee')
      .select('department.id', 'departmentId')
      .addSelect('department.name', 'departmentName')
      .addSelect('COUNT(employee.id)', 'count')
      .addSelect(
        'COUNT(employee.id) FILTER (WHERE employee.isActive = true)',
        'activeCount',
      )
      .addSelect('ROUND(AVG(employee.salary), 1)', 'averageSalary')
      .leftJoin('employee.department', 'department')
      .groupBy('department.id')
      .getRawMany<{
        departmentId: string;
        departmentName: string;
        count: string;
        activeCount: string;
        averageSalary: string;
      }>();

    const [employeeStatsRaw, departmentStatsRaw] = await Promise.all([
      employeeStatsQb,
      departmentStatsQb,
    ]);

    const byDepartment = departmentStatsRaw.map((row) => ({
      departmentId: row.departmentId,
      departmentName: row.departmentName,
      count: Number(row.count),
      activeCount: Number(row.activeCount),
      averageSalary: Number(row.averageSalary),
    }));

    return {
      total: Number(employeeStatsRaw?.total ?? 0),
      active: Number(employeeStatsRaw?.active ?? 0),
      inactive: Number(employeeStatsRaw?.inactive ?? 0),
      byDepartment,
    };
  }

  async findOne(id: string) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: { department: true, role: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} does not exist`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const { email, departmentId, roleId } = updateEmployeeDto;

    if (!(await this.employeesRepository.existsBy({ id }))) {
      throw new NotFoundException(`Employee with id ${id} does not exist`);
    }

    if (email) {
      const employee = await this.employeesRepository.findOneBy({ email });

      if (employee && employee.id !== id) {
        throw new ConflictException(
          `Employee with email ${email} already exists`,
        );
      }
    }

    if (departmentId) await this.ensureDepartmentExists(departmentId);
    if (roleId) await this.ensureRoleExists(roleId);

    await this.employeesRepository.update(id, updateEmployeeDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!(await this.employeesRepository.existsBy({ id }))) {
      throw new NotFoundException(`Employee with id ${id} does not exist`);
    }

    await this.employeesRepository.update(id, { isActive: false });
    return { message: 'Employee deactivated successfully', id };
  }
}
