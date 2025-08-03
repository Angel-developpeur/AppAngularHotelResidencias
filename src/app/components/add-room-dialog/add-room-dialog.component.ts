
import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

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

// Components
import { RoomCardComponent } from '../room-card/room-card.component';
import { Room } from '../../models/room';
import { RoomService } from '../../services/room-service.service';

// Modal Component





@Component({
  selector: 'app-add-room-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatToolbarModule
  ],
  templateUrl: './add-room-dialog.component.html',
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class AddRoomDialogComponent {



  room: Partial<Room> = {
    number: '',
    type: '',
    description: '',
    capacity: 1,
    floor: 1,
    priceNight: 0,
    avalible: true,
    img: ['', ''],
    characteristics: []
  };
}
