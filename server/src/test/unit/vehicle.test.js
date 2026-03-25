// 1. SILENCE THE DATABASE
jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({
    findAll: jest.fn(),
  }),
  Op: { lte: 'lte', gte: 'gte', and: 'and' }
}));

jest.mock("../../models/Vehicle");
jest.mock("../../models/Booking");
jest.mock("../../models/Location");

const { getApprovedVehicles } = require("../../controllers/vehicleController");
const Vehicle = require("../../models/Vehicle");

describe("Vehicle Fetching Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("Should fetch approved vehicles and mark availability correctly", async () => {
    // Mocking two vehicles: one with an active booking and one without
    const mockVehicles = [
      {
        id: 1,
        status: "approved",
        toJSON: function() { return { id: 1, status: "approved", bookings: [{ id: 101 }] }; }
      },
      {
        id: 2,
        status: "approved",
        toJSON: function() { return { id: 2, status: "approved", bookings: [] }; }
      }
    ];

    Vehicle.findAll.mockResolvedValue(mockVehicles);

    await getApprovedVehicles(req, res);

    const responseData = res.json.mock.calls[0][0];
    console.log("Received JSON Message:", JSON.stringify(responseData, null, 2));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(responseData.vehicles[0].currentAvailability).toBe("booked");
    expect(responseData.vehicles[1].currentAvailability).toBe("available");
  });
});