import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleLevel } from 'src/auth/entities/user.entity';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetAllEmployeesQuery } from './dto/get-all-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @ApiOperation({ summary: 'Create a new employee' })
  @Post()
  @HttpCode(201)
  @Roles(UserRoleLevel.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @ApiOperation({ summary: 'Get paginated list of employees' })
  @Get()
  findAll(@Query() query: GetAllEmployeesQuery) {
    return this.employeesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get employee statistics' })
  @Get('stats')
  getStats() {
    return this.employeesService.getStats();
  }

  @ApiOperation({ summary: 'Get employee by ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update employee' })
  @Patch(':id')
  @Roles(UserRoleLevel.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @ApiOperation({ summary: 'Deactivate employee (soft delete)' })
  @Delete(':id')
  @Roles(UserRoleLevel.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.remove(id);
  }
}
