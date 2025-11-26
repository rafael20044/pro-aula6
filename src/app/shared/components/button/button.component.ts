import { Component, Input, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false,
})
export class ButtonComponent  implements OnInit {

  @Input() text: string = 'text';
  
  @Input() action: () => void = () => this.actionDefault();
  @Input() type: ButtonType = 'button';

  @Input() icon?: string;

  @Input() expand: 'full' | 'block' | 'inset' | undefined = undefined;

  @Input() disabled: boolean = false;

  @Input() variant: 'filled' | 'flat' | 'outline' | undefined = undefined;

  @HostBinding('class') get hostClasses(): string {
    return this.variant ? `app-btn-${this.variant}` : '';
  }

  constructor() { }

  ngOnInit() {}

  actionDefault(){
  }

}

type ButtonType = 'button' | 'submit';
