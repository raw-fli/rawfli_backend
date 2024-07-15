import { tags } from "typia";

export interface LoginUserDto {
  email: string & tags.Format<"email">;
  password: string;
}