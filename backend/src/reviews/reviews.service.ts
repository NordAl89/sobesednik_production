import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus, ReviewSource } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ExpertsService } from '../experts/experts.service';
import * as crypto from 'crypto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @Inject(forwardRef(() => ExpertsService))
    private readonly expertsService: ExpertsService,
  ) {}

  /* =====================================================
     ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
     ===================================================== */

  /**
   * Хэширование IP (для антиспама)
   */
  private hashIp(ip: string): string {
    return crypto
      .createHash('sha256')
      .update(ip + process.env.IP_SALT)
      .digest('hex');
  }

  /**
   * Проверка: был ли отзыв с этого IP за последние 24 часа
   */
  private async checkIpLimit(
    expertId: string,
    ipHash: string,
  ): Promise<void> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const exists = await this.reviewsRepository.findOne({
      where: {
        expertId,
        authorIpHash: ipHash,
      },
      order: { createdAt: 'DESC' },
    });

    if (exists && exists.createdAt > since) {
      throw new BadRequestException(
        'Вы уже оставляли отзыв этому собеседнику за последние 24 часа',
      );
    }
  }

  /* =====================================================
     СОЗДАНИЕ ОТЗЫВА (ГОСТЬ)
     ===================================================== */

  async createReview(
    dto: CreateReviewDto,
    ipAddress: string,
  ): Promise<Review> {
    const ipHash = this.hashIp(ipAddress);

    await this.checkIpLimit(dto.expertId, ipHash);

    const review = this.reviewsRepository.create({
      expertId: dto.expertId,
      text: dto.text,
      rating: dto.rating ?? null,
      authorName: 'Гость',
      authorIpHash: ipHash,
      status: ReviewStatus.PENDING, // Отзывы попадают на модерацию
      source: ReviewSource.V2,
    });

    return await this.reviewsRepository.save(review);
  }

  /* =====================================================
     ПОЛУЧЕНИЕ ОТЗЫВОВ ДЛЯ СТРАНИЦЫ ЭКСПЕРТА
     ===================================================== */

  async getApprovedReviewsForExpert(expertId: string): Promise<any[]> {
    const reviews = await this.reviewsRepository.find({
      where: {
        expertId,
        status: ReviewStatus.APPROVED,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Получаем имя эксперта для добавления к каждому отзыву
    const expert = await this.expertsService.findOne(expertId);
    let expertName = expert?.name || null;
    
    // Убираем префикс "Ответ " из expertName, если он есть
    if (expertName && expertName.startsWith('Ответ ')) {
      expertName = expertName.replace(/^Ответ\s+/, '');
    }

    // Добавляем expertName к каждому отзыву и убираем "Ответ " из expertReply, если есть
    return reviews.map(review => {
      let cleanExpertReply = review.expertReply;
      
      // Убираем префикс "Ответ имя:" из expertReply, если он есть
      if (cleanExpertReply && expertName) {
        const prefixPattern = new RegExp(`^Ответ\\s+${expertName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:?\\s*`, 'i');
        cleanExpertReply = cleanExpertReply.replace(prefixPattern, '');
      } else if (cleanExpertReply && cleanExpertReply.startsWith('Ответ ')) {
        // Если нет expertName, просто убираем "Ответ " если это начало строки
        cleanExpertReply = cleanExpertReply.replace(/^Ответ\s+[А-Яа-яЁё\s]+:?\s*/, '');
      }
      
      return {
      ...review,
      expertName,
        expertReply: cleanExpertReply,
      };
    });
  }

  /**
   * Получение объединенных отзывов эксперта (legacy + новые)
   */
  async getAllApprovedReviewsForExpert(expertId: string): Promise<any[]> {
    // Получаем новые APPROVED отзывы из таблицы reviews
    const newReviews = await this.getApprovedReviewsForExpert(expertId);
    
    // Получаем эксперта для доступа к legacy отзывам
    const expert = await this.expertsService.findOne(expertId);
    
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
    
    // Парсим рейтинги из expert.ratings (старая система хранила рейтинги отдельно)
    let legacyRatings: number[] = [];
    if (expert?.ratings) {
      try {
        const parsed = JSON.parse(expert.ratings);
        legacyRatings = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        legacyRatings = [];
      }
    }
    
    // Преобразуем старые отзывы к формату, похожему на новые (для объединения)
    const formattedLegacyReviews = legacyReviews.map((legacyReview: any, index: number) => {
      // Сначала пытаемся извлечь рейтинг из самого отзыва
      let rating = null;
      if (legacyReview.rating !== undefined && legacyReview.rating !== null) {
        const ratingValue = Number(legacyReview.rating);
        if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
          rating = ratingValue;
        }
      }
      
      // Если в отзыве нет рейтинга, но есть рейтинги в expert.ratings и количество совпадает,
      // сопоставляем рейтинг по индексу
      if (rating === null && legacyRatings.length > 0 && legacyRatings.length === legacyReviews.length) {
        const ratingValue = legacyRatings[index];
        if (ratingValue !== undefined && ratingValue !== null) {
          const numValue = Number(ratingValue);
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
            rating = numValue;
          }
        }
      }
      
      // Если в отзыве нет рейтинга, но есть рейтинги в expert.ratings (даже если количество не совпадает),
      // используем рейтинг по индексу (если индекс в пределах массива)
      if (rating === null && legacyRatings.length > 0 && index < legacyRatings.length) {
        const ratingValue = legacyRatings[index];
        if (ratingValue !== undefined && ratingValue !== null) {
          const numValue = Number(ratingValue);
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
            rating = numValue;
          }
        }
      }
      
      // Если в отзыве нет рейтинга и нет в expert.ratings, но есть общий рейтинг эксперта,
      // используем его для всех отзывов (fallback)
      if (rating === null && expert?.rating && expert.rating > 0) {
        const expertRating = Number(expert.rating);
        if (!isNaN(expertRating) && expertRating >= 1 && expertRating <= 5) {
          rating = Math.round(expertRating); // Округляем до целого числа
        }
      }
      
      return {
        id: `legacy-${expertId}-${index}`,
        expertId: expertId,
        text: legacyReview.text || '',
        rating: rating,
        authorName: 'Гость',
        status: 'approved',
        expertReply: legacyReview.expertReply || null,
        expertName: expert?.name || null,
        createdAt: legacyReview.date ? new Date(legacyReview.date) : (expert?.createdAt || new Date()),
        updatedAt: legacyReview.date ? new Date(legacyReview.date) : (expert?.createdAt || new Date()),
        source: 'legacy',
      };
    });
    
    // Объединяем старые и новые отзывы
    const allReviews = [...formattedLegacyReviews, ...newReviews];
    
    return allReviews;
  }

  /* =====================================================
     АДМИН: МОДЕРАЦИЯ
     ===================================================== */

  async moderateReview(
    reviewId: string,
    dto: ModerateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException(
        'Отзыв уже прошёл модерацию',
      );
    }

    review.status = dto.status;
    review.moderatedAt = new Date();
    review.moderatedBy = dto.moderatedBy;

    // Если отзыв отклонён — рейтинг аннулируется
    if (dto.status === ReviewStatus.REJECTED) {
      review.rating = null;
    }

    const savedReview = await this.reviewsRepository.save(review);

    // Обновляем рейтинг эксперта после модерации (если отзыв одобрен)
    if (dto.status === ReviewStatus.APPROVED) {
      await this.updateExpertRating(review.expertId);
    }

    return savedReview;
  }

  /* =====================================================
     ОТВЕТ СОБЕСЕДНИКА
     ===================================================== */

  async replyToReview(
    reviewId: string,
    dto: ReplyReviewDto,
  ): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    if (review.status !== ReviewStatus.APPROVED) {
      throw new BadRequestException(
        'Нельзя ответить на не опубликованный отзыв',
      );
    }

    review.expertReply = dto.expertReply;
    review.repliedAt = new Date();

    return await this.reviewsRepository.save(review);
  }

  /* =====================================================
     РЕЙТИНГ (КОМБИНИРОВАННЫЙ: СТАРЫЕ ОЦЕНКИ + НОВЫЕ APPROVED ОТЗЫВЫ)
     ===================================================== */

  async getRatingStats(expertId: string) {
    // Получаем эксперта для доступа к старым оценкам
    const expert = await this.expertsService.findOne(expertId);

    // Парсим старые оценки из expert.ratings
    let legacyRatings: number[] = [];
    if (expert.ratings) {
      try {
        legacyRatings = JSON.parse(expert.ratings);
        if (!Array.isArray(legacyRatings)) {
          legacyRatings = [];
        }
      } catch (e) {
        legacyRatings = [];
      }
    }

    // Извлекаем рейтинги из старых отзывов (legacy reviews)
    let legacyReviewRatings: number[] = [];
    if (expert.reviews) {
      try {
        const parsed = JSON.parse(expert.reviews);
        if (Array.isArray(parsed)) {
          legacyReviewRatings = parsed
            .map((review: any) => {
              if (review.rating !== undefined && review.rating !== null) {
                const ratingValue = Number(review.rating);
                if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
                  return ratingValue;
                }
              }
              return null;
            })
            .filter((r): r is number => r !== null);
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }

    // Получаем новые APPROVED отзывы с рейтингом
    const reviews = await this.reviewsRepository.find({
      where: {
        expertId,
        status: ReviewStatus.APPROVED,
      },
    });

    const newRatings = reviews
      .map(r => r.rating)
      .filter((r): r is number => r !== null && r >= 1 && r <= 5);

    // Объединяем старые и новые оценки
    const allRatings = [...legacyRatings, ...legacyReviewRatings, ...newRatings].filter(
      (r): r is number => r >= 1 && r <= 5
    );

    if (allRatings.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    allRatings.forEach(r => {
      if (r >= 1 && r <= 5) {
        distribution[r]++;
      }
    });

    const average =
      allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

    return {
      average: Number(average.toFixed(2)),
      count: allRatings.length,
      distribution,
    };
  }

  /**
   * Обновляет рейтинг эксперта на основе комбинированных данных:
   * старые оценки из expert.ratings + рейтинги из legacy отзывов + новые APPROVED отзывы
   */
  async updateExpertRating(expertId: string): Promise<void> {
    try {
      const expert = await this.expertsService.findOne(expertId);

      // Парсим старые оценки из expert.ratings
      let legacyRatings: number[] = [];
      if (expert.ratings) {
        try {
          legacyRatings = JSON.parse(expert.ratings);
          if (!Array.isArray(legacyRatings)) {
            legacyRatings = [];
          }
        } catch (e) {
          legacyRatings = [];
        }
      }

      // Извлекаем рейтинги из старых отзывов (legacy reviews)
      let legacyReviewRatings: number[] = [];
      if (expert.reviews) {
        try {
          const parsed = JSON.parse(expert.reviews);
          if (Array.isArray(parsed)) {
            legacyReviewRatings = parsed
              .map((review: any) => {
                if (review.rating !== undefined && review.rating !== null) {
                  const ratingValue = Number(review.rating);
                  if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
                    return ratingValue;
                  }
                }
                return null;
              })
              .filter((r): r is number => r !== null);
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }

      // Получаем новые APPROVED отзывы с рейтингом
      const reviews = await this.reviewsRepository.find({
        where: {
          expertId,
          status: ReviewStatus.APPROVED,
        },
      });

      const newRatings = reviews
        .map(r => r.rating)
        .filter((r): r is number => r !== null && r >= 1 && r <= 5);

      // Объединяем все оценки: старые из ratings + из legacy отзывов + новые
      const allRatings = [...legacyRatings, ...legacyReviewRatings, ...newRatings].filter(
        (r): r is number => r >= 1 && r <= 5
      );

      if (allRatings.length === 0) {
        expert.rating = 0;
        expert.ratingCount = 0;
        expert.ratings = JSON.stringify([]);
      } else {
        const average = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
        expert.rating = parseFloat(average.toFixed(2));
        expert.ratingCount = allRatings.length;
        expert.ratings = JSON.stringify(allRatings);
      }

      // Сохраняем обновленного эксперта через метод update
      await this.expertsService.update(expertId, {
        rating: expert.rating,
        ratingCount: expert.ratingCount,
        ratings: expert.ratings,
      });

      console.log(
        `✅ Рейтинг эксперта ${expertId} обновлен: ${expert.rating} (${expert.ratingCount} оценок)`,
      );
    } catch (error) {
      console.error(
        `❌ Ошибка при обновлении рейтинга эксперта ${expertId}:`,
        error,
      );
      // Не пробрасываем ошибку, чтобы не сломать процесс модерации
    }
  }

  /* =====================================================
     АДМИН: ПОЛУЧЕНИЕ PENDING ОТЗЫВОВ
     ===================================================== */

  async getPendingReviews(): Promise<Review[]> {
    return await this.reviewsRepository.find({
      where: { status: ReviewStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }
}
