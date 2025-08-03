import { Component, Inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { ExtrasService } from '../../services/extras.service';
import { Extra } from '../../models/extra';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

// Diálogo para agregar un nuevo extra
@Component({
  selector: 'app-add-extra-dialog',
  template: `
    <h2 mat-dialog-title>Agregar Nuevo Extra</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Nombre del Extra</mat-label>
        <input matInput [(ngModel)]="extraNombre">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button (click)="onAdd()">Agregar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule
  ]
})
export class AddExtraDialogComponent {
  extraNombre: string = '';

  constructor(public dialogRef: MatDialogRef<AddExtraDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    if (this.extraNombre.trim()) {
      this.dialogRef.close(this.extraNombre);
    }
  }
}

// Diálogo para editar un extra existente
@Component({
  selector: 'app-edit-extra-dialog',
  template: `
    <h2 mat-dialog-title>Editar Extra</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Nombre del Extra</mat-label>
        <input matInput [(ngModel)]="extraNombre">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button (click)="onSave()">Guardar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule
  ]
})
export class EditExtraDialogComponent {
  extraNombre: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditExtraDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nombre: string }
  ) {
    this.extraNombre = data.nombre;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.extraNombre.trim()) {
      this.dialogRef.close(this.extraNombre);
    }
  }
}

// Diálogo de confirmación para eliminar un extra
@Component({
  selector: 'app-delete-extra-dialog',
  template: `
    <h2 mat-dialog-title>Confirmar Eliminación</h2>
    <mat-dialog-content>
      ¿Está seguro de que desea eliminar el extra "{{extraNombre}}"?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="warn" (click)="onConfirm()">Eliminar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DeleteExtraDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteExtraDialogComponent>,
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
    AddExtraDialogComponent,
    EditExtraDialogComponent,
    DeleteExtraDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './extras.component.html',
  standalone: true,
  styleUrl: './extras.component.css'
})
export class ExtrasComponent implements OnInit {
  extrasArray: Extra[] = [];

  constructor(
    private router: Router, 
    private extraService: ExtrasService,
    private dialog: MatDialog
  ) { }

  navigateBack() {
    this.router.navigate(['home']);
  }

  editExtra(extra: Extra) {
    const dialogRef = this.dialog.open(EditExtraDialogComponent, {
      width: '250px',
      data: { nombre: extra.nombre }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar el extra con el nuevo nombre
        extra.nombre = result;
        console.log('Extra actualizado');
        // Descomentar cuando tenga el método en el servicio
         this.extraService.editExtra(extra.id, extra).subscribe()
      }
    });
  }

  deleteExtra(extra: Extra) {
    const dialogRef = this.dialog.open(DeleteExtraDialogComponent, {
      width: '250px',
      data: extra.nombre
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Extra eliminado');
        // Eliminar de la lista local
        this.extrasArray = this.extrasArray.filter(e => e !== extra);
        // Descomentar cuando tenga el método en el servicio
        this.extraService.deleteExtra(extra.id).subscribe()
        // compilar esta vercion para el dispositivo de ionic
      }
    });
  }

  openAddExtraDialog() {
    const dialogRef = this.dialog.open(AddExtraDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Crear nuevo extra
        const nuevoExtra:Omit<Extra, 'id'> = {
          nombre: result,
          // Añadir otros campos necesarios según su modelo
        };

        console.log('Nuevo extra:', nuevoExtra);
        // Añadir a la lista local
       // this.extrasArray.push(nuevoExtra);
        // Descomentar cuando tenga el método en el servicio
        this.extraService.createExtra(nuevoExtra).subscribe()
      }
    });
  }

  ngOnInit() {
    this.extraService.getExtras().subscribe(
      data => {
        console.log(data);
        this.extrasArray = data;
      },
      error => {
        console.error('Error al cargar extras', error);
      }
    );
  }
}