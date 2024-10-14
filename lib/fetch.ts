import axios from "axios";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

interface PostAudioData {
  userId?: string;
  name?: string;
  audioUri: string;
}

export const postAudio = async (data: PostAudioData) => {
  try {
    const response = await axios.post<{ text: string }>('/(api)/ai+api', {
      userId: data.userId,
      name: data.name,
      audioUri: data.audioUri
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting audio:', error);
    throw error;
  }
};