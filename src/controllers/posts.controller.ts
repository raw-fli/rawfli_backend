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
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { CreateCommentDto } from 'src/models/dtos/request/create-comment.dto';
import { CreatePostDto } from 'src/models/dtos/request/create-post.dto';
import { CommentResponseDto } from 'src/models/dtos/response/comment.response.dto';
import { PostListResponseDto, PostResponseDto } from 'src/models/dtos/response/post.response.dto';
import { DecodedUserToken } from 'src/models/tables/user.entity';
import { PostsService } from 'src/providers/posts.service';
import { createResponseForm, Try } from 'src/types';

@Controller('api/v1/boards/:boardId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

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

  @Get(':postId')
  async getPost(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<PostResponseDto>> {
    const post = await this.postsService.getPost(boardId, postId);
    return createResponseForm(post);
  }

  @UseGuards(JwtGuard)
  @Delete(':postId')
  async deletePost(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<null>> {
    await this.postsService.deletePost(user, boardId, postId);
    return createResponseForm(null);
  }

  @UseGuards(JwtGuard)
  @Post(':postId/like')
  async toggleLike(
    @UserDecorator() user: DecodedUserToken,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<{ liked: boolean }>> {
    const result = await this.postsService.toggleLike(user, boardId, postId);
    return createResponseForm(result);
  }

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

  @UseGuards(JwtGuard)
  @Delete(':postId/comments/:commentId')
  async deleteComment(
    @UserDecorator() user: DecodedUserToken,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Try<null>> {
    await this.postsService.deleteComment(user, commentId);
    return createResponseForm(null);
  }
}
