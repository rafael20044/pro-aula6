import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { AuthService } from 'src/app/shared/services/auth-service';
import { UserService } from 'src/app/shared/services/user-service';
import { StorageService } from 'src/app/shared/services/storage-service';
import { FilePickerService } from 'src/app/core/services/file-picker-service';
import { IImage } from 'src/app/interfaces/iimage';
import { ToastService } from 'src/app/shared/services/toast-service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: false,
})
export class EditProfilePage implements OnInit {
  nameControl = new FormControl('', [Validators.required, this.nameValidator]);
  name2Control = new FormControl('', [this.nameValidator]);
  lastNameControl = new FormControl('', [Validators.required, this.nameValidator]);
  lastName2Control = new FormControl('', [this.nameValidator]);
  emailControl = new FormControl({ value: '', disabled: true });

  profilePhoto: string | null = null;
  file: IImage | null = null;
  currentUserId: number | null = null;
  currentPhotoPath: string | null = null;
  isSaving = false;

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly userService: UserService,
    private readonly storage: StorageService,
    private readonly filePicker: FilePickerService,
    private readonly toast: ToastService
  ) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  private async loadUserData() {
    const user = this.auth.getUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const data = await this.userService.getUserByUid(user.id);
    if (!data) return;

    this.currentUserId = data.id;
    this.currentPhotoPath = data.path;
    this.nameControl.setValue(data.name || '');
    this.name2Control.setValue(data.name2 || '');
    this.lastNameControl.setValue(data.last_name || '');
    this.lastName2Control.setValue(data.last_name2 || '');
    this.emailControl.setValue(data.email || '');

    if (data.photo) {
      if (data.photo.startsWith('http')) {
        this.profilePhoto = data.photo;
      } else {
        const signed = await this.storage.getSignUrl(Const.BUCKET, data.photo);
        this.profilePhoto = signed?.url || null;
      }
    }
  }

  async changePhoto() {
    const result = await this.filePicker.pickImage();
    if (result) {
      this.profilePhoto = result.previewUrl;
      this.file = result;
    }
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') return null;
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    const valid = namePattern.test(control.value);
    return valid ? null : { invalidName: true };
  }

  private normalizeText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) return 'Este campo es requerido';
    if (control.hasError('invalidName')) return 'Solo se permiten letras y espacios';
    return 'Valor inválido';
  }

  isFormValid(): boolean {
    const name2Valid = !this.name2Control.value || this.name2Control.valid;
    const lastName2Valid = !this.lastName2Control.value || this.lastName2Control.valid;
    return this.nameControl.valid && this.lastNameControl.valid && name2Valid && lastName2Valid;
  }

  async save() {
    if (!this.isFormValid() || this.isSaving || !this.currentUserId) return;

    this.isSaving = true;
    this.nameControl.markAsTouched();
    this.name2Control.markAsTouched();
    this.lastNameControl.markAsTouched();
    this.lastName2Control.markAsTouched();

    try {
      const updates: any = {
        name: this.normalizeText(this.nameControl.value || ''),
        name2: this.normalizeText(this.name2Control.value || ''),
        last_name: this.normalizeText(this.lastNameControl.value || ''),
        last_name2: this.normalizeText(this.lastName2Control.value || '')
      };

      // Actualizar foto si se cambió
      if (this.file) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
        const folder = `users/${this.currentUserId}`;
        const uploaded = await this.storage.upload(Const.BUCKET, folder, fileName, this.file.data, this.file.mimeType);
        
        if (uploaded) {
          updates.photo = uploaded.url;
          updates.path = uploaded.path;
        }
      }

      const success = await this.userService.updateUser(updates, this.currentUserId);
      
      if (!success) {
        throw new Error('Failed to update profile');
      }

      await this.toast.show('Perfil actualizado correctamente', 2200, 'bottom', 'success');
      
      await this.router.navigate(['/user/home'], { 
        queryParams: { tab: 'profile', reload: Date.now() } 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      await this.toast.showError('Error al actualizar el perfil');
    } finally {
      this.isSaving = false;
    }
  }

  goBack() {
    this.location.back();
  }
}
