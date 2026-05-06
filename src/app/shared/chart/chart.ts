import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  template: `<canvas #canvas></canvas>`,
  styles: [`canvas { width: 100% !important; }`],
})
export class AppChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type: 'line' | 'bar' = 'line';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label = '';
  @Input() color = '#9b7fd4';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  ngAfterViewInit(): void {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.label,
            data: this.data,
            backgroundColor: this.color + '33',
            borderColor: this.color,
            borderWidth: 2,
            fill: this.type === 'line',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: this.color,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11 } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });
  }

  ngOnChanges(): void {
    if (!this.chart) return;
    this.chart.data.labels = this.labels;
    this.chart.data.datasets[0].data = this.data;
    this.chart.update('none');
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
