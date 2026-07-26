import { createMock } from '@golevelup/ts-vitest';
import { Test } from '@nestjs/testing';

import { DepartmentService } from './department.service';

import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { Department } from './entities/department.entity';

describe('DepartmentService', () => {
  let service: DepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentService],
    })
      .useMocker(() => createMock<Repository<Department>>())
      .compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
