import { Component, NgZone } from '@angular/core';
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

  datosDni: any = null;
  cargando = false;
  errorMsg = '';
  private lector: BrowserMultiFormatReader;
  constructor(private ngZone: NgZone) {
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.lector = new BrowserMultiFormatReader(hints);
  }
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cargando = true;
    this.errorMsg = '';
    this.datosDni = null;

    const reader = new FileReader();


    reader.onerror = () => this.ngZone.run(() => {
      this.errorMsg = 'Error al leer el archivo del dispositivo.';
      this.cargando = false;
    });

    reader.onload = (w: any) => {
      const img = new Image();


      img.onerror = () => this.ngZone.run(() => {
        this.errorMsg = 'El archivo seleccionado no es una imagen válida.';
        this.cargando = false;
      });

      img.onload = async () => {

        this.ngZone.run(async () => {
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

            if (bitmap) {
              this.parseDni(bitmap.getText());
            } else {
              this.errorMsg = 'No se encontró ningún código QR legible.';
            }
          } catch (error) {
            console.error('Error en escaneo:', error);
            this.errorMsg = 'No se encuentra el QR. Prueba con una foto más nítida o con más luz.';
          } finally {
            this.cargando = false;
          }
        });
      };
      img.src = w.target.result;
    };
    reader.readAsDataURL(file);
  }


  parseDni(text: string) {
    const fragmentos = text.split('|');
    this.datosDni = {
      numero: fragmentos[0] || 'Desconocido',
      apellido1: fragmentos[1] || '',
      apellido2: fragmentos[2] || '',
      nombre: fragmentos[3] || '',
      raw: text
    };
    return this.datosDni;
  }

  limpiar() {
    this.datosDni = null;
    this.errorMsg = '';
  }


}
