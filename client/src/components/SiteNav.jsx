import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import AuthMenu from './AuthMenu.jsx';
import CartLink from './CartLink.jsx';

const API_BASE = 'http://localhost:4000';

function storedToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function BoardNavLink({ onClick }) {
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
  return (
    <NavLink to="/board" onClick={onClick}>
      게시판
    </NavLink>
  );
}

function SiteNav({ onToggleTheme }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="nav">
      <div className="wrap nav-bar">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="seal">寶</span>보물 여행
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
        <nav className="nav-links" aria-label="주요 메뉴">
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
      <nav
        className={`nav-drawer${menuOpen ? ' is-open' : ''}`}
        id="mobile-nav"
        aria-label="모바일 메뉴"
      >
        <NavLink to="/" end onClick={closeMenu}>
          홈
        </NavLink>
        <NavLink to="/courses" onClick={closeMenu}>
          전체 코스
        </NavLink>
        <NavLink to="/apply" onClick={closeMenu}>
          신청·문의
        </NavLink>
        <NavLink to="/cart" onClick={closeMenu}>
          장바구니
        </NavLink>
        <NavLink to="/order" onClick={closeMenu}>
          주문
        </NavLink>
        <NavLink to="/login" onClick={closeMenu}>
          로그인
        </NavLink>
        <NavLink to="/signup" onClick={closeMenu}>
          회원가입
        </NavLink>
      </nav>
    </header>
  );
}

export default SiteNav;
