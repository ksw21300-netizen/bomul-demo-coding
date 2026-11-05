import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthMenu from './AuthMenu.jsx';
import CartLink from './CartLink.jsx';

const API_BASE = 'http://localhost:4000';

function storedToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function BoardNavLink() {
  const [show, setShow] = useState(() => Boolean(storedToken()));

  useEffect(() => {
    const token = storedToken();
    if (!token) {
      setShow(false);
      return undefined;
    }
    let ignore = false;
    fetch(`${API_BASE}/api/me`, { headers: { authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!ignore) setShow(response.ok);
      })
      .catch(() => {
        if (!ignore) setShow(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (!show) return null;
  return <NavLink to="/board">게시판</NavLink>;
}

function SiteNav({ onToggleTheme }) {
  return (
    <header className="nav">
      <div className="wrap">
        <Link className="brand" to="/">
          <span className="seal">寶</span>보물 여행
        </Link>
        <nav>
          <NavLink to="/" end>
            홈
          </NavLink>
          <NavLink to="/courses">전체 코스</NavLink>
          <NavLink to="/apply">신청·문의</NavLink>
          <BoardNavLink />
        </nav>
        <div className="nav-tools">
          <button className="toggle" type="button" onClick={onToggleTheme}>
            ◑ 테마
          </button>
          <AuthMenu />
          <CartLink />
        </div>
      </div>
    </header>
  );
}

export default SiteNav;
