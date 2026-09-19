import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import messageController from "../controllers/message.controller";
import { authenticate } from "../middleware/authenticate";

const messageRouter = Router({ mergeParams: true });

messageRouter.use(authenticate);

messageRouter.post("/", async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) throw new Error("chatId is required");
    if (!req.body.message?.trim()) throw new Error("message is required");

    const data = await messageController.sendMessage(
      chatId,
      req.body.message,
      req.body.jira_credentials,
      req.body.slack_credentials,
    );
    return res.json(apiResponse(200, "message sent", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

messageRouter.get("/", async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) throw new Error("chatId is required");

    const data = await messageController.getAllMessages(chatId);
    return res.json(apiResponse(200, "messages fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

export default messageRouter;
