const apiUrl = "";

const fetchActiveRelationsForMinistry = async (
  selectedDate,
  ministryId,
  relationType
) => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${ministryId}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relatedEntityId: "",
          startTime: "",
          endTime: "",
          id: "",
          name: relationType,
          activeAt: `${selectedDate}T00:00:00Z`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error fetching active ministries:", error);
  }
};


// Returns a list of minister IDs active under the President
const fetchActiveMinistries = async (selectedDate, selectedPresident) => {
  try {
    const response = await fetch(
      `${apiUrl}/v1/entities/${selectedPresident.id}/relations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relatedEntityId: "",
          startTime: "",
          endTime: "",
          id: "",
          name: "AS_MINISTER",
          activeAt: `${selectedDate.date}T00:00:00Z`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const activeMinistryRelations = await response.json();

    // Extract just the IDs from relations
    const ministerIds = activeMinistryRelations
      .filter((relation) => relation.relatedEntityId)
      .map((relation) => relation.relatedEntityId);

    return ministerIds;
  } catch (error) {
    console.error("Error fetching active ministries:", error);
    return [];
  }
};


const fetchAllRelationsForMinistry = async ({ministryId,relatedEntityId="",startTime="",endTime="",id="",name="",activeAt=""}) => {
    try {
      const response = await fetch(`${apiUrl}/v1/entities/${ministryId}/relations`, {
        method: "POST",
        body: JSON.stringify({
          relatedEntityId: relatedEntityId,
          startTime: startTime,
          endTime:endTime,
          id: id,
          name: name,
          activeAt: activeAt,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
  
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(
        `Error fetching relations for ministry ID ${ministryId}:`,
        error
      );
      return [];
    }
  };
