import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { User, UserRoleLevel } from './entities/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user || !(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;
    const passwordHash = await hash(password, 10);

    const user = await this.usersRepository.findOneBy({ email });

    if (user) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const newUser = this.usersRepository.create({
      email,
      password: passwordHash,
      role: role ?? UserRoleLevel.USER,
    });

    return this.usersRepository.save(newUser);
  }
}
