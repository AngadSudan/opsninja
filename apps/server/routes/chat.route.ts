import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import chatController from "../controllers/chat.controller";
import { authenticate } from "../middleware/authenticate";

const chatRouter = Router({ mergeParams: true });

chatRouter.use(authenticate);

chatRouter.post("/", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) throw new Error("projectId is required");

    const data = await chatController.createChat(projectId, {
      chat_name: req.body.chat_name,
      created_by: req.user!.user_id,
    });
    return res.json(apiResponse(200, "chat created", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

chatRouter.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) throw new Error("projectId is required");

    const data = await chatController.getAllChats(projectId);
    return res.json(apiResponse(200, "chats fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

chatRouter.get("/:chatId", async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) throw new Error("chatId is required");

    const data = await chatController.getChat(chatId);
    return res.json(apiResponse(200, "chat fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

chatRouter.delete("/:chatId", async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) throw new Error("chatId is required");

    const data = await chatController.deleteChat(chatId);
    return res.json(apiResponse(200, "chat deleted", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

export default chatRouter;
