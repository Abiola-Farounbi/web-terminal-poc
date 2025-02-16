// pages/index.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

export default function Home() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket>();
  const xtermRef = useRef<Terminal>();

  useEffect(() => {
    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff'
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
    }

    xtermRef.current = term;

    // Initialize Socket.IO connection
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    // Handle terminal input
    term.onData((data) => {
      socket.emit('input', data);
    });

    // Handle terminal output
    socket.on('output', (data) => {
      term.write(data);
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
      socket.emit('resize', {
        cols: term.cols,
        rows: term.rows
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      term.dispose();
      socket.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-900 p-4">
      <div 
        ref={terminalRef}
        className="w-full h-full rounded-lg overflow-hidden border border-gray-700"
      />
    </div>
  );
}