import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'games-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  gameForm: FormGroup
  isPasswordNeeded: boolean = false

  constructor() { 
    this.gameForm = new FormGroup({
      name: new FormControl(''),
      isPublic: new FormControl(!this.isPasswordNeeded),
      password: new FormControl(''),
      maxNumberOfPlayers: new FormControl(6),
    });
    let isPublicControl = this.gameForm.get('isPublic');

    if (isPublicControl === null) {
      return;
    }

    isPublicControl.valueChanges.subscribe(value => {
      this.isPasswordNeeded = value;

      let passwordControl = this.gameForm.get('password');

      if (passwordControl !== null) {


        if (this.isPasswordNeeded) {
          passwordControl.disable();
        } else {
          passwordControl.enable();
        }
      }
      
    })
  }

  ngOnInit(): void {}

  onSubmit() {
    console.log(this.gameForm.value);
  }
  
}
