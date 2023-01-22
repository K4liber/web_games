import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { default as Annotation } from 'chartjs-plugin-annotation';
import { Photon, PhotonsSinglet } from './quantum-oracle';
import { Title } from '@angular/platform-browser';

type ParticleMeasurement = {
  particle: Photon,
  canvasId: string,
  angle: number,
  measurementAngle: number | null
  measurementValue: boolean | null
}

@Component({
  selector: 'app-quantum',
  templateUrl: './quantum.component.html',
  styleUrls: ['./quantum.component.scss'],
})
export class QuantumComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title,
  ) {
    titleService.setTitle('Singlet')
    Chart.register(Annotation)
    this.photonsSingle = new PhotonsSinglet(
      this.aliceParticleMeasurement.particle, 
      this.bobParticleMeasurement.particle
    )
    this.photonsSingle.entangle()
  }

  @Input() size: number = 400;

  photonsSingle: PhotonsSinglet
  aliceParticleMeasurement: ParticleMeasurement = {
    particle: new Photon(),
    canvasId: 'alice',
    angle: 0,
    measurementAngle: null,
    measurementValue: null
  }
  bobParticleMeasurement: ParticleMeasurement = {
    particle: new Photon(),
    canvasId: 'bob',
    angle: 0,
    measurementAngle: null,
    measurementValue: null
  }
  particleNameToMeasurement: Record<string, ParticleMeasurement> = {
    'alice': this.aliceParticleMeasurement,
    'bob': this.bobParticleMeasurement
  }
  propabilityQuantumChartData = Array.from({length: 37}, (_, index: number) => {
      let xValue = index * 10
      let radians = xValue/180 * Math.PI
      return {
        x: xValue, y: Math.cos(radians/2)**2
      }
    }
  )
  propabilityLinearChartData = Array.from({length: 13}, (_, index: number) => {
      let xValue = index * 30
      return {
        x: xValue, y: Math.abs(1 - xValue/180)
      }
    }
  )

  ngOnInit(): void {
    window.onload = () => {
      this.reset()
      this.drawPropabilityGradient()
    }
  }

  drawPropabilityGradient(): void {
    let canvas = this.document.getElementById("propabilityGradient") as HTMLCanvasElement

    if ( canvas !== null ) {
      let ctx = canvas.getContext("2d");

      if (ctx != null ) {
        // Create gradient
        var grd = ctx.createLinearGradient(0, 20, 80, 410);
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "blue");
        // Fill with gradient
        ctx.fillStyle = grd;
        ctx.fillRect(10, 80, 50, 350);
        ctx.font = "24px Arial";
        ctx.fillStyle = "rgb(255, 255, 255)"
        // Measurement propability
        ctx.fillText("100%", 8, 35);
        ctx.fillText("red", 20, 60);
        ctx.fillText("0%", 20, 460);
        ctx.fillText("red", 20, 485);
      }
    }
  }

  angleChanged(particleMeasurement: ParticleMeasurement) {
    this.drawCanvas(particleMeasurement)
  }

  reset() {
    this.aliceParticleMeasurement.angle = 0
    this.aliceParticleMeasurement.measurementAngle = null
    this.aliceParticleMeasurement.measurementValue = null
    this.aliceParticleMeasurement.particle = new Photon()
    this.bobParticleMeasurement.angle = 0
    this.bobParticleMeasurement.measurementAngle = null
    this.bobParticleMeasurement.measurementValue = null
    this.bobParticleMeasurement.particle = new Photon()
    this.photonsSingle = new PhotonsSinglet(
      this.aliceParticleMeasurement.particle, 
      this.bobParticleMeasurement.particle
    )
    this.photonsSingle.entangle()
    this.drawCanvas(this.aliceParticleMeasurement)
    this.drawCanvas(this.bobParticleMeasurement)
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

  quantumPropabilities(
    linear: boolean = true,
    resolution: number = 4 * 1440,
    alreadyExecutedMeasurement: ParticleMeasurement
  ) {
    return Array.from({length: resolution}, (_, index) => {
      let degreeDifference = 0

      if (alreadyExecutedMeasurement.measurementAngle !== null) {
        degreeDifference = alreadyExecutedMeasurement.measurementAngle/360 * resolution
      }

      if (linear) {
        var prop = this.linearRelation(index - degreeDifference, resolution)
      } else {
        var prop = this.quantumRelation(index - degreeDifference, resolution)
      }
      
      let r = prop * 255
      let b = (1 - prop) * 255
      return {
          total: 360/resolution,
          shade: alreadyExecutedMeasurement.measurementValue ? this.rgb(r, 0, b) : this.rgb(b, 0, r)
      }
    });
  }

  measure (
      particleMeasurement: ParticleMeasurement
  ) {
    particleMeasurement.measurementAngle = particleMeasurement.angle
    particleMeasurement.measurementValue = particleMeasurement.particle.measureSpin(particleMeasurement.measurementAngle)
    this.drawCanvas(this.aliceParticleMeasurement)
    this.drawCanvas(this.bobParticleMeasurement)
  }

  drawCanvas(
    particleMeasurement: ParticleMeasurement
  ) {
    let canvas = this.document.getElementById(particleMeasurement.canvasId) as HTMLCanvasElement

    if ( canvas !== null ) {
      let ctx = canvas.getContext("2d");

      if (ctx != null ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alreadyExecutedMeasurements = this.alredyExecutedMeasurements
        console.log(particleMeasurement)

        if (particleMeasurement.measurementValue !== null) {
          var color = particleMeasurement.measurementValue === true ? this.rgb(0, 0, 255) : this.rgb(255, 0, 0)
          var results = [
            {
              total: 360,
              shade: color
            }
          ]
        } else if (alreadyExecutedMeasurements.length === 1) {
          let oppositeMeasurement = particleMeasurement.canvasId === 'bob' ? 
            this.aliceParticleMeasurement : this.bobParticleMeasurement
          var results = this.quantumPropabilities(
            false, 4 * 1440, oppositeMeasurement
          )
        } else {
          var results = [
            {
              total: 360,
              shade: this.rgb(255, 0, 255)
            }
          ]
        }
        
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
        ctx.beginPath();
        ctx.moveTo(middle + radius + out, middle);
        ctx.lineTo(middle - radius - out, middle);
        ctx.stroke();

        if (particleMeasurement.measurementAngle === null) {
          let propability = 50

          if (alreadyExecutedMeasurements.length > 0) {
            let alreadyExecutedMeasurement = alreadyExecutedMeasurements[0]
            let degreeDiff = alreadyExecutedMeasurement.measurementAngle != null ?
              particleMeasurement.angle - alreadyExecutedMeasurement.measurementAngle : particleMeasurement.angle
            propability = Math.round(100*this.quantumRelation(degreeDiff, 360))
          }

          ctx.font = "24px Arial";
          ctx.fillStyle = "rgb(255, 255, 255)"
          // Measurement propability
          let measurementSize = radius + 10
          let degreeSize = 2;
          let startAngle = 0/180 * Math.PI;
          let x = Math.sin(startAngle + particleMeasurement.angle/180 * Math.PI) * measurementSize
          let y = Math.cos(startAngle + particleMeasurement.angle/180 * Math.PI) * measurementSize
          let gap = particleMeasurement.angle < 181 ? 15 : - 70
          ctx.fillText(propability + "%",
          middle + x + gap, middle - y + 4);
          // Measurement needle
          ctx.lineWidth = 3;
          ctx.strokeStyle = "white";
          ctx.beginPath();
          startAngle = -90/180 * Math.PI;
          ctx.arc(middle, middle, measurementSize, 
            startAngle + (particleMeasurement.angle - degreeSize) 
            / 180 * Math.PI, startAngle + (particleMeasurement.angle + degreeSize) / 180 * Math.PI);
          ctx.lineTo(middle, middle);
          ctx.fill();
        }
      }
    }
  }
  

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        type: 'line',
        data: this.propabilityQuantumChartData,
        label: 'Quantum',
        backgroundColor: 'rgba(255,0,0,0.2)',
        borderColor: 'rgba(255,0,0,1)'
      },
      {
        type: 'line',
        data: this.propabilityLinearChartData,
        label: 'Linear',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,1)',
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    layout: {
      padding: 20
    },
    elements: {
      line: {
        tension: 0.1
      },
      point:{
        radius: 0
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
        max: 360,
        
        grid: {
          color: 'rgba(255,255,255,0.3)',
        },
        ticks: {
          color: 'white',
          sampleSize: 0.2,
          stepSize: 30
        }
      },
      y: {
        position: 'left',
        grid: {
          color: 'rgba(255,255,255,0.3)',
        },
        ticks: {
          color: 'white',
        }
      }
    }
  }

  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  get alredyExecutedMeasurements(): ParticleMeasurement[] {
    let alreadyMeasured = []

    if (this.aliceParticleMeasurement.measurementValue !== null) {
      alreadyMeasured.push(this.aliceParticleMeasurement)
    }
    
    if (this.bobParticleMeasurement.measurementValue !== null) {
      alreadyMeasured.push(this.bobParticleMeasurement)
    }

    return alreadyMeasured
  }
}
