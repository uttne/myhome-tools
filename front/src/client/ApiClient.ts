import { getOrRefreshAccessToken } from "../utils/auth";


interface ITokenManger {
  getToken(): Promise<string>;
}

class Tokenmanger implements ITokenManger {
  async getToken(): Promise<string> {
    const token = await getOrRefreshAccessToken();
    if (!token) {
      throw new Error('No valid access token found');
    }
    return token;
  }
}

export class ApiClient {
  private baseUrl: string;
  private tokenManger: ITokenManger;

  constructor(baseUrl: string, tokenManger: ITokenManger) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    this.tokenManger = tokenManger;
  }

  async getToken(): Promise<string> {
    return this.tokenManger.getToken();
  }

  async get<T>(endpoint: string): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async post<RT,T>(endpoint: string, data: RT | undefined): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async init(): Promise<void> {
    const endpoint = '/api/v1/me/init'; 
    
    await this.post<undefined, undefined>(endpoint, undefined);
  }
}


export const DEFAULT_API_CLIENT = new ApiClient(
  "/",
  new Tokenmanger()
);
