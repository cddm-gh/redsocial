import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Observable } from 'rxjs/Observable';
import { HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    providers: [UserService]
})

export class LoginComponent implements OnInit{

    public title:string;
    public user: User;
    public status: string;
    public identity;
    public token;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ){
        this.title = 'Identificate';
        this.user = new User("","","","","","","USER","");
    }
    ngOnInit(){
        console.log('LoginComponent cargado.');
    }

    onSubmit(){
        this._userService.signin(this.user).subscribe(
            response => {
                this.identity = response.user;
                //console.log(this.identity);
                if(!this.identity || !this.identity._id){
                    this.status = 'error';
                }else{
                    //Persistir datos del usuario en el local storage
                    localStorage.setItem('identity', JSON.stringify(this.identity));
                    //Conseguir el token
                    this.getToken()
                }
            },
            err => {
                let errorMsg = <any>err;
                console.log(errorMsg);
                if(errorMsg != null){
                    this.status = 'error';
                }
            }
        );
    }

    getToken(){
        this._userService.signin(this.user, 'true').subscribe(
            response => {
                this.token = response.token;
                //console.log(this.token);
                if(this.token.length <= 0)
                    this.status = 'error';
                else{
                    //Persistir token del usuario
                    localStorage.setItem('token', this.token);
                    //Conseguir los contadores del usuario
                    this.getCounters();
                }
            },
            err => {
                let errorMsg = <any>err;
                console.log(errorMsg);
                if(errorMsg != null){
                    this.status = 'error';
                }
            }
        );
    }

    getCounters(){
        this._userService.getCounters().subscribe(
            response=>{
                console.log(response);
                localStorage.setItem('stats', JSON.stringify(response));
                this.status = 'success';
                this._router.navigate(['/']);
            },
            err=>{
                let errorMsg = <any>err;
                console.log(errorMsg);
                if(errorMsg != null){
                    this.status = 'error';
                }
            }
        );
    }

}