import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

import { User, UserRoleLevel } from './auth/entities/user.entity';
import AppDataSource from './database/app-data-source';
import { Department } from './departments/entities/department.entity';
import { Employee } from './employees/entities/employee.entity';
import { EmployeeRoleLevel, Role } from './roles/entities/role.entity';

import type { DeepPartial, ObjectLiteral, Repository } from 'typeorm';

async function upsertItems<Entity extends ObjectLiteral>(
  repository: Repository<Entity>,
  items: DeepPartial<Entity>[],
  conflictPaths: (keyof Entity & string)[],
) {
  await Promise.all(
    items.map(async (item) => {
      const newItem = repository.create(item);
      await repository.upsert(newItem, { conflictPaths });
    }),
  );
}

async function seed() {
  try {
    await AppDataSource.initialize();

    const roleRepository = AppDataSource.getRepository(Role);
    const departmentRepository = AppDataSource.getRepository(Department);
    const userRepository = AppDataSource.getRepository(User);
    const employeeRepository = AppDataSource.getRepository(Employee);

    const roles = [
      { level: EmployeeRoleLevel.JUNIOR, title: 'Junior Dev' },
      { level: EmployeeRoleLevel.MID, title: 'Mid Dev' },
      { level: EmployeeRoleLevel.SENIOR, title: 'Senior Dev' },
      { level: EmployeeRoleLevel.LEAD, title: 'Lead' },
      { level: EmployeeRoleLevel.MANAGER, title: 'Manager' },
    ];

    const departments = [
      { name: 'Engineering', description: 'Engineering department' },
      { name: 'Marketing', description: 'Marketing department' },
      { name: 'Operations', description: 'Operations department' },
    ];

    const users = [
      {
        email: 'admin@company.com',
        password: await hash('Admin123!', 10),
        role: UserRoleLevel.ADMIN,
      },
      {
        email: 'user@company.com',
        password: await hash('User123!', 10),
        role: UserRoleLevel.USER,
      },
    ];

    await upsertItems(roleRepository, roles, ['title']);
    await upsertItems(departmentRepository, departments, ['name']);
    await upsertItems(userRepository, users, ['email']);

    const savedRoles = await roleRepository.find();
    const savedDepartments = await departmentRepository.find();

    faker.seed(123);

    const employees = Array.from({ length: 20 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return {
        firstName,
        lastName,
        email: faker.internet
          .email({ firstName, lastName, provider: 'company.com' })
          .toLowerCase(),
        hireDate: faker.date.past().toISOString().slice(0, 10),
        salary: +faker.finance.amount({ min: 0.01, max: 999999.99, dec: 2 }),
        departmentId: faker.helpers.arrayElement(savedDepartments).id,
        roleId: faker.helpers.arrayElement(savedRoles).id,
      };
    });

    await upsertItems(employeeRepository, employees, ['email']);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during seeding', error.message);
    }

    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch(console.error);
