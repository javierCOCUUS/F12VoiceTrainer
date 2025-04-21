import Sound from 'react-native-sound';

// Configurar categoría de sonido
Sound.setCategory('Playback');

// Precargar sonidos
const sounds = {
  beep: new Sound('beep.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.error('Error cargando sonido beep:', error);
    }
  }),
  serieCompleted: new Sound('serie_completed.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.error('Error cargando sonido serie_completed:', error);
    }
  }),
  exerciseCompleted: new Sound('exercise_completed.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.error('Error cargando sonido exercise_completed:', error);
    }
  })
};

// Reproducir sonido
export const playSound = (soundName) => {
  if (sounds[soundName]) {
    // Asegurarse de que el sonido esté listo para reproducir
    sounds[soundName].stop(() => {
      sounds[soundName].play((success) => {
        if (!success) {
          console.log(`Error reproduciendo sonido: ${soundName}`);
        }
      });
    });
  } else {
    console.warn(`Sonido no encontrado: ${soundName}`);
  }
};
