import { Component, OnInit, OnDestroy, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Timestamp } from "firebase/firestore";

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services
import { RoomService } from '../../services/room-service.service';
import { ReservationService } from '../../services/reservation-service.service';

// Models
import { Room } from '../../models/room';
import { Reservation } from '../../models/reservation';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule
  ]
})
export class RoomsComponent implements OnInit, OnDestroy {
  // Template references for modals
  @ViewChild('editModalTemplate') editModalTemplate: TemplateRef<any>;
  @ViewChild('reserveModalTemplate') reserveModalTemplate: TemplateRef<any>;
  @ViewChild('confirmDialog') confirmDialog: TemplateRef<any>;
  @ViewChild('confirmReservationDialog') confirmReservationDialog: TemplateRef<any>;
  
  // Form references
  @ViewChild('numberRoom') roomNumberInput: ElementRef;
  @ViewChild('typeRoom') roomTypeInput: ElementRef;
  @ViewChild('descriptionRoom') roomDescriptionInput: ElementRef;
  @ViewChild('capacityRoom') roomCapacityInput: ElementRef;
  @ViewChild('floorRoom') roomFloorInput: ElementRef;
  @ViewChild('image1Room') roomImage1Input: ElementRef;
  @ViewChild('image2Room') roomImage2Input: ElementRef;
  @ViewChild('priceRoom') roomPriceInput: ElementRef;
  @ViewChild('nameClient') nameClientInput: ElementRef;
  @ViewChild('phoneClient') phoneClientInput: ElementRef;
  
  // Room and reservation properties
  capacityOptions: number[] = [];
  reservationActive: boolean = false;
  idReservationActive: string = "";
  therIsChecIn: boolean = false;
  rervationIsToday: boolean = false;
  currentReservation: Reservation | null = null;
  today = new Date().toISOString();
  roomId: string | null = null;
  roomDetails: any = {};
  private subscription: Subscription = new Subscription();
  
  // Date picker properties
  minDate: Date = new Date();
  startDate: Date;
  endDate: Date;
  selectedPeople: number;

  extractedDates: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  gotoReservations(){
    this.router.navigate(['/reservations/'+ this.roomDetails.id]);
  }

  navigateToCalendar() {
    this.router.navigate(['/calendar/'+ this.roomDetails.id]);
  }

  transformReservationDates(reservations: any[]): { date_input: Date, date_leave: Date }[] {
    return reservations.map(reservation => ({
      date_input: new Date(reservation.date_input.seconds * 1000),
      date_leave: new Date(reservation.date_leave.seconds * 1000)
    }));
  }
  
  ngOnInit() {
    // Get room ID from route parameters
    const paramSub = this.route.paramMap.subscribe(params => {
      this.roomId = params.get('id');
      
      if (this.roomId) {
        this.loadRoomDetails(this.roomId);
      }
    });
    
    this.subscription.add(paramSub);
    
    // Load active reservations for this room
    if (this.roomId) {
      const reservationSub = this.reservationService.getUnfinalizedReservationsByRoom(this.roomId)
        .subscribe({
          next: (reservations) => {
            console.log(reservations);
            this.extractedDates = this.transformReservationDates(reservations);
          console.log(this.extractedDates);
            if (reservations && reservations.length > 0) {
              this.reservationActive = !reservations[0].Finalized;
              this.idReservationActive = reservations[0].id;
              this.currentReservation = reservations[0];
            
              if (this.reservationActive) {
                // Check if reservation is for today
                const timestampInMillis = this.currentReservation.date_input.seconds * 1000;
                const dateInput = new Date(timestampInMillis);
                const fechaActual = new Date();
                
                if (this.getOnlyDate(dateInput) <= this.getOnlyDate(fechaActual)) {
                  this.rervationIsToday = true;
                  if (this.currentReservation.registers.check_in && !this.currentReservation.registers.check_out) {
                    this.therIsChecIn = true;
                  }
                }
              }
            }
          },
          error: (error) => {
            console.error('Error loading reservations:', error);
          }
        });
        
      this.subscription.add(reservationSub);
    }
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  // Navigation
  navigateBack() {
    this.router.navigate(['/home']);
  }
  
  // Room details loading
  loadRoomDetails(roomId: string) {
    const detailsSub = this.roomService.getRoomById(roomId).subscribe({
      next: (data) => {
        this.roomDetails = data;
        this.capacityOptions = Array.from({ length: this.roomDetails.capacity }, (_, i) => i + 1);
      },
      error: (error) => {
        console.error('Error loading room details:', error);
        this.showSnackBar('Error loading room details', 'error');
      }
    });
    
    this.subscription.add(detailsSub);
  }
  
  // Modal management
  openEditModal() {
    this.dialog.open(this.editModalTemplate, {
      width: '500px',
      disableClose: true
    });
  }
  
  openReserveModal() {
    const dialogRef = this.dialog.open(this.reserveModalTemplate, {
      width: '500px',
      disableClose: true
    });
    
    // Set timeout to give dialog time to render before setting values
    /*setTimeout(() => {
      if (this.reservationActive && this.currentReservation) {
        this.loadExistingReservationData();
      }
    }, 300);*/
  }
  
  // Date helpers
  getOnlyDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  
  // Reservation functions
  loadExistingReservationData() {
    if (!this.currentReservation) return;
  
    if (this.nameClientInput) {
      this.nameClientInput.nativeElement.value = this.currentReservation.client_name;
    }
    
    if (this.phoneClientInput) {
      this.phoneClientInput.nativeElement.value = this.currentReservation.phone;
    }
    
    this.startDate = this.currentReservation.date_input.toDate();
    this.endDate = this.currentReservation.date_leave.toDate();
    this.selectedPeople = this.currentReservation.people;
  }
  
  /*addReservation() {
   // if (!this.idReservationActive) {
      // Create new reservation
      const newReservation: Omit<Reservation, 'id'> = {
        Finalized: false,
        client_name: this.nameClientInput.nativeElement.value,
        date_input: Timestamp.fromDate(this.startDate),
        date_leave: Timestamp.fromDate(this.endDate),
        people: this.selectedPeople,
        phone: this.phoneClientInput.nativeElement.value,
        roomId: this.roomDetails.id,
        numberRoom: this.roomDetails.number,
        total_days: this.calculateTotalDays() + 1,
        registers: { check_in: null, check_out: null },
      };
      
      this.reservationService.createReservation(newReservation)
        .then((docRef) => {
          this.showSnackBar('Reservation created successfully', 'success');
          this.dialog.closeAll();
          
          // Update room status
          this.updateRoomAvailability(false);
        })
        .catch((error) => {
          console.error('Error adding reservation:', error);
          this.showSnackBar('Error creating reservation', 'error');
        });
    //} else {
      // Update existing reservation
      /*const updatedReservation: Partial<Reservation> = {
        client_name: this.nameClientInput.nativeElement.value,
        date_input: Timestamp.fromDate(this.startDate),
        date_leave: Timestamp.fromDate(this.endDate),
        people: this.selectedPeople,
        phone: this.phoneClientInput.nativeElement.value,
        total_days: this.calculateTotalDays() + 1,
      };
      
      this.reservationService.updateReservation(this.idReservationActive, updatedReservation)
        .then(() => {
          this.showSnackBar('Reservation updated successfully', 'success');
          this.dialog.closeAll();
        })
        .catch((error) => {
          console.error('Error updating reservation:', error);
          this.showSnackBar('Error updating reservation', 'error');
        });
    }*
  }*/
  

  addReservation() {
    // Verificar si hay conflictos de fechas
    const isDateRangeConflict = this.checkDateRangeConflict();
  
    if (isDateRangeConflict) {
      // Mostrar alerta con información de conflicto
      this.showDateConflictAlert(isDateRangeConflict);
      return; // Detener la creación de la reservación
    }
  
    // Si no hay conflictos, proceder con la creación de la reservación
    const newReservation: Omit<Reservation, 'id'> = {
      Finalized: false,
      client_name: this.nameClientInput.nativeElement.value,
      date_input: Timestamp.fromDate(this.startDate),
      //date_leave: Timestamp.fromDate(this.endDate),
      date_leave: Timestamp.fromDate(this.setEndDateToEndOfDay(this.endDate)),
      people: this.selectedPeople,
      phone: this.phoneClientInput.nativeElement.value,
      roomId: this.roomDetails.id,
      numberRoom: this.roomDetails.number,
      total_days: this.calculateTotalDays() + 1,
      registers: { check_in: null, check_out: null },
    };
  
    this.reservationService.createReservation(newReservation)
      .then((docRef) => {
        this.showSnackBar('Reservation created successfully', 'success');
        this.dialog.closeAll();
        this.updateRoomAvailability(false);
      })
      .catch((error) => {
        console.error('Error adding reservation:', error);
        this.showSnackBar('Error creating reservation', 'error');
      });
  }
        
        // Método para verificar conflictos de fechas
  checkDateRangeConflict(): { conflictingReservation: any } | null {
    // Convertir las fechas de la nueva reservación a timestamps para comparación
    const newStartDate = this.startDate.getTime();
    const newEndDate = this.endDate.getTime();

    console.log(newStartDate)
    console.log(newEndDate)
    console.log(this.extractedDates)
  
    // Buscar conflictos en las reservaciones existentes
    for (const reservation of this.extractedDates) {
      const existingStartDate = reservation.date_input.getTime();
      const existingEndDate = reservation.date_leave.getTime();
  
      // Verificar si hay superposición de fechas
      const isConflict = 
        (newStartDate >= existingStartDate && newStartDate < existingEndDate) || // Nueva reserva comienza durante una reserva existente
        (newEndDate > existingStartDate && newEndDate <= existingEndDate) ||     // Nueva reserva termina durante una reserva existente
        (newStartDate <= existingStartDate && newEndDate >= existingEndDate) ||   // Nueva reserva cubre completamente una reserva existente
        (newEndDate > existingStartDate && newStartDate < existingEndDate);// ||
        //(newEndDate >= existingStartDate && newEndDate < existingEndDate);
      if (isConflict) {
        return { conflictingReservation: reservation };
      }
    }
  
    return null;
  }

 
    // Convertir las fechas de la nueva reservación a timestamps para comparación
   
  
    // Buscar conflictos en las reservaciones existentes
   
     
      // Verificar si hay superposición de fechas
      
  
        
        // Método para mostrar alerta de conflicto de fechas
  showDateConflictAlert(conflictData: { conflictingReservation: any }) {
    const { conflictingReservation } = conflictData;
    
    // Formatear las fechas para mostrar en el mensaje
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    const conflictMessage = `
      ¡Fechas no disponibles!
      
      Ya existe una reservación en el siguiente rango:
      - Entrada: ${formatDate(conflictingReservation.date_input)}
      - Salida: ${formatDate(conflictingReservation.date_leave)}
      
      Por favor, selecciona un rango de fechas diferente.
    `;
  
    // Mostrar alerta (puedes usar tu método de alerta preferido)
    this.showSnackBar(conflictMessage, 'error');
  }
  confirmDeleteReserve() {
    const dialogRef = this.dialog.open(this.confirmReservationDialog);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteReserve();
      }
    });
  }

  setEndDateToEndOfDay(date: Date): Date {
    const endDate = new Date(date); // Crea una nueva instancia de Date
    endDate.setHours(23, 59, 59, 999); // Ajusta la hora a las 11:59 PM
    return endDate;
  }

  
  
  gotoCalendar() {}
  async deleteReserve() {
    try {
      await this.reservationService.deleteReservation(this.idReservationActive);
      this.reservationActive = false;
      this.showSnackBar('Reservation deleted', 'success');
      
      // Update room status
      this.updateRoomAvailability(true);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      this.showSnackBar('Error deleting reservation', 'error');
    }
  }
  
  // Check-in and Check-out functions
  DoCheckIn() {
    const updatedReservation: Partial<Reservation> = {
      registers: { check_in: Timestamp.now(), check_out: null }
    };
    
    this.reservationService.updateReservation(this.idReservationActive, updatedReservation)
      .then(() => {
        this.therIsChecIn = true;
        this.showSnackBar('Check-in registered', 'success');
      })
      .catch((error) => {
        console.error('Error registering check-in:', error);
        this.showSnackBar('Error registering check-in', 'error');
      });
  }
  
  DoCheckOut() {
    const updatedReservation: Partial<Reservation> = {
      Finalized: true,
      registers: { 
        check_in: this.currentReservation.registers.check_in, 
        check_out: Timestamp.now() 
      }
    };
    
    this.reservationService.updateReservation(this.idReservationActive, updatedReservation)
      .then(() => {
        this.therIsChecIn = false;
        this.reservationActive = false;
        this.rervationIsToday = false;
        this.showSnackBar('Check-out registered', 'success');
        
        // Update room status
        this.updateRoomAvailability(true);
      })
      .catch((error) => {
        console.error('Error registering check-out:', error);
        this.showSnackBar('Error registering check-out', 'error');
      });
  }
  
  // Room management functions
  updateRoomAvailability(isAvailable: boolean) {
    const updatedRoomData: Partial<Room> = {
      avalible: isAvailable
    };
    
    this.roomService.updateRoom(this.roomId, updatedRoomData)
      .subscribe({
        next: () => {
          // Reload room details to show updated status
          this.loadRoomDetails(this.roomId);
        },
        error: (error) => {
          console.error('Error updating room availability:', error);
          this.showSnackBar('Error updating room availability', 'error');
        }
      });
  }
  
  updateCurrentRoom() {
    const updatedRoomData: Partial<Room> = {
      number: this.roomNumberInput.nativeElement.value,
      type: this.roomTypeInput.nativeElement.value,
      description: this.roomDescriptionInput.nativeElement.value,
      capacity: parseInt(this.roomCapacityInput.nativeElement.value),
      floor: parseInt(this.roomFloorInput.nativeElement.value),
      priceNight: parseInt(this.roomPriceInput.nativeElement.value),
      img: [
        this.roomImage1Input.nativeElement.value, 
        this.roomImage2Input.nativeElement.value
      ]
    };
    
    this.roomService.updateRoom(this.roomId, updatedRoomData)
      .subscribe({
        next: () => {
          this.showSnackBar('Room updated successfully', 'success');
          this.dialog.closeAll();
          // Reload room details
          this.loadRoomDetails(this.roomId);
        },
        error: (error) => {
          console.error('Error updating room:', error);
          this.showSnackBar('Error updating room', 'error');
        }
      });
  }
  
  confirmDelete() {
    const dialogRef = this.dialog.open(this.confirmDialog);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRoom();
      }
    });
  }
  
  deleteRoom() {
    if (!this.roomId) {
      this.showSnackBar('Room ID not found', 'error');
      return;
    }
    
    if (!this.roomDetails.avalible) {
      this.showSnackBar('Cannot delete a reserved room', 'error');
      return;
    }
    
    this.roomService.deleteRoom(this.roomId).subscribe({
      next: () => {
        this.showSnackBar('Room deleted successfully', 'success');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error deleting room:', error);
        this.showSnackBar('Error deleting room', 'error');
      }
    });
  }
  
  // Helper functions
  calculateTotalDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  showSnackBar(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
  
  // Icon mapping functions
  getFeatureIcon(feature: string): string {
    const iconMap = {
      'wifi': 'wifi',
      'hot water': 'hot_tub',
      'air conditioning': 'ac_unit',
      'tv': 'tv',
      'kitchen': 'kitchen',
      'workspace': 'computer',
      'parking': 'local_parking',
      'washer': 'local_laundry_service',
      'pool': 'pool'
    };
    
    const featureLower = feature.toLowerCase();
    return iconMap[featureLower] || null;
  }
  
  getAmenityIcon(amenity: string): string {
    const amenityMap = {
      'breakfast': 'free_breakfast',
      'gym': 'fitness_center',
      'spa': 'spa',
      'shuttle': 'airport_shuttle',
      'room service': 'room_service',
      'concierge': 'person',
      'bar': 'local_bar',
      'luggage storage': 'luggage'
    };
    
    const amenityLower = amenity.toLowerCase();
    return amenityMap[amenityLower] || 'check_circle';
  }
}
