import { createMock } from '@golevelup/ts-vitest';
import { Test } from '@nestjs/testing';

import { RolesService } from './roles.service';

import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { Role } from './entities/role.entity';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService],
    })
      .useMocker(() => createMock<Repository<Role>>())
      .compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
