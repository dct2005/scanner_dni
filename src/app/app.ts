import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Principal } from './principal/principal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Principal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  onCodeResult(resultString: string) {
    console.log('Contenido del QR:', resultString);
    alert('Código escaneado: ' + resultString);
  }
}
