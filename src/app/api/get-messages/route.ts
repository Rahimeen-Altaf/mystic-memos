import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import { sendJsonResponse } from "@/lib/sendJsonResponse";
import mongoose from "mongoose";

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

    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ])

        if (!user || user.length === 0) {
            return sendJsonResponse({
                success: false,
                message: "user not found",
                status: 404,
            });
        }

        return sendJsonResponse({
            success: true,
            message: "User messages fetched successfully",
            dataName: "messages",
            dataValue: user[0].messages,
            status: 200,
        });
    } catch (error) {
        console.log("Unable to fetch user messages", error);
        return sendJsonResponse({
            success: false,
            message: "Unable to fetch user messages",
            status: 500,
        });
    }
}