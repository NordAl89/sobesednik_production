import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus, ReviewSource } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import * as crypto from 'crypto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
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
      status: ReviewStatus.PENDING,
      source: ReviewSource.V2,
    });

    return await this.reviewsRepository.save(review);
  }

  /* =====================================================
     ПОЛУЧЕНИЕ ОТЗЫВОВ ДЛЯ СТРАНИЦЫ ЭКСПЕРТА
     ===================================================== */

  async getApprovedReviewsForExpert(expertId: string): Promise<Review[]> {
    return await this.reviewsRepository.find({
      where: {
        expertId,
        status: ReviewStatus.APPROVED,
      },
      order: {
        createdAt: 'DESC',
      },
    });
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

    return await this.reviewsRepository.save(review);
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
     РЕЙТИНГ (ТОЛЬКО APPROVED)
     ===================================================== */

  async getRatingStats(expertId: string) {
    const reviews = await this.reviewsRepository.find({
      where: {
        expertId,
        status: ReviewStatus.APPROVED,
      },
    });

    const ratings = reviews
      .map(r => r.rating)
      .filter((r): r is number => r !== null);

    if (ratings.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    ratings.forEach(r => {
      if (r >= 1 && r <= 5) {
        distribution[r]++;
      }
    });

    const average =
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    return {
      average: Number(average.toFixed(2)),
      count: ratings.length,
      distribution,
    };
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
