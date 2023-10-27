import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface BlockedItemDoc extends BaseDoc {
  objID: ObjectId;
  author: ObjectId;
  categories: string[];
}

export default class BlockedItemConcept {
  public readonly blocks;
  private readonly blockCondition = 1; // Number of reports in order for object to become blocked

  constructor(name: string) {
    this.blocks = new DocCollection<BlockedItemDoc>(name);
  }

  async create(objID: ObjectId, author: ObjectId, categories: string[]) {
    await this.notBlocked(objID, author);
    const _id = await this.blocks.createOne({ objID, author, categories });
    return { msg: "Block successfully created!", block: await this.blocks.readOne({ _id }) };
  }

  async updateBlock(objID: ObjectId, author: ObjectId, categories: string[], num: number) {
    const blocked = await this.isBlocked(objID);
    if (num >= this.blockCondition) {
      if (!blocked) {
        return this.create(objID, author, categories);
      }
    } else {
      if (blocked) {
        const item = await this.blocks.readOne({ objID, author, categories });
        if (item) {
          const _id = item._id;
          return await this.delete(_id);
        }
      }
    }
  }

  private async notBlocked(objID: ObjectId, author: ObjectId) {
    const result = await this.blocks.readOne({ objID, author });
    if (result) {
      throw new NotAllowedError("Object already blocked");
    }
  }

  async getBlockedInCategory(category: string) {
    const items = await this.blocks.readMany({ categories: category });
    return items.map((item) => item.objID);
  }

  async getAllBlocked() {
    const items = await this.blocks.readMany({});
    return items.map((item) => item.objID);
  }

  async delete(_id: ObjectId) {
    await this.blocked(_id);
    await this.blocks.deleteOne({ objID: _id });
    return { msg: "Block deleted!" };
  }

  async getObjID(_id: ObjectId) {
    await this.blocked(_id);
    const item = await this.blocks.readOne({ _id });
    if (item === null) {
      throw new NotFoundError("Item not found for ObjID");
    }
    return item.objID;
  }

  async getAuthor(_id: ObjectId) {
    await this.blocked(_id);
    const item = await this.blocks.readOne({ objID: _id });
    if (item === null) {
      throw new NotFoundError("Item not Found for Author!");
    }
    return item.author;
  }

  async isBlocked(objID: ObjectId) {
    const item = await this.blocks.readOne({ objID });
    if (item) {
      return true;
    }
    return false;
  }

  private async blocked(_id: ObjectId) {
    console.log("blocked");
    console.log(_id);
    const item = await this.blocks.readOne({ objID: _id });
    if (item === null) {
      throw new NotFoundError("Item not blocked");
    }
  }
}
