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

  async freeUsers() {
    const filter = { $lt: new Date() };
    const users = await this.timeouts.deleteMany({ expire: filter });
    return users;
  }

  async getAllBlockedUsers() {
    const users = (await this.timeouts.readMany({})).map((value) => value.user);
    return users;
  }

  async getExpireDate(userID: ObjectId) {
    const user = await this.timeouts.readOne({ user: userID });
    if (user) {
      return user.expire.toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
    }
    return "No Expire Date";
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
