import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty, IsBoolean, IsIn } from 'class-validator';

export class CreateExpertDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(18)
  age!: number;

  @IsNotEmpty()
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @IsString()
  availability!: string; // Изменили status на availability

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  allowedTopics?: string;

  @IsString()
  @IsOptional()
  forbiddenTopics?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  telegram!: string;

  @IsString()
  @IsOptional()
  otherMessengers?: string;

  @IsBoolean()
  @IsOptional()
  adultTopics?: boolean;

  @IsBoolean()
  @IsOptional()
  noForbiddenTopics?: boolean;

  @IsString()
  @IsOptional()
  paymentCode?: string;

  @IsNumber()
  @IsOptional()
  publicationDays?: number;

  @IsNumber()
  @IsOptional()
  paymentAmount?: number;

  @IsBoolean()
  @IsOptional()
  alwaysAvailable?: boolean;


  @IsString()
  @IsOptional()
  status?: string; // Оставили для статуса публикации

  @IsBoolean()
  @IsOptional()
  expertIsVerified?: boolean; // Верификация эксперта
  
   @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ratingCount?: number;

  @IsString()
  @IsOptional()
  ratings?: string;

}