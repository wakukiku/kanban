import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitch() {
  const { language, switchLanguage } = useLanguage();
  return (
    <nav
      className="language-switch"
      aria-label={language === "ru" ? "Язык интерфейса" : "Interface language"}
    >
      {["ru", "en"].map((value) => {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", value);
        return (
          <a
            key={value}
            href={`${url.pathname}${url.search}${url.hash}`}
            hrefLang={value}
            lang={value}
            aria-label={value === "ru" ? "Русская версия" : "English version"}
            aria-current={language === value ? "page" : undefined}
            onClick={(event) => {
              if (
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                event.preventDefault();
                switchLanguage(value);
              }
            }}
          >
            {value.toUpperCase()}
          </a>
        );
      })}
    </nav>
  );
}
