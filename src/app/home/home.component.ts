import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environment';
// Components
import { RoomCardComponent } from '../components/room-card/room-card.component';
import { Room } from '../models/room';
import { RoomService } from '../services/room-service.service';

// Modal Component

import { AddRoomDialogComponent } from '../components/add-room-dialog/add-room-dialog.component';
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp } from '@angular/fire/app';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDialogModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    RoomCardComponent,
  ],
  
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  loading = false;
  error = false;
  errorMessage = 'Failed to load rooms. Please try again.';
  
  // Filters
  showFilters = false;
  searchTerm = '';
  statusFilter = 'all';
  capacityFilter = '0';
  priceFilter = 'all';
  
  private roomsSubscription?: Subscription;
  
  constructor(
    private roomService: RoomService,
    private ngZone: NgZone,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    
  ) {}
  
  ngOnInit() {
    //this.loadRooms();
    this.roomsSubscription = this.roomService.getRooms()
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.loading = false;
          });
        })
      )
      .subscribe({
        next: (rooms) => {
          this.ngZone.run(() => {
            this.rooms = rooms;
            this.loading = false;
            this.applyFilters();
            console.log(this.rooms);
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.error = true;
            this.errorMessage = err.message || 'Failed to load rooms. Please try again.';
          });
        }
      });

  }
  
  ngOnDestroy() {
    if (this.roomsSubscription) {
      this.roomsSubscription.unsubscribe();
    }
  }
  
  navigateToCalendar() {
    this.router.navigate(['/calendar']);
  }
  
  loadRooms() {
    this.loading = true;
    this.error = false;
    
    this.roomsSubscription = this.roomService.getRooms()
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.loading = false;
          });
        })
      )
      .subscribe({
        next: (rooms) => {
          this.ngZone.run(() => {
            this.rooms = rooms;
            this.applyFilters();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.error = true;
            this.errorMessage = err.message || 'Failed to load rooms. Please try again.';
          });
        }
      });
  }
  
  handleSearch(event: any) {
    this.searchTerm = event.target.value?.toLowerCase() || '';
    this.applyFilters();
  }
  
  applyFilters() {
    let filtered = [...this.rooms];
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(room => {
        const matchesNumber = room.number?.toString().includes(this.searchTerm) || false;
        const matchesType = room.type?.toLowerCase().includes(this.searchTerm) || false;
        return matchesNumber || matchesType;
      });
    }
    
    this.filteredRooms = filtered;
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.capacityFilter = '0';
    this.priceFilter = 'all';
    this.filteredRooms = [...this.rooms];
  }
  
  openAddRoomDialog() {
    const dialogRef = this.dialog.open(AddRoomDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addNewRoom(result);
      }
    });
  }
  
  addNewRoom(roomData: Partial<Room>) {
    const newRoom: Omit<Room, 'id'> = {
      number: roomData.number,
      type: roomData.type,
      description: roomData.description,
      capacity: roomData.capacity,
      floor: roomData.floor,
      priceNight: roomData.priceNight,
      avalible: true,
      img: roomData.img,
      characteristics: []
    };

    this.roomService.addRoom(newRoom).subscribe({
      next: (newRoomId) => {
        this.snackBar.open('Room added successfully', 'Close', {
          duration: 3000
        });
        this.loadRooms();
      },
      error: (error) => {
        this.snackBar.open('Error adding room', 'Close', {
          duration: 3000
        });
      }
    });
  }
}