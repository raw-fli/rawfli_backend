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
import { CreatePostDto } from 'src/domain/post/dto/create-post.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { PostListResponseDto, PostResponseDto } from 'src/domain/post/dto/post.response.dto';
import { DecodedUserToken } from 'src/domain/user/entity/user.entity';
import { PostsService } from 'src/domain/post/post.service';
import { createResponseForm, Try } from 'src/common/types';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { CreateCommentDto } from 'src/common/dtos/create-comment.dto';
import { CommentResponseDto } from 'src/common/dtos/comment.response.dto';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';
import { PostQueryDto } from 'src/domain/post/dto/post-query.dto';

@ApiTags('posts')
@Controller('api/v1/boards/:boardId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @ApiOperation({ summary: '포스트 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(PostListResponseDto) })
  @Get()
  async getPosts(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: PostQueryDto,
  ): Promise<Try<PostListResponseDto>> {
    const result = await this.postsService.getPosts(
      boardId,
      query.page,
      query.limit,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '인기 포스트 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(PostListResponseDto) })
  @Get('popular')
  async getPopularPosts(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: PostQueryDto,
  ): Promise<Try<PostListResponseDto>> {
    const result = await this.postsService.getPopularPosts(
      boardId,
      query.page,
      query.limit,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '포스트 작성' })
  @ApiCreatedResponse({ type: ApiResponse(PostResponseDto) })
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

  @ApiOperation({ summary: '포스트 조회' })
  @ApiOkResponse({ type: ApiResponse(PostResponseDto) })
  @Get(':postId')
  async getPost(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<PostResponseDto>> {
    const post = await this.postsService.getPost(boardId, postId);
    return createResponseForm(post);
  }

  @ApiOperation({ summary: '포스트 삭제' })
  @ApiOkResponse({ type: ApiResponse(DeletedPostResponseDto) })
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

  @ApiOperation({ summary: '작품 댓글 작성' })
  @ApiCreatedResponse({ type: ApiResponse(CommentResponseDto) })
  @UseGuards(JwtGuard)
  @Post(':postId/photos/:photoId/comments')
  async createPhotoComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('photoId') photoId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<Try<CommentResponseDto>> {
    const comment = await this.postsService.createPhotoComment(user, boardId, postId, photoId, dto);
    return createResponseForm(comment);
  }

  @ApiOperation({ summary: '작품 댓글 삭제' })
  @ApiOkResponse({ type: ApiResponse(DeletedCommentResponseDto) })
  @UseGuards(JwtGuard)
  @Delete(':postId/photos/:photoId/comments/:commentId')
  async deletePhotoComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('photoId') photoId: string,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Try<DeletedCommentResponseDto>> {
    const deleted = await this.postsService.deletePhotoComment(user, boardId, commentId);
    return createResponseForm(deleted);
  }
}
