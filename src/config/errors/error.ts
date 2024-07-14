import { ERROR } from '.';

export interface EMAIL_ALREADY_CREATED extends ERROR {
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

export interface BOARD_NOT_FOUND extends ERROR {
  type: 'business';
  result: false;
  code: 4004;
  data: '게시판을 찾지 못했어요.';
}

export interface ARTICLE_NOT_FOUND extends ERROR {
  type: 'business';
  result: false;
  code: 4004;
  data: '게시글을 찾지 못했어요.';
}

export interface COMMENT_NOT_FOUND extends ERROR {
  type: 'business';
  result: false;
  code: 4016;
  data: '댓글을 찾지 못했어요.';
}

export interface ARTICLE_TO_COMMENT_NOT_FOUND extends ERROR {
  type: 'business';
  result: false;
  code: 4006;
  data: '댓글을 작성할 게시글을 찾지 못했어요.';
}

export interface COMMENT_TO_REPLY_NOT_FOUND extends ERROR {
  type: 'business';
  result: false;
  code: 4012;
  data: '답글을 달 댓글을 찾지 못했어요.';
}

export interface ARTICLE_ALREADY_REPORTED extends ERROR {
  type: 'business';
  result: false;
  code: 4014;
  data: '이미 신고한 게시글이에요.';
}

export interface NO_PERMISSION_TO_EDIT extends ERROR {
  type: 'business';
  result: false;
  code: 4015;
  data: '이 게시글의 작성자만이 수정할 수 있습니다.';
}
