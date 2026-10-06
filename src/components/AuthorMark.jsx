import "./AuthorMark.css";

export default function AuthorMark() {
  return (
    <footer className="author-mark" aria-label="Автор проекта">
      <a
        href="https://github.com/wakukiku"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="wakukiku"
      >
        <span className="author-mark-line" aria-hidden="true" />
        <span className="author-mark-name">wakukiku</span>
        <span className="author-mark-line" aria-hidden="true" />
      </a>
    </footer>
  );
}
