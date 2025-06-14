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

  const [isSearchPageVisible, setIsSearchPageVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [volume, setVolume] = useState(50);
  const [volumeIcon, setVolumeIcon] = useState("fa-solid fa-volume-low");

  const radioApi = new RadioApi();

  const [favoriteRadios, setFavoriteRadios] = useState<string[]>(
    localStorage.getItem('favoriteRadios')?.split(',').filter(Boolean) || []
  );

  const [currentRadioUrl, setCurrentRadioUrl] = useState<string | undefined>(
    localStorage.getItem('actual_radio') || undefined
  );

  const [currentRadioName, setCurrentRadioName] = useState<string | undefined>(
    localStorage.getItem('actual_radio_name') || 'Nenhuma rádio escolhida'
  );

  const [favoriteRadioList, setFavoriteRadioList] = useState<RadioStation[]>([]);

  const [countries, setCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [isPlayingCurrentRadio, setIsPlayingCurrentRadio] = useState<boolean>(false);

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
          if (radioDetails) favoriteStations.push(radioDetails);
        } catch (error) {
          console.error(`Erro ao buscar rádio ${uuid}:`, error);
        }
      }
    }

    setFavoriteRadioList(favoriteStations);
    setLoading(false);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

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

      const uniqueNewResults = Array.from(new Map(newResults.map(r => [r.stationuuid, r])).values());
      setSearchResults(uniqueNewResults);
      setLoading(false);
    };

    fetchRadios();
  }, [searchTerm, searchCountry, searchLanguage, page, isSearchPageVisible]);

  useEffect(() => {
    localStorage.setItem('favoriteRadios', favoriteRadios.join(','));
    fetchFavoriteRadiosDetails();
  }, [favoriteRadios]);

  useEffect(() => {
    if (!isSearchPageVisible && window.innerWidth < 1100) {
      fetchFavoriteRadiosDetails();
    }
  }, [isSearchPageVisible]);

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

  const handlePlayRadio = (url: string, name: string) => {
    setCurrentRadioUrl(url);
    setCurrentRadioName(name);
    localStorage.setItem('actual_radio', url);
    localStorage.setItem('actual_radio_name', name);
    setIsPlayingCurrentRadio(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleStopRadio = () => {
    setCurrentRadioUrl(undefined);
    setCurrentRadioName('Nenhuma rádio escolhida');
    localStorage.removeItem('actual_radio');
    localStorage.removeItem('actual_radio_name');
    setIsPlayingCurrentRadio(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
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
    if (type === 'country') setSearchCountry(value);
    if (type === 'language') setSearchLanguage(value);
    setPage(1);
    setSearchResults([]);
  };

  const toggleFavorite = (stationuuid: string) => {
    const isFavorite = favoriteRadios.includes(stationuuid);
    const station = favoriteRadioList.find(r => r.stationuuid === stationuuid);
    const isPlaying = currentRadioUrl && station && currentRadioUrl === station.url_resolved;

    let updatedFavorites = isFavorite
      ? favoriteRadios.filter((id) => id !== stationuuid)
      : [...favoriteRadios, stationuuid];

    if (isFavorite && isPlaying) handleStopRadio();
    setFavoriteRadios(updatedFavorites);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  useEffect(() => {
    if (volume >= 60) {
      setVolumeIcon('fa-solid fa-volume-high');
    } else if (volume > 0) {
      setVolumeIcon('fa-solid fa-volume-low');
    } else {
      setVolumeIcon('fa-solid fa-volume-xmark');
    }
  }, [volume]);

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
          <button className={styles.loadButton} onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Carregando...' : 'Carregue mais'}
          </button>
        </div>
      </div>
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
      {(!isSearchPageVisible || window.innerWidth >= 1100) ? (
        <div className={styles.volumeContainer}>
          <i className={volumeIcon} id={styles.volumeIcon} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>
      ) : null}
    </div>
  );
}

export default Home;
