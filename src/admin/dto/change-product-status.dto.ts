import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeProductStatusDto {
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsNotEmpty({ message: 'isActive is required' })
  isActive: boolean;
}
