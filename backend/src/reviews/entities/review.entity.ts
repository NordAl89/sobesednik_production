import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Статус отзыва
 */
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Источник отзыва
 * legacy — старые отзывы из experts.reviews
 * v2     — новая система с модерацией
 */
export enum ReviewSource {
  LEGACY = 'legacy',
  V2 = 'v2',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID собеседника (Expert)
   * Связь храним по id, без FK — безопаснее для миграций
   */
  @Index()
  @Column({ type: 'varchar' })
  expertId: string;

  /**
   * Текст отзыва
   */
  @Column({ type: 'text' })
  text: string;

  /**
   * Оценка рейтинга (1–5)
   * Есть только у одобренных отзывов
   */
  @Column({ type: 'int', nullable: true })
  rating: number | null;

  /**
   * Имя автора (всегда "Гость")
   */
  @Column({ type: 'varchar', default: 'Гость' })
  authorName: string;

  /**
   * Хэш IP пользователя (для антиспама)
   * Никогда не показывается публично
   */
  @Column({ type: 'varchar', nullable: true })
  authorIpHash: string | null;

  /**
   * Статус модерации
   */
  @Index()
  @Column({
    type: 'varchar',
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  /**
   * Ответ собеседника на отзыв
   */
  @Column({ type: 'text', nullable: true })
  expertReply: string | null;

  /**
   * Дата ответа собеседника
   */
  @Column({ type: 'datetime', nullable: true })
  repliedAt: Date | null;

  /**
   * Источник отзыва
   */
  @Column({
    type: 'varchar',
    default: ReviewSource.V2,
  })
  source: ReviewSource;

  /**
   * Дата создания отзыва
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Дата последнего обновления (ответ, модерация)
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Дата модерации
   */
  @Column({ type: 'datetime', nullable: true })
  moderatedAt: Date | null;

  /**
   * Кто модерировал (admin id / login)
   */
  @Column({ type: 'varchar', nullable: true })
  moderatedBy: string | null;
}
