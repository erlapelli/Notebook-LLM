import type { Request, Response } from "express";

import {
  createArtifactForWorkspace,
  deleteArtifactForWorkspace,
  getArtifactForWorkspace,
  listArtifactsForWorkspace,
} from "../services/artifact.services.js";

import {
  artifactIdParamSchema,
  createArtifactSchema,
} from "../validators/artifact.validator.js";

import { ValidationError } from "../types/app-error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";

function parseWorkspaceId(params: Request["params"]) {
  const workspaceId = params.workspaceId;

  if (typeof workspaceId !== "string" || !workspaceId.trim()) {
    throw new ValidationError("Invalid workspace id");
  }

  return workspaceId;
}

function parseArtifactParams(params: Request["params"]) {
  const parsed = artifactIdParamSchema.safeParse(params);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid artifact parameters",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

function parseCreateArtifactBody(body: unknown) {
  const parsed = createArtifactSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid artifact",
      getZodFieldErrors(parsed.error),
    );
  }

  return parsed.data;
}

/**
 * GET /workspaces/:workspaceId/artifacts
 */
export async function listArtifacts(req: Request, res: Response) {
  const workspaceId = parseWorkspaceId(req.params);

  const artifacts = await listArtifactsForWorkspace(
    workspaceId,
    req.session.user.id,
  );

  res.json(artifacts);
}

/**
 * GET /workspaces/:workspaceId/artifacts/:artifactId
 */
export async function getArtifact(req: Request, res: Response) {
  const { workspaceId, artifactId } = parseArtifactParams(req.params);

  const artifact = await getArtifactForWorkspace(
    workspaceId,
    artifactId,
    req.session.user.id,
  );

  res.json(artifact);
}

/**
 * POST /workspaces/:workspaceId/artifacts
 */
export async function createArtifact(req: Request, res: Response) {
  const workspaceId = parseWorkspaceId(req.params);
  const input = parseCreateArtifactBody(req.body);

  const artifact = await createArtifactForWorkspace(
    workspaceId,
    req.session.user.id,
    input,
  );

  res.status(201).json(artifact);
}

/**
 * DELETE /workspaces/:workspaceId/artifacts/:artifactId
 */
export async function deleteArtifact(req: Request, res: Response) {
  const { workspaceId, artifactId } = parseArtifactParams(req.params);

  await deleteArtifactForWorkspace(
    workspaceId,
    artifactId,
    req.session.user.id,
  );

  res.status(204).send();
}
