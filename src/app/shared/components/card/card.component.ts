import { Component, Input } from '@angular/core';

export interface SwipeProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  passions: string[];
  image: string;
  online?: boolean;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false,
})
export class CardComponent {
  @Input() public profile!: SwipeProfile;
  @Input() public isActive = false;
  @Input() public stackIndex = 0;
}
