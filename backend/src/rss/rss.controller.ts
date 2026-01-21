import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as RSS from 'rss';
import { BlogService } from '../blog/blog.service';

@Controller()
export class RssController {
  constructor(private readonly blogService: BlogService) {}

  @Get('rss.xml')
  async rss(@Res() res: Response) {
    const feed = new RSS({
      title: 'Блог «Собеседник на час»',
      description:
        'Статьи о поддержке, доверительном общении и возможности выговориться',
      site_url: 'https://sobesednik-na-chas.ru',
      feed_url: 'https://sobesednik-na-chas.ru/rss.xml',
      language: 'ru',
      pubDate: new Date(),
    });

    const posts = await this.blogService.findAll(50, 0);

    posts.forEach((post) => {
      feed.item({
        title: post.title,
        description: post.excerpt,
        url: `https://sobesednik-na-chas.ru/blog/${post.slug}`,
        date: post.createdAt,
      });
    });

    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml({ indent: true }));
  }
}
