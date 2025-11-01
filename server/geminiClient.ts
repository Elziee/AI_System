import { GoogleGenAI } from "@google/genai";
import { API_KEY } from '../env/secrets';

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set. In this environment, it should be provided securely by the platform.");
}

/**
 * In a production environment, this client would be initialized on a secure backend server.
 * Here, we centralize its creation to improve code structure and simulate that separation.
 */
export const ai = new GoogleGenAI({ apiKey: API_KEY });
