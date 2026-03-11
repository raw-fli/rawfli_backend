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

@ApiTags('posts')
@Controller('api/v1/boards/:boardId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(PostListResponseDto) })
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

  @ApiOperation({ summary: '게시글 조회' })
  @ApiOkResponse({ type: ApiResponse(PostResponseDto) })
  @Get(':postId')
  async getPost(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Try<PostResponseDto>> {
    const post = await this.postsService.getPost(boardId, postId);
    return createResponseForm(post);
  }

  @ApiOperation({ summary: '게시글 삭제' })
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
}
