import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO для создания нового отзыва (V2)
 * Используется гостем, без авторизации
 */
export class CreateReviewDto {
  /**
   * ID собеседника (Expert)
   */
  @IsString()
  @IsNotEmpty()
  expertId: string;

  /**
   * Текст отзыва
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  /**
   * Оценка рейтинга (1–5)
   * Может отсутствовать до модерации
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
