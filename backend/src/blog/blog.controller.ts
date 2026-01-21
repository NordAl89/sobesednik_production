import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  getAll(
  @Query('limit') limit = '10',
  @Query('offset') offset = '0',
) {
  return this.blogService.findAll(
    Number(limit),
    Number(offset),
  );
}
  

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.blogService.findBySlug(slug);

    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }

    return post;
  }
}
