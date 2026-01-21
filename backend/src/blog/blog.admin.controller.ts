import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin/blog')
@UseGuards(AdminGuard)
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  // ✅ СОЗДАНИЕ СТАТЬИ (JSON)
  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  // ✅ ЗАГРУЗКА ОБЛОЖКИ
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/blog',
        filename: (_, file, cb) => {
          const uniqueName =
            'cover-' + Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Файл не загружен');
    }

    const post = await this.blogService.findById(id);
    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }

    const imagePath = `/uploads/blog/${file.filename}`;
    return this.blogService.updateImage(id, imagePath);
  }
}
