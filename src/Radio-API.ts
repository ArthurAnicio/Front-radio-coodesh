import axios, { AxiosResponse } from 'axios';
import RadioStation from './Radio-Class';

class RadioApi {
  
  private baseUrl = 'http://at1.api.radio-browser.info/json/stations/';
  private filtersUrl = 'http://at1.api.radio-browser.info/json/'

  async searchStations(
    filter: string,
    filterType: 'name' | 'country' | 'language',
    page: number,
    limit: number = 10
  ): Promise<RadioStation[]> {
    try {
      const offset = (page - 1) * limit;
      const url = `${this.baseUrl}search?limit=${limit}&offset=${offset}&${filterType}=${filter}`;
      const response: AxiosResponse<RadioStation[]> = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar rádios:', error);
      return [];
    }
  }

  async searchByUuid(uuid: string): Promise<RadioStation | null> {
    try {
      const url = `${this.baseUrl}byuuid/${uuid}`;
      const response: AxiosResponse<RadioStation[]> = await axios.get(url);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.log('Erro ao buscar a rádio: ', error);
      return null;
    }
  }

  async getTotalStations(
    filter: string,
    filterType: 'name' | 'country' | 'language'
  ): Promise<number> {
    try {
      const url = `${this.baseUrl}search?limit=1&${filterType}=${filter}`;
      const response: AxiosResponse<RadioStation[]> = await axios.get(url);
      return response.data.length;
    } catch (error) {
      console.error('Erro ao obter total de rádios:', error);
      return 0;
    }
  }

  async getCountries(): Promise<string[]> {
    try {
      const url = `${this.filtersUrl}countries`;
      const response: AxiosResponse<{ name: string }[]> = await axios.get(url);
      return response.data.map((country) => country.name);
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      return [];
    }
  }

  async getLanguages(): Promise<string[]> {
    try {
      const url = `${this.filtersUrl}languages`;
      const response: AxiosResponse<{ name: string }[]> = await axios.get(url);
      return response.data.map((language) => language.name);
    } catch (error) {
      console.error('Erro ao buscar idiomas:', error);
      return [];
    }
  }
}

export default RadioApi;