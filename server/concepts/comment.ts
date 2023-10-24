import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CommentDoc extends BaseDoc {
  postID: ObjectId;
  author: ObjectId;
  content: String;
}

export default class CommentConcept {
  public readonly comments = new DocCollection<CommentDoc>("comments");

  async create(postID: ObjectId, author: ObjectId, content: String) {
    await this.uniqueComment(postID, author);
    const _id = await this.comments.createOne({ postID, author, content });
    return { msg: "Comment successfully created!", post: await this.comments.readOne({ _id }) };
  }

  async uniqueComment(postID: ObjectId, author: ObjectId) {
    const result = await this.comments.readOne({ postID, author });
    if (result) {
      throw new NotAllowedError("Only One Comment Per User Per Post!");
    }
  }

  async update(_id: ObjectId, update: Partial<CommentDoc>) {
    this.sanitizeUpdate(update);
    await this.comments.updateOne({ _id }, update);
    return { msg: "Comment successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.comments.deleteOne({ _id });
    return { msg: "Comment deleted successfully!" };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (!comment) {
      throw new NotFoundError(`Comment ${_id} does not exist!`);
    }
    if (comment.author.toString() !== user.toString()) {
      throw new CommentAuthorNotMatchError(user, _id);
    }
  }

  async notAuthor(author: ObjectId, _id: ObjectId) {
    const comment = await this.comments.readOne({ _id, author });
    if (comment) {
      throw new NotAllowedError("User is Author of Comment");
    }
  }

  async getAuthor(_id: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (comment === null) {
      throw new NotFoundError("Comment not found");
    }
    return comment.author;
  }

  async getPost(_id: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (comment === null) {
      throw new NotFoundError("Comment not found");
    }
    return comment.postID;
  }

  async getByPost(_id: ObjectId) {
    return await this.comments.readMany({ postID: _id });
  }

  async getByAuthor(_id: ObjectId) {
    return await this.comments.readMany({ author: _id });
  }

  async noComments(postID: ObjectId) {
    const count = await this.comments.count({ postID });
    if (count) {
      throw new NotAllowedError("Post has comments!");
    }
  }

  private sanitizeUpdate(update: Partial<CommentDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class CommentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of comment {1}!", author, _id);
  }
}
