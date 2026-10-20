/**
 * Shared container used by the storefront header and home hero so every row
 * lines up with the page sections that use `.container-page`.
 */
export function Container({ children, className = "" }) {
  return <div className={`container-page ${className}`}>{children}</div>;
}
