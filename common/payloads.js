import faker from "https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js";

/**
 * Generate Guest User Request Payload
 * @returns {string} - JSON string for guest user creation
 */
export function createGuestUserPayload() {
  const payload = {
    device_id: "1",
    device_token: "1",
    device_type: 1,
    device_version: "1",
    platform: 1,
    device_model: "1",
    device_ip_address: "1",
    app_version: "1",
    uuid: "1",
  };
  return JSON.stringify(payload);
}

/**
 * Get a random stop ID from the available list
 * @returns {number} - Random stop ID
 */
function getRandomStopId() {
  const stopIds = [137, 3211, 7180, 1025, 1496, 7178, 7179];
  return stopIds[Math.floor(Math.random() * stopIds.length)];
}

/**
 * Get the current date and time information for booking
 * @returns {Object} - Object containing properly formatted date and time
 */
function getValidDateAndTime() {
  const now = new Date();

  // Add at least 30 minutes (to be safe) plus random minutes (0-240 mins)
  const futureTime = new Date(
    now.getTime() + 30 * 60 * 1000 + Math.random() * 240 * 60 * 1000
  );

  // Format as YYYY-MM-DD for pickup_date
  const year = futureTime.getFullYear();
  const month = (futureTime.getMonth() + 1).toString().padStart(2, "0");
  const day = futureTime.getDate().toString().padStart(2, "0");
  const pickup_date = `${year}-${month}-${day}`;

  // Format as HH:MM:00 for pickup_time
  const hours = futureTime.getHours().toString().padStart(2, "0");
  const minutes = futureTime.getMinutes().toString().padStart(2, "0");
  const pickup_time = `${hours}:${minutes}:00`;

  return { pickup_date, pickup_time };
}

/**
 * Generate random 10-digit phone number
 * @returns {number} - 10-digit phone number as a number
 */
function getRandomPhoneNumber() {
  // Ensure first digit isn't 0
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  let phone = firstDigit.toString();

  // Add 9 more random digits
  for (let i = 0; i < 9; i++) {
    phone += Math.floor(Math.random() * 10).toString();
  }

  return parseInt(phone);
}

/**
 * Generate Create Request Payload
 * @param {string} guestToken - Bearer token for authorization
 * @returns {string} - JSON string for the create request
 */
export function createRequestPayload(guestToken) {
  // Get two different random stop IDs for pickup and dropoff
  let pickupId = getRandomStopId();
  let dropoffId = getRandomStopId();

  // Ensure pickup and dropoff are different
  while (dropoffId === pickupId) {
    dropoffId = getRandomStopId();
  }

  // Get valid date and time for booking
  const { pickup_date, pickup_time } = getValidDateAndTime();

  const payload = {
    riders: {
      name: faker.name.findName(),
      country: 91,
      phone: getRandomPhoneNumber(),
      total_riders: Math.floor(Math.random() * 6) + 1, // 1-6 riders
      ada: Math.random() > 0.5, // Random boolean
      note: "I am a new rider on TMS platform.",
      room_no: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${
        Math.floor(Math.random() * 900) + 100
      }`, // Random room like A-500
      flight_no: `T-${Math.floor(Math.random() * 9000) + 1000}`, // Random flight number
      rider_type: "Guest",
    },
    pickup_stop: { id: pickupId },
    dropoff_stop: { id: dropoffId },
    booking: {
      pickup_time: pickup_time,
      pickup_date: pickup_date,
      slot_id: null,
    },
  };

  return JSON.stringify(payload);
}