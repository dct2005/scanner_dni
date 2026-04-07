import { Component } from '@angular/core';
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
  constructor() {
    this.lector = new BrowserMultiFormatReader();
  }
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    const codigo = reader.onload;
    this.cargando = true;
    this.errorMsg = '';

    try {
      const bitmap = await this.lector.decodeFromImageUrl(codigo);
      if (bitmap) {
        this.datosDni = this.parseDni(bitmap.getText());
      } else {
        this.errorMsg = 'No se encontró código QR en la imagen.';
      }
    } catch (error) {
      this.errorMsg = 'Error al procesar la imagen.';
    } finally {
      this.cargando = false;
    }
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
  }

  limpiar() {
    this.datosDni = null;
    this.errorMsg = '';
  }


}
