import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

const initialForm = {
  user_id: '',
  password: '',
  password_confirm: '',
  name: '',
  nickname: '',
  phone: '',
  email: '',
  terms: false,
  promo: false,
};

function isStrongPassword(value) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    if (!policy) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') setPolicy(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [policy]);

  function update(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.terms) {
      setError('이용약관 및 개인정보보호정책에 동의해 주세요.');
      return;
    }
    if (!isStrongPassword(form.password)) {
      setError('비밀번호는 8자 이상이고 영문과 숫자를 함께 써야 합니다.');
      return;
    }
    if (form.password !== form.password_confirm) {
      setError('비밀번호 확인이 비밀번호와 일치하지 않습니다.');
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          user_id: form.user_id,
          password: form.password,
          password_confirm: form.password_confirm,
          name: form.name,
          nickname: form.nickname,
          phone: form.phone,
          email: form.email,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || '회원가입에 실패했습니다.');
        return;
      }
      setDone(true);
    } catch {
      setError('서버에 연결하지 못했습니다. 서버가 실행 중인지 확인해 주세요.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <section className="signup-done">
        <h2>가입되었습니다</h2>
        <p>{form.user_id} 계정으로 회원가입이 완료되었습니다.</p>
        <Link className="submit-button home-signup" to="/">
          메인으로
        </Link>
      </section>
    );
  }

  return (
    <form className="signup" onSubmit={onSubmit}>
      <div className="form-card">
        <label htmlFor="user_id">
          아이디 <span className="required">*</span>
        </label>
        <p className="field-hint">영문자, 숫자, _ 만 입력 가능. 최소 3자 이상 입력하세요.</p>
        <input
          id="user_id"
          name="user_id"
          value={form.user_id}
          onChange={update}
          autoComplete="username"
          minLength={3}
          pattern="[A-Za-z0-9_]+"
          title="영문자, 숫자, _ 만 사용할 수 있습니다."
          required
        />

        <div className="password-row">
          <div>
            <label htmlFor="password">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              autoComplete="new-password"
              placeholder="8자 이상, 영문+숫자"
              minLength={8}
              title="8자 이상이고 영문과 숫자를 함께 써야 합니다."
              required
            />
          </div>
          <div>
            <label htmlFor="password_confirm">
              비밀번호 확인 <span className="required">*</span>
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              value={form.password_confirm}
              onChange={update}
              autoComplete="new-password"
              placeholder="비밀번호 확인"
              required
            />
          </div>
        </div>
        <p className="field-hint">8자 이상, 영문과 숫자를 함께 입력하세요.</p>

        <label htmlFor="name">
          이름 <span className="required">*</span>
        </label>
        <input id="name" name="name" value={form.name} onChange={update} autoComplete="name" placeholder="실명을 입력하세요" required />

        <label htmlFor="nickname">
          닉네임 <span className="required">*</span>
        </label>
        <input id="nickname" name="nickname" value={form.nickname} onChange={update} placeholder="닉네임을 입력하세요" required />

        <label htmlFor="phone">
          휴대폰번호 <span className="required">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={update}
          autoComplete="tel"
          placeholder="010-0000-0000"
          required
        />

        <label htmlFor="email">
          E-mail <span className="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          autoComplete="email"
          placeholder="example@email.com"
          required
        />
      </div>

      <label className="check-card">
        <input type="checkbox" name="terms" checked={form.terms} onChange={update} required />
        <span>
          <button className="policy-link" type="button" onClick={() => setPolicy('terms')}>
            이용약관
          </button>{' '}
          및{' '}
          <button className="policy-link" type="button" onClick={() => setPolicy('privacy')}>
            개인정보보호정책
          </button>{' '}
          에 모두 동의합니다. <span className="required">*</span>
        </span>
      </label>

      <label className="check-card">
        <input type="checkbox" name="promo" checked={form.promo} onChange={update} />
        <span>프로모션 메일 수신에 동의합니다. 할인 이벤트, 새로운 기능 추가, 강의 업데이트 시 알림을 보내드립니다.</span>
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="submit-button" type="submit" disabled={pending}>
        {pending ? '가입 중' : '회원가입'}
      </button>

      {policy ? (
        <div className="policy-modal" role="presentation" onClick={() => setPolicy(null)}>
          <div
            className="policy-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policyTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="policy-bar">
              <h2 id="policyTitle">{policy === 'terms' ? '이용약관' : '개인정보보호정책'}</h2>
              <button type="button" onClick={() => setPolicy(null)}>
                닫기
              </button>
            </div>
            <iframe title={policy === 'terms' ? '이용약관' : '개인정보보호정책'} src={policy === 'terms' ? '/terms.html' : '/privacy.html'} />
          </div>
        </div>
      ) : null}
    </form>
  );
}

export default SignupPage;
