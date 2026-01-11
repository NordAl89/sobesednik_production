import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO для ответа собеседника на отзыв
 */
export class ReplyReviewDto {
  /**
   * Текст ответа собеседника
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  expertReply: string;
}
