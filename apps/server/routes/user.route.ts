import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import userController from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const data = await userController.getMe(req.user!.user_id);
    return res.json(apiResponse(200, "user fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

userRouter.put("/me", async (req: Request, res: Response) => {
  try {
    const data = await userController.updateMe(req.user!.user_id, {
      user_name: req.body.user_name,
      profile_pic: req.body.profile_pic,
    });
    return res.json(apiResponse(200, "user updated", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

userRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) throw new Error("id is required");

    const data = await userController.getUserById(userId);
    return res.json(apiResponse(200, "user fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

export default userRouter;
