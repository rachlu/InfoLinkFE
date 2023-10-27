import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface EditableDoc extends BaseDoc {
  editableObj: ObjectId;
  author: ObjectId;
  content: string;
}

export default class EditableConcept {
  public readonly edits = new DocCollection<EditableDoc>("editables");

  async create(objID: ObjectId, author: ObjectId, content: string) {
    await this.uniqueEdit(objID, author);
    const _id = await this.edits.createOne({ editableObj: objID, author, content });
    return { msg: "Edit successfully created!", edit: await this.edits.readOne({ _id }) };
  }

  async getAllObjIDs() {
    return (await this.edits.readMany({})).map((item) => item.editableObj);
  }

  async uniqueEdit(objID: ObjectId, author: ObjectId) {
    const result = await this.edits.readOne({ editableObj: objID, author });
    if (result) {
      throw new NotAllowedError("User already has an edit");
    }
  }

  async getEdits(objID: ObjectId) {
    const edits = await this.edits.readMany(
      { editableObj: objID },
      {
        sort: { dateUpdated: -1 },
      },
    );
    return edits;
  }

  async getObjID(_id: ObjectId) {
    const edit = await this.edits.readOne({ _id });
    if (edit === null) {
      throw new NotFoundError("Edit does not exist");
    }
    return edit.editableObj;
  }

  async isEditable(tags: string[]) {
    if (!tags.includes("community")) {
      throw new NotAllowedError("Post is not community editable");
    }
  }

  async editable(tags: string[]) {
    if (!tags.includes("community")) {
      return false;
    }
    return true;
  }

  async notAuthor(author: ObjectId, _id: ObjectId) {
    const comment = await this.edits.readOne({ _id, author });
    if (comment) {
      throw new NotAllowedError("User is Author of Blocked");
    }
  }

  async noEdits(editableObj: ObjectId) {
    const count = await this.edits.count({ editableObj });
    if (count) {
      throw new NotAllowedError("Community Post has edits");
    }
  }

  async getAuthor(_id: ObjectId) {
    const edit = await this.edits.readOne({ _id });
    if (edit === null) {
      throw new NotFoundError("Edit does not exist");
    }
    return edit.author;
  }

  async update(_id: ObjectId, update: Partial<EditableDoc>) {
    this.sanitizeUpdate(update);
    await this.edits.updateOne({ _id }, update);
    return { msg: "Edit successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.edits.deleteOne({ _id });
    return { msg: "Edit deleted successfully!" };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const post = await this.edits.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Edit ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new EditAuthorNotMatchError(user, _id);
    }
  }

  async deleteAll(editableObj: ObjectId) {
    return await this.edits.deleteMany({ editableObj });
  }

  private sanitizeUpdate(update: Partial<EditableDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class EditAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of edit {1}!", author, _id);
  }
}
