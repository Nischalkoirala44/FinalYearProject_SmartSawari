
jest.mock("../../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    findByPk: jest.fn(),
  }),
  QueryTypes: { SELECT: 'SELECT', INSERT: 'INSERT' }
}));


const { loginUser } = require("../../controllers/authController");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Authentication Unit Tests (Login)", () => {
  let req, res;

beforeEach(() => {
    console.log("--- Setup: Resetting Request and Response objects ---");
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // Test Case: Login with wrong email
  test("Should return 400 if user email is not found in database", async () => {
    req.body = { email: "test@gmail.com", password: "wrong123" };
    
    // Mock: Database returns null
    User.findByEmail.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User does not exist" });
  });

  // Test Case: Invalid Password
  test("Should return 400 if password does not match", async () => {
    req.body = { email: "koiralanischal01@gmail.com", password: "wrongpassword" };
    
    const mockUser = { id: 1, email: "koiralanischal01@gmail.com", password: "hashed_password" };
    User.findByEmail.mockResolvedValue(mockUser);
    
    // Mock: Bcrypt says "False" (no match)
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
  });

  // Test Case: Success Case
  test("Should return 200 and token on successful login", async () => {
    req.body = { email: "koiralanischal01@gmail.com", password: "12345678" };
    
    const mockUser = { id: 5, name: "Test User", email: "koiralanischal01@gmail.com", password: "hashed", role: "owner" };
    User.findByEmail.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mock_token_xyz");

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Login successful",
      token: "mock_token_xyz"
    }));
  });

});
