export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type TokenGetter = () => string | null;
type BaseUrlGetter = () => string;

export class ApiClient {
  constructor(
    private readonly getBaseUrl: BaseUrlGetter,
    private readonly getToken: TokenGetter,
  ) {}

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const hasBody = options.body !== undefined;

    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = this.getToken();
    if (token) {
      headers.set("Authorization", `Token ${token}`);
    }

    const response = await fetch(`${this.getBaseUrl()}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      throw new ApiError(readApiError(data), response.status);
    }

    return data as T;
  }
}

function readApiError(data: unknown): string {
  if (!data) return "Nao foi possivel concluir a acao.";
  if (typeof data === "string") return data;

  if (typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (typeof record.detail === "string") return record.detail;
    if (typeof record.non_field_errors === "object") return String(record.non_field_errors);

    const firstKey = Object.keys(record)[0];
    const firstValue = record[firstKey];

    if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue.join(", ")}`;
    if (typeof firstValue === "string") return `${firstKey}: ${firstValue}`;
  }

  return "Verifique os campos e tente novamente.";
}
