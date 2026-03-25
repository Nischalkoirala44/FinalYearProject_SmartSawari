jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({}),
}));

const { registerUser, uploadProfilePicture } = require("../../controllers/userController");
const User = require("../../models/User");
const bcrypt = require("bcrypt");

// Mock for User Model
jest.mock("../../models/User", () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findByPk: jest.fn()
}));
jest.mock("bcrypt");

describe("Registration Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { 
      body: {}, 
      user: { id: 1 },
      file: null 
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("Should return 400 if any required field is missing", async () => {
    req.body = { name: "Nischal" };
    
    await registerUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "All fields are required including role"
    }));
  });
  
  test("Should return 400 if email is already registered", async () => {
    req.body = { 
      name: "Nischal", 
      email: "koiralanischal01@gmail.com", 
      mobile: "9829346882", 
      password: "123456", 
      role: "renter" 
    };
    
    // Use the mocked function
    User.findByEmail.mockResolvedValue({ id: 1 });

    await registerUser(req, res);
    console.log("Response Message Received:", res.json.mock.calls[0][0]);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already registered" });
  });
});
