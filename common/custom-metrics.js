import { Counter } from 'k6/metrics';

const allErrors = new Counter('error_counter');

/**
 * This method count different types of error generated during test. This is different from error trend.
 * @param {boolean} checkResult represents result of check done on a HTTP request
 * @param {JSON} result represents output of HTTP request
 * @param {string} action represents type of CRUD operation
 */
export default function countDifferentErrors(checkResult, response, action) {
  console.log(`${response.status} error during ${action}`);
  allErrors.add(!checkResult, {
    errorType: `${response.status} error during ${action}`,
  });
};