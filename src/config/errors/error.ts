// eslint-disable-next-line @typescript-eslint/no-namespace

import { ERROR } from '.';

export interface ALREADY_CREATED_EMAIL extends ERROR {
  type: 'business';
  result: false;
  code: 4001;
  data: '이미 생성된 이메일입니다.';
}

export interface NO_AUTH_TOKEN extends ERROR {
  type: 'business';
  result: false;
  code: 4002;
  data: '인증이 필요합니다.';
}

export interface CANNOT_FINDONE_ARTICLE extends ERROR {
  type: 'business';
  result: false;
  code: 4004;
  data: '게시글을 찾지 못했습니다.';
}

export interface NOT_FOUND_ARTICLE_TO_COMMENT extends ERROR {
  type: 'business';
  result: false;
  code: 4006;
  data: '댓글을 작성할 게시글을 찾지 못했습니다.';
}

export interface CANNOT_FIND_ONE_REPLY_COMMENT extends ERROR {
  type: 'business';
  result: false;
  code: 4012;
  data: '답글을 달 댓글을 찾지 못했어요.';
}

export interface ALREADY_REPORTED_ARTICLE extends ERROR {
  type: 'business';
  result: false;
  code: 4014;
  data: '이미 신고한 게시글입니다.';
}

export interface IS_NOT_WRITER_OF_THIS_ARTICLE extends ERROR {
  type: 'business';
  result: false;
  code: 4015;
  data: '이 게시글의 작성자만이 수정할 수 있습니다.';
}

export interface CANNOT_FIND_ONE_COMMENT extends ERROR {
  type: 'business';
  result: false;
  code: 4016;
  data: '해당 댓글을 찾지 못했습니다.';
}
