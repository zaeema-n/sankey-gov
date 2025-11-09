import { useEffect, useState } from "react";
import SankeyChart from "./components/SankeyChart";

const BASE_URL = "http://localhost:8000/data/orgchart/sankey";
const PRESIDENT_ENDPOINT = "http://localhost:8000/data/orgchart/president";

const SELECTED_PRESIDENT_ID = "2149-34_cit_1";

const LAYER_WIDTH = 200;

const getInitialViewportSize = () => {
  if (typeof window === "undefined") {
    return { width: 1280, height: 720 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
};

const estimateSankeyHeight = (data, fallbackHeight) => {
  if (!data?.nodes?.length) {
    return fallbackHeight;
  }

  const estimatedHeight = data.nodes.length * 30;

  return Math.max(fallbackHeight, estimatedHeight);
};

const estimateSankeyWidth = (data, fallbackWidth) => {
  if (!data?.nodes?.length) {
    return fallbackWidth;
  }

  const uniqueLayers = new Set();
  data.nodes.forEach((node) => {
    if (typeof node.layer === "number") {
      uniqueLayers.add(node.layer);
    } else if (typeof node.x0 === "number") {
      uniqueLayers.add(node.x0);
    }
  });

  const layersCount = uniqueLayers.size || Math.ceil(Math.sqrt(data.nodes.length));

  const estimatedWidth = layersCount * LAYER_WIDTH;

  return Math.max(fallbackWidth, estimatedWidth);
};

const getSampledDates = (startISO, endISO, sampleCount = 10) => {
  if (!startISO || !endISO || sampleCount <= 0) {
    return [];
  }

  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate.getTime() <= startDate.getTime()
  ) {
    return [];
  }

  if (sampleCount === 1) {
    return [startDate.toISOString().slice(0, 10)];
  }

  const results = [];
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const step = (endTime - startTime) / (sampleCount - 1);

  for (let index = 0; index < sampleCount; index += 1) {
    const sampleTime = startTime + step * index;
    const date = new Date(sampleTime);
    results.push(date.toISOString().slice(0, 10));
  }

  return Array.from(new Set(results));
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewportSize, setViewportSize] = useState(getInitialViewportSize);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSankeyData() {
      try {
        setLoading(true);
        setError(null);

        const tenureResponse = await fetch(
          `${PRESIDENT_ENDPOINT}/${SELECTED_PRESIDENT_ID}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (!tenureResponse.ok) {
          throw new Error(
            `President tenure API error: ${tenureResponse.status} ${tenureResponse.statusText}`
          );
        }

        const tenure = await tenureResponse.json();
        const presidencyRecord = tenure?.[0];

        if (!presidencyRecord?.startTime || !presidencyRecord?.endTime) {
          throw new Error("Missing start/end time for president tenure");
        }

        const requestDates = getSampledDates(
          presidencyRecord.startTime,
          presidencyRecord.endTime,
          10
        );

        if (requestDates.length === 0) {
          throw new Error("No valid dates generated for Sankey request");
        }

        const sankeyUrl = `${BASE_URL}/${SELECTED_PRESIDENT_ID}`;

        const response = await fetch(sankeyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestDates),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Sankey API error: ${response.status} ${response.statusText}`
          );
        }

        const payload = await response.json();
        setData(payload);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Failed to set up Sankey data:", err);
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSankeyData();

    return () => controller.abort();
  }, []);

  const baseHeight = Math.max(viewportSize.height - 200, 400);
  const chartHeight = estimateSankeyHeight(data, baseHeight);
  const chartWidth = estimateSankeyWidth(data, viewportSize.width);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Department Movement
        </h2>
      </header>

      <main className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            Loading Sankey data…
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-600">
            Unable to load data: {error.message || "Unknown error"}
          </div>
        )}

        {!loading && !error && data && (
          <div className="px-6 py-6 min-w-fit">
            <div
              className="inline-block rounded border border-slate-200 shadow bg-white"
              style={{ width: chartWidth, minHeight: chartHeight }}
            >
              <SankeyChart data={data} width={chartWidth} height={chartHeight} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
