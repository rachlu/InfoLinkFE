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

  /**
   * @param liker User that liked the object
   * @param objID Object ID
   * @returns total number of likes the object has and true/false
   *          based on whether liker has liked the obj
   */
  async getLikeStatus(liker: ObjectId, objID: ObjectId) {
    const total = await this.counts.count({ objID });
    const result = await this.counts.readOne({ liker, objID });
    let liked;
    if (result) {
      liked = true;
    } else {
      liked = false;
    }

    return { total: total, liked: liked };
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
