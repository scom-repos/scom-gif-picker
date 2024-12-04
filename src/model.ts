import { IGifCategory, IGifData } from "./interface";

export class GifModel {
  private _apiKey: string;
  private _categories: IGifCategory[];
  private _gifsMapper: {[key: string]: IGifData} = {};

  constructor() {}

  get apiKey() {
    return this._apiKey;
  }

  set apiKey(value: string) {
    this._apiKey = value;
  }

  async getReactions() {
    if (!this._categories) {
      this._categories = await this.fetchReactionGifs();
    }
    return this._categories;
  }

  async getGifs(params: any) {
    const { q, offset = 0 } = params;
    return this._gifsMapper[`${q}_${offset}`] || await this.fetchGifs(params);
  }

  private async fetchGifs(params: any) {
    if (!params.offset) params.offset = 0;
    if (!params.limit) params.limit = 20;
    params.api_key = this.apiKey;
    const queries = params ? new URLSearchParams({
      ...params
    }).toString() : '';
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?${queries}`);
      const result = await response.json();
      this._gifsMapper[`${params.q}_${params.offset}`] = result;
      return result;
    } catch {
      return null
    }
  }

  private async fetchReactionGifs() {
    try {
      const response = await fetch(`https://api.giphy.com/v1/gifs/categories/reactions?api_key=${this.apiKey}`);
      const { data = [] } = await response.json();
      return data;
    } catch {
      return []
    }
  }
}