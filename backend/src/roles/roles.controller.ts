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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleLevel } from '../auth/entities/user.entity';

@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create a new role' })
  @Post()
  @HttpCode(201)
  @Roles(UserRoleLevel.ADMIN)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @ApiOperation({ summary: 'Get role by ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update role' })
  @Patch(':id')
  @Roles(UserRoleLevel.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role' })
  @Delete(':id')
  @Roles(UserRoleLevel.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
