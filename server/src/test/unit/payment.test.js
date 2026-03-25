jest.mock("../../models/Notification", () => ({
  create: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../models/Vehicle", () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
}));

// Mocking all dependencies
jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  }),
}));

jest.mock("../../models/Booking");
jest.mock("../../models/Notification");
jest.mock("../../models/Vehicle");

const { verifyEsewaPayment, getOwnerEarnings, cancelBooking } = require("../../controllers/bookingController");
const Booking = require("../../models/Booking");

describe("Final Business Logic Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, user: { id: 10 }, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ESEWA VERIFICATION
  /*
  test("Should decode eSewa data and confirm booking", async () => {
    const mockPayload = JSON.stringify({
      status: "COMPLETE",
      transaction_uuid: "SB-12345",
      transaction_code: "TXN_999"
    });
    req.query.data = Buffer.from(mockPayload).toString("base64");

    const mockBooking = { 
        paymentStatus: "pending", 
        update: jest.fn().mockResolvedValue(true),
        renterId: 5
    };
    Booking.findOne.mockResolvedValue(mockBooking);

    await verifyEsewaPayment(req, res);

    console.log("Decoded Payload:", JSON.parse(Buffer.from(req.query.data, "base64").toString("utf-8")));

    expect(mockBooking.update).toHaveBeenCalledWith(expect.objectContaining({
      paymentStatus: "paid",
      bookingStatus: "confirmed"
    }));
    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("payment-success"));
  });
  */

  /*
  // OWNER EARNINGS (90% CALCULATION)
  test("Should calculate 90% share correctly for owner stats", async () => {
    const mockStats = [
      { totalAmount: "1000", amountReleased: true },  // Owner cut: 900
      { totalAmount: "2000", amountReleased: false } // Owner cut: 1800
    ];
    Booking.findAll.mockResolvedValue(mockStats);

    await getOwnerEarnings(req, res);

    const responseData = res.json.mock.calls[0][0];
    console.log("Received JSON Message:", JSON.stringify(responseData, null, 2));
    expect(responseData.data.totalLifetime).toBe(2700); // (900 + 1800)
    expect(responseData.data.alreadyReleased).toBe(900);
  });
  */

  // CANCELLATION PROTECTION
  test("Should block cancellation if trip has already started", async () => {
    req.params.bookingId = "SB-123";
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday

    Booking.findOne.mockResolvedValue({
      startDate: pastDate.toISOString(),
      renterId: 10
    });

    await cancelBooking(req, res);

    console.log("Received Status Code:", res.status.mock.calls[0][0]);
    console.log("Received JSON Message:", JSON.stringify(res.json.mock.calls[0][0], null, 2));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Cannot cancel a trip that has already started."
    }));
  });
});

