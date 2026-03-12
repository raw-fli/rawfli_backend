export enum ErrorCode {
  EMAIL_ALREADY_CREATED = 4001,
  NO_AUTH_TOKEN = 4002,
  INVALID_CREDENTIALS = 4003,
  BOARD_NOT_FOUND = 4004,
  ARTICLE_NOT_FOUND = 4005,
  ARTICLE_TO_COMMENT_NOT_FOUND = 4006,
  USER_NOT_FOUND = 4007,
  COMMENT_TO_REPLY_NOT_FOUND = 4012,
  ARTICLE_ALREADY_REPORTED = 4014,
  NO_PERMISSION_TO_EDIT = 4015,
  COMMENT_NOT_FOUND = 4016,
  BOARD_TYPE_MISMATCH = 4017,
  POST_NOT_FOUND = 4018,
  WRONG_PASSWORD = 4019,
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.EMAIL_ALREADY_CREATED]: '이미 생성된 이메일입니다.',
  [ErrorCode.NO_AUTH_TOKEN]: '인증이 필요합니다.',
  [ErrorCode.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
  [ErrorCode.BOARD_NOT_FOUND]: '게시판을 찾지 못했어요.',
  [ErrorCode.ARTICLE_NOT_FOUND]: '게시글을 찾지 못했어요.',
  [ErrorCode.ARTICLE_TO_COMMENT_NOT_FOUND]: '댓글을 작성할 게시글을 찾지 못했어요.',
  [ErrorCode.USER_NOT_FOUND]: '사용자를 찾지 못했어요.',
  [ErrorCode.COMMENT_TO_REPLY_NOT_FOUND]: '답글을 달 댓글을 찾지 못했어요.',
  [ErrorCode.ARTICLE_ALREADY_REPORTED]: '이미 신고한 게시글이에요.',
  [ErrorCode.NO_PERMISSION_TO_EDIT]: '이 게시글의 작성자만이 수정할 수 있어요.',
  [ErrorCode.COMMENT_NOT_FOUND]: '댓글을 찾지 못했어요.',
  [ErrorCode.BOARD_TYPE_MISMATCH]: '이 게시판에서 지원하지 않는 요청이에요.',
  [ErrorCode.POST_NOT_FOUND]: '포스트를 찾지 못했어요.',
  [ErrorCode.WRONG_PASSWORD]: '현재 비밀번호가 올바르지 않습니다.',
};

export function createError(code: ErrorCode) {
  return { code, data: ErrorMessage[code] };
}