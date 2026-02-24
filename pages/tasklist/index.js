import React, { useState, useEffect, useRef } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TaskList() {
    const [mounted, setMounted] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [notification, setNotification] = useState('');
    const listRef = useRef(null);

    // Hydration Guard & Load Data
    useEffect(() => {
        setMounted(true);
        const saved = JSON.parse(localStorage.getItem('shb_tasks_v3')) || [];
        setTasks(saved);
    }, []);

    // Toast Logic
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Save Logic
    const save = (updatedTasks) => {
        setTasks(updatedTasks);
        localStorage.setItem('shb_tasks_v3', JSON.stringify(updatedTasks));
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
        setNotification('Task Added! 🚀');
    };

    const toggleTask = (id) => {
        const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        save(updated);
    };

    const deleteTask = (id) => {
        const updated = tasks.filter(t => t.id !== id);
        save(updated);
        setNotification('Task Removed.');
    };

    const clearCompleted = () => {
        const updated = tasks.filter(t => !t.completed);
        save(updated);
        setNotification('Completed Tasks Cleared! ✨');
    };

    const downloadAsImage = async () => {
        const { toPng } = await import('html-to-image');
        if (listRef.current === null) return;
        setNotification('Generating Image... 📸');
        
        toPng(listRef.current, { cacheBust: true, backgroundColor: '#0f172a', style: { padding: '20px' } })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `SHB_Tasks_${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
                setNotification('Image Saved Successfully! ✅');
            })
            .catch((err) => console.error('Export Error:', err));
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    if (!mounted) return <ToolboxLayout title="Task Manager" description="Loading..."><div style={{padding:'100px', textAlign:'center', color:'#94a3b8'}}>Organizing Workspace...</div></ToolboxLayout>;

    return (
        <ToolboxLayout 
            title="Smart Task Manager - Professional To-Do List with PNG Export" 
            description="Organize your daily workflow with our priority-based task manager. Export your list to PNG, track progress, and learn about the Zeigarnik Effect 100% privately."
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* TOAST NOTIFICATION */}
                {notification && (
                    <div style={{ position: 'fixed', top: '80px', right: '20px', background: '#38bdf8', color: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        {notification}
                    </div>
                )}

                {/* --- TOP SECTION: THE HOOK --- */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '2.5rem' }}>Smart Task Manager Pro</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '850px', margin: '15px auto', lineHeight: '1.6' }}>
                        Writing down your goals reduces "Cognitive Load" by 80%. Our <strong>Priority-First Suite</strong> 
                        helps you categorize what's urgent and export your plan as an image for your mobile wallpaper.
                    </p>
                    <div style={{ display: 'inline-flex', gap: '15px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 25px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span>📊 Progress Tracking</span>
                        <span>🎨 High-Res PNG Export</span>
                        <span>🔒 Local Browser Save</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* INPUT SECTION */}
                    <div style={{ flex: 1, minWidth: '320px' }}>
                        <form onSubmit={addTask} style={{ background: '#1e293b', padding: '30px', borderRadius: '25px', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                            <label style={lCap}>ADD NEW TASK</label>
                            <input 
                                type="text" 
                                value={input} 
                                onChange={(e)=>setInput(e.target.value)} 
                                placeholder="What needs to be done?" 
                                style={inputStyle} 
                            />
                            <label style={{ ...lCap, marginTop: '20px' }}>PRIORITY LEVEL</label>
                            <select value={priority} onChange={(e)=>setPriority(e.target.value)} style={selectStyle}>
                                <option value="High">🔥 High Priority (Urgent)</option>
                                <option value="Medium">⚡ Medium Priority</option>
                                <option value="Low">🧊 Low Priority</option>
                            </select>
                            <button type="submit" style={btnPrimary}>ADD TO WORKSPACE</button>
                        </form>

                        <div style={{ marginTop: '20px', background: '#0f172a', padding: '25px', borderRadius: '20px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>COMPLETION RATE</span>
                                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Math.round(progress)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.4s' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* LIST AREA */}
                    <div style={{ flex: 1.5, minWidth: '350px' }}>
                        <div ref={listRef} style={{ background: '#1e293b', padding: '30px', borderRadius: '25px', border: '1px solid #334155' }}>
                            <h3 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '20px' }}>Current Productivity Stack</h3>
                            {tasks.length === 0 ? (
                                <p style={{ color: '#475569', textAlign: 'center', padding: '50px 0' }}>Your workspace is clear. Add a task to begin.</p>
                            ) : (
                                tasks.map(t => (
                                    <div key={t.id} style={{ ...taskItem, background: t.completed ? 'rgba(56, 189, 248, 0.02)' : '#0f172a', opacity: t.completed ? 0.5 : 1 }}>
                                        <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} style={checkS} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ textDecoration: t.completed ? 'line-through' : 'none', color: '#fff', fontSize: '1.05rem' }}>{t.text}</div>
                                            <div style={{ fontSize: '0.65rem', color: t.priority === 'High' ? '#f87171' : t.priority === 'Medium' ? '#fbbf24' : '#34d399', fontWeight: 'bold', marginTop: '5px' }}>
                                                {t.priority.toUpperCase()} • {t.date}
                                            </div>
                                        </div>
                                        <button onClick={()=>deleteTask(t.id)} style={btnDel}>&times;</button>
                                    </div>
                                ))
                            )}
                        </div>

                        {tasks.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                                <button onClick={downloadAsImage} style={btnSecondary}>📸 EXPORT TO PNG</button>
                                <button onClick={clearCompleted} style={btnDanger}>🧹 CLEAR FINISHED</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MASSIVE KNOWLEDGE HUB (BOTTOM SEO) --- */}
                <div style={{ marginTop: '100px', borderTop: '1px solid #334155', paddingTop: '60px', color: '#cbd5e1', lineHeight: '1.9' }}>
                    <h2 style={{ color: '#38bdf8', fontSize: '2.2rem', marginBottom: '30px' }}>The Psychology of Productivity: Mastering Your Mental Bandwidth</h2>
                    <p>
                        In a world of constant digital distractions, the ability to manage your focus is your most valuable asset. 
                        The <strong>Smart Task Manager Pro</strong> is more than just a list—it is a cognitive offloading tool 
                        based on proven psychological principles of time management.
                    </p>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.6rem' }}>The Zeigarnik Effect: Why Writing Matters</h3>
                    <p>
                        Named after psychologist Bluma Zeigarnik, this phenomenon explains that the human brain remembers 
                        <strong>unfinished or interrupted tasks</strong> better than completed ones. This creates constant mental 
                        "background noise" that increases stress. By transferring these tasks to our secure digital workspace, 
                        you effectively close those mental loops, allowing your brain to enter a state of "Deep Focus."
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '60px' }}>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>1. The Ivy Lee Method</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                At the end of each day, write down the 6 most important tasks for tomorrow. Our 
                                <strong> Priority Settings</strong> allow you to rank these instantly. When you start your day, 
                                tackle only the High-Priority items first until they are completed.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>2. Visual Anchor Export</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Our unique <strong>PNG Export feature</strong> transforms your digital list into a high-res image. 
                                By setting your list as your mobile wallpaper or computer background, you create a "Visual Anchor" 
                                that keeps you accountable every time you look at your screen.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#38bdf8' }}>3. Data Sovereignty</h4>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
                                Privacy is the core of SHB ToolBox. Traditional task apps store your private life and business 
                                goals on their cloud servers. Our manager uses <strong>browser-level LocalStorage</strong>. 
                                Your goals never leave your computer, ensuring 100% data sovereignty.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ color: '#fff', marginTop: '50px', fontSize: '1.5rem' }}>Optimizing Your High-Impact Tasks</h3>
                    <p>To maximize your output using this tool, follow these professional guidelines:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '20px' }}>
                        <li style={{ marginBottom: '15px' }}><strong>Avoid Multitasking:</strong> Use our progress bar to focus on one task at a time. Multi-tasking can reduce productivity by up to 40%.</li>
                        <li style={{ marginBottom: '15px' }}><strong>Batch Low-Priority Tasks:</strong> Group smaller chores together and tackle them at the end of the day when your willpower is lower.</li>
                        <li style={{ marginBottom: '15px' }}><strong>The Two-Minute Rule:</strong> If a task takes less than two minutes, don't add it to the list—just do it immediately.</li>
                    </ul>
                </div>
            </div>
        </ToolboxLayout>
    );
}

// Styling Constants
const lCap = { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '15px', color: '#fff', fontSize: '1.1rem', outline: 'none' };
const selectStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '15px', color: '#fff', outline: 'none', cursor: 'pointer', marginTop:'10px' };
const btnPrimary = { width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop:'25px' };
const btnSecondary = { background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' };
const btnDanger = { background: 'none', color: '#f87171', border: '1px solid #f87171', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' };
const taskItem = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '10px' };
const checkS = { width: '22px', height: '22px', cursor: 'pointer', accentColor: '#38bdf8' };
const btnDel = { background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.5rem', marginLeft: '5px' };