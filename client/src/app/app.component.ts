import { Component, OnInit, DoCheck } from '@angular/core';
import { UserService } from "../app/services/user.service";
import { Router, ActivatedRoute, Params} from "@angular/router";
import { GLOBAL } from "../app/services/global";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent implements OnInit, DoCheck{
  title:string;
  public identity;
  public url;

  constructor(
    private _userService: UserService,
    private _route:ActivatedRoute,
    private _router:Router

  ){
    this.title = 'NG-SOCIAL';
    this.url = GLOBAL.url;
  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
    console.log(this.identity);
  }

  ngDoCheck(){
    this.identity = this._userService.getIdentity();
  }

  logout(){
    localStorage.clear();
    this.identity = null;
    this._router.navigate(['/']);
  }
}
