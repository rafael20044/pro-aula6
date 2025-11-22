import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IImage } from 'src/app/interfaces/iimage';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage-service';
import { StorageService } from '../../services/storage-service';
import { Capacitor } from '@capacitor/core';
import { IUserCreate } from 'src/app/interfaces/iuser';
import { Const } from 'src/app/const/const';
import { FilePickerService } from 'src/app/core/services/file-picker-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false,
})
export class UserFormComponent implements OnInit {
  @Input() isRegistration: boolean = true; // true para registro, false para editar perfil
  profilePhoto: string | null = null;
  selectedFile: File | null = null;
  file: IImage | null = null;

  nameControl = new FormControl('', [Validators.required]);
  name2Control = new FormControl('', [Validators.required]);
  lastNameControl = new FormControl('', [Validators.required]);
  lastName2Control = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required]);
  confirmPasswordControl = new FormControl('', [Validators.required]);

  form = new FormGroup({
    name: this.nameControl,
    name2: this.name2Control,
    lastName: this.lastNameControl,
    lastName2: this.lastName2Control,
    email: this.emailControl,
    password: this.passwordControl,
  });
  // wizard step: 1 = nombres/apellidos/rol, 2 = email + contraseña, 3 = foto y submit
  currentStep: number = 1;


  constructor(
    private readonly fileS:FilePickerService,
    private readonly auth: AuthService,
    private readonly user: UserService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly local: LocalStorageService,
    private readonly storage: StorageService,
  ) { }


  ngOnInit() {
    this.initForm();
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
    const { name, lastName } = this.form.value;
    return !!name && !!lastName;
  }

  // wrapper for submit to pass as action to button
  submitForm = () => this.submit();

  initForm() {

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
    const { password } = this.form.value;
    return password === this.confirmPasswordControl.value;
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
  async triggerCamera() {
    // if (Capacitor.isNativePlatform()) {
    //   const result = await this.camera.getImageFromCamera();
    //   if (result) {
    //     this.profilePhoto = result.webPath;
    //     this.file = result;
    //   }
    // }
  }

  // Trigger the gallery input
  async triggerGallery() {
    const result = await this.fileS.pickImage();
    if (result) {
      this.profilePhoto = result.previewUrl;
      this.file = result;
    }
  }

  removePhoto() {
    this.profilePhoto = null;
    this.selectedFile = null;
    this.file = null;
  }

  async submit() {
    const { name, name2, lastName, lastName2, email, password } = this.form.value;
    const user: IUserCreate = {
      name: name || '',
      name2: name2 || '',
      last_name: lastName || '',
      last_name2: lastName2 || '',
      email: email || '',
      password: password || '',
    }
    const uid = await this.auth.registerWithEmailAndPassword(email || '', password || '');
    user.uid = uid;
    if (this.file) {
      const result = await this.storage.upload(Const.BUCKET, 'img', this.file.name, this.file.data, this.file.mimeType);
      user.photo = result?.url;
      user.path = result?.path
    }
    const isCreate = await this.user.createUser(user);
    if (isCreate) {
      const id = await this.user.findIdByUid(uid || '');
      this.local.set(Const.USER_UID, uid);
      this.local.set(Const.USER_ID, id);
      this.router.navigate(['/home']);
      return;
    }
  }
}
