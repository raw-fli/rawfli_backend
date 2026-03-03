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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/domain/auth/guards/jwt.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { CreateArticleDto } from 'src/domain/article/dto/create-article.dto';
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { ArticleListResponseDto, ArticleResponseDto } from 'src/domain/article/dto/article.response.dto';
import { DecodedUserToken } from 'src/domain/user/entity/user.entity';
import { ArticleService } from 'src/domain/article/article.service';
import { createResponseForm, Try } from 'src/common/types';
import { ArticleQueryDto } from './dto/article-query.dto';
import { LikePostResponseDto } from '../../common/dtos/like-article.response.dto';
import { DeletedArticleResponseDto } from './dto/deleted-article.response.dto';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';

@ApiTags('articles')
@Controller('api/v1/boards/:boardId/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiOkResponse({ type: ArticleListResponseDto })
  @Get()
  async getArticles(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: ArticleQueryDto,
  ): Promise<Try<ArticleListResponseDto>> {
    const result = await this.articleService.getArticles(
      boardId,
      query.page,
      query.limit,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '인기 게시글 목록 조회' })
  @ApiOkResponse({ type: ArticleListResponseDto })
  @Get('popular')
  async getPopularArticles(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: ArticleQueryDto,
  ): Promise<Try<ArticleListResponseDto>> {
    const result = await this.articleService.getPopularArticles(
      boardId,
      query.page,
      query.limit,
    );
    return createResponseForm(result);
  }


  @ApiOperation({ summary: '게시글 작성' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ArticleResponseDto })
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

  @ApiOperation({ summary: '게시글 조회' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @Get(':articleId')
  async getArticle(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Try<ArticleResponseDto>> {
    const article = await this.articleService.getArticle(boardId, articleId);
    return createResponseForm(article);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DeletedArticleResponseDto })
  @UseGuards(JwtGuard)
  @Delete(':articleId')
  async deleteArticle(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Try<DeletedArticleResponseDto>> {
    const deleted = await this.articleService.deleteArticle(user, boardId, articleId);
    return createResponseForm(deleted);
  }

  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: LikePostResponseDto })
  @UseGuards(JwtGuard)
  @Post(':articleId/like')
  async toggleLike(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<Try<LikePostResponseDto>> {
    const result = await this.articleService.toggleLike(user, boardId, articleId);
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '댓글 작성' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CommentResponseDto })
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

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DeletedCommentResponseDto })
  @UseGuards(JwtGuard)
  @Delete(':articleId/comments/:commentId')
  async deleteComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) _boardId: number,
    @Param('articleId', ParseIntPipe) _articleId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Try<DeletedCommentResponseDto>> {
    const deleted = await this.articleService.deleteComment(user, commentId);
    return createResponseForm(deleted);
  }
}
