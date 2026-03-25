// 1. SILENCE THE DATABASE - This must be at the very top
jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  }),
  QueryTypes: { SELECT: 'SELECT' },
  Op: { lte: 'lte', gte: 'gte', and: 'and' }
}));

// 2. Mock all model dependencies
jest.mock("../../models/Booking");
jest.mock("../../models/Vehicle");
jest.mock("../../models/User");
jest.mock("../../models/Notification");

const { createBookingIntent, releasePartialAmount } = require("../../controllers/bookingController");
const Booking = require("../../models/Booking");
const User = require("../../models/User");

describe("Booking & Financial Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    
    // Setup environment variables for eSewa
    process.env.ESEWA_SECRET_KEY = "8g7h3w9charter";
    process.env.ESEWA_PRODUCT_CODE = "EPAYTEST";
  });

  test("Should create booking intent and return eSewa signature", async () => {
    req.body = {
      vehicleId: 10,
      renterId: 1,
      startDate: "2026-04-01",
      endDate: "2026-04-05",
      totalAmount: 5000,
    };

    Booking.findOne.mockResolvedValue(null);
    Booking.create.mockResolvedValue({ id: 1 });

    await createBookingIntent(req, res);

    const responseData = res.json.mock.calls[0][0];
    console.log("Received JSON Message:", JSON.stringify(responseData, null, 2));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(responseData.success).toBe(true);
    expect(responseData).toHaveProperty("signature");
  });

  test("Should fail if vehicle is already booked", async () => {
    req.body = { vehicleId: 10, startDate: "2026-04-01", endDate: "2026-04-05" };

    Booking.findOne.mockResolvedValue({
      startDate: "2026-04-02",
      endDate: "2026-04-06",
    });

    await createBookingIntent(req, res);

    const responseData = res.json.mock.calls[0][0];
    console.log("Status: ", res.status.mock.calls[0][0]);
    console.log("Received JSON Message:", JSON.stringify(responseData, null, 2));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(responseData.success).toBe(false);
  });
});