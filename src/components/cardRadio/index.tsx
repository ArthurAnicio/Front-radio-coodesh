import styles from './CardRadio.module.css';

// Definição das props que o componente `CardRadio` recebe
interface CardRadioProps {
  name: string; // Nome da estação de rádio
  country: string; // País onde a estação de rádio está localizada
  countrycode: string; // Código do país da estação de rádio
  url_resolved: string; // URL para reproduzir a estação de rádio
  isPlaying: boolean; // Estado que indica se a estação está tocando ou não
  onPlay: (url: string) => void; // Função que será chamada para iniciar a reprodução
  onStop: () => void; // Função que será chamada para parar a reprodução
  onRemoveFavorite?: (uuid: string) => void; // Função opcional para remover a estação dos favoritos
  stationuuid?: string; // Identificador único da estação de rádio
}

// Componente CardRadio
function CardRadio({
  name, // Nome da estação
  country, // País da estação
  countrycode, // Código do país
  url_resolved, // URL para a estação
  isPlaying, // Estado de reprodução
  onPlay, // Função para iniciar a reprodução
  onStop, // Função para parar a reprodução
  onRemoveFavorite, // Função para remover do favoritos
  stationuuid, // ID único da estação
}: CardRadioProps) {

  // Função que lida com o clique no ícone de play/pause
  const handlePlayClick = () => {
    if (isPlaying) {
      // Se a estação já estiver tocando, para a reprodução
      onStop();
    } else {
      // Se a estação não estiver tocando, começa a reprodução
      onPlay(url_resolved);
    }
  };

  // Função que lida com o clique no ícone de remoção dos favoritos
  const handleRemoveClick = () => {
    if (stationuuid && onRemoveFavorite) {
      // Se houver um uuid da estação e uma função de remoção, chama a função para removê-la dos favoritos
      onRemoveFavorite(stationuuid);
    }
  };

  return (
    <div className={styles.cardRadio}>
      {/* Ícone de play/pause */}
      <div className={styles.playResume} onClick={handlePlayClick}>
        {/* Se estiver tocando, mostra o ícone de pause; caso contrário, o ícone de play */}
        {isPlaying ? <i className="fa-solid fa-square"></i> : <i className="fa-solid fa-play"></i>}
      </div>

      {/* Exibição do nome da estação e do país */}
      <div className={styles.radioName}>
        {name}
        <br />
        <div className={styles.contry}>
          {/* Exibe o código do país e o nome do país */}
          {countrycode}-{country}
        </div>
      </div>

      {/* Ícone de remoção de favoritos (aparece apenas se onRemoveFavorite for fornecido) */}
      {onRemoveFavorite && (
        <i id={styles.remove} className="fa-solid fa-trash" onClick={handleRemoveClick}></i>
      )}
    </div>
  );
}

export default CardRadio;
