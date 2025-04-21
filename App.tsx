import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';

import F12WorkoutTracker from './F12VoiceTrainer/F12WorkoutTracker';
import AlternativeExerciseScreen from './F12VoiceTrainer/AlternativeExerciseScreen';

// Definir tipos de navegación
export type RootStackParamList = {
  WorkoutTracker: undefined;
  AlternativeExercise: { 
    machineId: string; 
    machineName: string; 
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="WorkoutTracker">
          <Stack.Screen 
            name="WorkoutTracker" 
            component={F12WorkoutTracker} 
            options={{ title: 'Entrenamiento' }}
          />
          <Stack.Screen 
            name="AlternativeExercise" 
            component={AlternativeExerciseScreen} 
            options={{ title: 'Ejercicios Alternativos' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;