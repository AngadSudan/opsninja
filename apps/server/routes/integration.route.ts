import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import integrationController from "../controllers/integration.controller";
import { authenticate } from "../middleware/authenticate";

const integrationRouter = Router();

integrationRouter.use(authenticate);

integrationRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const data = await integrationController.getMyIntegrations(req.user!.user_id);
    return res.json(apiResponse(200, "integrations fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

integrationRouter.delete("/:platform", async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform as "jira" | "slack" | "calendar";
    if (!["jira", "slack", "calendar"].includes(platform)) {
      throw new Error("platform must be jira, slack, or calendar");
    }

    const data = await integrationController.disconnectIntegration(req.user!.user_id, platform);
    return res.json(apiResponse(200, "integration disconnected", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

export default integrationRouter;
