import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar registro de entrenamiento
export const saveWorkout = async (workout) => {
  try {
    // Obtener registros existentes
    const existingWorkoutsJson = await AsyncStorage.getItem('workouts');
    const existingWorkouts = existingWorkoutsJson ? JSON.parse(existingWorkoutsJson) : [];

    // Añadir nuevo registro
    const updatedWorkouts = [...existingWorkouts, workout];

    // Guardar en AsyncStorage
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));

    return true;
  } catch (error) {
    console.error('Error guardando workout:', error);
    throw error;
  }
};

// Obtener historial de entrenamientos
export const getWorkouts = async () => {
  try {
    const workoutsJson = await AsyncStorage.getItem('workouts');
    return workoutsJson ? JSON.parse(workoutsJson) : [];
  } catch (error) {
    console.error('Error obteniendo workouts:', error);
    return [];
  }
};

// Obtener ejercicios alternativos utilizados
export const getAlternativeExercises = async () => {
  try {
    const workouts = await getWorkouts();
    return workouts.filter(workout => workout.type === 'alternative');
  } catch (error) {
    console.error('Error obteniendo ejercicios alternativos:', error);
    return [];
  }
};