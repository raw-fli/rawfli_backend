import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/domain/auth/guards/jwt.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { CreateArticleDto } from 'src/domain/article/dto/create-article.dto';
import { CreateCommentDto } from 'src/domain/post/dto/create-comment.dto';
import { CommentResponseDto } from 'src/domain/post/dto/comment.response.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { ArticleListResponseDto, ArticleResponseDto } from 'src/domain/article/dto/article.response.dto';
import { DecodedUserToken } from 'src/domain/user/entity/user.entity';
import { ArticleService } from 'src/domain/article/article.service';
import { createResponseForm, Try } from 'src/common/types';

@Controller('api/v1/boards/:boardId/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Get()
  async getArticles(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<ArticleListResponseDto>> {
    const result = await this.articleService.getArticles(
      boardId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }

  @Get('popular')
  async getPopularArticles(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<ArticleListResponseDto>> {
    const result = await this.articleService.getPopularArticles(
      boardId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }


  @UseGuards(JwtGuard)
  @Post()
  async createArticle(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreateArticleDto,
  ): Promise<Try<ArticleResponseDto>> {
    const article = await this.articleService.createArticle(user, boardId, dto);
    return createResponseForm(article);
  }

  @Get(':articleId')
  async getArticle(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Try<ArticleResponseDto>> {
    const article = await this.articleService.getArticle(boardId, articleId);
    return createResponseForm(article);
  }

  @UseGuards(JwtGuard)
  @Delete(':articleId')
  async deleteArticle(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Try<DeletedPostResponseDto>> {
    const deleted = await this.articleService.deleteArticle(user, boardId, articleId);
    return createResponseForm(deleted);
  }

  @UseGuards(JwtGuard)
  @Post(':articleId/like')
  async toggleLike(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Try<{ liked: boolean }>> {
    const result = await this.articleService.toggleLike(user, boardId, articleId);
    return createResponseForm(result);
  }

  @UseGuards(JwtGuard)
  @Post(':articleId/comments')
  async createComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() dto: CreateCommentDto,
  ): Promise<Try<CommentResponseDto>> {
    const comment = await this.articleService.createComment(user, boardId, articleId, dto);
    return createResponseForm(comment);
  }

  @UseGuards(JwtGuard)
  @Delete(':articleId/comments/:commentId')
  async deleteComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Try<null>> {
    await this.articleService.deleteComment(user, commentId);
    return createResponseForm(null);
  }
}
