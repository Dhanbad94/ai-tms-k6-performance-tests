import http from "k6/http";
import { check, sleep } from "k6";
import { createRequestPayload } from "../common/payloads.js";
import { getGuestToken, getBaseUrl } from "../common/consumer-Login.js";
import { getTestOptions, getTestStages } from "../common/helpers.js";

// Current test type - can be passed as a parameter or set from environment variable
const TEST_TYPE = __ENV.type || 'smoke';

// Test options based on test type
export const options = {
  stages: getTestStages(TEST_TYPE),
  thresholds: getTestOptions(TEST_TYPE).thresholds,
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)']
};

export default function() {
  // Step 1: Get a guest token using the common login module
  const guestToken = getGuestToken();
  
  if (!guestToken) {
    return; // Exit early if authentication failed
  }
  
  // Step 2: Create Request with Bearer Token
  const requestPayload = createRequestPayload(guestToken);
  
  // Extract stop IDs for error reporting
  let pickupId, dropoffId;
  try {
    const payloadObj = JSON.parse(requestPayload);
    pickupId = payloadObj.pickup_stop.id;
    dropoffId = payloadObj.dropoff_stop.id;
  } catch (e) {}
  
  const requestRes = http.post(
    `${getBaseUrl()}/request/1`,
    requestPayload,
    {
      headers: {
        Authorization: `Bearer ${guestToken}`,
        "token-id": "77777",
        "Content-Type": "application/json",
      },
      tags: { name: 'request' }
    }
  );
  
  // Only log specific error about invalid stops
  if (requestRes.status === 400) {
    try {
      const errorResponse = JSON.parse(requestRes.body);
      if (errorResponse.response?.errors === "Provided stops are not valid") {
        console.error(`Invalid stop combination: pickup=${pickupId}, dropoff=${dropoffId}`);
      }
    } catch (e) {}
  }
  
  check(requestRes, {
    "Create request successful": (r) => r.status === 200,
  }, { name: 'request' });
  
  // Sleep between request cycles - duration based on test type
  if (TEST_TYPE === 'stress' || TEST_TYPE === 'soak') {
    // Shorter sleep for stress and soak tests
    sleep(1);
  } else {
    // Longer sleep for smoke and load tests
    sleep(3);
  }
}
