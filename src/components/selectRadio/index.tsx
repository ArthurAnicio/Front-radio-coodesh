import styles from "./SelectRadio.module.css";

interface SelectRadioProps {
  name: string; // Nome da rádio exibido no card
  isFavorite: boolean; // Define se a rádio já é favorita ou não
  stationuuid: string; // UUID da rádio usado para identificá-la
  onFavoriteToggle: (uuid: string) => void; // Função que adiciona ou remove a rádio dos favoritos
}

function SelectRadio({ name, isFavorite, stationuuid, onFavoriteToggle }: SelectRadioProps) {
  const handleFavoriteClick = () => {
    onFavoriteToggle(stationuuid); // Ao clicar no ícone, chama a função passando o UUID
  };

  return (
    <div className={styles.selectRadio}>
      <p className={styles.radioName}>{name}</p> {/* Exibe o nome da rádio */}
      <i
        id={styles.check}
        className={`fa-solid ${isFavorite ? 'fa-check' : 'fa-plus'}`} // Ícone muda dependendo se a rádio é favorita
        onClick={handleFavoriteClick}
      ></i>
    </div>
  );
}

export default SelectRadio;
