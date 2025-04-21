// Modelo de datos para ejercicios alternativos en F12VoiceTrainer

export const EjerciciosAlternativos = [
  // PECHO
  {
    id: '1',
    nombre: 'Flexiones Estándar',
    grupoMuscular: 'PECHO',
    instrucciones: [
      'Colócate en posición de plancha con las manos a la altura de los hombros',
      'Mantén el cuerpo en línea recta desde los tobillos hasta la cabeza',
      'Baja el cuerpo doblando los codos hasta casi tocar el suelo con el pecho',
      'Empuja con las palmas para volver a la posición inicial',
      'Mantén los músculos abdominales contraídos durante todo el movimiento'
    ],
    series: 4,
    repeticiones: 12,
    musculosTrabajados: 'Pectoral mayor, pectoral menor, deltoides anterior y tríceps',
    nota: 'Mantén el ritmo controlado para maximizar la tensión muscular',
    imagen: require('../assets/images/flexiones.png')
  },
  {
    id: '2',
    nombre: 'Fondos entre Bancos',
    grupoMuscular: 'PECHO',
    instrucciones: [
      'Siéntate entre dos bancos paralelos (o un banco y una silla estable)',
      'Coloca las manos en el borde del banco detrás de ti',
      'Extiende las piernas frente a ti y apóyate en los talones',
      'Eleva las caderas del suelo y mantén el cuerpo recto',
      'Baja el cuerpo flexionando los codos hasta formar un ángulo de 90 grados',
      'Empuja con los brazos para volver a la posición inicial'
    ],
    series: 3,
    repeticiones: 12,
    musculosTrabajados: 'Pectoral inferior, tríceps y deltoides anterior',
    nota: 'Mantén los hombros alejados de las orejas durante todo el movimiento',
    imagen: require('../assets/images/fondos-entre-bancos.png')
  },
  // ESPALDA
  {
    id: '3',
    nombre: 'Remo con Mancuerna a Una Mano',
    grupoMuscular: 'ESPALDA',
    instrucciones: [
      'Coloca un banco y toma una mancuerna con una mano',
      'Apoya la rodilla y la mano del mismo lado en el banco',
      'La pierna del lado de la mancuerna permanece extendida con el pie apoyado',
      'Mantén la espalda plana y paralela al suelo',
      'Deja que la mancuerna cuelgue con el brazo extendido',
      'Tira de la mancuerna hacia arriba, llevando el codo hacia el techo',
      'Baja lentamente la mancuerna hasta volver a la posición inicial'
    ],
    series: 3,
    repeticiones: 15,
    musculosTrabajados: 'Dorsal ancho, romboides, trapecio medio e inferior, bíceps',
    nota: 'Mantén el codo cerca del cuerpo durante el movimiento',
    imagen: require('../assets/images/remo-mancuerna.png')
  },
  {
    id: '4',
    nombre: 'Superman',
    grupoMuscular: 'ESPALDA',
    instrucciones: [
      'Túmbate boca abajo sobre una colchoneta con los brazos extendidos',
      'Mantén las piernas rectas y juntas',
      'Eleva simultáneamente brazos, pecho y piernas del suelo',
      'Mantén la posición en el punto más alto durante 2-3 segundos',
      'Baja lentamente a la posición inicial'
    ],
    series: 4,
    repeticiones: 12,
    musculosTrabajados: 'Erector espinal, glúteos, deltoides posteriores y trapecio',
    nota: 'Mantén la mirada hacia el suelo para proteger las cervicales',
    imagen: require('../assets/images/superman.png')
  },
  // PIERNAS
  {
    id: '5',
    nombre: 'Sentadillas Búlgaras',
    grupoMuscular: 'PIERNAS',
    instrucciones: [
      'Colócate de pie a unos 60-70 cm frente a un banco',
      'Coloca la parte superior de un pie sobre el banco, detrás de ti',
      'El otro pie debe estar firme en el suelo',
      'Mantén el torso erguido y la mirada al frente',
      'Desciende doblando la rodilla hasta que el muslo esté paralelo al suelo',
      'Regresa a la posición inicial empujando a través del talón'
    ],
    series: 3,
    repeticiones: 12,
    musculosTrabajados: 'Cuádriceps, glúteos, isquiotibiales y aductores',
    nota: 'La rodilla delantera no debe sobrepasar la punta del pie',
    imagen: require('../assets/images/sentadillas-bulgaras.png')
  },
  {
    id: '6',
    nombre: 'Peso Muerto Rumano con Mancuernas',
    grupoMuscular: 'PIERNAS',
    instrucciones: [
      'Ponte de pie con los pies separados al ancho de las caderas',
      'Sostén una mancuerna en cada mano frente a los muslos',
      'Mantén las rodillas ligeramente flexionadas durante todo el ejercicio',
      'Empuja las caderas hacia atrás mientras bajas el torso',
      'Desliza las mancuernas por delante de las piernas hasta la mitad de las espinillas',
      'Regresa a la posición inicial empujando las caderas hacia adelante'
    ],
    series: 3,
    repeticiones: 12,
    musculosTrabajados: 'Isquiotibiales, glúteos, erector espinal y trapecio inferior',
    nota: 'Mantén la espalda recta durante todo el movimiento',
    imagen: require('../assets/images/peso-muerto-rumano.png')
  },
  // HOMBROS
  {
    id: '7',
    nombre: 'Press de Hombros con Mancuernas',
    grupoMuscular: 'HOMBROS',
    instrucciones: [
      'Permanece de pie con los pies separados al ancho de las caderas',
      'Sostén una mancuerna en cada mano a la altura de los hombros',
      'Contrae el core y mantén la espalda recta',
      'Empuja las mancuernas hacia arriba hasta extender los brazos',
      'Haz una breve pausa en la posición superior',
      'Baja las mancuernas de forma controlada hasta la posición inicial'
    ],
    series: 3,
    repeticiones: 12,
    musculosTrabajados: 'Deltoides (principalmente anterior y lateral), trapecio superior y tríceps',
    nota: 'Evita arquear la espalda al levantar el peso',
    imagen: require('../assets/images/press-hombros.png')
  },
  {
    id: '8',
    nombre: 'Elevaciones Laterales con Botellas o Bandas',
    grupoMuscular: 'HOMBROS',
    instrucciones: [
      'Ponte de pie con los pies separados al ancho de las caderas',
      'Sostén una botella/banda en cada mano a los lados del cuerpo',
      'Mantén los codos ligeramente flexionados',
      'Eleva los brazos hacia los lados hasta que estén paralelos al suelo',
      'Mantén una breve pausa en la posición más alta',
      'Baja lentamente a la posición inicial'
    ],
    series: 3,
    repeticiones: 15,
    musculosTrabajados: 'Deltoides lateral, deltoides anterior y trapecio superior',
    nota: 'No eleves los brazos por encima de la altura de los hombros',
    imagen: require('../assets/images/elevaciones-laterales.png')
  },
  // BRAZOS
  {
    id: '9',
    nombre: 'Curl de Bíceps con Bandas Elásticas',
    grupoMuscular: 'BRAZOS',
    instrucciones: [
      'Párate sobre el centro de una banda elástica',
      'Agarra ambos extremos de la banda con las palmas hacia adelante',
      'Mantén los codos pegados a los costados',
      'Flexiona los codos y lleva las manos hacia los hombros',
      'Aprieta los bíceps en la posición superior',
      'Baja lentamente a la posición inicial con control'
    ],
    series: 3,
    repeticiones: 15,
    musculosTrabajados: 'Bíceps braquial, braquial anterior y braquiorradial',
    nota: 'La resistencia aumenta a medida que estiras la banda',
    imagen: require('../assets/images/curl-biceps-bandas.png')
  },
  {
    id: '10',
    nombre: 'Extensiones de Tríceps con Peso Corporal',
    grupoMuscular: 'BRAZOS',
    instrucciones: [
      'Siéntate en el borde de un banco o silla estable',
      'Coloca las manos en el borde del banco, a ambos lados de las caderas',
      'Desliza las caderas hacia adelante, manteniendo el peso sobre las manos',
      'Dobla los codos hasta formar un ángulo de 90 grados',
      'Empuja con los tríceps para volver a la posición inicial',
      'Mantén los hombros alejados de las orejas durante todo el movimiento'
    ],
    series: 3,
    repeticiones: 12,
    musculosTrabajados: 'Tríceps braquial (todas las cabezas)',
    nota: 'Los codos deben apuntar hacia atrás, no hacia los lados',
    imagen: require('../assets/images/extensiones-triceps.png')
  },
  // CORE
  {
    id: '11',
    nombre: 'Plancha',
    grupoMuscular: 'CORE',
    instrucciones: [
      'Colócate en posición de plancha con antebrazos y dedos de los pies apoyados',
      'Alinea el cuerpo formando una línea recta desde los tobillos hasta la cabeza',
      'Contrae el abdomen llevando el ombligo hacia la columna',
      'Mantén los glúteos y cuádriceps activos',
      'Respira de manera normal, sin contener la respiración',
      'Mantén la posición durante el tiempo indicado'
    ],
    series: 4,
    repeticiones: 40, // en segundos
    musculosTrabajados: 'Recto abdominal, oblicuos, transverso del abdomen y estabilizadores',
    nota: 'La espalda debe permanecer plana, sin hundirse ni arquearse',
    imagen: require('../assets/images/plancha.png')
  },
  {
    id: '12',
    nombre: 'Mountain Climbers',
    grupoMuscular: 'CORE',
    instrucciones: [
      'Comienza en posición de plancha alta, manos bajo los hombros',
      'Mantén el cuerpo en línea recta desde la cabeza hasta los talones',
      'Lleva una rodilla hacia el pecho, sin elevar las caderas',
      'Regresa esa pierna mientras llevas la otra rodilla hacia el pecho',
      'Alterna las piernas en un movimiento continuo y controlado',
      'Mantén el core contraído durante todo el ejercicio'
    ],
    series: 4,
    repeticiones: 40, // en segundos
    musculosTrabajados: 'Recto abdominal, oblicuos, flexores de cadera y cuádriceps',
    nota: 'Ajusta la velocidad para mantener una buena forma',
    imagen: require('../assets/images/mountain-climbers.png')
  }
];

// Mapa de relaciones entre máquinas y ejercicios alternativos
export const MaquinaAlternativas = {
  // ID_MAQUINA: [ID_EJERCICIO1, ID_EJERCICIO2, ...]
  'press_banca': ['1', '2'],
  'remo_maquina': ['3', '4'],
  'prensa_piernas': ['5', '6'],
  'press_hombros': ['7', '8'],
  'curl_biceps': ['9'],
  'extension_triceps': ['10'],
  'maquina_abdominales': ['11', '12']
};
