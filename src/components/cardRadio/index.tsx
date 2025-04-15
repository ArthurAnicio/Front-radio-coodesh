import styles from './CardRadio.module.css';

interface CardRadioProps {
  name: string;
  country: string;
  countrycode: string;
  url_resolved: string;
  isPlaying: boolean;
  onPlay: (url: string) => void;
  onStop: () => void; 
  onRemoveFavorite?: (uuid: string) => void;
  stationuuid?: string;
}

function CardRadio({ name, country, countrycode, url_resolved, isPlaying, onPlay, onStop, onRemoveFavorite, stationuuid }: CardRadioProps) {
  const handlePlayClick = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay(url_resolved);
    }
  };

  const handleRemoveClick = () => {
    if (stationuuid && onRemoveFavorite) {
      onRemoveFavorite(stationuuid);
    }
  };

  return (
    <div className={styles.cardRadio} >
      <div className={styles.playResume} onClick={handlePlayClick}>
        {isPlaying ? <i className="fa-solid fa-square"></i> : <i className="fa-solid fa-play"></i>}
      </div>
      <div className={styles.radioName}>
        {name}
        <br />
        <div className={styles.contry}>
          {countrycode}-{country}
        </div>
      </div>
      {onRemoveFavorite && (
        <i id={styles.remove} className="fa-solid fa-trash" onClick={handleRemoveClick}></i>
      )}
    </div>
  );
}

export default CardRadio;