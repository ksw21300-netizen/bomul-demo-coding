import mongoose from 'mongoose';
import BoardPost from '../models/BoardPost.js';

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function displayName(user) {
  return user.nickname || user.name || user.user_id;
}

function isOwner(doc, user) {
  return String(doc.author) === String(user._id);
}

async function findPost(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, '글을 찾을 수 없습니다.');
  const post = await BoardPost.findById(id);
  if (!post) throw httpError(404, '글을 찾을 수 없습니다.');
  return post;
}

export async function listPosts(req, res) {
  const posts = await BoardPost.find().sort({ updatedAt: -1 });
  res.json(posts);
}

export async function createPost(req, res) {
  const title = text(req.body.title);
  const body = text(req.body.body);
  if (!title || !body) throw httpError(400, '제목과 질문 내용을 입력해 주세요.');

  const post = await BoardPost.create({
    title,
    body,
    author: req.user._id,
    author_name: displayName(req.user),
    author_type: req.user.user_type,
  });
  res.status(201).json(post);
}

export async function createReply(req, res) {
  const body = text(req.body.body);
  if (!body) throw httpError(400, '답변 내용을 입력해 주세요.');

  const post = await findPost(req.params.id);
  post.replies.push({
    body,
    author: req.user._id,
    author_name: displayName(req.user),
    author_type: req.user.user_type,
  });
  await post.save();
  res.status(201).json(post);
}

export async function deletePost(req, res) {
  const post = await findPost(req.params.id);
  if (!isOwner(post, req.user) && req.user.user_type !== 'admin') {
    throw httpError(403, '본인 글만 지울 수 있습니다.');
  }
  await post.deleteOne();
  res.json({ message: '글을 지웠습니다.' });
}

export async function deleteReply(req, res) {
  const post = await findPost(req.params.id);
  const reply = post.replies.id(req.params.replyId);
  if (!reply) throw httpError(404, '답변을 찾을 수 없습니다.');
  if (req.user.user_type !== 'admin') {
    throw httpError(403, '관리자만 댓글을 지울 수 있습니다.');
  }
  reply.deleteOne();
  await post.save();
  res.json(post);
}
