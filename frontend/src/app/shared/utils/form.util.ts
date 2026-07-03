import { FormGroup } from '@angular/forms';

export function isFieldInvalid(form: FormGroup, field: string): boolean {
  const control = form.get(field);
  return Boolean(control?.invalid && control.touched);
}

export function markFormTouched(form: FormGroup): void {
  form.markAllAsTouched();
}
