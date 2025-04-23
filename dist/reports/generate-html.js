const fs = require('fs');
const path = require('path');

// Get command line arguments
const jsonPath = process.argv[2];
const htmlPath = process.argv[3];

if (!jsonPath || !htmlPath) {
  console.error('Usage: node generate-html.js <json-file> <html-file>');
  process.exit(1);
}

try {
  // Read the JSON file
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Create a simple HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>K6 Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .dashboard { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
    .metric-card { background: #f5f5f5; border-radius: 8px; padding: 15px; text-align: center; flex: 1; min-width: 200px; }
    .metric-card.pass { background: #dff0d8; }
    .metric-card.fail { background: #f2dede; }
    .metric-card h2 { margin-top: 0; }
    .metric-card .value { font-size: 36px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:hover { background-color: #f5f5f5; }
    .threshold-pass { color: green; }
    .threshold-fail { color: red; }
  </style>
</head>
<body>
  <h1>K6 Performance Test Results</h1>
  
  <div class="dashboard">
    <div class="metric-card ${jsonData.metrics.iterations.values.count > 0 ? 'pass' : 'fail'}">
      <h2>Total Iterations</h2>
      <div class="value">${jsonData.metrics.iterations.values.count || 0}</div>
    </div>
    
    <div class="metric-card ${(jsonData.metrics.checks?.passes || 0) > 0 ? 'pass' : 'fail'}">
      <h2>Checks Passed</h2>
      <div class="value">${jsonData.metrics.checks?.passes || 0}</div>
    </div>
    
    <div class="metric-card ${(jsonData.metrics.checks?.fails || 0) === 0 ? 'pass' : 'fail'}">
      <h2>Checks Failed</h2>
      <div class="value">${jsonData.metrics.checks?.fails || 0}</div>
    </div>
    
    <div class="metric-card">
      <h2>Duration</h2>
      <div class="value">${Math.round(jsonData.state.testRunDurationMs / 1000)}s</div>
    </div>
  </div>

  <h2>HTTP Metrics</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
      <th>95th Percentile</th>
      <th>99th Percentile</th>
      <th>Max</th>
    </tr>
    ${Object.entries(jsonData.metrics)
      .filter(([key]) => key.startsWith('http_req'))
      .map(([key, data]) => `
        <tr>
          <td>${key}</td>
          <td>${data.values?.avg ? data.values.avg.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.p(95) ? data.values['p(95)'].toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.p(99) ? data.values['p(99)'].toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.max ? data.values.max.toFixed(2) + 'ms' : 'N/A'}</td>
        </tr>
      `).join('')}
  </table>

  <h2>Thresholds</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Status</th>
    </tr>
    ${Object.entries(jsonData.metrics)
      .filter(([_, data]) => data.thresholds)
      .flatMap(([key, data]) => 
        Object.entries(data.thresholds).map(([threshold, result]) => `
          <tr>
            <td>${key}: ${threshold}</td>
            <td class="${result.ok ? 'threshold-pass' : 'threshold-fail'}">${result.ok ? 'PASS' : 'FAIL'}</td>
          </tr>
        `)
      ).join('')}
  </table>

  <h2>Checks</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Passes</th>
      <th>Fails</th>
      <th>Pass Rate</th>
    </tr>
    ${Object.entries(jsonData.root_group.checks || {}).map(([name, data]) => `
      <tr>
        <td>${name}</td>
        <td>${data.passes}</td>
        <td>${data.fails}</td>
        <td>${(data.passes / (data.passes + data.fails) * 100).toFixed(2)}%</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
  `;
  
  // Write the HTML file
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML report generated at: ${htmlPath}`);
} catch (error) {
  console.error('Error generating HTML report:', error);
  process.exit(1);
}
