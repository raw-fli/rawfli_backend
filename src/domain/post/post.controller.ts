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
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CreatePostDto } from 'src/domain/post/dto/create-post.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { PostListResponseDto, PostResponseDto } from 'src/domain/post/dto/post.response.dto';
import { DecodedUserToken } from 'src/domain/user/entity/user.entity';
import { PostsService } from 'src/domain/post/post.service';
import { createResponseForm, Try } from 'src/common/types';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LikePostResponseDto } from '../../common/dtos/like-article.response.dto';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';

@ApiTags('posts')
@Controller('api/v1/boards/:boardId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiOkResponse({ type: PostListResponseDto })
  @Get()
  async getPosts(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<PostListResponseDto>> {
    const result = await this.postsService.getPosts(
      boardId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '게시글 작성' })
  @ApiCreatedResponse({ type: PostResponseDto })
  @UseGuards(JwtGuard)
  @Post()
  async createPost(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreatePostDto,
  ): Promise<Try<PostResponseDto>> {
    const post = await this.postsService.createPost(user, boardId, dto);
    return createResponseForm(post);
  }

  @ApiOperation({ summary: '게시글 조회' })
  @ApiOkResponse({ type: PostResponseDto })
  @Get(':postId')
  async getPost(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<PostResponseDto>> {
    const post = await this.postsService.getPost(boardId, postId);
    return createResponseForm(post);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @ApiOkResponse({ type: DeletedPostResponseDto })
  @UseGuards(JwtGuard)
  @Delete(':postId')
  async deletePost(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<DeletedPostResponseDto>> {
    const deleted = await this.postsService.deletePost(user, boardId, postId);
    return createResponseForm(deleted);
  }

  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiOkResponse({ type: LikePostResponseDto })
  @UseGuards(JwtGuard)
  @Post(':postId/like')
  async toggleLike(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<LikePostResponseDto>> {
    const result = await this.postsService.toggleLike(user, boardId, postId);
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '댓글 작성' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @UseGuards(JwtGuard)
  @Post(':postId/comments')
  async createComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
  ): Promise<Try<CommentResponseDto>> {
    const comment = await this.postsService.createComment(user, boardId, postId, dto);
    return createResponseForm(comment);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiOkResponse({ type: DeletedCommentResponseDto })
  @UseGuards(JwtGuard)
  @Delete(':postId/comments/:commentId')
  async deleteComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) _boardId: number,
    @Param('postId', ParseIntPipe) _postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Try<DeletedCommentResponseDto>> {
    const deleted = await this.postsService.deleteComment(user, commentId);
    return createResponseForm(deleted);
  }

  // TODO: temporary
  @Get('deleted/all')
  async getDeletedPosts(
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<Try<any[]>> {
    const posts = await this.postsService.getDeletedPosts(boardId);
    return createResponseForm(posts);
  }
}
