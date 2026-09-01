'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { AuditConfig } from '../components/AuditConfig';
import { TriViewStream } from '../components/TriViewStream';
import { BugReportCard } from '../components/BugReportCard';
import { QualityScorecard } from '../components/QualityScorecard';
import { AuditRequest, AgentEvent, DiscoveredBug, QAReport } from '../types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<{ message: string; level: string }[]>([]);
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
  const [discoveredBugs, setDiscoveredBugs] = useState<DiscoveredBug[]>([]);
  const [qaReport, setQaReport] = useState<QAReport | null>(null);
  const [solariActive, setSolariActive] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => setSolariActive(data.solari_configured ?? true))
      .catch(() => setSolariActive(true));
  }, [API_BASE]);

  const handleStartAudit = async (config: AuditRequest) => {
    setIsLoading(true);
    setCurrentUrl(config.target_url);
    setEvents([]);
    setTerminalLogs([]);
    setLatestScreenshot(null);
    setDiscoveredBugs([]);
    setQaReport(null);

    try {
      const startRes = await fetch(`${API_BASE}/api/audit/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!startRes.ok) {
        throw new Error('Failed to initiate audit with backend');
      }

      const { session_id } = await startRes.json();
      const eventSource = new EventSource(`${API_BASE}/api/audit/stream/${session_id}`);

      eventSource.onmessage = (event) => {
        try {
          const data: AgentEvent = JSON.parse(event.data);
          setEvents((prev) => [...prev, data]);

          if (data.type === 'browser_screenshot' && data.data && typeof data.data.screenshot === 'string') {
            setLatestScreenshot(data.data.screenshot);
          }

          if (data.type === 'bug_detected' && data.data) {
            const bug = data.data as unknown as DiscoveredBug;
            setDiscoveredBugs((prev) => {
              if (prev.some((b) => b.id === bug.id)) return prev;
              return [...prev, bug];
            });
          }

          if (data.type === 'sandbox_output') {
            const lvl = data.data && typeof data.data.level === 'string' ? data.data.level : 'stdout';
            setTerminalLogs((prev) => [
              ...prev,
              { message: data.message, level: lvl },
            ]);
          }

          if (data.type === 'report_ready' && data.data) {
            const report = data.data as unknown as QAReport;
            setQaReport(report);
            setDiscoveredBugs(report.bugs);
            setIsLoading(false);
            eventSource.close();
          }

          if (data.type === 'error') {
            setIsLoading(false);
            eventSource.close();
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        setIsLoading(false);
        eventSource.close();
      };
    } catch (err) {
      console.error('Audit execution error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#ededed] solari-dots">
      <Header solariConfigured={solariActive} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <AuditConfig onStartAudit={handleStartAudit} isLoading={isLoading} />

        <TriViewStream
          events={events}
          latestScreenshot={latestScreenshot}
          currentUrl={currentUrl}
          terminalLogs={terminalLogs}
          discoveredBugs={discoveredBugs}
        />

        {qaReport && <QualityScorecard report={qaReport} />}

        {(discoveredBugs.length > 0 || qaReport) && (
          <BugReportCard bugs={qaReport ? qaReport.bugs : discoveredBugs} />
        )}
      </main>

      <footer className="border-t border-[#141414] bg-[#000000] py-4 text-center text-[11px] font-mono-code text-[#555555]">
        <p>
          BugScout AI — Built with{' '}
          <a
            href="https://getsolari.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            Solari Cloud Infrastructure
          </a>{' '}
          (Browsers, MicroVM Sandboxes, Session Recordings).
        </p>
      </footer>
    </div>
  );
}
