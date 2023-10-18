import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CountDoc extends BaseDoc {
  userID: ObjectId;
  obj: string;
  count: number;
}

export default class CountConcept {
  public readonly counts = new DocCollection<CountDoc>("count");

  private sanitizeCount(c: CountDoc) {
    // eslint-disable-next-line
    const { obj, count, ...rest } = c;
    return `${obj}: ${count}`;
  }

  private async create(userID: ObjectId, obj: string) {
    await this.uniqueCount(userID, obj);
    const _id = await this.counts.createOne({ userID, obj, count: 1 });
    return { msg: "Count successfully created!", post: await this.counts.readOne({ _id }) };
  }

  async update(userID: ObjectId, objs: string[], amount: number) {
    for (const obj of objs) {
      if (obj === "commmunity") {
        continue;
      }
      const item = await this.counts.readOne({ userID, obj });
      if (item) {
        item.count += amount;
        if (item.count <= 0) {
          await this.counts.deleteOne({ userID, obj });
        } else {
          await this.counts.updateOne({ userID, obj }, item);
        }
      } else if (amount > 0) {
        await this.create(userID, obj);
      }
    }
    return { msg: "Count successfully updated!" };
  }

  async delete(userID: ObjectId, obj: String) {
    await this.countExists(userID, obj);
    return await this.counts.deleteOne({ userID, obj });
  }

  async getObjCount(userID: ObjectId, obj: String) {
    const count = await this.counts.readOne({ userID, obj });
    if (count === null) {
      return 0;
    }
    return count.count;
  }

  async getAllCounts(userID: ObjectId) {
    const counts = await this.counts.readMany({ userID });
    return counts
      .filter((c) => {
        return c.obj;
      })
      .map(this.sanitizeCount);
  }

  async getCounts(userID: ObjectId, objs: string[]) {
    const counts = new Map();
    for (const obj of objs) {
      counts.set(obj, await this.getObjCount(userID, obj));
    }
    return counts;
  }

  async uniqueCount(userID: ObjectId, obj: String) {
    const item = await this.counts.readOne({ userID, obj });
    if (item) {
      throw new NotAllowedError("Report Count for specific item already exists");
    }
  }

  async countExists(userID: ObjectId, obj: String) {
    const item = await this.counts.readOne({ userID, obj });
    if (item === null) {
      throw new NotFoundError("Count for specific obj does not exist");
    }
  }
}
