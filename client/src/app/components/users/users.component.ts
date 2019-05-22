import { Component, OnInit } from "@angular/core";
import { Router,ActivatedRoute,Params} from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { GLOBAL } from "../../services/global";

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [UserService]
})

export class UsersComponent implements OnInit{

    public title:string;
    public url:string;
    public identity;
    public token:string; 
    public page;
    public prev_page;
    public next_page;
    public total;
    public pages;
    public users:User[];
    public status:string;
    public follows;

    constructor(
        private _route:ActivatedRoute,
        private _router:Router,
        private _userService:UserService
    ){
        this.title = 'Gente',
        this.url = GLOBAL.url,
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
    }
    ngOnInit(){
        console.log('UsersComponent cargado.');
        this.actualPage();
    }

    actualPage(){
        let page = 1;
        this._route.params.subscribe(params=>{
        
            if(!params['page']){
                page = 1;
                this.page = page;
                this.next_page = page + 1;
                this.prev_page = page - 1;
                
                if(this.prev_page <= 0){
                    this.prev_page = 1;
                }
            }else{
                page = Number(params['page']);
                this.page = page;
                this.next_page = page + 1;
                this.prev_page = page - 1;
                
                if(this.prev_page <= 0){
                    this.prev_page = 1;
                }
            }

            //Devolver listado de usuarios
            this.getUsers(page);
        });
    }

    getUsers(page){

        this._userService.getUsers(page).subscribe(
            response=>{
                if(!response.users){
                    this.status = 'error';
                }else{
                    console.log(response);
                    this.total = response.total;
                    this.pages = response.pages;
                    this.users = response.users;
                    this.follows = response.users_i_follow;
                    console.log("Usuarios que sigo");
                    console.log(this.follows);
                    if(page > this.pages){
                        this._router.navigate(['/gente',1]);
                    }
                }
            },
            err=>{
                let errorMsg = <any>err;
                console.log(errorMsg);
                if(errorMsg!=null){
                    this.status = 'error';
                }
            }
        )
    }

    public followUserOver;
    mouseEnter(user_id){
        this.followUserOver = user_id;
    }

    mouseLeave(user_id){
        this.followUserOver = 0;
    }
}