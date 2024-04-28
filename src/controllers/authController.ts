import { Request } from "express";

import authService from "../services/authService";
import {
  ResponseGenerator,
  ResponseStatus,
  ResponseWithBody,
} from "../utils/ResponseGenerator";
import { AuthValidator } from "../validators";

class AuthController {
  async login(
    req: Request<any, any, AuthValidator.LoginRequest>,
    res: ResponseWithBody<AuthValidator.LoginResponse>
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      ResponseGenerator.sendResponse(res, 200, "Success", { token });
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }
  async register(
    req: Request<any, any, AuthValidator.RegisterRequest>,
    res: ResponseWithBody<AuthValidator.RegisterResponse>
  ): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const token = await authService.register({ name, email, password });
      ResponseGenerator.sendResponse(res, 200, "User created successfully!", {
        token,
      });
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }
}

export default new AuthController();
