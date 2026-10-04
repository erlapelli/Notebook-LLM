const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

/*
 * Artifact APIs
 */

/**
 * Get all artifacts for a workspace.
 */
export async function getArtifacts(workspaceId) {
    return apiRequest(
        `/api/workspaces/${workspaceId}/artifacts`,
    );
}

/**
 * Get a single artifact.
 */
export async function getArtifact(
    workspaceId,
    artifactId,
) {
    return apiRequest(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
    );
}

/**
 * Create a new artifact.
 */
export async function createArtifact(
    workspaceId,
    data,
) {
    return apiRequest(
        `/api/workspaces/${workspaceId}/artifacts`,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}

/**
 * Delete an artifact.
 */
export async function deleteArtifact(
    workspaceId,
    artifactId,
) {
    const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
        {
            method: "DELETE",
            credentials: "include",
        },
    );

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`,
        );
    }
}


/**
 * Get all sources for a workspace.
 */
export async function getWorkspaceSources(workspaceId) {
    return apiRequest(
        `/api/workspaces/${workspaceId}/sources`,
    );
}


export async function getSource(workspaceId, sourceId) {
  return apiRequest(
    `/api/workspaces/${workspaceId}/sources/${sourceId}`,
  );
}

export async function deleteSource(workspaceId, sourceId) {
  const response = await fetch(
    `${API_URL}/api/workspaces/${workspaceId}/sources/${sourceId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
}