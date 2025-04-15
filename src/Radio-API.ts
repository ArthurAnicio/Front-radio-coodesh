import axios, { AxiosResponse } from 'axios';
import RadioStation from './Radio-Class';

class RadioApi {
  private baseUrl = 'http://at1.api.radio-browser.info/json/stations/search';

  async searchStations(
    filter: string,
    filterType: 'name' | 'country' | 'language',
    page: number,
    limit: number = 10
  ): Promise<RadioStation[]> {
    try {
      const offset = (page - 1) * limit;
      const url = `${this.baseUrl}?limit=${limit}&offset=${offset}&${filterType}=${filter}`;
      const response: AxiosResponse<RadioStation[]> = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar rádios:', error);
      return [];
    }
  }

  async getTotalStations(
    filter: string,
    filterType: 'name' | 'country' | 'language'
  ): Promise<number> {
    try {
      const url = `${this.baseUrl}?limit=1&${filterType}=${filter}`;
      const response: AxiosResponse<RadioStation[]> = await axios.get(url);
      return response.data.length;
    } catch (error) {
      console.error('Erro ao obter total de rádios:', error);
      return 0;
    }
  }
}

export default RadioApi;