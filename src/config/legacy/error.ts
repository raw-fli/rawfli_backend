/* eslint-disable @typescript-eslint/no-namespace */
/**
 * legacy
 */
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { NTuple, ValueOfError } from '../../types';

export const ERROR = {
  ALREADY_CREATED_EMAIL: { result: false, code: 4001, data: '이미 생성된 이메일입니다.' },
  NO_AUTH_TOKEN: { result: false, code: 4002, data: '인증이 필요합니다.' },
  CANNOT_FINDONE_ARTICLE: { result: false, code: 4004, data: '게시글을 찾지 못했어요.' },
  NOT_FOUND_ARTICLE_TO_COMMENT: { result: false, code: 4006, data: '댓글을 작성할 게시글을 찾지 못했어요.' },
  CANNOT_FIND_ONE_REPLY_COMMENT: { result: false, code: 4012, data: '답글을 달 댓글을 찾지 못했어요.' },
  ALREADY_REPORTED_ARTICLE: { result: false, code: 4014, data: '이미 신고한 게시글이에요.' },
  IS_NOT_WRITER_OF_THIS_ARTICLE: { result: false, code: 4015, data: '이 게시글의 작성자만이 수정할 수 있습니다.' },
} as const;

export const createErrorSchema = (error: ValueOfError): SchemaObject => {
  return {
    type: 'object',
    properties: {
      code: { type: 'number', example: error.code },
      message: { type: 'string', example: error.data },
    },
  };
};

export const createErrorSchemas = <T extends string[]>(errors: NTuple<T['length'], ValueOfError[]>): SchemaObject => {
  return {
    type: 'array',
    items: {
      anyOf: [...errors].map((error: ValueOfError) => {
        return {
          properties: {
            code: { type: 'number', example: error.code },
            message: { type: 'string', example: error.data },
          },
        };
      }),
    },
  };
};