import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReviewStatus } from '../entities/review.entity';

/**
 * DTO для модерации отзыва администратором
 */
export class ModerateReviewDto {
  /**
   * Новый статус отзыва
   * Допустимы только approved или rejected
   */
  @IsEnum([ReviewStatus.APPROVED, ReviewStatus.REJECTED])
  status: ReviewStatus;

  /**
   * Идентификатор администратора (login / id)
   */
  @IsString()
  @IsNotEmpty()
  moderatedBy: string;
}
