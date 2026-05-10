import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string; // email OR phone

  @IsString()
  @IsNotEmpty()
  password!: string;
}