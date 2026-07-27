import { createMock } from '@golevelup/ts-vitest';
import { Test } from '@nestjs/testing';

import { DepartmentsService } from './departments.service';

import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { Department } from './entities/department.entity';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentsService],
    })
      .useMocker(() => createMock<Repository<Department>>())
      .compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
