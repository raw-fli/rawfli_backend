import { Column, Entity, Index, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { CommonColumns } from "src/common/entities/common-columns";

@Entity()
@Index(["followerId", "followingId"], { unique: true })
export class Follow extends CommonColumns {
    @ManyToOne(() => User, (user) => user.followings, { onDelete: "CASCADE" })
    follower!: User;

    @Column()
    followerId!: number;

    @ManyToOne(() => User, (user) => user.followers, { onDelete: "CASCADE" })
    following!: User;

    @Column()
    followingId!: number;
}