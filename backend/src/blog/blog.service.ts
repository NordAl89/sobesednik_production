import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
  ) {}

  async create(dto: CreateBlogPostDto) {
    const post = this.blogRepository.create(dto);
    return this.blogRepository.save(post);
  }

  async findAll(limit = 10, offset = 0) {
  return this.blogRepository.find({
    where: { published: true },
    order: { createdAt: 'DESC' },
    take: limit,
    skip: offset,
    select: [
      'id',
      'title',
      'slug',
      'excerpt',
      'image',
      'createdAt',
    ], // контент не отдаём в списке
  });
}


  async findBySlug(slug: string) {
  return this.blogRepository.findOne({
    where: {
      slug,
      published: true,
    },
  });
}

async remove(id: number) {
  return this.blogRepository.delete(id);
}

async findById(id: number) {
  return this.blogRepository.findOne({ where: { id } });
}

async updateImage(id: number, image: string) {
  await this.blogRepository.update(id, { image });
  return this.findById(id);
}

}
