import { compare } from "bcryptjs";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: "3d", // explicit string — jsonwebtoken treats plain numbers as seconds, not ms
  });
};

export const signup = async (request, response, next) => {
  try {
    const { email, password } = request.body;

    const existing = await User.exists({ email });
    if (existing) {
      return response
        .status(409)
        .send("An account with this email already exists.");
    }

    const user = await User.create({ email, password });

    const isProduction = process.env.NODE_ENV === "production";

    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      httpOnly: true,
    });
    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        //   firstName: user.firstName,
        //   lastName: user.lastName,
        //   image: user.image,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    // MongoDB duplicate-key error — do NOT echo the email back
    if (error.code === 11000) {
      return response
        .status(409)
        .send("An account with this email already exists.");
    }
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).send("Invalid Email or Password");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(400).send("Invalid Email or Password");
    }
    const isProduction = process.env.NODE_ENV === "production";

    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      httpOnly: true,
    });
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.colors,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (request, response, next) => {
  try {
    const userData = await User.findById(request.userId);
    if (!userData) {
      return response.status(404).send("User Not Found");
    }

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.colors,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (request, response, next) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        colors: color,
        profileSetup: true,
      },
      { new: true, runValidators: true },
    );

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.colors,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const addProfileImage = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is Required.");
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + request.file.originalname;
    renameSync(request.file.path, fileName);

    // ── Delete old image from disk before saving the new one ──────────────
    const existingUser = await User.findById(request.userId);
    if (existingUser?.image) {
      try {
        unlinkSync(existingUser.image);
      } catch (unlinkErr) {
        // File may have been manually deleted — log and continue
        console.warn(
          "[addProfileImage] Could not delete old image:",
          unlinkErr.message,
        );
      }
    }

    const updateUser = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true },
    );

    return response.status(200).json({
      image: updateUser.image,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const removeProfileImage = async (request, response, next) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).send("User Not Found.");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return response.status(200).send("Profile Image Removed Successfully");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const logOut = async (request, response, next) => {
  try {
    response.cookie("jwt", "", {
      maxAge: 1,
      secure: true,
      sameSite: "None",
      httpOnly: true,
    });
    return response.status(200).send("Logout Successfull.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
