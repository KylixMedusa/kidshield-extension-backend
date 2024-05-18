import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Mongo from "../db";
import { AuthValidator } from "../validators";
import { LoginExtensionResponse, LoginResponse } from "../validators/auth";
import userService from "./userService";

class AuthService {
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await Mongo.users().findOne({
      email,
    });

    if (!user) {
      throw new Error("You're not registered! Please sign up.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Wrong email or password");
    }

    return {
      token: this.generateToken(user._id.toHexString()),
      user: {
        _id: user._id.toHexString(),
        name: user.name,
        email: user.email,
        isExtensionEnabled: user.isExtensionEnabled,
        imageFilterMode: user.imageFilterMode,
        filterStrictness: user.filterStrictness,
      },
    };
  }

  async register({
    name,
    email,
    password,
  }: AuthValidator.RegisterRequest): Promise<LoginResponse> {
    const userExists = await Mongo.users().findOne({
      email,
    });
    if (userExists) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const user = await userService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    return {
      token: this.generateToken(user._id),
      user,
    };
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
