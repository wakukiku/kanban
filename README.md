# Kanban Press

<p align="center">
  <a href="#русский">RU</a>
  &nbsp;·&nbsp;
  <a href="#english">EN</a>
</p>

<p align="center">
  Минималистичная Kanban-доска для организации задач прямо в браузере.
</p>

<p align="center">
  <a href="https://kanban-cyan-six.vercel.app/?lang=ru"><strong>Открыть демо →</strong></a>
</p>

## Превью

<table>
  <tr>
    <td width="50%">
      <img src="./docs/desktop_white_ru.png" alt="Kanban Press — Light RU">
    </td>
    <td width="50%">
      <img src="./docs/desktop_dark_eng.png" alt="Kanban Press — Dark EN">
    </td>
  </tr>
  <tr>
    <td align="center"><sub>Светлая тема · RU</sub></td>
    <td align="center"><sub>Dark theme · EN</sub></td>
  </tr>
</table>

---

## Русский

Kanban Press — минималистичная Kanban-доска для организации задач прямо в браузере.

Карточки и колонки можно создавать, редактировать и перемещать drag & drop. Интерфейс поддерживает светлую и тёмную темы, русский и английский языки, поиск, метки, дедлайны и локальное сохранение данных.

### Возможности

- создание, редактирование и удаление карточек;
- создание, переименование и удаление колонок;
- drag & drop карточек между колонками;
- изменение порядка колонок;
- поиск по карточкам;
- фильтрация по меткам;
- метки задач;
- дедлайны;
- светлая и тёмная темы;
- русский и английский интерфейс;
- сохранение доски в `localStorage`;
- импорт и экспорт доски в JSON;
- адаптивный интерфейс;
- постоянная авторская метка `wakukiku`.

### Стек

- React
- Vite
- JavaScript
- CSS
- dnd-kit
- LocalStorage

### Языки

Язык можно переключить непосредственно в интерфейсе.

Доступны отдельные ссылки:

- [Русская версия](https://kanban-cyan-six.vercel.app/?lang=ru)
- [English version](https://kanban-cyan-six.vercel.app/?lang=en)

Выбранный язык сохраняется в браузере.

### Хранение данных

Kanban Press работает по принципу local-first.

Доска сохраняется локально в браузере и не требует аккаунта или подключения к серверу.

Для переноса или резервного копирования доску можно экспортировать в JSON, а затем импортировать обратно.

### Запуск локально

```bash
git clone https://github.com/wakukiku/kanban.git
cd kanban
npm install
npm run dev
```

Production-сборка:

```bash
npm run build
```

### Идея

Kanban Press — простая рабочая доска без лишних экранов, аккаунтов и перегруженной навигации.

Основной фокус — быстро записать задачу, распределить её по этапам и двигать работу вперёд.

### Демо

[Открыть русскую версию →](https://kanban-cyan-six.vercel.app/?lang=ru)

---

## English

Kanban Press is a minimalist Kanban board for organizing tasks directly in the browser.

Cards and columns can be created, edited and rearranged with drag & drop. The interface supports light and dark themes, English and Russian languages, search, labels, deadlines and local data storage.

### Features

- create, edit and delete cards;
- create, rename and delete columns;
- drag & drop cards between columns;
- reorder columns;
- search cards;
- filter by labels;
- task labels;
- deadlines;
- light and dark themes;
- English and Russian interface;
- board persistence with `localStorage`;
- JSON import and export;
- responsive interface;
- persistent `wakukiku` author mark.

### Stack

- React
- Vite
- JavaScript
- CSS
- dnd-kit
- LocalStorage

### Languages

The language can be changed directly in the interface.

Dedicated links are also available:

- [English version](https://kanban-cyan-six.vercel.app/?lang=en)
- [Русская версия](https://kanban-cyan-six.vercel.app/?lang=ru)

The selected language is saved in the browser.

### Local-first storage

Kanban Press follows a local-first approach.

The board is stored locally in the browser and does not require an account or backend connection.

Boards can also be exported as JSON for backup or transfer and imported later.

### Local development

```bash
git clone https://github.com/wakukiku/kanban.git
cd kanban
npm install
npm run dev
```

Production build:

```bash
npm run build
```

### Concept

Kanban Press is a focused working board without unnecessary screens, accounts or overloaded navigation.

The goal is simple: capture a task, place it in the right stage and keep the work moving.

### Demo

[Open English version →](https://kanban-cyan-six.vercel.app/?lang=en)

---

<p align="center">
  <a href="https://github.com/wakukiku">wakukiku</a>
</p>
