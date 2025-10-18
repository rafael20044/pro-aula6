import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false,
})
export class UserFormComponent implements OnInit {
  @Input() isRegistration: boolean = true; // true para registro, false para editar perfil
  @Input() initialData: any = null;
  @Output() formSubmit = new EventEmitter<any>();

  form!: FormGroup;
  roles = ['Estudiante', 'Profesor'];
  profilePhoto: string | null = null;
  selectedFile: File | null = null;

  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
      if (this.initialData.photo) {
        this.profilePhoto = this.initialData.photo;
      }
    }
  }

  initForm() {
    const formConfig: any = {
      name: ['', [Validators.required, Validators.minLength(2)]],
      name2: [''],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name2: [''],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]],
    };

    if (this.isRegistration) {
      formConfig.password = ['', [Validators.required, Validators.minLength(6)]];
      formConfig.confirmPassword = ['', [Validators.required]];
    }

    this.form = this.fb.group(formConfig, 
      this.isRegistration ? { validators: this.passwordMatchValidator } : {}
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get passwordsMatch(): boolean {
    if (!this.isRegistration) return true;
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Trigger the native camera capture input
  triggerCamera() {
    try {
      this.cameraInput.nativeElement.click();
    } catch (e) {
      // fallback: trigger the gallery input if camera not available
      this.galleryInput.nativeElement.click();
    }
  }

  // Trigger the gallery input
  triggerGallery() {
    this.galleryInput.nativeElement.click();
  }

  removePhoto() {
    this.profilePhoto = null;
    this.selectedFile = null;
  }

  isPrimaryPhoto(): boolean {
    return !!this.profilePhoto;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.form.value,
      photo: this.profilePhoto,
      photoFile: this.selectedFile
    };

    this.formSubmit.emit(formData);
  }
}
