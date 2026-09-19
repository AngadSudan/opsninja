import userRepository from "../repository/user.repository";
import type { User, UpdateUserDTO } from "../utils/type";

class UserController {
  async getMe(userId: string): Promise<User> {
    if (!userId) throw new Error("userId is required");

    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error("user not found");

    return user;
  }

  async updateMe(userId: string, updates: UpdateUserDTO): Promise<User> {
    if (!userId) throw new Error("userId is required");

    const existing = await userRepository.findUserById(userId);
    if (!existing) throw new Error("user not found");

    const updated = await userRepository.updateUser(userId, updates);
    if (!updated) throw new Error("failed to update user");

    return updated;
  }

  async getUserById(userId: string): Promise<User> {
    if (!userId) throw new Error("userId is required");

    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error("user not found");

    return user;
  }
}

export default new UserController();
