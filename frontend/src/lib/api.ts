/**
 * KisanVerify Centralized API Client
 * Base URL defaults to '/api/v1' for Vite dev proxy / production hosting.
 */

export const BASE_API_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

export interface ApiToastMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

// Global toast listener mechanism for non-blocking UI notifications
type ToastListener = (toast: ApiToastMessage) => void;
const toastListeners: Set<ToastListener> = new Set();

export function subscribeToApiToasts(listener: ToastListener): () => void {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

export function emitApiToast(message: string, type: ApiToastMessage['type'] = 'error') {
  const toast: ApiToastMessage = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    message,
    type,
  };
  toastListeners.forEach((listener) => listener(toast));

  // Also dispatch a browser custom event for maximum interoperability
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kisanverify:toast', { detail: toast }));
  }
}

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    // If empty response (204 No Content)
    if (res.status === 204) {
      return {} as T;
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  }

  // Handle standard HTTP error codes
  let errorMessage = `Request failed (${res.status})`;
  let errorData: any = null;

  try {
    errorData = await res.json();
    if (errorData?.detail) {
      errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    }
  } catch {
    // Non-JSON error body
    try {
      const text = await res.text();
      if (text) errorMessage = text;
    } catch {
      // ignore
    }
  }

  if (res.status === 401) {
    errorMessage = 'Session expired or unauthorized. Please log in again.';
  } else if (res.status === 404) {
    errorMessage = 'Requested record or resource was not found.';
  } else if (res.status >= 500) {
    errorMessage = 'Server encountered an error. Please try again later.';
  }

  emitApiToast(errorMessage, 'error');
  throw new ApiError(errorMessage, res.status, errorData);
}

function normalizeUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If endpoint already starts with /api/v1 or /api, avoid duplication
  if (cleanEndpoint.startsWith('/api/v1')) {
    return cleanEndpoint;
  }
  if (cleanEndpoint.startsWith('/api/')) {
    return cleanEndpoint;
  }
  return `${BASE_API_URL}${cleanEndpoint}`;
}

export const apiClient = {
  async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      });
      return await handleResponse<T>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const friendlyMsg = "Can't reach the server, retrying...";
      emitApiToast(friendlyMsg, 'warning');
      throw new ApiError(friendlyMsg, 0, err);
    }
  },

  async post<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return await handleResponse<T>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const friendlyMsg = "Can't reach the server, retrying...";
      emitApiToast(friendlyMsg, 'warning');
      throw new ApiError(friendlyMsg, 0, err);
    }
  },

  async put<T>(endpoint: string, body?: any, headers?: HeadersInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return await handleResponse<T>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const friendlyMsg = "Can't reach the server, retrying...";
      emitApiToast(friendlyMsg, 'warning');
      throw new ApiError(friendlyMsg, 0, err);
    }
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const res = await fetch(url, {
        method: 'POST',
        // Notice: Content-Type omitted so browser sets multipart boundary automatically
        body: formData,
      });
      return await handleResponse<T>(res);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const friendlyMsg = "Can't reach the server, retrying...";
      emitApiToast(friendlyMsg, 'warning');
      throw new ApiError(friendlyMsg, 0, err);
    }
  },

  async download(endpoint: string, suggestedFilename?: string): Promise<Blob> {
    const url = normalizeUrl(endpoint);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*',
        },
      });

      if (!res.ok) {
        return await handleResponse<Blob>(res);
      }

      const blob = await res.blob();

      // Trigger automatic browser download if in window context
      if (typeof window !== 'undefined' && suggestedFilename) {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = suggestedFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }

      return blob;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const friendlyMsg = "Can't reach the server, retrying...";
      emitApiToast(friendlyMsg, 'warning');
      throw new ApiError(friendlyMsg, 0, err);
    }
  },

  async checkHealth(): Promise<{ status: string; environment?: string; db?: string }> {
    try {
      // /health is routed at root or via dev proxy
      const res = await fetch('/health');
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Health check returned ${res.status}`);
    } catch (err) {
      throw new ApiError("Can't reach the server, retrying...", 0, err);
    }
  },
};
