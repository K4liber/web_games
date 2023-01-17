import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { default as Annotation } from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-quantum',
  templateUrl: './quantum.component.html',
  styleUrls: ['./quantum.component.scss'],
})
export class QuantumComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
    Chart.register(Annotation)
  }

  @Input() size: number = 600;

  ngOnInit(): void {
    window.onload = () => {
      this.drawCanvas(60, false, "myCanvas")
    }
  }

  rgb(r: number, g: number, b: number) {
      return "rgb("+r+","+g+","+b+")";
  }

  linearRelation(index: number, resolution: number) {
    return Math.abs(1 - 2*index / resolution)
  }

  quantumRelation(index: number, resolution: number) {
    return Math.cos(((index / resolution)) * Math.PI)**2
  }

  drawCanvas(
    measurementDegree: number,
    linear: boolean,
    canvasId: string
  ) {
    let canvas = this.document.getElementById(canvasId) as HTMLCanvasElement

    if ( canvas !== null ) {
      let resolution = 4 * 1440
      let ctx = canvas.getContext("2d");

      if (ctx != null ) {
        const results = Array.from({length: resolution}, (_, index) => {
            if (linear) {
              var prop = this.linearRelation(index, resolution)
            } else {
              var prop = this.quantumRelation(index, resolution)
            }
            
            let r = prop * 255
            let b = (1 - prop) * 255
            return {
                total: 360/resolution,
                shade: this.rgb(r, 0, b)
            }
        });
        let currentAngle = 90/180 * Math.PI;
        let middle = this.size/2
        let radius = middle/2

        for (let moodValue of results) {
            //calculating the angle the slice (portion) will take in the chart
            let portionAngle = (moodValue.total / 360) * 2 * Math.PI;
            //drawing an arc and a line to the center to differentiate the slice from the rest
            ctx.beginPath();
            ctx.arc(middle, middle, radius, currentAngle, currentAngle + portionAngle);
            currentAngle += portionAngle;
            ctx.lineTo(middle, middle);
            //filling the slices with the corresponding mood's color
            ctx.fillStyle = moodValue.shade;
            ctx.fill();
        }
        let out = middle/8
        ctx.setLineDash([2, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(middle, middle + radius + out);
        ctx.lineTo(middle, middle - radius - out);
        ctx.stroke();

        ctx.font = "24px Arial";
        ctx.fillStyle = "rgb(255, 255, 255)"
        ctx.fillText("0°", middle - 7, 105);
        ctx.fillText("180°", middle - 20, middle*2 - 85);
        // Measurement degree
        let measurementSize = radius + 10
        let degreeSize = 2;
        let startAngle = 0/180 * Math.PI;
        let x = Math.sin(startAngle + measurementDegree/180 * Math.PI) * measurementSize
        let y = Math.cos(startAngle + measurementDegree/180 * Math.PI) * measurementSize
        ctx.fillText(measurementDegree + "°→" + Math.round(100*this.quantumRelation(measurementDegree, 360)) + "%",
         middle + x + 8, middle - y + 8);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        startAngle = -90/180 * Math.PI;
        ctx.arc(middle, middle, measurementSize, 
          startAngle + (measurementDegree - degreeSize) / 180 * Math.PI, startAngle + (measurementDegree + degreeSize) / 180 * Math.PI);
        ctx.lineTo(middle, middle);
        ctx.fill();
      }
    }
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [ 65, 59, 80, 81, 56, 55, 40 ],
        label: 'Series A',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      },
      {
        data: [ 28, 48, 40, 19, 86, 27, 90 ],
        label: 'Series B',
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)',
        fill: 'origin',
      },
      {
        data: [ 180, 480, 770, 90, 1000, 270, 400 ],
        label: 'Series C',
        yAxisID: 'y1',
        backgroundColor: 'rgba(255,0,0,0.3)',
        borderColor: 'red',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      }
    ],
    labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July' ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      y:
        {
          position: 'left',
        },
      y1: {
        position: 'right',
        grid: {
          color: 'rgba(255,0,0,0.3)',
        },
        ticks: {
          color: 'red'
        }
      }
    }
  }
  
  private newLabel? = 'New label';
  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private generateNumber(i: number): number {
    return Math.floor((Math.random() * (i < 2 ? 100 : 1000)) + 1);
  }

  randomize(): void {
    for (let i = 0; i < this.lineChartData.datasets.length; i++) {
      for (let j = 0; j < this.lineChartData.datasets[i].data.length; j++) {
        this.lineChartData.datasets[i].data[j] = this.generateNumber(i);
      }
    }
    this.chart?.update();
  }

  // events
  public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }

  public hideOne(): void {
    const isHidden = this.chart?.isDatasetHidden(1);
    this.chart?.hideDataset(1, !isHidden);
  }

  public pushOne(): void {
    this.lineChartData.datasets.forEach((x, i) => {
      const num = this.generateNumber(i);
      x.data.push(num);
    });
    this.lineChartData?.labels?.push(`Label ${ this.lineChartData.labels.length }`);

    this.chart?.update();
  }

  public changeColor(): void {
    this.lineChartData.datasets[2].borderColor = 'green';
    this.lineChartData.datasets[2].backgroundColor = `rgba(0, 255, 0, 0.3)`;

    this.chart?.update();
  }

  public changeLabel(): void {
    const tmp = this.newLabel;
    this.newLabel = this.lineChartData.datasets[2].label;
    this.lineChartData.datasets[2].label = tmp;

    this.chart?.update();
  }

}
