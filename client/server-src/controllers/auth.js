import User from '../models/User.js';
import { readUser, signToken } from '../middleware/auth.js';

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function present(user) {
  const data = user.toObject();
  delete data.password;
  delete data.password_confirm;
  return data;
}

export async function login(req, res) {
  const user_id = typeof req.body.user_id === 'string' ? req.body.user_id.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!user_id || !password) throw httpError(400, '아이디와 비밀번호를 입력해 주세요.');

  const user = await User.findOne({ user_id }).select('+password');
  const matched = user ? await user.comparePassword(password) : false;
  if (!matched) throw httpError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');

  res.json({ message: '로그인했습니다.', token: signToken(user), user: present(user) });
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function digits(value) {
  return text(value).replace(/\D/g, '');
}

function maskUserId(userId) {
  const visible = Math.ceil(userId.length / 2);
  return userId.slice(0, visible) + '*'.repeat(userId.length - visible);
}

export async function findUserId(req, res) {
  const name = text(req.body.name);
  const email = text(req.body.email).toLowerCase();
  if (!name || !email) throw httpError(400, '이름과 이메일을 입력해 주세요.');

  const user = await User.findOne({ name, email, provider: { $ne: 'naver' } });
  if (!user) throw httpError(404, '입력한 정보와 일치하는 회원이 없습니다.');

  res.json({ message: '아이디를 찾았습니다.', user_id: maskUserId(user.user_id) });
}

export async function resetPassword(req, res) {
  const user_id = text(req.body.user_id);
  const name = text(req.body.name);
  const email = text(req.body.email).toLowerCase();
  const phone = digits(req.body.phone);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const password_confirm = typeof req.body.password_confirm === 'string' ? req.body.password_confirm : '';
  if (!user_id || !name || !email || !phone) {
    throw httpError(400, '아이디, 이름, 휴대폰번호, 이메일을 모두 입력해 주세요.');
  }
  if (!password) throw httpError(400, '새 비밀번호를 입력해 주세요.');
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw httpError(400, '비밀번호는 8자 이상이고 영문과 숫자를 함께 써야 합니다.');
  }

  const user = await User.findOne({ user_id, name, email, provider: { $ne: 'naver' } });
  if (!user || digits(user.phone) !== phone) throw httpError(404, '입력한 정보와 일치하는 회원이 없습니다.');

  user.password = password;
  user.password_confirm = password_confirm;
  await user.save();
  res.json({ message: '비밀번호를 바꿨습니다. 새 비밀번호로 로그인해 주세요.' });
}

export function loginMethodNotAllowed(req, res) {
  res.set('Allow', 'POST');
  res.status(405).json({
    message: '로그인은 로그인 화면(http://localhost:5173/login)에서 해 주세요. 이 주소는 POST 요청만 받습니다.',
  });
}

export async function getMe(req, res) {
  const user = await readUser(req);
  res.json(present(user));
}
