import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/role.decorator';
import { Role } from '../roles/roles.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    return this.usersService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.usersService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Merchant, Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req): Promise<ProfileResponseDto> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const userId = req.user.sub;
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Merchant, Role.Admin)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
