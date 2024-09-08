import dbConnect from "@/lib/dbConnect";
import { sendJsonResponse } from "@/lib/sendJsonResponse";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !user) {
        return sendJsonResponse({
            success: false,
            message: "You are not authenticated",
            status: 401,
        });
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessages: acceptMessages }, { new: true });
        if (!updatedUser) {
            return sendJsonResponse({
                success: false,
                message: "failed to update user status to accept messages",
                status: 404,
            });
        } else {
            return sendJsonResponse({
                success: true,
                message: "User acceptance status updated successfully",
                dataName: "updatedUser",
                dataValue: updatedUser,
                status: 200,
            });
        }

    } catch (error) {
        console.log("failed to update user status to accept messages");
        return sendJsonResponse({
            success: false,
            message: "Failed to update user status to accept messages",
            status: 500,
        });
    }

}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !user) {
        return sendJsonResponse({
            success: false,
            message: "You are not authenticated",
            status: 401,
        });
    }

    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return sendJsonResponse({
                success: false,
                message: "User not found",
                status: 404,
            });
        }

        return sendJsonResponse({
            success: true,
            message: "message acceptance status found",
            dataName: "isAcceptingMessages",
            dataValue: foundUser.isAcceptingMessages,
            status: 200,
        });
    } catch (error) {
        console.log("Error in getting message acceptance status");
        return sendJsonResponse({
            success: false,
            message: "Error in getting message acceptance status",
            status: 500,
        });
    }
}