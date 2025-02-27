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
  template: `
    <mat-card class="room-card" (click)="navigateToRoomDetail(room.id)">
      <div class="room-card-layout">
        <!-- Imagen de la habitación -->
        <div class="room-image-container">
          <img alt="Imagen de la habitación" [src]="room.img[0]" class="room-image" />
        </div>
        
        <!-- Contenido de la tarjeta -->
        <div class="room-content">
          <!-- Badges -->
          <div class="room-badges">
            <mat-chip [color]="room.avalible ? 'accent' : 'warn'" selected>
              {{room.avalible ? 'disponible' : 'ocupada'}}
            </mat-chip>
            <mat-chip color="primary" selected>
              To: {{room.capacity}} people
            </mat-chip>
            <mat-chip color="primary" selected>
              floor: {{room.floor}}
            </mat-chip>
          </div>
          
          <!-- Título y detalles -->
          <mat-card-header class="room-header">
            <mat-card-title class="room-title">Room {{room.number}} - {{room.type}}</mat-card-title>
            <mat-card-subtitle class="description-subtitle">Description</mat-card-subtitle>
          </mat-card-header>
          
          <!-- Descripción -->
          <mat-card-content class="room-description">
            {{room.description}}
          </mat-card-content>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .room-card {
      cursor: pointer;
      margin: 10px;
      transition: transform 0.2s;
    }
    
    .room-card:hover {
      transform: translateY(-5px);
    }
    
    .room-card-layout {
      display: flex;
      flex-direction: row;
    }
    
    .room-image-container {
      min-width: 120px;
      max-width: 180px;
      height: 100%;
    }
    
    .room-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    
    .room-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .room-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .room-header {
      padding: 8px 0;
    }
    
    .room-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    
    .description-subtitle {
      margin-top: 4px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .room-description {
      margin-top: 8px;
      color: rgba(0, 0, 0, 0.7);
      font-size: 14px;
    }
  `]
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