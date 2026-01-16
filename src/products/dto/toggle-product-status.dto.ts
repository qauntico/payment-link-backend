import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleProductStatusDto {
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsNotEmpty({ message: 'isActive is required' })
  isActive: boolean;
}
