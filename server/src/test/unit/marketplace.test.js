// 1. Mock DB FIRST - Absolute top of the file
jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({
    findByPk: jest.fn(),
    findAll: jest.fn(),
  }),
}));

// 2. Mock Notification Service
jest.mock("../../utils/notificationService", () => ({
  sendNotification: jest.fn().mockResolvedValue(true),
}));

const Vehicle = require("../../models/Vehicle");
const { approveVerification, rejectVerification } = require("../../controllers/verificationController");

// 3. Mock the Vehicle Model methods
jest.mock("../../models/Vehicle", () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
}));

describe("Marketplace & Verification Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("Should approve verification successfully", async () => {
    req.params.id = 55;
    
    const mockVerification = {id: 55, userId: 10, status: "pending", remarks: "",
      save: jest.fn().mockResolvedValue(true)
    };

    Vehicle.findByPk.mockResolvedValue(mockVerification);
    await approveVerification(req, res);
    
    expect(mockVerification.status).toBe("approved");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Verification approved"
    }));
  });

  /*
  test("Should reject verification with admin remarks", async () => {
    req.params.id = 55;
    req.body = { remarks: "Documents are blurry" };
    
    const mockVerification = {
      id: 55,
      userId: 10,
      status: "pending",
      remarks: "",
      save: jest.fn().mockResolvedValue(true)
    };

    Vehicle.findByPk.mockResolvedValue(mockVerification);

    await rejectVerification(req, res);

    expect(mockVerification.status).toBe("rejected");
    expect(mockVerification.remarks).toBe("Documents are blurry");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Verification rejected"
    }));
  });

  test("Should return 404 if verification ID does not exist", async () => {
    req.params.id = 999;
    Vehicle.findByPk.mockResolvedValue(null);

    await approveVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Verification not found"
    }));
  });
  */
});