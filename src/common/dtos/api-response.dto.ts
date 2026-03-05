import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export function ApiResponse<T>(classRef: Type<T>) {
  class ResponseDtoClass {
    @ApiProperty({ type: Boolean, default: true })
    result: boolean;

    @ApiProperty({ type: Number, default: 1000 })
    code: number;

    @ApiProperty({ type: () => classRef })
    data: T;
  }
  Object.defineProperty(ResponseDtoClass, 'name', {
    value: `${classRef.name}Response`,
  });
  return ResponseDtoClass;
}

export function ApiArrayResponse<T>(classRef: Type<T>) {
  class ResponseDtoClass {
    @ApiProperty({ type: Boolean, default: true })
    result: boolean;

    @ApiProperty({ type: Number, default: 1000 })
    code: number;

    @ApiProperty({ type: () => classRef, isArray: true })
    data: T[];
  }
  Object.defineProperty(ResponseDtoClass, 'name', {
    value: `${classRef.name}ArrayResponse`,
  });
  return ResponseDtoClass;
}
