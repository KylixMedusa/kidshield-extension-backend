import { InsertOneResult, ObjectId, WithId } from "mongodb";

import Mongo from "../db";
import { AuthValidator, UserValidator } from "../validators";

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
  }: AuthValidator.RegisterRequest): Promise<
    InsertOneResult<UserValidator.User>
  > {
    const user = await Mongo.users().insertOne({
      name,
      email,
      password,
      ...defaultFields,
    });
    return user;
  }

  async getUser(userId: string): Promise<WithId<UserValidator.User>> {
    const user = await Mongo.users().findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateUser(
    userId: string,
    newData: UserValidator.UpdateUser
  ): Promise<WithId<UserValidator.User>> {
    const user = await Mongo.users().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: newData },
      { returnDocument: "after" }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
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
