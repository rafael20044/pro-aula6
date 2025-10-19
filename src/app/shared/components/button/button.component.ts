import { Component, Input, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false,
})
export class ButtonComponent  implements OnInit {

  @Input() text: string = 'text';
  // action should be a function reference passed from the parent.
  @Input() action: () => void = () => this.actionDefault();
  @Input() type: ButtonType = 'button';
  // optional icon name for ion-icon
  @Input() icon?: string;
  // expand mode for ion-button (e.g., 'block')
  @Input() expand: 'full' | 'block' | 'inset' | undefined = undefined;
  // allow disabling the button from parent templates
  @Input() disabled: boolean = false;
  /** visual variant: 'filled' will be a solid pill, 'flat' leaves it transparent */
  @Input() variant: 'filled' | 'flat' | 'outline' | undefined = undefined;

  @HostBinding('class') get hostClasses(): string {
    return this.variant ? `app-btn-${this.variant}` : '';
  }

  constructor() { }

  ngOnInit() {}

  actionDefault(){
    console.log('HIIIIIIIII');
  }

}

type ButtonType = 'button' | 'submit';
