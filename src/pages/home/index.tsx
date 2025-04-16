/**
 * Componente principal da página inicial da aplicação de rádios.
 * Responsável por listar rádios favoritas, pesquisar novas rádios
 * por nome, país ou idioma, e reproduzir as estações selecionadas.
 */

import React, { useState, useRef, useEffect } from 'react';
import RadioApi from '../../Radio-API';
import CardRadio from '../../components/cardRadio';
import SelectRadio from '../../components/selectRadio';
import styles from './Home.module.css';
import RadioStation from '../../Radio-Class';
import SearchableInput from '../../components/searchableInput';

function Home() {
  // Refs para manipulação direta do DOM e do elemento de áudio
  const searchPageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Estados da aplicação
  const [isSearchPageVisible, setIsSearchPageVisible] = useState(false); // Visibilidade da página de busca
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca por nome
  const [searchCountry, setSearchCountry] = useState(''); // Filtro por país
  const [searchLanguage, setSearchLanguage] = useState(''); // Filtro por idioma
  const [searchResults, setSearchResults] = useState<any[]>([]); // Resultados da busca
  const [page, setPage] = useState(1); // Paginação
  const [loading, setLoading] = useState(false); // Estado de carregamento

  const radioApi = new RadioApi(); // Instância da API de rádios

  const [favoriteRadios, setFavoriteRadios] = useState<string[]>(
    localStorage.getItem('favoriteRadios')?.split(',').filter(Boolean) || []
  ); // Lista de rádios favoritas (IDs)

  const [currentRadioUrl, setCurrentRadioUrl] = useState<string | undefined>(
    localStorage.getItem('actual_radio') || undefined
  ); // URL da rádio atualmente tocando

  const [currentRadioName, setCurrentRadioName] = useState<string | undefined>(
    localStorage.getItem('actual_radio_name') || 'Nenhuma radio escolhida'
  ); // Nome da rádio atualmente tocando

  const [favoriteRadioList, setFavoriteRadioList] = useState<RadioStation[]>([]); // Detalhes das rádios favoritas

  const [countries, setCountries] = useState<string[]>([]); // Lista de países para o filtro
  const [languages, setLanguages] = useState<string[]>([]); // Lista de idiomas para o filtro

  const [isPlayingCurrentRadio, setIsPlayingCurrentRadio] = useState<boolean>(false); // Status da reprodução

  /**
   * Busca e define os países e idiomas disponíveis para filtros.
   */
  useEffect(() => {
    const fetchFilters = async () => {
      const fetchedCountries = await radioApi.getCountries();
      const fetchedLanguages = await radioApi.getLanguages();
      setCountries(fetchedCountries);
      setLanguages(fetchedLanguages);
    };

    fetchFilters();
  }, []);

  /**
   * Carrega os detalhes das rádios favoritas a partir do localStorage.
   */
  const fetchFavoriteRadiosDetails = async () => {
    setLoading(true);
    const favoriteUuids = localStorage.getItem('favoriteRadios')?.split(',') || [];
    const favoriteStations: RadioStation[] = [];

    for (const uuid of favoriteUuids) {
      if (uuid) {
        try {
          const radioDetails = await radioApi.searchByUuid(uuid);
          if (radioDetails) favoriteStations.push(radioDetails);
        } catch (error) {
          console.error(`Erro ao buscar detalhes da rádio favorita ${uuid}:`, error);
        }
      }
    }

    setFavoriteRadioList(favoriteStations);
    setLoading(false);
  };

  /**
   * Incrementa a página para carregar mais resultados.
   */
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  /**
   * Busca as rádios com base no filtro selecionado (nome, país ou idioma).
   * É executado toda vez que um filtro muda ou a página é alterada.
   */
  useEffect(() => {
    const fetchRadios = async () => {
      setLoading(true);
      let newResults: any[] = [];

      if (searchTerm) {
        newResults = await radioApi.searchStations(searchTerm, 'name', page, 10);
      } else if (searchCountry) {
        newResults = await radioApi.searchStations(searchCountry, 'country', page, 10);
      } else if (searchLanguage) {
        newResults = await radioApi.searchStations(searchLanguage, 'language', page, 10);
      } else if (window.innerWidth >= 1100 || isSearchPageVisible) {
        newResults = await radioApi.searchStations('', 'name', page, 10);
      }

      // Remove rádios duplicadas pelo UUID
      const uniqueNewResults = Array.from(new Map(newResults.map(r => [r.stationuuid, r])).values());
      setSearchResults(uniqueNewResults);
      setLoading(false);
    };

    fetchRadios();
  }, [searchTerm, searchCountry, searchLanguage, page, isSearchPageVisible]);

  /**
   * Atualiza o localStorage e recarrega os detalhes das rádios favoritas
   * sempre que a lista de favoritos mudar.
   */
  useEffect(() => {
    localStorage.setItem('favoriteRadios', favoriteRadios.join(','));
    fetchFavoriteRadiosDetails();
  }, [favoriteRadios]);

  /**
   * Atualiza os favoritos ao sair da tela de busca (em dispositivos menores).
   */
  useEffect(() => {
    if (!isSearchPageVisible && window.innerWidth < 1100) {
      fetchFavoriteRadiosDetails();
    }
  }, [isSearchPageVisible]);

  /**
   * Garante que em telas grandes, a página de busca esteja sempre visível.
   */
  useEffect(() => {
    if (window.innerWidth >= 1100) {
      setIsSearchPageVisible(true);
      setPage(1);
      setSearchResults([]);
    } else {
      setPage(1);
      setSearchResults([]);
    }
  }, [window.innerWidth]);

  /**
   * Toca a rádio selecionada e atualiza o localStorage.
   */
  const handlePlayRadio = (url: string, name: string) => {
    setCurrentRadioUrl(url);
    setCurrentRadioName(name);
    localStorage.setItem('actual_radio', url);
    localStorage.setItem('actual_radio_name', name);
    setIsPlayingCurrentRadio(true);
    audioRef.current?.play();
  };

  /**
   * Para a reprodução da rádio atual.
   */
  const handleStopRadio = () => {
    setCurrentRadioUrl(undefined);
    setCurrentRadioName('Nenhuma radio escolhida');
    localStorage.removeItem('actual_radio');
    localStorage.removeItem('actual_radio_name');
    setIsPlayingCurrentRadio(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  /**
   * Fecha a página de busca e limpa os filtros.
   */
  const handleCloseSearchPage = () => {
    setIsSearchPageVisible(false);
    setSearchTerm('');
    setSearchCountry('');
    setSearchLanguage('');
    setPage(1);
    setSearchResults([]);
  };

  /**
   * Atualiza o termo de busca por nome de rádio.
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setSearchResults([]);
  };

  /**
   * Atualiza os filtros de país ou idioma.
   */
  const handleFilterChange = (type: 'country' | 'language', value: string) => {
    if (type === 'country') setSearchCountry(value);
    if (type === 'language') setSearchLanguage(value);
    setPage(1);
    setSearchResults([]);
  };

  /**
   * Adiciona ou remove uma rádio dos favoritos.
   * Também para a reprodução caso a rádio removida esteja tocando.
   */
  const toggleFavorite = (stationuuid: string) => {
    const isCurrentlyFavorite = favoriteRadios.includes(stationuuid);
    const stationToRemove = favoriteRadioList.find(r => r.stationuuid === stationuuid);
    const isCurrentlyPlaying = currentRadioUrl && stationToRemove && currentRadioUrl === stationToRemove.url_resolved;

    let updatedFavorites: string[];

    if (isCurrentlyFavorite) {
      updatedFavorites = favoriteRadios.filter((id) => id !== stationuuid);
      if (isCurrentlyPlaying) handleStopRadio();
    } else {
      updatedFavorites = [...favoriteRadios, stationuuid];
    }

    setFavoriteRadios(updatedFavorites);
    localStorage.setItem('favoriteRadios', updatedFavorites.join(','));
  };

  // Renderização do componente
  return (
    <div className={styles.container}>
      {/* Página de busca com filtros */}
      <div
        ref={searchPageRef}
        className={styles.searchPage}
        style={{
          transform: `translateX(${isSearchPageVisible ? 0 : -window.innerWidth}px)`,
          visibility: isSearchPageVisible ? 'visible' : 'hidden',
        }}
      >
        <i id={styles.back} onClick={handleCloseSearchPage} className="fa-solid fa-arrow-right"></i>
        <input
          type="text"
          placeholder="Nome da rádio"
          className={styles.searchBar}
          value={searchTerm}
          onChange={handleSearchInputChange}
        />

        <SearchableInput
          label="Filtrar por país"
          options={countries}
          value={searchCountry}
          onChange={(value) => handleFilterChange('country', value)}
        />

        <SearchableInput
          label="Filtrar por idioma"
          options={languages}
          value={searchLanguage}
          onChange={(value) => handleFilterChange('language', value)}
        />

        <div className={styles.radioList}>
          {loading ? (
            <p>Carregando rádios...</p>
          ) : (
            searchResults.map((radio: any) => (
              <SelectRadio
                key={radio.stationuuid}
                name={radio.name}
                isFavorite={favoriteRadios.includes(radio.stationuuid)}
                stationuuid={radio.stationuuid}
                onFavoriteToggle={toggleFavorite}
              />
            ))
          )}
          <button
            className={styles.loadButton}
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Carregue mais'}
          </button>
        </div>
      </div>

      {/* Página de favoritos e rádio em reprodução */}
      <div className={styles.favoritesPage}>
        <i id={styles.search} className="fa-solid fa-magnifying-glass" onClick={() => setIsSearchPageVisible(true)}></i>
        <h1 className={styles.title}>Radio Browser</h1>

        <div className={styles.nowPlayingContainer}>
          <div
            className={styles.playResume}
            onClick={() => {
              if (currentRadioUrl && audioRef.current) {
                if (isPlayingCurrentRadio) {
                  audioRef.current.pause();
                  setIsPlayingCurrentRadio(false);
                } else {
                  audioRef.current.play();
                  setIsPlayingCurrentRadio(true);
                }
              }
            }}
          >
            {isPlayingCurrentRadio ? <i className="fa-solid fa-square" /> : <i className="fa-solid fa-play" />}
          </div>
          <p className={styles.nowPlaying}>
            {currentRadioUrl ? `Tocando: ${currentRadioName}` : 'Nenhuma rádio selecionada'}
          </p>
        </div>

        <div className={styles.favoritesRadios}>
          <p>RADIOS FAVORITAS</p>
          <div className={styles.radiosList}>
            <audio
              ref={audioRef}
              className={styles.radioPlayer}
              src={currentRadioUrl}
              controls={false}
              autoPlay={!!currentRadioUrl}
              style={{ display: 'none' }}
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>

            {loading ? (
              <p>Carregando rádios favoritas...</p>
            ) : (
              favoriteRadioList.map((radio) => (
                <CardRadio
                  key={radio.stationuuid}
                  name={radio.name}
                  country={radio.country}
                  countrycode={radio.countrycode}
                  url_resolved={radio.url_resolved}
                  isPlaying={currentRadioUrl === radio.url_resolved && isPlayingCurrentRadio}
                  onPlay={() => handlePlayRadio(radio.url_resolved, radio.name)}
                  onStop={handleStopRadio}
                  onRemoveFavorite={toggleFavorite}
                  stationuuid={radio.stationuuid}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
