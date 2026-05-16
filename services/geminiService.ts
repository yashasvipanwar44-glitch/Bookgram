export const getBookRecommendation = async (query: string): Promise<string> => {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return errorData.error || "An error occurred while fetching recommendations.";
    }

    const data = await response.json();
    return data.text || "I couldn't find any recommendations right now.";
  } catch (error) {
    console.error("API Error:", error);
    return "I'm having trouble connecting to the library archives. Please try again later.";
  }
};