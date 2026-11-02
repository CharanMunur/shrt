import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../lib/argon.js";
import { RegisterInput, LoginInput, ChangePasswordInput } from "../validators/auth.validator.js";
import { ThemePreference } from "../types/index.js";

export class AuthService {
  async register(input: RegisterInput) {
    const normalizedUsername = input.username.trim().toLowerCase();

    const existing = await User.findOne({ normalizedUsername });
    if (existing) {
      const error: any = new Error("Username is already taken.");
      error.status = 409;
      error.code = "USERNAME_EXISTS";
      throw error;
    }

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
      username: input.username.trim(),
      normalizedUsername,
      passwordHash,
      preferences: { theme: "system" },
    });

    return user.toJSON();
  }

  async login(input: LoginInput) {
    const normalizedUsername = input.username.trim().toLowerCase();

    // Use a generic error message to prevent user enumeration
    const invalidCredentialsError: any = new Error("Invalid username or password.");
    invalidCredentialsError.status = 401;
    invalidCredentialsError.code = "INVALID_CREDENTIALS";

    const user = await User.findOne({ normalizedUsername }).select("+passwordHash");
    if (!user) {
      throw invalidCredentialsError;
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw invalidCredentialsError;
    }

    return user.toJSON();
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      const error: any = new Error("User not found.");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    const isValid = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!isValid) {
      const error: any = new Error("Incorrect current password.");
      error.status = 400;
      error.code = "INVALID_CURRENT_PASSWORD";
      throw error;
    }

    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();
    return { success: true, message: "Password updated successfully." };
  }

  async updatePreferences(userId: string, theme: ThemePreference) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { "preferences.theme": theme } },
      { new: true }
    );
    if (!user) {
      const error: any = new Error("User not found.");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }
    return user.toJSON();
  }

  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      const error: any = new Error("User not found.");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }
    return user.toJSON();
  }
}

export const authService = new AuthService();
