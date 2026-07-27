import { createMock } from '@golevelup/ts-vitest';
import { Test } from '@nestjs/testing';

import { EmployeesService } from './employees.service';

import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { Employee } from './entities/employee.entity';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService],
    })
      .useMocker(() => createMock<Repository<Employee>>())
      .compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
