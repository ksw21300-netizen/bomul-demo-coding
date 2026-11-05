import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, '답변 내용을 입력해 주세요.'],
      trim: true,
      maxlength: [2000, '답변은 2000자까지 쓸 수 있습니다.'],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author_name: { type: String, required: true, trim: true },
    author_type: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true },
);

const boardPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '제목을 입력해 주세요.'],
      trim: true,
      maxlength: [80, '제목은 80자까지 쓸 수 있습니다.'],
    },
    body: {
      type: String,
      required: [true, '질문 내용을 입력해 주세요.'],
      trim: true,
      maxlength: [4000, '내용은 4000자까지 쓸 수 있습니다.'],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author_name: { type: String, required: true, trim: true },
    author_type: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('BoardPost', boardPostSchema);
