import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { BlockedComment, BlockedEdit, BlockedPost, Comment, Editable, Friend, Like, Post, Report, Tag, TagCount, Timeout, User, Verified, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const created = await User.create(username, password);
    const createdUser = created.user;
    let msg = created.msg;
    if (createdUser) {
      const timeoutResult = await Timeout.block(createdUser._id, 60);
      msg += " " + timeoutResult.msg;
    }
    return { msg: msg, user: created.user };
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string, tag?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else if (tag) {
      const ids = await Tag.getPosts(tag);
      posts = await Post.getByIDs(ids);
    } else {
      posts = await Post.getPosts({});
    }
    // Only return posts that are not blocked
    // const promises = posts.map(async (post) => {
    //   return !(await BlockedPost.isBlocked(post._id));
    // });
    // const data_with = await Promise.all(promises);
    // posts = posts.filter((value, index) => data_with[index]);
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post), postID: created.postID };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    console.log("update");
    const id = new ObjectId(_id);
    await Post.isAuthor(user, id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    return await Post.update(id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    return await Helper.deletePost(session, _id, true);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.post("/posts/:_id/report")
  async reportPost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const authorID = await Post.getAuthor(id);
    const msg = await Helper.report(user, authorID, id);
    const num = await Report.getTotalReports(id);
    const tags = await Tag.getTagsPost(id);
    await BlockedPost.updateBlock(id, authorID, tags, num);
    return msg;
  }

  @Router.delete("/posts/:_id/report")
  async deleteReportPost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const authorID = await Post.getAuthor(id);
    const msg = await Helper.deleteReport(user, authorID, id);
    const num = await Report.getTotalReports(id);
    const tags = await Tag.getTagsPost(id);
    await BlockedPost.updateBlock(id, authorID, tags, num);
    return msg;
  }

  @Router.post("/comments/:_id/report")
  async reportComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const authorID = await Comment.getAuthor(id);
    const msg = await Helper.report(user, authorID, id);
    const num = await Report.getTotalReports(id);
    const postID = await Comment.getPost(id);
    const tags = await Tag.getTagsPost(postID);
    await BlockedComment.updateBlock(id, authorID, tags, num);
    return msg;
  }

  @Router.delete("/comment/:_id/report")
  async deleteReportComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const authorID = await Comment.getAuthor(id);
    const msg = await Helper.deleteReport(user, authorID, id);
    const num = await Report.getTotalReports(id);
    const postID = await Comment.getPost(id);
    const tags = await Tag.getTagsPost(postID);
    await BlockedComment.updateBlock(id, authorID, tags, num);
    return msg;
  }

  @Router.post("/edits/:_id/report")
  async reportEdit(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const authorID = await Editable.getAuthor(id);
    const msg = await Helper.report(user, authorID, id);
    const num = await Report.getTotalReports(id);
    const postID = await Editable.getObjID(id);
    const tags = await Tag.getTagsPost(postID);
    await BlockedEdit.updateBlock(id, authorID, tags, num);
    return msg;
  }

  @Router.delete("/edits/:_id/report")
  async deleteReportEdit(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const authorID = await Editable.getAuthor(id);
    const msg = await Helper.deleteReport(user, authorID, id);
    const num = await Report.getTotalReports(id);
    const postID = await Editable.getObjID(id);
    const tags = await Tag.getTagsPost(postID);
    await BlockedEdit.updateBlock(id, authorID, tags, num);
    return msg;
  }

  @Router.get("/report")
  async getReportTagNum(session: WebSessionDoc) {
    // Gets the number of reports an user has
    const user = WebSession.getUser(session);
    const report = "";
    const totalReport = await TagCount.getObjCount(user, report);
    return { msg: `Total Reports: ${totalReport}` };
  }

  @Router.post("/edits/:_id")
  async createEdit(session: WebSessionDoc, _id: ObjectId, content: string) {
    // Create an edit to a community tagged Post with given content
    const postID = new ObjectId(_id);
    const user = WebSession.getUser(session);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const pID = new ObjectId(postID);
    const tags = await Tag.getTagsPost(pID);
    await Editable.isEditable(tags);
    return await Editable.create(pID, user, content);
  }

  @Router.patch("/edits/:_id")
  async updateEdit(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    console.log("edit update");
    await Editable.isAuthor(user, id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    return await Editable.update(id, update);
  }

  @Router.delete("/edits/:_id")
  async deleteEdit(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    await Editable.isAuthor(user, id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const post = await Editable.getObjID(id);
    const msg = await Editable.delete(id);
    let noneLeft = false;
    if ((await Editable.getEdits(post)).length == 0) {
      await Helper.deletePost(session, post, false);
      noneLeft = true;
    }
    await Report.deleteObj(id);
    const tags = await Tag.getTagsPost(post);
    const count = (await Like.getLikeStatus(user, id)).total;
    await TagCount.update(user, tags, -count);
    return { msg: msg, noneLeft: noneLeft };
  }

  @Router.get("/edits/:_id")
  async getEdits(_id: ObjectId) {
    const id = new ObjectId(_id);
    const edits = await Editable.getEdits(id);
    // const promises = edits.map(async (edit) => {
    //   return !(await BlockedEdit.isBlocked(edit._id));
    // });
    // const data_with = await Promise.all(promises);
    // edits = edits.filter((value, index) => data_with[index]);
    return edits;
  }

  @Router.get("/edits")
  async getAllEditableObjIDs() {
    return await Editable.getAllObjIDs();
  }

  @Router.delete("/edits/:_id/approve")
  async approveEdit(session: WebSessionDoc, _id: ObjectId) {
    // Let a verified user approve a reported edit
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const post = await Editable.getObjID(id);
    const tags = await Tag.getTagsPost(post);
    await Editable.notAuthor(user, id);
    await Helper.approve(user, tags, id);
    return await BlockedEdit.delete(id);
  }

  @Router.delete("/edits/:_id/reject")
  async rejectEdit(session: WebSessionDoc, _id: ObjectId) {
    // Let a verified user reject and delete a reported edit
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const post = await Editable.getObjID(id);
    const tags = await Tag.getTagsPost(post);
    await Editable.notAuthor(user, id);
    await Helper.reject(user, tags, id);
    await BlockedEdit.delete(id);
    return await Editable.delete(id);
  }

  @Router.put("/comments/:_id/approve")
  async approveComment(session: WebSessionDoc, _id: ObjectId) {
    // Let a verified user approve a reported edit
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const commentID = await BlockedComment.getObjID(id);
    const post = await Comment.getPost(commentID);
    const tags = await Tag.getTagsPost(post);
    await Comment.notAuthor(user, id);
    await Helper.approve(user, tags, commentID);
    return await BlockedComment.delete(id);
  }

  @Router.delete("/comments/:_id/reject")
  async rejectComment(session: WebSessionDoc, _id: ObjectId) {
    // Let a verified user reject and delete a reported edit
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const commentID = await BlockedComment.getObjID(id);
    const post = await Comment.getPost(commentID);
    const tags = await Tag.getTagsPost(post);
    await Comment.notAuthor(user, id);
    await Helper.reject(user, tags, commentID);
    await BlockedComment.delete(id);
    return await Comment.delete(commentID);
  }

  @Router.delete("/posts/:_id/approve")
  async approvePost(session: WebSessionDoc, _id: ObjectId) {
    // Let a verified user approve a reported edit
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const tags = await Tag.getTagsPost(id);
    await Post.notAuthor(user, id);
    await Helper.approve(user, tags, id);
    return await BlockedPost.delete(id);
  }

  @Router.delete("/posts/:_id/reject")
  async rejectPost(session: WebSessionDoc, _id: ObjectId) {
    // Let a verified user reject and delete a reported edit
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const tags = await Tag.getTagsPost(id);
    await Post.notAuthor(user, id);
    await Helper.reject(user, tags, id);
    await BlockedPost.delete(id);
    return await Post.delete(id);
  }

  @Router.get("/tags/verify")
  async getVerifiedTags(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Verified.getVerifiedTags(user);
  }

  @Router.post("/posts/:_id/tags/:tag")
  async addTag(session: WebSessionDoc, tag: string, _id: ObjectId) {
    // Let an user add tag to given post _id if user is author of post
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    console.log("add tag");
    await Post.isAuthor(user, id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    await Comment.noComments(id);
    const tags = await Tag.getTagsPost(id);
    if (await Editable.editable(tags)) await Editable.noEdits(id);
    const msg = await Tag.addTag(tag, id);
    const count = (await Like.getLikeStatus(user, id)).total;
    await TagCount.update(user, [tag], count);
    const tagCounts = await TagCount.getCounts(user, [tag]);
    await Verified.updateVerify(user, [tag], tagCounts);
    return msg;
  }

  @Router.delete("/posts/:_id/tags/:tag")
  async deleteTag(session: WebSessionDoc, tag: string, _id: ObjectId) {
    // Let an user delete a tag to a given post _id if user is author of post
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    console.log("delete tag");
    await Post.isAuthor(user, id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const msg = await Tag.deleteTag(tag, id);
    const count = (await Like.getLikeStatus(user, id)).total;
    await TagCount.update(user, [tag], -count);
    const tagCounts = await TagCount.getCounts(user, [tag]);
    await Verified.updateVerify(user, [tag], tagCounts);
    return msg;
  }

  @Router.get("/tags/:_id")
  async getTags(session: WebSessionDoc, _id: ObjectId) {
    const id = new ObjectId(_id);
    const tags = await Tag.getTagsPost(id);
    return tags;
  }

  @Router.post("/comments/:_id")
  async createComment(session: WebSessionDoc, _id: ObjectId, content: string) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    await Timeout.freeUser(user);
    await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    return await Comment.create(id, user, content);
  }

  @Router.patch("/comments/:_id")
  async updateComment(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    console.log("comment update");
    await Comment.isAuthor(user, id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    return await Comment.update(id, update);
  }

  @Router.delete("/comments/:_id")
  async deleteComment(session: WebSessionDoc, _id: ObjectId) {
    // Let an user delete their own comment
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    console.log("comment delete");
    await Comment.isAuthor(user, id);
    const post = await Comment.getPost(id);
    const msg = await Comment.delete(id);
    await Report.deleteObj(id);
    const tags = await Tag.getTagsPost(post);
    const count = (await Like.getLikeStatus(user, id)).total;
    await TagCount.update(user, tags, -count);
    return msg;
  }

  @Router.get("/comments/:_id")
  async getComments(session: WebSessionDoc, _id: ObjectId, author?: string) {
    let comments;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      comments = await Comment.getByAuthor(id);
      return comments;
    } else {
      const id = new ObjectId(_id);
      await Post.isPost(id);
      comments = await Comment.getByPost(id);
    }
    return Responses.comments(comments);
  }

  @Router.post("/posts/:_id/like")
  async likePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const author = await Post.getAuthor(id);
    const msg = await Like.like(user, id);
    await Helper.like(user, id, author);
    return msg;
  }

  @Router.delete("/posts/:_id/like")
  async unlikePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const author = await Post.getAuthor(id);
    const msg = await Like.unlike(user, id);
    await Helper.unlike(user, id, author);
    return msg;
  }

  @Router.post("/comments/:_id/like")
  async likeComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const author = await Comment.getAuthor(id);
    const postID = await Comment.getPost(id);
    const msg = await Like.like(user, id);
    await Helper.like(user, postID, author);
    return msg;
  }

  @Router.delete("/comments/:_id/like")
  async unlikeComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const author = await Comment.getAuthor(id);
    const postID = await Comment.getPost(id);
    const msg = await Like.unlike(user, id);
    await Helper.unlike(user, postID, author);
    return msg;
  }

  // @Router.post("/edits/:_id/like")
  // async likeEdit(session: WebSessionDoc, _id: ObjectId) {
  //   // Let user increment count for tags associated with objID (post/comment)
  //   const user = WebSession.getUser(session);
  //   const id = new ObjectId(_id);
  //   const author = await Editable.getAuthor(id);
  //   const postID = await Editable.getObjID(id);
  //   const msg = await Like.like(user, id);
  //   await Helper.like(user, postID, author);
  //   return msg;
  // }

  // @Router.delete("/edits/:_id/like")
  // async unlikeEdit(session: WebSessionDoc, _id: ObjectId) {
  //   // Let user decrement count for a specific object with given ID
  //   const user = WebSession.getUser(session);
  //   const id = new ObjectId(_id);
  //   const author = await Editable.getAuthor(id);
  //   const postID = await Editable.getObjID(id);
  //   const msg = await Like.unlike(user, id);
  //   await Helper.unlike(user, postID, author);
  //   return msg;
  // }

  @Router.get("/like/:_id")
  async getLikeNumStatus(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    return await Like.getLikeStatus(user, id);
  }

  @Router.get("/count")
  async getCount(session: WebSessionDoc) {
    // Get specific count an user has for all tags
    const user = WebSession.getUser(session);
    return await TagCount.getAllCounts(user);
  }

  @Router.get("/posts/block")
  async getAllBlockedPosts() {
    return await BlockedPost.getAllBlocked();
  }

  @Router.get("/edits/block")
  async getAllBlockedEdits() {
    return await BlockedEdit.getAllBlocked();
  }

  @Router.get("/blocks/posts/:tag")
  async getBlockedPosts(tag: string) {
    const posts = await BlockedPost.getBlockedInCategory(tag);
    return posts;
  }

  @Router.get("/blocks/edits/:tag")
  async getBlockedEdits(tag: string) {
    const posts = await BlockedEdit.getBlockedInCategory(tag);
    return posts;
  }

  @Router.get("/blocks/comments/:tag")
  async getBlockedComments(tag: string) {
    const posts = await BlockedComment.getBlockedInCategory(tag);
    return posts;
  }

  @Router.get("/timeout")
  async getAllBlockedUsers() {
    await Timeout.freeUsers();
    const users = await Timeout.getAllBlockedUsers();
    return users;
  }

  @Router.get("/timeout/:_id")
  async getExpireDate(_id: ObjectId) {
    const id = new ObjectId(_id);
    return await Timeout.getExpireDate(id);
  }
}

class Helper {
  static async report(user: ObjectId, authorID: ObjectId, objID: ObjectId) {
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const msg = await Report.create(user, objID, authorID);
    const count = await Report.getTotalReports(authorID);
    await Timeout.blockUpdate(authorID, count, 60);
    return msg;
  }

  static async deleteReport(user: ObjectId, authorID: ObjectId, objID: ObjectId) {
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    await Report.reportExists(user, objID);
    await Report.isReporter(user, objID);
    return await Report.delete(user, objID);
  }

  static async approve(user: ObjectId, tags: string[], _id: ObjectId) {
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    await Verified.isVerified(user, tags);
    await Report.deleteObj(_id);
  }

  static async reject(user: ObjectId, tags: string[], _id: ObjectId) {
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    await Verified.isVerified(user, tags);
    await Report.deleteObj(_id);
  }

  static async like(user: ObjectId, objID: ObjectId, author: ObjectId) {
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const tags = await Tag.getTagsPost(objID);
    await TagCount.update(author, tags, 1);
    const tagCounts = await TagCount.getCounts(author, tags);
    await Verified.updateVerify(author, tags, tagCounts);
  }

  static async unlike(user: ObjectId, objID: ObjectId, author: ObjectId) {
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    const tags = await Tag.getTagsPost(objID);
    await TagCount.update(author, tags, -1);
    const tagCounts = await TagCount.getCounts(author, tags);
    await Verified.updateVerify(author, tags, tagCounts);
  }

  static async deletePost(session: WebSessionDoc, _id: ObjectId, author: boolean) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    if (author) {
      await Post.isAuthor(user, id);
    }
    const result = await Timeout.freeUser(user);
    if (result.state) await Report.deleteAll(user);
    await Timeout.notBlocked(user);
    return Post.delete(id);
  }
}
export default getExpressRouter(new Routes());
