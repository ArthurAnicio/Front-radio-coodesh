import { useEffect, useState } from 'react';
import CardRadio from '../../components/cardRadio';
import RadioApi from '../../Radio-API';
import styles from './Test.module.css';

interface RadioStation {
  name: string;
  country: string;
  countrycode: string;
  url_resolved: string;
  stationuuid: string;
}

function Test() {
  const [radios, setRadios] = useState<RadioStation[]>([]);
  const [currentRadioUrl, setCurrentRadioUrl] = useState<string | undefined>(localStorage.getItem('actual_radio') || undefined);
  const radioApi = new RadioApi();

  useEffect(() => {
    async function fetchRadios() {
      try {
        const fetchedRadios = await radioApi.searchStations('', 'name', 1, 10);
        setRadios(fetchedRadios);
      } catch (error) {
        console.error('Erro ao buscar rádios:', error);
      }
    }

    fetchRadios();
  }, []);

  const handlePlayRadio = (url: string) => {
    setCurrentRadioUrl(url);
    localStorage.setItem('actual_radio', url);
  };

  return (
    <div className={styles.cont}>
      <audio src={currentRadioUrl} controls autoPlay={!!currentRadioUrl}></audio>
      {radios.map((radio) => (
        <CardRadio
          key={radio.stationuuid}
          name={radio.name}
          country={radio.country}
          countrycode={radio.countrycode}
          url_resolved={radio.url_resolved}
          isPlaying={currentRadioUrl === radio.url_resolved}
          onPlay={handlePlayRadio}
        />
      ))}
    </div>
  );
}

export default Test;