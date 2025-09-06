export class DbService {
  private static getBaseUrl(): string {
    if (!process.env.DB_URL) throw new Error('DB_URL is not defined');
    return process.env.DB_URL;
  }

  public static async get<T>(
    path: string,
    query?: Record<string, string | number>
  ): Promise<T> {
    const url = new URL(`${this.getBaseUrl()}/${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) =>
        url.searchParams.append(key, String(value))
      );
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GET ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  public static async post<T>(path: string, data: any): Promise<T> {
    const url = `${this.getBaseUrl()}/${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`POST ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  public static async put<T>(path: string, data: any): Promise<T> {
    const url = `${this.getBaseUrl()}/${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PUT ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  public static async delete<T>(path: string): Promise<T> {
    const url = `${this.getBaseUrl()}/${path}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`DELETE ${url} failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}
