import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {}

  actionDefault(){
    // console.log('HIIIIIIIII');
  }

}

type ButtonType = 'button' | 'submit';
