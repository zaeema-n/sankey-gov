import { useEffect, useState } from "react";
import SankeyChart from "./components/SankeyChart";

const BASE_URL = "http://localhost:8000/data/orgchart/sankey";

const SELECTED_PRESIDENT_ID = "2149-34_cit_1";

const REQUEST_DATES = [
  "2020-04-08",
  "2020-08-09",
  "2020-11-20"
];

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

        const sankeyUrl = `${BASE_URL}/${SELECTED_PRESIDENT_ID}`;

        const response = await fetch(sankeyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(REQUEST_DATES),
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
