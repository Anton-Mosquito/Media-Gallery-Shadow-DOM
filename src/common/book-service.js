export class BookService {
  #baseUrl = "https://openlibrary.org";

  async searchBooks(query, offset = 0, limit = 10) {
    try {
      const response = await fetch(
        `${this.#baseUrl}/search.json?q=${encodeURIComponent(
          query
        )}&offset=${offset}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("BookService Error:", error);
      throw error;
    }
  }
}

export const bookService = new BookService();
