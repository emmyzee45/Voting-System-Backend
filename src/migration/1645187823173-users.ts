import { DeepPartial, MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../entity/User";
import usersData from "../seed/users";

export class users1645187823173 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    const users = usersData as DeepPartial<User>[];
    await User.save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
