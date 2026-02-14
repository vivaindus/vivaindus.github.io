import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');
    const [priority, setPriority] = useState('Medium');
    const listRef = useRef(null);

    // Load tasks from LocalStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('shb_tasks_v2')) || [];
        setTasks(saved);
    }, []);

    // Save tasks to LocalStorage
    const save = (updatedTasks) => {
        setTasks(updatedTasks);
        localStorage.setItem('shb_tasks_v2', JSON.stringify(updatedTasks));
    };

    const addTask = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newTask = {
            id: Date.now(),
            text: input,
            priority: priority,
            completed: false,
            date: new Date().toLocaleDateString()
        };
        save([newTask, ...tasks]);
        setInput('');
    };

    const toggleTask = (id) => {
        const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        save(updated);
    };

    const deleteTask = (id) => {
        const updated = tasks.filter(t => t.id !== id);
        save(updated);
    };

    const clearCompleted = () => {
        const updated = tasks.filter(t => !t.completed);
        save(updated);
    };

    // PNG Download Feature
    const downloadAsImage = async () => {
        const { toPng } = await import('html-to-image');
        if (listRef.current === null) return;
        
        toPng(listRef.current, { cacheBust: true, backgroundColor: '#0f172a' })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'shb-task-list.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => console.error('Oops, something went wrong!', err));
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <ToolboxLayout title="Smart Task Manager" description="Organize your daily goals with priority tracking and PNG export.">
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#38bdf8' }}>Task Manager</h1>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Plan your day, download your list.</p>

                {/* INPUT SECTION */}
                <form onSubmit={addTask} style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '25px' }}>
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e)=>setInput(e.target.value)} 
                        placeholder="Add a new task..." 
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', fontSize: '1rem' }} 
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select 
                            value={priority} 
                            onChange={(e)=>setPriority(e.target.value)}
                            style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '10px', padding: '10px' }}
                        >
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                        <button type="submit" style={{ flex: 1, background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ADD TASK</button>
                    </div>
                </form>

                {/* PROGRESS BAR */}
                {tasks.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '10px' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: '#38bdf8', borderRadius: '10px', transition: '0.3s' }}></div>
                        </div>
                    </div>
                )}

                {/* THE LIST AREA (Target for PNG Download) */}
                <div ref={listRef} style={{ padding: '10px' }}>
                    <h3 style={{ color: '#38bdf8', marginBottom: '15px', fontSize: '1rem' }}>My Daily List</h3>
                    {tasks.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No tasks found. Add one above!</p>
                    ) : (
                        tasks.map(t => (
                            <div key={t.id} style={{ 
                                background: t.completed ? '#1e293b80' : '#1e293b', 
                                padding: '15px', borderRadius: '12px', marginBottom: '10px', 
                                display: 'flex', alignItems: 'center', gap: '15px', 
                                border: '1px solid #334155', opacity: t.completed ? 0.6 : 1 
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={t.completed} 
                                    onChange={() => toggleTask(t.id)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ textDecoration: t.completed ? 'line-through' : 'none', color: '#fff', fontWeight: '500' }}>{t.text}</div>
                                    <div style={{ fontSize: '0.7rem', color: t.priority === 'High' ? '#f87171' : t.priority === 'Medium' ? '#fbbf24' : '#34d399' }}>
                                        {t.priority} Priority • {t.date}
                                    </div>
                                </div>
                                <button onClick={()=>deleteTask(t.id)} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                            </div>
                        ))
                    )}
                </div>

                {/* ACTIONS */}
                {tasks.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                        <button onClick={downloadAsImage} style={{ background: '#334155', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <i className="fa-solid fa-image"></i> DOWNLOAD PNG
                        </button>
                        <button onClick={clearCompleted} style={{ background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                            CLEAR DONE
                        </button>
                    </div>
                )}
            </div>
        </ToolboxLayout>
    );
}