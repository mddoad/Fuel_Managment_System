import { IsDateString, IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @Matches(/^(\+8801|01)[3-9]\d{8}$/, {
    message: 'Phone must be a valid Bangladesh number (01XXXXXXXXX or +8801XXXXXXXXX)',
  })
  phone!: string;

  @IsDateString({}, { message: 'DOB must be a valid date (YYYY-MM-DD)' })
  dob!: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}