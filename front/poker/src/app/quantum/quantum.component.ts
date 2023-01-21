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

  @Input() size: number = 400;

  propabilityQuantumChartData = Array.from({length: 13}, (_, index: number) => {
      let xValue = index * 30
      let radians = xValue/180 * Math.PI
      return {
        x: xValue, y: Math.cos(radians/2)**2
      }
    }
  )

  propabilityLinearChartData = Array.from({length: 13}, (_, index: number) => {
      let xValue = index * 30
      return {
        x: xValue, y: 1 - xValue/180
      }
    }
  )

  ngOnInit(): void {
    window.onload = () => {
      this.drawCanvas(120, false, "myCanvas")
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
        let out = middle/24
        ctx.setLineDash([2, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(middle, middle + radius + out);
        ctx.lineTo(middle, middle - radius - out);
        ctx.stroke();

        ctx.font = "24px Arial";
        ctx.fillStyle = "rgb(255, 255, 255)"
        // ctx.fillText("0°", middle - 7, 105);
        // ctx.fillText("180°", middle - 20, middle*2 - 85);
        // Measurement degree
        let measurementSize = radius + 10
        let degreeSize = 2;
        let startAngle = 0/180 * Math.PI;
        let x = Math.sin(startAngle + measurementDegree/180 * Math.PI) * measurementSize
        let y = Math.cos(startAngle + measurementDegree/180 * Math.PI) * measurementSize
        ctx.fillText(measurementDegree + "°→" + Math.round(100*this.quantumRelation(measurementDegree, 360)) + "%",
         middle + x + 8, middle - y + 4);
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
        type: 'line',
        data: this.propabilityQuantumChartData,
        label: 'Quantum',
        backgroundColor: 'rgba(148,0,0,0.2)',
        borderColor: 'rgba(148,0,0,1)'
      },
      {
        type: 'line',
        data: this.propabilityLinearChartData,
        label: 'Linear',
        backgroundColor: 'rgba(0,148,0,0.2)',
        borderColor: 'rgba(0,148,0,1)',
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      'x': {
        type: 'linear',
        title: {
          color: 'white',
          display: true,
          text: 'Angle difference [°]'
        },
        min: 0,
        max: 180,
        grid: {
          color: 'rgba(255,255,255,0.3)',
        },
        ticks: {
          color: 'white',
          sampleSize: 0.2,
        }
      },
      y: {
        position: 'left',
        grid: {
          color: 'rgba(255,255,255,0.3)',
        },
      }
    }
  }
  
  private newLabel? = 'New label';
  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

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
      const num = 5
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
