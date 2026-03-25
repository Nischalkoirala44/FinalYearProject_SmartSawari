// Mock the DB and Models first to prevent background connections
jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({
    findAll: jest.fn(),
  }),
}));

jest.mock("../../models/Booking");
jest.mock("../../models/Vehicle");
jest.mock("../../models/Location");

const { getMyBookings } = require("../../controllers/bookingController");
const Booking = require("../../models/Booking");

describe("Renter Booking History Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 10 } // Mocked user from authentication middleware
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("Should fetch all bookings for the logged-in renter with vehicle details", async () => {
    const mockBookings = [
      {
        id: 1,
        bookingId: "SB-111",
        vehicleId: 5,
        vehicle: {
          registrationNumber: "BA-1-PA-1234",
          vehicleType: "Bike",
          location: { city: "Kathmandu", locationName: "Koteshwor" }
        }
      }
    ];

    // Mock the Sequelize findAll response
    Booking.findAll.mockResolvedValue(mockBookings);

    await getMyBookings(req, res);

    const responseData = res.json.mock.calls[0][0];
    console.log("Received Status Code:", res.status.mock.calls[0][0]);
    console.log("Total Bookings Found:", responseData.count);
    console.log("Received JSON Message:", JSON.stringify(responseData, null, 2));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(responseData.success).toBe(true);
    expect(responseData.count).toBe(1);
    expect(responseData.bookings[0].bookingId).toBe("SB-111");
    // Verify it used the correct userId from req.user
    expect(Booking.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { renterId: 10 }
    }));
  });
});