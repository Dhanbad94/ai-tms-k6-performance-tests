import {
  jUnit,
  textSummary,
} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export default function reporter(data, type, env, path, feature) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [`./dist/reports/${env}-${feature}-${path}-${type}-result.xml`]: jUnit(data),
    [`./dist/reports/${env}-${feature}-${path}-${type}-result.json`]: JSON.stringify(
      data,
      null,
      2,
    ),
    [`./dist/reports/${env}-${feature}-${path}-${type}-result.html`]:
      htmlReport(data),
  };
}