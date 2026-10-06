import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translate } from "./translations";

const LanguageContext = createContext(null);
const key = "kanban-press:language";

function readLanguage() {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "ru" || requested === "en") return requested;
  try {
    const saved = localStorage.getItem(key);
    if (saved === "ru" || saved === "en") return saved;
  } catch {
    /* При недоступном хранилище язык можно передать в URL. */
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readLanguage);
  const t = useCallback(
    (message, values) => translate(language, message, values),
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "ru" ? "Канбан Пресс" : "Kanban Press";
    document.querySelector('meta[name="description"]').content = t(
      "Kanban Press — a small, sharp workspace for things worth making.",
    );
    try {
      localStorage.setItem(key, language);
    } catch {
      /* Ссылки на языковые версии работают и без хранилища. */
    }
  }, [language, t]);

  useEffect(() => {
    const restore = () => setLanguage(readLanguage());
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  function switchLanguage(next) {
    if (next !== "en" && next !== "ru") return;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.pushState(null, "", url);
    setLanguage(next);
  }

  return (
    <LanguageContext.Provider value={{ language, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage requires LanguageProvider.");
  return value;
}
