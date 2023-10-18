import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface VerifiedItemDoc extends BaseDoc {
  user: ObjectId;
  tag: String;
}

export default class VerifiedItemConcept {
  public readonly verifiedItems = new DocCollection<VerifiedItemDoc>("verifiedItems");
  private readonly verifyCondition = 1; // Number of Likes needed to be verified

  private getTag(i: VerifiedItemDoc) {
    // eslint-disable-next-line
    const { tag, ...rest } = i; // Only get tagID
    return tag;
  }

  private getUser(i: VerifiedItemDoc) {
    // eslint-disable-next-line
    const { user, ...rest } = i; // Only get userID
    return user;
  }

  private async verify(user: ObjectId, tag: string) {
    const _id = await this.verifiedItems.createOne({ user, tag });
    return { msg: `${user} verified for tag ${tag}`, user: await this.verifiedItems.readOne({ _id }) };
  }

  private async unverify(user: ObjectId, tag: string) {
    await this.isVerified(user, [tag]);
    return await this.verifiedItems.deleteOne({ user, tag });
  }

  async updateVerify(user: ObjectId, tags: string[], nums: Map<string, number>) {
    for (const tag of tags) {
      const verified = await this.checkVerify(user, tag);
      const count = nums.get(tag);
      if (count && count >= this.verifyCondition) {
        if (!verified) {
          return await this.verify(user, tag);
        }
      } else {
        if (verified) {
          return await this.unverify(user, tag);
        }
      }
    }
  }

  async getVerifiedTags(user: ObjectId) {
    const items = await this.verifiedItems.readMany({ user });
    // eslint-disable-next-line
    const tags = items.map(this.getTag)
    return tags;
  }

  async getVerifiedUsers(tag: string) {
    const items = await this.verifiedItems.readMany({ tag });
    // eslint-disable-next-line
    const users = items.map(this.getUser)
    return users;
  }

  private async checkVerify(user: ObjectId, tag: string) {
    const obj = await this.verifiedItems.readOne({ user, tag });
    if (obj) {
      return true;
    }
    return false;
  }

  async isVerified(user: ObjectId, tags: string[]) {
    for (const tag of tags) {
      const obj = await this.verifiedItems.readOne({ user, tag });
      if (obj !== null) {
        return true;
      }
    }
    throw new NotAllowedError(`${user} not verified`);
  }
}
