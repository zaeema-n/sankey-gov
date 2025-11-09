import { useState, useEffect } from 'react';
// Import your service functions here
// import { fetchActiveMinistries, fetchAllRelationsForMinistry } from '../services/services';

/**
 * Custom hook to fetch and transform data for Sankey chart
 * @param {Object} params - Parameters needed for data fetching
 * @param {Object} params.selectedPresident - The selected president object
 * @param {Array} params.selectedDates - Array of date objects (each with a .date property)
 * @returns {Object} - { data: sankeyData, loading: boolean, error: Error|null }
 */
export function useSankeyData(params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAndTransformData() {
      try {
        setLoading(true);
        setError(null);

        // Validate params
        if (!params?.selectedPresident || !params?.selectedDates || params.selectedDates.length === 0) {
          setData(null);
          setLoading(false);
          return;
        }

        // TODO: Fetch data for each date
        // Example:
        // const dataByDate = await Promise.all(
        //   params.selectedDates.map(async (selectedDate, index) => {
        //     const ministerIds = await fetchActiveMinistries(selectedDate, params.selectedPresident);
        //     return { date: selectedDate, ministerIds, timeIndex: index };
        //   })
        // );

        // TODO: Transform the data into Sankey format
        // const sankeyData = transformToSankeyFormat(dataByDate);
        
        // For now, return null or placeholder
        setData(null);
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    if (params) {
      fetchAndTransformData();
    }
  }, [params]);

  return { data, loading, error };
}

/**
 * Transform raw data into Sankey chart format
 * @param {Array} dataByDate - Array of objects: [{ date, ministerIds, timeIndex }, ...]
 * @returns {Object} - { nodes: Array, links: Array }
 */
function transformToSankeyFormat(dataByDate) {
  // TODO: Implement your transformation logic here
  // Example structure:
  // dataByDate = [
  //   { date: {date: "2024-01-01"}, ministerIds: ["id1", "id2"], timeIndex: 0 },
  //   { date: {date: "2024-02-01"}, ministerIds: ["id1", "id3"], timeIndex: 1 },
  //   { date: {date: "2024-03-01"}, ministerIds: ["id1", "id2"], timeIndex: 2 }
  // ]
  
  // This should convert your API data into:
  // {
  //   nodes: [
  //     { name: "Ministry A", time: "t1", timeIndex: 0 },  // node index 0
  //     { name: "Ministry B", time: "t1", timeIndex: 0 },  // node index 1
  //     { name: "Ministry A", time: "t2", timeIndex: 1 },  // node index 2
  //     { name: "Ministry C", time: "t2", timeIndex: 1 },  // node index 3
  //     ...
  //   ],
  //   links: [
  //     { source: 0, target: 2, value: 10 },  // A at t1 → A at t2 (10 depts)
  //     { source: 1, target: 3, value: 5 },   // B at t1 → C at t2 (5 depts)
  //     ...
  //   ]
  // }
  
  // Steps:
  // 1. Create nodes for each ministry at each time period
  // 2. Create links showing transitions between ministries across time periods
  // 3. Calculate values (number of departments) for each link
  
  return {
    nodes: [],
    links: []
  };
}

