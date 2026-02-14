import React, { useState, useEffect } from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('shb_tasks');
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    const addTask = (e) => {
        e.preventDefault();
        if (!input) return;
        const newTasks = [...tasks, { id: Date.now(), text: input }];
        setTasks(newTasks);
        localStorage.setItem('shb_tasks', JSON.stringify(newTasks));
        setInput('');
    };

    const deleteTask = (id) => {
        const newTasks = tasks.filter(t => t.id !== id);
        setTasks(newTasks);
        localStorage.setItem('shb_tasks', JSON.stringify(newTasks));
    };

    return (
        <ToolboxLayout title="Simple Task Manager" description="Organize your day with our private, browser-based to-do list.">
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>My Tasks</h1>
                <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <input type="text" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="What needs to be done?" style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '15px', borderRadius: '12px' }} />
                    <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '0 20px', borderRadius: '12px', fontWeight: 'bold' }}>ADD</button>
                </form>
                {tasks.map(t => (
                    <div key={t.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                        <span>{t.text}</span>
                        <button onClick={()=>deleteTask(t.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>✖</button>
                    </div>
                ))}
            </div>
        </ToolboxLayout>
    );
}