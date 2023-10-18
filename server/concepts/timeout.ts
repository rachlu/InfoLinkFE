import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface TimeOutDoc extends BaseDoc {
  user: ObjectId;
  expire: Date;
}

export default class TimeoutConcept {
  public readonly timeouts = new DocCollection<TimeOutDoc>("timeout");
  private readonly blockCondition = 1; // Number of reports needed to be blocked.

  async block(user: ObjectId, secs: number) {
    await this.notBlocked(user);
    const expire = new Date();
    expire.setSeconds(expire.getSeconds() + secs);
    const _id = await this.timeouts.createOne({ user, expire });
    return { msg: `User Blocked! until ${expire}`, user: await this.timeouts.readOne({ _id }) };
  }

  async blockUpdate(user: ObjectId, num: number, secs: number) {
    if (num >= this.blockCondition && !(await this.isBlocked(user))) {
      return this.block(user, secs);
    }
    return { msg: "Block condition not satisfied" };
  }

  async getUsersUnblockedAt() {
    // Get all users that will be unblocked at this time
    const filter = { $lt: new Date() };
    const users = await this.timeouts.readMany({ filter });
    return users;
  }

  async isUserExpired(userID: ObjectId) {
    const user = await this.timeouts.readOne({ user: userID });
    if (!user) {
      return false;
    }

    const currentTime = new Date();
    if (user.expire < currentTime) {
      return true;
    }

    return false;
  }

  async freeUser(_id: ObjectId) {
    // Free specific User with _id
    if (await this.isUserExpired(_id)) {
      await this.timeouts.deleteOne({ user: _id });
      return { msg: "Blocked User freed!", state: true };
    }
    return { msg: "No User freed!", state: false };
  }

  async existsBlockedUser(userID: ObjectId) {
    const user = await this.timeouts.readOne({ user: userID });
    if (!user) {
      throw new NotAllowedError(`User with UserID ${userID} is not blocked`);
    }
  }

  async isBlocked(userID: ObjectId) {
    const blockedUser = await this.timeouts.readOne({ user: userID });
    if (blockedUser) {
      return true;
    }
    return false;
  }

  async notBlocked(userID: ObjectId) {
    const blockedUser = await this.timeouts.readOne({ user: userID });
    if (blockedUser) {
      throw new NotAllowedError(`User with UserID ${userID} is blocked until ${blockedUser.expire}`);
    }
  }
}
