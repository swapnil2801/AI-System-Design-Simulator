import { jsPDF } from 'jspdf';

/**
 * Generate a professional PDF report from all analysis results.
 */
export function exportAnalysisReport({
  architectureName = 'Untitled Architecture',
  simulationData,
  analysisData,
  aiAnalysisData,
  costData,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const colors = {
    primary: [59, 130, 246],
    purple: [168, 85, 247],
    indigo: [99, 102, 241],
    green: [34, 197, 94],
    red: [239, 68, 68],
    amber: [245, 158, 11],
    dark: [15, 23, 42],
    darkCard: [30, 41, 59],
    text: [226, 232, 240],
    muted: [148, 163, 184],
    white: [255, 255, 255],
  };

  // ── Helpers ──────────────────────────────────────────────────
  const setColor = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);

  const checkPage = (needed = 20) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      drawPageBg();
      y = margin;
    }
  };

  const drawPageBg = () => {
    setFill(colors.dark);
    doc.rect(0, 0, pageW, pageH, 'F');
  };

  const drawSectionHeader = (title, color) => {
    checkPage(14);
    setFill(color);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(colors.white);
    doc.text(title, margin + 4, y + 7);
    y += 14;
  };

  const drawMetric = (label, value, unit, x, w) => {
    setFill(colors.darkCard);
    doc.roundedRect(x, y, w, 18, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setColor(colors.muted);
    doc.text(label.toUpperCase(), x + 4, y + 6);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(colors.white);
    const valStr = String(value ?? '—');
    doc.text(valStr, x + 4, y + 14);
    if (unit) {
      const valW = doc.getTextWidth(valStr);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(colors.muted);
      doc.text(unit, x + 4 + valW + 1.5, y + 14);
    }
  };

  const drawMetricRow = (metrics, colCount = 4) => {
    checkPage(22);
    const gap = 3;
    const colW = (contentW - gap * (colCount - 1)) / colCount;
    metrics.forEach((m, i) => {
      const col = i % colCount;
      const x = margin + col * (colW + gap);
      if (i > 0 && col === 0) {
        y += 22;
        checkPage(22);
      }
      drawMetric(m.label, m.value, m.unit, x, colW);
    });
    y += 22;
  };

  const drawTextBlock = (text, color = colors.text) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(color);
    const lines = doc.splitTextToSize(text, contentW - 8);
    lines.forEach((line) => {
      checkPage(6);
      doc.text(line, margin + 4, y);
      y += 4.5;
    });
    y += 2;
  };

  const drawBullet = (text, bulletColor = colors.amber, textColor = colors.text) => {
    checkPage(10);
    const lines = doc.splitTextToSize(text, contentW - 14);
    setFill(bulletColor);
    doc.circle(margin + 5, y - 0.5, 1.2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(textColor);
    lines.forEach((line, i) => {
      doc.text(line, margin + 10, y);
      y += 4.5;
    });
    y += 1;
  };

  const drawLoadBar = (label, load) => {
    checkPage(12);
    const isHigh = load > 80;
    const isMed = load > 60;
    const barColor = isHigh ? colors.red : isMed ? colors.amber : colors.green;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(colors.text);
    doc.text(label, margin + 4, y);

    const loadStr = `${load}%`;
    setColor(barColor);
    doc.setFont('helvetica', 'bold');
    doc.text(loadStr, margin + contentW - 4 - doc.getTextWidth(loadStr), y);
    y += 3;

    // Bar background
    setFill([20, 30, 50]);
    doc.roundedRect(margin + 4, y, contentW - 8, 3, 1.5, 1.5, 'F');
    // Bar fill
    setFill(barColor);
    const fillW = Math.min(load, 100) / 100 * (contentW - 8);
    if (fillW > 0) doc.roundedRect(margin + 4, y, fillW, 3, 1.5, 1.5, 'F');
    y += 7;
  };

  // ── Start Building PDF ───────────────────────────────────────
  drawPageBg();

  // Title bar
  setFill(colors.primary);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor(colors.white);
  doc.text('System Design Analysis Report', margin + 6, y + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(architectureName, margin + 6, y + 17);

  // Date on right
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  const dateW = doc.getTextWidth(dateStr);
  doc.text(dateStr, margin + contentW - 6 - dateW, y + 10);
  y += 28;

  // ── PERFORMANCE SECTION ─────────────────────────────────────
  if (simulationData) {
    drawSectionHeader('PERFORMANCE METRICS', colors.primary);

    drawMetricRow([
      { label: 'System Latency', value: simulationData.latency, unit: 'ms' },
      { label: 'Max Throughput', value: simulationData.maxRps?.toLocaleString(), unit: 'rps' },
      { label: 'Peak Latency', value: simulationData.peakLatency, unit: 'ms' },
      { label: 'Bandwidth', value: simulationData.bandwidthMbps, unit: 'Mbps' },
    ]);

    drawMetricRow([
      { label: 'Effective RPS', value: simulationData.effectiveRps?.toLocaleString() },
      { label: 'Read Throughput', value: simulationData.readThroughput?.toLocaleString(), unit: 'rps' },
      { label: 'Write Throughput', value: simulationData.writeThroughput?.toLocaleString(), unit: 'rps' },
      { label: 'Cache Offload', value: simulationData.cacheOffload, unit: '%' },
    ]);

    drawMetricRow([
      { label: 'Availability Est.', value: simulationData.availabilityEstimate, unit: '%' },
      { label: 'Concurrent Users', value: simulationData.concurrentUsers?.toLocaleString() },
    ], 2);

    // Bottlenecks
    if (simulationData.bottlenecks?.length > 0) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.red);
      doc.text('BOTTLENECKS DETECTED', margin + 4, y);
      y += 5;
      simulationData.bottlenecks.forEach((b) => drawBullet(b, colors.red, colors.red));
      y += 2;
    }

    // Component loads
    if (simulationData.componentLoads?.length > 0) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.muted);
      doc.text('COMPONENT LOAD', margin + 4, y);
      y += 5;
      simulationData.componentLoads.forEach((comp) => drawLoadBar(comp.name, comp.load));
    }

    y += 4;
  }

  // ── RULE-BASED ANALYSIS ─────────────────────────────────────
  if (analysisData) {
    drawSectionHeader('RULE-BASED ANALYSIS', colors.purple);

    if (analysisData.warnings?.length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.amber);
      doc.text(`WARNINGS (${analysisData.warnings.length})`, margin + 4, y);
      y += 5;
      analysisData.warnings.forEach((w) => drawBullet(w, colors.amber, colors.text));
      y += 2;
    }

    if (analysisData.suggestions?.length > 0) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.primary);
      doc.text(`SUGGESTIONS (${analysisData.suggestions.length})`, margin + 4, y);
      y += 5;
      analysisData.suggestions.forEach((s) => drawBullet(s, colors.primary, colors.text));
    }

    y += 4;
  }

  // ── AI ANALYSIS ─────────────────────────────────────────────
  if (aiAnalysisData) {
    drawSectionHeader('AI ANALYSIS (AZURE OPENAI)', colors.indigo);

    // Reliability + Scalability
    const aiMetrics = [];
    if (aiAnalysisData.reliability_score != null) {
      aiMetrics.push({ label: 'Reliability Score', value: `${aiAnalysisData.reliability_score}/10` });
    }
    if (aiAnalysisData.scalability_assessment) {
      aiMetrics.push({ label: 'Scalability', value: aiAnalysisData.scalability_assessment.substring(0, 40) });
    }
    if (aiMetrics.length > 0) drawMetricRow(aiMetrics, aiMetrics.length);

    // Scalability full text (if longer)
    if (aiAnalysisData.scalability_assessment && aiAnalysisData.scalability_assessment.length > 40) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.indigo);
      doc.text('SCALABILITY ASSESSMENT', margin + 4, y);
      y += 5;
      drawTextBlock(aiAnalysisData.scalability_assessment);
    }

    // Detailed analysis
    if (aiAnalysisData.detailed_analysis) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.indigo);
      doc.text('DETAILED ANALYSIS', margin + 4, y);
      y += 5;
      drawTextBlock(aiAnalysisData.detailed_analysis);
    }

    if (aiAnalysisData.warnings?.length > 0) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.amber);
      doc.text('AI WARNINGS', margin + 4, y);
      y += 5;
      aiAnalysisData.warnings.forEach((w) => drawBullet(w, colors.amber, colors.text));
      y += 2;
    }

    if (aiAnalysisData.suggestions?.length > 0) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.indigo);
      doc.text('AI SUGGESTIONS', margin + 4, y);
      y += 5;
      aiAnalysisData.suggestions.forEach((s) => drawBullet(s, colors.indigo, colors.text));
    }

    y += 4;
  }

  // ── COST ESTIMATION ─────────────────────────────────────────
  if (costData) {
    drawSectionHeader('COST ESTIMATION', colors.green);

    drawMetricRow([
      { label: 'Monthly Cost', value: `$${costData.total}`, unit: '/mo' },
      { label: 'Cloud Provider', value: costData.cloudProvider?.toUpperCase() },
    ], 2);

    // Cloud comparison
    if (costData.comparison && Object.keys(costData.comparison).length > 0) {
      checkPage(26);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.muted);
      doc.text('CLOUD COMPARISON', margin + 4, y);
      y += 5;

      const providers = Object.entries(costData.comparison);
      const colW = (contentW - 3 * (providers.length - 1)) / providers.length;
      providers.forEach(([provider, pData], i) => {
        const x = margin + i * (colW + 3);
        const isActive = provider === costData.cloudProvider;
        setFill(isActive ? [30, 58, 95] : colors.darkCard);
        doc.roundedRect(x, y, colW, 18, 2, 2, 'F');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        setColor(isActive ? colors.primary : colors.muted);
        const provLabel = provider.toUpperCase();
        doc.text(provLabel, x + colW / 2 - doc.getTextWidth(provLabel) / 2, y + 6);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        setColor(isActive ? colors.white : colors.text);
        const costStr = `$${pData.total}`;
        doc.text(costStr, x + colW / 2 - doc.getTextWidth(costStr) / 2, y + 14);
      });
      y += 24;
    }

    // Breakdown table
    if (costData.breakdown?.length > 0) {
      checkPage(10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(colors.muted);
      doc.text('COST BREAKDOWN', margin + 4, y);
      y += 5;

      // Table header
      setFill([20, 30, 50]);
      doc.rect(margin, y, contentW, 7, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setColor(colors.muted);
      doc.text('COMPONENT', margin + 4, y + 5);
      doc.text('COST/MO', margin + contentW - 4 - doc.getTextWidth('COST/MO'), y + 5);
      y += 8;

      costData.breakdown.forEach((item, i) => {
        checkPage(8);
        if (i % 2 === 0) {
          setFill(colors.darkCard);
          doc.rect(margin, y - 1, contentW, 7, 'F');
        }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setColor(colors.text);
        doc.text(item.name, margin + 4, y + 4);
        doc.setFont('helvetica', 'bold');
        setColor(colors.green);
        const costStr = `$${item.cost}`;
        doc.text(costStr, margin + contentW - 4 - doc.getTextWidth(costStr), y + 4);
        y += 7;
      });

      // Total row
      checkPage(10);
      setFill([22, 101, 52]);
      doc.roundedRect(margin, y, contentW, 8, 0, 0, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      setColor(colors.white);
      doc.text('Total', margin + 4, y + 6);
      const totalStr = `$${costData.total}/mo`;
      doc.text(totalStr, margin + contentW - 4 - doc.getTextWidth(totalStr), y + 6);
      y += 12;
    }
  }

  // ── Footer on each page ─────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setColor(colors.muted);
    const footerY = pageH - 8;
    doc.text('Generated by AI System Design Simulator', margin, footerY);
    const pageStr = `Page ${p} of ${totalPages}`;
    doc.text(pageStr, pageW - margin - doc.getTextWidth(pageStr), footerY);

    // Thin separator line
    setDraw(colors.darkCard);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageW - margin, footerY - 3);
  }

  // ── Save ────────────────────────────────────────────────────
  const safeName = architectureName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
  doc.save(`${safeName}_analysis_report.pdf`);
}
