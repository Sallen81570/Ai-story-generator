// Safe fetch helper that guarantees proper JSON parsing and graceful error messages

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const text = await res.text();

    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      // not JSON
    }

    if (json !== null && typeof json === "object") {
      if (!res.ok || json.error || json.success === false) {
        return {
          ok: false,
          status: res.status,
          error: json.error || json.message || `Request failed (${res.status})`,
          data: json,
        };
      }
      return { ok: true, status: res.status, data: json };
    }

    // Not JSON (e.g. HTML error page or raw string)
    if (!res.ok) {
      if (res.status === 503 || res.status === 502 || res.status === 504) {
        return {
          ok: false,
          status: res.status,
          error: "The AI service is currently busy or warming up. Please try again in a few moments.",
        };
      }
      if (res.status === 404) {
        return {
          ok: false,
          status: res.status,
          error: "API service endpoint was not found.",
        };
      }
      return {
        ok: false,
        status: res.status,
        error: `Server returned status ${res.status}. Please try again.`,
      };
    }

    // Status is 200 OK but body is not JSON (e.g. index.html was returned due to routing)
    return {
      ok: false,
      status: res.status,
      error: "Unexpected response format received from server. Please retry.",
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || "Network error. Please check your connection and try again.",
    };
  }
}

