import { Router, type Request, type Response } from "express";
import apiResponse from "../utils/apiResponse";
import projectController from "../controllers/project.controller";
import isUserInputValid from "../utils/validator";
import { authenticate } from "../middleware/authenticate";

const projectRouter = Router();

projectRouter.use(authenticate);

// Create Project
projectRouter.post("/create-project", async (req: Request, res: Response) => {
  try {
    if (req.body && !isUserInputValid(req.body, ["description"])) {
      throw new Error("one/more input fields are wrong");
    }

    const data = await projectController.createProject({
      name: req.body.name,
      description: req.body.description,
      created_by: req.user!.user_id,
    });

    return res.status(201).json(apiResponse(201, "project created", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

projectRouter.post("/", async (req: Request, res: Response) => {
  try {
    if (req.body && !isUserInputValid(req.body, ["description"])) {
      throw new Error("one/more input fields are wrong");
    }

    const data = await projectController.createProject({
      name: req.body.name,
      description: req.body.description,
      created_by: req.user!.user_id,
    });

    return res.status(201).json(apiResponse(201, "project created", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

// Get all projects
projectRouter.get("/get-projects", async (req: Request, res: Response) => {
  try {
    const createdBy = req.query.created_by
      ? String(req.query.created_by)
      : undefined;
    const data = await projectController.getAllProjects(createdBy);

    return res.status(200).json(apiResponse(200, "projects fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

projectRouter.get("/", async (req: Request, res: Response) => {
  try {
    // Filter by authenticated user
    const data = await projectController.getAllProjects(req.user!.user_id);

    return res.status(200).json(apiResponse(200, "projects fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

// Get single project
projectRouter.get("/get-project/:id", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id ? String(req.params.id) : "";
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const data = await projectController.getProject(projectId);

    return res.status(200).json(apiResponse(200, "project fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

projectRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id ? String(req.params.id) : "";
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const data = await projectController.getProject(projectId);

    return res.status(200).json(apiResponse(200, "project fetched", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

// Update project
projectRouter.put("/update-project/:id", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id ? String(req.params.id) : "";
    if (!projectId) {
      throw new Error("projectId is required");
    }

    if (req.body && !isUserInputValid(req.body)) {
      throw new Error("one/more input fields are wrong");
    }

    const data = await projectController.updateProject(projectId, req.body);

    return res.status(200).json(apiResponse(200, "project updated", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

projectRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id ? String(req.params.id) : "";
    if (!projectId) {
      throw new Error("projectId is required");
    }

    if (req.body && !isUserInputValid(req.body)) {
      throw new Error("one/more input fields are wrong");
    }

    const data = await projectController.updateProject(projectId, req.body);

    return res.status(200).json(apiResponse(200, "project updated", data));
  } catch (error: any) {
    console.log(error);
    return res.json(apiResponse(500, error.message, null));
  }
});

// Delete project
projectRouter.delete("/delete-project/:id", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id ? String(req.params.id) : "";
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const data = await projectController.deleteProject(projectId);

    return res.status(200).json(apiResponse(200, "project deleted", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

projectRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id ? String(req.params.id) : "";
    if (!projectId) {
      throw new Error("projectId is required");
    }

    const data = await projectController.deleteProject(projectId);

    return res.status(200).json(apiResponse(200, "project deleted", data));
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(apiResponse(500, error.message, null));
  }
});

export default projectRouter;
