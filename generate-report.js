const fs = require('fs');
const path = require('path');

// Get the most recent JSON file
const reportsDir = path.join(__dirname, 'dist', 'reports');
const jsonFiles = fs.readdirSync(reportsDir)
  .filter(file => file.endsWith('.json'))
  .map(file => ({
    name: file,
    path: path.join(reportsDir, file),
    time: fs.statSync(path.join(reportsDir, file)).mtime.getTime()
  }))
  .sort((a, b) => b.time - a.time);

if (jsonFiles.length === 0) {
  console.error('No JSON report files found');
  process.exit(1);
}

const latestJson = jsonFiles[0];
console.log(`Using latest report: ${latestJson.name}`);

try {
  // Read the file as text first
  const rawData = fs.readFileSync(latestJson.path, 'utf8');
  
  // Try to parse, cleanup if needed
  let jsonData;
  try {
    jsonData = JSON.parse(rawData);
  } catch (parseError) {
    console.log('JSON parse error, attempting to clean file...');
    // Basic cleanup - remove BOM and non-printable characters
    const cleaned = rawData
      .replace(/^\uFEFF/, '')  // Remove BOM
      .replace(/[^\x20-\x7E\s]/g, ''); // Keep only printable ASCII
    
    try {
      jsonData = JSON.parse(cleaned);
    } catch (secondError) {
      console.error('Failed to parse even after cleanup:', secondError);
      process.exit(1);
    }
  }

  // Generate a report filename with same base name but .html extension
  const htmlFileName = latestJson.name.replace('.json', '.html');
  const htmlPath = path.join(reportsDir, htmlFileName);
  
  // Create a basic HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>K6 Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1, h2 { color: #333; }
    .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
    .metric-card { background: #f0f0f0; border-radius: 8px; padding: 15px; min-width: 200px; text-align: center; }
    .metric-card.green { background: #d4edda; }
    .metric-card.red { background: #f8d7da; }
    .metric-card h3 { margin-top: 0; }
    .metric-card .value { font-size: 28px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>K6 Performance Test Results</h1>
  <p>Test executed at: ${new Date(jsonData.state?.testRunDurationMs ? Date.now() - jsonData.state.testRunDurationMs : Date.now()).toLocaleString()}</p>
  
  <div class="metrics">
    <div class="metric-card green">
      <h3>Total Requests</h3>
      <div class="value">${jsonData.metrics?.http_reqs?.values?.count || 'N/A'}</div>
    </div>
    
    <div class="metric-card ${jsonData.metrics?.http_req_failed?.values?.rate === 0 ? 'green' : 'red'}">
      <h3>Failed Requests</h3>
      <div class="value">${jsonData.metrics?.http_req_failed?.values?.rate ? 
        (jsonData.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%' : '0%'}</div>
    </div>
    
    <div class="metric-card ${jsonData.metrics?.checks?.fails === 0 ? 'green' : 'red'}">
      <h3>Failed Checks</h3>
      <div class="value">${jsonData.metrics?.checks?.fails || 0}</div>
    </div>
    
    <div class="metric-card">
      <h3>Duration</h3>
      <div class="value">${jsonData.state?.testRunDurationMs ? 
        (jsonData.state.testRunDurationMs / 1000).toFixed(1) + 's' : 'N/A'}</div>
    </div>
  </div>
  
  <h2>HTTP Request Metrics</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Avg</th>
      <th>Min</th>
      <th>Med</th>
      <th>p(90)</th>
      <th>p(95)</th>
      <th>Max</th>
    </tr>
    ${Object.entries(jsonData.metrics || {})
      .filter(([key]) => key.startsWith('http_req_') && key !== 'http_req_failed')
      .map(([key, data]) => `
        <tr>
          <td>${key.replace('http_req_', '')}</td>
          <td>${data.values?.avg ? data.values.avg.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.min ? data.values.min.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.med ? data.values.med.toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.['p(90)'] ? data.values['p(90)'].toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.['p(95)'] ? data.values['p(95)'].toFixed(2) + 'ms' : 'N/A'}</td>
          <td>${data.values?.max ? data.values.max.toFixed(2) + 'ms' : 'N/A'}</td>
        </tr>
      `).join('')}
  </table>
  
  <h2>Checks</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Passes</th>
      <th>Fails</th>
      <th>Rate</th>
    </tr>
    ${Object.entries(jsonData.root_group?.checks || {}).map(([name, data]) => `
      <tr>
        <td>${name}</td>
        <td>${data.passes}</td>
        <td>${data.fails}</td>
        <td>${data.passes && (data.fails + data.passes) > 0 ? 
          (data.passes / (data.passes + data.fails) * 100).toFixed(2) + '%' : '0%'}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
  `;
  
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML report generated: ${htmlPath}`);
  
} catch (error) {
  console.error('Error generating report:', error);
}
