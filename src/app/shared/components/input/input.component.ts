import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: false,
})
export class InputComponent  implements OnInit, OnChanges {

  @Input() label:string = 'label';
  @Input() placeholder:string = 'placeholder';
  @Input() type:InputType = 'text';
  @Input() control = new FormControl();
  @Input() showErrors: boolean = true; // Mostrar mensajes de error

  isPassword = false;
  displayLabel = '';
  requiredAsterisk = false;

  constructor() {}

  ngOnInit() {
    this.isPassword = this.type === 'password';
    this.parseLabel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) {
      this.parseLabel();
    }
  }

  private parseLabel() {
    const raw = this.label ?? '';
    this.requiredAsterisk = /\*/.test(raw);
    this.displayLabel = raw.replace(/\s*\*/g, '').trim();
  }

  getErrorMessage(): string | null {
    if (!this.control || !this.control.invalid || !this.control.touched) {
      return null;
    }

    if (this.control.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (this.control.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }

    if (this.control.hasError('invalidName')) {
      return 'Solo se permiten letras';
    }

    if (this.control.hasError('minlength')) {
      const minLength = this.control.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    return 'Valor inválido';
  }

}

type InputType = 'email' | 'password' | 'text' | 'number';
