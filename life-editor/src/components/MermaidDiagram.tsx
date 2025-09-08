'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

export default function MermaidDiagram({ chart, id = 'mermaid-' + Math.random().toString(36).substr(2, 9) }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let mermaid: any;
    
    const loadMermaid = async () => {
      const { default: mermaidAPI } = await import('mermaid');
      mermaid = mermaidAPI;
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          background: '#ffffff',
          primaryColor: '#e1f5fe',
          primaryTextColor: '#333',
          primaryBorderColor: '#81c784',
          lineColor: '#666',
          secondaryColor: '#f3e5f5',
          tertiaryColor: '#fff3e0',
          cScale0: '#81c784',
          cScale1: '#f06292',
          cScale2: '#ffb74d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }
      });
      
      try {
        const { svg } = await mermaid.render(id, chart);
        if (elementRef.current) {
          elementRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (elementRef.current) {
          elementRef.current.innerHTML = `<pre style="color: #f85149; background: #2d333b; padding: 12px; border-radius: 6px; font-family: monospace;">
Error rendering diagram:
${error}

Chart:
${chart}
</pre>`;
        }
      }
    };
    
    loadMermaid();
  }, [chart, id, mounted]);

  if (!mounted) {
    return (
      <div 
        className="mermaid-container"
        style={{
          textAlign: 'center',
          margin: '24px 0',
          background: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e1e4e8',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <span style={{ color: '#666' }}>Loading diagram...</span>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className="mermaid-container"
      style={{
        textAlign: 'center',
        margin: '24px 0',
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e1e4e8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
}