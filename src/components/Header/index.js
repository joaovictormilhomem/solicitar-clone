import './Header.css';

function Header({version}) {
  return (
    <header>
      <div id="version" className="text-base">{version}</div>
    </header>
  );
}

export default Header;