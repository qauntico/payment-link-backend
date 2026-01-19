import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { hashPassword, comparePassword } from './utils/password.util';
import { prisma } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<SignupResponseDto> {
    const { email, password, firstName, lastName, phoneNumber, businessName, supportEmail, role } = signupDto;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await hashPassword(password, saltRounds);

    try {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber,
          businessName,
          supportEmail: supportEmail || null,
          role: role || 'MERCHANT', // Default to MERCHANT if no role provided
        },
      });

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);

      const response: SignupResponseDto = {
        user: {
        id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          businessName: user.businessName,
          supportEmail: user.supportEmail,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
      };

      return response;
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.restricted) {
      throw new UnauthorizedException('User is restricted');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const response: LoginResponseDto = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        businessName: user.businessName,
        supportEmail: user.supportEmail,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };

    return response;
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const response: ProfileResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      businessName: user.businessName,
      supportEmail: user.supportEmail,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return response;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    try {
      // Prepare update data (only include fields that are provided)
      const updateData: any = {};

      if (updateProfileDto.firstName !== undefined) {
        updateData.firstName = updateProfileDto.firstName;
      }

      if (updateProfileDto.lastName !== undefined) {
        updateData.lastName = updateProfileDto.lastName;
      }

      if (updateProfileDto.phoneNumber !== undefined) {
        updateData.phoneNumber = updateProfileDto.phoneNumber;
      }

      if (updateProfileDto.businessName !== undefined) {
        updateData.businessName = updateProfileDto.businessName;
      }

      if (updateProfileDto.supportEmail !== undefined) {
        updateData.supportEmail = updateProfileDto.supportEmail || null;
      }

      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      const response: ProfileResponseDto = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        businessName: updatedUser.businessName,
        supportEmail: updatedUser.supportEmail,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
