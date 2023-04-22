import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GamesContentComponent } from './content/content.component';



@NgModule({
  declarations: [
    GamesContentComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GamesContentComponent
  ]
})
export class GamesModule { }
