import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';
import RelatedTools from '../../components/RelatedTools';

const PRIORITIES = {
  High: { label: 'High', color: '#f87171', rank: 3, icon: '🔥' },
  Medium: { label: 'Medium', color: '#fbbf24', rank: 2, icon: '⚡' },
  Low: { label: 'Low', color: '#34d399', rank: 1, icon: '🧊' }
};

const FILTERS = {
  all: 'All Tasks',
  active: 'Active',
  completed: 'Completed',
  overdue: 'Overdue',
  today: 'Due Today'
};

export default function TaskList() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [notification, setNotification] = useState('');

  const [form, setForm] = useState({
    text: '',
    notes: '',
    priority: 'Medium',
    category: 'Work',
    dueDate: ''
  });

  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const listRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    try {
      const saved = JSON.parse(localStorage.getItem('shb_tasks_pro_v1') || '[]');
      if (Array.isArray(saved)) setTasks(saved);
    } catch {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const stats = useMemo(() => calculateStats(tasks), [tasks]);

  const visibleTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tasks
      .filter(task => {
        const matchesSearch = !keyword
          || task.text.toLowerCase().includes(keyword)
          || (task.notes || '').toLowerCase().includes(keyword)
          || (task.category || '').toLowerCase().includes(keyword);

        if (!matchesSearch) return false;

        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        if (filter === 'overdue') return isOverdue(task);
        if (filter === 'today') return isDueToday(task);

        return true;
      })
      .sort((a, b) => sortTasks(a, b, sortBy));
  }, [tasks, search, filter, sortBy]);

  const showToast = (message) => {
    setNotification(message);
  };

  const saveTasks = (nextTasks) => {
    setTasks(nextTasks);

    try {
      localStorage.setItem('shb_tasks_pro_v1', JSON.stringify(nextTasks));
    } catch {
      showToast('Could not save tasks. Browser storage may be full.');
    }
  };

  const addTask = (event) => {
    event.preventDefault();

    if (!form.text.trim()) {
      showToast('Please enter a task title.');
      return;
    }

    const newTask = {
      id: Date.now(),
      text: form.text.trim(),
      notes: form.notes.trim(),
      priority: form.priority,
      category: form.category.trim() || 'General',
      dueDate: form.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    saveTasks([newTask, ...tasks]);
    setForm({ text: '', notes: '', priority: 'Medium', category: form.category || 'Work', dueDate: '' });
    showToast('Task added.');
  };

  const addBulkTasks = () => {
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .slice(0, 100);

    if (lines.length === 0) {
      showToast('Paste at least one task.');
      return;
    }

    const now = Date.now();
    const newTasks = lines.map((line, index) => ({
      id: now + index,
      text: line,
      notes: '',
      priority: form.priority,
      category: form.category || 'General',
      dueDate: form.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    }));

    saveTasks([...newTasks, ...tasks]);
    setBulkText('');
    setShowBulk(false);
    showToast(`${newTasks.length} tasks added.`);
  };

  const toggleTask = (id) => {
    const nextTasks = tasks.map(task => {
      if (task.id !== id) return task;

      const completed = !task.completed;

      return {
        ...task,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      };
    });

    saveTasks(nextTasks);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(task => task.id !== id));
    showToast('Task removed.');
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditDraft({ ...task });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = () => {
    if (!editDraft.text?.trim()) {
      showToast('Task title cannot be empty.');
      return;
    }

    const nextTasks = tasks.map(task => {
      if (task.id !== editingId) return task;

      return {
        ...task,
        text: editDraft.text.trim(),
        notes: editDraft.notes || '',
        priority: editDraft.priority || 'Medium',
        category: editDraft.category || 'General',
        dueDate: editDraft.dueDate || ''
      };
    });

    saveTasks(nextTasks);
    cancelEdit();
    showToast('Task updated.');
  };

  const clearCompleted = () => {
    const nextTasks = tasks.filter(task => !task.completed);
    saveTasks(nextTasks);
    showToast('Completed tasks cleared.');
  };

  const clearAllTasks = () => {
    const confirmed = window.confirm('Clear all tasks? This cannot be undone unless you exported a backup.');
    if (!confirmed) return;

    saveTasks([]);
    showToast('All tasks cleared.');
  };

  const exportAsPng = async () => {
    if (!listRef.current) return;

    try {
      showToast('Generating PNG image...');
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(listRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0f172a',
        style: {
          padding: '20px'
        }
      });

      const link = document.createElement('a');
      link.download = `SHB_Task_List_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      showToast('PNG exported.');
    } catch {
      showToast('PNG export failed. Try fewer tasks.');
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `shb-task-backup-${Date.now()}.json`);
    showToast('JSON backup downloaded.');
  };

  const exportCsv = () => {
    const header = ['Task', 'Notes', 'Priority', 'Category', 'Due Date', 'Completed', 'Created At'];
    const rows = tasks.map(task => [
      task.text,
      task.notes || '',
      task.priority,
      task.category || '',
      task.dueDate || '',
      task.completed ? 'Yes' : 'No',
      task.createdAt || ''
    ]);

    const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

    downloadBlob(blob, `shb-tasks-${Date.now()}.csv`);
    showToast('CSV downloaded.');
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        showToast('Invalid backup file.');
        return;
      }

      const cleanTasks = imported
        .filter(task => task && task.text)
        .map((task, index) => ({
          id: task.id || Date.now() + index,
          text: String(task.text || '').trim(),
          notes: String(task.notes || ''),
          priority: PRIORITIES[task.priority] ? task.priority : 'Medium',
          category: String(task.category || 'Imported'),
          dueDate: task.dueDate || '',
          completed: Boolean(task.completed),
          createdAt: task.createdAt || new Date().toISOString(),
          completedAt: task.completedAt || null
        }));

      saveTasks([...cleanTasks, ...tasks]);
      showToast(`${cleanTasks.length} tasks imported.`);
    } catch {
      showToast('Could not import JSON backup.');
    }
  };

  if (!mounted) {
    return (
      <ToolboxLayout title="Task List" description="Loading task list.">
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8' }}>
          Loading private task workspace...
        </div>
      </ToolboxLayout>
    );
  }

  return (
    <ToolboxLayout
      title="Task List - Private To-Do List, Daily Planner and Priority Manager"
      description="Create a private browser-based task list with priorities, due dates, notes, categories, progress tracking, search, filters, PNG export, CSV download and JSON backup."
    >
      <div style={pageWrap}>
        {notification && (
          <div style={toast}>
            {notification}
          </div>
        )}

        <section style={hero}>
          <p style={eyebrow}>Free private productivity planner</p>
          <h1 style={heroTitle}>Task List & Daily Planner</h1>
          <p style={heroText}>
            Organize daily tasks with priorities, due dates, notes, categories, progress tracking and private browser storage.
            Export your task list as a PNG, CSV or JSON backup without creating an account.
          </p>
        </section>

        <section style={appGrid}>
          <main style={mainPanel}>
            <section style={statsGrid}>
              <StatCard label="Total Tasks" value={stats.total} />
              <StatCard label="Completed" value={stats.completed} tone="green" />
              <StatCard label="Active" value={stats.active} />
              <StatCard label="Overdue" value={stats.overdue} tone="red" />
              <StatCard label="Due Today" value={stats.today} tone="blue" />
            </section>

            <section style={progressCard}>
              <div style={progressHeader}>
                <div>
                  <h2 style={sectionTitle}>Completion Progress</h2>
                  <p style={sectionText}>{stats.completed} of {stats.total} tasks completed.</p>
                </div>
                <strong style={progressPercent}>{stats.progress}%</strong>
              </div>
              <div style={progressTrack}>
                <div style={{ ...progressFill, width: `${stats.progress}%` }} />
              </div>
            </section>

            <section style={formCard}>
              <h2 style={sectionTitle}>Add New Task</h2>

              <form onSubmit={addTask} style={taskForm}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Task title</span>
                  <input
                    value={form.text}
                    onChange={event => setForm({ ...form, text: event.target.value })}
                    placeholder="What needs to be done?"
                    style={inputStyle}
                  />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Notes</span>
                  <textarea
                    value={form.notes}
                    onChange={event => setForm({ ...form, notes: event.target.value })}
                    placeholder="Optional details, checklist, link or context..."
                    style={textareaStyle}
                  />
                </label>

                <div style={formGrid}>
                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Priority</span>
                    <select value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value })} style={inputStyle}>
                      <option value="High">🔥 High</option>
                      <option value="Medium">⚡ Medium</option>
                      <option value="Low">🧊 Low</option>
                    </select>
                  </label>

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Category</span>
                    <input
                      value={form.category}
                      onChange={event => setForm({ ...form, category: event.target.value })}
                      placeholder="Work, Personal, Study..."
                      style={inputStyle}
                    />
                  </label>

                  <label style={fieldWrap}>
                    <span style={fieldLabel}>Due date</span>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={event => setForm({ ...form, dueDate: event.target.value })}
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={actionRow}>
                  <button type="submit" style={primaryBtn}>Add Task</button>
                  <button type="button" onClick={() => setShowBulk(!showBulk)} style={secondaryBtn}>
                    {showBulk ? 'Hide Bulk Add' : 'Bulk Add'}
                  </button>
                </div>
              </form>

              {showBulk && (
                <div style={bulkBox}>
                  <h3 style={miniTitle}>Bulk Add Tasks</h3>
                  <textarea
                    value={bulkText}
                    onChange={event => setBulkText(event.target.value)}
                    placeholder="Paste one task per line&#10;Follow up invoice&#10;Send email&#10;Review report"
                    style={bulkTextarea}
                  />
                  <button onClick={addBulkTasks} style={primaryBtn}>Add Bulk Tasks</button>
                </div>
              )}
            </section>

            <section style={toolbarCard}>
              <div style={toolbarGrid}>
                <label style={fieldWrap}>
                  <span style={fieldLabel}>Search</span>
                  <input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search tasks, notes or category..."
                    style={inputStyle}
                  />
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Filter</span>
                  <select value={filter} onChange={event => setFilter(event.target.value)} style={inputStyle}>
                    {Object.entries(FILTERS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </label>

                <label style={fieldWrap}>
                  <span style={fieldLabel}>Sort</span>
                  <select value={sortBy} onChange={event => setSortBy(event.target.value)} style={inputStyle}>
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due Date</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="category">Category</option>
                  </select>
                </label>
              </div>
            </section>

            <section ref={listRef} style={listCard}>
              <div style={sectionHeader}>
                <div>
                  <h2 style={sectionTitle}>Current Task List</h2>
                  <p style={sectionText}>
                    Showing {visibleTasks.length} of {tasks.length} tasks.
                  </p>
                </div>
                <span style={datePill}>{new Date().toLocaleDateString()}</span>
              </div>

              {visibleTasks.length === 0 ? (
                <div style={emptyBox}>
                  <strong>No tasks found</strong>
                  <span>Add a task or adjust your search/filter.</span>
                </div>
              ) : (
                <div style={taskList}>
                  {visibleTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      editing={editingId === task.id}
                      editDraft={editDraft}
                      setEditDraft={setEditDraft}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onEdit={() => startEdit(task)}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                    />
                  ))}
                </div>
              )}
            </section>

            {tasks.length > 0 && (
              <section style={exportGrid}>
                <button onClick={exportAsPng} style={secondaryBtn}>Export PNG</button>
                <button onClick={exportCsv} style={secondaryBtn}>Download CSV</button>
                <button onClick={exportJson} style={secondaryBtn}>JSON Backup</button>
                <button onClick={() => importRef.current?.click()} style={secondaryBtn}>Import JSON</button>
                <button onClick={clearCompleted} style={dangerBtn}>Clear Completed</button>
                <button onClick={clearAllTasks} style={dangerBtn}>Clear All</button>
                <input ref={importRef} type="file" accept="application/json,.json" onChange={importJson} style={{ display: 'none' }} />
              </section>
            )}
          </main>

          <aside style={sidePanel}>
            <h2 style={sideTitle}>Priority Breakdown</h2>

            {Object.keys(PRIORITIES).map(priority => (
              <div key={priority} style={priorityRow}>
                <span style={{ color: PRIORITIES[priority].color }}>
                  {PRIORITIES[priority].icon} {priority}
                </span>
                <strong>{stats.priorityCounts[priority] || 0}</strong>
              </div>
            ))}

            <div style={tipBox}>
              <h3>Productivity tip</h3>
              <p>
                Keep high-priority tasks limited. If everything is urgent, nothing is truly prioritized.
              </p>
            </div>

            <div style={tipBox}>
              <h3>Private storage</h3>
              <p>
                Tasks are saved in your browser local storage. Use JSON backup if you want to move them to another device.
              </p>
            </div>
          </aside>
        </section>

        <section style={contentSection}>
          <h2>Private task list, to-do list and daily planner</h2>
          <p>
            This task list app is designed for people searching for a simple to-do list, private task manager, daily planner,
            priority planner, work checklist, study planner, personal task tracker or productivity dashboard. It helps you
            record tasks, assign priority, add due dates, write notes, organize categories and track completion progress.
          </p>

          <div style={seoGrid}>
            <div style={seoCard}>
              <h3>Online to-do list</h3>
              <p>
                Create a clean online to-do list for daily work, study, home tasks, errands, shopping lists, project actions
                and personal reminders.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Priority task manager</h3>
              <p>
                Mark tasks as High, Medium or Low priority so your most important actions are visible first. Priority sorting
                helps reduce overwhelm and supports better decision making.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Daily planner with due dates</h3>
              <p>
                Add due dates to identify today’s tasks, upcoming tasks and overdue tasks. This is useful for deadlines,
                follow-ups, assignments, appointments and business reminders.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Task notes and categories</h3>
              <p>
                Add notes for extra details and categories such as Work, Personal, Study, Finance or Shopping. Categories make
                large task lists easier to search and organize.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Export task list as PNG, CSV or JSON</h3>
              <p>
                Export your visible task list as a PNG image, download a CSV spreadsheet-style file, or create a JSON backup
                for later import.
              </p>
            </div>

            <div style={seoCard}>
              <h3>Private browser-based task app</h3>
              <p>
                Your tasks are stored locally in your browser. The app does not require login, cloud sync, account creation or
                server storage.
              </p>
            </div>
          </div>

          <h2>How to use this task list effectively</h2>
          <ul style={tipList}>
            <li><strong>Start with a brain dump:</strong> use bulk add to quickly capture every open task.</li>
            <li><strong>Choose priorities:</strong> mark only the most important items as High priority.</li>
            <li><strong>Add due dates:</strong> separate urgent deadlines from flexible tasks.</li>
            <li><strong>Use notes:</strong> include context, links, instructions or sub-steps.</li>
            <li><strong>Review completed tasks:</strong> clear completed tasks after you confirm your work is done.</li>
            <li><strong>Back up important lists:</strong> download JSON before clearing browser data.</li>
          </ul>

          <h2>Why a task list improves productivity</h2>
          <p>
            A written task list reduces mental load because your brain does not have to keep every unfinished action in memory.
            A clear list also helps you choose the next action faster, avoid forgotten deadlines, and measure progress throughout
            the day.
          </p>
        </section>

        <section style={faqSection}>
          <h2>Task List FAQ</h2>

          <div style={faqGrid}>
            <div style={faqItem}>
              <h3>Is this task list private?</h3>
              <p>Yes. Tasks are saved in your browser local storage and do not require an account.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I export my task list?</h3>
              <p>Yes. You can export as PNG, CSV or JSON backup.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I import tasks later?</h3>
              <p>Yes. Download a JSON backup and import it later using the Import JSON button.</p>
            </div>

            <div style={faqItem}>
              <h3>Can I add many tasks at once?</h3>
              <p>Yes. Use Bulk Add and paste one task per line.</p>
            </div>

            <div style={faqItem}>
              <h3>How do overdue tasks work?</h3>
              <p>A task becomes overdue when it has a due date before today and is not completed.</p>
            </div>

            <div style={faqItem}>
              <h3>What happens if I clear browser data?</h3>
              <p>Local tasks may be removed. Use JSON backup if your list is important.</p>
            </div>
          </div>
        </section>
      </div>
    </ToolboxLayout>
  );
}

function TaskItem({ task, editing, editDraft, setEditDraft, onToggle, onDelete, onEdit, onSaveEdit, onCancelEdit }) {
  const dueLabel = getDueLabel(task);
  const priorityMeta = PRIORITIES[task.priority] || PRIORITIES.Medium;

  if (editing) {
    return (
      <article style={taskItem}>
        <div style={{ flex: 1, display: 'grid', gap: '10px' }}>
          <input
            value={editDraft.text || ''}
            onChange={event => setEditDraft({ ...editDraft, text: event.target.value })}
            style={inputStyle}
          />
          <textarea
            value={editDraft.notes || ''}
            onChange={event => setEditDraft({ ...editDraft, notes: event.target.value })}
            style={textareaStyle}
          />
          <div style={editGrid}>
            <select value={editDraft.priority || 'Medium'} onChange={event => setEditDraft({ ...editDraft, priority: event.target.value })} style={inputStyle}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input value={editDraft.category || ''} onChange={event => setEditDraft({ ...editDraft, category: event.target.value })} style={inputStyle} />
            <input type="date" value={editDraft.dueDate || ''} onChange={event => setEditDraft({ ...editDraft, dueDate: event.target.value })} style={inputStyle} />
          </div>
          <div style={actionRow}>
            <button onClick={onSaveEdit} style={primaryBtn}>Save</button>
            <button onClick={onCancelEdit} style={secondaryBtn}>Cancel</button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article style={{ ...taskItem, opacity: task.completed ? 0.58 : 1 }}>
      <input type="checkbox" checked={task.completed} onChange={onToggle} style={checkStyle} />

      <div style={{ flex: 1 }}>
        <div style={{ ...taskTitle, textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.text}
        </div>

        {task.notes && (
          <p style={taskNotes}>{task.notes}</p>
        )}

        <div style={taskMeta}>
          <span style={{ color: priorityMeta.color }}>{priorityMeta.icon} {task.priority}</span>
          <span>{task.category || 'General'}</span>
          {task.dueDate && <span style={{ color: dueLabel.color }}>{dueLabel.label}</span>}
        </div>
      </div>

      <div style={taskActions}>
        <button onClick={onEdit} style={miniBtn}>Edit</button>
        <button onClick={onDelete} style={deleteBtn}>×</button>
      </div>
    </article>
  );
}

function StatCard({ label, value, tone = 'default' }) {
  const color = tone === 'green' ? '#34d399' : tone === 'red' ? '#f87171' : tone === 'blue' ? '#38bdf8' : '#fff';

  return (
    <div style={statCard}>
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function calculateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const active = total - completed;
  const overdue = tasks.filter(isOverdue).length;
  const today = tasks.filter(isDueToday).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const priorityCounts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, { High: 0, Medium: 0, Low: 0 });

  return { total, completed, active, overdue, today, progress, priorityCounts };
}

function sortTasks(a, b, sortBy) {
  if (sortBy === 'priority') {
    return (PRIORITIES[b.priority]?.rank || 0) - (PRIORITIES[a.priority]?.rank || 0);
  }

  if (sortBy === 'dueDate') {
    return dateValue(a.dueDate) - dateValue(b.dueDate);
  }

  if (sortBy === 'oldest') {
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  }

  if (sortBy === 'category') {
    return String(a.category || '').localeCompare(String(b.category || ''));
  }

  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = startOfToday();
  return new Date(task.dueDate) < today;
}

function isDueToday(task) {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate).toDateString() === startOfToday().toDateString();
}

function getDueLabel(task) {
  if (!task.dueDate) return { label: '', color: '#94a3b8' };

  if (isOverdue(task)) return { label: `Overdue: ${task.dueDate}`, color: '#f87171' };
  if (isDueToday(task)) return { label: `Due today`, color: '#38bdf8' };

  return { label: `Due: ${task.dueDate}`, color: '#94a3b8' };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateValue(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  return new Date(value).getTime();
}

function csvEscape(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const pageWrap = { maxWidth: '1180px', margin: '0 auto', padding: '45px 20px 90px' };
const toast = { position: 'fixed', top: '84px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 22px', borderRadius: '12px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' };

const hero = { textAlign: 'center', marginBottom: '42px' };
const eyebrow = { color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, fontSize: '0.78rem', marginBottom: '12px' };
const heroTitle = { color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0 0 16px', fontWeight: 950 };
const heroText = { color: '#cbd5e1', fontSize: '1.08rem', maxWidth: '920px', margin: '0 auto', lineHeight: 1.75 };

const appGrid = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' };
const mainPanel = { display: 'grid', gap: '22px' };
const sidePanel = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '24px', position: 'sticky', top: '92px', display: 'grid', gap: '18px' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px' };
const statCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '16px', display: 'grid', gap: '8px', color: '#94a3b8' };

const progressCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '22px' };
const progressHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center' };
const progressPercent = { color: '#38bdf8', fontSize: '1.8rem' };
const progressTrack = { height: '12px', background: '#0f172a', borderRadius: '999px', overflow: 'hidden', marginTop: '16px' };
const progressFill = { height: '100%', background: '#38bdf8', transition: 'width 0.3s ease' };

const formCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px', display: 'grid', gap: '18px' };
const sectionTitle = { color: '#fff', margin: 0, fontSize: '1.28rem' };
const sectionText = { color: '#94a3b8', lineHeight: 1.65, margin: '8px 0 0', fontSize: '0.92rem' };
const taskForm = { display: 'grid', gap: '16px' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' };
const fieldWrap = { display: 'grid', gap: '8px' };
const fieldLabel = { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '13px', padding: '12px', outline: 'none' };
const textareaStyle = { ...inputStyle, minHeight: '88px', resize: 'vertical', lineHeight: 1.5 };
const actionRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const primaryBtn = { background: '#38bdf8', color: '#082f49', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 950, cursor: 'pointer' };
const secondaryBtn = { background: '#334155', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 850, cursor: 'pointer' };
const dangerBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 850, cursor: 'pointer' };

const bulkBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '18px', display: 'grid', gap: '12px' };
const miniTitle = { color: '#38bdf8', margin: 0, fontSize: '1rem' };
const bulkTextarea = { ...inputStyle, minHeight: '140px', resize: 'vertical', lineHeight: 1.55 };

const toolbarCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '20px' };
const toolbarGrid = { display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 170px 170px', gap: '14px' };

const listCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '28px', padding: '26px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap' };
const datePill = { background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', borderRadius: '999px', padding: '8px 12px', fontWeight: 900, whiteSpace: 'nowrap' };
const taskList = { display: 'grid', gap: '12px' };
const emptyBox = { background: '#0f172a', border: '1px dashed #334155', borderRadius: '20px', padding: '50px 20px', textAlign: 'center', display: 'grid', gap: '8px', color: '#64748b' };

const taskItem = { display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '16px' };
const checkStyle = { width: '22px', height: '22px', cursor: 'pointer', accentColor: '#38bdf8', marginTop: '3px' };
const taskTitle = { color: '#fff', fontSize: '1.05rem', fontWeight: 850, lineHeight: 1.4 };
const taskNotes = { color: '#94a3b8', margin: '8px 0 0', lineHeight: 1.55, whiteSpace: 'pre-wrap' };
const taskMeta = { display: 'flex', flexWrap: 'wrap', gap: '10px', color: '#64748b', fontSize: '0.75rem', fontWeight: 850, marginTop: '10px' };
const taskActions = { display: 'flex', alignItems: 'center', gap: '8px' };
const miniBtn = { background: 'transparent', color: '#38bdf8', border: '1px solid #334155', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', fontWeight: 850 };
const deleteBtn = { background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 };
const editGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' };

const exportGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' };

const sideTitle = { color: '#fff', margin: 0, fontSize: '1.15rem' };
const priorityRow = { background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#94a3b8' };
const tipBox = { background: '#0f172a', border: '1px solid #334155', borderRadius: '18px', padding: '18px', color: '#94a3b8', lineHeight: 1.65, fontSize: '0.9rem' };

const contentSection = { marginTop: '78px', borderTop: '1px solid #334155', paddingTop: '55px', color: '#cbd5e1', lineHeight: 1.85 };
const seoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', margin: '30px 0' };
const seoCard = { background: '#1e293b', border: '1px solid #334155', borderRadius: '22px', padding: '22px' };
const tipList = { paddingLeft: '20px', lineHeight: 1.9 };

const faqSection = { marginTop: '70px', background: 'rgba(56,189,248,0.05)', border: '1px solid #334155', borderRadius: '26px', padding: '34px', color: '#cbd5e1', lineHeight: 1.8 };
const faqGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' };
const faqItem = { background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '20px', padding: '22px' };