import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appNumericInput]',
  standalone: true,
})
export class NumericInputDirective implements OnInit {
  @Input() appNumericInput: 'int' | 'decimal' = 'int';

  private initialValue: string = '';

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit() {
    // Guardar el valor inicial
    this.initialValue = this.el.nativeElement.value;
    // Aplicar máscara al valor inicial
    this.applyMask();
  }

  @HostListener('focus')
  onFocus() {
    // Si el valor es 0 o está vacío al hacer focus, limpiar
    const currentValue = this.el.nativeElement.value.trim();
    if (currentValue === '0' || currentValue === '') {
      this.el.nativeElement.value = '';
    }
  }

  @HostListener('blur')
  onBlur() {
    const currentValue = this.el.nativeElement.value.trim();
    // Si está vacío al salir del input, poner 0
    if (currentValue === '') {
      this.el.nativeElement.value = '0';
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Eliminar caracteres que no sean números y puntos (si es decimal)
    if (this.appNumericInput === 'int') {
      value = value.replace(/[^0-9]/g, '');
    } else {
      // Para decimal: permite números y un solo punto
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
      }
    }

    input.value = value;
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    const charStr = String.fromCharCode(charCode);

    // Permitir solo números y puntos (si es decimal) y teclas de control
    if (this.appNumericInput === 'int') {
      if (!/[0-9]/.test(charStr)) {
        event.preventDefault();
      }
    } else {
      if (!/[0-9.]/.test(charStr)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    let value = clipboardData;

    // Eliminar caracteres que no sean números
    if (this.appNumericInput === 'int') {
      value = value.replace(/[^0-9]/g, '');
    } else {
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
      }
    }

    this.el.nativeElement.value = value;
    this.el.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private applyMask() {
    let value = this.el.nativeElement.value;

    if (this.appNumericInput === 'int') {
      value = value.replace(/[^0-9]/g, '');
    } else {
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
      }
    }

    this.el.nativeElement.value = value;
  }
}
