const jwt = require("jsonwebtoken");
const authenticateUser = require("../../middleware/authMiddleware");

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

describe("Authentication Middleware Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  test("Should allow access with a valid token in headers", () => {
    req.headers.authorization = "Bearer valid_token";
    const mockUser = { id: 1, email: "test@example.com" };
    
    // Mock jwt.verify to return the user
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    authenticateUser(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(mockUser);
  });

  test("Should allow access with a valid token in cookies", () => {
    req.cookies.token = "valid_cookie_token";
    const mockUser = { id: 2, email: "cookie@example.com" };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    authenticateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(2);
  });

  test("Should return 401 if no token is provided", () => {
    authenticateUser(req, res, next);

    const responseData = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(401);
    expect(responseData.message).toBe("Not authenticated");
    expect(next).not.toHaveBeenCalled();
  });

  test("Should return 403 if token is invalid", () => {
    req.headers.authorization = "Bearer expired_token";
    
    // Mock jwt.verify to return an error
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("invalid token"), null);
    });

    authenticateUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(responseData.message).toBe("Invalid token");
  });
});