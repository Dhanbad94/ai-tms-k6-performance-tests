import { sleep, fail } from 'k6';
import {
  randomItem,
  randomIntBetween,
} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';
/**
* Returns test configuration options for different test types
* @param {string} testType - Type of test (smoke, load, stress, soak)
* @returns {Object} - Test configuration options
*/
export function getTestOptions(testType) {
  const options = {
  smoke: {
  vus: 1,
  duration: '1m',
  thresholds: {
  http_req_duration: ['p(95)<1000'],
  'checks{name:guest}': ['rate>0.95'],
  'checks{name:request}': ['rate>0.95']
  }
  },
  load: {
  vus: 5,
  duration: '5m',
  thresholds: {
  http_req_duration: ['p(95)<1000'],
  'checks{name:guest}': ['rate>0.95'],
  'checks{name:request}': ['rate>0.95']
  }
  },
  stress: {
  vus: 10,
  duration: '10m',
  thresholds: {
  http_req_duration: ['p(95)<2000'],
  'checks{name:guest}': ['rate>0.9'],
  'checks{name:request}': ['rate>0.9']
  }
  },
  soak: {
  vus: 3,
  duration: '30m',
  thresholds: {
  http_req_duration: ['p(95)<1000'],
  'checks{name:guest}': ['rate>0.95'],
  'checks{name:request}': ['rate>0.95']
  }
  }
  };
  return options[testType.toLowerCase()] || options.smoke;
  }
  /**
  * Create stages for a multi-stage test
  * @param {string} testType - Type of test (smoke, load, stress, soak)
  * @returns {Array} - Array of stages for the test
  */
  export function getTestStages(testType) {
  const stages = {
  smoke: [
  { duration: '10s', target: 1 },
  { duration: '20s', target: 2 },
  { duration: '30s', target: 3 }
  ],
  load: [
  { duration: '1m', target: 5 },
  { duration: '2m', target: 5 },
  { duration: '1m', target: 10 },
  { duration: '2m', target: 10 },
  { duration: '1m', target: 0 }
  ],
  stress: [
  { duration: '2m', target: 5 },
  { duration: '3m', target: 10 },
  { duration: '2m', target: 15 },
  { duration: '3m', target: 20 },
  { duration: '1m', target: 0 }
  ],
  soak: [
  { duration: '1m', target: 3 },
  { duration: '28m', target: 3 },
  { duration: '1m', target: 0 }
  ]
  };
  return stages[testType.toLowerCase()] || stages.smoke;
  }
  