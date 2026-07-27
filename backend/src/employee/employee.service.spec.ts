import { createMock } from '@golevelup/ts-vitest';
import { Test } from '@nestjs/testing';

import { EmployeeService } from './employee.service';

import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { Employee } from './entities/employee.entity';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeService],
    })
      .useMocker(() => createMock<Repository<Employee>>())
      .compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
