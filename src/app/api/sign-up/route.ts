import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import { sendJsonResponse } from "@/lib/sendJsonResponse";
import UserModel from "@/model/User";
import { signUpSchema } from "@/schemas/signUpSchema";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // zod validation
    const result = signUpSchema.safeParse({ username, email, password });
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      const emailErrors = result.error.format().email?._errors || [];
      const passwordErrors = result.error.format().password?._errors || [];
      const errors = [...usernameErrors, ...emailErrors, ...passwordErrors];

      return sendJsonResponse({
        success: false,
        message:
          errors?.length > 0
            ? errors.join(", ")
            : "Invalid parameters",
        status: 400,
      });
    }

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return sendJsonResponse({
        success: false,
        message: "User already exists",
        status: 400
      });
    }

    const existingUserVerifiedByEmail = await UserModel.findOne({
      email,
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return sendJsonResponse({
          success: false,
          message: "User already exists with this email",
          status: 400,
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await existingUserVerifiedByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return sendJsonResponse({
        success: false,
        message: emailResponse.message,
        status: 500,
      });
    }

    return sendJsonResponse({
      success: true,
      message: "User registered successfully, verification email sent",
      status: 201,
    });
  } catch (error) {
    console.log("Error registering user", error);
    return sendJsonResponse({
      success: false,
      message: "Error registering user",
      status: 500,
    });
  }
}
