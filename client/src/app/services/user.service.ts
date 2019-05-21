import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { GLOBAL} from "./global";
import { User } from "../models/user";

@Injectable()
export class UserService{
    public url: string; //url para la petición en el backend
    public identity;
    public token;
    public stats:string;

    constructor(public _http: HttpClient){
        this.url = GLOBAL.url;
    }

    //Método de registro nuevo usuario
    register(user_to_register: User): Observable<any>{
        let params = JSON.stringify(user_to_register);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');

        return this._http.post(this.url + 'registro', params, {headers:headers});
    }

    //Método de login de un usuario
    signin(user: User, gettoken = null):Observable<any>{
        // if(gettoken != null){
        //     user.gettoken = gettoken;
        // }
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');

        return this._http.post(this.url + 'login', params, {headers:headers});
    }

    //Devolver el usuario logeado
    getIdentity(){
        let ident = JSON.parse(localStorage.getItem('identity'));

        if(ident != 'undefined'){
            this.identity = ident;
        }else{
            this.identity = null;
        }

        return this.identity;
    }

    //Devolver el usuario logeado
    getToken(){
        //let token = JSON.stringify(localStorage.getItem('token'));
        let token = localStorage.getItem('token');
        if(token != 'undefined'){
            this.token = token;
        }else{
            this.token = null;
        }
        return this.token;
    }

    getStats(){
        let stats = JSON.parse(localStorage.getItem('stats'));
        if(stats != 'undefined'){
            this.stats = stats;
        }else{
            this.stats = null;
        }
        
        return this.stats;
    }

    getCounters(user_id = null):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json').set('token',this.getToken());

        if(user_id != null){
            return this._http.get(this.url+'stats/'+ user_id, {headers:headers});
        }else{
            return this._http.get(this.url+'stats', {headers:headers});
        }
    }

    updateUser(user:User):Observable<any>{
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                        .set('token',this.getToken());

        return this._http.put(this.url + 'actualizar/' + user._id, params, {headers:headers});
    }

    //Obtener usuarios paginados
    getUsers(page = null):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json')
                                        .set('token', this.getToken());
        return this._http.get(this.url + 'listar/'+page, {headers:headers});
    }

    //Obtener usuario especifico
    getOneUser(user_id):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json')
                                        .set('token', this.getToken());
        return this._http.get(this.url + 'listar/' + user_id, {headers:headers});
    }
}