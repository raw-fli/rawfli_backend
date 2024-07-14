import { tags } from "typia";

export interface CreateUserDto {
  email: string & tags.Format<"email">;
  username: string & tags.MaxLength<21>;
  password: string & tags.MinLength<8>;
}
