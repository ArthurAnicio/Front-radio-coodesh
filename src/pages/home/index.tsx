import React, { useState, useRef, useEffect } from 'react';
import RadioApi from '../../Radio-API';
import CardRadio from '../../components/cardRadio';
import SelectRadio from '../../components/selectRadio';
import styles from './Home.module.css';
import RadioStation from '../../Radio-Class';
import SearchableInput from '../../components/searchableInput';

function Home() {
  const searchPageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isSearchPageVisible, setIsSearchPageVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchCountry, setSearchCountry] = useState<string>('');
  const [searchLanguage, setSearchLanguage] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const radioApi = new RadioApi();
  const [favoriteRadios, setFavoriteRadios] = useState<string[]>(
    localStorage.getItem('favoriteRadios')?.split(',').filter(Boolean) || []
  );
  const [currentRadioUrl, setCurrentRadioUrl] = useState<string | undefined>(
    localStorage.getItem('actual_radio') || undefined
  );
  const [currentRadioName, setCurrentRadioName] = useState<string | undefined>(
    localStorage.getItem('actual_radio_name') || 'Nenhuma radio escolhida'
  );
  const [favoriteRadioList, setFavoriteRadioList] = useState<RadioStation[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      const fetchedCountries = await radioApi.getCountries();
      const fetchedLanguages = await radioApi.getLanguages();
      setCountries(fetchedCountries);
      setLanguages(fetchedLanguages);
    };

    fetchFilters();
  }, []);

  const fetchFavoriteRadiosDetails = async () => {
    setLoading(true);
    const favoriteUuids = localStorage.getItem('favoriteRadios')?.split(',') || [];
    const favoriteStations: RadioStation[] = [];

    for (const uuid of favoriteUuids) {
      if (uuid) {
        try {
          const radioDetails = await radioApi.searchByUuid(uuid);
          if (radioDetails) {
            favoriteStations.push(radioDetails);
          }
        } catch (error) {
          console.error(`Erro ao buscar detalhes da rádio favorita ${uuid}:`, error);
        }
      }
    }
    setFavoriteRadioList(favoriteStations);
    setLoading(false);
  };

  useEffect(() => {
    const fetchInitialRadios = async () => {
      setLoading(true);
      const radios = await radioApi.searchStations('', 'name', page, 10);
      setSearchResults(radios);
      setLoading(false);
    };

    if (isSearchPageVisible) {
      setPage(1);
      setSearchResults([]);
      fetchInitialRadios();
    }
  }, [isSearchPageVisible]);

  useEffect(() => {
    const fetchSearchedRadios = async () => {
      setLoading(true);
      const searchParamsPresent = searchTerm || searchCountry || searchLanguage;

      if (searchParamsPresent) {
        const radiosByName = searchTerm
          ? await radioApi.searchStations(searchTerm, 'name', page, 10)
          : [];
        const radiosByCountry = searchCountry
          ? await radioApi.searchStations(searchCountry, 'country', page, 10)
          : [];
        const radiosByLanguage = searchLanguage
          ? await radioApi.searchStations(searchLanguage, 'language', page, 10)
          : [];

        const combinedResults = [...radiosByName, ...radiosByCountry, ...radiosByLanguage];
        const uniqueResults = Array.from(new Map(combinedResults.map(radio => [radio.stationuuid, radio])).values());

        setSearchResults(uniqueResults);
      } else if (isSearchPageVisible) {
        const initialRadios = await radioApi.searchStations('', 'name', page, 10);
        setSearchResults(initialRadios);
      }
      setLoading(false);
    };

    if (isSearchPageVisible) {
      fetchSearchedRadios();
    }
  }, [searchTerm, searchCountry, searchLanguage, isSearchPageVisible, page]);

  useEffect(() => {
    localStorage.setItem('favoriteRadios', favoriteRadios.join(','));
    fetchFavoriteRadiosDetails();
  }, [favoriteRadios]);

  useEffect(() => {
    if (!isSearchPageVisible) {
      fetchFavoriteRadiosDetails();
    }
  }, [isSearchPageVisible]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        localStorage.setItem('favoriteRadios', "");
        localStorage.setItem('actual_radio', "");
        localStorage.setItem('actual_radio_name', '');
        setFavoriteRadios([]);
        setCurrentRadioUrl(undefined);
        setCurrentRadioName('Nenhuma radio escolhida');

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePlayRadio = (url: string, name: string) => {
    setCurrentRadioUrl(url);
    setCurrentRadioName(name);
    localStorage.setItem('actual_radio', url);
    localStorage.setItem('actual_radio_name', name);
  };

  const handleCloseSearchPage = () => {
    setIsSearchPageVisible(false);
    setSearchTerm('');
    setSearchCountry('');
    setSearchLanguage('');
    setPage(1);
    setSearchResults([]);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setSearchResults([]);
  };

  const handleFilterChange = (type: 'country' | 'language', value: string) => {
    if (type === 'country') {
      setSearchCountry(value);
    } else if (type === 'language') {
      setSearchLanguage(value);
    }
    setPage(1);
    setSearchResults([]);
  };

  const toggleFavorite = (stationuuid: string) => {
    const isCurrentlyFavorite = favoriteRadios.includes(stationuuid);
    const stationToRemove = favoriteRadioList.find(r => r.stationuuid === stationuuid);
    const isCurrentlyPlaying = currentRadioUrl && stationToRemove && currentRadioUrl === stationToRemove.url_resolved;

    let updatedFavorites: string[];

    if (isCurrentlyFavorite) {
      updatedFavorites = favoriteRadios.filter((id) => id !== stationuuid);
      setFavoriteRadios(updatedFavorites);

      if (isCurrentlyPlaying) {
        setCurrentRadioUrl(undefined);
        setCurrentRadioName('Nenhuma radio escolhida');
        localStorage.removeItem('actual_radio');
        localStorage.removeItem('actual_radio_name');

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
    } else {
      updatedFavorites = [...favoriteRadios, stationuuid];
      setFavoriteRadios(updatedFavorites);
    }

    localStorage.setItem('favoriteRadios', updatedFavorites.join(','));
  };

  return (
    <div className={styles.container}>
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
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Carregue mais'}
          </button>
        </div>
      </div>
      <div className={styles.favoritesPage}>
        <i id={styles.search} className="fa-solid fa-magnifying-glass" onClick={() => setIsSearchPageVisible(true)}></i>
        <h1 className={styles.title}>Radio Browser</h1>
        <div className={styles.favoritesRadios}>
          <p>RADIOS FAVORITAS </p>
          <div className={styles.radiosList}>
            <audio
              ref={audioRef}
              className={styles.radioPlayer}
              src={currentRadioUrl}
              controls
              autoPlay={!!currentRadioUrl}
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
            <p className={styles.nowPlaying}>Tocando: {currentRadioName}</p>
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
                  isPlaying={currentRadioUrl === radio.url_resolved}
                  onPlay={() => handlePlayRadio(radio.url_resolved, radio.name)}
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