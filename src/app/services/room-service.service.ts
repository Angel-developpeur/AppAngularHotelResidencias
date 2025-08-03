import { Injectable, NgZone } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private roomsCollection = 'Rooms'; //name of collection in firebase
  
  constructor(private firestore: Firestore, private ngZone: NgZone) { }
  
//get all rooms
  getRooms(): Observable<Room[]> {
    const roomsRef = collection(this.firestore, this.roomsCollection);
    return collectionData(roomsRef, { idField: 'id' })
      .pipe(
        map(rooms => rooms as Room[]),
        catchError(error => {
          console.error('Error fetching rooms:', error);
          return throwError(() => new Error('Failed to load rooms. Please try again later.'));
        })
      );
  }
  
  // Obtener una habitación específica por ID
  getRoomById(roomId: string): Observable<Room> {
    return this.ngZone.runOutsideAngular(() => {
      const roomRef = doc(this.firestore, `${this.roomsCollection}/${roomId}`);
      return docData(roomRef, { idField: 'id' }).pipe(
        map(room => room as Room),
        catchError(error => {
          console.error(`Error fetching room with ID ${roomId}:`, error);
          return throwError(() => new Error('Failed to load room details. Please try again later.'));
        })
      );
    });
  }
 
  // Agregar una nueva habitación
  addRoom(room: Omit<Room, 'id'>): Observable<string> {
    return this.ngZone.runOutsideAngular(() => {
      const roomsRef = collection(this.firestore, this.roomsCollection);
      return from(addDoc(roomsRef, room)).pipe(
        map(docRef => docRef.id),
        catchError(error => {
          console.error('Error adding new room:', error);
          return throwError(() => new Error('Failed to add new room. Please try again later.'));
        })
      );
    });
  }
  
  // Actualizar una habitación existente
  updateRoom(roomId: string, changes: Partial<Room>): Observable<void> {
    return this.ngZone.runOutsideAngular(() => {
      const roomRef = doc(this.firestore, `${this.roomsCollection}/${roomId}`);
      return from(updateDoc(roomRef, changes)).pipe(
        catchError(error => {
          console.error(`Error updating room with ID ${roomId}:`, error);
          return throwError(() => new Error('Failed to update room. Please try again later.'));
        })
      );
    });
  }
  
  // Eliminar una habitación
  deleteRoom(roomId: string): Observable<void> {
    return this.ngZone.runOutsideAngular(() => {
      const roomRef = doc(this.firestore, `${this.roomsCollection}/${roomId}`);
      return from(deleteDoc(roomRef)).pipe(
        catchError(error => {
          console.error(`Error deleting room with ID ${roomId}:`, error);
          return throwError(() => new Error('Failed to delete room. Please try again later.'));
        })
      );
    });
  }
}

 /*
  // Buscar habitaciones (por número, tipo, o descripción)
  searchRooms(searchTerm: string): Observable<Room[]> {
    if (!searchTerm.trim()) {
      return this.getRooms();
    }
    
    return this.getRooms().pipe(
      map(rooms => rooms.filter(room => 
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }
  
  // Filtrar habitaciones por estado
  getRoomsByStatus(status: 'available' | 'occupied' | 'maintenance'): Observable<Room[]> {
    return this.ngZone.runOutsideAngular(() => {
      const roomsRef = collection(this.firestore, this.roomsCollection);
      const q = query(roomsRef, where('status', '==', status));
      
      return collectionData(q, { idField: 'id' }).pipe(
        map(rooms => rooms as Room[]),
        catchError(error => {
          console.error(`Error fetching rooms with status ${status}:`, error);
          return throwError(() => new Error('Failed to filter rooms. Please try again later.'));
        })
      );
    });
  }
  
  // Filtrar habitaciones por capacidad
  getRoomsByCapacity(minCapacity: number): Observable<Room[]> {
    return this.ngZone.runOutsideAngular(() => {
      const roomsRef = collection(this.firestore, this.roomsCollection);
      const q = query(roomsRef, where('capacity', '>=', minCapacity));
      
      return collectionData(q, { idField: 'id' }).pipe(
        map(rooms => rooms as Room[]),
        catchError(error => {
          console.error(`Error fetching rooms with capacity >= ${minCapacity}:`, error);
          return throwError(() => new Error('Failed to filter rooms. Please try again later.'));
        })
      );
    });
  }
  
  // Filtrar habitaciones por precio
  getRoomsByPriceRange(minPrice: number, maxPrice: number): Observable<Room[]> {
    return this.ngZone.runOutsideAngular(() => {
      const roomsRef = collection(this.firestore, this.roomsCollection);
      const q = query(
        roomsRef, 
        where('pricePerNight', '>=', minPrice),
        where('pricePerNight', '<=', maxPrice)
      );
      
      return collectionData(q, { idField: 'id' }).pipe(
        map(rooms => rooms as Room[]),
        catchError(error => {
          console.error(`Error fetching rooms with price between ${minPrice} and ${maxPrice}:`, error);
          return throwError(() => new Error('Failed to filter rooms. Please try again later.'));
        })
      );
    });
  }*/
  