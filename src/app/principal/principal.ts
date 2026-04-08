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


        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
          const margin = 120;
          const scale = 6;

          canvas.width = (img.width * scale) + (margin * 2);
          canvas.height = (img.height * scale) + (margin * 2);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, margin, margin, img.width * scale, img.height * scale);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

          }
          ctx.putImageData(imageData, 0, 0);
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
    const fechaMatch = text.match(/\d{2}-\d{2}-\d{4}D/);
    const nombreMatch = text.match(/[A-ZÁÉÍÓÚÑ]{3,}F/);
    const lugarmatch = text.match(/[A-ZÁÉÍÓÚÑ]+d/);
    const domiciliomatch = text.match(/C\.[A-ZÁÉÍÓÚÑ\s]+/);
    const nacionalidadmatch = text.match(/[A-ZÁÉÍÓÚÑ]+f/);
    const apellidosMatch = text.match(/[A-ZÁÉÍÓÚÑ]+\s[A-ZÁÉÍÓÚÑ]+H/);
    const validezMatch = text.match(/\d{2}-\d{2}-\d{4}P/);
    this.datosDni.set({
      numero: dniMatch ? dniMatch[0] : 'No encontrado',
      fechaNacimiento: fechaMatch ? fechaMatch[0].replace('D', '') : 'No encontrado',
      nombre: nombreMatch ? nombreMatch[0].replace('F', '') : 'No encontrado',
      lugarNacimiento: lugarmatch ? lugarmatch[0].replace('d', '') : 'No encontrado',
      domicilio: domiciliomatch ? domiciliomatch[0] : 'No encontrado',
      nacionalidad: nacionalidadmatch ? nacionalidadmatch[0].replace('f', '') : 'No encontrado',
      apellidos: apellidosMatch ? apellidosMatch[0].replace('H', '') : 'No encontrado',
      fechaValidez: validezMatch ? validezMatch[0].replace('P', '') : 'No encontrado',
      raw: text
    });
  }

  limpiar() {
    this.datosDni.set(null);
    this.errorMsg.set('');
    this.imagePreview.set(null);
  }


}
