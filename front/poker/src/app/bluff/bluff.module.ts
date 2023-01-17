import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from './content/content.component';
import { FormsModule } from '@angular/forms';
import { LastSettlementComponent } from './last-settlement/last-settlement.component';



@NgModule({
  declarations: [
    ContentComponent,
    LastSettlementComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ContentComponent,
    LastSettlementComponent
  ]
})
export class BluffModule { }
