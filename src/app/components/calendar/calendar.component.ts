import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MatIconModule } from '@angular/material/icon';
import esLocale from '@fullcalendar/core/locales/es';
import { Subscription } from 'rxjs';
import { ReservationService } from '../../services/reservation-service.service';
import { Reservation} from '../../models/reservation';
import { MatToolbar } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatToolbar,MatIconModule],
  template: `
   <mat-toolbar style="background-color: #444; color:white;">
  
        <mat-icon (click)="navigateToHome()" aria-label="Back" style="color: white;">arrow_back</mat-icon>
    
      <span>Calendar</span>
     
      
    </mat-toolbar>
    <div class="calendario-container">
      <h2>Reservaciones de este mes</h2>
      <div id="calendario"></div>
    </div>
  `,
  styles: [`
    .calendario-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    #calendario {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class CalendarComponent implements OnInit {
  private calendar: Calendar | undefined;

  roomId: string;
  
  // Datos estáticos de ejemplo para los eventos
  private eventos = [
    {
      title: 'Reunión con clientes',
      start: this.getDateString(0),
      end: this.getDateString(0),
      backgroundColor: '#4285F4'
    },
    {
      title: 'Presentación de proyecto',
      start: this.getDateString(2),
      end: this.getDateString(2),
      backgroundColor: '#EA4335'
    },
    {
      title: 'Capacitación de equipo',
      start: this.getDateString(5),
      end: this.getDateString(5),
      backgroundColor: '#FBBC05'
    },
    {
      title: 'Webinar marketing digital',
      start: this.getDateString(8),
      end: this.getDateString(8),
      backgroundColor: '#34A853'
    },
    {
      title: 'Revisión de avances',
      start: this.getDateString(12),
      end: this.getDateString(12),
      backgroundColor: '#4285F4'
    },
    {
      title: 'Conferencia anual',
      start: this.getDateString(15),
      backgroundColor: '#EA4335',
      end: this.getDateString(17)
    },
    {
      title: 'Reunión de planificación',
      start: this.getDateString(20),
      end: this.getDateString(20),
      backgroundColor: '#34A853'
    },
    {
      title: 'Cierre mensual',
      start: this.getDateString(25),
      end: this.getDateString(25),
      backgroundColor: '#FBBC05'
    }
  ];
  private subscription: Subscription;
  unfinalizedReservations: Reservation[];

  constructor(private reservationService: ReservationService, private router: Router,
    private location: Location, private route: ActivatedRoute,
  ) { 

  }

  loadReservations() {
    let reservationS: any;
    
     // Definir los eventos directamente en el componente
      this.subscription = this.reservationService.getUnfinalizedReservationsByRoom(this.roomId).subscribe(
       (reservations) => {
         
         //this.unfinalizedReservations = reservations;
         this.unfinalizedReservations = reservations.map((reservation) => this.convertToNewFormat(reservation));
         //this.fetchReservations(reservations)
        // this.loading = false;
         this.initCalendar();
         reservationS = this.unfinalizedReservations; 
         console.log(this.unfinalizedReservations);
 
         
       },
       (err) => {
         
         //this.loading = false;
       }
     );
     const currentYear = new Date().getFullYear();
     const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
     
  
    
   }

  ngOnInit(): void {
    const paramSub = this.route.paramMap.subscribe(params => {
      this.roomId = params.get('id');
      
      if (this.roomId) {
        
      }
    });
    this.loadReservations();

    
      // Carga eventos de reservaciones no finalizadas
  }

  private initCalendar(): void {
    const calendarEl = document.getElementById('calendario');
    console.log(this.unfinalizedReservations)
    if (calendarEl) {
      this.calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: ''
        },
        events: this.unfinalizedReservations,
        locale: esLocale,
        editable: false,
        selectable: false,
        eventClick: (info) => {
          console.log(info)
          alert(`${info.event.title} \n Fecha inicio: ${info.event.start.toLocaleString()}
           \n Fecha fin: ${info.event.end.toLocaleString()}`);
        }
      });
      
      this.calendar.render();
    }
  }

  // Método auxiliar para generar fechas relativas al mes actual
  private getDateString(daysToAdd: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  convertToNewFormat(reservation: Reservation): any {
    // Convertir las fechas
    console.log(reservation)
    
    console.log(reservation.roomId.toString())
    let infoRoom: any = {};
    const startDate = new Date(reservation.date_input.seconds * 1000);
    const endDate = new Date(reservation.date_leave.seconds * 1000);
    
    // Formatear las fechas en el formato `YYYY-MM-DD`
    const currentYear = startDate.getFullYear();
    const currentMonth = (startDate.getMonth() + 1).toString().padStart(2, '0'); // Mes con 2 dígitos
    const startFormatted = `${currentYear}-${currentMonth}-${startDate.getDate().toString().padStart(2, '0')}`;
    const endFormatted = `${currentYear}-${currentMonth}-${endDate.getDate().toString().padStart(2, '0')}`;
    //consultar el numero de la habitacion del cuarto/ esto es ineficioente ca,bian en futuras versionas
    
    // Crear el objeto en el nuevo formato
    return {
     // id: reservation.id, // Usamos el id de la reserva
      title: `Habitación Para - Familia ${reservation.client_name}`, // Puedes ajustar este título
      start: startFormatted,
      end: endFormatted,
      backgroundColor: '#4285F4'
    // allDay: true, // Esto lo dejas como 'true' si son eventos todo el día
     /* extendedProps: {
        type: 'long', // Ajusta este valor si es necesario
        status: reservation.Finalized ? 'Finalidada' : 'Creada', // Cambia el estado según si está finalizada o no
        roomNumber: reservation.numberRoom, // El número de la habitación
        guestName: reservation.client_name, // Nombre del huésped
        notes: 'Solicita cama adicional para niño', // Puedes modificar o quitar esta nota
        start: new Date(reservation.date_input.seconds * 1000),
        end: new Date(reservation.date_leave.seconds * 1000),
        
      }*/
    };
  }

  navigateToHome() {
    //this.router.navigate(['/home']);
    if (this.location) {
      this.location.back();
    } else {
      // Fallback
      window.history.back();
    }
  }
}