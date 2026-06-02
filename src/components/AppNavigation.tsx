import { NavLink } from 'react-router-dom';

export function AppNavigation() {
  return (
    <header className="app-header">
      <nav className="app-navigation" aria-label="Main navigation">
        <NavLink to="/editor">Editor</NavLink>
        <NavLink to="/editor-library">Editor Library</NavLink>
        <NavLink to="/demo">Demo</NavLink>
        <NavLink to="/play/example-task">Play example task</NavLink>
      </nav>
    </header>
  );
}
