import React from 'react';
import ToolboxLayout from '../../components/ToolboxLayout';

export default function About() {
    return (
        <ToolboxLayout 
            title="About Us" 
            description="Learn more about SHB ToolBox and our mission to provide free, high-quality web utilities."
        >
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', lineHeight: '1.6' }}>
                <h1 style={{ color: '#38bdf8', marginBottom: '20px' }}>About SHB ToolBox</h1>
                <p>
                    Welcome to <strong>SHB ToolBox</strong>, a project by <strong>SHB Stores</strong>. 
                    Our mission is to provide a comprehensive suite of fast, secure, and easy-to-use 
                    web utility tools for developers, students, and professionals.
                </p>
                
                <h2 style={{ color: '#38bdf8', marginTop: '30px' }}>Our Commitment</h2>
                <p>
                    We believe that essential tools like QR generators, calculators, and converters 
                    should be accessible to everyone without heavy advertisements or complicated interfaces. 
                    All our tools are built with Next.js and hosted on Vercel to ensure maximum speed and uptime.
                </p>

                <h2 style={{ color: '#38bdf8', marginTop: '30px' }}>Our Stack</h2>
                <p>
                    SHB ToolBox is built using modern web technologies, including React, Next.js, and Supabase. 
                    We prioritize user privacy; most of our tools process data locally in your browser 
                    and do not store your personal information on our servers.
                </p>

                <h2 style={{ color: '#38bdf8', marginTop: '30px' }}>Contact Information</h2>
                <p>
                    Have a suggestion for a new tool? Feel free to reach out to us through our 
                    <a href="/contact" style={{ color: '#38bdf8', textDecoration: 'none' }}> Contact Page</a>.
                </p>
            </div>
        </ToolboxLayout>
    );
}