import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import {UploadService} from "../../services/upload.service";
import { GLOBAL } from "../../services/global";

@Component({
    selector: 'user-edit',
    templateUrl: './user-edit.component.html',
    providers: [UserService, UploadService]
})

export class UserEditComponent implements OnInit{
    public title:string;
    public user: User;
    public identity;
    public token;
    public status:string;
    public error_msg:string;
    public url:string;

    constructor(
        private _route:ActivatedRoute,
        private _router:Router,
        private _userService:UserService,
        private _uploadService:UploadService
    ){
        this.title = 'Actualizar Datos';
        this.user = this._userService.getIdentity();
        this.identity = this.user;
        this.token = this._userService.getToken();
        this.error_msg = '';
        this.url = GLOBAL.url;
    }
    ngOnInit(){
        console.log(this.user);
    }

    onSubmit(){
        
        this._userService.updateUser(this.user).subscribe(
            response =>{
                if(!response.user){
                    this.status = 'error';
                }else{
                    this.status = 'success';
                    localStorage.setItem('identity', JSON.stringify(this.user));
                    this.identity = this.user;
                    //Subida de imágen de usuario
                    this._uploadService.makeFileRequest(this.url + 'user-img/' + this.user._id, [], this.filesToUpload, this.token, 'archivo')//archivo es el nombre del input en el html y del campo en el backend
                                        .then((result:any)=>{
                                            this.user.image = result.user.image;
                                            localStorage.setItem('identity', JSON.stringify(this.user));
                                        });
                }
            },
            err=>{
                let errorMsg = <any>err;
                if(errorMsg.error.ok == false){
                    this.error_msg = 'Ya existe un usuario que utiliza ese nick o e-mail';
                }
                this.status = 'error';
            }
        );
    }

    public filesToUpload:Array<File>; 
    fileChangeEvent(fileInput:any){
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }
}