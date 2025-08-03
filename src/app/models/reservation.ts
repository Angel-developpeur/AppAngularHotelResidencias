import { DocumentReference, Timestamp } from "firebase/firestore";

export interface Reservation {
    id: string;
    Finalized: boolean;
    client_name: string;
    date_input: Timestamp;
    date_leave: Timestamp;
    people: number;
    phone: string;
    registers: { check_in: Timestamp | null , check_out: Timestamp | null}; //datos opcionales
    roomId: DocumentReference;
    total_days: number;
    numberRoom: number;
    

}
