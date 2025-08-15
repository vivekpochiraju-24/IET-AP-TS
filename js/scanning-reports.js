// Scanning Reports Functionality
class ScanningReports {
  constructor() {
    this.reportsData = [];
    this.charts = {};
    this.isInitialized = false;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    await this.loadSampleData();
    this.renderReports();
    this.setupEventListeners();
  }

  async loadSampleData() {
    // Simulate API call to get data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate sample data for demonstration
        const metrics = ['Heart Rate', 'Blood Pressure', 'Oxygen Level', 'Temperature', 'Respiration'];
        const dates = [];
        const now = new Date();
        
        // Generate dates for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
        }

        this.reportsData = metrics.map(metric => {
          return {
            name: metric,
            unit: this.getUnitForMetric(metric),
            data: dates.map(date => ({
              date,
              value: this.generateRandomValue(metric)
            }))
          };
        });
        
        resolve();
      }, 500);
    });
  }

  getUnitForMetric(metric) {
    const units = {
      'Heart Rate': 'BPM',
      'Blood Pressure': 'mmHg',
      'Oxygen Level': '%',
      'Temperature': '°C',
      'Respiration': 'breaths/min'
    };
    return units[metric] || '';
  }

  generateRandomValue(metric) {
    const ranges = {
      'Heart Rate': { min: 60, max: 100 },
      'Blood Pressure': { min: 90, max: 140 },
      'Oxygen Level': { min: 95, max: 100 },
      'Temperature': { min: 36, max: 38 },
      'Respiration': { min: 12, max: 20 }
    };
    
    const range = ranges[metric] || { min: 0, max: 100 };
    return (Math.random() * (range.max - range.min) + range.min).toFixed(1);
  }

  renderReports() {
    const container = document.getElementById('scanningReportsContainer');
    if (!container) {
      console.error('Scanning reports container not found');
      return;
    }
    
    // Clear existing content
    container.innerHTML = '';

    this.reportsData.forEach(metric => {
      const chartId = `chart-${metric.name.toLowerCase().replace(/\s+/g, '-')}`;
      const card = document.createElement('div');
      card.className = 'scan-report-card';
      card.innerHTML = `
        <div class="report-header">
          <h3>${metric.name} <span class="unit">(${metric.unit})</span></h3>
          <button class="download-chart-btn" data-metric="${metric.name}">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
        <div class="chart-container">
          <canvas id="${chartId}"></canvas>
        </div>
      `;
      container.appendChild(card);
      
      // Initialize chart after DOM is updated
      setTimeout(() => this.initChart(chartId, metric), 100);
    });
  }

  initChart(chartId, metric) {
    const ctx = document.getElementById(chartId).getContext('2d');
    
    this.charts[metric.name] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metric.data.map(d => d.date),
        datasets: [{
          label: metric.name,
          data: metric.data.map(d => d.value),
          borderColor: this.getChartColor(metric.name),
          backgroundColor: this.hexToRgba(this.getChartColor(metric.name), 0.1),
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} ${metric.unit}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#94a3b8'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#94a3b8'
            }
          }
        }
      }
    });
  }

  getChartColor(metricName) {
    const colors = {
      'Heart Rate': '#ff6b81',
      'Blood Pressure': '#9c6bff',
      'Oxygen Level': '#4ecdc4',
      'Temperature': '#ff9f43',
      'Respiration': '#1dd1a1'
    };
    return colors[metricName] || '#3498db';
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  setupEventListeners() {
    // Download chart buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.download-chart-btn')) {
        const button = e.target.closest('.download-chart-btn');
        const metric = button.dataset.metric;
        this.downloadChart(metric);
      }
    });

    // Download all reports button
    const downloadAllBtn = document.getElementById('downloadAllReports');
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', () => this.downloadAllReports());
    }
  }

  downloadChart(metricName) {
    const chart = this.charts[metricName];
    if (!chart) return;

    const link = document.createElement('a');
    link.download = `${metricName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = chart.toBase64Image('image/png', 1);
    link.click();
  }

  async downloadAllReports() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(22);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Scanning Reports', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
    
    let yPosition = 50;
    
    // Add each chart to the PDF
    for (const [index, metric] of this.reportsData.entries()) {
      if (index > 0 && index % 2 === 0) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const chart = this.charts[metric.name];
      if (chart) {
        const chartImage = chart.toBase64Image('image/png', 1);
        const imgWidth = pageWidth * 0.9;
        const imgHeight = (imgWidth * 0.6); // Maintain aspect ratio
        
        pdf.addImage(chartImage, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
        
        // Add metric name
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text(`${metric.name} (${metric.unit})`, 15, yPosition);
        yPosition += 10;
        
        // Add data table
        this.addDataTable(pdf, metric, yPosition);
        yPosition += 50;
      }
    }
    
    // Save the PDF
    pdf.save(`Scanning_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  addDataTable(pdf, metric, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const colWidth = pageWidth / 3;
    const rowHeight = 8;
    
    // Table header
    pdf.setFillColor(44, 62, 80);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(15, yPosition, colWidth, rowHeight, 'F');
    pdf.text('Date', 20, yPosition + 5);
    pdf.rect(15 + colWidth, yPosition, colWidth, rowHeight, 'F');
    pdf.text('Value', 20 + colWidth, yPosition + 5);
    
    // Table rows
    pdf.setTextColor(0, 0, 0);
    metric.data.forEach((row, index) => {
      const y = yPosition + (index + 1) * rowHeight;
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, y, colWidth * 2, rowHeight, 'F');
      }
      
      pdf.text(row.date, 20, y + 5);
      pdf.text(`${row.value} ${metric.unit}`, 20 + colWidth, y + 5);
    });
  }
}

// Initialize when script is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Make sure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return;
  }
  
  // Initialize scanning reports
  window.scanningReports = new ScanningReports();
  
  // Expose the ScanningReports class globally for debugging
  window.ScanningReports = ScanningReports;
});
