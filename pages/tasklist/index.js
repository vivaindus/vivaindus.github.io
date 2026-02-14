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
                {/* --- SEO CONTENT SECTION START --- */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '40px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <h2 style={{ color: '#38bdf8' }}>Smart Task Management for Daily Productivity</h2>
                    <p>
                        The SHB Smart Task Manager is more than just a simple to-do list. It is a productivity-focused utility 
                        designed to help you organize your daily goals, prioritize your workload, and visualize your progress 
                        in real-time. Whether you are managing a complex project or simply keeping track of household chores, 
                        our tool ensures that your focus remains on what matters most.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Priority-Based Organization</h3>
                    <p>
                        Not all tasks are created equal. Effective time management requires the ability to distinguish between 
                        urgent requirements and minor tasks. Our manager allows you to assign three distinct priority levels:
                    </p>
                    <ul>
                        <li><strong>High Priority:</strong> Tasks that require immediate attention and impact your primary goals.</li>
                        <li><strong>Medium Priority:</strong> Important tasks that should be completed once high-priority items are addressed.</li>
                        <li><strong>Low Priority:</strong> Non-urgent tasks or "nice-to-have" goals for your spare time.</li>
                    </ul>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Unique Feature: Export Your List to PNG</h3>
                    <p>
                        One of the standout features of the SHB ToolBox Task Manager is the <strong>PNG Export utility</strong>. 
                        With a single click, you can transform your digital list into a high-quality image file. This is perfect for 
                        setting your daily goals as a phone wallpaper, printing a physical checklist, or sharing your progress 
                        with team members via messaging apps without needing them to log into a platform.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Privacy and Local Data Integrity</h3>
                    <p>
                        Your daily schedule and personal plans are private. Unlike traditional "cloud-based" task managers 
                        that store your data on their servers, the SHB Task Manager works entirely on your device. 
                        Using advanced <strong>LocalStorage technology</strong>, your tasks are saved directly in your 
                        browser. This means you can close the tab, restart your computer, and return to find your list 
                        exactly as you left it—all without your data ever being uploaded to the internet or our database.
                    </p>

                    <h3 style={{ color: '#38bdf8', marginTop: '30px' }}>Visual Progress Tracking</h3>
                    <p>
                        Psychologically, seeing progress motivates us to finish. Our tool includes an automated 
                        progress bar that calculates the percentage of completed tasks. As you check off your goals, 
                        the bar fills up, giving you a satisfying visual representation of your daily achievements.
                    </p>
                </div>
                {/* --- SEO CONTENT SECTION END --- */}
            </div>
        </ToolboxLayout>
    );
}