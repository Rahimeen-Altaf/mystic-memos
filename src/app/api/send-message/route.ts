import dbConnect from "@/lib/dbConnect";
import { sendJsonResponse } from "@/lib/sendJsonResponse";
import UserModel, { Message } from "@/model/User";
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request) {
    await dbConnect();

    const { username, content } = await request.json();

    // zod validation
    const result = messageSchema.safeParse({ content });

    if (!result.success) {
        const contentErrors = result.error.format().content?._errors || [];

        return sendJsonResponse({
            success: false,
            message: contentErrors?.length > 0
                ? contentErrors.join(", ")
                : "Invalid parameters",
            status: 400,
        });
    }

    const user = await UserModel.findOne({ username })

    try {
        if (!user) {
            return sendJsonResponse({
                success: false,
                message: "User not found",
                status: 404,
            });
        }

        // is user accepting messages
        if (!user.isAcceptingMessages) {
            return sendJsonResponse({
                success: false,
                message: "User is not accepting messages",
                status: 403,
            });
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message);
        await user.save();

        return sendJsonResponse({
            success: true,
            message: "Message sent successfully",
            status: 200,
        });
    } catch (error) {
        console.log("Error sending message", error);
        return sendJsonResponse({
            success: false,
            message: "Error sending message",
            status: 500,
        });
    }
}