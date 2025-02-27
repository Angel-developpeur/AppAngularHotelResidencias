export interface Room {
    id: string;
    number: string;
    type: string;
    capacity: number;
    priceNight: number;  // Asegúrate que coincida con el campo en Firestore
    avalible: boolean;  // En vez de 'status'
    floor: number;
    description: string;
    img: [string, string];
    characteristics: Array<string>;
    // Agrega cualquier otro campo que esté en tu base de datos
  }