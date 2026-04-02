import { IsOptional, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: '댓글 내용을 입력해주세요.' })
  @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
  content: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
