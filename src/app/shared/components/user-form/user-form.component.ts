import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';


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
  profilePhoto: string | null = null;
  selectedFile: File | null = null;
  // wizard step: 1 = nombres/apellidos/rol, 2 = email + contraseña, 3 = foto y submit
  currentStep: number = 1;

  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder) {}

  // Typed getters for template bindings (return FormControl so <app-input> accepts them)
  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get name2Control(): FormControl {
    return this.form.get('name2') as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.form.get('last_name') as FormControl;
  }

  get lastName2Control(): FormControl {
    return this.form.get('last_name2') as FormControl;
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.form.get('confirmPassword') as FormControl;
  }

  ngOnInit() {
    this.initForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
      if (this.initialData.photo) {
        this.profilePhoto = this.initialData.photo;
      }
    }
  }

  // Wizard navigation helpers
  goToStep(step: number) {
    this.currentStep = step;
  }

  // wrappers so template can bind direct function references
  goToStepTo1 = () => this.goToStep(1);
  goToStepTo2 = () => this.goToStep(2);
  goToStepTo3 = () => this.goToStep(3);

  // Validate step 2 fields (email, password and match)
  step2Valid(): boolean {
    if (!this.emailControl || !this.passwordControl || !this.confirmPasswordControl) return false;
    const emailValid = this.emailControl.valid;
    const passValid = this.passwordControl.valid;
    const match = this.passwordsMatch;
    return emailValid && passValid && match;
  }

  // Validate step 1 required fields: name, last_name and rol
  step1Valid(): boolean {
    const n = this.form.get('name');
    const ln = this.form.get('last_name');
    return !!n && !!ln && n.valid && ln.valid;
  }

  // wrapper for submit to pass as action to button
  submitForm = () => this.submit();

  initForm() {
    const formConfig: any = {
      name: ['', [Validators.required, Validators.minLength(2)]],
      name2: [''],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name2: [''],
  email: ['', [Validators.required, Validators.email]],
    };

    if (this.isRegistration) {
      // password must be more than 6 characters -> minLength 7
      formConfig.password = ['', [Validators.required, Validators.minLength(7)]];
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
