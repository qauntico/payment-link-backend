import { UserDataDto } from '../../users/dto/user-data.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';

export class UsersListResponseDto {
  users: UserDataDto[];
  pagination: PaginationResponseDto;
}
