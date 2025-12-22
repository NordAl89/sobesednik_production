import { IsString, IsNotEmpty } from 'class-validator';

export class LoginExpertDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}