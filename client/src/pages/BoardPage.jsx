import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

function storedToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}`;
}

function authorLabel(item) {
  if (item.author_type === 'admin') return `${item.author_name} · 관리자`;
  return item.author_name;
}

function BoardPage() {
  const token = storedToken();
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState(token ? 'loading' : 'guest');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', body: '' });
  const [pending, setPending] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyPending, setReplyPending] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    let ignore = false;

    async function load() {
      try {
        const headers = { authorization: `Bearer ${token}` };
        const [meResponse, boardResponse] = await Promise.all([
          fetch(`${API_BASE}/api/me`, { headers }),
          fetch(`${API_BASE}/api/board`, { headers }),
        ]);
        if (ignore) return;
        if (!meResponse.ok || !boardResponse.ok) {
          setStatus('guest');
          return;
        }
        setMe(await meResponse.json());
        setPosts(await boardResponse.json());
        setStatus('ready');
      } catch {
        if (!ignore) setStatus('error');
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  const isAdmin = me?.user_type === 'admin';

  function canDeleteOwnPost(item) {
    if (!me) return false;
    return String(item.author) === String(me._id);
  }

  async function onCreate(event) {
    event.preventDefault();
    setError('');
    if (!form.title.trim() || !form.body.trim()) {
      setError('제목과 질문 내용을 입력해 주세요.');
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`${API_BASE}/api/board`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || '질문을 올리지 못했습니다.');
        return;
      }
      setPosts((current) => [data, ...current]);
      setForm({ title: '', body: '' });
    } catch {
      setError('서버에 연결하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  async function onReply(event, postId) {
    event.preventDefault();
    const body = (replyDrafts[postId] || '').trim();
    setError('');
    if (!body) {
      setError('답변 내용을 입력해 주세요.');
      return;
    }
    setReplyPending(postId);
    try {
      const response = await fetch(`${API_BASE}/api/board/${postId}/replies`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ body }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || '답변을 올리지 못했습니다.');
        return;
      }
      setPosts((current) => current.map((post) => (post._id === postId ? data : post)));
      setReplyDrafts((current) => ({ ...current, [postId]: '' }));
    } catch {
      setError('서버에 연결하지 못했습니다.');
    } finally {
      setReplyPending('');
    }
  }

  async function removePost(postId) {
    if (!window.confirm('이 질문을 지울까요?')) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/board/${postId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || '글을 지우지 못했습니다.');
        return;
      }
      setPosts((current) => current.filter((post) => post._id !== postId));
    } catch {
      setError('서버에 연결하지 못했습니다.');
    }
  }

  async function removeReply(postId, replyId) {
    if (!window.confirm('이 댓글을 악성 댓글로 보고 지울까요?')) return;
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/board/${postId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || '답변을 지우지 못했습니다.');
        return;
      }
      setPosts((current) => current.map((post) => (post._id === postId ? data : post)));
    } catch {
      setError('서버에 연결하지 못했습니다.');
    }
  }

  return (
    <section className="board-page">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-kicker">게시판</div>
          <h2>질문과 답변</h2>
          <p>여행 코스, 신청, 이용 방법을 회원끼리 묻고 답하는 공간입니다.</p>
        </div>

        {status === 'guest' ? (
          <p className="course-status">
            게시판은 로그인 후 볼 수 있습니다. <Link to="/login">로그인</Link>
          </p>
        ) : null}
        {status === 'loading' ? <p className="course-status">게시판을 불러오는 중</p> : null}
        {status === 'error' ? <p className="course-status">게시판을 불러오지 못했습니다.</p> : null}

        {status === 'ready' ? (
          <>
            <form className="board-compose" onSubmit={onCreate}>
              <h3>질문 올리기</h3>
              <label className="sr-only" htmlFor="board_title">제목</label>
              <input
                id="board_title"
                name="title"
                value={form.title}
                onChange={updateForm}
                maxLength={80}
                placeholder="제목"
                required
              />
              <label className="sr-only" htmlFor="board_body">질문 내용</label>
              <textarea
                id="board_body"
                name="body"
                value={form.body}
                onChange={updateForm}
                maxLength={4000}
                rows={5}
                placeholder="궁금한 점을 적어 주세요."
                required
              />
              <button className="btn btn-primary" type="submit" disabled={pending}>
                {pending ? '올리는 중' : '질문 올리기'}
              </button>
            </form>

            {error ? <p className="course-status" role="alert">{error}</p> : null}

            {posts.length === 0 ? (
              <p className="course-status">아직 질문이 없습니다. 첫 질문을 남겨 보세요.</p>
            ) : (
              <ul className="board-list">
                {posts.map((post) => (
                  <li key={post._id}>
                    <article className="board-post">
                      <header>
                        <h3>{post.title}</h3>
                        <p>
                          {authorLabel(post)} · {formatDate(post.createdAt)}
                          {post.replies.length ? ` · 답변 ${post.replies.length}` : ' · 답변 대기'}
                        </p>
                      </header>
                      <p className="board-body">{post.body}</p>
                      {isAdmin ? (
                        <button className="board-delete is-admin" type="button" onClick={() => removePost(post._id)}>
                          악성글 삭제
                        </button>
                      ) : canDeleteOwnPost(post) ? (
                        <button className="board-delete" type="button" onClick={() => removePost(post._id)}>
                          질문 지우기
                        </button>
                      ) : null}

                      {post.replies.length > 0 ? (
                        <ul className="board-replies">
                          {post.replies.map((reply) => (
                            <li key={reply._id} className={reply.author_type === 'admin' ? 'is-admin' : undefined}>
                              <p className="board-reply-meta">
                                {authorLabel(reply)} · {formatDate(reply.createdAt)}
                              </p>
                              <p className="board-body">{reply.body}</p>
                              {isAdmin ? (
                                <button
                                  className="board-delete is-admin"
                                  type="button"
                                  onClick={() => removeReply(post._id, reply._id)}
                                >
                                  악성댓글 삭제
                                </button>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <form className="board-reply-form" onSubmit={(event) => onReply(event, post._id)}>
                        <label className="sr-only" htmlFor={`reply-${post._id}`}>답변</label>
                        <textarea
                          id={`reply-${post._id}`}
                          value={replyDrafts[post._id] || ''}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({ ...current, [post._id]: event.target.value }))
                          }
                          maxLength={2000}
                          rows={3}
                          placeholder="답변을 남겨 주세요."
                          required
                        />
                        <button className="btn btn-ghost" type="submit" disabled={replyPending === post._id}>
                          {replyPending === post._id ? '올리는 중' : '답변 올리기'}
                        </button>
                      </form>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}

export default BoardPage;
