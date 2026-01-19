import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';


@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  /* =====================================================
     АДМИН — ВСЕГДА ВВЕРХУ
     ===================================================== */

  /**
   * Получение отзывов, ожидающих модерацию
   */
  @Get('admin/pending')
  async getPendingReviews() {
    return this.reviewsService.getPendingReviews();
  }

  /**
   * Модерация отзыва (approve / reject)
   */
  @Post(':id/moderate')
  async moderateReview(
    @Param('id') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviewsService.moderateReview(
      reviewId,
      dto,
    );
  }

  /* =====================================================
     ПОЛЬЗОВАТЕЛЬ (ГОСТЬ)
     ===================================================== */

  /**
   * Создание нового отзыва (pending)
   */
  @Post()
  async createReview(
    @Body() dto: CreateReviewDto,
    @Req() req: any,
  ) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket.remoteAddress;

    return this.reviewsService.createReview(dto, ip);
  }

  /**
   * Получение опубликованных отзывов эксперта (объединенные: legacy + новые)
   */
  @Get('expert/:expertId')
  async getApprovedReviews(
    @Param('expertId') expertId: string,
  ) {
    return this.reviewsService.getAllApprovedReviewsForExpert(expertId);
  }

  /**
   * Получение рейтинга эксперта (по approved отзывам)
   */
  @Get('expert/:expertId/stats')
  async getRatingStats(
    @Param('expertId') expertId: string,
  ) {
    return this.reviewsService.getRatingStats(expertId);
  }

  /**
   * Пересчет рейтинга конкретного эксперта
   */
  @Post('expert/:expertId/recalculate-rating')
  async recalculateExpertRating(
    @Param('expertId') expertId: string,
  ) {
    await this.reviewsService.updateExpertRating(expertId);
    const expert = await this.reviewsService['expertsService'].findOne(expertId);
    return {
      message: `Рейтинг эксперта ${expertId} пересчитан`,
      expertId,
      rating: expert.rating,
      ratingCount: expert.ratingCount,
    };
  }

  /**
   * Пересчет рейтингов всех экспертов (учитывает рейтинги из legacy отзывов)
   * Использовать один раз для обновления всех рейтингов
   */
  @Post('recalculate-all-ratings')
  async recalculateAllRatings() {
    const experts = await this.reviewsService['expertsService'].findAll();
    let updated = 0;
    
    for (const expert of experts) {
      try {
        await this.reviewsService.updateExpertRating(expert.id);
        updated++;
      } catch (error) {
        console.error(`Ошибка пересчета рейтинга для эксперта ${expert.id}:`, error);
      }
    }
    
    return { 
      message: `Рейтинги пересчитаны для ${updated} из ${experts.length} экспертов`,
      total: experts.length,
      updated 
    };
  }

  /* =====================================================
     СОБЕСЕДНИК
     ===================================================== */

  /**
   * Ответ собеседника на отзыв
   */
  @Post(':id/reply')
  async replyToReview(
    @Param('id') reviewId: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewsService.replyToReview(
      reviewId,
      dto,
    );
  }
}
