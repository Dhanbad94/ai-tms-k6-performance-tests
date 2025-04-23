import http from "k6/http";
import { check } from "k6";
import encoding from "k6/encoding";
import { createGuestUserPayload } from "../common/payloads.js";
import { getRiderAppURL, getAuthCredentials } from "../common/getURL.js";
// Current environment - can be passed as a parameter or set from an environment variable
const ENV = __ENV.ENVIRONMENT || "stag";
// Get the base URL and auth credentials for the current environment
const BASE_URL = getRiderAppURL(ENV);
const AUTH = getAuthCredentials(ENV);
/**
* Generates a base64 encoded Basic Auth string
* @param {string} username - Username for basic auth
* @param {string} password - Password for basic auth
* @returns {string} - Base64 encoded auth string
*/
function encodeBase64(username, password) {
return encoding.b64encode(`${username}:${password}`);
}
/**
* Gets a guest user token through the API
* @returns {string|null} - Guest token if successful, null otherwise
*/
export function getGuestToken() {
const guestRes = http.post(
`${BASE_URL}/guest-user`,
createGuestUserPayload(),
{
headers: {
Authorization: `Basic ${encodeBase64(AUTH.username, AUTH.password)}`,
"Content-Type": "application/json",
},
tags: { name: "guest" },
}
);
check(
guestRes,
{
"Guest token request successful": (r) => r.status === 200,
},
{ name: "guest" }
);
if (guestRes.status !== 200) {
return null;
}
try {
const responseBody = JSON.parse(guestRes.body);
return responseBody?.response?.token || null;
} catch (e) {
return null;
}
}
/**
* Returns the base URL for the API
* @returns {string} - The base URL
*/
export function getBaseUrl() {
return BASE_URL;
}
/**
* Returns the current environment name
* @returns {string} - The current environment name
*/
export function getEnvironment() {
return ENV;
}