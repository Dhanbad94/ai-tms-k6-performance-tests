/**
* Gets the base URL for the TMS Rider API based on environment
* @param {string} env - Environment name (e.g., 'stag', 'prod', 'dev')
* @returns {string} - Base URL for the specified environment
*/
export function getRiderAppURL(env) {
  const environment = env.toLowerCase();
  switch (environment) {
  case "stag":
  case "staging":
  return "https://riderapp-stag.trackmyshuttle.com/rider/web/basic/v1";
  case "prod":
  case "production":
  return "https://riderapp.trackmyshuttle.com/rider/web/basic/v1";
  default:
  // Default to staging if env is not recognized
  console.log(`Unknown environment: ${env}. Using staging as default.`);
  return "https://riderapp-stag.trackmyshuttle.com/rider/web/basic/v1";
  }
  }
  /**
  * Gets the auth credentials for the specified environment
  * @param {string} env - Environment name (e.g., 'stag', 'prod', 'dev')
  * @returns {Object} - Auth credentials with username and password
  */
  export function getAuthCredentials(env) {
  const environment = env.toLowerCase();
  switch (environment) {
  case "stag":
  case "staging":
  return {
  username: "TMS-RIDER",
  password: "TMS@2468",
  };
  case "prod":
  case "production":
  return {
  username: "TMS-RIDER",
  password: "TMS@2468", // Replace with production credentials
  };
  default:
  // Default to staging if env is not recognized
  return {
  username: "TMS-RIDER",
  password: "TMS@2468",
  };
  }
  }
  