import React, { useState, useRef, useEffect } from 'react';
import RadioApi from '../../Radio-API';
import CardRadio from '../../components/cardRadio';
import SelectRadio from '../../components/selectRadio';
import styles from './Home.module.css';

function Home() {
  const searchPageRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState<number>(0);
  const [isSearchPageVisible, setIsSearchPageVisible] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchCountry, setSearchCountry] = useState<string>('');
  const [searchLanguage, setSearchLanguage] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const radioApi = new RadioApi();
  const [favoriteRadios, setFavoriteRadios] = useState<string[]>(
    localStorage.getItem('favoriteRadios')?.split(',') || []
  );

  useEffect(() => {
    const fetchInitialRadios = async () => {
      setLoading(true);
      const radios = await radioApi.searchStations('', 'name', page, 10);
      setSearchResults(radios);
      setLoading(false);
    };

    if (isSearchPageVisible) {
      setPage(1);
      fetchInitialRadios();
    }
  }, [isSearchPageVisible]);

  useEffect(() => {
    const fetchSearchedRadios = async () => {
      setLoading(true);
      const radiosByName = searchTerm
        ? await radioApi.searchStations(searchTerm, 'name', page, 10)
        : [];
      const radiosByCountry = searchCountry
        ? await radioApi.searchStations(searchCountry, 'country', page, 10)
        : [];
      const radiosByLanguage = searchLanguage
        ? await radioApi.searchStations(searchLanguage, 'language', page, 10)
        : [];

      // Combine and remove duplicates (simplistic approach, adjust as needed)
      const combinedResults = [...radiosByName, ...radiosByCountry, ...radiosByLanguage];
      const uniqueResults = Array.from(new Map(combinedResults.map(radio => [radio.stationuuid, radio])).values());

      setSearchResults(uniqueResults);
      setLoading(false);
    };

    if (isSearchPageVisible) {
      setPage(1);
      fetchSearchedRadios();
    }
  }, [searchTerm, searchCountry, searchLanguage, isSearchPageVisible]);

  useEffect(() => {
    localStorage.setItem('favoriteRadios', favoriteRadios.join(','));
  }, [favoriteRadios]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startX === null) {
      return;
    }

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    const newTranslateX = Math.min(window.innerWidth, Math.max(0, deltaX));
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || startX === null) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);
    setStartX(null);

    const threshold = window.innerWidth * 0.25;
    if (translateX > threshold) {
      setIsSearchPageVisible(true);
      setTranslateX(0);
    } else {
      setTranslateX(-window.innerWidth);
      setIsSearchPageVisible(false);
    }
  };

  const handleCloseSearchPage = () => {
    setIsSearchPageVisible(false);
    setTranslateX(-window.innerWidth);
    setSearchTerm('');
    setSearchCountry('');
    setSearchLanguage('');
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type: 'country' | 'language', value: string) => {
    if (type === 'country') {
      setSearchCountry(value);
    } else if (type === 'language') {
      setSearchLanguage(value);
    }
  };

  const toggleFavorite = (stationuuid: string) => {
    if (favoriteRadios.includes(stationuuid)) {
      setFavoriteRadios(favoriteRadios.filter((id) => id !== stationuuid));
    } else {
      setFavoriteRadios([...favoriteRadios, stationuuid]);
    }
  };

  const favoriteRadioList = favoriteRadios.map(uuid => ({ stationuuid: uuid })); // Simplistic

  return (
    <div className={styles.container}>
      <div
        ref={searchPageRef}
        className={styles.searchPage}
        style={{
          transform: `translateX(${isSearchPageVisible ? 0 : translateX - window.innerWidth}px)`,
          visibility: isSearchPageVisible || translateX > 0 ? 'visible' : 'hidden',
        }}
      >
        <i id={styles.filter} className="fa-solid fa-bars"></i>
        <input
          type="text"
          placeholder="Search here"
          className={styles.searchBar}
          value={searchTerm}
          onChange={handleSearchInputChange}
        />
        <div className={styles.filterOptions}>
          <input
            type="text"
            placeholder="Filter by country"
            value={searchCountry}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by language"
            value={searchLanguage}
            onChange={(e) => handleFilterChange('language', e.target.value)}
          />
        </div>
        <div className={styles.radioList}>
          {loading ? (
            <p>Loading radios...</p>
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
          <button onClick={() => setPage(prev => prev + 1)}>Load More</button>
        </div>
        <button onClick={handleCloseSearchPage}>Close Search</button>
      </div>
      <div
        className={styles.favoritesPage}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <i id={styles.search} className="fa-solid fa-magnifying-glass" onClick={() => setIsSearchPageVisible(true)}></i>
        <h1 className={styles.title}>Radio Browser</h1>
        <div className={styles.favoritesRadios}>
          <p>FAVORITE RADIOS</p>
          {favoriteRadioList.map((favRadio) => (
            <CardRadio key={favRadio.stationuuid} name="Loading..." country="" countrycode="" url_resolved="" isPlaying={false} onPlay={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;