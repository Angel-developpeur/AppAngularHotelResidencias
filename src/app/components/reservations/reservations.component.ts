import { Component, Inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { ExtrasService } from '../../services/extras.service';
import { Extra } from '../../models/extra';
import { Timestamp } from "firebase/firestore";
import { from, Observable } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import { MatButtonModule } from '@angular/material/button';

import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation-service.service';
import { Location } from '@angular/common'; 
import { Reservation } from '../../models/reservation';
import {  ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
//import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
//import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';  
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import {  ViewChild, ElementRef } from '@angular/core';
//import { FormsModule } from '@angular/forms';
//import { MatButtonModule } from '@angular/material/button';
//import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
//import { MatFormFieldModule } from '@angular/material/form-field';
//import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { RoomService } from '../../services/room-service.service';
import { Room } from '../../models/room';
//import { CommonModule } from '@angular/common';


// Diálogo de confirmación para eliminar un extra
@Component({
  selector: 'app-delete-extra-dialog',
  template: `
    <h2 mat-dialog-title>Confirmar Eliminación</h2>
    <mat-dialog-content>
      ¿Está seguro de que desea eliminar esta reservacion "{{extraNombre}}"?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="warn" (click)="onConfirm()">Eliminar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DeleteReservationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public extraNombre: string
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

// Componente principal de Extras
@Component({
  selector: 'app-extras',
  imports: [
    MatToolbar, 
    MatIcon, 
    CommonModule, 
    MatButtonModule,
    MatDialogModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatSnackBarModule,
    //MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    //MatDialogModule,
   // MatButtonModule,
    //CommonModule,
    
    DeleteReservationDialogComponent,
    //MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './reservations.component.html',
  standalone: true,
  styleUrl: './reservations.component.css'
})
export class ReservationsComponent implements OnInit {

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
  @ViewChild('reserveModalTemplate') reserveModalTemplate;
  infoActualRoom: Room;
  reservationsArray: Reservation[] = [];
  extractedDates: any;
  roomId: string
  startDate: Date;
  actualIdReservation: string
  fechaInicioReservationActual: any;
  fechaFinReservationActual: any;
  endDate: Date;
  selectedPeople: number;
  capacityOptions: number[] = [];
  minDate: Date = new Date();
  constructor(
    private router: Router,
   
    private reservationService: ReservationService,
    private dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private roomService: RoomService,
    private snackBar: MatSnackBar
    
  ) { }

  navigateBack() {
    if (this.location) {
      this.location.back();
    } else {
      // Fallback
      window.history.back();
    }
  }

  showModal(id: string) {
    console.log(id);
    this.reservationService.getReservation(id).subscribe({
      next: (data) => {
        if (data) {
          console.log(data)
          console.log(data.people);
          this.nameClientInput.nativeElement.value = data.client_name
          this.phoneClientInput.nativeElement.value = data.phone;
          this.startDate = data.date_input.toDate();
          this.endDate = data.date_leave.toDate();
          this.capacityOptions = Array.from({ length: this.infoActualRoom.capacity }, (_, i) => i + 1);
          this.selectedPeople = data.people
          this.actualIdReservation = data.id

          this.fechaInicioReservationActual = data.date_input.toDate();
          this.fechaFinReservationActual = data.date_leave.toDate();

        } else {
          console.log("error")
        }
      },
      error: (error) => {
      // console.log(""
        console.error('error 2');
      }
    });
    const dialogRef = this.dialog.open(this.reserveModalTemplate, {
      width: '500px',  // Puedes ajustar el tamaño del modal aquí
      data: { /* Pasar los datos que necesites al modal */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Hacer algo cuando el modal se haya cerrado
        console.log("Modal cerrado");
      }
    });
  }

  editReservation() {
    //return
    const isDateRangeConflict = this.checkDateRangeConflict();
  
    if (isDateRangeConflict) {
      // Mostrar alerta con información de conflicto
      this.showDateConflictAlert(isDateRangeConflict);
      return; // Detener la creación de la reservación
    }

    
  
    // Si no hay conflictos, proceder con la creación de la reservación
    const editReservation: Partial<Reservation> = {
      //Finalized: false,
      client_name: this.nameClientInput.nativeElement.value,
      date_input: Timestamp.fromDate(this.startDate),
      //date_leave: Timestamp.fromDate(this.endDate),
      date_leave: Timestamp.fromDate(this.setEndDateToEndOfDay(this.endDate)),
      people: this.selectedPeople,
      phone: this.phoneClientInput.nativeElement.value,
     // roomId: this.infoActualRoom.id,
      //numberRoom: this.roomDetails.number,
      //total_days: this.calculateTotalDays() + 1,
      registers: { check_in: null, check_out: null },
    };
  
    this.reservationService.updateReservation(this.actualIdReservation, editReservation)
      .then((docRef) => {
        this.showSnackBar('Reservation created successfully', 'success');
        this.dialog.closeAll();
        //this.updateRoomAvailability(false);
      })
      .catch((error) => {
        console.error('Error adding reservation:', error);
        this.showSnackBar('Error creating reservation', 'error');
      });
  }

  showSnackBar(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  setEndDateToEndOfDay(date: Date): Date {
    const endDate = new Date(date); // Crea una nueva instancia de Date
    endDate.setHours(23, 59, 59, 999); // Ajusta la hora a las 11:59 PM
    return endDate;
  }

  checkDateRangeConflict(): { conflictingReservation: any } | null {
    // Convertir las fechas de la nueva reservación a timestamps para comparación
    const newStartDate = this.startDate.getTime();
    const newEndDate = this.endDate.getTime();

    const copyExtractedDate = this.extractedDates
    console.log(copyExtractedDate)
    console.log(this.fechaInicioReservationActual);
    console.log(this.fechaFinReservationActual);

    const newObject = {
      date_input: this.fechaInicioReservationActual,
      date_leave: this.fechaFinReservationActual,
    };

    console.log(newObject);

    const copy2extractedDates = copyExtractedDate.filter(item => 
      item.date_input.getTime() !== newObject.date_input.getTime() || 
      item.date_leave.getTime() !== newObject.date_leave.getTime()
    );

    console.log(copy2extractedDates);

    return { conflictingReservation: "hols"}

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
  
  // Método auxiliar para calcular días
  calculateTotalDays(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  deleteReservation(reservation: Reservation) {
    const dialogRef = this.dialog.open(DeleteReservationDialogComponent, {
      width: '250px',
      //data: reservation.client_name
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log('Extra eliminado');
        // Eliminar de la lista local
       // this.extrasArray = this.extrasArray.filter(e => e !== reservation);
        // Descomentar cuando tenga el método en el servicio
        this.reservationService.deleteReservation(reservation.id)
        // compilar esta vercion para el dispositivo de ionic
      }
    });
  }

 

  ngOnInit() {
    const paramSub = this.route.paramMap.subscribe(params => {
      this.roomId = params.get('id');
      
      if (this.roomId) {
        this.roomService.getRoomById(this.roomId).subscribe(
          data=> {
            console.log(data);
            this.infoActualRoom = data;
          },
          error => {
            console.error('Error al cargar el room', error);
          }
        );
      }
    });
   
    console.log(this.infoActualRoom);

   this.reservationService.getUnfinalizedReservationsByRoom(this.roomId).subscribe(
      data => {
        console.log(data);
        this.reservationsArray = data;
        this.extractedDates = this.transformReservationDates(data);
        console.log(this.extractedDates);
      },
      error => {
        console.error('Error al cargar extras', error);
      }
    );
  }

  transformReservationDates(reservations: any[]): { date_input: Date, date_leave: Date }[] {
    return reservations.map(reservation => ({
      date_input: new Date(reservation.date_input.seconds * 1000),
      date_leave: new Date(reservation.date_leave.seconds * 1000)
    }));
  }
}