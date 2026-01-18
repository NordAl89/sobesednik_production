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
    // Получаем новые APPROVED отзывы из таблицы reviews
    const newReviews = await this.reviewsService.getApprovedReviewsForExpert(expertId);
    
    // Получаем эксперта для доступа к legacy отзывам
    const expert = await this.reviewsService['expertsService'].findOne(expertId);
    
    // Парсим старые отзывы из JSON строки
    let legacyReviews = [];
    if (expert?.reviews) {
      try {
        const parsed = JSON.parse(expert.reviews);
        legacyReviews = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn(`Ошибка парсинга legacy отзывов для эксперта ${expertId}`);
        legacyReviews = [];
      }
    }
    
    // Преобразуем старые отзывы к формату, похожему на новые (для объединения)
    const formattedLegacyReviews = legacyReviews.map((legacyReview: any, index: number) => ({
      id: `legacy-${expertId}-${index}`,
      expertId: expertId,
      text: legacyReview.text || '',
      rating: legacyReview.rating || null,
      authorName: 'Гость',
      status: 'approved',
      expertReply: legacyReview.expertReply || null,
      expertName: expert?.name || null,
      createdAt: legacyReview.date ? new Date(legacyReview.date) : (expert?.createdAt || new Date()),
      updatedAt: legacyReview.date ? new Date(legacyReview.date) : (expert?.createdAt || new Date()),
      source: 'legacy',
    }));
    
    // Объединяем старые и новые отзывы
    const allReviews = [...formattedLegacyReviews, ...newReviews];
    
    return allReviews;
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
