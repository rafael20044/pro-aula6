import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-welcome-rule',
  templateUrl: './welcome-rule.component.html',
  styleUrls: ['./welcome-rule.component.scss']
})
export class WelcomeRuleComponent {
  @Input() rule: { title: string; description: string; icon: string } | null = null;
}
