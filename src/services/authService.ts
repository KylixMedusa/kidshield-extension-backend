import jwt from "jsonwebtoken";

import Mongo from "../db";
import { AuthValidator } from "../validators";
import { LoginExtensionResponse } from "../validators/auth";
import userService from "./userService";

class AuthService {
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }

  async login(email: string, password: string): Promise<string> {
    const user = await Mongo.users().findOne({
      email,
    });

    if (!user) {
      throw new Error("You're not registered! Please sign up.");
    }

    if (user.password !== password) {
      throw new Error("Wrong email or password");
    }

    return this.generateToken(user._id.toHexString());
  }

  async register({
    name,
    email,
    password,
  }: AuthValidator.RegisterRequest): Promise<any> {
    const userExists = await Mongo.users().findOne({
      email,
    });
    if (userExists) {
      throw new Error("User already exists");
    }

    const user = await userService.createUser({ name, email, password });

    return this.generateToken(user.insertedId.toHexString());
  }

  async loginExtension(
    email: string,
    password: string
  ): Promise<LoginExtensionResponse> {
    const user = await Mongo.users().findOne({
      email,
    });

    if (!user) {
      throw new Error("You're not registered! Please sign up.");
    }

    if (user.password !== password) {
      throw new Error("Wrong email or password");
    }

    return {
      token: this.generateToken(user._id.toHexString()),
      isExtensionEnabled: user.isExtensionEnabled,
      imageFilterMode: user.imageFilterMode,
    };
  }
}

export default new AuthService();
