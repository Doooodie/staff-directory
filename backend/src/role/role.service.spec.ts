import { createMock } from '@golevelup/ts-vitest';
import { Test } from '@nestjs/testing';

import { RoleService } from './role.service';

import type { TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';

import type { Role } from './entities/role.entity';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleService],
    })
      .useMocker(() => createMock<Repository<Role>>())
      .compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
