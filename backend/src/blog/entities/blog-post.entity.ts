import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ length: 300 })
  description: string;

  @Column({ length: 500 })
  excerpt: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
