import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentComponent } from './content/content.component';



@NgModule({
  declarations: [
    ContentComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ContentComponent
  ]
})
export class ChatModule { }
