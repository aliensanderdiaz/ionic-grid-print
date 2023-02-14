import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as QRCode from 'qrcode';

import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import EscPosEncoder from 'esc-pos-encoder-ionic';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: any;
  ctx!: CanvasRenderingContext2D;
  width = 300;
  height = 300;

  dataprint: any;

  constructor(private bluetoothSerial: BluetoothSerial) {
    // this.ctx = this.canvas.nativeElement.getContext('2d');
  }

  ngOnInit(): void {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      context.strokeStyle = 'red';
      context.fillStyle = 'rgba(255, 255, 255, 1)';
      this.ponerImagen(context, canvas);
    }
  }

  async imprimir() {
    console.log({
      'this.bluetoothSerial': this.bluetoothSerial,
    });
    let isEnabled = await this.bluetoothSerial.isEnabled();
    console.log({ isEnabled });
    let isConnected;
    try {
      isConnected = await this.bluetoothSerial.isConnected();
      console.log({ isConnected });
    } catch (error) {}

    if (!isConnected) {
      // return
      this.bluetoothSerial.connect('DC:0D:30:8A:B9:41').subscribe({
        next: (data: any) => {
          console.log({ data });
        },
        error: (error: any) => {
          console.error({ error });
        },
        complete: () => {
          console.log({ mensaje: 'completo' });
        },
      });
      setTimeout(async () => {
        let isConnected = await this.bluetoothSerial.isConnected();
        console.log({ isConnected });

        await this.bluetoothSerial.write(this.dataprint);
      }, 100);
    } else {
      await this.bluetoothSerial.write(this.dataprint);
    }
  }

  async ponerImagen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    let qrdata = await QRCode.toDataURL('universal.co.com', { width: 120 });

    const styles = {
      default: { font: '15px arial' },
      large: { font: '30px arial black' },
    };

    // el texto va centrado en el centro del canvas
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    // el color del texto e blanco con un 50% de transparencia.
    ctx.fillStyle = 'rgba(0,0,0,1)';
    // dibuja la imagen en el canvas
    const myImage = new Image(50, 50);
    myImage.src = qrdata;
    myImage.onload = (e) => {
      ctx.drawImage(<CanvasImageSource>(<unknown>myImage), 0, 0);
      // el texto para la marca de agua
      let texto = 'ABC-541';
      let tamanoTexto = 15; // empieza con algo grande, más grande de lo que sea necesario

      ctx.font = tamanoTexto + 'px Arial';
      // mide la anchura del texto
      // let anchuraTexto = ctx.measureText(texto).width;
      // mientras que el texto siga demasiado grande
      // while (anchuraTexto > 300 - 20) {
      //   // disminuie el tamaño del texto
      //   tamanoTexto--;
      //   ctx.font = tamanoTexto + 'px Georgia';
      //   anchuraTexto = ctx.measureText(texto).width;
      // }

      //pinta el texto en el canvas
      Object.assign(ctx, styles["large"])
      ctx.fillText(texto, 125, 30);
      Object.assign(ctx, styles["default"])
      ctx.fillText('SERVICIO TÉCNICO', 125, 60);
      ctx.fillText('ALMACENES UNIVERSAL', 125, 90);

      //vuelve a transformar la imagen en data:uri
      console.log(canvas.toDataURL());

      // return

      // return

      const encoder = new EscPosEncoder();

      let result = encoder.initialize();

      let imgQR = new Image();
      imgQR.src = canvas.toDataURL();

      imgQR.onload = async () => {
        this.dataprint = result
          .codepage('cp437')
          // .image(imgQR, 560, 280, 'atkinson', 128) // Grande
          .image(imgQR, 480, 240, 'atkinson', 128)
          .newline()
          .newline()
          // .newline()
          // .newline()
          // .newline()
          .cut()
          .encode();
      };
    };
  }
}
