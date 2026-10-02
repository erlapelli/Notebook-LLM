import { MemoryClient } from "mem0ai";

let client: MemoryClient | null = null;

export function getMem0Client() {
  const apiKey = process.env.MEM0_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("MEM0_API_KEY is not configured");
  }

  if (!client) {
    client = new MemoryClient({
      apiKey,
    });
  }

  return client;
}

export type Mem0Message = {
  role: "user" | "assistant";
  content: string;
};

export type AppMemory = {
  id: string;
  memory: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
  categories?: string[];
  source: "manual" | "learned";
};

function mapMemory(record: {
  id: string;
  memory?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  metadata?: Record<string, unknown> | null;
  categories?: string[];
}): AppMemory {
  const metadata = record.metadata ?? null;

  const source: AppMemory["source"] =
    metadata?.source === "manual" ? "manual" : "learned";

  const createdAt = record.createdAt ?? new Date().toISOString();

  const updatedAt = record.updatedAt ?? createdAt;

  return {
    id: record.id,
    memory: record.memory ?? "",

    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,

    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,

    metadata,

    ...(record.categories !== undefined && {
      categories: record.categories,
    }),

    source,
  };
}

/**
 * Get all memories for a user.
 */
export async function listUserMemories(userId: string) {
  if (!process.env.MEM0_API_KEY?.trim()) {
    return [];
  }

  const page = await getMem0Client().getAll({
    filters: {
      user_id: userId,
    },
    page: 1,
    pageSize: 100,
  });

  return page.results.map(mapMemory);
}

/**
 * Search memories for a user.
 */
export async function searchUserMemories(userId: string, query: string) {
  if (!process.env.MEM0_API_KEY?.trim() || !query.trim()) {
    return [];
  }

  const results = await getMem0Client().search(query, {
    filters: {
      user_id: userId,
    },
    topK: 8,
    threshold: 0.1,
  });

  return results.results.map(mapMemory);
}

/**
 * Add a manual memory for a user.
 *
 * Mem0 currently processes add() asynchronously.
 * The API returns an event ID first, and the actual
 * memory becomes available after background processing.
 */
export async function addUserMemory(
  userId: string,
  input: {
    memory: string;
    infer?: boolean;
    metadata?: Record<string, unknown>;
  },
) {
  const created = await getMem0Client().add(
    [
      {
        role: "user",
        content: input.memory,
      },
    ],
    {
      userId,
      infer: input.infer ?? false,

      ...(input.metadata !== undefined && {
        metadata: input.metadata,
      }),
    },
  );

  /*
   * The installed TypeScript SDK typings do not correctly
   * describe the async V3 response.
   *
   * Mem0's API response is documented as:
   *
   * {
   *   "event_id": "...",
   *   "status": "PENDING"
   * }
   *
   * Some SDK responses may expose this as eventId.
   *
   * Convert to unknown first so TypeScript does not complain
   * that the value is of type "never".
   */
  const responseData = created as unknown as {
    eventId?: unknown;
    event_id?: unknown;
    status?: unknown;
  };

  const eventId =
    typeof responseData.eventId === "string"
      ? responseData.eventId
      : typeof responseData.event_id === "string"
        ? responseData.event_id
        : null;

  if (!eventId) {
    throw new Error("Mem0 did not return an event id");
  }

  /*
   * Mem0 processes the memory asynchronously.
   *
   * We check the user's memories every 500ms.
   * 20 attempts = approximately 10 seconds.
   */
  const maxAttempts = 20;
  const delayMs = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const page = await getMem0Client().getAll({
      filters: {
        user_id: userId,
      },
      page: 1,
      pageSize: 100,
    });

    const matchingMemory = page.results.find((memory) => {
      const sameMemory = memory.memory === input.memory;

      const sameSource =
        input.metadata?.source === undefined ||
        memory.metadata?.source === input.metadata.source;

      return sameMemory && sameSource;
    });

    if (matchingMemory) {
      return mapMemory(matchingMemory);
    }
  }

  throw new Error(
    `Memory was accepted by Mem0 but is still processing. Event ID: ${eventId}`,
  );
}

/**
 * Add memories generated from conversations.
 *
 * These memories use infer=true so Mem0 can extract
 * useful long-term information from the conversation.
 */
export async function addMemoriesFromMessages(
  userId: string,
  messages: Mem0Message[],
  metadata?: Record<string, unknown>,
) {
  if (!process.env.MEM0_API_KEY?.trim() || messages.length === 0) {
    return;
  }

  await getMem0Client().add(messages, {
    userId,
    infer: true,

    ...(metadata !== undefined && {
      metadata,
    }),
  });
}

/**
 * Update an existing memory.
 */
export async function updateUserMemory(
  userId: string,
  memoryId: string,
  input: {
    memory: string;
  },
) {
  await getMem0Client().update(memoryId, {
    text: input.memory,
  });

  /*
   * Mem0 may successfully update the memory without
   * returning the updated memory object.
   *
   * Fetch the user's memories and find the updated
   * memory by its id.
   */
  const page = await getMem0Client().getAll({
    filters: {
      user_id: userId,
    },
    page: 1,
    pageSize: 100,
  });

  const updatedMemory = page.results.find((memory) => memory.id === memoryId);

  if (!updatedMemory) {
    throw new Error(
      "Memory was updated in Mem0 but could not be fetched afterward.",
    );
  }

  return mapMemory(updatedMemory);
}

/**
 * Delete an existing memory.
 */
export async function deleteUserMemory(memoryId: string) {
  await getMem0Client().delete(memoryId);
}
