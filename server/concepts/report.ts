import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ReportDoc extends BaseDoc {
  reporter: ObjectId;
  edit: ObjectId;
  author: ObjectId;
}

export default class ReportConcept {
  public readonly reports = new DocCollection<ReportDoc>("report");

  async create(reporter: ObjectId, edit: ObjectId, author: ObjectId) {
    await this.notReported(reporter, edit);
    const _id = await this.reports.createOne({ reporter, edit, author });
    return { msg: "Report created successfully!", report: await this.reports.readOne({ _id }) };
  }

  async delete(reporter: ObjectId, edit: ObjectId) {
    await this.reportExists(reporter, edit);
    await this.reports.deleteOne({ reporter, edit });
    return { msg: "Report deleted!" };
  }

  async deleteAll(author: ObjectId) {
    await this.reports.deleteMany({ author });
    return { msg: "Reports Cleared!" };
  }

  async deleteObj(edit: ObjectId) {
    return await this.reports.deleteMany({ edit });
  }

  async isReporter(user: ObjectId, edit: ObjectId) {
    const report = await this.reports.readOne({ reporter: user, edit });
    if (!report) {
      throw new NotFoundError(`User is not reporter`);
    }
    if (report.reporter.toString() !== user.toString()) {
      throw new ReportNotMatchError(user, edit);
    }
  }

  async getTotalReports(objID: ObjectId) {
    const count = await this.reports.count({ edit: objID });
    return count;
  }

  private async notReported(reporter: ObjectId, edit: ObjectId) {
    if (await this.reports.readOne({ reporter, edit })) {
      throw new NotAllowedError("User already reported this object");
    }
  }

  async reportExists(reporter: ObjectId, edit: ObjectId) {
    const report = this.reports.readOne({ reporter, edit });
    if (!report) {
      throw new NotAllowedError("Report Does not Exist");
    }
  }
}

export class ReportNotMatchError extends NotAllowedError {
  constructor(
    public readonly reporter: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the reporter of report {1}!", reporter, _id);
  }
}
