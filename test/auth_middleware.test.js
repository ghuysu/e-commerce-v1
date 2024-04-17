const jwt = require('jsonwebtoken');
const authMiddleware = require("../src/middleware/auth");

describe('Auth middleware', () => {
    it("should throw error and set isAuth false if no authorization header is present", () => {
      const req = {
        get: jest.fn(headerName => undefined)
      };
      const next = jest.fn();
      authMiddleware(req, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(req.isAuth).toBe(false);
    });
  
    it("should throw error and set isAuth false if authorization header is just one word", () => {
      const req = {
        get: jest.fn(headerName => "xyz")
      };
      const next = jest.fn();
  
      authMiddleware(req, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(req.isAuth).toBe(false);
    });
  
    it("should throw error and set isAuth if verify failed", () => {
        const req = {
            get: jest.fn(headerName => "Bearer hihihihi")
        };
        const next = jest.fn();
      
        authMiddleware(req, {}, next);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(req.isAuth).toBe(false);
    });
  
    it("set isAuth true after decoding token", () => {
        const req = {
            get: jest.fn(headerName => "Bearer touyenlanguoiyeucuatoi")
          };
        const next = jest.fn();
        jest.spyOn(jwt, 'verify');
        jwt.verify.mockReturnValue({ userId: 'abc', storeId: 'acb'});
        authMiddleware(req, {}, next);
        expect(next).toHaveBeenCalled();
        expect(req.storeId).toBe("acb");
        expect(req.userId).toBe("abc");
        expect(req.isAuth).toBe(true);
        jest.restoreAllMocks();
    });
  });