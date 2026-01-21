import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ExpertsModule } from './experts/experts.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BlogModule } from './blog/blog.module';
import { RssController } from './rss/rss.controller';

@Module({
  imports: [
    BlogModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ExpertsModule,
    AdminModule,
    ReviewsModule,
  ],
  controllers: [AppController, RssController],
  providers: [],
})
export class AppModule {}