import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  Vibration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-community/voice';
import { useNavigation } from '@react-navigation/native';

// Define types for better type safety
interface WorkoutPhase {
  name: string;
  exercises: string[];
  sets: number;
  reps: string;
  rest: string;
  tempo: string;
  durationWeeks: number;
}

interface WorkoutEntry {
  exercise: string;
  reps?: string;
  weight?: string;
  timestamp: Date;
}

interface SavedWorkout {
  date: Date;
  phase: string;
  log: WorkoutEntry[];
}

interface ProgramProgress {
  startDate: string;
  currentPhaseIndex: number;
  lastWorkoutDate: string;
}

const F12WorkoutTracker: React.FC = () => {
  // Función para convertir números de texto a dígitos
  const textToNumber = (text: string): string | null => {
    const navigation = useNavigation();
    const numberWords: {[key: string]: string} = {
      'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
      'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
      'diez': '10', 'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
      'quince': '15', 'dieciséis': '16', 'diecisiete': '17', 'dieciocho': '18', 'diecinueve': '19',
      'veinte': '20', 'veintiuno': '21', 'veintidós': '22', 'veintitrés': '23', 'veinticuatro': '24',
      'veinticinco': '25', 'veintiséis': '26', 'veintisiete': '27', 'veintiocho': '28', 'veintinueve': '29',
      'treinta': '30', 'cuarenta': '40', 'cincuenta': '50', 'sesenta': '60', 'setenta': '70',
      'ochenta': '80', 'noventa': '90', 'cien': '100'
    };
  const handleMachineBusy = () => {
      if (currentPhase && currentExerciseIndex >= 0) {
        navigation.navigate('AlternativeExercise', {
          machineId: currentPhase.exercises[currentExerciseIndex].toLowerCase().replace(/\s+/g, '_'),
          machineName: currentPhase.exercises[currentExerciseIndex]
        });
      }
    };


    // Si es ya un número, devolverlo directamente
    if (/^\d+$/.test(text)) {
      return text;
    }
    
    // Si es una palabra de número, convertirla
    if (numberWords[text.toLowerCase()]) {
      return numberWords[text.toLowerCase()];
    }
    
    return null;
  };

  // Workout Phases from PDF
  const workoutPhases: WorkoutPhase[] = [
    {
      name: 'Fase Uno: Resistencia Muscular',
      exercises: [
        'Press de Hombros con Barra',
        'Sentadilla con Barra',
        'Press de Pecho con Mancuernas',
        'Remo Inclinado con Barra',
        'Peso Muerto con Mancuernas',
        'Estocada con Mancuernas'
      ],
      sets: 3,
      reps: '12-15',
      rest: '45s',
      tempo: 'Lento',
      durationWeeks: 4 // Fase dura 4 semanas
    },
    {
      name: 'Fase Dos: Hipertrofia',
      exercises: [
        'Clean con Barra',
        'Sentadilla Frontal con Barra',
        'Press de Pecho Inclinado con Mancuernas',
        'Dominadas/Jalón al Pecho',
        'Peso Muerto con Barra',
        'Estocada con Barra'
      ],
      sets: 3,
      reps: '8-12',
      rest: '60s',
      tempo: 'Lento a Rápido',
      durationWeeks: 4 // Fase dura 4 semanas
    },
    {
      name: 'Fase Tres: Fuerza',
      exercises: [
        'Clean y Press con Barra',
        'Sentadilla Frontal con Barra',
        'Press de Pecho con Barra',
        'Dominadas/Jalón al Pecho',
        'Peso Muerto Rumano con Barra',
        'Sentadilla Split con Mancuernas'
      ],
      sets: 3,
      reps: '6-8',
      rest: '90s',
      tempo: 'Rápido',
      durationWeeks: 4 // Fase dura 4 semanas
    }
  ];

  const [currentPhase, setCurrentPhase] = useState<WorkoutPhase | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutLog, setWorkoutLog] = useState<WorkoutEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [previousExerciseData, setPreviousExerciseData] = useState<WorkoutEntry[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [programProgress, setProgramProgress] = useState<ProgramProgress | null>(null);
  
  // Estados para el temporizador
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar progreso del programa y entrenamientos guardados
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar progreso del programa
        const progressData = await AsyncStorage.getItem('programProgress');
        if (progressData) {
          const progress = JSON.parse(progressData);
          setProgramProgress(progress);
        }
        
        // Cargar entrenamientos guardados
        const savedData = await AsyncStorage.getItem('workouts');
        if (savedData) {
          const workouts = JSON.parse(savedData);
          // Convertir strings de fechas a objetos Date
          workouts.forEach((workout: any) => {
            workout.date = new Date(workout.date);
            workout.log.forEach((entry: any) => {
              entry.timestamp = new Date(entry.timestamp);
            });
          });
          setSavedWorkouts(workouts);
        }
      } catch (error) {
        console.log('Error cargando datos:', error);
      }
    };

    loadData();
  }, []);

  // Determinar la fase actual basada en el progreso
  useEffect(() => {
    if (programProgress) {
      // Calcular si es necesario avanzar a la siguiente fase
      const startDate = new Date(programProgress.startDate);
      const lastWorkoutDate = new Date(programProgress.lastWorkoutDate);
      const today = new Date();
      const currentPhaseIndex = programProgress.currentPhaseIndex;
      
      // Calcular semanas transcurridas desde el inicio del programa
      const weeksPassed = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Calcular a qué fase deberíamos estar según las semanas transcurridas
      let calculatedPhaseIndex = 0;
      let weekCount = 0;
      
      for (let i = 0; i < workoutPhases.length; i++) {
        weekCount += workoutPhases[i].durationWeeks;
        if (weeksPassed < weekCount) {
          calculatedPhaseIndex = i;
          break;
        }
        if (i === workoutPhases.length - 1) {
          calculatedPhaseIndex = i; // Si superamos todas las fases, quedamos en la última
        }
      }
      
      // Si la fase calculada es diferente a la registrada, actualizar
      if (calculatedPhaseIndex !== currentPhaseIndex) {
        const newProgress = {
          ...programProgress,
          currentPhaseIndex: calculatedPhaseIndex
        };
        
        setProgramProgress(newProgress);
        AsyncStorage.setItem('programProgress', JSON.stringify(newProgress));
        
        // Notificar al usuario del cambio de fase
        if (calculatedPhaseIndex > currentPhaseIndex) {
          Alert.alert(
            '¡Has avanzado de fase!',
            `Ahora estás en la ${workoutPhases[calculatedPhaseIndex].name}`
          );
        }
      }
    } else {
      // Si no hay progreso registrado, crear uno nuevo
      const newProgress = {
        startDate: new Date().toISOString(),
        currentPhaseIndex: 0,
        lastWorkoutDate: new Date().toISOString()
      };
      
      setProgramProgress(newProgress);
      AsyncStorage.setItem('programProgress', JSON.stringify(newProgress));
    }
  }, [programProgress]);

  // Función para formatear series de repeticiones y pesos
  const formatSeries = (entries: WorkoutEntry[], field: 'reps' | 'weight'): string => {
    if (!entries || entries.length === 0) return 'N/A';
    
    const values = entries.map(entry => entry[field] || '-').join('-');
    return values || 'N/A';
  };

  // Buscar datos del ejercicio anterior cuando cambia el ejercicio actual
  useEffect(() => {
    if (currentPhase && savedWorkouts.length > 0) {
      const currentExerciseName = currentPhase.exercises[currentExerciseIndex];
      
      // Buscar el último entrenamiento donde se hizo este ejercicio
      const lastWorkoutWithExercise = savedWorkouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find(workout => 
          workout.log.some(entry => entry.exercise === currentExerciseName)
        );
      
      if (lastWorkoutWithExercise) {
        // Filtrar solo las entradas del ejercicio actual
        const exerciseEntries = lastWorkoutWithExercise.log
          .filter(entry => entry.exercise === currentExerciseName);
        
        setPreviousExerciseData(exerciseEntries);
      } else {
        setPreviousExerciseData([]);
      }
    } else {
      setPreviousExerciseData([]);
    }
  }, [currentPhase, currentExerciseIndex, savedWorkouts]);

  // Función para convertir el tiempo de reposo en segundos
  const parseRestTime = (restTime: string): number => {
    const match = restTime.match(/(\d+)\s*s/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 60; // Valor por defecto: 60 segundos
  };

  // Iniciar temporizador de descanso
  const startRestTimer = () => {
    if (!currentPhase) return;
    
    // Obtener el tiempo de descanso de la fase actual
    const restTimeSeconds = parseRestTime(currentPhase.rest);
    setRestTimeLeft(restTimeSeconds);
    setRestTimerActive(true);
    
    // Limpiar cualquier intervalo existente
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    // Iniciar nuevo intervalo
    timerIntervalRef.current = setInterval(() => {
      setRestTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Si el temporizador llega a cero, detenerlo y reproducir sonido/vibración
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          setRestTimerActive(false);
          // Vibrar para alertar
          Vibration.vibrate([500, 200, 500]);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Detener temporizador
  const stopRestTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setRestTimerActive(false);
  };

  // Limpiar intervalo cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Formatear tiempo para mostrar
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Permiso de Micrófono",
            message: "La aplicación necesita acceso a tu micrófono para grabar instrucciones de entrenamiento.",
            buttonNeutral: "Preguntar Después",
            buttonNegative: "Cancelar",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Voice recognition setup
  useEffect(() => {
    // Initialize voice recognition listeners
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        const voiceInput = e.value[0].toLowerCase();
        setRecognizedText(voiceInput);
        console.log('Texto reconocido:', voiceInput);
        
        // Analizar el texto para encontrar números y palabras clave
        let reps: string | null = null;
        let weight: string | null = null;
        
        // Primero buscar patrones como "cinco repeticiones" o "diez kilos"
        const wordsArray = voiceInput.split(' ');
        
        for (let i = 0; i < wordsArray.length - 1; i++) {
          const possibleNumber = textToNumber(wordsArray[i]);
          if (possibleNumber) {
            // Comprobar si la siguiente palabra está relacionada con repeticiones
            if (i + 1 < wordsArray.length && 
                wordsArray[i+1].match(/^(repeticiones|repetición|repeticion|reps|rep)$/i)) {
              reps = possibleNumber;
            }
            // Comprobar si la siguiente palabra está relacionada con peso
            else if (i + 1 < wordsArray.length && 
                    wordsArray[i+1].match(/^(kilos|kilo|kg|libras|libra|lb|lbs)$/i)) {
              weight = possibleNumber;
            }
          }
        }
        
        // Si no encontramos patrones de "número + unidad", buscar patrones numéricos
        if (!reps && !weight) {
          // Buscar patrones como "15 repeticiones" o "20 kilos"
          const repsMatch = voiceInput.match(/(\d+)\s*(?:repeticiones|repetición|repeticion|reps|rep)/i);
          const weightMatch = voiceInput.match(/(\d+)\s*(?:kilos|kilo|kg|libras|libra|lb|lbs)/i);
          
          if (repsMatch) reps = repsMatch[1];
          if (weightMatch) weight = weightMatch[1];
          
          // Si solo hay un número sin unidad, asumimos que son repeticiones
          if (!reps && !weight) {
            const justNumberMatch = voiceInput.match(/(\d+)/);
            if (justNumberMatch) {
              reps = justNumberMatch[1];
            }
          }
        }
        
        if (reps || weight) {
          const newEntry: WorkoutEntry = {
            exercise: currentPhase ? currentPhase.exercises[currentExerciseIndex] : '',
            reps: reps || undefined,
            weight: weight || undefined,
            timestamp: new Date()
          };

          // Añadir la entrada al registro
          setWorkoutLog(prev => [...prev, newEntry]);
        }
      }
    };

    Voice.onSpeechError = (e) => {
      console.log('Error de reconocimiento:', e);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [currentPhase, currentExerciseIndex]);

  // Obtener entradas del ejercicio actual en la sesión actual
  const getCurrentExerciseEntries = (): WorkoutEntry[] => {
    if (!currentPhase) return [];
    const currentExerciseName = currentPhase.exercises[currentExerciseIndex];
    return workoutLog.filter(entry => entry.exercise === currentExerciseName);
  };

  // Contar series actuales del ejercicio
  const getCurrentExerciseSetCount = (): number => {
    return getCurrentExerciseEntries().length;
  };

  // Start a specific workout phase
  const startWorkout = (phaseIndex?: number) => {
    // Si se proporciona un índice de fase específico, usarlo
    // Si no, usar la fase actual del programa
    const index = phaseIndex !== undefined ? phaseIndex : 
                  (programProgress ? programProgress.currentPhaseIndex : 0);
    
    setCurrentPhase(workoutPhases[index]);
    setCurrentExerciseIndex(0);
    setWorkoutLog([]);
    setRecognizedText('');
  };

  // Move to previous exercise
  const previousExercise = () => {
    if (currentPhase && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    } else {
      Alert.alert('Aviso', 'Ya estás en el primer ejercicio');
    }
  };

  // Move to next exercise
  const nextExercise = () => {
    if (currentPhase && currentExerciseIndex < currentPhase.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Workout complete
      saveWorkout();
      setCurrentPhase(null);
    }
  };

  // Delete workout entry (sin confirmación)
  const deleteWorkoutEntry = (index: number) => {
    setWorkoutLog(prev => prev.filter((_, i) => i !== index));
  };

  // Save workout to AsyncStorage
  const saveWorkout = async () => {
    try {
      // Guardar el entrenamiento
      const workouts = [...savedWorkouts];
      
      workouts.push({
        date: new Date(),
        phase: currentPhase?.name || '',
        log: workoutLog
      });

      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      setSavedWorkouts(workouts);
      
      // Actualizar progreso del programa
      if (programProgress) {
        const updatedProgress = {
          ...programProgress,
          lastWorkoutDate: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('programProgress', JSON.stringify(updatedProgress));
        setProgramProgress(updatedProgress);
      }
      
      Alert.alert('Éxito', 'Entrenamiento guardado correctamente!');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento');
    }
  };

  // Start voice recording
  const startVoiceRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (hasPermission) {
      try {
        setIsRecording(true);
        await Voice.start('es-ES');  // Spanish language
      } catch (error) {
        Alert.alert('Error', 'No se pudo iniciar la grabación de voz');
        setIsRecording(false);
      }
    } else {
      Alert.alert('Permiso Denegado', 'Se requiere permiso de micrófono para grabar');
    }
  };

  // Stop voice recording
  const stopVoiceRecording = async () => {
    try {
      setIsRecording(false);
      await Voice.stop();
      
      // Iniciar temporizador de descanso si hay entradas de ejercicio actuales
      if (getCurrentExerciseEntries().length > 0) {
        startRestTimer();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo detener la grabación de voz');
    }
  };

  // Calcular el progreso del programa
  const getProgramProgressInfo = (): string => {
    if (!programProgress) return '';
    
    const startDate = new Date(programProgress.startDate);
    const today = new Date();
    const weeksPassed = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentPhase = workoutPhases[programProgress.currentPhaseIndex];
    
    // Calcular semanas dentro de la fase actual
    let weeksBefore = 0;
    for (let i = 0; i < programProgress.currentPhaseIndex; i++) {
      weeksBefore += workoutPhases[i].durationWeeks;
    }
    
    const weeksInCurrentPhase = weeksPassed - weeksBefore;
    const weeksLeft = currentPhase.durationWeeks - weeksInCurrentPhase;
    
    return `Semana ${weeksInCurrentPhase + 1} de ${currentPhase.durationWeeks} (Fase ${programProgress.currentPhaseIndex + 1})`;
  };

  // Render phase selection or current workout
  return (
    <ScrollView style={styles.container}>
      {/* Mostrar información del progreso */}
      {programProgress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {getProgramProgressInfo()}
          </Text>
        </View>
      )}

      {!currentPhase ? (
        <View>
          {/* Mostrar la fase recomendada primero */}
          {programProgress && (
            <TouchableOpacity 
              style={[styles.phaseButton, styles.recommendedPhase]}
              onPress={() => startWorkout()}
            >
              <Text style={styles.phaseButtonText}>
                {`${workoutPhases[programProgress.currentPhaseIndex].name} (Recomendado)`}
              </Text>
            </TouchableOpacity>
          )}
        
          {/* Mostrar todas las fases */}
          {workoutPhases.map((phase, index) => (
            <TouchableOpacity 
              key={phase.name}
              style={[
                styles.phaseButton,
                programProgress && index === programProgress.currentPhaseIndex ? styles.currentPhase : null
              ]}
              onPress={() => startWorkout(index)}
            >
              <Text style={styles.phaseButtonText}>{phase.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View>
          <Text style={styles.exerciseTitle}>
            {currentPhase.exercises[currentExerciseIndex]}
          </Text>
          <Text style={styles.exerciseInfo}>Ejercicio {currentExerciseIndex + 1} de {currentPhase.exercises.length}</Text>
          
          {/* Sección de información de ejercicio */}
          <View style={styles.exerciseInfoContainer}>
            {/* Columna izquierda: Recomendación del programa */}
            <View style={styles.infoColumn}>
              <Text style={styles.infoTitle}>Programa</Text>
              <Text>Series: {currentPhase.sets}</Text>
              <Text>Reps: {currentPhase.reps}</Text>
              <Text>Descanso: {currentPhase.rest}</Text>
              <Text>Tempo: {currentPhase.tempo}</Text>
            </View>
            
            {/* Columna central: último registro */}
            <View style={styles.infoColumn}>
              <Text style={styles.infoTitle}>Última vez</Text>
              {previousExerciseData.length > 0 ? (
                <>
                  <Text>Reps: {formatSeries(previousExerciseData, 'reps')}</Text>
                  <Text>Peso: {formatSeries(previousExerciseData, 'weight')}</Text>
                  <Text style={styles.smallText}>
                    {new Date(previousExerciseData[0].timestamp).toLocaleDateString()}
                  </Text>
                </>
              ) : (
                <Text>Sin datos previos</Text>
              )}
            </View>
            
            {/* Columna derecha: datos actuales */}
            <View style={styles.infoColumn}>
              <Text style={styles.infoTitle}>Hoy</Text>
              {getCurrentExerciseEntries().length > 0 ? (
                <>
                  <Text>Reps: {formatSeries(getCurrentExerciseEntries(), 'reps')}</Text>
                  <Text>Peso: {formatSeries(getCurrentExerciseEntries(), 'weight')}</Text>
                  <Text style={styles.smallText}>
                    {getCurrentExerciseEntries().length} series
                  </Text>
                </>
              ) : (
                <Text>Sin datos actuales</Text>
              )}
            </View>
          </View>

          {/* Temporizador de descanso */}
          {restTimerActive && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerTitle}>Tiempo de Descanso</Text>
              <Text style={styles.timerText}>{formatTime(restTimeLeft)}</Text>
              <TouchableOpacity 
                style={styles.timerButton}
                onPress={stopRestTimer}
              >
                <Text style={styles.timerButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopVoiceRecording : startVoiceRecording}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Detener Grabación' : 'Iniciar Grabación de Voz'}
            </Text>
          </TouchableOpacity>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
              onPress={previousExercise}
              disabled={currentExerciseIndex === 0}
            >
              <Text style={styles.navButtonText}>Ejercicio Anterior</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={nextExercise}
            >
              <Text style={styles.navButtonText}>
                {currentExerciseIndex === currentPhase.exercises.length - 1 
                  ? 'Finalizar' 
                  : 'Siguiente Ejercicio'}
              </Text>
            </TouchableOpacity>
          </View>
            <TouchableOpacity
                style={styles.busyMachineButton}
                onPress={handleMachineBusy}
            >
                <Text style={styles.busyMachineButtonText}>Máquina Ocupada</Text>
            </TouchableOpacity>


          {/* Voice recognition status */}
          {isRecording && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Grabando...</Text>
              {recognizedText ? (
                <Text>Escuchado: "{recognizedText}"</Text>
              ) : null}
            </View>
          )}

          {/* Workout log display */}
          <View style={styles.logContainer}>
            <Text style={styles.sectionTitle}>Registro de Entrenamiento:</Text>
            {workoutLog.length > 0 ? (
              workoutLog.map((entry, index) => {
                // Calcular el número de serie para este ejercicio
                const exerciseEntries = workoutLog.filter(e => e.exercise === entry.exercise);
                const setNumber = exerciseEntries.indexOf(entry) + 1;
                
                return (
                  <View key={index} style={styles.logEntry}>
                    <View style={styles.logEntryContent}>
                      <Text>
                        Ej.{currentExerciseIndex + 1} Serie {setNumber}: {entry.reps || '0'} reps
                        {entry.weight ? `, ${entry.weight} kg` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteWorkoutEntry(index)}
                    >
                      <Text style={styles.deleteButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyLogText}>
                No hay entradas aún. Intenta decir "diez reps" o "veinte kilos".
              </Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10 // Reducir espacio superior
  },
  progressContainer: {
    backgroundColor: '#e6f7ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    marginTop: 10
  },
  progressText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0277bd'
  },
  phaseButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10
  },
  recommendedPhase: {
    backgroundColor: '#28a745', // Verde para la fase recomendada
    borderWidth: 2,
    borderColor: '#fff'
  },
  currentPhase: {
    borderWidth: 2,
    borderColor: '#FFD700' // Borde dorado para la fase actual
  },
  phaseButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  exerciseInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#555'
  },
  // Exercise info container with 3 columns
  exerciseInfoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden'
  },
  infoColumn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8'
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center'
  },
  smallText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center'
  },
  recordButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  recordingButton: {
    backgroundColor: 'red'
  },
  recordButtonText: {
    color: 'white',
    textAlign: 'center'
  },
  // Temporizador styles
  timerContainer: {
    backgroundColor: '#FFE0B2',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center'
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  timerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF6D00',
    marginBottom: 10
  },
  timerButton: {
    backgroundColor: '#FF6D00',
    padding: 8,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center'
  },
  timerButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  // Navigation buttons container
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  navButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5
  },
  navButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  navButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14
  },
  // Existing styles
  statusContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ffe0e0',
    borderRadius: 5,
    alignItems: 'center'
  },
  statusText: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 5
  },
  logContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 5
  },
  logEntryContent: {
    flex: 1
  },
  deleteButton: {
    backgroundColor: '#ff6666',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  emptyLogText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center'
  },
  busyMachineButton: {
      backgroundColor: '#e74c3c',
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
      marginBottom: 10
  },
   busyMachineButtonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold'
   }
});

export default F12WorkoutTracker;