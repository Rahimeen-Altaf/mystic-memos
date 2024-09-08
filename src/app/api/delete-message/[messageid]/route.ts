import dbConnect from "@/lib/dbConnect";
import { sendJsonResponse } from "@/lib/sendJsonResponse";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid;

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

    try {
        const updateResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageId } } }
        );

        if (updateResult.modifiedCount === 0) {
            return sendJsonResponse({
                success: false,
                message: "Message not found or already deleted",
                status: 404,
            });
        }

        return sendJsonResponse({
            success: true,
            message: "Message deleted successfully",
            status: 200,
        });

    } catch (error) {
        console.log("Unable to delete message", error);
        return sendJsonResponse({
            success: false,
            message: "Unable to delete message",
            status: 500,
        });
    }
}