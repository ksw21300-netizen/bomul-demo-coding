import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

const emptyIdForm = { name: '', email: '' };
const emptyPasswordForm = { user_id: '', name: '', phone: '', email: '', password: '', password_confirm: '' };

function isStrongPassword(value) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function FindAccountPage() {
  const [tab, setTab] = useState('id');
  const [idForm, setIdForm] = useState(emptyIdForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [pending, setPending] = useState(false);

  function switchTab(next) {
    setTab(next);
    setError('');
    setResult('');
  }

  function updateId(event) {
    const { name, value } = event.target;
    setIdForm((current) => ({ ...current, [name]: value }));
  }

  function updatePassword(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  async function send(path, body) {
    setError('');
    setResult('');
    setPending(true);
    try {
      const response = await fetch(`${API_BASE}/api/login/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || '요청을 처리하지 못했습니다.');
        return null;
      }
      return data;
    } catch {
      setError('서버에 연결하지 못했습니다. 서버가 실행 중인지 확인해 주세요.');
      return null;
    } finally {
      setPending(false);
    }
  }

  async function onFindId(event) {
    event.preventDefault();
    const data = await send('find-id', idForm);
    if (data) setResult(`회원님의 아이디는 ${data.user_id} 입니다.`);
  }

  async function onResetPassword(event) {
    event.preventDefault();
    if (!isStrongPassword(passwordForm.password)) {
      setResult('');
      setError('비밀번호는 8자 이상이고 영문과 숫자를 함께 써야 합니다.');
      return;
    }
    if (passwordForm.password !== passwordForm.password_confirm) {
      setResult('');
      setError('비밀번호 확인이 비밀번호와 일치하지 않습니다.');
      return;
    }
    const data = await send('reset-password', passwordForm);
    if (data) {
      setResult(data.message);
      setPasswordForm(emptyPasswordForm);
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>아이디·비밀번호 찾기</h1>

        <div className="find-tabs">
          <button type="button" aria-pressed={tab === 'id'} onClick={() => switchTab('id')}>
            아이디 찾기
          </button>
          <button type="button" aria-pressed={tab === 'password'} onClick={() => switchTab('password')}>
            비밀번호 재설정
          </button>
        </div>

        {tab === 'id' ? (
          <form onSubmit={onFindId}>
            <p className="find-guide">가입할 때 입력한 이름과 이메일을 입력하세요.</p>
            <label className="sr-only" htmlFor="find_name">이름</label>
            <input id="find_name" name="name" value={idForm.name} onChange={updateId} autoComplete="name" placeholder="이름" required />
            <label className="sr-only" htmlFor="find_email">이메일</label>
            <input
              id="find_email"
              name="email"
              type="email"
              value={idForm.email}
              onChange={updateId}
              autoComplete="email"
              placeholder="이메일"
              required
            />
            <button className="submit-button login-submit" type="submit" disabled={pending}>
              {pending ? '찾는 중' : '아이디 찾기'}
            </button>
          </form>
        ) : (
          <form onSubmit={onResetPassword}>
            <p className="find-guide">가입 정보를 확인한 뒤 새 비밀번호로 바꿉니다. 새 비밀번호는 8자 이상이고 영문과 숫자를 함께 써야 합니다.</p>
            <label className="sr-only" htmlFor="reset_user_id">아이디</label>
            <input
              id="reset_user_id"
              name="user_id"
              value={passwordForm.user_id}
              onChange={updatePassword}
              autoComplete="username"
              placeholder="아이디"
              required
            />
            <label className="sr-only" htmlFor="reset_name">이름</label>
            <input
              id="reset_name"
              name="name"
              value={passwordForm.name}
              onChange={updatePassword}
              autoComplete="name"
              placeholder="이름"
              required
            />
            <label className="sr-only" htmlFor="reset_phone">휴대폰번호</label>
            <input
              id="reset_phone"
              name="phone"
              type="tel"
              value={passwordForm.phone}
              onChange={updatePassword}
              autoComplete="tel"
              placeholder="휴대폰번호 (010-0000-0000)"
              required
            />
            <label className="sr-only" htmlFor="reset_email">이메일</label>
            <input
              id="reset_email"
              name="email"
              type="email"
              value={passwordForm.email}
              onChange={updatePassword}
              autoComplete="email"
              placeholder="이메일"
              required
            />
            <label className="sr-only" htmlFor="reset_password">새 비밀번호</label>
            <input
              id="reset_password"
              name="password"
              type="password"
              value={passwordForm.password}
              onChange={updatePassword}
              autoComplete="new-password"
              placeholder="새 비밀번호 (8자 이상, 영문+숫자)"
              minLength={8}
              title="8자 이상이고 영문과 숫자를 함께 써야 합니다."
              required
            />
            <label className="sr-only" htmlFor="reset_password_confirm">새 비밀번호 확인</label>
            <input
              id="reset_password_confirm"
              name="password_confirm"
              type="password"
              value={passwordForm.password_confirm}
              onChange={updatePassword}
              autoComplete="new-password"
              placeholder="새 비밀번호 확인"
              required
            />
            <button className="submit-button login-submit" type="submit" disabled={pending}>
              {pending ? '바꾸는 중' : '비밀번호 바꾸기'}
            </button>
          </form>
        )}

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {result ? (
          <div className="find-result" role="status">
            <p>{result}</p>
            <Link to="/login">로그인하러 가기</Link>
          </div>
        ) : null}

        <p className="login-switch">
          <Link to="/login">로그인으로 돌아가기</Link>
        </p>
      </div>
    </section>
  );
}

export default FindAccountPage;
