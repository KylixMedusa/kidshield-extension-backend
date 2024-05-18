import userService from "../services/userService";
import {
  RequestWithAuth,
  ResponseGenerator,
  ResponseStatus,
  ResponseWithBody,
} from "../utils/ResponseGenerator";
import { UserValidator } from "../validators";
import { UserResponse } from "../validators/user";

class UserController {
  async read(req: RequestWithAuth, res: ResponseWithBody<UserResponse>) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      const user = await userService.getUser(req.userId);
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "Success",
        user
      );
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.NOT_FOUND,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }

  async update(
    req: RequestWithAuth<any, any, UserValidator.UpdateUser>,
    res: ResponseWithBody<UserResponse>
  ) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      const user = await userService.updateUser(req.userId, req.body);
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "User updated successfully!",
        user
      );
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }

  async delete(req: RequestWithAuth, res: ResponseWithBody<boolean>) {
    if (!req.userId) {
      return ResponseGenerator.sendResponse(
        res,
        ResponseStatus.FORBIDDEN,
        "Forbidden"
      );
    }

    try {
      await userService.deleteUser(req.userId);
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.SUCCESS,
        "User deleted successfully!",
        true
      );
    } catch (error) {
      ResponseGenerator.sendResponse(
        res,
        ResponseStatus.BAD_REQUEST,
        ResponseGenerator.getErrorMessage(error)
      );
    }
  }
}

export default new UserController();
