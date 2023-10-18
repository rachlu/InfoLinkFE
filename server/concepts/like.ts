import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface LikeDoc extends BaseDoc {
  objID: ObjectId;
  liker: ObjectId;
}

export default class LikeConcept {
  public readonly counts = new DocCollection<LikeDoc>("likes");

  async like(liker: ObjectId, objID: ObjectId) {
    await this.notLiked(liker, objID);
    const _id = await this.counts.createOne({ objID, liker });
    return { msg: "Like successfully created!", obj: await this.counts.readOne({ _id }) };
  }

  async unlike(liker: ObjectId, objID: ObjectId) {
    await this.liked(liker, objID);
    await this.counts.deleteOne({ objID, liker });
    return { msg: "Unliked successfully!" };
  }

  async getTotalLikes(objID: ObjectId) {
    return await this.counts.count({ objID });
  }

  async notLiked(liker: ObjectId, objID: ObjectId) {
    const item = await this.counts.readOne({ objID, liker });
    if (item) {
      throw new NotAllowedError("Item already liked");
    }
  }

  async liked(liker: ObjectId, objID: ObjectId) {
    const item = await this.counts.readOne({ objID, liker });
    if (item === null) {
      throw new NotFoundError("Item not Liked");
    }
  }
}
