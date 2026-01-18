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
      status: ReviewStatus.APPROVED, // Создаем сразу одобренными для автоматической публикации
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
    const allRatings = [...legacyRatings, ...newRatings].filter(
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
   * старые оценки из expert.ratings + новые APPROVED отзывы
   */
  private async updateExpertRating(expertId: string): Promise<void> {
    try {
      const expert = await this.expertsService.findOne(expertId);

      // Парсим старые оценки
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

      // Объединяем все оценки
      const allRatings = [...legacyRatings, ...newRatings].filter(
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
