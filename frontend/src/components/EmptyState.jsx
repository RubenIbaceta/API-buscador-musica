import { Link } from 'react-router-dom';

export default function EmptyState({ title, children, action, to, onAction }) {
  return <div className="empty-state"><h2>{title}</h2><p>{children}</p>{action && (to ? <Link className="button" to={to}>{action}</Link> : <button type="button" className="button" onClick={onAction}>{action}</button>)}</div>;
}
