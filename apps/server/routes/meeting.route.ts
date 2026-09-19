import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import meetingController from "../controllers/meeting.controller";
import { authenticate } from "../middleware/authenticate";

const meetingRouter = Router({ mergeParams: true });

meetingRouter.use(authenticate);

meetingRouter.post("/", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) throw new Error("projectId is required");
    if (!req.body.meeting_platform) throw new Error("meeting_platform is required");
    if (!req.body.original_transcript?.trim()) throw new Error("original_transcript is required");

    const data = await meetingController.uploadTranscript(projectId, {
      uploaded_by: req.user!.user_id,
      meeting_platform: req.body.meeting_platform,
      original_transcript: req.body.original_transcript,
    });
    return res.json(apiResponse(200, "meeting processed", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

meetingRouter.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) throw new Error("projectId is required");

    const data = await meetingController.getAllMeetings(projectId);
    return res.json(apiResponse(200, "meetings fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

meetingRouter.get("/:meetingId/summary", async (req: Request, res: Response) => {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId) throw new Error("meetingId is required");

    const data = await meetingController.getSummary(meetingId);
    return res.json(apiResponse(200, "summary fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

meetingRouter.get("/:meetingId", async (req: Request, res: Response) => {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId) throw new Error("meetingId is required");

    const data = await meetingController.getMeeting(meetingId);
    return res.json(apiResponse(200, "meeting fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

export default meetingRouter;
