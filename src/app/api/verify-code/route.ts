import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { sendJsonResponse } from "@/lib/sendJsonResponse";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        // validate with zod
        const result = verifySchema.safeParse({ code });

        if (!result.success) {
            const codeErrors = result.error.format().code?._errors || [];
            return sendJsonResponse({
                success: false,
                message:
                    codeErrors?.length > 0
                        ? codeErrors.join(", ")
                        : "Invalid parameters",

                status: 400,
            })
        }

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return sendJsonResponse({
                success: false,
                message: "User not found",
                status: 404,
            });
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return sendJsonResponse({
                success: true,
                message: "Account verified successfully",
                status: 200,
            });
        } else if (!isCodeNotExpired) {
            return sendJsonResponse({
                success: false,
                message: "Verification code expired, please sign up again",
                status: 400,
            });
        } else {
            return sendJsonResponse({
                success: false,
                message: "Invalid verification code",
                status: 400,
            });
        }
    } catch (error) {
        console.error("Error verifying user", error);
        return sendJsonResponse({
            success: false,
            message: "Error verifying user",
            status: 500,
        });
    }
}
