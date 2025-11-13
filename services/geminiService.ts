
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { GpsData, ChannelInfo, SignalData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Simulates calling a TVWS database by using Gemini to generate plausible channel data.
 * @param gpsData The GPS coordinates of the technician.
 * @returns A promise that resolves to an array of available channels.
 */
export const getAvailableFrequencies = async (gpsData: GpsData): Promise<ChannelInfo[]> => {
  const prompt = `
    Based on the location latitude: ${gpsData.latitude}, longitude: ${gpsData.longitude}, 
    generate a plausible list of 5 available TV White Space (TVWS) channels. 
    Return the response as a JSON array where each object has "name" (e.g., "Ch 34"), "frequency" (e.g., "590-596 MHz"), and "power" (e.g., "4W EIRP").
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              frequency: { type: Type.STRING },
              power: { type: Type.STRING },
            }
          }
        }
      }
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ChannelInfo[];
  } catch (error) {
    console.error("Error fetching available frequencies:", error);
    // Return mock data on failure
    return [
      { name: "Ch 21", frequency: "512-518 MHz", power: "4W EIRP" },
      { name: "Ch 25", frequency: "536-542 MHz", power: "4W EIRP" },
      { name: "Ch 33", frequency: "584-590 MHz", power: "4W EIRP" },
    ];
  }
};

/**
 * Uses Gemini's multimodal capabilities to extract a Unit ID from an image.
 * @param base64Image The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to the extracted Unit ID string.
 */
export const runOCRVault = async (base64Image: string, mimeType: string): Promise<string> => {
  const prompt = "Extract the serial number or Unit ID from this image. Return only the ID as a string.";
  
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, imagePart] },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error performing OCR:", error);
    return "OCR_FAILED";
  }
};

/**
 * Uses Gemini to analyze a series of signal data for anomalies.
 * @param signalHistory An array of recent signal data points.
 * @returns A promise that resolves to a status string.
 */
export const performAnomalyCheck = async (signalHistory: SignalData[]): Promise<string> => {
  const dataString = signalHistory.map(d => `SNR: ${d.snr}dB, RSSI: ${d.rssi}dBm`).join('; ');
  const prompt = `
    Analyze this recent TVWS signal strength history for anomalies (sudden drops, unusual spikes, etc.): ${dataString}.
    Respond with a short status report, starting with "Status: Normal" or "Status: Abnormality Detected". 
    If an abnormality is detected, provide a one-sentence explanation.
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error performing anomaly check:", error);
    return "Status: Analysis Failed.";
  }
};

/**
 * Generates a summary report of network health based on provided stats.
 * @param stats An object containing network statistics.
 * @returns A promise that resolves to a string containing the report.
 */
export const generateNetworkReport = async (stats: {
  totalInstallations: number;
  averageSnr: number;
  alerts: number;
}): Promise<string> => {
  const prompt = `
    As a senior network operations analyst for a TV White Space provider, analyze the following network health statistics:
    - Total Active Installations: ${stats.totalInstallations}
    - Network-wide Average Signal-to-Noise Ratio (SNR): ${stats.averageSnr} dB
    - Critical Alerts in last 24 hours: ${stats.alerts}

    Based on this data, provide a concise, professional summary (2-3 sentences). 
    If the average SNR is below 20dB or if there are any alerts, highlight this as a concern and suggest one immediate action item.
    For example: "Overall network health is stable, but monitor the southern quadrant for potential interference."
    Start the report with "AI-Generated Network Status:".
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating network report:", error);
    return "AI analysis failed. Please review stats manually.";
  }
};
