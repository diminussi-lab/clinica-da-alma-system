export interface LocalClient {
  id: number;
  therapistId: number;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  localOnly: true;
}

type LocalClientInput = Partial<Omit<LocalClient, "id" | "therapistId" | "createdAt" | "updatedAt" | "isActive" | "localOnly">> & {
  name: string;
};

const LOCAL_CLIENTS_KEY = "clinica_da_alma_local_clients";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeOptionalValue(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeClientInput(input: LocalClientInput): LocalClientInput {
  return Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => [key, normalizeOptionalValue(value)])
      .filter(([, value]) => value !== undefined)
  ) as LocalClientInput;
}

export function getLocalClients(therapistId?: number): LocalClient[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_CLIENTS_KEY);
    const clients = raw ? (JSON.parse(raw) as LocalClient[]) : [];
    return therapistId ? clients.filter((client) => client.therapistId === therapistId) : clients;
  } catch (error) {
    console.warn("[LocalClients] Falha ao ler clientes locais:", error);
    return [];
  }
}

export function saveLocalClients(clients: LocalClient[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
  window.dispatchEvent(new Event("clinica-da-alma-local-clients-updated"));
}

export function createLocalClient(input: LocalClientInput, therapistId = 1): LocalClient {
  const clients = getLocalClients();
  const now = new Date().toISOString();
  const normalizedInput = normalizeClientInput(input);
  const nextId = Math.min(-1, ...clients.map((client) => client.id - 1));

  const client: LocalClient = {
    id: nextId,
    therapistId,
    name: normalizedInput.name.trim(),
    email: normalizedInput.email,
    phone: normalizedInput.phone,
    dateOfBirth: normalizedInput.dateOfBirth,
    address: normalizedInput.address,
    city: normalizedInput.city,
    state: normalizedInput.state,
    zipCode: normalizedInput.zipCode,
    emergencyContact: normalizedInput.emergencyContact,
    emergencyPhone: normalizedInput.emergencyPhone,
    notes: normalizedInput.notes,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    localOnly: true,
  };

  saveLocalClients([client, ...clients]);
  return client;
}

export function updateLocalClient(clientId: number, input: Partial<LocalClientInput>) {
  const clients = getLocalClients();
  const normalizedInput = normalizeClientInput(input as LocalClientInput);
  const updatedClients = clients.map((client) =>
    client.id === clientId
      ? {
          ...client,
          ...normalizedInput,
          updatedAt: new Date().toISOString(),
        }
      : client
  );

  saveLocalClients(updatedClients);
}
