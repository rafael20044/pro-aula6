import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: false,
})
export class InputComponent  implements OnInit {

  @Input() label:string = 'label';
  @Input() placeholder:string = 'placeholder';
  @Input() type:InputType = 'text';
  @Input() control = new FormControl();

  isPassword = false;

  constructor() {}

  ngOnInit() {
    this.isPassword = this.type === 'password';
  }

}

type InputType = 'email' | 'password' | 'text' | 'number';
