# Prompts.md — kanban-board

This file documents the AI prompts I used during development as a pair-programmer.

---

## 1. Understanding the shift from vanilla JS to React

Coming from four sprints of vanilla JS, I wasn't sure why React was better or what "state-driven" actually meant in practice.

**My prompt:**
> "what is the difference between imperative and declarative programming in javascript, and how does react's state model replace direct dom manipulation"

**What I learned:**
In vanilla JS I was telling the browser *how* to update the DOM step by step — things like `innerHTML +=` or `appendChild`. React flips this — I describe what the UI should look like given the current data, and React figures out the DOM updates itself. The rule I internalized: never touch the DOM directly. Call `setTasks(...)` and the UI reacts automatically. I restructured my whole mental model around this before writing a single line.

---

## 2. Setting up useState for an array of task objects

I needed to store multiple tasks, each with an id, text, column, and priority. Wasn't sure whether to use separate state variables or one array.

**My prompt:**
> "how do i use usestate to manage an array of objects in react, and why cant i just use array.push to add items"

**What I learned:**
React tracks state changes by reference — mutating the array in place with `.push()` doesn't trigger a re-render because the reference stays the same. I must always return a new array. For adding: `[...prev, newItem]`. For deleting: `prev.filter(t => t.id !== id)`. For updating: `prev.map(t => t.id === id ? { ...t, text } : t)`. I wrote all three functions in App.jsx myself using these patterns.

---

## 3. Understanding component architecture and prop drilling

I had four components planned but wasn't sure what data should live where and how to connect them without making a mess.

**My prompt:**
> "in react where should state live when multiple components need to read or update the same data, explain lifting state up with a simple example"

**What I learned:**
State should live in the closest common ancestor of all components that need it. Since all three columns and the add form all need the tasks array, it lives in App.jsx. Everything below just receives what it needs via props. I drew out the tree on paper first — App owns state, passes tasks down to Column, Column passes individual tasks down to TaskCard, and each card gets the delete/move functions passed down as props too.

---

## 4. Passing functions as props (lifting state up)

I understood passing data down as props, but wasn't clear on how a child component like TaskCard triggers a state change in App.jsx.

**My prompt:**
> "how does a child component update parent state in react, how do i pass a function as a prop and call it from the child"

**What I learned:**
The parent defines the state-updating function and passes it down as a prop. The child never imports or touches state directly — it just calls the function it was given. In my project, `deleteTask` and `moveTask` are defined in App.jsx, passed through Column as props, and called inside TaskCard with `onClick={() => onDelete(task.id)}`. The child only needs to know what to call, not how state works.

---

## 5. Building the move task logic across columns

I had three columns represented as strings — 'todo', 'inprogress', 'done' — and needed the ← → buttons to shift a task between them without hardcoding each case.

**My prompt:**
> "how do i move an item between named states in react using an ordered array as a lookup instead of hardcoded if-else"

**What I learned:**
I stored the column order as `['todo', 'inprogress', 'done']` and used `indexOf` to find the current position. Adding `direction` (+1 or -1) gives the next index. If the result is out of bounds, I return the task unchanged. This made the logic clean and reusable — one function handles both left and right movement. I wrote this myself after understanding the index pattern.

---

## 6. Implementing inline editing with a toggle state

I needed clicking a task to turn it into an editable input, then clicking away or pressing Enter to save.

**My prompt:**
> "how do i build an inline edit toggle in react where clicking text switches it to an input field and saving on blur or enter key"

**What I learned:**
Each TaskCard has its own local `editing` boolean state and a separate `editText` state for the current input value. I conditionally render either a `<p>` or a `<textarea>` based on `editing`. The `onBlur` event fires when the user clicks away, which I use to call the save function. I handled the Escape key to cancel and restore the original text. This was my first time having component-level state alongside the global app state.

---

## 7. Conditional CSS classes based on priority data

I needed High tasks to have a red border, Medium yellow, and Low green — driven by the task data, not manually applied.

**My prompt:**
> "how do i conditionally apply css classes in react based on a value in a state object"

**What I learned:**
Template literals inside `className` make this clean: `className={\`task-card priority-${task.priority}\`}`. This produces `priority-high`, `priority-medium`, or `priority-low` based on whatever the priority field holds. I then defined those three classes in CSS with the appropriate `border-left` colors. No if-else needed in the JSX — the data drives the class, the class drives the style.

---

## 8. Persisting React state to localStorage

I needed the board to survive a hard refresh. Wasn't sure how to connect React state to the browser's localStorage.

**My prompt:**
> "how do i sync react usestate with localstorage so the state loads from storage on first render and saves whenever it changes"

**What I learned:**
Two parts: reading and writing. For reading, I pass a function to `useState` (not a value) — `useState(loadTasks)` — so it only runs once on mount and pulls from `localStorage.getItem`. For writing, I use `useEffect` with `tasks` in the dependency array — this runs after every render where tasks changed, saving the updated array. I wrapped the read in a try-catch in case the stored data is corrupted.

---

## 9. Understanding how dnd-kit works

Drag-and-drop was the most complex part of this sprint. I needed to understand the library's architecture before touching code.

**My prompt:**
> "explain how dnd-kit works in react, what is the role of DndContext, useDroppable, and useSortable and how do they connect"

**What I learned:**
`DndContext` wraps the whole board and is the event system — it fires `onDragStart` and `onDragEnd`. `useDroppable` marks a column as a valid drop target and gives a `setNodeRef` to attach to the column's DOM node. `useSortable` does both — it makes a card draggable and also acts as a drop target for reordering. `onDragEnd` receives `active` (what was dragged) and `over` (where it landed), and I update state from there. I understood the three-layer model before writing any drag code.

---

## 10. Handling drag end — moving between columns vs reordering

The trickiest part was figuring out in `onDragEnd` whether the card was dropped on a column or on another card, and handling each case differently.

**My prompt:**
> "in dnd-kit how do i detect in onDragEnd whether the dragged item was dropped on a column droppable or on another sortable card"

**What I learned:**
The `over.id` in `onDragEnd` will be either a column id (like 'todo') or a task id (like 'task-123'). I check which one it is by seeing if `over.id` exists in my columns array. If it's a column, I update the task's column field. If it's a task id, I use `arrayMove` from dnd-kit to reorder within the same column. I wrote the full `handleDragEnd` function myself using this branching logic.

---

## 11. Implementing real-time search filtering

I needed a search input that filters visible tasks without deleting them from state.

**My prompt:**
> "how do i filter a react state array in real time based on a search input without modifying the original state"

**What I learned:**
The key insight is to never filter the actual state — only filter what gets passed to the columns. I keep a separate `search` state for the input value. Before rendering, I compute a `filtered` array: if `search` is empty return all tasks, otherwise return tasks where the text includes the search string (case-insensitive with `.toLowerCase()`). I pass `filtered` to the columns instead of `tasks`. The real data is always untouched — the filter is purely a display concern.

---

## 12. Deploying a Vite React app to Vercel via GitHub

First time deploying a React project. Needed to confirm there was no extra config needed compared to a vanilla HTML project.

**My prompt:**
> "do i need any special vercel configuration to deploy a vite react app or does it auto detect everything"

**What I learned:**
Vercel fully auto-detects Vite projects. It sets `vite build` as the build command and `dist` as the output directory without any manual config. I just pushed to GitHub, imported the repo on vercel.com, and clicked Deploy. No `vercel.json` needed. The only thing I had to be careful about was making sure `node_modules` was in `.gitignore` before the first commit, which it was.

---
