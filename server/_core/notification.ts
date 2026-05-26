import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

function validatePayload(input: NotificationPayload): NotificationPayload {
  const title = input.title?.trim();
  const content = input.content?.trim();

  if (!title) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }

  if (!content) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
}

/**
 * Mantém o contrato da rota de notificações sem chamar serviços externos.
 * A integração real com e-mail/SMS pode ser conectada depois a um provedor próprio,
 * sem dependência de Manus Auth, OAuth ou Forge.
 */
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const notification = validatePayload(payload);

  console.info("[Notification] Local notification registered", {
    ...notification,
    createdAt: new Date().toISOString(),
  });

  return true;
}
