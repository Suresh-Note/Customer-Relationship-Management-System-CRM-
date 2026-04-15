import { useEffect, useState, useCallback } from "react";

import axios from "../api/axios";
import { crmEndpoints, fallbackData } from "../data/fallbackData";

const collectionKeys = Object.keys(crmEndpoints);

function resolveCollectionData(key, result, currentData) {
  if (result.status === "fulfilled" && Array.isArray(result.value.data)) {
    return result.value.data;
  }
  return currentData[key]?.length ? currentData[key] : fallbackData[key];
}

export function useCrmData() {
  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [usingFallback, setUsingFallback] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errors, setErrors] = useState([]);

  const loadData = useCallback(async (initialLoad = false) => {
    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    const requests = collectionKeys.map((key) => axios.get(crmEndpoints[key]));
    const results = await Promise.allSettled(requests);

    const failedKeys = [];
    let successfulCalls = 0;
    const nextData = {};

    collectionKeys.forEach((key, index) => {
      const result = results[index];
      if (result.status === "fulfilled" && Array.isArray(result.value.data)) {
        successfulCalls += 1;
      } else {
        failedKeys.push(key);
      }
      nextData[key] = resolveCollectionData(key, result, data);
    });

    setData(nextData);
    setErrors(failedKeys);
    setApiStatus(
      successfulCalls === 0 ? "offline" : failedKeys.length ? "partial" : "online"
    );
    setUsingFallback(failedKeys.length > 0);

    if (successfulCalls > 0 || !lastUpdated) {
      setLastUpdated(new Date());
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  /**
   * Create a lead via API.
   * Throws on failure — callers must handle the error and show feedback.
   */
  async function createLead(payload) {
    const response = await axios.post("/leads", payload);
    const created = response.data && typeof response.data === "object"
      ? response.data
      : { lead_id: Date.now(), status: "New", created_at: new Date().toISOString(), ...payload };

    setData((current) => ({
      ...current,
      leads: [created, ...current.leads],
    }));
    setLastUpdated(new Date());
    return created;
  }

  return {
    data,
    isLoading,
    isRefreshing,
    apiStatus,
    usingFallback,
    lastUpdated,
    errors,
    refreshData: () => loadData(false),
    createLead,
  };
}
