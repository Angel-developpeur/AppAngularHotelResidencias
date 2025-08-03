import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, collectionData, DocumentReference } from '@angular/fire/firestore';
import { getDoc, Timestamp } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  //unfinalizedReservations$: Observable<Reservation[]>;
  constructor(private firestore: Firestore) { }

  // Crear una nueva reserva
  createReservation(reservation: Omit<Reservation, 'id'>): Promise<DocumentReference> {
    const reservationsRef = collection(this.firestore, 'Reservations');
    return addDoc(reservationsRef, reservation);
  }

  // Editar una reserva existente
  updateReservation(reservationId: string, reservation: Partial<Reservation>): Promise<void> {
    const docRef = doc(this.firestore, 'Reservations', reservationId);
    return updateDoc(docRef, {...reservation});
  }

  // Eliminar una reserva
  deleteReservation(reservationId: string): Promise<void> {
    const docRef = doc(this.firestore, 'Reservations', reservationId);
    return deleteDoc(docRef);
  }

  // Consultar reservas sin finalizar
  getUnfinalizedReservationsByRoom(roomId: string): Observable<Reservation[]> {
    const reservationsRef = collection(this.firestore, 'Reservations');
    const q = query(
      reservationsRef, 
      where('roomId', '==', roomId),
      where('Finalized', '==', false)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Reservation[]>;
  }

  getUnfinalizedReservations(): Observable<Reservation[]> {
    
    const reservationsRef = collection(this.firestore, 'Reservations');
    const q = query(
      reservationsRef, 
      where('Finalized', '==', false)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Reservation[]>;
  }

  getReservation(id: string): Observable<Reservation | null> {
    // Referencia al documento de la colección "Reservations" por id
    const reservationDocRef = doc(this.firestore, `Reservations/${id}`);

    // Usamos from() para convertir la promesa de getDoc() en un Observable
    return from(getDoc(reservationDocRef)).pipe(
      // Usamos el operador map para transformar el resultado si el documento existe
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          return docSnapshot.data() as Reservation; // Devuelve los datos si el documento existe
        } else {
          return null; // Si no existe el documento, retornamos null
        }
      })
    );
  }
}