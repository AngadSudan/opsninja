import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import actionController from "../controllers/action.controller";
import { authenticate } from "../middleware/authenticate";

const actionRouter = Router({ mergeParams: true });

actionRouter.use(authenticate);

actionRouter.get("/", async (req: Request, res: Response) => {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId) throw new Error("meetingId is required");

    const data = await actionController.getAllActions(meetingId);
    return res.json(apiResponse(200, "actions fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

actionRouter.post("/:actionId/execute", async (req: Request, res: Response) => {
  try {
    const actionId = req.params.actionId;
    if (!actionId) throw new Error("actionId is required");
    if (!req.body.proposal) throw new Error("proposal is required");
    if (!req.body.credentials) throw new Error("credentials is required");

    const data = await actionController.executeAction(
      actionId,
      req.user!.user_id,
      req.body.proposal,
      req.body.credentials,
    );
    return res.json(apiResponse(200, "action executed", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

actionRouter.patch("/:actionId", async (req: Request, res: Response) => {
  try {
    const actionId = req.params.actionId;
    if (!actionId) throw new Error("actionId is required");
    if (!req.body.action_status) throw new Error("action_status is required");

    const data = await actionController.updateActionStatus(actionId, {
      action_status: req.body.action_status,
      error_message: req.body.error_message,
    });
    return res.json(apiResponse(200, "action updated", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

export default actionRouter;
