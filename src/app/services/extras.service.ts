import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Observable, from, throwError, of, map, catchError } from 'rxjs';
import { Extra } from '../models/extra';

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {

  private extrasCollections = "Extras"

  constructor(private firestore: Firestore) { }

  getExtras(): Observable<Extra[]> {
    const extraRef = collection(this.firestore, this.extrasCollections)
    return collectionData(extraRef, { idField: 'id'}).
    pipe(
      map(extras => extras as Extra[]),
      catchError(error => {
        console.error('Error fetching extras:', error);
        return throwError(() => new Error('Failed to load extras. Please try again later.'));
      })
    )

  }

  editExtra(extraId: string, changes: Partial<Extra>): Observable<void>{
    const docRef = doc(this.firestore, `${this.extrasCollections}/${extraId}`);
    return from(updateDoc(docRef, {...changes})).pipe(
      catchError(error => {
        console.error(`Error updating extra with ID ${extraId}:`, error);
        return throwError(() => new Error('Failed to update extra. Please try again later.'));
      })
    );

  }

 

  deleteExtra(extraId: string): Observable<void>{
    const docRef = doc(this.firestore, `${this.extrasCollections}/${extraId}`);
    return from(deleteDoc(docRef)).pipe(
      catchError(error => {
        console.error(`Error deleting extra with ID ${extraId}:`, error);
        return throwError(() => new Error('Failed to delete extra. Please try again later.'));
      })
    );

  }

 

  createExtra(extra: Omit<Extra, 'id'>): Observable<string>{
    const extraRef = collection(this.firestore, this.extrasCollections);  
    return from(addDoc(extraRef, extra)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error adding new extra:', error);
        return throwError(() => new Error('Failed to add new extra. Please try again later.'));
      })
    );
  }

  
}
