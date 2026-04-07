import { Component, NgZone, signal } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { CommonModule } from '@angular/common';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
@Component({
  selector: 'app-principal',
  imports: [CommonModule],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {

  datosDni = signal<any>(null);
  cargando = signal<boolean>(false);
  errorMsg = signal<string>('');
  imagePreview = signal<string | null>(null);
  private lector: BrowserMultiFormatReader;
  constructor(private ngZone: NgZone) {
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.lector = new BrowserMultiFormatReader(hints);
  }
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cargando.set(true);
    this.errorMsg.set('');
    this.datosDni.set(null);
    this.imagePreview.set(null);

    const reader = new FileReader();
    reader.onload = (w: any) => {
      const img = new Image();
      img.onload = async () => {

        setTimeout(async () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext("2d")!;
            const margin = 40;
            const scale = 4;

            canvas.width = (img.width * scale) + (margin * 2);
            canvas.height = (img.height * scale) + (margin * 2);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, margin, margin, img.width * scale, img.height * scale);

            const bitmap = await this.lector.decodeFromCanvas(canvas);


            this.ngZone.run(() => {
              this.parseDni(bitmap.getText());
              this.cargando.set(false);
            });
          } catch (error) {
            this.ngZone.run(() => {
              this.errorMsg.set('No se encontró código QR legible.');
              this.cargando.set(false);
            });
          }
        }, 100);
      };

      this.ngZone.run(() => {
        this.imagePreview.set(w.target.result);
        img.src = w.target.result;
      });
    };
    reader.readAsDataURL(file);
  }




  parseDni(text: string) {
    const dniMatch = text.match(/\d{8}[A-Z]/);
    const fechaMatch = text.match(/\d{2}-\d{2}-\d{4}/);
    const nombreMatch = text.match(/[A-ZÁÉÍÓÚÑ]{3,}\s+[A-ZÁÉÍÓÚÑ]{3,}/);
    this.datosDni.set({
      numero: dniMatch ? dniMatch[0] : 'No encontrado',
      fechaNacimiento: fechaMatch ? fechaMatch[0] : 'No encontrada',
      nombre: nombreMatch ? nombreMatch[0] : 'No encontrado',
      raw: text
    });
  }

  limpiar() {
    this.datosDni.set(null);
    this.errorMsg.set('');
    this.imagePreview.set(null);
  }


}
