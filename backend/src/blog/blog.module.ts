import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogPost } from './entities/blog-post.entity';
import { BlogAdminController } from './blog.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  controllers: [
    BlogController,
    BlogAdminController,
  ],
  providers: [BlogService],
  exports: [BlogService], // 🔥 ВАЖНО
})
export class BlogModule {}

