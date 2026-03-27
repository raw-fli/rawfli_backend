import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin, DecodedAdminToken } from 'src/domain/admin/entity/admin.entity';
import { CreateAdminDto } from 'src/domain/admin/dto/create-admin.dto';
import { createError, ErrorCode } from 'src/common/exception/error';
import { Image } from 'src/domain/aws/entity/image.entity';
import { DeletedPost } from 'src/domain/post/entity/deleted-post.entity';
import { DeletedArticle } from 'src/domain/article/entity/deleted-article.entity';
import { DeletedComment } from 'src/common/entities/deleted-comment.entity';
import {
  AdminDeletedArticleListResponseDto,
  AdminDeletedCommentListResponseDto,
  AdminDeletedPostListResponseDto,
  AdminImageListResponseDto,
  AdminImageResponseDto,
} from 'src/domain/admin/dto/admin-moderation.response.dto';
import { DeletedArticleResponseDto } from 'src/domain/article/dto/deleted-article.response.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(DeletedPost) private readonly deletedPostRepository: Repository<DeletedPost>,
    @InjectRepository(DeletedArticle) private readonly deletedArticleRepository: Repository<DeletedArticle>,
    @InjectRepository(DeletedComment) private readonly deletedCommentRepository: Repository<DeletedComment>,
    private readonly jwtService: JwtService,
  ) { }

  async hasAnyAdmin(): Promise<boolean> {
    const count = await this.adminRepository.count();
    return count > 0;
  }

  async createAdmin(dto: CreateAdminDto): Promise<DecodedAdminToken> {
    const existing = await this.adminRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException(createError(ErrorCode.ADMIN_ALREADY_EXISTS));
    }

    const admin = new Admin();
    admin.username = dto.username;
    admin.password = await bcrypt.hash(dto.password, 10);
    const saved = await this.adminRepository.save(admin);

    return { id: saved.id, username: saved.username };
  }

  async validateAdmin(username: string, password: string): Promise<DecodedAdminToken | null> {
    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && await bcrypt.compare(password, admin.password)) {
      return { id: admin.id, username: admin.username };
    }
    return null;
  }

  adminLogin(admin: DecodedAdminToken) {
    return this.jwtService.sign({ ...admin });
  }

  async getImages(page: number = 1, limit: number = 20): Promise<AdminImageListResponseDto> {
    const [images, total] = await this.imageRepository.findAndCount({
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = images.map((image) =>
      plainToInstance(
        AdminImageResponseDto,
        {
          id: image.id,
          key: image.key,
          exifData: image.exifData,
          uploaderId: image.uploader?.id,
          uploaderUsername: image.uploader?.username,
          createdAt: image.createdAt,
        },
        { excludeExtraneousValues: true },
      ),
    );

    return plainToInstance(
      AdminImageListResponseDto,
      { images: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async getDeletedPosts(page: number = 1, limit: number = 20): Promise<AdminDeletedPostListResponseDto> {
    const [posts, total] = await this.deletedPostRepository.findAndCount({
      order: { deletedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = posts.map((post) =>
      plainToInstance(DeletedPostResponseDto, post, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      AdminDeletedPostListResponseDto,
      { posts: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async getDeletedArticles(page: number = 1, limit: number = 20): Promise<AdminDeletedArticleListResponseDto> {
    const [articles, total] = await this.deletedArticleRepository.findAndCount({
      order: { deletedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = articles.map((article) =>
      plainToInstance(DeletedArticleResponseDto, article, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      AdminDeletedArticleListResponseDto,
      { articles: items, total },
      { excludeExtraneousValues: true },
    );
  }

  async getDeletedComments(page: number = 1, limit: number = 20): Promise<AdminDeletedCommentListResponseDto> {
    const [comments, total] = await this.deletedCommentRepository.findAndCount({
      order: { deletedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = comments.map((comment) =>
      plainToInstance(DeletedCommentResponseDto, comment, { excludeExtraneousValues: true }),
    );

    return plainToInstance(
      AdminDeletedCommentListResponseDto,
      { comments: items, total },
      { excludeExtraneousValues: true },
    );
  }
}
