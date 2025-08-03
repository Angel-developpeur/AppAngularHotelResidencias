import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Room } from '../../models/room';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule
  ],
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.css']
})
export class RoomCardComponent {
  @Input() room!: Room;
  
  constructor(private router: Router) {}
  
  // Obtener color según disponibilidad
  getStatusColor(): string {
    return this.room.avalible ? 'accent' : 'warn';
  }
  
  // Navegar a la página de detalles
  navigateToRoomDetail(roomId: string, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevenir que se dispare el evento de clic de la tarjeta
    }
    this.router.navigateByUrl(`/rooms/${roomId}`);
  }
}