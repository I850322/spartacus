import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'cx-password-input',
  templateUrl: './password-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInputComponent {
  passwordType: string = 'password';

  @Input() public form: FormGroup;

  @Input()
  allowSwitch: boolean = true;

  @Input()
  placeholder: string;

  @Input()
  required: boolean = true;

  @Input()
  formControlName: string;

  constructor() {}

  changePasswordVisibility(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  getPasswordIcon(): string {
    return this.passwordType === 'password' ? 'EYE' : 'EYE_SLASH';
  }
}