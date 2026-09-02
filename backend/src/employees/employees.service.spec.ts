import { createMock } from '@golevelup/ts-vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmployeesService } from './employees.service.js';
import { Employee } from './entities/employee.entity.js';
import { Department } from '../departments/entities/department.entity.js';
import { Role } from '../roles/entities/role.entity.js';

import type { DeepMocked } from '@golevelup/ts-vitest';
import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { CreateEmployeeDto } from './dto/create-employee.dto.js';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeesRepository: DeepMocked<Repository<Employee>>;
  let departmentsRepository: DeepMocked<Repository<Department>>;
  let rolesRepository: DeepMocked<Repository<Role>>;

  const createDto: CreateEmployeeDto = {
    firstName: 'Anna',
    lastName: 'Kowalski',
    email: 'anna.kowalski@company.com',
    hireDate: '2024-03-15',
    salary: 4800,
    departmentId: 'dept-uuid',
    roleId: 'role-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: createMock<Repository<Employee>>({}, { strict: true }),
        },
        {
          provide: getRepositoryToken(Department),
          useValue: createMock<Repository<Department>>({}, { strict: true }),
        },
        {
          provide: getRepositoryToken(Role),
          useValue: createMock<Repository<Role>>({}, { strict: true }),
        },
      ],
    }).compile();

    service = module.get(EmployeesService);
    employeesRepository = module.get(getRepositoryToken(Employee));
    departmentsRepository = module.get(getRepositoryToken(Department));
    rolesRepository = module.get(getRepositoryToken(Role));
  });

  describe('create', () => {
    it('returns the created employee', async () => {
      const employee = createMock<Employee>({
        id: 'employee-uuid',
        email: createDto.email,
      });

      employeesRepository.findOneBy.mockResolvedValue(null);
      departmentsRepository.findOneBy.mockResolvedValue(
        createMock<Department>(),
      );
      rolesRepository.findOneBy.mockResolvedValue(createMock<Role>());
      employeesRepository.create.mockReturnValue(employee);
      employeesRepository.save.mockResolvedValue(employee);
      employeesRepository.findOne.mockResolvedValue(employee);

      await expect(service.create(createDto)).resolves.toBe(employee);
    });

    it('throws ConflictException when email already exists', async () => {
      employeesRepository.findOneBy.mockResolvedValue(
        createMock<Employee>({ id: 'existing-id' }),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(employeesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when ID does not exist', async () => {
      employeesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('sets isActive to false without deleting the row', async () => {
      const id = 'employee-uuid';

      employeesRepository.existsBy.mockResolvedValue(true);
      employeesRepository.update.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      await service.remove(id);

      expect(employeesRepository.update).toHaveBeenCalledWith(id, {
        isActive: false,
      });
      expect(employeesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
