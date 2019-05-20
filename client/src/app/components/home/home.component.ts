import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit{

    public title:string;

    constructor(){
        this.title = 'Bienvenido a NG-SOCIAL';
    }

    ngOnInit(){
        console.log('HomeComponent se ha cargado');
    }
}