import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

import Mongo from "../db";
import { AuthValidator, UserValidator } from "../validators";
import { UserResponse } from "../validators/user";

const defaultFields: Omit<UserValidator.User, "email" | "password" | "name"> = {
  isExtensionEnabled: false,
  filterStrictness: 100,
  imageFilterMode: "blur",
};

class UserService {
  async createUser({
    name,
    email,
    password,
  }: AuthValidator.RegisterRequest): Promise<UserResponse> {
    const user = await Mongo.users().insertOne({
      name,
      email,
      password,
      ...defaultFields,
    });

    const fetchedUser = await Mongo.users().findOne({
      _id: user.insertedId,
    });

    if (!fetchedUser) {
      throw new Error("Error creating user");
    }

    return {
      _id: fetchedUser._id.toHexString(),
      name: fetchedUser.name,
      email: fetchedUser.email,
      filterStrictness: fetchedUser.filterStrictness,
      imageFilterMode: fetchedUser.imageFilterMode,
      isExtensionEnabled: fetchedUser.isExtensionEnabled,
    };
  }

  async getUser(userId: string): Promise<UserResponse> {
    const user = await Mongo.users().findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      _id: user._id.toHexString(),
      name: user.name,
      email: user.email,
      filterStrictness: user.filterStrictness,
      imageFilterMode: user.imageFilterMode,
      isExtensionEnabled: user.isExtensionEnabled,
    };
  }

  async updateUser(
    userId: string,
    newData: UserValidator.UpdateUser
  ): Promise<UserResponse> {
    const dataToUpdate: Partial<UserValidator.UpdateUser> = {
      ...newData,
    };

    if (newData.password) {
      const hashedPassword = await bcrypt.hash(newData.password, 5);

      dataToUpdate.password = hashedPassword;
    }

    const user = await Mongo.users().findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: dataToUpdate,
      },
      {
        returnDocument: "after",
      }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return {
      _id: user._id.toHexString(),
      name: user.name,
      email: user.email,
      filterStrictness: user.filterStrictness,
      imageFilterMode: user.imageFilterMode,
      isExtensionEnabled: user.isExtensionEnabled,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await Mongo.users().deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }

    return;
  }
}

export default new UserService();
