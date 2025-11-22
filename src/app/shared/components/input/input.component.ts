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

}

type InputType = 'email' | 'password' | 'text' | 'number';
