import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import { EjerciciosAlternativos, MaquinaAlternativas } from '../data/ejercicios-alternativos';
import { saveWorkout } from '../utils/storage';
import { playSound } from '../utils/audio';

const AlternativeExerciseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { machineId, machineName } = route.params;
  
  const [alternatives, setAlternatives] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [currentSeries, setCurrentSeries] = useState(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const restTimerRef = useRef(null);
  
  // Inicializar reconocimiento de voz
  useEffect(() => {
    // Configurar Voice
    const setupVoice = async () => {
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
    };
    
    setupVoice();
    
    // Limpiar al desmontar
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, []);
  
  // Cargar ejercicios alternativos para la máquina seleccionada
  useEffect(() => {
    if (machineId && MaquinaAlternativas[machineId]) {
      const alternativeIds = MaquinaAlternativas[machineId];
      const exerciseList = alternativeIds.map(id => 
        EjerciciosAlternativos.find(ex => ex.id === id)
      ).filter(ex => ex !== undefined);
      
      setAlternatives(exerciseList);
      if (exerciseList.length > 0) {
        setCurrentExercise(exerciseList[0]);
      }
    }
  }, [machineId]);
  
  // Actualizar ejercicio actual cuando cambia el índice
  useEffect(() => {
    if (alternatives.length > 0 && currentIndex < alternatives.length) {
      setCurrentExercise(alternatives[currentIndex]);
    }
  }, [currentIndex, alternatives]);
  
  // Manejar resultados del reconocimiento de voz
  const onSpeechResults = (event) => {
    if (event.value && event.value.length > 0) {
      const transcript = event.value[0].toLowerCase();
      
      // En modo selección de ejercicio
      if (!isExerciseActive) {
        if (transcript.includes('siguiente') || transcript.includes('próximo')) {
          handleNext();
        } else if (transcript.includes('anterior') || transcript.includes('previo')) {
          handlePrevious();
        } else if (transcript.includes('aceptar') || transcript.includes('este') || 
                  transcript.includes('seleccionar')) {
          handleAccept();
        }
      } 
      // En modo ejercicio activo
      else {
        if (transcript.includes('arriba') || transcript.includes('completado') || 
            transcript.includes('hecho') || transcript.includes('uno')) {
          incrementRepetitionCount();
        } else if (transcript.includes('terminar serie') || transcript.includes('siguiente serie')) {
          finishSeries();
        } else if (transcript.includes('terminar ejercicio') || 
                  transcript.includes('completar ejercicio')) {
          completeExercise();
        } else if (isResting && (transcript.includes('omitir descanso') || 
                               transcript.includes('saltar descanso'))) {
          skipRest();
        }
      }
    }
  };
  
  // Manejar errores de reconocimiento de voz
  const onSpeechError = (error) => {
    console.log('Error de voz:', error);
  };
  
  // Iniciar/detener reconocimiento de voz
  const toggleVoiceRecognition = async () => {
    try {
      if (isVoiceEnabled) {
        await Voice.stop();
        setIsVoiceEnabled(false);
      } else {
        await Voice.start('es-ES');
        setIsVoiceEnabled(true);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  // Navegar al ejercicio anterior
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(alternatives.length - 1);
    }
  };
  
  // Navegar al siguiente ejercicio
  const handleNext = () => {
    if (currentIndex < alternatives.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };
  
  // Aceptar el ejercicio actual y comenzar
  const handleAccept = () => {
    if (currentExercise) {
      setIsExerciseActive(true);
      setRepetitionCount(0);
      setCurrentSeries(1);
      
      // Asegurar que el reconocimiento de voz esté activo
      if (!isVoiceEnabled) {
        toggleVoiceRecognition();
      }
    }
  };
  
  // Incrementar contador de repeticiones
  const incrementRepetitionCount = () => {
    setRepetitionCount(prev => {
      const newCount = prev + 1;
      
      // Reproducir feedback de audio
      playSound('beep');
      
      // Si completamos las repeticiones de la serie
      if (newCount >= currentExercise.repeticiones) {
        // Reproducir sonido de serie completada
        playSound('serieCompleted');
        
        // Mostrar alerta para finalizar serie
        setTimeout(() => {
          Alert.alert(
            "Serie Completada",
            `Has completado la serie ${currentSeries} de ${currentExercise.series}`,
            [
              {
                text: "Siguiente Serie",
                onPress: () => finishSeries()
              }
            ]
          );
        }, 500);
      }
      
      return newCount;
    });
  };
  
  // Finalizar serie actual y preparar la siguiente
  const finishSeries = () => {
    if (currentSeries < currentExercise.series) {
      setCurrentSeries(prev => prev + 1);
      setRepetitionCount(0);
      startRest();
    } else {
      completeExercise();
    }
  };
  
  // Iniciar período de descanso
  const startRest = () => {
    setIsResting(true);
    setRestTime(60);
    
    // Desactivar temporalmente el reconocimiento de voz
    if (isVoiceEnabled) {
      toggleVoiceRecognition();
    }
    
    restTimerRef.current = setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) {
          skipRest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Omitir período de descanso
  const skipRest = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    setIsResting(false);
    
    // Reactivar reconocimiento de voz
    if (!isVoiceEnabled) {
      toggleVoiceRecognition();
    }
  };
  
  // Completar ejercicio y guardar registro
  const completeExercise = async () => {
    // Detener reconocimiento de voz
    if (isVoiceEnabled) {
      await Voice.stop();
      setIsVoiceEnabled(false);
    }
    
    // Reproducir sonido de ejercicio completado
    playSound('exerciseCompleted');
    
    // Preparar datos para guardar
    const workoutData = {
      id: Date.now().toString(),
      type: 'alternative',
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.nombre,
      originalMachineId: machineId,
      originalMachineName: machineName,
      series: currentSeries,
      repetitions: repetitionCount,
      date: new Date().toISOString()
    };
    
    // Guardar en AsyncStorage
    try {
      await saveWorkout(workoutData);
      
      Alert.alert(
        "¡Ejercicio Completado!",
        "El ejercicio alternativo ha sido registrado con éxito.",
        [
          {
            text: "Continuar Entrenamiento",
            onPress: () => navigation.navigate('Workout')
          }
        ]
      );
    } catch (error) {
      console.error('Error al guardar el ejercicio:', error);
      Alert.alert(
        "Error",
        "No se pudo guardar el registro del ejercicio"
      );
    }
  };
  
  // Si no hay alternativas disponibles
  if (alternatives.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No hay ejercicios alternativos disponibles</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Renderizar período de descanso
  if (isResting) {
    return (
      <View style={styles.restContainer}>
        <Text style={styles.restTitle}>Descanso entre series</Text>
        <Text style={styles.restTimer}>{restTime}</Text>
        <Text style={styles.restText}>Prepárate para la siguiente serie</Text>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={skipRest}
        >
          <Text style={styles.buttonText}>Omitir Descanso</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Renderizar ejercicio activo
  if (isExerciseActive && currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{currentExercise.nombre}</Text>
        
        <Image 
          source={currentExercise.imagen} 
          style={styles.exerciseImage}
          resizeMode="contain"
        />
        
        <View style={styles.progressContainer}>
          <View style={styles.seriesContainer}>
            <Text style={styles.seriesText}>
              Serie: <Text style={styles.seriesCount}>{currentSeries}</Text> / {currentExercise.series}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progress, 
                  {width: `${(repetitionCount / currentExercise.repeticiones) * 100}%`}
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.repContainer}>
            <Text style={styles.repCount}>{repetitionCount}</Text>
            <Text style={styles.repTotal}>/ {currentExercise.repeticiones}</Text>
          </View>
        </View>
        
        <View style={styles.voiceCommandInfo}>
          <Text style={styles.voiceHint}>
            Di "arriba" o "completado" cada vez que completes una repetición
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={finishSeries}
          >
            <Text style={styles.buttonText}>Finalizar Serie</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={completeExercise}
          >
            <Text style={styles.buttonText}>Completar Ejercicio</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.voiceButton, isVoiceEnabled && styles.voiceActive]}
          onPress={toggleVoiceRecognition}
        >
          <Text style={styles.voiceIcon}>🎤</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Renderizar selección de ejercicios
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ejercicio Alternativo</Text>
      </View>
      
      <View style={styles.machineStatus}>
        <Text style={styles.machineStatusText}>
          Máquina {machineName} ocupada
        </Text>
      </View>
      
      <Text style={styles.subtitle}>Ejercicios alternativos disponibles</Text>
      
      <ScrollView style={styles.exerciseContainer}>
        <View style={styles.exerciseCard}>
          <Image 
            source={currentExercise?.imagen} 
            style={styles.exerciseImage}
            resizeMode="contain"
          />
          
          <Text style={styles.exerciseName}>{currentExercise?.nombre}</Text>
          
          <View style={styles.setsReps}>
            <Text style={styles.setsRepsText}>Series: {currentExercise?.series}</Text>
            <Text style={styles.setsRepsText}>Repeticiones: {currentExercise?.repeticiones}</Text>
          </View>
          
          <Text style={styles.instructionsTitle}>Instrucciones:</Text>
          {currentExercise?.instrucciones.map((instruction, index) => (
            <Text key={index} style={styles.instruction}>
              {index + 1}. {instruction}
            </Text>
          ))}
          
          <View style={styles.muscleInfo}>
            <Text style={styles.muscleTitle}>Músculos trabajados:</Text>
            <Text style={styles.muscleText}>{currentExercise?.musculosTrabajados}</Text>
          </View>
          
          {currentExercise?.nota && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{currentExercise.nota}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.dotsContainer}>
        {alternatives.map((_, index) => (
          <View 
            key={index}
            style={[styles.dot, index === currentIndex && styles.activeDot]} 
          />
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={handlePrevious}
        >
          <Text style={styles.buttonText}>◀ Anterior</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Siguiente ▶</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={handleAccept}
        >
          <Text style={styles.buttonText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.voiceButton, isVoiceEnabled && styles.voiceActive]}
        onPress={toggleVoiceRecognition}
      >
        <Text style={styles.voiceIcon}>🎤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  machineStatus: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  machineStatusText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exerciseContainer: {
    flex: 1,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
  },
  setsReps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eef7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  setsRepsText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    marginBottom: 8,
    lineHeight: 22,
  },
  muscleInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  muscleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  muscleText: {
    fontSize: 14,
  },
  noteBox: {
    backgroundColor: '#fef9e7',
    borderLeftWidth: 4,
    borderLeftColor: '#f1c40f',
    padding: 12,
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#3498db',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flex: 2,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voiceButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  voiceActive: {
    backgroundColor: '#e74c3c',
  },
  voiceIcon: {
    fontSize: 24,
    color: '#fff',
  },
  
  // Estilos para ejercicio activo
  progressContainer: {
    marginVertical: 16,
  },
  seriesContainer: {
    marginBottom: 16,
  },
  seriesText: {
    fontSize: 16,
    marginBottom: 8,
  },
  seriesCount: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  repContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginVertical: 16,
  },
  repCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3498db',
  },
  repTotal: {
    fontSize: 24,
    color: '#95a5a6',
    marginLeft: 8,
  },
  voiceCommandInfo: {
    backgroundColor: '#eef7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  voiceHint: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    flex: 2,
    marginLeft: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  
  // Estilos para pantalla de descanso
  restContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  restTimer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 24,
  },
  restText: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default AlternativeExerciseScreen;