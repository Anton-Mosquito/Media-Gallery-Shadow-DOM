export class FilmService {
  #baseUrl = "http://www.omdbapi.com/";

  async searchFilms(query, offset = 1) {
    try {
      const response = await fetch(
        `${this.#baseUrl}?s=${encodeURIComponent(
          query
        )}&page=${encodeURIComponent(offset)}&apikey=1163afb2`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("FilmService Error:", error);
      throw error;
    }
  }
}

export const filmService = new FilmService();
