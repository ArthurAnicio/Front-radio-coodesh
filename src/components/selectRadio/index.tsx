import styles from "./SelectRadio.module.css";

interface SelectRadioProps {
  name: string;
  isFavorite: boolean;
  stationuuid: string;
  onFavoriteToggle: (uuid: string) => void;
}

function SelectRadio({ name, isFavorite, stationuuid, onFavoriteToggle }: SelectRadioProps) {
  const handleFavoriteClick = () => {
    onFavoriteToggle(stationuuid);
  };

  return (
    <div className={styles.selectRadio}>
      <p className={styles.radioName}>{name}</p>
      <i
        id={styles.check}
        className={`fa-solid ${isFavorite ? 'fa-check' : 'fa-plus'}`}
        onClick={handleFavoriteClick}
      ></i>
    </div>
  );
}

export default SelectRadio;