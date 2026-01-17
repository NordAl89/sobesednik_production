import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ExpertsModule } from '../experts/experts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => ExpertsModule),
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
