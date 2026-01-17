import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertsController } from './experts.controller';
import { ExpertsService } from './experts.service';
import { Expert } from './entities/expert.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { TelegramService } from '../telegram/telegram.service';
import { ReviewsModule } from '../reviews/reviews.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Expert]),
    forwardRef(() => ReviewsModule),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          console.log('📁 Путь сохранения файла:', uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const filename = `${randomName}${extname(file.originalname)}`;
          console.log('📄 Имя файла:', filename);
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        console.log('🔍 Проверка типа файла:', file.mimetype);
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          console.log('❌ Неподдерживаемый тип файла:', file.mimetype);
          cb(new Error('Only images and videos are allowed'), false);
        }
      },
    }),
  ],
  controllers: [ExpertsController],
  providers: [ExpertsService, TelegramService],
  exports: [ExpertsService],
})
export class ExpertsModule {}